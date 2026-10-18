import React from 'react';
import { IconChevronDown, IconFold, IconFoldDown } from '@tabler/icons-react';
import { safeStringify } from '../../utils';
import { formatPath, type PathSegment } from '../../models/consoleAssist';

// Above this many characters the interactive tree would build too many DOM
// nodes to stay responsive, so we fall back to the flat highlighted text view
// (which itself drops highlighting past 600 lines).
const TREE_CHAR_BUDGET = 60_000;
// Containers deeper than this render as a collapsed summary until expanded, so
// a huge nested payload never mounts thousands of rows up front.
const DEFAULT_OPEN_DEPTH = 4;
// Selectable (inspector) mode keeps the tree for any size instead of the flat
// fallback: only the root opens by default, children mount in chunks, and
// Expand all stops at this depth.
const SELECTABLE_OPEN_DEPTH = 1;
const SELECTABLE_EXPAND_ALL_DEPTH = 4;
export const JSON_CHILD_CHUNK = 100;
// The key/path filter walks the value once per query; bound the walk.
export const FILTER_NODE_BUDGET = 200_000;
const FILTER_MAX_DEPTH = 32;
// Internal path keys; NUL cannot collide with the "." that real keys contain.
const SEP = '\u0000';
const MORE = SEP + 'more';
const CLOSE = SEP + 'close';

type ContainerKind = 'object' | 'array';

function containerKind(value: unknown): ContainerKind | null {
  if (Array.isArray(value)) return 'array';
  if (value !== null && typeof value === 'object') return 'object';
  return null;
}

function valueClass(value: unknown): string {
  if (typeof value === 'string') return 'xray-json-string';
  if (typeof value === 'number') return 'xray-json-number';
  if (typeof value === 'boolean') return 'xray-json-bool';
  if (value === null || value === undefined) return 'xray-json-null';
  return 'xray-json-punct';
}

function renderScalar(value: unknown): string {
  if (typeof value === 'string') return JSON.stringify(value);
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  return String(value);
}

function childEntries(value: unknown, kind: ContainerKind): Array<[string | number, unknown]> {
  return kind === 'array'
    ? (value as unknown[]).map((item, index) => [index, item])
    : Object.entries(value as Record<string, unknown>);
}

function containerSummary(kind: ContainerKind, count: number): string {
  return kind === 'array' ? `${count} ${count === 1 ? 'item' : 'items'}` : `${count} ${count === 1 ? 'key' : 'keys'}`;
}

/** A segment as it reads in a path, without a root: `users`, `[0]`, `["a b"]`. */
function segmentLabel(segment: PathSegment): string {
  const text = formatPath('', [segment]);
  return text.startsWith('.') ? text.slice(1) : text;
}

interface FilterResult {
  /** Paths whose key (or, for path-like queries, whose path) matches. */
  matched: Set<string>;
  /** Paths with a match somewhere beneath them; these open while filtering. */
  ancestors: Set<string>;
  /** The walk stopped at FILTER_NODE_BUDGET nodes. */
  limited: boolean;
}

function filterTree(value: unknown, query: string): FilterResult {
  const q = query.trim().toLowerCase();
  const matched = new Set<string>();
  const ancestors = new Set<string>();
  // "users[0]" / "meta.page" match against the path; a bare word matches keys.
  const byPath = /[.[\]]/.test(q);
  let budget = FILTER_NODE_BUDGET;
  const walk = (node: unknown, path: string, segments: PathSegment[], depth: number): boolean => {
    const kind = containerKind(node);
    if (!kind || depth >= FILTER_MAX_DEPTH) return false;
    let any = false;
    for (const [key, child] of childEntries(node, kind)) {
      if (--budget < 0) break;
      const childPath = path + SEP + key;
      const childSegments = byPath ? [...segments, key] : segments;
      const hit = byPath
        ? formatPath('', childSegments).toLowerCase().includes(q)
        : String(key).toLowerCase().includes(q);
      if (hit) matched.add(childPath);
      const below = walk(child, childPath, childSegments, depth + 1);
      if (below) ancestors.add(childPath);
      if (hit || below) any = true;
    }
    return any;
  };
  if (walk(value, '$', [], 0)) ancestors.add('$');
  return { matched, ancestors, limited: budget < 0 };
}

