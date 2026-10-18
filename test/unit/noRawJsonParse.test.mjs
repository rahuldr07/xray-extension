/* Source scan: no JSON.parse on captured bodies in src/panel outside models/jsonText.ts.
 *
 * Spec docs/superpowers/specs/2026-10-14-json-fidelity-design.md §1 "One parser": every view, search,
 * diff and export reads captured text through the lossless parser. This test finds every reference to
 * JSON.parse in src/panel (calls, `JSON['parse']`, `const { parse } = JSON`, `globalThis.JSON.parse`)
 * with the TypeScript parser, so comments and strings never count, and fails on any site that is not
 * listed below.
 *
 * Entries are matched by file + a short snippet of the source line (line numbers drift), and each
 * entry covers exactly one site. An entry whose site is gone fails too, so the lists only shrink:
 * the plan's Tasks 5–9 delete their PENDING entries as they move each site onto jsonText.ts.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const PANEL = join(ROOT, 'src', 'panel');
const PARSER = 'src/panel/models/jsonText.ts';

// Sites that still parse captured bodies (or text derived from them) with JSON.parse, each with the
// plan task that moves it onto parseJson/toValue (routing ruled in progress.md). Empty since Task 9
// moved the last ones (share-safe body redaction, AI prompt body fields, the experiment plan body).
const PENDING = [];

// Sites that parse text which is not a captured body. They stay.
const PERMANENT = [
  { file: 'src/panel/models/customTheme.ts', snippet: 'JSON.parse(b64decode(s))', why: 'theme share code pasted by the user' },
  { file: 'src/panel/models/customTheme.ts', snippet: 'JSON.parse(input)', why: 'theme JSON pasted by the user' },
  { file: 'src/panel/models/rules.ts', snippet: 'raw = JSON.parse(input);', why: 'rule set imported by the user' },
  {
    file: 'src/panel/models/import.ts',
    snippet: 'parsed = JSON.parse(text);',
    why: 'session/HAR file container chosen by the user; bodies inside it are strings',
  },
];

/**
 * Every JSON.parse reference in one source file: [{ line, text }] (1-based line as TypeScript counts
 * lines, trimmed source line). Sees through parentheses and type assertions, follows aliases of JSON
 * (`const J = JSON`, `K = J`) and destructuring (`const { parse } = JSON`, `({ parse } = JSON)`,
 * `function f({ parse } = JSON)`). Scope-blind on purpose: a guard may over-report, never under-report.
 */
function findJsonParseSites(source, fileName) {
  if (!source.includes('JSON') || !source.includes('parse')) return [];
  const kind = fileName.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const file = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, kind);
  const starts = file.getLineStarts();
  const lineText = (line) => source.slice(starts[line], starts[line + 1] ?? source.length).trim();
  const unwrap = (node) => {
    while (
      ts.isParenthesizedExpression(node) ||
      ts.isAsExpression(node) ||
      ts.isNonNullExpression(node) ||
      ts.isTypeAssertionExpression(node) ||
      ts.isSatisfiesExpression(node)
    ) {
      node = node.expression;
    }
    return node;
  };
  const aliases = new Set(['JSON']);
  const isJson = (expression) => {
    const node = unwrap(expression);
    if (ts.isIdentifier(node)) return aliases.has(node.text);
    if (ts.isPropertyAccessExpression(node)) return node.name.text === 'JSON'; // globalThis.JSON, window.JSON
    return ts.isElementAccessExpression(node) && ts.isStringLiteralLike(node.argumentExpression) && node.argumentExpression.text === 'JSON';
  };
  const isAssignment = (node) => ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken;
  const named = (name, text) => !!name && (ts.isIdentifier(name) || ts.isStringLiteralLike(name)) && name.text === text;

  // Aliases of JSON, to a fixed point.
  for (let grew = true; grew; ) {
    grew = false;
    const collect = (node) => {
      let alias;
      if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer && isJson(node.initializer)) alias = node.name.text;
      else if (isAssignment(node) && ts.isIdentifier(node.left) && isJson(node.right)) alias = node.left.text;
      if (alias && !aliases.has(alias)) {
        aliases.add(alias);
        grew = true;
      }
      ts.forEachChild(node, collect);
    };
    collect(file);
  }

  const sites = [];
  const record = (node) => {
    const line = file.getLineAndCharacterOfPosition(node.getStart(file)).line;
    sites.push({ line: line + 1, text: lineText(line) });
  };
  const visit = (node) => {
    if (ts.isPropertyAccessExpression(node) && node.name.text === 'parse' && isJson(node.expression)) {
      record(node);
    } else if (ts.isElementAccessExpression(node) && named(node.argumentExpression, 'parse') && isJson(node.expression)) {
      record(node);
    } else if (
      (ts.isVariableDeclaration(node) || ts.isParameter(node) || ts.isBindingElement(node)) &&
      node.initializer &&
      isJson(node.initializer) &&
      ts.isObjectBindingPattern(node.name)
    ) {
      for (const element of node.name.elements) if (named(element.propertyName ?? element.name, 'parse')) record(element);
    } else if (isAssignment(node) && ts.isObjectLiteralExpression(unwrap(node.left)) && isJson(node.right)) {
      for (const property of unwrap(node.left).properties) if (named(property.name, 'parse')) record(property);
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  return sites;
}

function panelSources() {
  const files = [];
  const walk = (dir) => {
    for (const item of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, item.name);
      if (item.isDirectory()) walk(path);
      else if (/\.tsx?$/.test(item.name)) files.push(relative(ROOT, path).split(sep).join('/'));
    }
  };
  walk(PANEL);
  return files.sort();
}

