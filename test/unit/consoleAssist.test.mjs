import test from 'node:test';
import assert from 'node:assert/strict';
import './harness.mjs';

const A = await import('../../src/panel/models/consoleAssist.ts');
const { parsePlainPath, resolvePath, formatPath, suggest, signatureAt, errorHint, starters, tokenize, HELPERS, summarizeCaptured, argumentAt } = A;

test('parsePlainPath', () => {
  assert.deepEqual(parsePlainPath('res.users[0]["a b"]'), { root: 'res', segments: ['users', 0, 'a b'] });
  assert.deepEqual(parsePlainPath("temp12['k']"), { root: 'temp12', segments: ['k'] });
  assert.deepEqual(parsePlainPath('$_.x'), { root: '$_', segments: ['x'] });
  assert.deepEqual(parsePlainPath('a'), { root: 'a', segments: [] });
  for (const bad of ['res.users.map(x=>x)', 'foo.bar', 'resx.a', 'g.a', 'res.', 'res[', 'res["a"', 'res.a b', 'ab.c']) {
    assert.equal(parsePlainPath(bad), null, bad);
  }
});

test('formatPath', () => {
  assert.equal(formatPath('res', ['a b', 0, '']), 'res["a b"][0][""]');
  assert.equal(formatPath('res', ['users', 0, 'name']), 'res.users[0].name');
  assert.equal(formatPath('res', ['0']), 'res["0"]');
  assert.equal(formatPath('res', [0]), 'res[0]');
});

test('resolvePath', () => {
  const roots = { res: { users: [{ name: 'x' }], 'a b': 1 } };
  assert.deepEqual(resolvePath({ root: 'res', segments: ['users', 0, 'name'] }, roots), { found: true, value: 'x' });
  assert.equal(resolvePath({ root: 'res', segments: ['nope'] }, roots).found, false);
  assert.equal(resolvePath({ root: 'req', segments: [] }, roots).found, false);
  assert.equal(resolvePath({ root: 'res', segments: ['users', 'length'] }, roots).value, 1);
  assert.equal(resolvePath({ root: 'res', segments: ['toString'] }, roots).found, false);
});

// Task 4: the full Array.prototype from the catalogue. The common nine lead; the rest follow
// the captured item keys under their own header (captured data ranks before the catalogue).
const ARRAY_COMMON = ['map', 'filter', 'find', 'some', 'every', 'includes', 'slice', 'join', 'at'];
const ARRAY_MORE = ['reduce', 'reduceRight', 'forEach', 'flatMap', 'flat', 'findIndex', 'findLast', 'findLastIndex', 'indexOf', 'lastIndexOf', 'concat', 'sort', 'toSorted', 'reverse', 'toReversed', 'splice', 'toSpliced', 'with', 'push', 'pop', 'shift', 'unshift', 'fill', 'keys', 'values', 'entries'];
const STRING_METHODS = ['includes', 'startsWith', 'endsWith', 'slice', 'split', 'trim', 'toLowerCase', 'toUpperCase', 'replace', 'match', 'at', 'charAt', 'charCodeAt', 'codePointAt', 'concat', 'indexOf', 'lastIndexOf', 'localeCompare', 'matchAll', 'normalize', 'padStart', 'padEnd', 'repeat', 'replaceAll', 'search', 'substring', 'trimStart', 'trimEnd', 'toString'];
const isKeyGroup = (i) => !!i.group && i.group.startsWith('keys');

test('suggest: object properties; arrays get index, length, methods, keys', () => {
  const r = suggest('res.users[0].em', 15, { roots: { res: { users: [{ email: 'x', emailOk: true, id: 1 }] } }, variables: [] });
  assert.equal(r.from, 13);
  assert.deepEqual(r.items.map((i) => i.label), ['email', 'emailOk']);
  assert.deepEqual(r.items.map((i) => i.detail), ['string', 'boolean']);
  const arr = suggest('res.', 4, { roots: { res: [{ id: 1 }] }, variables: [] });
  assert.deepEqual(arr.items.map((i) => i.label), ['[0]', 'length', ...ARRAY_COMMON, 'id', ...ARRAY_MORE]);
  assert.ok(arr.items.filter((i) => ARRAY_MORE.includes(i.label)).every((i) => i.group === 'more array methods'));
  const id = arr.items.find((i) => i.label === 'id');
  assert.equal(id.group, 'keys across 1 item');
  assert.equal(id.detail, '1/1 · number');
  assert.equal(id.insert, 'map(x => x.id)');
  assert.equal(id.kind, 'property');
  assert.deepEqual(suggest('res.zzz.', 8, { roots: { res: {} }, variables: [] }).items, []);
});

test('suggest: helpers and variables, max 30', () => {
  assert.ok(suggest('sch', 3, { roots: {}, variables: [] }).items.some((i) => i.label === 'schema'));
  assert.ok(suggest('tem', 3, { roots: {}, variables: ['temp1'] }).items.some((i) => i.label === 'temp1'));
  const many = Array.from({ length: 40 }, (_, i) => `temp${i}`);
  const capped = suggest('temp', 4, { roots: {}, variables: many }).items.length;
  assert.ok(capped > 8 && capped <= 30, String(capped));
  assert.equal(suggest('', 0, { roots: {}, variables: [] }).items.length, 0);
});

test('suggest: bracket key context', () => {
  const r = suggest('res["', 5, { roots: { res: { 'a b': 1 } }, variables: [] });
  assert.equal(r.items[0].insert, 'a b"]');
});

test('HELPERS table', () => {
  assert.equal(HELPERS.length, 26);
  for (const h of HELPERS) assert.ok(h.description.length <= 80 && /^[A-Z]/.test(h.description), h.name);
});

test('signatureAt', () => {
  assert.equal(signatureAt('diff(a, ', 8)?.name, 'diff');
  assert.equal(signatureAt('diff(a, b)', 10), null);
  assert.equal(signatureAt('foo(', 4), null);
  assert.equal(signatureAt('pick(diff(a, b), ', 17)?.name, 'pick');
  assert.equal(signatureAt('x.pick(', 7), null);
  assert.equal(signatureAt('diff("(", ', 10)?.name, 'diff');
});

test('table/prev/next/csv are known helpers', () => {
  assert.equal(signatureAt('table(', 6)?.name, 'table');
  assert.ok(suggest('pr', 2, { roots: {}, variables: [] }).items.some((i) => i.label === 'prev'));
  assert.equal(errorHint('tabel is not defined', 'tabel(res)', true), 'Did you mean `table`?');
});

test('singular keeps -us/-ss nouns whole', () => {
  const labels = starters({ status: [{ id: 1 }] }, false).map((x) => x.label);
  assert.ok(labels.includes('Find status by id'), labels.join());
  assert.ok(!labels.some((l) => l.includes('statu ')));
});

test('errorHint', () => {
  assert.equal(errorHint("Cannot read properties of undefined (reading 'length')", 'res.data.length', true), 'res is the response body itself. Try Object.keys(res).');
  assert.equal(errorHint('schem is not defined', 'schem(res)', true), 'Did you mean `schema`?');
  assert.equal(errorHint('anything', 'res.x', false), 'No request selected. Pick one above.');
  assert.equal(errorHint('SyntaxError: Unexpected token )', 'res.x(', true), 'Check brackets and quotes. Shift+Enter adds a new line.');
  assert.equal(errorHint('foo is not defined', 'foo()', true), null);
  assert.equal(errorHint('boom', '1+1', true), null);
});

test('starters', () => {
  const s = starters({ users: [{ id: 1 }] }, true);
  assert.deepEqual(s.map((x) => x.label), ['Table of users', 'Count users', 'Find user by id', 'Diff with previous call', 'Schema']);
  assert.deepEqual(s.map((x) => x.insert), ['table(res.users)', 'res.users.length', 'res.users.find(u => u.id === )', 'diff(prev, res)', 'schema(res)']);
  assert.equal(s[2].caretOffset, s[2].insert.length - 1);
  assert.deepEqual(starters({ a: 1 }, false).map((x) => x.label), ['Schema']);
  assert.deepEqual(starters(undefined, true), []);
  assert.equal(starters({ data: { rows: [{ id: 1 }] } }, false)[0].insert, 'table(res.data.rows)');
  assert.deepEqual(starters({ list: [{ x: 1 }] }, false).map((x) => x.label), ['Table of list', 'Count list', 'Schema']);
  assert.equal(starters({ list: [{ x: 1 }] }, false).length, 3);
  assert.ok(starters([{ id: 1 }], true).length <= 5);
});

