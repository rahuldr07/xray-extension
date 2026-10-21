// Classifies one SQL statement as read, write or dangerous from the lang-sql
// parse tree. A read-only connection refuses everything but `read`, and
// `dangerous` statements need a confirmation. When unsure this errs towards
// the stricter answer. Pure; no React.
import { splitStatements, sqlLanguage } from './sqlStatements';
import type { SqlDialect } from './sqlTypes';

export type StatementKind = 'read' | 'write' | 'dangerous';

export interface Classification {
  kind: StatementKind;
  reason: string;
}

interface Tok {
  word: string; // lower-case; '' for non-word tokens
  text: string;
  depth: number;
}

const DANGEROUS = new Set(['drop', 'truncate', 'alter', 'grant', 'revoke']);
const WRITE = new Set([
  'insert', 'update', 'delete', 'replace', 'merge', 'create', 'attach', 'detach', 'vacuum',
  'reindex', 'copy', 'call', 'do', 'set', 'reset', 'lock',
]);
const READ = new Set(['select', 'with', 'values', 'explain', 'pragma', 'show', 'describe', 'desc', 'table']);
// Words that can follow EXPLAIN before the statement it wraps.
const EXPLAIN_OPTIONS = new Set([
  'analyze', 'analyse', 'verbose', 'query', 'plan', 'costs', 'buffers', 'timing', 'summary',
  'format', 'json', 'text', 'xml', 'yaml', 'true', 'false', 'on', 'off', 'settings', 'wal',
]);
// Statements that start a CTE's main body.
const CTE_BODY = new Set(['select', 'values', 'insert', 'update', 'delete', 'replace', 'merge', 'table']);
// PRAGMAs that take an argument but only read.
const READ_PRAGMAS = new Set([
  'table_info', 'table_xinfo', 'table_list', 'index_list', 'index_info', 'index_xinfo',
  'foreign_key_list', 'foreign_key_check', 'integrity_check', 'quick_check', 'function_list',
  'collation_list', 'database_list', 'compile_options', 'pragma_list', 'module_list',
]);
// Used to catch a typo of a statement keyword (`selec`), which is not safe to guess at.
const KNOWN_FIRST = [...DANGEROUS, ...WRITE, ...READ, 'begin', 'commit', 'rollback', 'savepoint', 'release'];

// Bare PRAGMAs (no `=`, no argument) that only report a value. Any other bare
// pragma can act (optimize, wal_checkpoint, incremental_vacuum ...).
const READ_BARE_PRAGMAS = new Set([
  'table_info', 'table_xinfo', 'index_list', 'index_info', 'index_xinfo', 'foreign_key_list',
  'database_list', 'collation_list', 'function_list', 'module_list', 'pragma_list', 'compile_options',
  'schema_version', 'user_version', 'application_id', 'page_count', 'page_size', 'freelist_count',
  'encoding', 'journal_mode', 'foreign_keys', 'query_only', 'integrity_check', 'quick_check',
  'foreign_key_check', 'data_version',
]);

const COULD_NOT_PARSE: Classification = { kind: 'dangerous', reason: 'could not parse' };

function editDistance(a: string, b: string): number {
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length];
}

function isTypoOfKeyword(word: string): boolean {
  return word.length >= 4 && KNOWN_FIRST.some((k) => k.length >= 4 && editDistance(word, k) <= 2);
}

