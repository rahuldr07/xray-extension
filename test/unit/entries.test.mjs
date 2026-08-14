/* Behavioural tests for src/panel/models/entries.ts.
   Every fixture object is freshly constructed: entries.ts memoizes group stats,
   body flags and the search haystack in WeakMaps keyed by object identity. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { entries as M, apiEntry, logEntry, listOptions, assertSchemaFallback } from './harness.mjs';

const {
  buildEntryListItems,
  buildEndpointGroups,
  buildApiListSummary,
  compareEntries,
  entryGroupLabel,
  entryGroupPath,
  entryGroupStats,
  entryPath,
  getEntryContentType,
  getEntryDomain,
  getEntryFlags,
  matchesApiQuickFilter,
  matchesEntry,
  statusRange,
} = M;

test('harness runs against the local schema fallback, not window.XRAY_ConsoleHelpers', () => {
  assertSchemaFallback(assert);
});

// ---------------------------------------------------------------- primitives

test('entryPath falls back url -> "(unknown)"', () => {
  assert.equal(entryPath(apiEntry({ urlPath: '/a' })), '/a');
  assert.equal(entryPath(apiEntry({ urlPath: '', url: 'https://x/y' })), 'https://x/y');
  assert.equal(entryPath(apiEntry({ urlPath: '', url: '' })), '(unknown)');
});

test('entryGroupPath separates GraphQL operations sharing one endpoint', () => {
  const base = { urlPath: '/graphql', method: 'POST' };
  const a = apiEntry({ ...base, graphql: { operationType: 'query', operationName: 'GetUser' } });
  const b = apiEntry({ ...base, graphql: { operationType: 'mutation', operationName: 'SetUser' } });
  const plain = apiEntry(base);

  assert.equal(entryGroupPath(a), '/graphql#GetUser');
  assert.equal(entryGroupPath(b), '/graphql#SetUser');
  assert.equal(entryGroupPath(plain), '/graphql');
  assert.equal(entryGroupLabel(a), 'query GetUser');
  assert.equal(entryGroupLabel(plain), '/graphql');
});

test('getEntryDomain returns host, and empty string for unparseable urls', () => {
  assert.equal(getEntryDomain(apiEntry({ url: 'https://api.example.com:8443/x' })), 'api.example.com:8443');
  assert.equal(getEntryDomain(apiEntry({ url: 'not a url' })), '');
  assert.equal(getEntryDomain(apiEntry({ url: '' })), '');
});

test('getEntryContentType prefers contentType, then response headers, then request headers (case-insensitive)', () => {
  assert.equal(getEntryContentType(apiEntry({ contentType: 'text/csv' })), 'text/csv');
  assert.equal(
    getEntryContentType(apiEntry({ contentType: '', responseHeaders: { 'Content-Type': 'application/xml' } })),
    'application/xml',
  );
  assert.equal(
    getEntryContentType(apiEntry({ contentType: '', responseHeaders: {}, requestHeaders: { 'CONTENT-TYPE': 'application/json' } })),
    'application/json',
  );
  assert.equal(getEntryContentType(apiEntry({ contentType: '', responseHeaders: {}, requestHeaders: {} })), '');
});

test('statusRange buckets on the standard boundaries', () => {
  const cases = [[0, 'other'], [199, 'other'], [200, '2xx'], [299, '2xx'], [300, '3xx'], [399, '3xx'], [400, '4xx'], [499, '4xx'], [500, '5xx'], [599, '5xx']];
  for (const [status, expected] of cases) {
    assert.equal(statusRange(apiEntry({ status })), expected, `status ${status}`);
  }
});

// -------------------------------------------------------------------- search

test('matchesEntry is case-insensitive across url, method, status and log data', () => {
  const entry = apiEntry({ url: 'https://API.example.com/V1/Users', method: 'POST', status: 404 });
  assert.equal(matchesEntry(entry, ''), true, 'empty query matches everything');
  assert.equal(matchesEntry(entry, 'users'), true);
  assert.equal(matchesEntry(entry, 'POST'), true);
  assert.equal(matchesEntry(entry, '404'), true);
  assert.equal(matchesEntry(entry, 'api.example.com'), true, 'domain is part of the haystack');
  assert.equal(matchesEntry(entry, 'nope'), false);

  const log = logEntry({ message: 'Boom happened', logData: { detail: 'trace-id-42' } });
  assert.equal(matchesEntry(log, 'boom'), true);
  assert.equal(matchesEntry(log, 'trace-id-42'), true, 'logData preview is searchable');
});

// --------------------------------------------------------------------- flags

test('getEntryFlags derives every flag from a single entry', () => {
  const entry = apiEntry({
    status: 500,
    duration: 900,
    driftFromId: 'x',
    mocked: true,
    replayed: true,
    graphql: { operationType: 'query', operationName: 'Q' },
    source: 'ws',
    size: 200_000,
    responseRaw: '{}',
  });
  const flags = getEntryFlags(entry, [entry], new Set([entry.id]), 500);
  for (const expected of ['error', 'drift', 'mocked', 'replayed', 'graphql', 'ws', 'slow', 'large', 'empty', 'pinned']) {
    assert.ok(flags.includes(expected), `expected flag ${expected} in ${flags.join(',')}`);
  }
  assert.ok(!flags.includes('repeated'), 'a single entry is not repeated');
});

test('getEntryFlags: slow uses >= the configured threshold', () => {
  const at = apiEntry({ duration: 500 });
  const below = apiEntry({ duration: 499 });
  assert.ok(getEntryFlags(at, [at], new Set(), 500).includes('slow'), 'exactly the threshold is slow');
  assert.ok(!getEntryFlags(below, [below], new Set(), 500).includes('slow'));

  const custom = apiEntry({ duration: 250 });
  assert.ok(getEntryFlags(custom, [custom], new Set(), 200).includes('slow'), 'threshold is configurable');
});

test('getEntryFlags: repeated needs 3 in the same group, GraphQL ops counted separately', () => {
  const mk = (op) => apiEntry({ urlPath: '/graphql', graphql: { operationType: 'query', operationName: op } });
  const list = [mk('A'), mk('A'), mk('B'), mk('B'), mk('B')];
  assert.ok(!getEntryFlags(list[0], list).includes('repeated'), 'A appears twice');
  assert.ok(getEntryFlags(list[2], list).includes('repeated'), 'B appears three times');
});

test('getEntryFlags: empty covers 204, null body, [] and {}', () => {
  const empties = [
    apiEntry({ status: 204, responseRaw: '{"a":1}' }),
    apiEntry({ responseRaw: null }),
    apiEntry({ responseRaw: '' }),
    apiEntry({ responseRaw: '[]' }),
    apiEntry({ responseRaw: '{}' }),
  ];
  for (const entry of empties) {
    assert.ok(getEntryFlags(entry, [entry]).includes('empty'), `expected empty for ${JSON.stringify(entry.responseRaw)}`);
  }
  const full = apiEntry({ responseRaw: '{"a":1}' });
  assert.ok(!getEntryFlags(full, [full]).includes('empty'));
});

test('getEntryFlags: large triggers on declared size or raw body length', () => {
  const bySize = apiEntry({ size: 100_000, responseRaw: '{"a":1}' });
  const byBody = apiEntry({ size: 0, responseRaw: 'x'.repeat(100_000) });
  const small = apiEntry({ size: 99_999, responseRaw: 'x'.repeat(99_999) });
  assert.ok(getEntryFlags(bySize, [bySize]).includes('large'));
  assert.ok(getEntryFlags(byBody, [byBody]).includes('large'));
  assert.ok(!getEntryFlags(small, [small]).includes('large'));
});

test('getEntryFlags on a log entry returns only pinned', () => {
  const log = logEntry();
  assert.deepEqual(getEntryFlags(log, [log], new Set()), []);
  assert.deepEqual(getEntryFlags(log, [log], new Set([log.id])), ['pinned']);
});

test('matchesApiQuickFilter agrees with the flag it names', () => {
  const list = [];
  const cases = [
    ['errors', apiEntry({ status: 503 }), apiEntry({ status: 200 })],
    ['slow', apiEntry({ duration: 800 }), apiEntry({ duration: 10 })],
    ['drift', apiEntry({ driftFromId: 'a' }), apiEntry()],
    ['graphql', apiEntry({ graphql: { operationType: 'query', operationName: 'Q' } }), apiEntry()],
    ['ws', apiEntry({ source: 'sse' }), apiEntry({ source: 'fetch' })],
    ['mocked', apiEntry({ mocked: true }), apiEntry()],
    ['replayed', apiEntry({ replayed: true }), apiEntry()],
    ['large', apiEntry({ size: 500_000 }), apiEntry({ size: 10 })],
    ['empty', apiEntry({ responseRaw: '[]' }), apiEntry({ responseRaw: '{"a":1}' })],
  ];
  for (const [, yes, no] of cases) list.push(yes, no);
  for (const [filter, yes, no] of cases) {
    assert.equal(matchesApiQuickFilter(yes, filter, list), true, `${filter} should match`);
    assert.equal(matchesApiQuickFilter(no, filter, list), false, `${filter} should not match`);
  }
  assert.equal(matchesApiQuickFilter(list[0], 'all', list), true);
});

test('matchesApiQuickFilter pinned/repeated use the supplied context', () => {
  const pinned = apiEntry();
  const other = apiEntry();
  assert.equal(matchesApiQuickFilter(pinned, 'pinned', [pinned, other], new Set([pinned.id])), true);
  assert.equal(matchesApiQuickFilter(other, 'pinned', [pinned, other], new Set([pinned.id])), false);

  const trio = [apiEntry({ urlPath: '/p' }), apiEntry({ urlPath: '/p' }), apiEntry({ urlPath: '/p' }), apiEntry({ urlPath: '/q' })];
  assert.equal(matchesApiQuickFilter(trio[0], 'repeated', trio), true);
  assert.equal(matchesApiQuickFilter(trio[3], 'repeated', trio), false);
});

// ------------------------------------------------------------ group + sorting

test('entryGroupStats aggregates count / errors / avg / max per group', () => {
  const list = [
    apiEntry({ urlPath: '/a', duration: 100, status: 200 }),
    apiEntry({ urlPath: '/a', duration: 300, status: 500 }),
    apiEntry({ urlPath: '/b', duration: 50, status: 200 }),
  ];
  const a = entryGroupStats(list[0], list);
  assert.deepEqual(a, { count: 2, errors: 1, avgDuration: 200, maxDuration: 300 });
  assert.deepEqual(entryGroupStats(list[2], list), { count: 1, errors: 0, avgDuration: 50, maxDuration: 50 });

  const orphan = apiEntry({ urlPath: '/never-seen' });
  assert.deepEqual(entryGroupStats(orphan, list), { count: 0, errors: 0, avgDuration: 0, maxDuration: 0 });
});

test('buildEndpointGroups sorts members newest-first and rolls up totals', () => {
  const older = apiEntry({ urlPath: '/a', timestamp: 1000, duration: 100, size: 10, status: 200, method: 'get', source: 'fetch' });
  const newer = apiEntry({ urlPath: '/a', timestamp: 2000, duration: 300, size: 20, status: 404, method: 'POST', source: 'xhr' });
  const [group] = buildEndpointGroups([older, newer, logEntry()]);

  assert.equal(group.key, 'api:/a');
  assert.equal(group.count, 2);
  assert.equal(group.errors, 1);
  assert.equal(group.avgDuration, 200);
  assert.equal(group.maxDuration, 300);
  assert.equal(group.totalBytes, 30);
  assert.equal(group.lastSeen, 2000);
  assert.equal(group.latestEntry.id, newer.id);
  assert.deepEqual(group.methods, ['POST', 'GET']);
  assert.deepEqual(group.sources, ['xhr', 'fetch']);
});

test('compareEntries honours field and direction', () => {
  const a = apiEntry({ status: 200, duration: 10, size: 5, timestamp: 1, urlPath: '/a', method: 'GET' });
  const b = apiEntry({ status: 500, duration: 20, size: 9, timestamp: 2, urlPath: '/b', method: 'POST' });
  for (const field of ['status', 'duration', 'size', 'timestamp']) {
    assert.ok(compareEntries(a, b, field, 'asc') < 0, `${field} asc`);
    assert.ok(compareEntries(a, b, field, 'desc') > 0, `${field} desc`);
  }
  assert.ok(compareEntries(a, b, 'url', 'asc') < 0);
  assert.ok(compareEntries(a, b, 'method', 'asc') < 0, 'GET < POST');
});

// ------------------------------------------------------- buildEntryListItems

/** Assert the grouped-mode layout invariant: a header row is immediately
 *  followed by its own children and nothing else. */
