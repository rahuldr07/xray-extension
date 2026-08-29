import type { XrayEntry } from '../types';

export interface DecodedJwt {
  source: string;
  raw: string;
  header: unknown;
  payload: unknown;
  expiresAt: string | null;
  expired: boolean | null;
  issuedAt: string | null;
}

const JWT_PATTERN = /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*/g;

function base64UrlDecode(segment: string): string {
  const padded = segment.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(segment.length / 4) * 4, '=');
  try {
    const binary = atob(padded);
    // Decode UTF-8 bytes so multibyte payloads render correctly.
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return '';
  }
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function toIso(value: unknown): string | null {
  const seconds = Number(value);
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  // A JWT `exp`/`iat` is page-controlled. A microsecond timestamp or a "never expires"
  // sentinel like 9999999999999 lands outside the ECMAScript time range, where
  // toISOString() throws RangeError -- and extractJwts runs inside a useMemo DURING
  // render, with no error boundary in the panel, so React 19 unmounted the whole tree
  // and selecting that one request blanked the panel.
  const ms = seconds * 1000;
  if (Math.abs(ms) > 8.64e15) return null;
  return new Date(ms).toISOString();
}

export function decodeJwt(token: string, source: string): DecodedJwt | null {
  const parts = token.split('.');
  if (parts.length < 2) return null;
  const header = parseJson(base64UrlDecode(parts[0]));
  const payload = parseJson(base64UrlDecode(parts[1]));
  if (header == null && payload == null) return null;
  const payloadRecord = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {};
  const expiresAt = toIso(payloadRecord.exp);
  return {
    source,
    raw: token,
    header,
    payload,
    expiresAt,
    issuedAt: toIso(payloadRecord.iat),
    expired: expiresAt ? Number(payloadRecord.exp) * 1000 < Date.now() : null,
  };
}

function collectStrings(value: unknown, out: Array<{ text: string; source: string }>, source: string, depth = 0): void {
  if (depth > 4 || out.length > 200) return;
  if (typeof value === 'string') {
    out.push({ text: value, source });
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectStrings(item, out, `${source}[${index}]`, depth + 1));
    return;
  }
  if (value && typeof value === 'object') {
    Object.entries(value as Record<string, unknown>).forEach(([key, child]) => collectStrings(child, out, source ? `${source}.${key}` : key, depth + 1));
  }
}

// Scan headers and request/response bodies for JWT-shaped tokens and decode them.
export function extractJwts(entry: XrayEntry): DecodedJwt[] {
  const found: DecodedJwt[] = [];
  const seen = new Set<string>();
  const candidates: Array<{ text: string; source: string }> = [];

  // Tokens in sensitive headers (Authorization etc.) are decoded by the
  // MAIN-world interceptor BEFORE redaction and shipped as claims only — the
  // header value reaches this world as '[redacted]', so scanning it below can
  // never find them.
  const captured = Array.isArray(entry.jwtLenses) ? entry.jwtLenses : [];
  for (const lens of captured) {
    if (!lens || typeof lens !== 'object') continue;
    const payloadRecord = lens.payload && typeof lens.payload === 'object' ? lens.payload as Record<string, unknown> : {};
    const expiresAt = toIso(payloadRecord.exp);
    found.push({
      // Prefixed so the Tokens UI labels it "Request header" — the captured
      // source is the bare header name (authorization, x-api-key, ...).
      source: `requestHeaders.${String(lens.source || 'authorization')}`,
      raw: '[redacted]',
      header: lens.header ?? null,
      payload: lens.payload ?? null,
      expiresAt,
      issuedAt: toIso(payloadRecord.iat),
      expired: expiresAt ? Number(payloadRecord.exp) * 1000 < Date.now() : null,
    });
    if (found.length >= 20) return found;
  }

  collectStrings(entry.requestHeaders, candidates, 'requestHeaders');
  collectStrings(entry.responseHeaders, candidates, 'responseHeaders');
  collectStrings(entry.requestBody, candidates, 'requestBody');
  const response = entry.responseDecrypted ?? entry.responseRaw;
  collectStrings(response, candidates, 'response');

  for (const candidate of candidates) {
    const matches = candidate.text.match(JWT_PATTERN);
    if (!matches) continue;
    for (const match of matches) {
      if (seen.has(match)) continue;
      seen.add(match);
      const decoded = decodeJwt(match, candidate.source);
      if (decoded) found.push(decoded);
      if (found.length >= 20) return found;
    }
  }
  return found;
}
