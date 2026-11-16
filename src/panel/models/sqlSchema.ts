// Pure schema helpers: table-preview SQL and the CodeMirror completion schema.
import { quoteIdent } from './sqlValues';
import type { SchemaTree, SqlDialect } from './sqlTypes';

export { quoteIdent };

export function selectTableSql(schema: string, table: string, dialect: SqlDialect): string {
  const target =
    dialect === 'sqlite' && schema === 'main'
      ? quoteIdent(table, dialect)
      : `${quoteIdent(schema, dialect)}.${quoteIdent(table, dialect)}`;
  return `SELECT * FROM ${target} LIMIT 100;`;
}

const DEFAULT_SCHEMA: Record<SqlDialect, string | null> = { sqlite: 'main', postgres: 'public', mysql: null };

// lang-sql `schema` option: table/view name (schema-qualified outside the default schema) -> column names.
export function toCompletionSchema(tree: SchemaTree, dialect: SqlDialect = 'sqlite'): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  const plain = dialect === 'mysql' ? null : DEFAULT_SCHEMA[dialect];
  for (const schema of tree.schemas) {
    const bare = dialect === 'mysql' || schema.name === plain;
    for (const t of [...schema.tables, ...schema.views]) {
      out[bare ? t.name : `${schema.name}.${t.name}`] = t.columns.map((c) => c.name);
    }
  }
  return out;
}