// Tokens of the first statement, or null when the parser hit an error.
function tokenize(text: string, dialect: SqlDialect): Tok[] | null {
  const tree = sqlLanguage(dialect).language.parser.parse(text);
  let end = -1;
  const cursor = tree.cursor();
  if (cursor.firstChild()) {
    do {
      if (cursor.name === 'Statement') {
        end = cursor.to;
        break;
      }
    } while (cursor.nextSibling());
  }
  const toks: Tok[] = [];
  let failed = false;
  let depth = 0;
  tree.iterate({
    enter(node) {
      if (failed) return false;
      if (end >= 0 && node.from >= end) return false;
      if (node.type.isError) {
        failed = true;
        return false;
      }
      if (node.name === 'Parens') {
        depth++;
        return;
      }
      if (node.name === 'Script' || node.name === 'Statement') return;
      const s = text.slice(node.from, node.to);
      if (/^[A-Za-z_][A-Za-z_0-9]*$/.test(s)) toks.push({ word: s.toLowerCase(), text: s, depth });
      else if (/^\s*$/.test(s) || /^(--|\/\*|#)/.test(s)) return;
      else toks.push({ word: '', text: s, depth });
    },
    leave(node) {
      if (node.name === 'Parens') depth--;
    },
  });
  if (failed) return null;
  // The grammar tolerates an unclosed `(`; a statement like that would not run.
  const opens = toks.filter((t) => t.text === '(').length;
  const closes = toks.filter((t) => t.text === ')').length;
  if (opens !== closes) return null;
  // Parens delimiters themselves were tokenized at the paren's own depth; drop them.
  return toks.filter((t) => t.text !== '(' && t.text !== ')');
}

function classifyOne(text: string, dialect: SqlDialect): Classification {
  const toks = tokenize(text, dialect);
  if (!toks || toks.length === 0) return COULD_NOT_PARSE;
  const words = toks.filter((t) => t.word);
  const first = words[0];
  if (!first || toks[0] !== first) {
    // Starts with a literal or operator: not a statement we recognise.
    return COULD_NOT_PARSE;
  }

  // Resolve the statement actually executed: EXPLAIN ANALYZE runs what it wraps,
  // and WITH hands over to the main body after its CTEs.
  let headIdx = 0;
  let head = first.word;
  let explainWithoutAnalyze = false;
  if (head === 'explain') {
    let analyze = false;
    let i = 1;
    for (; i < toks.length; i++) {
      const t = toks[i];
      if (t.depth > 0 || (t.word && EXPLAIN_OPTIONS.has(t.word)) || !t.word) {
        if (t.word === 'analyze' || t.word === 'analyse') analyze = true;
        continue;
      }
      break;
    }
    // ANALYZE may also sit inside the option parentheses.
    if (toks.slice(1, i).some((t) => t.word === 'analyze' || t.word === 'analyse')) analyze = true;
    if (analyze && i < toks.length) {
      headIdx = i;
      head = toks[i].word;
    } else {
      explainWithoutAnalyze = true;
    }
  }
  if (head === 'with') {
    const body = toks.findIndex((t, i) => i > headIdx && t.depth === 0 && CTE_BODY.has(t.word));
    if (body > 0) {
      headIdx = body;
      head = toks[body].word;
    }
  }

  if (DANGEROUS.has(head) && !explainWithoutAnalyze) return { kind: 'dangerous', reason: head.toUpperCase() };
  if ((head === 'delete' || head === 'update') && !explainWithoutAnalyze) {
    const hasWhere = toks.some((t, i) => i > headIdx && t.depth === 0 && t.word === 'where');
    if (!hasWhere) return { kind: 'dangerous', reason: `${head.toUpperCase()} without WHERE` };
  }

  for (let i = 0; i < toks.length; i++) {
    const t = toks[i];
    if (!WRITE.has(t.word)) continue;
    // `replace(...)` after the first word is the string function.
    if (t.word === 'replace' && i > 0 && toks[i + 1] && toks[i + 1].depth > t.depth) continue;
    return { kind: 'write', reason: t.word.toUpperCase() };
  }

  if (head === 'select' || first.word === 'select') {
    // SELECT ... INTO creates a table (Postgres) or writes a file (MySQL).
    if (toks.some((t) => t.depth === 0 && t.word === 'into')) return { kind: 'write', reason: 'SELECT INTO' };
  }

  if (first.word === 'pragma') {
    if (toks.some((t) => t.depth === 0 && t.text === '=')) return { kind: 'write', reason: 'PRAGMA assignment' };
    if (toks.some((t) => t.depth > 0) && !words.slice(1, 4).some((t) => t.depth === 0 && READ_PRAGMAS.has(t.word))) {
      return { kind: 'write', reason: 'PRAGMA assignment' };
    }
  }

  if (first.word === 'pragma' && !toks.some((t) => t.depth > 0)) {
    const name = [...toks].reverse().find((t) => t.depth === 0 && t.word);
    if (!name || name === first || !READ_BARE_PRAGMAS.has(name.word)) return { kind: 'write', reason: 'PRAGMA' };
  }

  if (READ.has(first.word)) return { kind: 'read', reason: '' };
  if (words.length > 1 && isTypoOfKeyword(first.word)) return COULD_NOT_PARSE;
  return { kind: 'write', reason: 'unrecognized statement' };
}

const SEVERITY: Record<StatementKind, number> = { read: 0, write: 1, dangerous: 2 };

// Classifies every statement in `text` and returns the most severe result (the
// first one at that level), so a multi-statement run cannot hide a DROP behind
// a SELECT.
export function classifyStatement(text: string, dialect: SqlDialect): Classification {
  const stmts = splitStatements(text, dialect);
  if (stmts.length === 0) return COULD_NOT_PARSE;
  let worst: Classification | null = null;
  for (const s of stmts) {
    const c = classifyOne(s.text, dialect);
    if (!worst || SEVERITY[c.kind] > SEVERITY[worst.kind]) worst = c;
  }
  return worst ?? COULD_NOT_PARSE;
}
