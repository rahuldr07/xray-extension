// Quick-start snippets for an empty query tab, built from the open database's schema.
// Pure logic; keep React and the runtime out of this file.

import { quoteIdent } from './sqlValues';
import type { SchemaTree } from './sqlTypes';

export interface QuickStart {
  label: string;
  sql: string;
}

function stringLiteral(text: string): string {
  return `'${text.replace(/'/g, "''")}'`;
}

/** The main schema's tables (not views), in schema order. */
function mainTables(schema: SchemaTree | null): string[] {
  const main = schema?.schemas.find((s) => s.name === 'main') ?? schema?.schemas[0];
  return main ? main.tables.map((t) => t.name) : [];
}

export function quickStarts(schema: SchemaTree | null): QuickStart[] {
  const starters: QuickStart[] = [
    { label: 'List tables', sql: "SELECT name, type FROM sqlite_schema WHERE name NOT LIKE 'sqlite_%' ORDER BY name;" },
  ];
  const tables = mainTables(schema);
  if (tables.length) {
    const counts = tables.map((t) => `SELECT ${stringLiteral(t)} AS table_name, count(*) AS rows FROM ${quoteIdent(t, 'sqlite')}`);
    starters.push({ label: 'Row counts', sql: `${counts.join('\nUNION ALL\n')}\nORDER BY table_name;` });
    starters.push({ label: 'Table columns', sql: `SELECT * FROM pragma_table_info(${stringLiteral(tables[0])});` });
  }
  return starters;
}
