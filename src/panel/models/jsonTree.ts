/**
 * The API detail Tree's rows (docs/superpowers/specs/2026-10-14-json-fidelity-design.md §2, J3):
 * the lossless parser's JsonNode tree flattened into the rows the view windows, in source order, a
 * duplicate key marked on each repeat, numbers left as nodes so they render by lexeme.
 *
 * Bounded at every size: a container shows its children TREE_CHILD_CHUNK at a time (a "more" row
 * reveals the next chunk), and flattening stops after `budget` rows with a "budget" row — so Expand
 * all on a 2,000-deep or a 5 MB body is a few thousand rows, and "show more rows" continues it
 * (progressive). Iterative: a 100,000-deep body flattens without recursion.
 *
 * Open state is keyed by node identity (the parse is cached, so nodes are stable), never by a path
 * string — a path to depth 20,000 would be 20,000 segments long on every row. Pure: no DOM.
 */
import type { JsonContainerNode, JsonNode, JsonNumberNode } from './jsonText';

/** Children shown per container before a "more" row. */
export const TREE_CHILD_CHUNK = 100;
/** Rows flattened at most before a "budget" row; each "show more rows" adds as many again. */
export const TREE_ROW_BUDGET = 20_000;
/** Containers shallower than this open by default. */
export const TREE_DEFAULT_OPEN_DEPTH = 4;

export interface TreeOpenState {
  /** Expand all (true) or Collapse all (false) as the baseline; null: open above the default depth. */
  all: boolean | null;
  /** Containers toggled away from the baseline. */
  overrides: ReadonlyMap<JsonContainerNode, boolean>;
  /** Children shown per container (TREE_CHILD_CHUNK when absent). */
  shown: ReadonlyMap<JsonContainerNode, number>;
  /** Rows flattened at most. */
  budget: number;
}

export function defaultTreeState(): TreeOpenState {
  return { all: null, overrides: new Map(), shown: new Map(), budget: TREE_ROW_BUDGET };
}

/** A value: `key` is its array index or object key (null for the root); `open` is null when there is nothing to open. */
export interface TreeNodeRow {
  type: 'node';
  node: JsonNode;
  depth: number;
  key: string | number | null;
  /** The key repeats an earlier key of the same object. */
  dup: boolean;
  open: boolean | null;
}

/** The closing bracket of an open container. */
export interface TreeCloseRow {
  type: 'close';
  node: JsonContainerNode;
  depth: number;
}

/** "Show N more": `hidden` children of `node` are not listed yet. */
export interface TreeMoreRow {
  type: 'more';
  node: JsonContainerNode;
  depth: number;
  hidden: number;
}

/** Flattening stopped at the row budget. */
export interface TreeBudgetRow {
  type: 'budget';
  depth: number;
}

export type TreeRow = TreeNodeRow | TreeCloseRow | TreeMoreRow | TreeBudgetRow;

export function isContainerNode(node: JsonNode): node is JsonContainerNode {
  return node.t === 'obj' || node.t === 'arr';
}

export function childCount(node: JsonContainerNode): number {
  return node.t === 'obj' ? node.entries.length : node.items.length;
}

export function isTreeOpen(state: TreeOpenState, node: JsonContainerNode, depth: number): boolean {
  const override = state.overrides.get(node);
  if (override !== undefined) return override;
  return state.all === null ? depth < TREE_DEFAULT_OPEN_DEPTH : state.all;
}

export function flattenJsonTree(root: JsonNode, state: TreeOpenState): TreeRow[] {
  const rows: TreeRow[] = [];
  const budget = Math.max(1, Math.floor(state.budget));
  // Open containers, innermost last: the node, its depth, the next child to list, how many to list.
  const nodes: JsonContainerNode[] = [];
  const depths: number[] = [];
  const next: number[] = [];
  const limits: number[] = [];

  const emit = (node: JsonNode, depth: number, key: string | number | null, dup: boolean): void => {
    if (!isContainerNode(node) || childCount(node) === 0) {
      rows.push({ type: 'node', node, depth, key, dup, open: null });
      return;
    }
    const open = isTreeOpen(state, node, depth);
    rows.push({ type: 'node', node, depth, key, dup, open });
    if (!open) return;
    nodes.push(node);
    depths.push(depth);
    next.push(0);
    limits.push(Math.min(childCount(node), Math.max(1, state.shown.get(node) ?? TREE_CHILD_CHUNK)));
  };

  emit(root, 0, null, false);
  while (nodes.length > 0) {
    if (rows.length >= budget) {
      rows.push({ type: 'budget', depth: 0 });
      return rows;
    }
    const top = nodes.length - 1;
    const node = nodes[top];
    const depth = depths[top];
    const index = next[top];
    if (index < limits[top]) {
      next[top] = index + 1;
      if (node.t === 'arr') {
        emit(node.items[index], depth + 1, index, false);
      } else {
        const entry = node.entries[index];
        emit(entry.value, depth + 1, entry.key, entry.dup === true);
      }
      continue;
    }
    const total = childCount(node);
    if (limits[top] < total) rows.push({ type: 'more', node, depth: depth + 1, hidden: total - limits[top] });
    rows.push({ type: 'close', node, depth });
    nodes.pop();
    depths.pop();
    next.pop();
    limits.pop();
  }
  return rows;
}

/** Why a number is flagged (JsonNumberNode.exact): what JavaScript reads instead. Null when exact. */
export function numberHint(node: JsonNumberNode): string | null {
  if (node.exact) return null;
  return `JavaScript reads this as ${Object.is(node.value, -0) ? '0' : String(node.value)}`;
}

/** "3 items" / "1 key". */
export function containerSummary(node: JsonContainerNode): string {
  const size = childCount(node);
  return node.t === 'arr' ? `${size} ${size === 1 ? 'item' : 'items'}` : `${size} ${size === 1 ? 'key' : 'keys'}`;
}

const nodeIds = new WeakMap<JsonNode, number>();
let lastNodeId = 0;

function nodeId(node: JsonNode): number {
  let id = nodeIds.get(node);
  if (id === undefined) {
    id = ++lastNodeId;
    nodeIds.set(node, id);
  }
  return id;
}

/** A key that stays with its row across flattens (windowing measures rows by key). */
export function rowKey(row: TreeRow): string {
  if (row.type === 'budget') return 'budget';
  const id = nodeId(row.node);
  return row.type === 'node' ? `n${id}` : row.type === 'close' ? `c${id}` : `m${id}`;
}
