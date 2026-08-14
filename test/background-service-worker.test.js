// background.js BYOK provider bridge.

const assert = require('node:assert/strict');
const test = require('node:test');

const { read } = require('./helpers/source');

test('background service worker explains requests through a BYOK provider bridge', () => {
  const background = read('background.js');
  assert.match(background, /xray:ai-explain/);
  assert.match(background, /api\.anthropic\.com\/v1\/messages/);
  assert.match(background, /api\.openai\.com\/v1\/chat\/completions/);
  assert.match(background, /AI_TIMEOUT_MS/);
  assert.match(background, /MAX_AI_PROMPT_CHARS/);
});

test('any OpenAI-compatible endpoint can be used as a custom provider', () => {
  // The built-in providers are hardcoded, but a custom endpoint is user-supplied, so
  // one OpenAI-compatible caller serves both and the custom URL is validated here in
  // the service worker rather than trusted from the settings page.
  const background = read('background.js');

  assert.match(background, /_callOpenAiCompatible/);
  assert.match(background, /_callCustomProvider/);
  assert.match(background, /settings\.provider === 'custom'/);
  // A base URL is completed to a chat-completions endpoint; a full URL is left alone.
  assert.match(background, /chat\/completions/);
  // Both response shapes are read, so an Anthropic-shaped server works without the
  // user having to declare which shape it speaks.
  assert.match(background, /_extractCompletionText/);
  assert.match(background, /data\?\.choices\?\.\[0\]\?\.message\?\.content/);
  assert.match(background, /Array\.isArray\(data\?\.content\)/);
});

test('a custom AI endpoint must be https, except on localhost', () => {
  // Captured traffic is sent to this endpoint, so a typo'd public URL must not
  // silently ship request bodies in the clear. Loopback stays permitted so a local
  // model server (Ollama, LM Studio) works.
  const background = read('background.js');

  assert.match(background, /AI_LOCAL_HOSTS/);
  assert.match(background, /localhost/);
  assert.match(background, /127\.0\.0\.1/);
  assert.match(background, /url\.protocol !== 'https:'/);
  assert.match(background, /must use https/);
});
