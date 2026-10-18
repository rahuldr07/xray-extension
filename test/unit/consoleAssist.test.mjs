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

test('suggest: object properties; arrays get index, length, methods, keys', () => {
  const r = suggest('res.users[0].em', 15, { roots: { res: { users: [{ email: 'x', emailOk: true, id: 1 }] } }, variables: [] });
  assert.equal(r.from, 13);
  assert.deepEqual(r.items.map((i) => i.label), ['email', 'emailOk']);
  assert.deepEqual(r.items.map((i) => i.detail), ['string', 'boolean']);
  const arr = suggest('res.', 4, { roots: { res: [{ id: 1 }] }, variables: [] });
  assert.deepEqual(arr.items.map((i) => i.label), ['[0]', 'length', 'map', 'filter', 'find', 'some', 'every', 'includes', 'slice', 'join', 'at', 'id']);
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
  for (const code of ['', 'x = 0x1F + 1.5e3 /* a\nb */ + `t${1}', '"unterminated', "it's\n'ok'", 'a?.b ?? 3n', 'é\u{1F600} \t\r\n']) {
    assert.equal(tokenize(code).map((t) => t.text).join(''), code, JSON.stringify(code));
  }
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
  assert.deepEqual([p.map.insert, p.map.caret, p.includes.insert, p.includes.caret, p.join.insert, p.join.caret], ['map(x => x)', 10, 'includes()', 9, 'join()', 5]);
  for (const m of ['map', 'filter', 'find', 'some', 'every', 'includes', 'slice', 'join', 'at']) assert.equal(p[m].kind, 'method', m);
});

test('suggest: union keys and coverage', () => {
  const r = sug('res.items.', { items: [{ id: 1, email: 'a' }, { id: 2 }, { id: 3, email: 'c' }] });
  const keys = r.items.filter((i) => i.group);
  assert.deepEqual(keys.map((i) => [i.label, i.detail]), [['id', '3/3 · number'], ['email', '2/3 · string']]);
  assert.ok(keys.every((i) => i.group === 'keys across 3 items'));
});

test('suggest: union skips non-objects', () => {
  const r = sug('res.items.', { items: [{ a: 1 }, null, 3, { a: 2, b: 1 }] });
  const keys = r.items.filter((i) => i.group);
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
  assert.deepEqual([...new Set(r.items.filter((i) => i.group).map((i) => i.group))], ['keys across first 1,000 items']);
  assert.equal(r.items.find((i) => i.label === 'id').group, 'keys across first 1,000 items');
  assert.ok(elapsed <= 500, String(elapsed));
});

test('suggest: non-identifier keys', () => {
  const r = sug('res.items.', { items: [{ '': 1, '0': 2, 'a-b': 3 }] });
  const ins = r.items.filter((i) => i.group).map((i) => i.insert);
  assert.deepEqual(ins.sort(), ['map(x => x[""])', 'map(x => x["0"])', 'map(x => x["a-b"])']);
});

test('suggest: empty array', () => {
  assert.deepEqual(sug('res.items.', { items: [] }).items.map((i) => i.label), ['length', 'map', 'filter', 'find', 'some', 'every', 'includes', 'slice', 'join', 'at']);
});

test('suggest: string members', () => {
  const r = sug('res.name.', { name: 'Ada' });
  assert.equal(r.items[0].label, 'length');
  assert.equal(r.items[0].detail, '3');
  const methods = r.items.slice(1);
  assert.deepEqual(methods.map((i) => i.label), ['includes', 'startsWith', 'endsWith', 'slice', 'split', 'trim', 'toLowerCase', 'toUpperCase', 'replace', 'match']);
  for (const m of methods) assert.deepEqual([m.insert, m.caret, m.kind], [`${m.label}()`, m.label.length + 1, 'method']);
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