function assertGroupsContiguous(rows) {
  let currentGroup = null;
  const seenHeaders = new Set();
  for (const [index, row] of rows.entries()) {
    if (row.groupChild) {
      assert.ok(currentGroup, `row ${index} is a child with no preceding header`);
      assert.equal(row.groupKey, currentGroup, `row ${index} child belongs to a different group than the header above it`);
    } else {
      assert.ok(row.groupKey, `row ${index} is neither header nor child`);
      assert.ok(!seenHeaders.has(row.groupKey), `group ${row.groupKey} emitted a second header block`);
      seenHeaders.add(row.groupKey);
      currentGroup = row.groupKey;
    }
  }
}

test('buildEntryListItems (logs mode) returns only logs, pinned first', () => {
  const l1 = logEntry({ timestamp: 1 });
  const l2 = logEntry({ timestamp: 2 });
  const l3 = logEntry({ timestamp: 3 });
  const api = apiEntry();
  const all = [l1, l2, l3, api];

  const rows = buildEntryListItems(listOptions({ mode: 'logs', entries: all, pinnedIds: new Set([l1.id]) }));
  assert.deepEqual(rows.map((row) => row.entry.id), [l1.id, l3.id, l2.id]);
  assert.ok(rows.every((row) => row.groupKey === undefined), 'logs mode never groups');
  assert.deepEqual(rows[0].flags, ['pinned']);
});

