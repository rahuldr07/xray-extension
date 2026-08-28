/* Behavioural tests for src/panel/models/insights.ts and viz.ts. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { insights as N, viz as V, entries as EN, apiEntry, logEntry } from './harness.mjs';

const { buildInsightsSummary, repeatedEndpoints } = N;
const { buildVizSpec, formatVizValue } = V;

// ------------------------------------------------------------------ insights

test('buildInsightsSummary aggregates counts, bytes and status buckets over API entries only', () => {
  const all = [
    apiEntry({ urlPath: '/a', status: 200, duration: 100, size: 10 }),
    apiEntry({ urlPath: '/a', status: 301, duration: 200, size: 20 }),
    apiEntry({ urlPath: '/b', status: 404, duration: 300, size: 30 }),
    apiEntry({ urlPath: '/b', status: 503, duration: 400, size: 40 }),
    apiEntry({ urlPath: '/c', status: 0, duration: 0, size: 0 }),
    logEntry(),
  ];
  const summary = buildInsightsSummary(all);
  assert.equal(summary.requests, 5);
  assert.equal(summary.errors, 2);
  assert.equal(summary.avgDuration, 200);
  assert.equal(summary.totalBytes, 100);
  assert.deepEqual(summary.statusCounts, { '2xx': 1, '3xx': 1, '4xx': 1, '5xx': 1, other: 1 });
});

test('buildInsightsSummary on an empty list is all zeros', () => {
  const summary = buildInsightsSummary([]);
  assert.equal(summary.requests, 0);
  assert.equal(summary.errors, 0);
  assert.equal(summary.slow, 0);
  assert.equal(summary.avgDuration, 0);
  assert.equal(summary.totalBytes, 0);
  assert.deepEqual(summary.statusCounts, {});
  assert.deepEqual(summary.repeatedEndpoints, {});
  assert.deepEqual(summary.nPlusOneCandidates, []);
  assert.deepEqual(summary.topSlowRequests, []);
});

test('buildInsightsSummary.topSlowRequests is the 8 slowest, newest-duration-first', () => {
  const all = Array.from({ length: 12 }, (_, i) => apiEntry({ urlPath: `/p${i}`, duration: i * 100, method: 'get', status: 200 }));
  const summary = buildInsightsSummary(all);
  assert.equal(summary.topSlowRequests.length, 8);
  assert.deepEqual(summary.topSlowRequests.map((item) => item.duration), [1100, 1000, 900, 800, 700, 600, 500, 400]);
  assert.deepEqual(summary.topSlowRequests[0], {
    id: all[11].id, method: 'get', path: '/p11', duration: 1100, status: 200,
  });
});

test('buildInsightsSummary.nPlusOneCandidates needs 3+ hits and reports the group average', () => {
  const all = [
    ...Array.from({ length: 4 }, () => apiEntry({ urlPath: '/items/1', duration: 50 })),
    ...Array.from({ length: 3 }, () => apiEntry({ urlPath: '/items/2', duration: 150 })),
    apiEntry({ urlPath: '/once', duration: 999 }),
    apiEntry({ urlPath: '/twice', duration: 1 }),
    apiEntry({ urlPath: '/twice', duration: 1 }),
  ];
  const summary = buildInsightsSummary(all);
  assert.deepEqual(summary.nPlusOneCandidates, [
    { path: '/items/1', label: '/items/1', count: 4, avgDuration: 50 },
    { path: '/items/2', label: '/items/2', count: 3, avgDuration: 150 },
  ]);
  assert.deepEqual(summary.repeatedEndpoints, { '/items/1': 4, '/items/2': 3, '/once': 1, '/twice': 2 });
});

test('buildInsightsSummary.nPlusOneCandidates is capped at 8', () => {
  const all = Array.from({ length: 12 }, (_, i) => i).flatMap((i) =>
    Array.from({ length: 3 }, () => apiEntry({ urlPath: `/p${i}` })));
  assert.equal(buildInsightsSummary(all).nPlusOneCandidates.length, 8);
});

test('repeatedEndpoints counts every entry it is handed, including logs', () => {
  const log = logEntry();
  const counts = repeatedEndpoints([apiEntry({ urlPath: '/a' }), apiEntry({ urlPath: '/a' }), log]);
  assert.equal(counts['/a'], 2);
  assert.equal(counts['(unknown)'], 1, 'a log entry has no path, so it lands in the (unknown) bucket');
});

test('FIXED insights.ts:44 — the slow count honours slowThresholdMs and agrees with entries.ts at the boundary', () => {
  const exactly500 = apiEntry({ duration: 500 });
  const just501 = apiEntry({ duration: 501 });
  const all = [exactly500, just501];

  // Was: a hardcoded `> 500`, so Insights said 1 while the request list said 2.
  assert.equal(buildInsightsSummary(all).slow, 2, 'Insights counts both at the default threshold');
  assert.equal(EN.buildApiListSummary(all, new Set(), 500).slow, 2, 'and the API list agrees');
  assert.ok(EN.getEntryFlags(exactly500, all, new Set(), 500).includes('slow'), 'as does the per-entry flag');

  // Was: Insights ignored the configured threshold entirely.
  const fast = [apiEntry({ duration: 250 }), apiEntry({ duration: 250 })];
  assert.equal(buildInsightsSummary(fast, 200).slow, 2, 'Insights honours a 200ms threshold');
  assert.equal(EN.buildApiListSummary(fast, new Set(), 200).slow, 2, 'matching the API list exactly');
  assert.equal(buildInsightsSummary(fast).slow, 0, 'and still defaults to 500 when none is passed');
});

test('FIXED insights.ts:24-29 — GraphQL operations group apart instead of collapsing into one false N+1', () => {
  const gql = (op) => apiEntry({
    urlPath: '/graphql', method: 'POST', duration: 100,
    graphql: { operationType: 'query', operationName: op },
  });
  const all = [gql('GetUser'), gql('ListOrders'), gql('GetSettings')];

  const summary = buildInsightsSummary(all);
  // Was: { '/graphql': 3 } and a bogus N+1 candidate on every GraphQL app.
  assert.deepEqual(summary.repeatedEndpoints, {
    '/graphql#GetUser': 1, '/graphql#ListOrders': 1, '/graphql#GetSettings': 1,
  }, 'three distinct operations are three buckets');
  assert.deepEqual(summary.nPlusOneCandidates, [], 'and none of them is an N+1');

  // The rest of the panel already grouped these apart; Insights now matches it.
  assert.equal(new Set(all.map(EN.entryGroupPath)).size, 3);
  assert.equal(EN.buildEndpointGroups(all).length, 3, 'the API list shows three groups');
  assert.ok(!EN.getEntryFlags(all[0], all).includes('repeated'), 'and does not flag them as repeated');
});

test('a genuinely repeated GraphQL operation is still reported, labelled by operation', () => {
  const gql = () => apiEntry({
    urlPath: '/graphql', method: 'POST', duration: 100,
    graphql: { operationType: 'query', operationName: 'GetUser' },
  });
  const summary = buildInsightsSummary([gql(), gql(), gql()]);
  assert.deepEqual(summary.nPlusOneCandidates, [
    { path: '/graphql', label: 'query GetUser', count: 3, avgDuration: 100 },
  ], 'path stays searchable for the request-list box; label names the operation');
});

// ----------------------------------------------------------------------- viz

test('buildVizSpec charts a numeric array', () => {
  const spec = buildVizSpec([3, -1, 4]);
  assert.equal(spec.kind, 'bars');
  assert.equal(spec.title, '3 values');
  assert.deepEqual(spec.bars, [
    { label: '#1', value: 3, negative: false },
    { label: '#2', value: -1, negative: true },
    { label: '#3', value: 4, negative: false },
  ]);
  assert.equal(spec.truncated, 0);
  assert.equal(spec.maxAbs, 4);
});

test('buildVizSpec picks the best-covered numeric field of an object array and labels it', () => {
  const rows = [
    { name: 'a', sparse: 1, count: 10 },
    { name: 'b', count: 20 },
    { name: 'c', count: -30 },
  ];
  const spec = buildVizSpec(rows);
  assert.equal(spec.kind, 'bars');
  assert.equal(spec.title, 'count across 3 rows');
  assert.equal(spec.subtitle, 'Labeled by name');
  assert.deepEqual(spec.bars, [
    { label: 'a', value: 10, negative: false },
    { label: 'b', value: 20, negative: false },
    { label: 'c', value: -30, negative: true },
  ]);
  assert.equal(spec.maxAbs, 30, 'maxAbs uses absolute values');
});

test('buildVizSpec falls back to a frequency distribution when an object array has no numbers', () => {
  const rows = [{ kind: 'a' }, { kind: 'b' }, { kind: 'a' }];
  const spec = buildVizSpec(rows);
  assert.equal(spec.title, 'Distribution of kind');
  assert.equal(spec.subtitle, '3 rows');
  assert.deepEqual(spec.bars, [
    { label: 'a', value: 2, negative: false },
    { label: 'b', value: 1, negative: false },
  ], 'sorted by descending frequency');
});

test('buildVizSpec charts the first array-valued property of an object', () => {
  const spec = buildVizSpec({ meta: { page: 1 }, items: [1, 2, 3] });
  assert.equal(spec.title, '3 values');
  assert.equal(spec.bars.length, 3);
});

test('buildVizSpec charts the numeric fields of a plain object', () => {
  const spec = buildVizSpec({ hits: 5, misses: 2, label: 'x' });
  assert.equal(spec.title, '2 numeric fields');
  assert.deepEqual(spec.bars.map((bar) => bar.label), ['hits', 'misses']);
});

test('buildVizSpec charts a single number and refuses everything unchartable', () => {
  const single = buildVizSpec(42);
  assert.deepEqual(single.bars, [{ label: 'value', value: 42, negative: false }]);
  assert.equal(single.maxAbs, 42);
  assert.equal(buildVizSpec(-7).maxAbs, 7);

  for (const value of [null, undefined, 'text', true, NaN, Infinity]) {
    const spec = buildVizSpec(value);
    assert.equal(spec.kind, 'none', `${String(value)} should not be chartable`);
    assert.deepEqual(spec.bars, []);
    assert.equal(spec.maxAbs, 0);
    assert.ok(spec.title.length > 0, 'a "none" spec still explains itself');
  }
  assert.equal(buildVizSpec({ a: 'x' }).title, 'No numeric fields in this object to chart.');
  assert.equal(buildVizSpec([[1], { a: 1 }]).title, 'This array has no numeric or categorical field to chart.');
  assert.equal(buildVizSpec([]).kind, 'none', 'an empty array is not chartable');
});

test('buildVizSpec truncates a long numeric array and reports how much it dropped', () => {
  const spec = buildVizSpec(Array.from({ length: 55 }, (_, i) => i));
  assert.equal(spec.bars.length, 40);
  assert.equal(spec.truncated, 15);
  assert.equal(spec.title, '55 values');
});

test('buildVizSpec truncates a long object array on the numeric path and reports it', () => {
  const rows = Array.from({ length: 55 }, (_, i) => ({ name: `n${i}`, count: i }));
  const spec = buildVizSpec(rows);
  assert.equal(spec.bars.length, 40);
  assert.equal(spec.truncated, 15);
});

test('buildVizSpec truncates a wide object on the numeric-fields path and reports it', () => {
  const wide = Object.fromEntries(Array.from({ length: 55 }, (_, i) => [`k${i}`, i]));
  const spec = buildVizSpec(wide);
  assert.equal(spec.bars.length, 40);
  assert.equal(spec.truncated, 15);
});

test('buildVizSpec labels long strings with an ellipsis and blank labels by index', () => {
  const rows = [{ name: 'x'.repeat(60), count: 1 }, { name: '', count: 2 }, { name: null, count: 3 }];
  const spec = buildVizSpec(rows);
  assert.equal(spec.bars[0].label.length, 41);
  assert.ok(spec.bars[0].label.endsWith('…'));
  assert.equal(spec.bars[1].label, '#2', 'an empty label degrades to its index');
  assert.equal(spec.bars[2].label, '#3');
});

test('FIXED viz.ts:88-96 — the categorical-distribution path reports the categories it dropped', () => {
  const rows = Array.from({ length: 55 }, (_, i) => ({ kind: `k${i}` }));
  const spec = buildVizSpec(rows);
  assert.equal(spec.bars.length, 40, '15 categories were dropped');
  assert.equal(spec.truncated, 15, 'and the spec says so — was hardcoded to 0');
  assert.equal(spec.subtitle, '55 rows');

  const under = buildVizSpec(Array.from({ length: 12 }, (_, i) => ({ kind: `k${i}` })));
  assert.equal(under.truncated, 0, 'nothing dropped still reports 0');
});

test('FIXED viz.ts:114-117 — the scalar-frequency path reports dropped values too', () => {
  const values = Array.from({ length: 55 }, (_, i) => `v${i}`);
  const spec = buildVizSpec(values);
  assert.equal(spec.bars.length, 40, '15 distinct values were dropped');
  assert.equal(spec.truncated, 15, 'and the spec says so — was hardcoded to 0');
  assert.equal(spec.title, 'Distribution of 55 values');

  // The numeric path always reported honestly; all three paths now agree.
  assert.equal(buildVizSpec(Array.from({ length: 55 }, (_, i) => i)).truncated, 15);

  // Frequency collapses duplicates, so truncation counts distinct values, not rows.
  const dupes = buildVizSpec(Array.from({ length: 200 }, (_, i) => `v${i % 10}`));
  assert.equal(dupes.bars.length, 10);
  assert.equal(dupes.truncated, 0, '200 rows over 10 distinct values drops nothing');
});

test('formatVizValue keeps integers, thousands separators and short decimals readable', () => {
  assert.equal(formatVizValue(1000), '1,000');
  assert.equal(formatVizValue(-2500), '-2,500');
  assert.equal(formatVizValue(0), '0');
  assert.equal(formatVizValue(1234.5678), '1,234.6');
  assert.equal(formatVizValue(0.123456), '0.123');
  assert.equal(formatVizValue(0.5), '0.5');
});
