import React from 'react';
import { IconChevronDown, IconFold, IconFoldDown } from '@tabler/icons-react';
import { safeStringify } from '../../utils';
import { formatPath, type PathSegment } from '../../models/consoleAssist';
import { TreeBranch, TreeLeaf } from '../../models/treeDisplay';
import { LosslessNumber, type JsonContainerNode, type JsonNode } from '../../models/jsonText';
import {
  TREE_CHILD_CHUNK,
  TREE_ROW_BUDGET,
  containerSummary as nodeSummary,
  defaultTreeState,
  flattenJsonTree,
  isTreeOpen,
  numberHint,
  rowKey,
  type TreeOpenState,
  type TreeRow,
} from '../../models/jsonTree';
import { visibleText } from '../common/VisibleText';
import { useRowWindow } from '../common/useRowWindow';

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
/** [path segment, value, label shown verbatim instead of the key ('' for none), property name shown as a key]. */
type ChildEntry = [string | number, unknown, string?, string?];

// Display nodes (models/treeDisplay.ts) render as they are: a TreeLeaf is one line of text
// (a typed log value such as `10n` or `ƒ load()`), a TreeBranch an expandable container
// with a label (`Map(3)`) and labelled children (`"k" =>`).
function containerKind(value: unknown): ContainerKind | null {
  if (value instanceof TreeLeaf || value instanceof LosslessNumber) return null;
  if (value instanceof TreeBranch) return value.kind;
  if (Array.isArray(value)) return 'array';
  if (value !== null && typeof value === 'object') return 'object';
  return null;
}

const LEAF_CLASS: Record<TreeLeaf['tone'], string> = {
  string: 'xray-json-string',
  number: 'xray-json-number',
  bool: 'xray-json-bool',
  null: 'xray-json-null',
  typed: 'xray-json-typed',
  muted: 'xray-json-muted',
};

function valueClass(value: unknown): string {
  if (value instanceof TreeLeaf) return LEAF_CLASS[value.tone];
  if (typeof value === 'string') return 'xray-json-string';
  if (typeof value === 'number' || value instanceof LosslessNumber) return 'xray-json-number';
  if (typeof value === 'boolean') return 'xray-json-bool';
  if (value === null || value === undefined) return 'xray-json-null';
  return 'xray-json-punct';
}

// Strings and keys go through visibleText: a bidi control shows as its escape (spec J13). A
// LosslessNumber (an integer past Number.MAX_SAFE_INTEGER) shows as written.
function renderScalar(value: unknown): React.ReactNode {
  if (value instanceof TreeLeaf) return visibleText(value.text);
  if (value instanceof LosslessNumber) return value.raw;
  if (typeof value === 'string') return visibleText(JSON.stringify(value));
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  return String(value);
}

function childEntries(value: unknown, kind: ContainerKind): ChildEntry[] {
  if (value instanceof TreeBranch) return value.children.map((child) => [child.key, child.value, child.label, child.name]);
  return kind === 'array'
    ? (value as unknown[]).map((item, index) => [index, item])
    : Object.entries(value as Record<string, unknown>);
}

function containerSummary(kind: ContainerKind, count: number): string {
  return kind === 'array' ? `${count} ${count === 1 ? 'item' : 'items'}` : `${count} ${count === 1 ? 'key' : 'keys'}`;
}

/** What a collapsed container counts: a display branch says (a Map's size), else its entries. */
function containerCount(value: unknown, kind: ContainerKind): number {
  if (value instanceof TreeBranch) return value.count;
  return kind === 'array' ? (value as unknown[]).length : Object.keys(value as object).length;
}

/** A display branch's label (`Map(3)`, `TypeError`), shown before its bracket. */
function containerLabel(value: unknown): React.ReactNode {
  return value instanceof TreeBranch && value.label ? <span className="xray-json-typed xray-json-label">{value.label} </span> : null;
}

