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

function parseStatements(text: string, dialect: SqlDialect): ParsedStatement[] {
  const tree = sqlLanguage(dialect).language.parser.parse(text);
  const out: ParsedStatement[] = [];
  const cursor = tree.cursor();
  if (!cursor.firstChild()) return out;
  do {
    if (cursor.name !== 'Statement') continue;
    const nodeFrom = cursor.from;
    const nodeTo = cursor.to;
    let from = nodeFrom;
    let to = nodeTo;
    while (to > from && /\s/.test(text[to - 1])) to--;
    if (to > from && text[to - 1] === ';') to--;
    while (to > from && /\s/.test(text[to - 1])) to--;
    while (from < to && /\s/.test(text[from])) from++;
    if (from >= to) continue;
    out.push({ from, to, text: text.slice(from, to), nodeTo });
  } while (cursor.nextSibling());
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
