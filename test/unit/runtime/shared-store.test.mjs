// shared/store.js — the chrome.storage.local wrapper behind every persisted
// preference (theme, panel layout, rules, the BYOK API key). 34 lines, four
// methods, no existing coverage.
//
// The whole module is four try/catch blocks with empty or default-returning
// handlers, so the interesting behaviour is entirely in the failure paths: what
// a caller observes when the storage call rejects. Those are exercised here with
// a rejecting stub rather than described in prose.

import assert from 'node:assert/strict';
import test from 'node:test';

import { hostify, loadIsolatedWorld } from './vm-load.mjs';

/**
 * A chrome.storage.local double.
 *
 * `backing` is the raw key space, so tests can assert on the ACTUAL stored key
 * names (which is the point of the prefix convention) and can plant unprefixed
 * keys belonging to other extensions' code paths.
 */
function makeChrome({ backing = {}, rejectOn = new Set() } = {}) {
  const calls = [];
  const guard = (name) => {
    calls.push(name);
    if (rejectOn.has(name)) return Promise.reject(new Error(`QUOTA_BYTES quota exceeded (${name})`));
    return null;
  };

  return {
    backing,
    calls,
    chrome: {
      storage: {
        local: {
          get(keys) {
            const rejected = guard('get');
            if (rejected) return rejected;
            if (keys === null || keys === undefined) return Promise.resolve({ ...backing });
            const wanted = Array.isArray(keys) ? keys : [keys];
            const out = {};
            for (const key of wanted) if (key in backing) out[key] = backing[key];
            return Promise.resolve(out);
          },
          set(items) {
            const rejected = guard('set');
            if (rejected) return rejected;
            Object.assign(backing, items);
            return Promise.resolve();
          },
          remove(keys) {
            const rejected = guard('remove');
            if (rejected) return rejected;
            for (const key of Array.isArray(keys) ? keys : [keys]) delete backing[key];
            return Promise.resolve();
          },
        },
      },
    },
  };
}

function loadStore(options) {
  const stub = makeChrome(options);
  const context = loadIsolatedWorld('shared/store.js', { chrome: stub.chrome });
  return { ...stub, store: context.window.XRAY_Store };
}

test('store: publishes exactly get/set/remove/clear', () => {
  const { store } = loadStore();
  assert.deepEqual(Object.keys(store).sort(), ['clear', 'get', 'remove', 'set']);
});

test('store.set: writes under the xray_ prefix and never under the bare key', async () => {
  const { store, backing } = loadStore();
  await store.set('theme', 'dark');
  await store.set('panel.width', 420);
  assert.deepEqual(hostify(backing), { xray_theme: 'dark', 'xray_panel.width': 420 });
  assert.equal('theme' in backing, false);
});

test('store.get: reads through the prefix and round-trips every JSON value shape', async () => {
  const { store } = loadStore();
  for (const value of [0, false, '', null, [], { nested: { a: 1 } }]) {
    await store.set('k', value);
    assert.deepEqual(hostify(await store.get('k')), value, `round-trip of ${JSON.stringify(value)}`);
  }
});

test('store.get: an unset key returns the caller default, which itself defaults to null', async () => {
  const { store, backing } = loadStore();
  assert.equal(await store.get('missing'), null);
  assert.equal(await store.get('missing', 'fallback'), 'fallback');
  assert.deepEqual(hostify(await store.get('missing', { a: 1 })), { a: 1 });

  // Presence is tested with `in`, not truthiness, so a stored falsy value is
  // returned rather than being mistaken for "unset".
  backing.xray_flag = false;
  assert.equal(await store.get('flag', true), false, 'a stored false must not fall back to the default');
  backing.xray_zero = 0;
  assert.equal(await store.get('zero', 99), 0);
  backing.xray_null = null;
  assert.equal(await store.get('null', 'default'), null, 'an explicitly stored null beats the default');
});

test('store.get: an unprefixed key of the same name is invisible', async () => {
  const { store, backing } = loadStore();
  backing.theme = 'someone-elses-value';
  assert.equal(await store.get('theme', 'mine'), 'mine');
});

test('store.remove: deletes the prefixed key only', async () => {
  const { store, backing } = loadStore();
  await store.set('a', 1);
  backing.unprefixed = 'keep';
  await store.remove('a');
  assert.deepEqual(hostify(backing), { unprefixed: 'keep' });

  await store.remove('never-existed');
  assert.deepEqual(hostify(backing), { unprefixed: 'keep' }, 'removing an absent key is a no-op');
});

