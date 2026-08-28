// Executes background.js's custom-AI-endpoint validation.
//
// background.js is a service worker script that registers chrome listeners at load, so
// it is loaded here into a vm context with a deep no-op `chrome` proxy. That is enough
// to reach the pure helpers, and it means the https rule below is verified by running
// it rather than by matching its source.

import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

// Any property access returns another callable proxy, so every chrome.* chain in
// background.js resolves to a harmless no-op regardless of depth.
function deepNoopProxy() {
  const target = function () {};
  return new Proxy(target, {
    get(_t, prop) {
      if (prop === Symbol.toPrimitive || prop === 'toString') return () => '';
      if (prop === 'then') return undefined; // never look thenable to await
      return deepNoopProxy();
    },
    apply() {
      return deepNoopProxy();
    },
  });
}

function loadBackground() {
  const context = {
    chrome: deepNoopProxy(),
    fetch: () => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
    console,
    setTimeout,
    clearTimeout,
    URL,
    TextEncoder,
    JSON,
    Promise,
    Error,
    Date,
    Math,
    String,
    Number,
    Array,
    Object,
    Set,
    Map,
  };
  context.self = context;
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(root, 'background.js'), 'utf8'), context, {
    filename: 'background.js',
  });
  return context;
}

const bg = loadBackground();

test('background.js loads and exposes the custom-endpoint helpers', () => {
  assert.equal(typeof bg._resolveCustomEndpoint, 'function');
  assert.equal(typeof bg._extractCompletionText, 'function');
});

test('a base URL is completed to a chat-completions endpoint', () => {
  assert.equal(
    bg._resolveCustomEndpoint('https://openrouter.ai/api/v1'),
    'https://openrouter.ai/api/v1/chat/completions',
  );
  // A trailing slash must not produce a double slash.
  assert.equal(
    bg._resolveCustomEndpoint('https://openrouter.ai/api/v1/'),
    'https://openrouter.ai/api/v1/chat/completions',
  );
});

test('a complete endpoint URL is left alone', () => {
  for (const url of [
    'https://api.groq.com/openai/v1/chat/completions',
    'https://api.anthropic.com/v1/messages',
    'https://example.test/v1/completions',
    'https://example.test/v1/responses',
  ]) {
    assert.equal(bg._resolveCustomEndpoint(url), url, `${url} should pass through unchanged`);
  }
});

test('SECURITY: a non-https endpoint is rejected', () => {
  // Captured request and response bodies are sent to this endpoint. A typo'd or
  // downgraded public URL must not ship them in the clear.
  for (const url of ['http://evil.test/v1', 'http://api.openai.com/v1']) {
    assert.throws(() => bg._resolveCustomEndpoint(url), /must use https/, `${url} should be rejected`);
  }
});

test('SECURITY: http is allowed only for loopback, so local model servers still work', () => {
  assert.equal(
    bg._resolveCustomEndpoint('http://localhost:11434/v1'),
    'http://localhost:11434/v1/chat/completions',
  );
  assert.equal(
    bg._resolveCustomEndpoint('http://127.0.0.1:1234/v1'),
    'http://127.0.0.1:1234/v1/chat/completions',
  );
  // A hostname that merely contains "localhost" is not loopback.
  assert.throws(() => bg._resolveCustomEndpoint('http://localhost.evil.test/v1'), /must use https/);
});

test('a malformed URL is reported as such, not thrown raw', () => {
  for (const bad of ['', '   ', 'not a url', '/v1/chat/completions']) {
    assert.throws(() => bg._resolveCustomEndpoint(bad), /not a valid URL/);
  }
});

test('both OpenAI-shaped and Anthropic-shaped responses are understood', () => {
  assert.equal(
    bg._extractCompletionText({ choices: [{ message: { content: '  openai style  ' } }] }),
    'openai style',
  );
  assert.equal(
    bg._extractCompletionText({ content: [{ text: 'anthropic ' }, { text: 'style' }] }),
    'anthropic style',
  );
  // Older completion shape, still served by some proxies.
  assert.equal(bg._extractCompletionText({ choices: [{ text: ' legacy ' }] }), 'legacy');
  // Nothing recognisable yields an empty string, which the caller turns into a message.
  assert.equal(bg._extractCompletionText({ unexpected: true }), '');
  assert.equal(bg._extractCompletionText(null), '');
});