/** The key part of a row: a display node's property name or label, else the key itself. */
function keyNode(nodeKey: string | number | null, label?: string, name?: string): React.ReactNode {
  if (name !== undefined) return <><span className="xray-json-key">{visibleText(JSON.stringify(name))}</span><span className="xray-json-punct">: </span></>;
  if (label !== undefined) {
    return label ? <><span className="xray-json-key">{visibleText(label)}</span><span className="xray-json-punct"> </span></> : null;
  }
  if (nodeKey === null) return null;
  return <><span className="xray-json-key">{typeof nodeKey === 'number' ? nodeKey : visibleText(JSON.stringify(nodeKey))}</span><span className="xray-json-punct">: </span></>;
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
  /** A display node's label for this row's key ('' for none). */
  label?: string;
  /** A display node's property name for this row's key. */
  name?: string;
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
  // what is open from its matches. Object.is, not !==: NaN !== NaN, so a NaN value
  // re-set state on every render until React gave up and unmounted the panel.
  const [inputs, setInputs] = React.useState({ value, query });
  const valueChanged = !Object.is(inputs.value, value);
  if (valueChanged || inputs.query !== query) {
    if (valueChanged) { setAllOpen(null); setSelected(null); setActive(null); }
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
    return <pre className="xray-json xray-json-editor xray-json-text">{visibleText(text)}</pre>;
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
  const visit = (nodeKey: string | number | null, node: unknown, path: string, segments: PathSegment[], depth: number, insideMatch: boolean, label?: string, name?: string): void => {
    const kind = containerKind(node);
    if (!kind) {
      rows.push({ id: path, kind: 'leaf', depth, nodeKey, label, name, value: node, segments });
      return;
    }
    const open = isOpen(path, depth);
    rows.push({ id: path, kind: 'branch', depth, nodeKey, label, name, value: node, segments, open });
    if (!open) return;
    let entries = childEntries(node, kind);
    if (filter && !insideMatch) {
      entries = entries.filter(([key]) => filter.matched.has(path + SEP + key) || filter.ancestors.has(path + SEP + key));
    }
    const limit = shown(path);
    const visible = entries.length > limit ? entries.slice(0, limit) : entries;
    for (const [key, child, label, name] of visible) {
      const childPath = path + SEP + key;
      visit(key, child, childPath, [...segments, key], depth + 1, insideMatch || (!!filter && filter.matched.has(childPath)), label, name);
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
        const keyLabel = keyNode(row.nodeKey, row.label, row.name);
        const isSelected = selected === row.id;
        if (row.kind === 'leaf') {
          return (
            <div key={row.id} {...common} aria-selected={isSelected} className="xray-json-row xray-json-flatrow" style={{ paddingLeft: row.depth * 14 + 8 }} onClick={() => onSelect(row)}>
              <span className="xray-json-gutter" />
              {keyLabel}
              <span className={`xray-json-value ${valueClass(row.value)}`}>{renderScalar(row.value)}</span>
            </div>
          );
        }
        const kind = containerKind(row.value) as ContainerKind;
        const count = containerCount(row.value, kind);
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
            {keyLabel}
            {containerLabel(row.value)}
            <span className="xray-json-punct">{kind === 'array' ? '[' : '{'}</span>
            {!row.open && <span className="xray-json-summary">{containerSummary(kind, count)}</span>}
            {!row.open && <span className="xray-json-punct">{kind === 'array' ? ']' : '}'}</span>}
          </div>
        );
      })}
    </div>
  );
}

