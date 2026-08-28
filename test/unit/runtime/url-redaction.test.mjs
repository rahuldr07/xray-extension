// C-4b: credentials that travel in a URL rather than a header.
//
// URLs used to be captured verbatim, so `?access_token=`, `?sig=` and presigned-S3
// credentials survived redaction entirely, were persisted, restored on other
// origins, and were eligible to be sent to a third-party LLM by AI Explain.
//
// _scrubUrl lives inside interceptor.js's IIFE, so it is extracted from the real
// source here rather than reimplemented: a copy of the logic would pass this suite
// while the shipped code regressed.

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const source = fs.readFileSync(path.join(repoRoot, 'content/interceptor.js'), 'utf8');

function loadScrubUrl() {
  const start = source.indexOf('const SENSITIVE_QUERY');
  const end = source.indexOf('// Sensitive header values are kept ONLY', start);
  assert.ok(start > -1 && end > start, 'the _scrubUrl block must be locatable in interceptor.js');
  const body = source
    .slice(start, end)
    .replace(/new _URL\(/g, 'new URL(')
    .replace(/_pageHref\(\)/g, "'https://app.test/'");
  return new Function(`${body}\nreturn _scrubUrl;`)();
}

const scrub = loadScrubUrl();

test('query-string credentials are redacted out of captured URLs', () => {
  assert.equal(scrub('https://a.test/x?access_token=SECRET&page=2'),
    'https://a.test/x?access_token=REDACTED&page=2');
  assert.equal(scrub('https://a.test/x?sig=abc'), 'https://a.test/x?sig=REDACTED');
  assert.equal(scrub('https://a.test/x?sessionId=abc'), 'https://a.test/x?sessionId=REDACTED');
  assert.equal(scrub('https://a.test/x?apiKey=k&api_key=k2'),
    'https://a.test/x?apiKey=REDACTED&api_key=REDACTED');
});

test('presigned-S3 credentials are redacted but the request stays readable', () => {
  assert.equal(
    scrub('https://b.s3.test/o?X-Amz-Signature=dead&X-Amz-Credential=AKIA&list-type=2'),
    'https://b.s3.test/o?X-Amz-Signature=REDACTED&X-Amz-Credential=REDACTED&list-type=2',
    'list-type is not a credential and survives',
  );
});

test('credentials in the userinfo component are stripped', () => {
  // This URL has no query string at all, so an early return on a missing '?' would
  // have skipped it entirely.
  assert.equal(scrub('https://user:pw@a.test/x'), 'https://a.test/x');
});

test('ordinary parameters are left alone, so URLs stay readable in the list', () => {
  const plain = 'https://a.test/x?page=2&limit=10&q=orders&sort=asc&format=json';
  assert.equal(scrub(plain), plain, 'no allow-listed parameter is touched');
  assert.equal(scrub('https://a.test/plain'), 'https://a.test/plain');
  assert.equal(scrub('/users'), '/users', 'a bare path is returned unchanged');
});

test('the redaction marker is URL-safe', () => {
  // '[redacted]' percent-encodes to %5Bredacted%5D through searchParams.set, which
  // is what the operator would then have to read in the request list.
  const out = scrub('https://a.test/x?token=abc');
  assert.ok(!out.includes('%5B'), 'no percent-encoded brackets');
  assert.match(out, /token=REDACTED/);
});

test('scrubbing is applied at the single emit boundary, not per call site', () => {
  // Every capture path (fetch, XHR, WebSocket, SSE, deferred timing) funnels through
  // _emit / _emitUpdate, so covering the boundary covers them all by construction.
  assert.match(source, /function _scrubEntry\(entry\)/);
  assert.match(source, /entry: _scrubEntry\(entry\)/);
  assert.match(source, /update: true, entry: _scrubEntry\(entry\)/);
});
