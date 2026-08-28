// Shared harness for the behavioural unit tests under test/unit/.
//
// WHY THIS FILE EXISTS
// --------------------
// The panel models live in src/panel/models/*.ts and import each other with
// extensionless specifiers ('../utils', './entries') because Vite resolves them.
// Node 22 strips TypeScript types natively, but its ESM resolver still demands a
// real file extension, so a plain `import '../../src/panel/models/entries.ts'`
// dies on the first internal `from '../utils'`.
//
// Rather than add a CLI flag (which would mean editing the `test` script and
// would silently skip these files for anyone running bare `node --test`), this
// module registers an in-process resolution hook via `module.register()` and
// then loads every model through it. Test files import the already-loaded
// namespaces from here, so plain `node --test` discovers and runs everything
// with zero flags.
//
// `node --test` also treats this file as a (test-free) test file and executes it
// once on its own; that run simply registers the hook and exits, which is
// harmless.
import { register } from 'node:module';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// The hook has to be a separate module graph loaded by the loader thread, so it
// is inlined as a data: URL instead of a second file (a second .mjs file in
// test/ would be picked up as another empty "test file" by the runner).
// Two jobs:
//  1. extensionless './foo' -> './foo.ts' (Vite-style specifiers).
//  2. force every .ts module to load as ESM. The repo's package.json declares
//     "type": "commonjs", which switches OFF Node's module-syntax detection, so
//     an ESM .ts file would otherwise be parsed as CJS and die on `export`.
const RESOLVE_HOOK = `
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
export async function resolve(specifier, context, next) {
  let request = specifier;
  if (specifier.startsWith('.') && !/\\.[mc]?[jt]sx?$/.test(specifier) && context.parentURL) {
    for (const candidate of [specifier + '.ts', specifier + '/index.ts']) {
      const url = new URL(candidate, context.parentURL);
      if (existsSync(fileURLToPath(url))) { request = candidate; break; }
    }
  }
  const resolved = await next(request, context);
  if (resolved.url.endsWith('.ts')) return { ...resolved, format: 'module-typescript' };
  return resolved;
}
`;

register('data:text/javascript,' + encodeURIComponent(RESOLVE_HOOK));

// ---------------------------------------------------------------------------
// Panel-parity guard.
//
// src/panel/utils.ts delegates schema()/buildCurl()/buildFetch()/buildMockPayload()
// to window.XRAY_ConsoleHelpers when the MAIN-world helper bundle is present, and
// falls back to a local implementation otherwise. Node has no `window` at all, so
// those functions would throw ReferenceError. We install a bare `window` with NO
// XRAY_ConsoleHelpers: that is exactly the fallback path, and every assertion in
// this suite is written against the fallback. If a future change ever installs a
// helper object here, assertSchemaFallback() below fails loudly rather than
// letting these tests silently describe behaviour the panel does not have.
// ---------------------------------------------------------------------------
if (!globalThis.window) globalThis.window = globalThis;

export function assertSchemaFallback(assert) {
  assert.equal(
    globalThis.window.XRAY_ConsoleHelpers,
    undefined,
    'window.XRAY_ConsoleHelpers must be absent so utils.schema/buildCurl/buildFetch use the local fallback',
  );
}

// ---------------------------------------------------------------------------
// Model namespaces. Loaded once, after the hook is registered.
// ---------------------------------------------------------------------------
const root = new URL('../../src/panel/', import.meta.url);
if (!existsSync(fileURLToPath(new URL('models/entries.ts', root)))) {
  throw new Error('src/panel/models not found relative to test/unit/harness.mjs');
}

const load = (name) => import(new URL(name, root).href);

export const utils = await load('utils.ts');
export const entries = await load('models/entries.ts');
export const customTheme = await load('models/customTheme.ts');
export const detail = await load('models/detail.ts');
export const drift = await load('models/drift.ts');
export const fuzzy = await load('models/fuzzy.ts');
export const rules = await load('models/rules.ts');
export const panelSettings = await load('models/panelSettings.ts');
export const exportModel = await load('models/export.ts');
export const importModel = await load('models/import.ts');
export const insights = await load('models/insights.ts');
export const viz = await load('models/viz.ts');
export const globalSearch = await load('models/globalSearch.ts');
export const panelPersistence = await load('models/panelPersistence.ts');
export const sessionStore = await load('models/sessionStore.ts');
export const sessionSummary = await load('models/sessionSummary.ts');
export const operations = await load('models/operations.ts');
export const lenses = await load('models/lenses.ts');

// ---------------------------------------------------------------------------
// Fixture builders.
//
// entries.ts memoizes on OBJECT identity (WeakMap) and drift.ts memoizes on the
// `id` STRING in a plain Map that never self-invalidates. Both make a reused
// fixture return a stale answer, so every call here mints a fresh object and, by
// default, a process-unique id.
// ---------------------------------------------------------------------------
let idCounter = 0;

export function uniqueId(prefix = 'e') {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

export function apiEntry(overrides = {}) {
  return {
    id: uniqueId('api'),
    type: 'api',
    timestamp: 1_700_000_000_000,
    method: 'GET',
    status: 200,
    url: 'https://api.example.com/v1/users',
    urlPath: '/v1/users',
    source: 'fetch',
    duration: 100,
    size: 1024,
    requestHeaders: {},
    responseHeaders: { 'content-type': 'application/json' },
    requestBody: null,
    responseRaw: '{"ok":true}',
    responseDecrypted: null,
    ...overrides,
  };
}

export function logEntry(overrides = {}) {
  return {
    id: uniqueId('log'),
    type: 'log',
    timestamp: 1_700_000_000_000,
    logLevel: 'info',
    message: 'hello world',
    logData: null,
    ...overrides,
  };
}

// A default EntryListOptions bag; tests override only what they exercise.
export function listOptions(overrides = {}) {
  return {
    mode: 'api',
    entries: [],
    query: '',
    statusFilters: new Set(),
    typeFilters: new Set(),
    methodFilters: new Set(),
    expandedGroups: new Set(),
    pinnedIds: new Set(),
    sortField: 'timestamp',
    sortOrder: 'desc',
    ...overrides,
  };
}