/** One visible line of the selectable tree. `close` lines are decorative. */
interface FlatRow {
  id: string;
  kind: 'leaf' | 'branch' | 'more' | 'close';
  depth: number;
  nodeKey: string | number | null;
  value?: unknown;
  segments: PathSegment[];
  open?: boolean;
  /** `more`: the container whose next chunk it reveals, and how many remain. */
  parentId?: string;
  hidden?: number;
  bracket?: string;
}

/**
 * Interactive JSON tree. With `onSelectPath` it becomes the Console inspector's tree
 * (spec C7): any size stays a tree (children mount in chunks of JSON_CHILD_CHUNK with
 * "Show more"), only the root opens by default, `filter` narrows the visible nodes to
 * matching keys/paths and their ancestors, and the rows form one keyboard stop with a
 * roving tabindex (↑/↓, →/←, Home/End, Enter/Space selects and reports the segments).
 * Without it the behaviour is the original detail-pane viewer.
 */
export const JsonView = React.memo(function JsonView({ value, onSelectPath, filter = '' }: {
  value: unknown;
  onSelectPath?: (segments: PathSegment[]) => void;
  filter?: string;
}): React.ReactElement {
  const selectable = !!onSelectPath;
  // Cheap size gate up front — huge bodies keep the old flat text view.
  const oversized = React.useMemo(
    () => !selectable && safeStringify(value, 0, TREE_CHAR_BUDGET + 1).length > TREE_CHAR_BUDGET,
    [value, selectable],
  );
  const openDepth = selectable ? SELECTABLE_OPEN_DEPTH : DEFAULT_OPEN_DEPTH;
  const query = selectable ? filter.trim() : '';
  const filterResult = React.useMemo(() => (query ? filterTree(value, query) : null), [value, query]);

  // Collapse overrides: a path in this set is forced to the non-default state.
  // Expand-all/collapse-all reset everyone to the new baseline.
  const [overrides, setOverrides] = React.useState<Map<string, boolean>>(() => new Map());
  const [allOpen, setAllOpen] = React.useState<boolean | null>(null);
  const [selected, setSelected] = React.useState<string | null>(null);
  const [active, setActive] = React.useState<string | null>(null);
  const [chunks, setChunks] = React.useState<Map<string, number>>(() => new Map());
  // Reset during render when the inputs change (React's "adjust state on prop
  // change" pattern): a new value starts from defaults; a new query re-derives
  // what is open from its matches.
  const [inputs, setInputs] = React.useState({ value, query });
  if (inputs.value !== value || inputs.query !== query) {
    if (inputs.value !== value) { setAllOpen(null); setSelected(null); setActive(null); }
    setInputs({ value, query });
    setOverrides(new Map());
    setChunks(new Map());
  }

  const baseline = React.useCallback((path: string, depth: number): boolean => {
    if (allOpen !== null) return allOpen && (!selectable || depth < SELECTABLE_EXPAND_ALL_DEPTH);
    if (filterResult?.ancestors.has(path)) return true;
    return depth < openDepth;
  }, [allOpen, selectable, filterResult, openDepth]);

  const isOpen = React.useCallback((path: string, depth: number): boolean => {
    const override = overrides.get(path);
    if (override !== undefined) return override;
    return baseline(path, depth);
  }, [overrides, baseline]);

  const setOpen = React.useCallback((path: string, depth: number, open?: boolean): void => {
    setOverrides((prev) => {
      const next = new Map(prev);
      const current = prev.get(path) ?? baseline(path, depth);
      next.set(path, open ?? !current);
      return next;
    });
  }, [baseline]);

  const shown = React.useCallback((path: string) => chunks.get(path) ?? JSON_CHILD_CHUNK, [chunks]);
  const showMore = React.useCallback((path: string) => {
    setChunks((prev) => new Map(prev).set(path, (prev.get(path) ?? JSON_CHILD_CHUNK) + JSON_CHILD_CHUNK));
  }, []);

  const toolbar = (
    <div className="xray-json-tree-toolbar">
      <button className="xray-json-tree-btn" onClick={() => { setAllOpen(true); setOverrides(new Map()); }} title={selectable ? `Expand nodes up to ${SELECTABLE_EXPAND_ALL_DEPTH} levels deep` : 'Expand all nodes'}>
        <IconFoldDown size={13} stroke={2} />Expand all
      </button>
      <button className="xray-json-tree-btn" onClick={() => { setAllOpen(false); setOverrides(new Map()); }} title="Collapse all nodes">
        <IconFold size={13} stroke={2} />Collapse all
      </button>
    </div>
  );

  if (oversized) {
    const text = safeStringify(value);
    return <pre className="xray-json xray-json-editor xray-json-text">{text}</pre>;
  }

  if (containerKind(value) === null) {
    // A bare scalar — nothing to expand.
    return <pre className="xray-json xray-json-scalar"><span className={valueClass(value)}>{renderScalar(value)}</span></pre>;
  }

  if (selectable) {
    return (
      <div className="xray-json xray-json-tree is-selectable">
        {toolbar}
        {filterResult?.limited && (
          <p className="xray-json-empty">Filter limited to the first {FILTER_NODE_BUDGET.toLocaleString('en-US')} nodes.</p>
        )}
        {filterResult && !filterResult.ancestors.has('$') ? (
          <p className="xray-json-empty">No keys or paths match “{query}”.</p>
        ) : (
          <SelectableTree
            value={value}
            isOpen={isOpen}
            setOpen={setOpen}
            filter={filterResult}
            shown={shown}
            showMore={showMore}
            selected={selected}
            active={active}
            setActive={setActive}
            onSelect={(row) => { setSelected(row.id); onSelectPath?.(row.segments); }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="xray-json xray-json-tree" role="tree" aria-label="JSON viewer">
      {toolbar}
      <div className="xray-json-tree-body">
        <TreeNode nodeKey={null} value={value} path="$" depth={0} isOpen={isOpen} toggle={(path, depth) => setOpen(path, depth)} />
      </div>
    </div>
  );
});

function flattenTree(value: unknown, isOpen: (path: string, depth: number) => boolean, filter: FilterResult | null, shown: (path: string) => number): FlatRow[] {
  const rows: FlatRow[] = [];
  const visit = (nodeKey: string | number | null, node: unknown, path: string, segments: PathSegment[], depth: number, insideMatch: boolean): void => {
    const kind = containerKind(node);
    if (!kind) {
      rows.push({ id: path, kind: 'leaf', depth, nodeKey, value: node, segments });
      return;
    }
    const open = isOpen(path, depth);
    rows.push({ id: path, kind: 'branch', depth, nodeKey, value: node, segments, open });
    if (!open) return;
    let entries = childEntries(node, kind);
    if (filter && !insideMatch) {
      entries = entries.filter(([key]) => filter.matched.has(path + SEP + key) || filter.ancestors.has(path + SEP + key));
    }
    const limit = shown(path);
    const visible = entries.length > limit ? entries.slice(0, limit) : entries;
    for (const [key, child] of visible) {
      const childPath = path + SEP + key;
      visit(key, child, childPath, [...segments, key], depth + 1, insideMatch || (!!filter && filter.matched.has(childPath)));
    }
    if (entries.length > visible.length) {
      rows.push({ id: path + MORE, kind: 'more', depth: depth + 1, nodeKey: null, segments, parentId: path, hidden: entries.length - visible.length });
    }
    rows.push({ id: path + CLOSE, kind: 'close', depth, nodeKey: null, segments, bracket: kind === 'array' ? ']' : '}' });
  };
  visit(null, value, '$', [], 0, false);
  return rows;
}

/** The inspector's tree: visible rows flattened, one roving tab stop. */
function SelectableTree({ value, isOpen, setOpen, filter, shown, showMore, selected, active, setActive, onSelect }: {
  value: unknown;
  isOpen(path: string, depth: number): boolean;
  setOpen(path: string, depth: number, open?: boolean): void;
  filter: FilterResult | null;
  shown(path: string): number;
  showMore(path: string): void;
  selected: string | null;
  active: string | null;
  setActive(id: string): void;
  onSelect(row: FlatRow): void;
}): React.ReactElement {
  const rows = React.useMemo(() => flattenTree(value, isOpen, filter, shown), [value, isOpen, filter, shown]);
  const treeRef = React.useRef<HTMLDivElement | null>(null);
  // Show more: the first newly revealed child takes the button's place, but only
  // exists after the next commit. Consumed (and cleared) by the next layout effect.
  const pendingFocus = React.useRef<number | null>(null);
  const navigable = rows.filter((row) => row.kind !== 'close');
  const has = (id: string | null): boolean => !!id && navigable.some((row) => row.id === id);
  const stop = has(active) ? active : has(selected) ? selected : navigable[0]?.id ?? null;

  React.useLayoutEffect(() => {
    const index = pendingFocus.current;
    if (index === null) return;
    pendingFocus.current = null;
    const row = rows[index];
    if (!row || row.kind === 'close') return;
    if (row.id !== active) setActive(row.id);
    treeRef.current?.querySelector<HTMLElement>(`[data-row="${index}"]`)?.focus();
  });

  // Arrow/Home/End targets are already rendered: focus them now. Deferring through
  // pendingFocus would leak when the target is the active row (setActive(same id)
  // does not re-render), and a later render — typing in the filter — would pull
  // focus back into the tree.
  function focusRow(row: FlatRow | undefined): void {
    if (!row) return;
    if (row.id !== active) setActive(row.id);
    treeRef.current?.querySelector<HTMLElement>(`[data-row="${rows.indexOf(row)}"]`)?.focus();
  }

  function activate(row: FlatRow): void {
    if (row.kind === 'more' && row.parentId) {
      showMore(row.parentId);
      pendingFocus.current = rows.indexOf(row);
      return;
    }
    onSelect(row);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>): void {
    const target = (event.target as HTMLElement).closest<HTMLElement>('[data-row]');
    if (!target) return;
    const index = Number(target.dataset.row);
    const row = rows[index];
    if (!row) return;
    const at = navigable.indexOf(row);
    switch (event.key) {
      case 'ArrowDown': focusRow(navigable[at + 1]); break;
      case 'ArrowUp': focusRow(navigable[at - 1]); break;
      case 'Home': focusRow(navigable[0]); break;
      case 'End': focusRow(navigable[navigable.length - 1]); break;
      case 'ArrowRight':
        if (row.kind !== 'branch') return;
        if (!row.open) setOpen(row.id, row.depth, true);
        else if (rows[index + 1] && rows[index + 1].depth > row.depth && rows[index + 1].kind !== 'close') focusRow(rows[index + 1]);
        break;
      case 'ArrowLeft':
        if (row.kind === 'branch' && row.open) { setOpen(row.id, row.depth, false); break; }
        for (let i = index - 1; i >= 0; i--) {
          if (rows[i].kind === 'branch' && rows[i].depth === row.depth - 1) { focusRow(rows[i]); break; }
        }
        break;
      case 'Enter':
      case ' ':
        activate(row);
        break;
      default:
        return;
    }
    event.preventDefault();
  }

  return (
    <div className="xray-json-tree-body" role="tree" aria-label="JSON viewer" ref={treeRef} onKeyDown={onKeyDown}>
      {rows.map((row, index) => {
        if (row.kind === 'close') {
          return (
            <div key={row.id} className="xray-json-row" role="none" aria-hidden="true" style={{ paddingLeft: row.depth * 14 + 8 }}>
              <span className="xray-json-gutter" />
              <span className="xray-json-punct">{row.bracket}</span>
            </div>
          );
        }
        const common = {
          'data-row': index,
          role: 'treeitem',
          'aria-level': row.depth + 1,
          tabIndex: row.id === stop ? 0 : -1,
          onFocus: () => { if (active !== row.id) setActive(row.id); },
        };
        if (row.kind === 'more') {
          return (
            <div key={row.id} {...common} className="xray-json-row xray-json-flatrow xray-json-more-row" style={{ paddingLeft: row.depth * 14 + 8 }} onClick={() => activate(row)}>
              <span className="xray-json-tree-btn xray-json-more">Show {Math.min(row.hidden ?? 0, JSON_CHILD_CHUNK)} more · {row.hidden} hidden</span>
            </div>
          );
        }
        const keyLabel = row.nodeKey === null ? null : <span className="xray-json-key">{typeof row.nodeKey === 'number' ? row.nodeKey : JSON.stringify(row.nodeKey)}</span>;
        const isSelected = selected === row.id;
        if (row.kind === 'leaf') {
          return (
            <div key={row.id} {...common} aria-selected={isSelected} className="xray-json-row xray-json-flatrow" style={{ paddingLeft: row.depth * 14 + 8 }} onClick={() => onSelect(row)}>
              <span className="xray-json-gutter" />
              {keyLabel}{keyLabel && <span className="xray-json-punct">: </span>}
              <span className={`xray-json-value ${valueClass(row.value)}`}>{renderScalar(row.value)}</span>
            </div>
          );
        }
        const kind = containerKind(row.value) as ContainerKind;
        const count = kind === 'array' ? (row.value as unknown[]).length : Object.keys(row.value as object).length;
        const name = row.nodeKey === null ? 'value' : segmentLabel(row.nodeKey);
        return (
          <div
            key={row.id}
            {...common}
            aria-expanded={!!row.open}
            aria-selected={isSelected}
            className="xray-json-row xray-json-flatrow xray-json-branch-row"
            style={{ paddingLeft: row.depth * 14 }}
            onClick={() => onSelect(row)}
            onDoubleClick={() => setOpen(row.id, row.depth)}
          >
            {/* Pointer-only toggle; the keyboard uses →/← on the row. */}
            <span
              className="xray-json-toggle"
              aria-hidden="true"
              title={`${row.open ? 'Collapse' : 'Expand'} ${name}`}
              onClick={(event) => { event.stopPropagation(); setActive(row.id); setOpen(row.id, row.depth); }}
              onDoubleClick={(event) => event.stopPropagation()}
            >
              <IconChevronDown size={13} stroke={2.2} className={`xray-json-chevron ${row.open ? '' : 'closed'}`} />
            </span>
            {keyLabel}{keyLabel && <span className="xray-json-punct">: </span>}
            <span className="xray-json-punct">{kind === 'array' ? '[' : '{'}</span>
            {!row.open && <span className="xray-json-summary">{containerSummary(kind, count)}</span>}
            {!row.open && <span className="xray-json-punct">{kind === 'array' ? ']' : '}'}</span>}
          </div>
        );
      })}
    </div>
  );
}

function TreeNode({ nodeKey, value, path, depth, isOpen, toggle }: {
  nodeKey: string | number | null;
  value: unknown;
  path: string;
  depth: number;
  isOpen(path: string, depth: number): boolean;
  toggle(path: string, depth: number): void;
}): React.ReactElement {
  const kind = containerKind(value);
  const keyLabel = nodeKey === null ? null : <span className="xray-json-key">{typeof nodeKey === 'number' ? nodeKey : JSON.stringify(nodeKey)}</span>;

  if (!kind) {
    return (
      <div className="xray-json-row" role="treeitem" style={{ paddingLeft: depth * 14 + 8 }}>
        <span className="xray-json-gutter" />
        {keyLabel}{keyLabel && <span className="xray-json-punct">: </span>}
        <span className={`xray-json-value ${valueClass(value)}`}>{renderScalar(value)}</span>
      </div>
    );
  }

  const entries = childEntries(value, kind);
  const open = isOpen(path, depth);
  const brackets = kind === 'array' ? ['[', ']'] : ['{', '}'];
  const summary = containerSummary(kind, entries.length);

  return (
    <div className="xray-json-node" role="treeitem" aria-expanded={open}>
      <button
        className="xray-json-row xray-json-branch"
        style={{ paddingLeft: depth * 14 }}
        onClick={() => toggle(path, depth)}
      >
        <IconChevronDown size={13} stroke={2.2} className={`xray-json-chevron ${open ? '' : 'closed'}`} />
        {keyLabel}{keyLabel && <span className="xray-json-punct">: </span>}
        <span className="xray-json-punct">{brackets[0]}</span>
        {!open && <span className="xray-json-summary">{summary}</span>}
        {!open && <span className="xray-json-punct">{brackets[1]}</span>}
      </button>
      {open && (
        <div className="xray-json-children">
          {entries.map(([childKey, childValue]) => (
            <TreeNode
              key={childKey}
              nodeKey={childKey}
              value={childValue}
              path={path + SEP + childKey}
              depth={depth + 1}
              isOpen={isOpen}
              toggle={toggle}
            />
          ))}
          <div className="xray-json-row" style={{ paddingLeft: depth * 14 + 8 }}>
            <span className="xray-json-gutter" />
            <span className="xray-json-punct">{brackets[1]}</span>
          </div>
        </div>
      )}
    </div>
  );
}