function TreeNode({ nodeKey, label, name, value, path, depth, isOpen, toggle }: {
  nodeKey: string | number | null;
  /** A display node's label for this key ('' for none). */
  label?: string;
  /** A display node's property name for this key. */
  name?: string;
  value: unknown;
  path: string;
  depth: number;
  isOpen(path: string, depth: number): boolean;
  toggle(path: string, depth: number): void;
}): React.ReactElement {
  const kind = containerKind(value);
  const keyLabel = keyNode(nodeKey, label, name);

  if (!kind) {
    return (
      <div className="xray-json-row" role="treeitem" style={{ paddingLeft: depth * 14 + 8 }}>
        <span className="xray-json-gutter" />
        {keyLabel}
        <span className={`xray-json-value ${valueClass(value)}`}>{renderScalar(value)}</span>
      </div>
    );
  }

  const entries = childEntries(value, kind);
  const open = isOpen(path, depth);
  const brackets = kind === 'array' ? ['[', ']'] : ['{', '}'];
  const summary = containerSummary(kind, containerCount(value, kind));

  return (
    <div className="xray-json-node" role="treeitem" aria-expanded={open}>
      <button
        className="xray-json-row xray-json-branch"
        style={{ paddingLeft: depth * 14 }}
        onClick={() => toggle(path, depth)}
      >
        <IconChevronDown size={13} stroke={2.2} className={`xray-json-chevron ${open ? '' : 'closed'}`} />
        {keyLabel}
        {containerLabel(value)}
        <span className="xray-json-punct">{brackets[0]}</span>
        {!open && <span className="xray-json-summary">{summary}</span>}
        {!open && <span className="xray-json-punct">{brackets[1]}</span>}
      </button>
      {open && (
        <div className="xray-json-children">
          {entries.map(([childKey, childValue, childLabel, childName]) => (
            <TreeNode
              key={childKey}
              nodeKey={childKey}
              label={childLabel}
              name={childName}
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

// ── The API detail Tree: rendered from the lossless parser's nodes (spec J3) ──────────────────

const NODE_ROW_HEIGHT = 19;
/** Rows deeper than this keep this indentation and show their depth instead. */
const NODE_INDENT_LEVELS = 40;
const DUPLICATE_HINT = 'This key repeats an earlier key of the same object. JSON.parse keeps only the last value, at the first key’s position.';

function nodeIndent(depth: number): number {
  return Math.min(depth, NODE_INDENT_LEVELS) * 14;
}

function scalarClass(node: JsonNode): string {
  if (node.t === 'str') return 'xray-json-string';
  if (node.t === 'num') return 'xray-json-number';
  if (node.t === 'bool') return 'xray-json-bool';
  if (node.t === 'null') return 'xray-json-null';
  return 'xray-json-punct';
}

/** A value as written: numbers by lexeme (`1.0`, `-0`, `9007199254740993`), strings as JSON literals. */
function scalarText(node: JsonNode): React.ReactNode {
  if (node.t === 'str') return visibleText(JSON.stringify(node.value));
  if (node.t === 'num') return node.raw;
  if (node.t === 'bool') return node.value ? 'true' : 'false';
  if (node.t === 'null') return 'null';
  return node.t === 'arr' ? '[]' : '{}';
}

function nodeKeyLabel(key: string | number | null): React.ReactNode {
  if (key === null) return null;
  return (
    <>
      <span className="xray-json-key">{typeof key === 'number' ? key : visibleText(JSON.stringify(key))}</span>
      <span className="xray-json-punct">: </span>
    </>
  );
}

function depthMark(depth: number): React.ReactNode {
  return depth > NODE_INDENT_LEVELS ? <span className="xray-json-depth" title={`Nesting depth ${depth}`}>{depth}</span> : null;
}

/** After the key: this key repeats an earlier one of the same object. */
function duplicateTag(row: TreeRow): React.ReactNode {
  return row.type === 'node' && row.dup ? <span className="xray-json-tag dup" title={DUPLICATE_HINT}>duplicate</span> : null;
}

/** After the value: JavaScript reads a different number than the one written. */
function inexactTag(hint: string | null): React.ReactNode {
  return hint ? <span className="xray-json-tag inexact" title={hint}>inexact in JS</span> : null;
}

/**
 * The Tree for a JsonNode (spec §2 J3): source order, a "duplicate" tag on a repeated key, numbers as
 * written with an "inexact in JS" tag when JavaScript reads a different number. Windowed at every
 * size: rows come from flattenJsonTree (children TREE_CHILD_CHUNK at a time, at most `budget` rows)
 * and only the rows in view are mounted, so Expand all on a 2,000-deep or a 5 MB body stays
 * responsive; "Show more rows" continues past the budget. One tab stop (roving tabindex): ↑/↓,
 * Home/End, →/← open, close or move, Enter/Space toggle. The parent bounds its height.
 */
export const JsonNodeTree = React.memo(function JsonNodeTree({ root, label = 'JSON viewer', notes }: {
  root: JsonNode;
  label?: string;
  /** Shown beside Expand all / Collapse all (NDJSON, duplicate keys, inexact numbers). */
  notes?: React.ReactNode;
}): React.ReactElement {
  const [state, setState] = React.useState<TreeOpenState>(defaultTreeState);
  const [active, setActive] = React.useState(0);
  const [stateRoot, setStateRoot] = React.useState(root);
  // A new document starts from the default view (adjust-state-on-prop-change).
  const fresh = stateRoot !== root;
  if (fresh) {
    setStateRoot(root);
    setState(defaultTreeState());
    setActive(0);
  }
  const current = fresh ? null : state;
  const rows = React.useMemo(() => flattenJsonTree(root, current ?? defaultTreeState()), [root, current]);
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const pendingFocus = React.useRef<number | null>(null);
  const virtualizer = useRowWindow({
    count: rows.length,
    scrollRef,
    estimateSize: () => NODE_ROW_HEIGHT,
    getItemKey: (index) => (rows[index] ? rowKey(rows[index]) : index),
    overscan: 12,
  });

  const toggle = React.useCallback((node: JsonContainerNode, depth: number, open?: boolean) => {
    setState((prev) => ({ ...prev, overrides: new Map(prev.overrides).set(node, open ?? !isTreeOpen(prev, node, depth)) }));
  }, []);
  const showMore = (node: JsonContainerNode): void => {
    setState((prev) => ({ ...prev, shown: new Map(prev.shown).set(node, (prev.shown.get(node) ?? TREE_CHILD_CHUNK) + TREE_CHILD_CHUNK) }));
  };
  const showMoreRows = (): void => setState((prev) => ({ ...prev, budget: prev.budget + TREE_ROW_BUDGET }));
  const setAll = (all: boolean): void => setState((prev) => ({ ...prev, all, overrides: new Map(), budget: TREE_ROW_BUDGET }));

  // Focus a row that may not be mounted yet: scroll it into the window, focus it once rendered.
  const focusPending = React.useCallback(() => {
    const index = pendingFocus.current;
    if (index === null) return;
    const element = scrollRef.current?.querySelector<HTMLElement>(`[data-index="${index}"]`);
    if (!element) return;
    pendingFocus.current = null;
    element.focus({ preventScroll: true });
  }, []);
  React.useLayoutEffect(() => { focusPending(); });

  const navigable = (index: number): boolean => index >= 0 && index < rows.length && rows[index].type !== 'close';
  const step = (from: number, delta: 1 | -1): number => {
    for (let index = from + delta; index >= 0 && index < rows.length; index += delta) if (navigable(index)) return index;
    return -1;
  };
  function focusRow(index: number): void {
    if (!navigable(index)) return;
    setActive(index);
    pendingFocus.current = index;
    virtualizer.scrollToIndex(index, { align: 'auto' });
    focusPending();
  }
  function activate(row: TreeRow): void {
    if (row.type === 'node' && row.open !== null) toggle(row.node as JsonContainerNode, row.depth);
    else if (row.type === 'more') showMore(row.node);
    else if (row.type === 'budget') showMoreRows();
  }
  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>): void {
    const target = (event.target as HTMLElement).closest<HTMLElement>('[data-index]');
    if (!target) return;
    const index = Number(target.dataset.index);
    const row = rows[index];
    if (!row) return;
    switch (event.key) {
      case 'ArrowDown': focusRow(step(index, 1)); break;
      case 'ArrowUp': focusRow(step(index, -1)); break;
      case 'Home': focusRow(step(-1, 1)); break;
      case 'End': focusRow(step(rows.length, -1)); break;
      case 'ArrowRight':
        if (row.type !== 'node' || row.open === null) return;
        if (!row.open) toggle(row.node as JsonContainerNode, row.depth, true);
        else focusRow(step(index, 1));
        break;
      case 'ArrowLeft':
        if (row.type === 'node' && row.open === true) {
          toggle(row.node as JsonContainerNode, row.depth, false);
          break;
        }
        for (let i = index - 1; i >= 0; i--) {
          const candidate = rows[i];
          if (candidate.type === 'node' && candidate.depth === row.depth - 1) {
            focusRow(i);
            break;
          }
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

  const items = virtualizer.getVirtualItems();
  // The tab stop is the active row while it is mounted, else the first row in view.
  const stop = items.some((item) => item.index === active && navigable(active)) ? active : items.find((item) => navigable(item.index))?.index ?? -1;

  function renderRow(row: TreeRow, index: number, start: number, key: React.Key): React.ReactElement {
    const position = { transform: `translateY(${start}px)` };
    if (row.type === 'close') {
      return (
        <div key={key} data-index={index} ref={virtualizer.measureElement} className="xray-json-row xray-json-vrow" role="none" aria-hidden="true" style={{ ...position, paddingLeft: nodeIndent(row.depth) + 8 }}>
          <span className="xray-json-gutter" />
          {depthMark(row.depth)}
          <span className="xray-json-punct">{row.node.t === 'arr' ? ']' : '}'}</span>
        </div>
      );
    }
    const common = {
      'data-index': index,
      ref: virtualizer.measureElement,
      role: 'treeitem',
      'aria-level': row.depth + 1,
      tabIndex: index === stop ? 0 : -1,
      onFocus: () => { if (active !== index) setActive(index); },
    };
    if (row.type === 'more' || row.type === 'budget') {
      return (
        <div key={key} {...common} className={`xray-json-row xray-json-vrow xray-json-flatrow ${row.type === 'more' ? 'xray-json-more-row' : 'xray-json-budget-row'}`} style={{ ...position, paddingLeft: nodeIndent(row.depth) + 8 }} onClick={() => activate(row)}>
          {row.type === 'more'
            ? <span className="xray-json-tree-btn xray-json-more">Show {Math.min(row.hidden, TREE_CHILD_CHUNK)} more · {row.hidden.toLocaleString('en-US')} hidden</span>
            : <>
              <span className="xray-json-tree-btn xray-json-more">Show {TREE_ROW_BUDGET.toLocaleString('en-US')} more rows</span>
              <span className="xray-json-muted">The tree stops after {(current?.budget ?? TREE_ROW_BUDGET).toLocaleString('en-US')} rows; Raw has the whole text.</span>
            </>}
        </div>
      );
    }
    const node = row.node;
    if (row.open !== null) {
      const container = node as JsonContainerNode;
      return (
        <div
          key={key}
          {...common}
          aria-expanded={row.open}
          className="xray-json-row xray-json-vrow xray-json-flatrow xray-json-branch-row"
          style={{ ...position, paddingLeft: nodeIndent(row.depth) }}
          onClick={() => {
            // A drag that selected text is not a toggle.
            if (window.getSelection?.()?.toString()) return;
            setActive(index);
            toggle(container, row.depth);
          }}
        >
          <IconChevronDown size={13} stroke={2.2} aria-hidden="true" className={`xray-json-chevron ${row.open ? '' : 'closed'}`} />
          {depthMark(row.depth)}
          {nodeKeyLabel(row.key)}
          {duplicateTag(row)}
          <span className="xray-json-punct">{container.t === 'arr' ? '[' : '{'}</span>
          {!row.open && <span className="xray-json-summary">{nodeSummary(container)}</span>}
          {!row.open && <span className="xray-json-punct">{container.t === 'arr' ? ']' : '}'}</span>}
        </div>
      );
    }
    const hint = node.t === 'num' ? numberHint(node) : null;
    return (
      <div key={key} {...common} className={`xray-json-row xray-json-vrow xray-json-flatrow${hint ? ' has-hint' : ''}`} style={{ ...position, paddingLeft: nodeIndent(row.depth) + 8 }}>
        <span className="xray-json-gutter" />
        {depthMark(row.depth)}
        {nodeKeyLabel(row.key)}
        {duplicateTag(row)}
        <span className={`xray-json-value ${scalarClass(node)}`}>{scalarText(node)}</span>
        {inexactTag(hint)}
      </div>
    );
  }

  return (
    <div className="xray-json xray-json-tree is-virtual">
      <div className="xray-json-tree-toolbar">
        <button type="button" className="xray-json-tree-btn" onClick={() => setAll(true)} title={`Expand all nodes (${TREE_ROW_BUDGET.toLocaleString('en-US')} rows at a time)`}>
          <IconFoldDown size={13} stroke={2} />Expand all
        </button>
        <button type="button" className="xray-json-tree-btn" onClick={() => setAll(false)} title="Collapse all nodes">
          <IconFold size={13} stroke={2} />Collapse all
        </button>
        {notes}
      </div>
      <div ref={scrollRef} className="xray-json-vscroll">
        <div className="xray-json-vlist" role="tree" aria-label={label} style={{ height: virtualizer.getTotalSize() }} onKeyDown={onKeyDown}>
          {items.map((item) => renderRow(rows[item.index], item.index, item.start, item.key))}
        </div>
      </div>
    </div>
  );
});
