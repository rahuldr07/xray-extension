import React, { useEffect, useMemo, useRef, useState } from 'react';
import { IconArrowLeft, IconCopy, IconCornerDownLeft, IconSearch, IconX } from '@tabler/icons-react';
import { usePanelStore } from '../../store';
import { describeResult } from '../../models/consoleResults';
import { formatPath, parsePlainPath, type PathSegment } from '../../models/consoleAssist';
import { pushEscapeLayer } from '../../runtime/panelKeyboard';
import { copyText, safeStringify } from '../../utils';
import { JsonView } from '../detail/JsonView';
import { ResultTable, type ResultViewMode } from './ResultView';

const iconProps = { size: 15, stroke: 1.8 } as const;
const JSON_TEXT_LIMIT = 200_000;
const SIMPLE_IDENT = /^[A-Za-z_$][\w$]*$/;

/**
 * What an inspector path is prefixed with (spec C7): the cell's saved variable, else
 * its expression — as-is when it is a plain path or identifier, parenthesized when it
 * is a single-line expression. Multi-line or multi-statement code has no expression
 * to prefix (null): paths are then shown relative and Use in prompt is unavailable.
 */
export function inspectorRoot(code: string | undefined, variable?: string): string | null {
  if (variable) return variable;
  const text = (code ?? '').trim();
  if (!text) return null;
  if (SIMPLE_IDENT.test(text) || parsePlainPath(text)) return text;
  if (text.includes('\n') || text.includes(';')) return null;
  return `(${text})`;
}

/** A path for display: rooted when there is a root, else relative (`users[0]`, `[0]`). */
export function inspectorPath(root: string | null, segments: PathSegment[]): string {
  if (root) return formatPath(root, segments);
  if (!segments.length) return 'value';
  const text = formatPath('', segments);
  return text.startsWith('.') ? text.slice(1) : text;
}

