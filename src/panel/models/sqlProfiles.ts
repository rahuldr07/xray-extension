// Connection profiles for the remote SQL engines: the page-side shape, connection-string parsing,
// validation and the helper install command. Pure logic; the service worker owns the secrets.

/** Extension ID pinned by the manifest "key"; the helper's host manifest allows only this origin. */
export const HELPER_EXTENSION_ID = 'kjfoocnkoajdcjabnadfojdfaghpbeep';

export type SqlEngine = 'postgres' | 'mysql';
export type TlsMode = 'require' | 'verify-full' | 'disable';

/** A connection profile as the page sees it: never carries a password. */
export interface PageProfile {
  id: string;
  name: string;
  engine: SqlEngine;
  host: string;
  port: number;
  database: string;
  user: string;
  tls: TlsMode;
  caFile: string;
  statementTimeoutMs: number | null;
  readOnly: boolean;
  hasSavedPassword: boolean;
}

export const TLS_REQUIRED_MESSAGE = 'This server is not on this computer, so XRAY requires TLS. Choose Require or Verify full.';

const DEFAULT_PORTS: Record<SqlEngine, number> = { postgres: 5432, mysql: 3306 };

/** Same rule as the helper's session.IsLoopback: localhost, 127.0.0.0/8 and ::1. */
export function isLoopbackHost(host: string): boolean {
  const h = host.trim().replace(/^\[/, '').replace(/\]$/, '');
  if (h.toLowerCase() === 'localhost') return true;
  const v4 = /^127\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(h);
  if (v4) return [v4[1], v4[2], v4[3]].every((part) => Number(part) <= 255);
  return h === '::1' || h === '0:0:0:0:0:0:0:1';
}

export function defaultProfileName(database: string, host: string): string {
  return `${database || 'db'}@${host}`;
}

/** The first problem with a profile's connection fields, or null when it can be saved. */
export function validateProfile(p: { host: string; port: number; tls: TlsMode }): string | null {
  if (p.host.trim() === '') return 'Host is required.';
  if (!Number.isInteger(p.port) || p.port < 1 || p.port > 65535) return 'Port must be between 1 and 65535.';
  if (p.tls === 'disable' && !isLoopbackHost(p.host)) return TLS_REQUIRED_MESSAGE;
  return null;
}

export type ParsedConnection = Omit<PageProfile, 'id' | 'hasSavedPassword'>;

const BAD_SCHEME = 'Use a postgres:// or mysql:// connection string.';
const NO_HOST = 'The connection string has no host.';

function decode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

// null: a value we do not know. It is refused rather than guessed, so a requested level of
// verification is never silently weakened.
function tlsFromSslMode(mode: string | null, host: string): TlsMode | null {
  if (mode === null || mode === '') return isLoopbackHost(host) ? 'disable' : 'require';
  switch (mode.toLowerCase().replace(/_/g, '-')) {
    case 'disable':
    case 'disabled':
      return 'disable';
    case 'allow':
    case 'prefer':
    case 'preferred':
    case 'require':
    case 'required':
      return 'require';
    case 'verify-ca':
    case 'verify-full':
    case 'verify-identity':
      return 'verify-full';
    default:
      return null;
  }
}

export function parseConnectionString(s: string): { profile: ParsedConnection; password: string } | { error: string } {
  const text = s.trim();
  const scheme = /^([a-z][a-z0-9+.-]*):\/\//i.exec(text)?.[1].toLowerCase();
  const engine: SqlEngine | null = scheme === 'postgres' || scheme === 'postgresql' ? 'postgres' : scheme === 'mysql' ? 'mysql' : null;
  if (!engine) return { error: BAD_SCHEME };
  let url: URL;
  try {
    url = new URL(text);
  } catch {
    return { error: 'The connection string is not valid. Percent-encode special characters in the password.' };
  }
  const host = decode(url.hostname).replace(/^\[/, '').replace(/\]$/, '');
  if (host === '') return { error: NO_HOST };
  const database = decode(url.pathname.replace(/^\//, ''));
  const sslmode = url.searchParams.get('sslmode') ?? url.searchParams.get('ssl-mode');
  const tls = tlsFromSslMode(sslmode, host);
  if (tls === null) return { error: `Unsupported sslmode: ${sslmode}.` };
  return {
    profile: {
      name: defaultProfileName(database, host),
      engine,
      host,
      port: url.port === '' ? DEFAULT_PORTS[engine] : Number(url.port),
      database,
      user: decode(url.username),
      tls,
      caFile: '',
      statementTimeoutMs: null,
      readOnly: true,
    },
    password: decode(url.password),
  };
}

const INSTALL_BASE = 'https://raw.githubusercontent.com/rahuldr07/xray-extension/main/helper/install';

export function helperInstallCommand(os: 'linux' | 'mac' | 'windows'): string {
  return os === 'windows' ? `irm ${INSTALL_BASE}/install.ps1 | iex` : `curl -fsSL ${INSTALL_BASE}/install.sh | bash`;
}

export type HelperOs = 'linux' | 'mac' | 'windows';

/** The install command family for `navigator.userAgentData?.platform ?? navigator.platform`. */
export function helperOs(platform: string): HelperOs {
  const p = platform.toLowerCase();
  if (p.startsWith('mac')) return 'mac';
  if (p.startsWith('win')) return 'windows';
  return 'linux';
}

/**
 * The server's product and version for headers and Test results ("PostgreSQL 16.4"), from the
 * helper's raw serverVersion (Postgres `version()` text, "MySQL 8.0.36", or a MariaDB version).
 */
export function shortServerVersion(raw: string): string {
  const text = raw.trim();
  const named = /^(PostgreSQL|MySQL)\s+(\S+?),?(?:\s|$)/.exec(text);
  if (named) return `${named[1]} ${named[2]}`;
  const maria = /^(\d+(?:\.\d+)*)-MariaDB/i.exec(text);
  if (maria) return `MariaDB ${maria[1]}`;
  return text.split(/\s+/)[0] ?? '';
}

export type HelperPermissionOutcome = 'ready' | 'denied' | 'missing';

/**
 * Decides, inside a click handler, whether a Test or Connect may go ahead. `request` must be
 * `chrome.permissions.request({ permissions: ['nativeMessaging'] })` called without any await
 * before it, or Chrome refuses it for want of a user gesture. A missing or outdated helper is not a
 * permission question: the install card answers it. 'unknown' asks, which is harmless: a permission
 * already granted resolves true without a prompt.
 */
export async function ensureHelperPermission(
  status: 'ready' | 'missing' | 'no-permission' | 'outdated' | 'unknown',
  request: () => Promise<boolean>,
): Promise<HelperPermissionOutcome> {
  if (status === 'ready') return 'ready';
  if (status === 'missing' || status === 'outdated') return 'missing';
  try {
    return (await request()) ? 'ready' : 'denied';
  } catch {
    return 'denied';
  }
}