test('tokenize round-trips and classifies', () => {
  const input = 'const s = "a;b" // c';
  const toks = tokenize(input);
  assert.equal(toks.map((t) => t.text).join(''), input);
  const kinds = new Set(toks.map((t) => t.kind));
  for (const k of ['keyword', 'string', 'comment']) assert.ok(kinds.has(k), k);
  for (const code of ['', 'x = 0x1F + 1.5e3 /* a\nb */ + `t${1}', '"unterminated', "it's\n'ok'", 'a?.b ?? 3n', 'é\u{1F600} \t\r\n', 'a.replace(/\\//g, "-")', '(/[/]\n/x/', 'i++ / 2 / j']) {
    assert.equal(tokenize(code).map((t) => t.text).join(''), code, JSON.stringify(code));
  }
});

test('tokenize: regex literals are one token; `/` after a value is division (Task 5 ruling)', () => {
  const regexes = (code) => tokenize(code).filter((t) => t.kind === 'regex').map((t) => t.text);
  const kinds = (code) => tokenize(code).map((t) => t.kind);
  assert.deepEqual(regexes("res.path.replace(/\\//g, '-'); aw"), ['/\\//g']);
  assert.ok(!kinds("res.path.replace(/\\//g, '-'); aw").includes('comment'), 'the `//` inside the regex is not a comment');
  assert.deepEqual(regexes('x = /[/]/.test(s)'), ['/[/]/'], 'a `/` inside a class does not end it');
  assert.deepEqual(regexes('return /a+/i'), ['/a+/i'], 'after an operand-needing keyword');
  assert.deepEqual(regexes('[/x/, /y/]'), ['/x/', '/y/']);
  assert.deepEqual(regexes('a / b / c'), [], 'division after identifiers');
  assert.deepEqual(regexes('(a) / 2 / x[0] / 3'), [], 'division after ) and ]');
  assert.deepEqual(regexes('i++ / 2 / j'), [], 'division after a postfix ++');
  assert.deepEqual(regexes('"s" / 2'), [], 'division after a string');
  assert.deepEqual(regexes('this / 2'), [], 'division after a value keyword');
  assert.deepEqual(regexes('(/ab\nc'), ['/ab'], 'an unterminated regex ends with its line');
  assert.deepEqual(regexes('a // c'), [], 'a line comment after a value');
  assert.deepEqual(kinds('a // c'), ['plain', 'comment']);
  assert.deepEqual(kinds('x = 1 /* c */'), ['plain', 'punct', 'plain', 'number', 'plain', 'comment']);
});

test('suggest: a regex literal does not silence completion (Task 5 ruling)', () => {
  const draft = "res.path.replace(/\\//g, '-'); aw";
  const r = suggest(draft, draft.length, { roots: {}, variables: [] });
  assert.ok(r.items.some((i) => i.label === 'await'), JSON.stringify(r.items.map((i) => i.label)));
  const brackets = "pick(res, /[(]/.source, 'id'";
  assert.equal(signatureAt(brackets, brackets.length)?.index, 2, 'brackets inside a regex do not open a frame');
});

const sug = (draft, res) => suggest(draft, draft.length, { roots: { res }, variables: [] });

test('suggest: array index replaces the dot', () => {
  const r = sug('res.items.', { items: [1, 2, 3] });
  const idx = r.items[0];
  assert.deepEqual([idx.label, idx.from, idx.insert, idx.kind, idx.detail], ['[0]', 9, '[0]', 'index', 'first item']);
  assert.equal(r.items.find((i) => i.label === 'length').detail, '3');
});

test('suggest: array method templates', () => {
  const by = (res) => Object.fromEntries(sug('res.items.', { items: res }).items.map((i) => [i.label, i]));
  const o = by([{ id: 1 }]);
  assert.deepEqual([o.map.insert, o.map.caret, o.filter.insert, o.filter.caret], ['map(x => x.)', 11, 'filter(x => x.)', 14]);
  const p = by([1, 2]);
  // Task 4 fix round: every callable inserts `name(` with the caret inside (spec §3 "every path").
  assert.deepEqual([p.map.insert, p.map.caret, p.includes.insert, p.includes.caret, p.join.insert, p.join.caret], ['map(x => x)', 10, 'includes(', 9, 'join(', 5]);
  for (const m of ['map', 'filter', 'find', 'some', 'every', 'includes', 'slice', 'join', 'at']) assert.equal(p[m].kind, 'method', m);
});

test('suggest: union keys and coverage', () => {
  const r = sug('res.items.', { items: [{ id: 1, email: 'a' }, { id: 2 }, { id: 3, email: 'c' }] });
  const keys = r.items.filter(isKeyGroup);
  assert.deepEqual(keys.map((i) => [i.label, i.detail]), [['id', '3/3 · number'], ['email', '2/3 · string']]);
  assert.ok(keys.every((i) => i.group === 'keys across 3 items'));
});

test('suggest: union skips non-objects', () => {
  const r = sug('res.items.', { items: [{ a: 1 }, null, 3, { a: 2, b: 1 }] });
  const keys = r.items.filter(isKeyGroup);
  assert.deepEqual(keys.map((i) => [i.label, i.detail]), [['a', '2/2 · number'], ['b', '1/2 · number']]);
  assert.ok(keys.every((i) => i.group === 'keys across 2 items'));
});

test('suggest: union is capped', () => {
  const items = Array.from({ length: 100000 }, (_, i) => (i === 50000 ? { id: i, late: 1 } : { id: i }));
  const t0 = performance.now();
  const r = sug('res.items.', { items });
  const elapsed = performance.now() - t0;
  // The cap is structural: only the first 1,000 items are scanned (a generous bound keeps CI noise out).
  assert.ok(!r.items.some((i) => i.label === 'late'));
  assert.deepEqual([...new Set(r.items.filter((i) => i.group).map((i) => i.group))], ['keys across first 1,000 items', 'more array methods']);
  assert.equal(r.items.find((i) => i.label === 'id').group, 'keys across first 1,000 items');
  assert.ok(elapsed <= 500, String(elapsed));
});

test('suggest: non-identifier keys', () => {
  const r = sug('res.items.', { items: [{ '': 1, '0': 2, 'a-b': 3 }] });
  const ins = r.items.filter(isKeyGroup).map((i) => i.insert);
  assert.deepEqual(ins.sort(), ['map(x => x[""])', 'map(x => x["0"])', 'map(x => x["a-b"])']);
});

test('suggest: empty array', () => {
  assert.deepEqual(sug('res.items.', { items: [] }).items.map((i) => i.label), ['length', ...ARRAY_COMMON, ...ARRAY_MORE]);
});

test('suggest: string members', () => {
  const r = sug('res.name.', { name: 'Ada' });
  assert.equal(r.items[0].label, 'length');
  assert.equal(r.items[0].detail, '3');
  const methods = r.items.slice(1);
  assert.deepEqual(methods.map((i) => i.label), STRING_METHODS);
  for (const m of methods) assert.deepEqual([m.insert, m.caret, m.kind], [`${m.label}(`, m.label.length + 1, 'method']);
});

test('suggest: filtering keeps group order', () => {
  const r = sug('res.items.e', { items: [{ id: 1, email: 'a' }, { id: 2 }, { id: 3, email: 'c' }] });
  // Ungrouped items first, then each group in its own order, each ranked within itself.
  assert.equal(r.items[0].label, 'every');
  const firstGrouped = r.items.findIndex((i) => i.group);
  assert.ok(firstGrouped > 0, 'the group follows the ungrouped items');
  assert.ok(r.items.slice(firstGrouped).every((i) => i.group), `no ungrouped item after a group: ${r.items.map((i) => i.label)}`);
  assert.equal(r.items[firstGrouped].label, 'email');
});

/* ---------------- Task 2: params, argument values, browse ---------------- */

const GROUPS = {
  'Request data': ['res', 'req', 'entry', 'prev', 'next'],
  'Find entries': ['$all', '$errors', '$slow', '$status', '$endpoint', '$prev', '$next'],
  Transform: ['schema', 'diff', 'pick', 'omit', 'flatten'],
  Output: ['table', 'toTable', 'csv', 'toCSV', 'copy', '$curl', '$fetch', '$mock', '$help'],
};
const api = (o) => ({ type: 'api', ...o });
const captured = {
  statuses: [{ code: 200, count: 3 }, { code: 404, count: 1 }, { code: 500, count: 1 }],
  endpoints: [{ path: '/api/users', count: 2 }, { path: '/api/a', count: 1 }],
  durations: [],
};
const sugC = (draft, ctx = {}) => suggest(draft, draft.length, { roots: {}, variables: [], ...ctx });