test('buildEntryListItems (flat mode) is a filtered, pinned-first sort with no group rows', () => {
  const a = apiEntry({ timestamp: 1, urlPath: '/a' });
  const b = apiEntry({ timestamp: 2, urlPath: '/b' });
  const c = apiEntry({ timestamp: 3, urlPath: '/c' });
  const all = [a, b, c, logEntry()];

  const rows = buildEntryListItems(listOptions({ entries: all, apiGroupingMode: 'flat', pinnedIds: new Set([a.id]) }));
  assert.deepEqual(rows.map((row) => row.entry.id), [a.id, c.id, b.id]);
  assert.ok(rows.every((row) => row.groupKey === undefined && row.key === row.entry.id));
});

test('buildEntryListItems composes all six filters', () => {
  const wanted = apiEntry({ urlPath: '/wanted', method: 'POST', status: 404, source: 'xhr', duration: 900 });
  const wrongQuery = apiEntry({ urlPath: '/other', method: 'POST', status: 404, source: 'xhr', duration: 900 });
  const wrongMethod = apiEntry({ urlPath: '/wanted', method: 'GET', status: 404, source: 'xhr', duration: 900 });
  const wrongStatus = apiEntry({ urlPath: '/wanted', method: 'POST', status: 200, source: 'xhr', duration: 900 });
  const wrongType = apiEntry({ urlPath: '/wanted', method: 'POST', status: 404, source: 'fetch', duration: 900 });
  const wrongQuick = apiEntry({ urlPath: '/wanted', method: 'POST', status: 404, source: 'xhr', duration: 10 });
  const notApi = logEntry({ message: '/wanted' });
  const all = [wanted, wrongQuery, wrongMethod, wrongStatus, wrongType, wrongQuick, notApi];

  const rows = buildEntryListItems(listOptions({
    entries: all,
    query: '/wanted',
    methodFilters: new Set(['POST']),
    statusFilters: new Set(['4xx']),
    typeFilters: new Set(['xhr']),
    apiQuickFilter: 'slow',
    apiGroupingMode: 'flat',
  }));
  assert.deepEqual(rows.map((row) => row.entry.id), [wanted.id]);
});