function focusables(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(
    'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )).filter((element) => element.offsetParent !== null);
}

/**
 * The inspector for a big result (spec C7): Tree / Table (when eligible) / JSON views,
 * a key/path filter, and a footer with the selected node's path, Copy path and Use in
 * prompt. `mode` comes from the Console's width: `docked` beside the stream (≥ 900 px),
 * `overlay` covering the Console with a Back control. Escape closes it through the panel
 * keyboard's layer stack (open menu → inspector → panel); the overlay also traps Tab
 * like ModalShell. Nothing here evaluates code.
 */
export function ResultInspector({ value, label, rootExpression, mode, onClose, onUsePath }: {
  value: unknown;
  label: string;
  rootExpression: string | null;
  mode: 'docked' | 'overlay';
  onClose: () => void;
  onUsePath: (path: string) => void;
}): React.ReactElement {
  const showToast = usePanelStore((state) => state.showToast);
  const description = useMemo(() => describeResult(value, ''), [value]);
  const tableAllowed = description.kind === 'table';
  const [view, setView] = useState<ResultViewMode>('tree');
  const [filter, setFilter] = useState('');
  const deferredFilter = React.useDeferredValue(filter);
  const [selected, setSelected] = useState<PathSegment[] | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const filterRef = useRef<HTMLInputElement | null>(null);
  const overlay = mode === 'overlay';

  const jsonText = useMemo(() => (view === 'json' ? safeStringify(value, 2, JSON_TEXT_LIMIT) : ''), [view, value]);
  const path = selected ? inspectorPath(rootExpression, selected) : '';

  // Escape: a layer below dialogs and menus, above the panel.
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; });
  useEffect(() => pushEscapeLayer(() => {
    if (!sectionRef.current?.isConnected) return false;
    closeRef.current();
    return true;
  }), []);

  // Opening moves focus into the inspector (the filter).
  useEffect(() => {
    (filterRef.current ?? (sectionRef.current ? focusables(sectionRef.current)[0] : null))?.focus();
  }, []);

  function onKeyDown(event: React.KeyboardEvent<HTMLElement>): void {
    if (!overlay || event.key !== 'Tab' || !sectionRef.current) return;
    const items = focusables(sectionRef.current);
    if (!items.length) return;
    const root = sectionRef.current.getRootNode() as Document | ShadowRoot;
    const active = root.activeElement;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && active === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && active === last) { event.preventDefault(); first.focus(); }
  }

  async function copyPath(): Promise<void> {
    if (!path) return;
    try {
      await copyText(path);
      showToast('Copied path.');
    } catch {
      showToast('Could not copy. Check clipboard permissions.');
    }
  }

  const modes: Array<{ id: ResultViewMode; label: string }> = [
    ...(tableAllowed ? [{ id: 'table' as const, label: 'Table' }] : []),
    { id: 'tree', label: 'Tree' },
    { id: 'json', label: 'JSON' },
  ];

  return (
    <section
      ref={sectionRef}
      className={`xray-inspector is-${mode}`}
      role={overlay ? 'dialog' : 'complementary'}
      aria-modal={overlay ? true : undefined}
      aria-label={`Inspector: ${label}`}
      onKeyDown={onKeyDown}
    >
      <header className="xray-inspector-head">
        {overlay && (
          <button type="button" className="xray-btn xray-inspector-back" aria-label="Back to console" onClick={onClose}>
            <IconArrowLeft {...iconProps} /><span>Back</span>
          </button>
        )}
        <div className="xray-inspector-title">
          <span className="xray-inspector-kicker">Inspector</span>
          <code className="xray-inspector-label" title={label}>{label}</code>
        </div>
        <span className="xray-result-badge">{description.badge}</span>
        {!overlay && (
          <button type="button" className="xray-icon-btn xray-inspector-close" aria-label="Close inspector" title="Close inspector (Esc)" onClick={onClose}>
            <IconX {...iconProps} />
          </button>
        )}
      </header>
      <div className="xray-inspector-tools">
        <div className="xray-result-views" role="group" aria-label="Inspector view">
          {modes.map((item) => (
            <button
              key={item.id}
              type="button"
              className="xray-result-view-btn"
              aria-label={`${item.label} view`}
              aria-pressed={view === item.id}
              onClick={() => setView(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        {view === 'tree' && (
          <label className="xray-search xray-inspector-filter">
            <IconSearch {...iconProps} />
            <input
              ref={filterRef}
              className="xray-input"
              aria-label="Filter keys and paths"
              placeholder="Filter keys and paths…"
              value={filter}
              onChange={(event) => setFilter(event.currentTarget.value)}
            />
          </label>
        )}
      </div>
      <div className="xray-inspector-body">
        {view === 'table' && tableAllowed ? (
          <ResultTable rows={value as unknown[]} columns={description.columns} />
        ) : view === 'json' ? (
          <pre className="xray-json xray-result-json">{jsonText}</pre>
        ) : (
          <JsonView value={value} onSelectPath={setSelected} filter={deferredFilter} />
        )}
      </div>
      <footer className="xray-inspector-foot">
        {path
          ? <code className="xray-inspector-path" title={path}>{path}</code>
          : <span className="xray-inspector-path is-empty">Select a node to see its path</span>}
        <span className="xray-inspector-actions">
          <button type="button" className="xray-btn" aria-label="Copy path" disabled={!path} onClick={() => void copyPath()}>
            <IconCopy {...iconProps} /><span>Copy path</span>
          </button>
          <button
            type="button"
            className="xray-btn"
            aria-label="Use in prompt"
            disabled={!path || !rootExpression}
            title={rootExpression ? 'Insert the path at the caret in the Console command' : 'No expression to prefix: save the value as a variable to reference it'}
            onClick={() => onUsePath(path)}
          >
            <IconCornerDownLeft {...iconProps} /><span>Use in prompt</span>
          </button>
        </span>
      </footer>
    </section>
  );
}