test('HELPERS: groups and params', () => {
  for (const [group, names] of Object.entries(GROUPS)) {
    assert.deepEqual(HELPERS.filter((h) => h.group === group).map((h) => h.name).sort(), [...names].sort(), group);
  }
  assert.ok(HELPERS.every((h) => Object.keys(GROUPS).includes(h.group)));
  for (const h of HELPERS) {
    if (h.params) assert.equal(h.signature, `${h.name}(${h.params.map((p) => p.name).join(', ')})`, h.name);
    for (const p of h.params || []) assert.ok(p.description.length > 0 && p.description.length <= 80);
  }
  const by = (n) => HELPERS.find((h) => h.name === n);
  assert.equal(by('$status').params[0].values, 'status');
  assert.equal(by('$endpoint').params[0].values, 'endpoint');
  assert.equal(by('$slow').params[0].values, 'duration');
  assert.equal(by('$slow').signature, '$slow(ms = 1000)');
  assert.equal(by('pick').params[1].values, 'keys');
  assert.equal(by('omit').params[1].values, 'keys');
  for (const n of ['$prev', '$next', '$all', '$errors']) assert.deepEqual(by(n).params, [], n);
  for (const n of ['res', 'req', 'entry', 'prev', 'next', '$help', '$curl', '$fetch']) assert.equal(by(n).params, undefined, n);
});

test('summarizeCaptured', () => {
  const r = summarizeCaptured([
    api({ status: 200, urlPath: '/a', duration: 5 }), api({ status: 200, url: 'http://h/api/a?x=1' }), api({ status: 404, urlPath: '/a' }),
    api({ status: 500, duration: 'x' }), api({ status: 200, urlPath: '/b', duration: 7 }),
    { type: 'log', status: 200, urlPath: '/z', duration: 1 },
  ]);
  assert.deepEqual(r.statuses, [{ code: 200, count: 3 }, { code: 404, count: 1 }, { code: 500, count: 1 }]);
  assert.deepEqual(r.endpoints, [{ path: '/a', count: 2 }, { path: '/api/a', count: 1 }, { path: '/b', count: 1 }]);
  assert.deepEqual(r.durations, [5, 7]);
});

test('argumentAt: index and quote', () => {
  assert.equal(argumentAt('diff(a, ', 8).index, 1);
  const e = argumentAt("$endpoint('/api", 15);
  assert.deepEqual([e.helper.name, e.index, e.quote], ['$endpoint', 0, "'"]);
  const p = argumentAt("pick(res, ['id', '", 18);
  assert.deepEqual([p.helper.name, p.index, p.quote], ['pick', 1, "'"]);
  assert.equal(argumentAt('res.length', 10), null);
  assert.equal(argumentAt('res.map(', 8), null);
});

test('argumentAt: strings and nesting', () => {
  assert.equal(argumentAt("$endpoint('/a,b(", 16).index, 0);
  assert.equal(argumentAt("diff(a, ')', ", 13).index, 2);
  const n = argumentAt('diff(pick(res, [', 16);
  assert.deepEqual([n.helper.name, n.index], ['pick', 1]);
  assert.equal(argumentAt('diff([1,2], ', 12).index, 1);
});

test('signatureAt: params and index', () => {
  const s = signatureAt('diff(a, ', 8);
  assert.equal(s.index, 1);
  assert.deepEqual(s.params.map((p) => p.name), ['a', 'b']);
  assert.equal(s.signature, 'diff(a, b)');
});

test('suggest: $status values', () => {
  const r = sugC('$status(', { captured });
  assert.equal(r.context, 'argument');
  assert.deepEqual(r.items.map((i) => i.label), ['200', '404', '500']);
  assert.deepEqual(r.items.map((i) => i.detail), ['×3', '×1 · error', '×1 · error']);
  assert.ok(r.items.every((i) => i.kind === 'value'));
  assert.deepEqual(sugC('$status(4', { captured }).items.map((i) => i.label), ['404']);
});

test('suggest: $endpoint values', () => {
  assert.equal(sugC('$endpoint(', { captured }).items[0].insert, "'/api/users'");
  assert.equal(sugC("$endpoint('", { captured }).items[0].insert, "/api/users'");
  const r = sugC('$endpoint("/api/u', { captured });
  assert.equal(r.items[0].insert, '/api/users"');
  assert.equal(r.from, '$endpoint("'.length);
});

test('suggest: pick/omit keys', () => {
  const roots = { res: { id: 1, email: 'x' } };
  const a = sugC("pick(res, ['", { roots });
  assert.deepEqual(a.items.map((i) => i.label), ['id', 'email']);
  assert.deepEqual(a.items.map((i) => i.insert), ["id'", "email'"]);
  assert.deepEqual(sugC("pick(res, ['id', '", { roots }).items.map((i) => i.label), ['email']);
  assert.equal(sugC('pick(res, [', { roots }).items[0].insert, "'id'");
  assert.deepEqual(sugC("omit(nope, ['", { roots }).items, []);
  assert.deepEqual(sugC("pick(res, ['", { roots: { res: [{ k: 1 }, { z: 2 }] } }).items.map((i) => i.label), ['k']);
});

test('suggest: $slow values', () => {
  const s = (durations) => sugC('$slow(', { captured: { statuses: [], endpoints: [], durations } });
  let r = s([100, 250, 980, 1400, 3020]);
  assert.deepEqual(r.items.map((i) => i.label), ['500', '1000', '3020']);
  assert.deepEqual(r.items.map((i) => i.detail), ['default', 'default', 'slowest']);
  r = s(Array.from({ length: 20 }, (_, i) => (i + 1) * 10));
  assert.deepEqual(r.items.map((i) => i.label), ['500', '1000', '190', '200']);
  assert.deepEqual(r.items.map((i) => i.detail), ['default', 'default', 'p95', 'slowest']);
  assert.deepEqual(s([]).items.map((i) => i.label), ['500', '1000']);
});

test('suggest: browse', () => {
  const r = sugC('', { variables: ['temp1'], manual: true });
  assert.equal(r.context, 'browse');
  const order = [];
  for (const i of r.items) if (!order.includes(i.group)) order.push(i.group);
  assert.deepEqual(order, ['Request data', 'Find entries', 'Transform', 'Output', 'Variables']);
  assert.equal(r.items.length, HELPERS.length + 1);
  const by = (l) => r.items.find((i) => i.label === l);
  assert.deepEqual([by('pick').insert, by('pick').caret], ['pick(', 5]);
  assert.deepEqual([by('$all').insert, by('$all').caret], ['$all()', 6]);
  assert.deepEqual([by('res').insert, by('res').caret], ['res', undefined]);
  assert.equal(by('temp1').group, 'Variables');
  assert.equal(sugC('x = ', { manual: true }).context, 'browse');
  assert.equal(sugC('diff(a, b)', { manual: true }).context, 'none');
  assert.equal(sugC('foo(', { manual: true }).context, 'browse');
  const none = sugC('', {});
  assert.deepEqual([none.items, none.context], [[], 'none']);
});

test('suggest: no captured data', () => {
  const r = sugC('$status(');
  assert.deepEqual([r.items, r.context], [[], 'argument']);
});

test('fix round 1: $slow without captured data', () => {
  const r = sugC('$slow(');
  assert.deepEqual([r.items, r.context], [[], 'argument']);
});

test('fix round 1: no list inside an open string', () => {
  for (const q of ["'", '"', '`']) {
    for (const draft of [`x = ${q}hello `, `x = ${q}he`, `x = ${q}`]) {
      for (const manual of [true, false]) {
        assert.deepEqual(sugC(draft, { manual, variables: ['temp1'] }).items, [], draft);
      }
    }
  }
  assert.equal(sugC("x = 'a' + ", { manual: true }).context, 'browse');
});

test('fix round 1: hints and escaping inside strings', () => {
  const s = signatureAt("$endpoint('/api", 15);
  assert.deepEqual([s.name, s.index], ['$endpoint', 0]);
  const k = sugC("pick(res, ['", { roots: { res: { "it's": 1, 'a\\b': 2 } } });
  assert.deepEqual(k.items.map((i) => i.insert), ["it\\'s'", "a\\\\b'"]);
  const e = sugC("$endpoint('", { captured: { statuses: [], durations: [], endpoints: [{ path: "/it's", count: 1 }] } });
  assert.equal(e.items[0].insert, "/it\\'s'");
  const b = argumentAt('diff(`a,b`, `x', 14);
  assert.deepEqual([b.helper.name, b.index, b.quote], ['diff', 1, '`']);
});

/* ---------------- final fix wave ---------------- */

test('final fix: quotes inside comments do not count as open strings', () => {
  const res = { id: 1, items: [] };
  for (const draft of ["// don't\nres.", "const s = 'x' // it's\nres.", "/* it's */ res.", "/* a \"b */\nres."]) {
    assert.deepEqual(sug(draft, res).items.map((i) => i.label), ['id', 'items'], JSON.stringify(draft));
  }
  assert.ok(sugC("// don't\nsch").items.some((i) => i.label === 'schema'));
  const a = argumentAt("diff(a, // it's\n", "diff(a, // it's\n".length);
  assert.deepEqual([a.helper.name, a.index, a.quote], ['diff', 1, '']);
  const e = sugC("/* don't */ $endpoint('", { captured });
  assert.deepEqual([e.context, e.items[0].insert], ['argument', "/api/users'"]);
  // A genuinely open string still suppresses.
  for (const draft of ["x = 'abc", "// it's\nx = 'ab", "x = 'it\\'s"]) {
    for (const manual of [true, false]) assert.deepEqual(sugC(draft, { manual, variables: ['temp1'] }).items, [], draft);
  }
});