test('buildEntryListItems method filter compares uppercased, and defaults missing methods to GET', () => {
  const lower = apiEntry({ method: 'post' });
  const missing = apiEntry({ method: undefined });
  const all = [lower, missing];
  const post = buildEntryListItems(listOptions({ entries: all, methodFilters: new Set(['POST']), apiGroupingMode: 'flat' }));
  assert.deepEqual(post.map((row) => row.entry.id), [lower.id]);
  const get = buildEntryListItems(listOptions({ entries: all, methodFilters: new Set(['GET']), apiGroupingMode: 'flat' }));
  assert.deepEqual(get.map((row) => row.entry.id), [missing.id]);
});

test('buildEntryListItems (grouped) emits a collapsed header per group and no children', () => {
  const a1 = apiEntry({ urlPath: '/a', timestamp: 10 });
  const a2 = apiEntry({ urlPath: '/a', timestamp: 20 });
  const b1 = apiEntry({ urlPath: '/b', timestamp: 30 });
  const rows = buildEntryListItems(listOptions({ entries: [a1, a2, b1] }));

  assert.deepEqual(rows.map((row) => row.key), ['api:/b', 'api:/a']);
  assert.deepEqual(rows.map((row) => row.groupCount), [1, 2]);
  assert.ok(rows.every((row) => row.groupExpanded === false && row.groupChild === undefined));
  assert.equal(rows[1].entry.id, a2.id, 'header shows the newest member under a desc timestamp sort');
  assert.equal(rows[1].groupStats.count, 2);
  assertGroupsContiguous(rows);
});

