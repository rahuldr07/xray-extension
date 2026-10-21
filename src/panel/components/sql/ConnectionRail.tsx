import React from 'react';
import { IconEye, IconTable } from '@tabler/icons-react';
import { usePanelSqlStore } from '../../sqlStore';
import type { TableNode } from '../../models/sqlTypes';

function columnSummary(table: TableNode): string {
  return table.columns.map((c) => `${c.name}${c.type ? ` ${c.type}` : ''}${c.pk ? ' PK' : ''}`).join('\n');
}

function RailItem({ schema, table, view }: { schema: string; table: TableNode; view: boolean }): React.ReactElement {
  const previewTable = usePanelSqlStore((s) => s.previewTable);
  const busy = usePanelSqlStore((s) => !!s.running || s.opening);
  const activate = () => {
    if (!busy) void previewTable(schema, table.name);
  };
  return (
    <div
      role="treeitem"
      tabIndex={0}
      aria-level={2}
      aria-disabled={busy || undefined}
      className="xray-sql-rail-item"
      title={columnSummary(table)}
      onClick={activate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activate();
        }
      }}
    >
      {view ? <IconEye size={14} stroke={1.8} aria-hidden="true" /> : <IconTable size={14} stroke={1.8} aria-hidden="true" />}
      <span className="xray-sql-rail-name">{table.name}</span>
    </div>
  );
}

export function ConnectionRail(): React.ReactElement {
  const connection = usePanelSqlStore((s) => s.connection);
  const schema = usePanelSqlStore((s) => s.schema);

  return (
    <nav className="xray-sql-rail" aria-label="Schema">
      {!connection && <p className="xray-sql-empty">Open a SQLite file to browse its tables.</p>}
      {connection && schema && (
        <div role="tree" aria-label="Tables and views" className="xray-sql-tree">
          {schema.schemas.map((s) => (
            <React.Fragment key={s.name}>
              {schema.schemas.length > 1 && <div className="xray-sql-rail-schema" aria-hidden="true">{s.name}</div>}
              {([['Tables', s.tables, false], ['Views', s.views, true]] as const).map(([label, items, view]) =>
                items.length ? (
                  <div key={label} role="group" aria-label={schema.schemas.length > 1 ? `${s.name} ${label}` : label}>
                    <div className="xray-sql-rail-heading" aria-hidden="true">
                      {label} <span className="xray-sql-rail-count">{items.length}</span>
                    </div>
                    {items.map((t) => (
                      <RailItem key={t.name} schema={s.name} table={t} view={view} />
                    ))}
                  </div>
                ) : null,
              )}
            </React.Fragment>
          ))}
          {schema.schemas.every((s) => !s.tables.length && !s.views.length) && <p className="xray-sql-empty">No tables or views.</p>}
        </div>
      )}
    </nav>
  );
}