test('final fix: a finished argument does not reopen the value list', () => {
  const roots = { res: { id: 1, email: 'x' } };
  for (const draft of ['$status(200 ', '$status(404 ===', "pick(res, ['id'", "pick(res, ['id' "]) {
    const r = sugC(draft, { captured, roots });
    assert.deepEqual(r.items, [], draft);
  }
  // Still typing: the list stays.
  assert.deepEqual(sugC('$status(4', { captured }).items.map((i) => i.label), ['404']);
  assert.deepEqual(sugC("pick(res, ['id', '", { roots }).items.map((i) => i.label), ['email']);
  assert.equal(sugC('$status(404 === ', { captured }).items.length, 0);
});

test('final fix: an empty value list falls through to identifiers', () => {
  for (const draft of ['$status(r', '$endpoint(re']) {
    const r = sugC(draft, { captured, roots: { res: {}, req: {} } });
    const labels = r.items.map((i) => i.label);
    assert.ok(labels.includes('res') && labels.includes('req'), `${draft}: ${labels}`);
    assert.equal(r.context, 'identifier', draft);
  }
  // A matching value keeps the value list.
  assert.deepEqual(sugC('$status(2', { captured }).items.map((i) => i.label), ['200']);
});

test('final fix: key inserts escape control characters', () => {
  const roots = { res: { 'a\nb': 1, 't\tb': 2, 'q"\u0001': 3 } };
  const k = sugC("pick(res, ['", { roots });
  assert.deepEqual(k.items.map((i) => i.insert), ["a\\nb'", "t\\tb'", "q\"\\u0001'"]);
  const d = sugC('pick(res, ["', { roots });
  assert.deepEqual(d.items.map((i) => i.insert), ['a\\nb"', 't\\tb"', 'q\\"\\u0001"']);
  const u = sugC('pick(res, [', { roots });
  assert.deepEqual(u.items.map((i) => i.insert), ["'a\\nb'", "'t\\tb'", "'q\"\\u0001'"]);
  const b = sugC('res["', { roots });
  assert.deepEqual(b.items.map((i) => i.insert), ['a\\nb"]', 't\\tb"]', 'q\\"\\u0001"]']);
  const s = sugC("res['", { roots });
  assert.deepEqual(s.items.map((i) => i.insert), ["a\\nb']", "t\\tb']", "q\"\\u0001']"]);
  for (const item of [...k.items, ...u.items]) assert.ok([...item.insert].every((c) => c.charCodeAt(0) >= 0x20), item.insert);
  // Each insert is a valid literal of the original key.
  assert.equal(eval(`'${k.items[0].insert}`), 'a\nb');
  assert.equal(eval(`"${d.items[2].insert}`), 'q"\u0001');
  const t = sugC('$endpoint(`', { captured: { statuses: [], durations: [], endpoints: [{ path: '/a/${x}`', count: 1 }] } });
  assert.equal(eval(`\`${t.items[0].insert}`), '/a/${x}`');
});

// Spec J8: the page holds an integer past 2^53 as a BigInt (the panel's roots as a LosslessNumber).
test('J8: a LosslessNumber root reads as a bigint with no members; BigInt errors get a hint', async () => {
  const { LosslessNumber } = await import('../../src/panel/models/jsonText.ts');
  const roots = { res: { id: new LosslessNumber('9007199254740993'), name: 'x' } };
  assert.deepEqual(suggest('res.', 4, { roots, variables: [] }).items.map((i) => [i.label, i.detail]), [['id', 'bigint'], ['name', 'string']]);
  assert.deepEqual(suggest('res.id.', 7, { roots, variables: [] }).items, [], 'no "raw" member: the page value is a BigInt');
  assert.equal(resolvePath({ root: 'res', segments: ['id', 'raw'] }, roots).found, false);
  const rows = suggest('res.', 4, { roots: { res: [{ id: new LosslessNumber('9007199254740993') }] }, variables: [] });
  assert.equal(rows.items.find((i) => i.label === 'id').detail, '1/1 · bigint');
  assert.ok(suggest('r', 1, { roots: { res: new LosslessNumber('9007199254740993') }, variables: [] }).items.some((i) => i.label === 'res'));
  const hint = 'Integers past 2^53 are BigInt here (9007199254740993n): use copy(x) to copy them, Number(x) or String(x) to convert.';
  assert.equal(errorHint('Do not know how to serialize a BigInt', 'JSON.stringify(res)', true), hint);
  assert.equal(errorHint('Cannot mix BigInt and other types, use explicit conversions', 'res.id + 1', true), hint);
});

/* ---------------- Round 2, Task 3: Enter rule, ranking tiers, helper insert, `$` ---------------- */

test('issue #5: a finished identifier or value keyword argument closes the value list', () => {
  const roots = { res: { id: 1 } };
  for (const draft of ['$status(res ', '$status(true ', '$status(null ', '$status(res.id ', '$slow(x ', '$status(Number(x) ']) {
    assert.deepEqual(sugC(draft, { captured, roots }).items, [], draft);
  }
  // Still open: nothing written yet, or an operator keyword waiting for its operand.
  assert.deepEqual(sugC('$status( ', { captured }).items.map((i) => i.label), ['200', '404', '500']);
  assert.deepEqual(sugC('$status(typeof ', { captured }).items.map((i) => i.label), ['200', '404', '500']);
});

test('isCompleteCommand: brackets, strings, trailing operators and keywords', () => {
  const { isCompleteCommand } = A;
  for (const draft of ['res', 'res.us', 'res.users', 'x = 1', '$status(200)', "pick(res, ['id'])", 'a // note', 'true', 'res[""]', '`a${b}`']) {
    assert.equal(isCompleteCommand(draft), true, draft);
  }
  for (const draft of ['', '  ', '$status(', '$status(res ', 'res.', 'res[', "x = 'ab", 'a +', 'a,', 'typeof ', 'new', '/* open', 'a)', '[1, 2', 'await ', 'res?.']) {
    assert.equal(isCompleteCommand(draft), false, draft);
  }
  // Fix round 1: regex literals, template expressions, comment-only drafts.
  for (const draft of ['/\\(/.test(s)', 'x = /[)\\]]/g', 's.split(/[,;]/)', 'a / b', '(a) / 2', '// just a note', '/* c */', '`a${b}c`', '`a${`x${y}`}`', 'res.new', 'a.return', 'x++', 'x--', 'res.n++', 'a[0]--', '++x', 'x++;']) {
    assert.equal(isCompleteCommand(draft), true, draft);
  }
  for (const draft of ['`a${', '`a${`', '`a${b}', 'a /', 'x = /[)/', 'return /', '`a${ {', 'x+', 'x++ +', '++', 'x -']) {
    assert.equal(isCompleteCommand(draft), false, draft);
  }
});

test('shouldEnterAccept: the list takes Enter only for an unfinished token or a moved selection', () => {
  const { shouldEnterAccept } = A;
  const s = (draft, more = {}) => shouldEnterAccept({ listOpen: true, navigated: false, draft, caret: draft.length, ...more });
  assert.equal(s('res.us'), true, 'unfinished token: accept users');
  assert.equal(s('res.users', { exact: true }), false, 'complete command, exact token: run');
  assert.equal(s('res.users.map', { exact: true }), false);
  assert.equal(s('res.users.map', { exact: true, navigated: true }), true, 'a moved selection accepts');
  assert.equal(s('$status(', { exact: false }), true, 'incomplete command: accept');
  // Fix round 1 (spec §3): an exact token is complete, whatever the rest of the draft.
  assert.equal(s('fetch(res.url', { exact: true }), false, 'url stays url, not urlPath');
  assert.equal(s('$status(4', { exact: true }), false, 'an exact token never takes Enter');
  assert.equal(s('if (a) {\n  res.users', { exact: true }), false, 'unbalanced multi-line draft: Enter is not an accept');
  // `$` alone (the `$` gate's list) runs — page jQuery — unless the selection was moved.
  assert.equal(s('$'), false, '$ + Enter runs');
  assert.equal(s('x = $'), false);
  assert.equal(s('$', { navigated: true }), true);
  assert.equal(s('$e'), true, '$e is a token being completed');
  // Re-review M1: `$` as a member or index (keys `$ref`, `$schema`) is a token being completed.
  assert.equal(s('res.$'), true, 'res.$ accepts $ref');
  assert.equal(s('x[$'), true);
  assert.equal(s("x['$"), true);
  assert.equal(s('res?.$'), true);
  assert.equal(s('res.users', { listOpen: false, exact: true }), false, 'no list: never accept');
  assert.equal(s('res.us', { listOpen: false }), false);
});