test('buildEntryListItems (grouped) keeps each expanded header immediately followed by its own children', () => {
  const mk = (path, ts) => apiEntry({ urlPath: path, timestamp: ts });
  const all = [
    mk('/a', 1), mk('/a', 4), mk('/a', 7),
    mk('/b', 2), mk('/b', 5),
    mk('/c', 3), mk('/c', 6), mk('/c', 9),
  ];
  const rows = buildEntryListItems(listOptions({
    entries: all,
    expandedGroups: new Set(['api:/a', 'api:/b', 'api:/c']),
  }));

  assertGroupsContiguous(rows);
  assert.equal(rows.length, 8, 'three headers + five children');
  assert.deepEqual(
    rows.map((row) => `${row.groupKey}${row.groupChild ? '*' : ''}`),
    ['api:/c', 'api:/c*', 'api:/c*', 'api:/a', 'api:/a*', 'api:/a*', 'api:/b', 'api:/b*'],
  );
  // Group order follows the latest entry of each group under the active sort.
  assert.deepEqual(rows.filter((row) => !row.groupChild).map((row) => row.entry.timestamp), [9, 7, 5]);
  // Children are the remaining members, newest first.
  assert.deepEqual(rows.filter((row) => row.groupChild).map((row) => row.entry.timestamp), [6, 3, 4, 1, 2]);
});

