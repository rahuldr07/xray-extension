import React, { useEffect, useRef, useState } from 'react';
import { IconChevronRight, IconEye, IconSearch, IconTable } from '@tabler/icons-react';
import { usePanelSqlStore } from '../../sqlStore';
import { matchesTableFilter } from '../../models/sqlUi';
import type { ColumnNode, TableNode } from '../../models/sqlTypes';

function columnSummary(table: TableNode): string {
  return table.columns.map((c) => `${c.name}${c.type ? ` ${c.type}` : ''}${c.pk ? ' PK' : ''}`).join('\n');
}

function columnLabel(c: ColumnNode): string {
  return [c.name, c.type, c.pk && 'primary key', !c.nullable && 'not null'].filter(Boolean).join(', ');
}

// One column of an expanded table: name, declared type, and PK / NOT NULL markers as labelled text.
function RailColumn({ column }: { column: ColumnNode }): React.ReactElement {
  return (
    <li role="treeitem" aria-level={3} aria-label={columnLabel(column)} className="xray-sql-rail-column">
      <span className="xray-sql-rail-name">{column.name}</span>
      {column.type && <span className="xray-sql-rail-type">{column.type}</span>}
      {column.pk && (
        <span role="img" aria-label="primary key" title="Primary key" className="xray-sql-rail-marker pk">
          PK
        </span>
      )}
      {!column.nullable && (
        <span role="img" aria-label="not null" title="Not null" className="xray-sql-rail-marker">
          NN
        </span>
      )}
    </li>
  );
}

function RailItem({ schema, table, view }: { schema: string; table: TableNode; view: boolean }): React.ReactElement {
  const previewTable = usePanelSqlStore((s) => s.previewTable);
  const busy = usePanelSqlStore((s) => !!s.running || s.opening);
  const [expanded, setExpanded] = useState(false);
  const activate = () => {
    if (!busy) void previewTable(schema, table.name);
  };
  return (
    <div role="none" className="xray-sql-rail-entry">
      <div role="none" className="xray-sql-rail-row">
        {/* A sibling of the tree item, so the item's name stays the table name. */}
        <button
          type="button"
          className="xray-sql-rail-toggle"
          aria-expanded={expanded}
          aria-label={`Columns of ${table.name}`}
          onClick={() => setExpanded((open) => !open)}
        >
          <IconChevronRight size={12} stroke={2} aria-hidden="true" />
        </button>
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
      </div>
      {expanded && (
        <ul role="group" aria-label={`${table.name} columns`} className="xray-sql-rail-columns">
          {table.columns.map((c) => (
            <RailColumn key={c.name} column={c} />
          ))}
        </ul>
      )}
    </div>
  );
}

// "/" jumps to the table filter, unless the user is typing somewhere (the editor, a field).
function isTypingTarget(el: Element | null): boolean {
  if (!el) return false;
  if (el.closest('.cm-editor')) return true;
  return el instanceof HTMLElement && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName));
}

export function ConnectionRail(): React.ReactElement {
  const connection = usePanelSqlStore((s) => s.connection);
  const schema = usePanelSqlStore((s) => s.schema);
  const [query, setQuery] = useState('');
  const filterRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey || isTypingTarget(document.activeElement)) return;
      // Never behind a modal dialog (a confirmation, a discard prompt).
      if (document.querySelector('[aria-modal="true"]')) return;
      if (!filterRef.current) return;
      e.preventDefault();
      filterRef.current.focus();
      filterRef.current.select();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const hasObjects = !!schema && schema.schemas.some((s) => s.tables.length || s.views.length);
  let shown = 0;
  return (
    <nav className="xray-sql-rail" aria-label="Schema">
      {!connection && <p className="xray-sql-empty">No database open.</p>}
      {connection && hasObjects && (
        <label className="xray-sql-rail-filter">
          <IconSearch size={13} stroke={1.8} aria-hidden="true" />
          <input
            ref={filterRef}
            className="xray-input"
            type="search"
            aria-label="Filter tables"
            placeholder="Filter tables"
            aria-keyshortcuts="/"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape' && query) {
                e.preventDefault();
                setQuery('');
              }
            }}
          />
          <kbd className="xray-sql-rail-filter-key" aria-hidden="true">
            /
          </kbd>
        </label>
      )}
      {connection && schema && (
        <div role="tree" aria-label="Tables and views" className="xray-sql-tree">
          {schema.schemas.map((s) => (
            <React.Fragment key={s.name}>
              {schema.schemas.length > 1 && <div className="xray-sql-rail-schema" aria-hidden="true">{s.name}</div>}
              {([['Tables', s.tables, false], ['Views', s.views, true]] as const).map(([label, all, view]) => {
                const items = all.filter((t) => matchesTableFilter(t.name, query));
                shown += items.length;
                return items.length ? (
                  <div key={label} role="group" aria-label={schema.schemas.length > 1 ? `${s.name} ${label}` : label}>
                    <div className="xray-sql-rail-heading" aria-hidden="true">
                      {label} <span className="xray-sql-rail-count">{items.length}</span>
                    </div>
                    {items.map((t) => (
                      <RailItem key={t.name} schema={s.name} table={t} view={view} />
                    ))}
                  </div>
                ) : null;
              })}
            </React.Fragment>
          ))}
          {!hasObjects && <p className="xray-sql-empty">No tables or views.</p>}
          {hasObjects && shown === 0 && <p className="xray-sql-empty">No tables match “{query.trim()}”.</p>}
        </div>
      )}
    </nav>
  );
}
