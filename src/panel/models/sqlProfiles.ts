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

function tlsFromSslMode(mode: string | null, host: string): TlsMode {
  switch (mode?.toLowerCase().replace(/_/g, '-')) {
    case 'disable':
      return 'disable';
    case 'verify-ca':
    case 'verify-full':
      return 'verify-full';
    case 'require':
    case 'prefer':
    case 'allow':
      return 'require';
    default:
      return isLoopbackHost(host) ? 'disable' : 'require';
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
    return { error: NO_HOST };
  }
  const host = decode(url.hostname).replace(/^\[/, '').replace(/\]$/, '');
  if (host === '') return { error: NO_HOST };
  const database = decode(url.pathname.replace(/^\//, ''));
  const sslmode = url.searchParams.get('sslmode') ?? url.searchParams.get('ssl-mode');
  return {
    profile: {
      name: defaultProfileName(database, host),
      engine,
      host,
      port: url.port === '' ? DEFAULT_PORTS[engine] : Number(url.port),
      database,
      user: decode(url.username),
      tls: tlsFromSslMode(sslmode, host),
      caFile: '',
      statementTimeoutMs: null,
      readOnly: true,
    },
    password: decode(url.password),
  };
}

const INSTALL_BASE = 'https://raw.githubusercontent.com/rahuldr07/xray-extension/main/helper/install';

export function helperInstallCommand(os: 'linux' | 'mac' | 'windows'): string {
  return os === 'windows' ? `irm ${INSTALL_BASE}/install.ps1 | iex` : `curl -fsSL ${INSTALL_BASE}/install.sh | sh`;
}