test('buildEntryListItems (grouped) hoists the pinned group and the pinned row inside it', () => {
  const a1 = apiEntry({ urlPath: '/a', timestamp: 100 });
  const a2 = apiEntry({ urlPath: '/a', timestamp: 200 });
  const oldPinned = apiEntry({ urlPath: '/z', timestamp: 1 });
  const zNewer = apiEntry({ urlPath: '/z', timestamp: 5 });
  const rows = buildEntryListItems(listOptions({
    entries: [a1, a2, oldPinned, zNewer],
    pinnedIds: new Set([oldPinned.id]),
    expandedGroups: new Set(['api:/z', 'api:/a']),
  }));

  assertGroupsContiguous(rows);
  assert.equal(rows[0].groupKey, 'api:/z', 'the group containing a pin sorts first despite older timestamps');
  assert.equal(rows[0].entry.id, oldPinned.id, 'the pinned entry becomes the header even though it is the older one');
  assert.ok(rows[0].flags.includes('pinned'));
  assert.equal(rows[1].entry.id, zNewer.id);
  assert.equal(rows[2].groupKey, 'api:/a');
});

test('buildEntryListItems (grouped) does not emit a child row for a single-entry expanded group', () => {
  const only = apiEntry({ urlPath: '/solo' });
  const rows = buildEntryListItems(listOptions({ entries: [only], expandedGroups: new Set(['api:/solo']) }));
  assert.equal(rows.length, 1);
  assert.equal(rows[0].groupExpanded, true);
  assert.equal(rows[0].groupChild, undefined);
});

test('buildEntryListItems (grouped) groups GraphQL operations independently', () => {
  const mk = (op, ts) => apiEntry({ urlPath: '/graphql', method: 'POST', timestamp: ts, graphql: { operationType: 'query', operationName: op } });
  const all = [mk('GetUser', 1), mk('GetUser', 3), mk('ListOrders', 2)];
  const rows = buildEntryListItems(listOptions({ entries: all }));

  assert.deepEqual(rows.map((row) => row.groupKey), ['api:/graphql#GetUser', 'api:/graphql#ListOrders']);
  assert.deepEqual(rows.map((row) => row.groupStats.path), ['query GetUser', 'query ListOrders']);
});

test('buildEntryListItems grouping is computed after filtering', () => {
  const kept = apiEntry({ urlPath: '/a', status: 500, timestamp: 2 });
  const dropped = apiEntry({ urlPath: '/a', status: 200, timestamp: 3 });
  const rows = buildEntryListItems(listOptions({
    entries: [kept, dropped],
    statusFilters: new Set(['5xx']),
    expandedGroups: new Set(['api:/a']),
  }));
  assert.equal(rows.length, 1);
  assert.equal(rows[0].groupCount, 1, 'filtered-out members are not counted in the header');
  assert.equal(rows[0].entry.id, kept.id);
});

test('buildEntryListItems returns [] when nothing survives the filters', () => {
  const rows = buildEntryListItems(listOptions({ entries: [apiEntry(), logEntry()], query: 'no-such-thing' }));
  assert.deepEqual(rows, []);
});

// ------------------------------------------------------- buildApiListSummary

test('buildApiListSummary aggregates only API entries', () => {
  const all = [
    apiEntry({ urlPath: '/a', duration: 100, size: 10, status: 200 }),
    apiEntry({ urlPath: '/a', duration: 900, size: 20, status: 500 }),
    apiEntry({ urlPath: '/a', duration: 300, size: 30, status: 200 }),
    apiEntry({ urlPath: '/b', duration: 200, size: 40, status: 404 }),
    logEntry(),
  ];
  const summary = buildApiListSummary(all, new Set([all[0].id]));
  assert.equal(summary.total, 4);
  assert.equal(summary.errors, 2);
  assert.equal(summary.slow, 1);
  assert.equal(summary.pinned, 1);
  assert.equal(summary.avgDuration, 375);
  assert.equal(summary.totalBytes, 100);
  assert.equal(summary.topEndpoint, '/a');
  assert.equal(summary.repeatedEndpoints, 1);
});

test('buildApiListSummary on an empty list is all zeros', () => {
  const summary = buildApiListSummary([], new Set());
  assert.deepEqual(summary, {
    total: 0, errors: 0, slow: 0, pinned: 0, avgDuration: 0, totalBytes: 0,
    topEndpoint: 'No endpoint yet', repeatedEndpoints: 0,
  });
});