test('the scanner finds every spelling of JSON.parse and ignores comments and strings', () => {
  const source = [
    'const a = JSON.parse(x);',
    '// JSON.parse(commented)',
    '/* JSON.parse(block) */',
    'const s = "JSON.parse(in a string)";',
    'const b = JSON["parse"](y);',
    'const { parse } = JSON;',
    'const { parse: p2 } = JSON;',
    'const c = globalThis.JSON.parse(z);',
    'const fn = JSON.parse;',
    'const d = myJSON.parse(w);',
    'const e = JSON.stringify(v);',
    'const t = `${JSON.parse(tpl)}`;',
  ].join('\n');
  assert.deepEqual(
    findJsonParseSites(source, 'probe.ts').map((site) => site.line),
    [1, 5, 6, 7, 8, 9, 12],
  );
  assert.equal(findJsonParseSites("const el = <div>{JSON.parse(x)}</div>;", "probe.tsx").length, 1);
});

test('the scanner sees through parentheses, type assertions, aliases and destructuring', () => {
  const source = [
    'const a = (JSON).parse(x);',
    'const b = (JSON as any).parse(x);',
    'const c = JSON!.parse(x);',
    'const d = (<any>JSON).parse(x);',
    'const e = (JSON satisfies typeof JSON).parse(x);',
    'const J = JSON;',
    'const f = J.parse(x);',
    'const g = J["parse"](x);',
    'let K; K = J;',
    'const h = K.parse(x);',
    '({ parse } = JSON);',
    'function p({ parse: q } = JSON) { return q; }',
    'const i = window.JSON.parse(x);',
    'const j = globalThis["JSON"].parse(x);',
    'const k = JSON?.parse(x);',
    'const notJson = { parse: () => 1 }; notJson.parse(x);',
  ].join('\n');
  assert.deepEqual(
    findJsonParseSites(source, 'probe.ts').map((site) => site.line),
    [1, 2, 3, 4, 5, 7, 8, 10, 11, 12, 13, 14, 15],
  );
});

test('scanner lines follow TypeScript line starts (U+2028, lone CR) without crashing', () => {
  const source = 'const s = "a\u2028b";\rconst x = JSON.parse(y);\u2029const z = 1;';
  assert.deepEqual(findJsonParseSites(source, 'probe.ts'), [{ line: 3, text: 'const x = JSON.parse(y);' }]);
});

test('the lossless parser module exists and is the one place allowed to parse JSON text', () => {
  assert.ok(existsSync(join(ROOT, PARSER)), `${PARSER} is missing`);
  assert.match(readFileSync(join(ROOT, PARSER), 'utf8'), /export function parseJson\(/);
});

test('no JSON.parse in src/panel outside jsonText.ts except the documented allowlist', () => {
  const allow = [...PENDING, ...PERMANENT].map((item) => ({ ...item, used: false }));
  const unlisted = [];
  for (const file of panelSources()) {
    if (file === PARSER) continue;
    for (const site of findJsonParseSites(readFileSync(join(ROOT, file), 'utf8'), file)) {
      const match = allow.find((item) => !item.used && item.file === file && site.text.includes(item.snippet));
      if (match) match.used = true;
      else unlisted.push(`${file}:${site.line}  ${site.text}`);
    }
  }
  assert.deepEqual(
    unlisted,
    [],
    'Parse captured text with parseJson()/toValue() from src/panel/models/jsonText.ts instead ' +
      '(or, for text that is not a captured body, add a PERMANENT entry with the reason).',
  );
  const stale = allow.filter((item) => !item.used).map((item) => `${item.file}  ${item.snippet}`);
  assert.deepEqual(stale, [], 'These allowlist entries no longer match a JSON.parse site: delete them.');
});

test('every pending entry names its owner and site', () => {
  for (const item of PENDING) {
    assert.match(item.owner, /^Task [5-9]$/, item.file);
    assert.ok(item.site, item.file);
  }
  for (const item of PERMANENT) assert.ok(item.why, item.file);
});
