// Splits a SQL script into statements using the lang-sql (lezer) parser, so
// semicolons inside strings, comments, quoted identifiers and $$ bodies never
// split. Pure; no React.
import { MySQL, PostgreSQL, SQLite } from '@codemirror/lang-sql';
import type { SQLDialect } from '@codemirror/lang-sql';
import type { SqlDialect } from './sqlTypes';

export interface StatementRange {
  from: number;
  to: number;
  text: string;
}

interface ParsedStatement extends StatementRange {
  // End of the parser node, which includes the trailing `;`.
  nodeTo: number;
}

export function sqlLanguage(dialect: SqlDialect): SQLDialect {
  if (dialect === 'postgres') return PostgreSQL;
  if (dialect === 'mysql') return MySQL;
  return SQLite;
}

// Leaves that are not words of the statement: literals and comments never end a trigger.
const NON_WORD = new Set(['String', 'LineComment', 'BlockComment', 'QuotedIdentifier', 'Number']);

interface RawStatement {
  from: number;
  to: number;
  words: string[];
}

// A `CREATE [TEMP|TEMPORARY] TRIGGER ... BEGIN` whose body the parser split at each `;`.
function opensTriggerBody(words: string[]): boolean {
  let i = words[0] === 'create' ? 1 : -1;
  if (i < 0) return false;
  if (words[i] === 'temp' || words[i] === 'temporary') i++;
  return words[i] === 'trigger' && words.includes('begin');
}

function parseStatements(text: string, dialect: SqlDialect): ParsedStatement[] {
  const tree = sqlLanguage(dialect).language.parser.parse(text);
  const raw: RawStatement[] = [];
  const cursor = tree.cursor();
  if (!cursor.firstChild()) return [];
  do {
    if (cursor.name !== 'Statement') continue;
    const words: string[] = [];
    cursor.node.toTree().iterate({
      enter(node) {
        if (NON_WORD.has(node.name)) return false;
        if (node.node.firstChild) return;
        const s = text.slice(cursor.from + node.from, cursor.from + node.to);
        if (/^[A-Za-z_]\w*$/.test(s)) words.push(s.toLowerCase());
      },
    });
    raw.push({ from: cursor.from, to: cursor.to, words });
  } while (cursor.nextSibling());

  // A trigger body's statements end in `;`, so the parser splits it; the trigger runs
  // through the statement that is a bare `END` (a CASE ... END never stands alone).
  const merged: { from: number; to: number }[] = [];
  for (let i = 0; i < raw.length; i++) {
    const start = raw[i];
    let end = start;
    if (opensTriggerBody(start.words)) {
      while (i + 1 < raw.length) {
        end = raw[++i];
        if (end.words.length === 1 && end.words[0] === 'end') break;
      }
    }
    merged.push({ from: start.from, to: end.to });
  }

  const out: ParsedStatement[] = [];
  for (const { from: nodeFrom, to: nodeTo } of merged) {
    let from = nodeFrom;
    let to = nodeTo;
    while (to > from && /\s/.test(text[to - 1])) to--;
    if (to > from && text[to - 1] === ';') to--;
    while (to > from && /\s/.test(text[to - 1])) to--;
    while (from < to && /\s/.test(text[from])) from++;
    if (from >= to) continue;
    out.push({ from, to, text: text.slice(from, to), nodeTo });
  }
  return out;
}

export function splitStatements(text: string, dialect: SqlDialect): StatementRange[] {
  return parseStatements(text, dialect).map(({ from, to, text: t }) => ({ from, to, text: t }));
}

export function statementAt(text: string, pos: number, dialect: SqlDialect): StatementRange | null {
  const all = parseStatements(text, dialect);
  if (all.length === 0) return null;
  // Inside a statement; the end (just after the `;`) counts, but a statement
  // that starts exactly at `pos` wins over the previous one ending there.
  let hit = all.find((s) => pos >= s.from && pos < s.nodeTo);
  if (!hit) hit = all.find((s) => pos === s.nodeTo);
  if (!hit) {
    for (const s of all) if (s.nodeTo < pos) hit = s;
  }
  if (!hit) hit = all.find((s) => s.from > pos);
  return hit ? { from: hit.from, to: hit.to, text: hit.text } : null;
}
