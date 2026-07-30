import React from 'react';
import { IconChevronDown, IconFold, IconFoldDown } from '@tabler/icons-react';
import { safeStringify } from '../../utils';

// Above this many characters the interactive tree would build too many DOM
// nodes to stay responsive, so we fall back to the flat highlighted text view
// (which itself drops highlighting past 600 lines).
const TREE_CHAR_BUDGET = 60_000;
// Containers deeper than this render as a collapsed summary until expanded, so
// a huge nested payload never mounts thousands of rows up front.
const DEFAULT_OPEN_DEPTH = 4;

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

export const JsonView = React.memo(function JsonView({ value }: { value: unknown }): React.ReactElement {
  // Cheap size gate up front — huge bodies keep the old flat text view.
  const oversized = React.useMemo(() => safeStringify(value, 0, TREE_CHAR_BUDGET + 1).length > TREE_CHAR_BUDGET, [value]);

  // Collapse overrides: a path in this set is forced to the non-default state.
  // Bumping `epoch` (expand-all/collapse-all) resets everyone to the new baseline.
  const [overrides, setOverrides] = React.useState<Map<string, boolean>>(() => new Map());
  const [allOpen, setAllOpen] = React.useState<boolean | null>(null);
  React.useEffect(() => { setOverrides(new Map()); setAllOpen(null); }, [value]);

  const isOpen = React.useCallback((path: string, depth: number): boolean => {
    const override = overrides.get(path);
    if (override !== undefined) return override;
    if (allOpen !== null) return allOpen;
    return depth < DEFAULT_OPEN_DEPTH;
  }, [overrides, allOpen]);

  const toggle = React.useCallback((path: string, depth: number): void => {
    setOverrides((prev) => {
      const next = new Map(prev);
      const current = prev.get(path) ?? (allOpen !== null ? allOpen : depth < DEFAULT_OPEN_DEPTH);
      next.set(path, !current);
      return next;
    });
  }, [allOpen]);

  if (oversized) {
    const text = safeStringify(value);
    return <pre className="xray-json xray-json-editor xray-json-text">{text}</pre>;
  }

  if (containerKind(value) === null) {
    // A bare scalar — nothing to expand.
    return <pre className="xray-json xray-json-scalar"><span className={valueClass(value)}>{renderScalar(value)}</span></pre>;
  }

  return (
    <div className="xray-json xray-json-tree" role="tree" aria-label="JSON viewer">
      <div className="xray-json-tree-toolbar">
        <button className="xray-json-tree-btn" onClick={() => { setAllOpen(true); setOverrides(new Map()); }} title="Expand all nodes">
          <IconFoldDown size={13} stroke={2} />Expand all
        </button>
        <button className="xray-json-tree-btn" onClick={() => { setAllOpen(false); setOverrides(new Map()); }} title="Collapse all nodes">
          <IconFold size={13} stroke={2} />Collapse all
        </button>
      </div>
      <div className="xray-json-tree-body">
        <TreeNode nodeKey={null} value={value} path="$" depth={0} isOpen={isOpen} toggle={toggle} />
      </div>
    </div>
  );
});

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
        <span className={valueClass(value)}>{renderScalar(value)}</span>
      </div>
    );
  }

  const entries: Array<[string | number, unknown]> = kind === 'array'
    ? (value as unknown[]).map((item, index) => [index, item])
    : Object.entries(value as Record<string, unknown>);
  const open = isOpen(path, depth);
  const brackets = kind === 'array' ? ['[', ']'] : ['{', '}'];
  const summary = kind === 'array' ? `${entries.length} ${entries.length === 1 ? 'item' : 'items'}` : `${entries.length} ${entries.length === 1 ? 'key' : 'keys'}`;

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
              path={`${path}.${childKey}`}
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