test('rankMatch: exact > prefix > word boundary > substring > subsequence (≥ 3 chars)', () => {
  const { rankMatch } = A;
  assert.deepEqual(rankMatch('users', 'users'), { tier: 5, indices: [0, 1, 2, 3, 4] });
  assert.deepEqual(rankMatch('Ma', 'Math'), { tier: 4, indices: [0, 1] });
  assert.equal(rankMatch('Ma', 'map').tier, 4);
  assert.deepEqual(rankMatch('qSA', 'querySelectorAll'), { tier: 3, indices: [0, 5, 13] });
  assert.deepEqual(rankMatch('qsel', 'querySelector'), { tier: 3, indices: [0, 5, 6, 7] });
  assert.equal(rankMatch('id', 'userId').tier, 3);
  assert.equal(rankMatch('na', 'first_name').tier, 3);
  assert.deepEqual(rankMatch('Ma', 'schema'), { tier: 2, indices: [4, 5] });
  assert.equal(rankMatch('ma', 'email').tier, 2);
  assert.equal(rankMatch('Ma', 'meta'), null, 'no subsequence for a 2-character query');
  assert.deepEqual(rankMatch('usr', 'users'), { tier: 1, indices: [0, 1, 3] });
  assert.equal(rankMatch('xyz', 'users'), null);
  assert.deepEqual(rankMatch('', 'users'), { tier: 0, indices: [] });
  for (const [q, l] of [['Ma', 'Math'], ['Ma', 'map']]) assert.ok(rankMatch(q, l).tier > rankMatch('Ma', 'schema').tier, l);
});

test('ranking: weaker tiers are fallbacks; within a tier shorter then alphabetical', () => {
  const users = [{ id: 1, name: 'a', email: 'x', manager: null }];
  const ma = sug('res.users.ma', { users }).items.map((i) => i.label);
  // Task 4: flatMap (word boundary, from the catalogue's less common methods) follows the keys.
  assert.deepEqual(ma, ['map', 'manager', 'flatMap'], 'map and manager first; no substring noise (email)');
  // `Ma`: prefix matches push the substring-only `schema` out; captured names lead the
  // catalogue's `Map` within the prefix tier, the word-boundary `WeakMap` follows.
  const m = sugC('Ma', { variables: ['map', 'Math'] }).items.map((i) => i.label);
  assert.deepEqual(m, ['map', 'Math', 'Map', 'WeakMap']);
  assert.ok(!m.includes('schema'));
  // Only a substring match exists: it is still offered.
  assert.deepEqual(sugC('hema').items.map((i) => i.label), ['schema']);
  // Subsequence only when nothing better and the query has 3+ characters.
  assert.deepEqual(sugC('sch').items.map((i) => i.label), ['schema']);
  assert.deepEqual(sugC('shm').items.map((i) => i.label), ['schema', 'URLSearchParams'], 'subsequence: captured/helper before catalogue');
});

test('ranking: a recently accepted label leads its tier', () => {
  // Task 4: the catalogue's parseInt (word boundary `p…I`) follows the prefix tier.
  const plain = sugC('pi', { variables: ['pin'] }).items.map((i) => i.label);
  assert.deepEqual(plain, ['pin', 'pick', 'parseInt'], 'shorter first without recency');
  const recency = (label) => (label === 'pick' ? 5 : 0);
  assert.deepEqual(sugC('pi', { variables: ['pin'], recency }).items.map((i) => i.label), ['pick', 'pin', 'parseInt']);
  // Recency never lifts a weaker tier over a stronger one.
  const boosted = sugC('pic', { variables: ['epic'], recency: (l) => (l === 'epic' ? 9 : 0) }).items.map((i) => i.label);
  assert.deepEqual(boosted, ['pick']);
});

test('ranking stays fast on a large candidate list', () => {
  const variables = Array.from({ length: 500 }, (_, i) => `someLongVariableName${i}WithCamelCase`);
  const t0 = performance.now();
  for (let i = 0; i < 20; i++) sugC('sLVNWCC', { variables });
  const each = (performance.now() - t0) / 20;
  assert.ok(each <= 16, `${each.toFixed(2)} ms per keystroke`);
});

// Fix round (ruling): unit perf bounds are generous (≤ 50 ms) so load cannot flake them;
// the strict 16 ms p95 is measured in Task 9 acceptance.
// Task 7 fix round (review Minor 3): coverage instrumentation and a loaded machine slow both
// paths alike, so the bound is relative too — ≤ 50 ms, or ≤ 3× the unranked path in the same run.
test('ranking a 10,000-key object stays well within budget (median ≤ 50 ms, ≤ 150 ms under coverage, or ≤ 3× the unranked list)', () => {
  const res = {};
  for (let i = 0; i < 10000; i++) res[`fieldName${i}WithSomeCamel`] = i;
  const roots = { res };
  const median = (draft) => {
    const times = [];
    for (let i = 0; i < 15; i++) {
      const t0 = performance.now();
      suggest(draft, draft.length, { roots, variables: [] });
      times.push(performance.now() - t0);
    }
    times.sort((a, b) => a - b);
    return times[7];
  };
  // Task 9: under `npm run test:coverage` (NODE_V8_COVERAGE set) the per-character scoring loop is
  // instrumented far more than the unranked path (fNWSC measured 57–61 ms vs 6–8 ms in every full
  // coverage run since Task 7), so the absolute bound is 3× looser there; the real-extension p95 is
  // measured in the acceptance probe.
  const limit = process.env.NODE_V8_COVERAGE ? 150 : 50;
  for (const query of ['xyz', 'fNWSC', 'qq', 'f', 'fieldName99']) {
    const base = median('res.');
    const ranked = median(`res.${query}`);
    assert.ok(ranked <= limit || ranked <= 3 * base, `${query}: median ${ranked.toFixed(2)} ms (unranked ${base.toFixed(2)} ms, limit ${limit} ms)`);
  }
});

test('rankMatch: a cheap reject leaves results unchanged (case-insensitive, non-ASCII)', () => {
  const { rankMatch } = A;
  assert.equal(rankMatch('XYZ', 'fieldName1'), null);
  assert.equal(rankMatch('FNW', 'fieldNameWith').tier, 3);
  assert.deepEqual(rankMatch('éT', 'xx_étude_test'), { tier: 3, indices: [3, 4] });
  assert.deepEqual(rankMatch('éB', 'xx_étude_best'), { tier: 3, indices: [3, 9] });
  assert.equal(rankMatch('ÉTU', 'étude').tier, 4);
  assert.deepEqual(rankMatch('aB', 'xxAByy'), { tier: 3, indices: [2, 3] });
});

test('helper identifiers insert a call with the caret inside, like browse', () => {
  const by = (draft) => Object.fromEntries(sugC(draft).items.map((i) => [i.label, i]));
  const e = by('$en').$endpoint;
  assert.deepEqual([e.insert, e.caret], ['$endpoint(', 10]);
  const p = by('pic').pick;
  assert.deepEqual([p.insert, p.caret], ['pick(', 5]);
  const a = by('$al').$all;
  assert.deepEqual([a.insert, a.caret], ['$all()', 6]);
  const r = by('re').res;
  assert.deepEqual([r.insert, r.caret], ['res', undefined]);
});

test('`$` alone lists the $-helper family', () => {
  const labels = sugC('$', { variables: ['$_'] }).items.map((i) => i.label);
  assert.ok(labels.length >= 10, String(labels));
  assert.ok(labels.every((l) => l.startsWith('$')), String(labels));
  for (const name of ['$all', '$errors', '$status', '$endpoint', '$help', '$_']) assert.ok(labels.includes(name), name);
});

// Enabled by Task 4: the static catalogue offers `document` members.
test('qSA ranks querySelectorAll first (Task 4 catalogue)', () => {
  const r = suggest('document.qSA', 12, { roots: {}, variables: [] });
  assert.equal(r.items[0]?.label, 'querySelectorAll');
});

/* ---------------- Round 2, Task 4: catalogue, keywords, signatures, lambda params ---------------- */

const USERS = [
  { id: 1, name: 'Ada', email: 'ada@x', active: true, score: 9.5, manager: null, roles: ['admin'], address: { city: 'L' } },
  { id: 2, name: 'Bo', email: 'bo@x', active: false, score: 7, manager: 1, roles: [], address: { city: 'P' } },
];
const ITEM_KEYS = ['id', 'name', 'email', 'active', 'score', 'manager', 'roles', 'address'];
const resUsers = { res: { users: USERS } };
const at = (draft, roots = resUsers, more = {}) => suggest(draft, draft.length, { roots, variables: [], ...more });
const labels = (r) => r.items.map((i) => i.label);