test('store.clear: removes every xray_ key in one batched call and nothing else', async () => {
  const { store, backing, calls } = loadStore();
  Object.assign(backing, {
    xray_theme: 'dark',
    xray_rules: [1],
    'xray_': 'the bare prefix also matches',
    theme: 'host page value',
    other_extension_key: 1,
    XRAY_UPPER: 'case-sensitive, so this survives',
  });

  await store.clear();

  assert.deepEqual(hostify(backing), {
    theme: 'host page value',
    other_extension_key: 1,
    XRAY_UPPER: 'case-sensitive, so this survives',
  });
  assert.deepEqual(calls, ['get', 'remove'], 'one enumeration and one batched removal');
});

test('store.clear: an already-empty key space skips the remove call entirely', async () => {
  const { store, calls } = loadStore({ backing: { unrelated: 1 } });
  await store.clear();
  assert.deepEqual(calls, ['get'], 'the `if (keys.length)` guard avoids a pointless round trip');
});

// ─────────────────────────────────────────────── failure paths (the whole point)

test('store.set: a rejected write is swallowed — the caller cannot tell it failed', async () => {
  // shared/store.js:18. This is the quota path: chrome.storage.local has a
  // 10 MB (unlimitedStorage off: 5 MB) cap and rejects with QUOTA_BYTES once it
  // is hit. set() returns undefined either way, so a preference that silently
  // failed to persist is indistinguishable from one that saved.
  const { store, backing } = loadStore({ rejectOn: new Set(['set']) });

  const result = await store.set('theme', 'dark');
  assert.equal(result, undefined, 'resolves normally despite the rejection');
  assert.deepEqual(hostify(backing), {}, 'nothing was written');

  // And the very next read returns the default, so the UI silently reverts.
  assert.equal(await store.get('theme', 'light'), 'light');
});

test('store.get: a rejected read is swallowed and reported as "not set"', async () => {
  // shared/store.js:12. A read failure (extension context invalidated after a
  // reload, or a corrupt store) is indistinguishable from an absent key, so
  // callers overwrite real data with their defaults rather than backing off.
  const { store } = loadStore({ rejectOn: new Set(['get']) });
  assert.equal(await store.get('theme'), null);
  assert.equal(await store.get('theme', 'light'), 'light');
});

test('store.remove and store.clear: rejections are swallowed with no signal at all', async () => {
  // shared/store.js:22 and :30 are bare `catch {}` blocks — not even a log. A
  // failed clear() is the one that matters: "Clear all data" appearing to succeed
  // while the stored BYOK API key is still on disk is a privacy-relevant lie.
  const failRemove = loadStore({ rejectOn: new Set(['remove']) });
  failRemove.backing.xray_apiKey = 'sk-secret';
  assert.equal(await failRemove.store.remove('apiKey'), undefined);
  assert.equal(failRemove.backing.xray_apiKey, 'sk-secret', 'the value is still there');

  assert.equal(await failRemove.store.clear(), undefined);
  assert.equal(failRemove.backing.xray_apiKey, 'sk-secret', 'clear() reported success and deleted nothing');

  const failEnumerate = loadStore({ rejectOn: new Set(['get']) });
  failEnumerate.backing.xray_apiKey = 'sk-secret';
  assert.equal(await failEnumerate.store.clear(), undefined);
  assert.deepEqual(failEnumerate.calls, ['get'], 'the failed enumeration aborts before any removal');
  assert.equal(failEnumerate.backing.xray_apiKey, 'sk-secret');
});

test('store: a missing chrome API is absorbed by the same catch blocks', async () => {
  // ISOLATED-world content scripts lose their `chrome` bindings when the
  // extension is reloaded or updated underneath a live tab. Every method must
  // degrade rather than throw, because nothing in the panel awaits these in a
  // try/catch of its own.
  const context = loadIsolatedWorld('shared/store.js', { chrome: undefined });
  const store = context.window.XRAY_Store;
  assert.equal(await store.get('theme', 'light'), 'light');
  assert.equal(await store.set('theme', 'dark'), undefined);
  assert.equal(await store.remove('theme'), undefined);
  assert.equal(await store.clear(), undefined);
});
