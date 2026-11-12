// Normalizes whatever an engine throws into a SqlError. Pure logic.

import type { SqlError, SqlErrorCode } from './sqlTypes';

const CODES: ReadonlySet<string> = new Set<SqlErrorCode>([
  'helper-missing',
  'helper-outdated',
  'auth-failed',
  'tls-failed',
  'network',
  'timeout',
  'cancelled',
  'read-only',
  'syntax',
  'server',
  'connection-lost',
  'limit-reached',
  'not-a-database',
]);

function isSqlError(raw: unknown): raw is SqlError {
  if (typeof raw !== 'object' || raw === null) return false;
  const o = raw as { code?: unknown; message?: unknown };
  return typeof o.code === 'string' && CODES.has(o.code) && typeof o.message === 'string' && o.message !== '';
}

function messageOf(raw: unknown): string {
  let msg = '';
  if (typeof raw === 'string') msg = raw;
  else if (raw instanceof Error) msg = raw.message;
  else if (typeof raw === 'object' && raw !== null && typeof (raw as { message?: unknown }).message === 'string') {
    msg = (raw as { message: string }).message;
  }
  return msg.trim() === '' ? 'Unknown SQL error.' : msg;
}

export function normalizeSqlError(raw: unknown, sql?: string): SqlError {
  if (isSqlError(raw)) return raw;
  const name = typeof raw === 'object' && raw !== null ? (raw as { name?: unknown }).name : undefined;
  const message = messageOf(raw);
  if (name === 'AbortError') return { code: 'cancelled', message: message === 'Unknown SQL error.' ? 'Query cancelled.' : message };
  if (/readonly|read-only|query_only/i.test(message)) return { code: 'read-only', message };
  if (/not a database|file is not a database|database disk image is malformed/i.test(message)) return { code: 'not-a-database', message };
  if (/syntax error|near "/i.test(message)) {
    const err: SqlError = { code: 'syntax', message };
    const near = /near "([^"]*)"/i.exec(message);
    if (near && sql !== undefined && near[1] !== '') {
      const at = sql.indexOf(near[1]);
      if (at >= 0) err.position = at;
    }
    return err;
  }
  return { code: 'server', message };
}