test('catalogue members of a global: Object.ke, JSON.str, document.qu', () => {
  const keys = at('Object.ke', {}).items.find((i) => i.label === 'keys');
  assert.ok(keys, 'keys offered');
  assert.equal(keys.signature, 'keys(o)');
  assert.equal(keys.kind, 'method');
  assert.equal(keys.source, 'catalog');
  assert.ok(keys.doc.length > 0);
  assert.equal(at('Object.ke', {}).context, 'member');
  const str = at('JSON.str', {}).items[0];
  assert.deepEqual([str.label, str.signature], ['stringify', 'stringify(value, replacer?, space?)']);
  const qu = labels(at('document.qu', {}));
  assert.deepEqual(qu.slice(0, 2), ['querySelector', 'querySelectorAll']);
  assert.ok(labels(at('window.document.qu', {})).includes('querySelector'), 'window. prefix resolves the same owner');
  assert.ok(labels(at('Math.', {})).includes('PI'));
  assert.deepEqual(labels(at('nope.', {})), [], 'an unknown base offers nothing');
});

test('signature hints for catalogue functions and methods', () => {
  const f = signatureAt('fetch(', 6);
  assert.deepEqual([f.name, f.signature, f.index], ['fetch', 'fetch(input, init?)', 0]);
  assert.deepEqual(f.params.map((p) => p.name), ['input', 'init?']);
  assert.ok(f.description.length > 0);
  assert.equal(signatureAt("fetch('/a', ", 12).index, 1);
  const j = signatureAt('JSON.stringify(res, null, ', 26);
  assert.deepEqual([j.name, j.index], ['stringify', 2]);
  assert.equal(signatureAt('Object.keys(', 12).signature, 'keys(o)');
  const m = signatureAt('res.users.map(', 14, resUsers);
  assert.equal(m?.name, 'map');
  assert.match(m.signature, /^map\(callbackfn/);
  assert.equal(signatureAt('foo.map(', 8), null, 'unknown base: no hint');
  assert.equal(signatureAt('x.pick(', 7), null);
});

test('members of a captured value come from its runtime type', () => {
  const n = at('res.users[0].score.');
  assert.ok(labels(n).includes('toFixed'), labels(n).join());
  assert.equal(n.items.find((i) => i.label === 'toFixed').signature, 'toFixed(fractionDigits?)');
  const arr = labels(at('res.users.'));
  for (const m of ['reduce', 'sort', 'toSorted', 'flatMap', 'forEach', 'findIndex', 'indexOf', 'concat', 'entries']) assert.ok(arr.includes(m), m);
  const s = labels(at('res.users[0].name.'));
  for (const m of ['padStart', 'at', 'charAt', 'replaceAll', 'trimEnd']) assert.ok(s.includes(m), m);
});

test('keywords only in identifier position', () => {
  const aw = at('aw', {}).items.find((i) => i.label === 'await');
  assert.ok(aw, 'await offered');
  assert.equal(aw.kind, 'keyword');
  assert.ok(!labels(at('res.aw', { res: { a: 1 } })).includes('await'), 'not after a dot');
  assert.ok(!labels(at('Object.', {})).some((l) => l === 'typeof' || l === 'const'), 'no keyword as a member');
  assert.ok(labels(at('typ', {})).includes('typeof'));
});

test('catalogue globals in identifier position; callables insert a call', () => {
  const f = at('fet', {}).items.find((i) => i.label === 'fetch');
  assert.deepEqual([f.kind, f.insert, f.caret, f.signature, f.source], ['function', 'fetch(', 6, 'fetch(input, init?)', 'catalog']);
  const o = at('Obj', {}).items.find((i) => i.label === 'Object');
  assert.deepEqual([o.kind, o.insert], ['class', 'Object']);
  assert.equal(at('JS', {}).items.find((i) => i.label === 'JSON').kind, 'namespace');
  // Captured data and helpers lead a tier over the catalogue (source priority).
  assert.equal(labels(at('re', { res: {}, req: {} }))[0], 'req');
  assert.deepEqual(labels(at('re', { res: {}, req: {} })).slice(0, 2), ['req', 'res']);
});

test('inferLambdaParam: callback methods on a captured array', () => {
  const { inferLambdaParam } = A;
  const one = (draft) => inferLambdaParam(draft, draft.length, resUsers);
  for (const draft of ['res.users.filter(u => u.', 'res.users.map((u) => u.', 'res.users.find((u, i) => u.', 'res.users.some( u =>u', 'res.users.flatMap(u => [u.', 'res.users.findLast(u => u.']) {
    const r = one(draft);
    assert.equal(r?.param, 'u', draft);
    assert.deepEqual(Object.keys(r.sample), ITEM_KEYS, draft);
  }
  assert.equal(one('res.users.reduce((acc, u) => u.').param, 'u');
  assert.equal(one('res.users.filter(u => u.id).map(x => x.'), null, 'callee is not a plain captured path');
  assert.equal(one('res.users.filter(u => u.id) + u.'), null, 'lambda closed');
  assert.equal(one('res.users.includes(u => u.'), null, 'not a lambda-inferring method');
  assert.equal(one('nope.filter(u => u.'), null);
  // A captured `__proto__` key or parameter name stays an ordinary name.
  const proto = { res: { rows: [JSON.parse('{"__proto__": {"x": 1}, "id": 1}')] } };
  assert.deepEqual(Object.keys(inferLambdaParam('res.rows.map(r => r.', 20, proto).sample), ['__proto__', 'id']);
  assert.deepEqual(labels(at('res.rows.map(r => r.__proto__.', proto)), ['x']);
  assert.equal(inferLambdaParam('res.rows.map(__proto__ => __proto__.', 36, proto).param, '__proto__');
});

test('lambda parameters complete with the item keys', () => {
  assert.deepEqual(labels(at('res.users.filter(u => u.')), ITEM_KEYS);
  assert.deepEqual(labels(at('res.users.reduce((acc, u) => u.')), ITEM_KEYS);
  assert.deepEqual(labels(at('res.users.map(u => u.address.')), ['city']);
  assert.ok(labels(at('res.users.map(u => u.name.')).includes('toUpperCase'));
  // A lambda parameter named like a pin shadows it.
  assert.deepEqual(labels(at('res.users.map(a => a.', { ...resUsers, a: { pinned: 1 } })), ITEM_KEYS);
  // Nested: the inner callee resolves through the outer parameter.
  const nested = { res: { users: [{ roles: [{ code: 'x', level: 1 }] }] } };
  assert.deepEqual(labels(at('res.users.map(u => u.roles.filter(r => r.', nested)), ['code', 'level']);
});

test('completion latency with the catalogue merged (p95 ≤ 50 ms)', () => {
  const variables = Array.from({ length: 500 }, (_, i) => `someLongVariableName${i}WithCamelCase`);
  // Wide bodies (10,000 keys) have their own median test above; this one covers the catalogue merge.
  const items = Array.from({ length: 5000 }, (_, i) => ({ ...USERS[i % 2], id: i }));
  const roots = { res: { users: items } };
  const drafts = ['se', 'qSA', 'doc', 'document.q', 'document.qSA', 'Object.', 'JSON.str', 'res.users.', 'res.users.fi', 'res.users.filter(u => u.', 'res.users.reduce((acc, u) => u.', 'fetch(', 'aw', 'Ma', 'xyz'];
  for (const draft of drafts) {
    const times = [];
    for (let i = 0; i < 40; i++) {
      const t0 = performance.now();
      suggest(draft, draft.length, { roots, variables });
      signatureAt(draft, draft.length, roots);
      times.push(performance.now() - t0);
    }
    times.sort((a, b) => a - b);
    const p95 = times[Math.ceil(0.95 * times.length) - 1];
    assert.ok(p95 <= 50, `${draft}: p95 ${p95.toFixed(2)} ms`);
  }
});

test('Enter: a catalogue guess for a bare identifier never steals Enter (page globals such as `big`)', () => {
  const { shouldEnterAccept } = A;
  const s = (draft, more = {}) => shouldEnterAccept({ listOpen: true, navigated: false, draft, caret: draft.length, ...more });
  assert.equal(s('big', { guess: true }), false, '`big` runs, not BigInt(');
  assert.equal(s('big', { guess: true, navigated: true }), true, 'a moved selection still accepts');
  assert.equal(s('sch', { guess: false }), true, 'a helper or captured name still accepts');
  assert.equal(s('document.qu', { guess: false }), true);
});

/* ---------------- Task 4 fix round 1 ---------------- */

test('fix round: callables insert `name(` with the caret inside on every path', () => {
  const keys = at('Object.ke', {}).items.find((i) => i.label === 'keys');
  assert.deepEqual([keys.insert, keys.caret], ['keys(', 5]);
  const rnd = at('Math.ran', {}).items.find((i) => i.label === 'random');
  assert.deepEqual([rnd.insert, rnd.caret], ['random(', 7], 'zero-parameter member');
  const ac = at('AbortCon', {}).items.find((i) => i.label === 'AbortController');
  assert.deepEqual([ac.insert, ac.caret], ['AbortController', undefined], 'a class without new is a name');
  const da = at('new Da', {}).items.find((i) => i.label === 'Date');
  assert.deepEqual([da.insert, da.caret], ['Date(', 5], 'a class after new is a call');
  const ab = at('new AbortCon', {}).items.find((i) => i.label === 'AbortController');
  assert.deepEqual([ab.insert, ab.caret], ['AbortController(', 16]);
  const q = at('queueMic', {}).items.find((i) => i.label === 'queueMicrotask');
  assert.deepEqual([q.insert, q.caret], ['queueMicrotask(', 15]);
});

test('fix round: arrow parameters shadow pins even when not bound to the item', () => {
  const roots = { ...resUsers, a: { pinned: 1 } };
  for (const draft of ['res.users.sort((a, b) => a.', 'res.users.map((u, a) => a.', 'res.users.reduce((a, u) => a.', 'res.users.map(({a}) => a.', 'res.users.map(({id: a}) => a.', 'foo((x, a) => a.', 'foo(x, async a => a.']) {
    assert.ok(!labels(at(draft, roots)).includes('pinned'), draft);
  }
  // `a` is not a parameter of `({id}) =>`: it is the pin.
  assert.deepEqual(labels(at('res.users.map(({id}) => a.', roots)), ['pinned']);
  // The callee resolves before its own parameters hide names (`res => res.` binds the item).
  assert.deepEqual(labels(at('res.users.map(res => res.')), ITEM_KEYS);
  // sort/toSorted comparators take the item shape.
  assert.deepEqual(labels(at('res.users.sort((a, b) => a.', roots)), ITEM_KEYS);
  assert.deepEqual(labels(at('res.users.toSorted((x, y) => y.', roots)), ITEM_KEYS);
  // Three-parameter heads bind the item.
  assert.deepEqual(labels(at('res.users.map((x, i, arr) => x.')), ITEM_KEYS);
  // A pin outside any arrow still completes.
  assert.deepEqual(labels(at('a.', roots)), ['pinned']);
});

test('fix round: signature hints for rest parameters and enclosing calls', () => {
  const m = signatureAt('Math.max(1, 2, ', 15);
  assert.deepEqual([m.name, m.params.length, m.index], ['max', 1, 0], 'clamped to the ...values param');
  const l = signatureAt('console.log(a, b, ', 18);
  assert.deepEqual([l.name, l.index], ['log', 0]);
  const t = signatureAt('setTimeout(f, 10, a, b, ', 24);
  assert.deepEqual([t.name, t.index], ['setTimeout', 2], 'clamped to ...arguments');
  const f = signatureAt('fetch(foo(a, ', 13);
  assert.deepEqual([f?.name, f?.index], ['fetch', 0], 'unknown inner call: the enclosing call');
  const h = signatureAt('pick(foo(a, ', 12);
  assert.deepEqual([h?.name, h?.index], ['pick', 0], 'enclosing helper');
  assert.equal(signatureAt('foo(bar(', 8), null);
});

test('fix round: no suggestions inside comments', () => {
  for (const draft of ['// aw', 'x = 1 // fet', '/* aw', '/* JSON.str', 'res. // aw']) {
    for (const manual of [false, true]) assert.deepEqual(at(draft, resUsers, { manual }).items, [], draft);
  }
  assert.ok(labels(at('/* c */ aw', {})).includes('await'), 'after a closed block comment');
  assert.ok(labels(at('// c\naw', {})).includes('await'), 'on the line after a line comment');
});

test('fix round: members for performance, crypto, history, Reflect and HTML elements', () => {
  const has = (draft, names) => { const l = labels(at(draft, {})); for (const n of names) assert.ok(l.includes(n), `${draft} ${n}: ${l}`); };
  has('performance.', ['now', 'mark', 'measure', 'getEntriesByType']);
  has('crypto.', ['randomUUID', 'getRandomValues', 'subtle']);
  has('history.', ['back', 'forward', 'go', 'pushState', 'replaceState', 'state', 'length']);
  has('Reflect.', ['ownKeys', 'get', 'has', 'apply']);
  has('document.body.', ['innerText', 'style', 'dataset', 'click', 'focus', 'blur', 'value', 'hidden', 'title']);
  has('window.performance.', ['now']);
});

test('catalogue detail: the return type, else the owner — never the kind again (Task 5 fix round 1)', () => {
  const roots = { res: { users: [{ id: 1 }] } };
  const find = suggest('res.users.fi', 12, { roots, variables: [] }).items.find((i) => i.label === 'find');
  assert.equal(find.detail, 'Array', 'Array.prototype member without a return type');
  const json = suggest('JSON.str', 8, { roots: {}, variables: [] }).items.find((i) => i.label === 'stringify');
  assert.equal(json.detail, 'string', 'a return type wins');
  const obj = suggest('Objec', 5, { roots: {}, variables: [] }).items.find((i) => i.label === 'Object');
  assert.equal(obj.detail, 'global', 'a global without a return type');
  const kw = suggest('awai', 4, { roots: {}, variables: [] }).items.find((i) => i.label === 'await');
  assert.equal(kw.detail, 'keyword');
});

/* ---------- Task 7 (spec §3 source 4): live page names merged into the list ---------- */

test('liveRequestFor: what to ask the page — a non-captured plain path, a lambda item, or the globals; never a call or captured data', () => {
  const { liveRequestFor } = A;
  const roots = { res: { users: [{ id: 1 }] }, a: { x: 1 } };
  const at = (draft) => liveRequestFor(draft, draft.length, roots);
  assert.deepEqual(at('appState.'), { expr: 'appState' });
  assert.deepEqual(at('appState.us'), { expr: 'appState' });
  assert.deepEqual(at('x = window.appState.user.n'), { expr: 'window.appState.user' });
  assert.deepEqual(at('rows[0]["a b"].'), { expr: 'rows[0]["a b"]' });
  assert.deepEqual(at('document.'), { expr: 'document' }, 'catalogue globals still merge the page\'s own names');
  assert.deepEqual(at('rows.filter(r => r.'), { expr: 'rows[0]' }, 'a lambda parameter is the array\'s first item');
  assert.deepEqual(at('rows.map(r => r.tags.map(t => t.'), { expr: 'rows[0].tags[0]' });
  assert.deepEqual(at('rows.reduce((acc, r) => r.'), { expr: 'rows[0]' });
  assert.deepEqual(at('formatP'), { expr: null }, 'a bare identifier: the page globals');
  assert.deepEqual(at('window.'), { expr: null }, 'the global object\'s members are the globals');
  for (const draft of ['res.', 'res.users.filter(u => u.', 'a.', 'document.querySelector("a").', 'fetch(u).', 'JSON.parse(x).', '"appState.', '// appState.', 'appState.user + 1', '', '12', 'x.y?.']) {
    assert.equal(at(draft), null, draft);
  }
});

const live = (extra = {}) => ({
  members: null,
  globals: [
    { name: 'appState', kind: 'property', own: true },
    { name: 'formatPrice', kind: 'function', own: true, params: "(cents, currency = 'EUR')" },
    { name: 'fetch', kind: 'function', own: true },
    { name: 'Widget', kind: 'class', own: true },
  ],
  declared: [{ name: 'rows', kind: 'const' }, { name: 'helperFn', kind: 'function' }],
  ...extra,
});

test('suggest: live members for the path being completed — callables insert `name(`, getters are named, stale lists are ignored', () => {
  const members = { expr: 'appState', names: [
    { name: 'user', kind: 'property', own: true },
    { name: 'lazy', kind: 'getter', own: true },
    { name: 'save', kind: 'function', own: true, params: '(id, opts)' },
    { name: 'toString', kind: 'function', own: false },
  ] };
  const out = suggest('appState.', 9, { roots: {}, variables: [], live: live({ members }) });
  assert.equal(out.context, 'member');
  assert.deepEqual(out.items.map((i) => i.label), ['user', 'lazy', 'save', 'toString']);
  assert.ok(out.items.every((i) => i.source === 'live'));
  const save = out.items.find((i) => i.label === 'save');
  assert.deepEqual([save.insert, save.caret, save.signature, save.kind], ['save(', 5, 'save(id, opts)', 'method']);
  assert.equal(out.items.find((i) => i.label === 'lazy').detail, 'getter');
  assert.equal(out.items.find((i) => i.label === 'toString').insert, 'toString(');
  // The list answers `appState`, not `other`: nothing from it is offered there.
  assert.deepEqual(suggest('other.', 6, { roots: {}, variables: [], live: live({ members }) }).items, []);
});

// Final review M-1: Object.prototype's legacy accessor names flood every live member list. They are
// hidden unless the typed prefix starts with "_" (then they rank as usual); captured keys are never hidden.
test('suggest: legacy __x__ names from the page are hidden unless the prefix starts with "_"', () => {
  const legacy = ['__defineGetter__', '__defineSetter__', '__lookupGetter__', '__lookupSetter__', '__proto__'];
  const members = { expr: 'appState', names: [
    { name: 'user', kind: 'property', own: true },
    ...legacy.map((name) => ({ name, kind: 'function', own: false })),
    { name: 'hasOwnProperty', kind: 'function', own: false },
  ] };
  const labels = (text, extra = {}) => suggest(text, text.length, { roots: {}, variables: [], live: live({ members, ...extra }) }).items.map((i) => i.label);
  assert.deepEqual(labels('appState.'), ['user', 'hasOwnProperty']);
  assert.deepEqual(labels('appState.de'), [], 'a fuzzy match does not bring them back');
  assert.ok(labels('appState._').includes('__defineGetter__'));
  assert.deepEqual(labels('appState.__look'), ['__lookupGetter__', '__lookupSetter__']);
  // The page globals (window inherits Object.prototype) and a native the catalogue lacks.
  const globals = [...live().globals, { name: '__defineGetter__', kind: 'function', own: false, native: true }, { name: '__app__', kind: 'property', own: true }];
  assert.equal(labels('def', { globals }).includes('__defineGetter__'), false);
  assert.equal(labels('ap', { globals }).includes('__app__'), false);
  assert.ok(labels('__', { globals }).includes('__app__'));
  // Captured data keys are the user's: shown as they are.
  const roots = { res: { __meta__: 1, id: 2 } };
  assert.ok(suggest('res.', 4, { roots, variables: [] }).items.some((i) => i.label === '__meta__'));
});

test('suggest: live names merge into the catalogue (no duplicates); a primitive lists its prototype; a lambda item lists its keys', () => {
  const doc = { expr: 'document', names: [{ name: 'querySelector', kind: 'function', own: false }, { name: 'myAppHook', kind: 'property', own: true }] };
  const labels = suggest('document.', 9, { roots: {}, variables: [], live: live({ members: doc }) }).items.map((i) => i.label);
  assert.equal(labels.filter((l) => l === 'querySelector').length, 1);
  assert.ok(labels.includes('myAppHook'));
  assert.equal(suggest('document.q', 10, { roots: {}, variables: [], live: live({ members: doc }) }).items.find((i) => i.label === 'querySelector').source, 'catalog', 'the catalogue entry (doc, signature) stays');
  const str = suggest('appState.user.name.toUp', 23, { roots: {}, variables: [], live: live({ members: { expr: 'appState.user.name', names: [], type: 'string' } }) });
  assert.equal(str.items[0]?.label, 'toUpperCase');
  const item = { expr: 'rows[0]', names: [{ name: 'id', kind: 'property', own: true }, { name: 'name', kind: 'property', own: true }] };
  const keys = suggest('rows.filter(r => r.', 19, { roots: {}, variables: [], live: live({ members: item }) });
  assert.deepEqual(keys.items.map((i) => i.label).slice(0, 2), ['id', 'name']);
});

test('suggest: bare identifiers offer declared names and page globals (formatP → formatPrice(cents, currency = \'EUR\'))', () => {
  const out = suggest('formatP', 7, { roots: {}, variables: [], live: live() });
  const top = out.items[0];
  assert.deepEqual([top.label, top.insert, top.signature, top.source, top.kind], ['formatPrice', 'formatPrice(', "formatPrice(cents, currency = 'EUR')", 'live', 'function']);
  const rows = suggest('ro', 2, { roots: {}, variables: [], live: live() }).items.find((i) => i.label === 'rows');
  assert.deepEqual([rows.source, rows.kind, rows.detail], ['declared', 'variable', 'const']);
  assert.equal(suggest('helperF', 7, { roots: {}, variables: [], live: live() }).items[0].insert, 'helperFn(');
  const fetches = suggest('fetc', 4, { roots: {}, variables: [], live: live() }).items.filter((i) => i.label === 'fetch');
  assert.deepEqual(fetches.map((i) => i.source), ['catalog'], 'a page global the catalogue knows is listed once');
  assert.equal(suggest('new Widg', 8, { roots: {}, variables: [], live: live() }).items[0].insert, 'Widget(');
  // Source priority within a tier: declared > live > catalogue.
  const mixed = suggest('ap', 2, { roots: {}, variables: [], live: live({ declared: [{ name: 'apX', kind: 'let' }] }) }).items.map((i) => i.source);
  assert.deepEqual(mixed.slice(0, 2), ['declared', 'live']);
  assert.ok(suggest('window.form', 11, { roots: {}, variables: [], live: live() }).items.some((i) => i.label === 'formatPrice'), 'window. lists the globals');
});

test('call results chain through the catalogue\'s return types, never the page (ruling)', () => {
  const labels = (draft) => suggest(draft, draft.length, { roots: {}, variables: [] }).items.map((i) => i.label);
  assert.ok(labels("document.querySelector('a').").includes('getAttribute'));
  assert.ok(labels('fetch(u).').includes('then'), 'Promise<Response>');
  assert.ok(labels("document.querySelector('a').closest('b').").includes('getAttribute'));
  assert.ok(labels('new URL(x).').includes('searchParams'));
  assert.deepEqual(labels('JSON.parse(x).'), [], 'no declared return type: nothing');
  assert.deepEqual(labels('mystery(x).'), []);
});

test('catalogGuess: a catalogue name for a bare identifier keeps Enter only while the typed name could be a page global', () => {
  const { catalogGuess } = A;
  const cat = { label: 'fetch', source: 'catalog' };
  assert.equal(catalogGuess(cat, 'identifier', 'fet', null), true, 'page globals unknown: `fet` may be one, Enter runs it');
  assert.equal(catalogGuess(cat, 'identifier', 'fet', live({ complete: true })), false, 'known and `fet` is not one: Enter accepts fetch(');
  // Fix round 1 (review Important 1): stale (a Run since), partial or capped globals are unknown.
  assert.equal(catalogGuess(cat, 'identifier', 'fet', live()), true, 'not marked complete: unknown');
  assert.equal(catalogGuess(cat, 'identifier', 'big', live({ complete: false })), true, '`big` declared since the snapshot: Enter runs it');
  assert.equal(catalogGuess(cat, 'identifier', 'appState', live()), true, 'a page global runs');
  assert.equal(catalogGuess(cat, 'identifier', 'rows', live()), true, 'a declared name runs');
  assert.equal(catalogGuess({ label: 'formatPrice', source: 'live' }, 'identifier', 'formatP', live()), false);
  assert.equal(catalogGuess(cat, 'member', 'fet', null), false);
});

test('errorHint: did-you-mean also searches declared names and the page globals (apState → appState)', () => {
  assert.equal(errorHint('apState is not defined', 'apState.user', true, ['appState', 'rows']), 'Did you mean `appState`?');
  assert.equal(errorHint('rws is not defined', 'rws.length', true, ['appState', 'rows']), 'Did you mean `rows`?');
  assert.equal(errorHint('apState is not defined', 'apState.user', true), null, 'without them, no guess');
});

test('signatureAt: a page function shows its own parameter list (spec §3 signature hints)', () => {
  const hint = signatureAt('formatPrice(100, ', 17, {}, live());
  assert.deepEqual([hint?.signature, hint?.index, hint?.params.map((p) => p.name)], ["formatPrice(cents, currency = 'EUR')", 1, ['cents', "currency = 'EUR'"]]);
  assert.equal(signatureAt('formatPrice(', 12, {}), null, 'unknown without the page globals');
  assert.equal(signatureAt('fetch(', 6, {}, live())?.signature, 'fetch(input, init?)', 'the catalogue entry wins');
});

test('a built-in the catalogue does not list ranks with the catalogue, below the page\'s own names (fet → fetch before fetchLater)', () => {
  const k = live({ globals: [{ name: 'fetchLater', kind: 'function', own: true, native: true }, { name: 'fetchRows', kind: 'function', own: true }] });
  const items = suggest('fet', 3, { roots: {}, variables: [], live: k }).items;
  assert.deepEqual(items.slice(0, 3).map((i) => [i.label, i.source]), [['fetchRows', 'live'], ['fetch', 'catalog'], ['fetchLater', 'catalog']]);
});

test('suggest: a path that stops at a getter says so in one quiet note (not evaluated), never an empty silence', () => {
  const out = suggest('acc.z.', 6, { roots: {}, variables: [], live: live({ members: { expr: 'acc.z', names: [], getter: true } }) });
  assert.deepEqual([out.items, out.note], [[], 'getter — not evaluated']);
  assert.equal(suggest('acc.', 4, { roots: {}, variables: [], live: live({ members: { expr: 'acc', names: [] } }) }).note, undefined);
});
