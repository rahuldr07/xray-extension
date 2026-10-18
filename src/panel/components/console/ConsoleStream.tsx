import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  IconAlertTriangle,
  IconArrowDown,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconCircleX,
  IconLayoutSidebarRightExpand,
} from '@tabler/icons-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { EmptyState } from '../common/EmptyState';
import { LogDetail } from '../detail/LogDetail';
import { JsonView } from '../detail/JsonView';
import { usePanelStore } from '../../store';
import type { ConsoleEvent, XrayEntry } from '../../types';
import { matchesConsoleFilter, pairConsoleEvents, pairedUnit, unitMatchesConsoleFilter, type ConsoleFilter } from '../../models/logLevels';
import { BIG_ITEM_LIMIT, describeResult } from '../../models/consoleResults';
import { formatTime, safeStringify, stripXrayRefs } from '../../utils';
import { ExampleCommands } from './ExampleCommands';
import { ErrorBlock, extractConsoleError, type ConsoleError } from './consoleErrors';

export { ErrorBlock, extractConsoleError } from './consoleErrors';
import { CommandCell, type InspectRequest } from './CommandCell';
import type { ResultViewMode } from './ResultView';

const iconProps = { size: 16, stroke: 1.8 } as const;

const CONSOLE_SEARCH_MAX_CHARS = 20_000;
const CONSOLE_SEARCH_MESSAGE_CHARS = 8_000;
// Two separators plus 8,000 + 5,999 + 5,999 stay within the 20,000-char
// haystack cap without clipping the tail of the args budget.
const CONSOLE_SEARCH_STRUCTURED_CHARS = 5_999;

function consoleSearchHaystack(event: ConsoleEvent): string {
  const message = String(event.message || '').slice(0, CONSOLE_SEARCH_MESSAGE_CHARS);
  const data = event.data === undefined ? '' : typeof event.data === 'string'
    ? event.data.slice(0, CONSOLE_SEARCH_STRUCTURED_CHARS)
    : safeStringify(event.data, 0, CONSOLE_SEARCH_STRUCTURED_CHARS);
  const args = event.args === undefined ? '' : safeStringify(event.args, 0, CONSOLE_SEARCH_STRUCTURED_CHARS);
  return `${message} ${data} ${args}`.slice(0, CONSOLE_SEARCH_MAX_CHARS).toLowerCase();
}

// A cell searches its command source (bounded like a message) plus its output's
// haystack, so a query typed from the code you ran finds the cell.
function cellSearchHaystack(command: ConsoleEvent, result: ConsoleEvent | undefined): string {
  const source = String(command.message || '').slice(0, CONSOLE_SEARCH_MESSAGE_CHARS).toLowerCase();
  return result ? `${source} ${consoleSearchHaystack(result)}` : source;
}

export function useConsoleEvents(): ConsoleEvent[] {
  const events = usePanelStore((state) => state.consoleEvents);
  return useMemo(() => events.filter((event) => event.type !== 'network'), [events]);
}

// A page log (or a result whose command is gone) is one row; a command and its
// result render together as one cell.
type StreamRow =
  | { kind: 'log'; event: ConsoleEvent; count: number; source?: string }
  | { kind: 'cell'; command: ConsoleEvent; result?: ConsoleEvent };

// The top user frame of an error's stack — its origin location, e.g.
// "https://…/app.js:42:10". Empty when the stack has no locatable frame.
function errorOrigin(error: ConsoleError): string {
  for (const line of error.stack.split('\n')) {
    const match = line.match(/((?:https?|chrome-extension|webpack|file|blob):[^)\s]+:\d+:\d+)/);
    if (match) return match[1];
  }
  return '';
}

// "https://host/path/app.js:42:10" -> "app.js:42" for a compact right-aligned tag.
// An inline document script has no basename ("https://host/:90:1"); label it
// "(index):90" the way DevTools does, rather than a bare ":90".
function shortLocation(location: string): string {
  const noQuery = location.split('?')[0];
  const file = noQuery.split('/').pop() || noQuery;
  const parts = file.split(':');
  const name = parts[0] || '(index)';
  return parts.length >= 2 ? `${name}:${parts[1]}` : file;
}

// A page log's source location when the capture carries one. Plain console.log
// calls arrive without a location (content/console-capture.js sends none), so only
// a logged Error's top stack frame gives one — nothing is guessed otherwise.
function logSource(event: ConsoleEvent): string {
  const error = extractConsoleError(event);
  return error ? errorOrigin(error) : '';
}

export function ConsoleStream({ levelFilter, query, onClearFilter, onRerun, onOpenInspector }: {
  levelFilter: ConsoleFilter;
  query: string;
  onClearFilter: () => void;
  onRerun?: (code: string) => void;
  onOpenInspector?: (request: InspectRequest) => void;
}): React.ReactElement {
  const events = useConsoleEvents();
  const expandedId = usePanelStore((state) => state.expandedId);
  const runningId = usePanelStore((state) => state.consoleRun?.id ?? null);
  const parentRef = useRef<HTMLDivElement | null>(null);
  const sizerRef = useRef<HTMLDivElement | null>(null);
  const pinnedRef = useRef(true);
  const lastTotalRef = useRef(0);
  const pinTimerRef = useRef(0);
  // Where the last pin left the tail (null right after an explicit jump). A pin beat
  // that finds the reader above it knows they scrolled up — even though the scroll
  // event that will say so has not been dispatched yet — and stands down.
  const pinnedTopRef = useRef<number | null>(null);
  const filterKeyRef = useRef(`${levelFilter} ${query}`);
  const [pinnedUi, setPinnedUi] = useState(true);
  const [newCount, setNewCount] = useState(0);

  // Per-cell Table/Tree/JSON choice lives here, not in the cell: virtualized
  // rows unmount when scrolled away and would forget it.
  const [views, setViews] = useState<Record<string, ResultViewMode>>({});
  const setView = useCallback((cellId: string, view: ResultViewMode) => {
    setViews((prev) => ({ ...prev, [cellId]: view }));
  }, []);

  // One timeline (S1): cells sit at their command's position. A cell matches the
  // level filter when its command or its output does, and the text filter when its
  // source or its output does — checked together, so Errors + a query that matches
  // a failed command's source still finds it.
  const { rows, visibleCount } = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    const out: StreamRow[] = [];
    let count = 0;
    for (const paired of pairConsoleEvents(events)) {
      if (paired.kind === 'cell') {
        if (!unitMatchesConsoleFilter(pairedUnit(paired), levelFilter)) continue;
        if (trimmed && !cellSearchHaystack(paired.command, paired.result).includes(trimmed)) continue;
        out.push({ kind: 'cell', command: paired.command, result: paired.result });
        count += 1;
        continue;
      }
      const event = paired.event;
      if (!matchesConsoleFilter(event, levelFilter)) continue;
      if (trimmed && !consoleSearchHaystack(event).includes(trimmed)) continue;
      count += 1;
      // S4: consecutive identical page logs (same level, message and source)
      // collapse into one row with a ×N badge — heartbeat/polling logs otherwise
      // bury everything else.
      const prev = out[out.length - 1];
      // Cheap checks first: the source (an Error stack parse) is only computed for
      // a candidate repeat, and the run's source is computed once and kept.
      if (prev && prev.kind === 'log' && event.type === 'log' && prev.event.type === 'log' &&
        prev.event.level === event.level && prev.event.message === event.message) {
        prev.source ??= logSource(prev.event);
        if (prev.source === logSource(event)) {
          prev.count += 1;
          continue;
        }
      }
      out.push({ kind: 'log', event, count: 1 });
    }
    return { rows: out, visibleCount: count };
  }, [events, levelFilter, query]);

  const rowKey = (row: StreamRow | undefined): string | undefined =>
    row ? (row.kind === 'cell' ? 'cell:' + (row.command.commandId || row.command.id) : row.event.id) : undefined;

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => {
      const row = rows[index];
      if (row?.kind === 'cell') return row.result && !row.result.cancelled ? 120 : 64;
      return row && expandedId === row.event.id ? 220 : 36;
    },
    getItemKey: (index) => rowKey(rows[index]) || index,
    measureElement: (element) => element.getBoundingClientRect().height,
    overscan: 10,
  });

  // Set the stream to its tail — unless the reader has scrolled above where the
  // last pin left it (the scroll event saying so may not have run yet), in which
  // case they are no longer following and the pin stands down.
  const pinTail = useCallback((): void => {
    const el = parentRef.current;
    if (!el || !pinnedRef.current) return;
    const last = pinnedTopRef.current;
    if (last !== null && el.scrollTop < Math.min(last, el.scrollHeight - el.clientHeight) - 2) {
      pinnedRef.current = false;
      return;
    }
    el.scrollTop = el.scrollHeight;
    pinnedTopRef.current = el.scrollTop;
  }, []);

  // Pins by scrollTop rather than virtualizer.scrollToIndex: the virtualizer keeps
  // reconciling toward its target for frames after the call and would drag a reader
  // who scrolled up in that window back down (S5).
  const scrollToBottom = useCallback(() => {
    // Dynamic row measurement grows the scroll area for a couple of frames
    // after the jump, so a single pin lands short — settle it over a few beats.
    // Every beat re-checks pinnedRef: in a log storm these queue up several deep,
    // and one firing after the user scrolled up must not drag them back down.
    const pin = (): void => {
      if (!pinnedRef.current) return;
      pinTail();
    };
    pin();
    requestAnimationFrame(() => {
      pin();
      requestAnimationFrame(pin);
    });
    window.clearTimeout(pinTimerRef.current);
    pinTimerRef.current = window.setTimeout(pin, 80);
  }, [pinTail]);

  // Rows measured after a pin grow the content: a reader following the tail stays
  // on it (the guard in pinTail leaves a reader who scrolled up where they are).
  useEffect(() => {
    const sizer = sizerRef.current;
    if (!sizer || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(() => { if (pinnedRef.current) pinTail(); });
    observer.observe(sizer);
    return () => observer.disconnect();
  }, [pinTail]);

  useEffect(() => () => window.clearTimeout(pinTimerRef.current), []);

  // The stream gets shorter when the prompt grows (a longer draft, the expanded
  // editor): a reader following the tail keeps the newest rows in view.
  useEffect(() => {
    const el = parentRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    let height = el.clientHeight;
    const observer = new ResizeObserver(() => {
      const next = el.clientHeight;
      if (next !== height && next > 0 && pinnedRef.current) {
        el.scrollTop = el.scrollHeight;
        pinnedTopRef.current = el.scrollTop;
      }
      height = next;
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Follow the tail while the user is at the bottom; otherwise count what they
  // haven't seen and offer a jump pill.
  useEffect(() => {
    const total = visibleCount;
    // A level/search change re-slices the same history — that is not new traffic,
    // so rebaseline against it. Counting the difference would pop a "397 new" pill
    // just for switching the filter back to All.
    const filterKey = `${levelFilter} ${query}`;
    if (filterKeyRef.current !== filterKey) {
      filterKeyRef.current = filterKey;
      lastTotalRef.current = total;
      setNewCount(0);
      return;
    }
    // Capture the delta by value: the updater callback runs after this effect
    // has already advanced lastTotalRef, so reading the ref inside it would
    // always yield zero.
    const delta = total - lastTotalRef.current;
    lastTotalRef.current = total;
    if (delta > 0) {
      if (pinnedRef.current) scrollToBottom();
      else setNewCount((count) => count + delta);
    }
  }, [visibleCount, levelFilter, query, scrollToBottom]);

  const handleScroll = useCallback(() => {
    const el = parentRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
    pinnedRef.current = atBottom;
    pinnedTopRef.current = atBottom ? el.scrollTop : pinnedTopRef.current;
    setPinnedUi(atBottom);
    if (atBottom) setNewCount(0);
  }, []);

  // S5: the pill re-pins and follows the tail again. It unmounts on click, so
  // focus (which a click or Enter gave it) moves to the prompt instead of the body.
  const jumpToLatest = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    const root = event.currentTarget.getRootNode() as Document | ShadowRoot;
    const hadFocus = root.activeElement === event.currentTarget;
    setNewCount(0);
    pinnedRef.current = true;
    pinnedTopRef.current = null;
    setPinnedUi(true);
    scrollToBottom();
    if (hadFocus) root.querySelector<HTMLElement>('[aria-label="Console command"]')?.focus();
  }, [scrollToBottom]);

  // S5: running a command always scrolls to its cell, even when the reader had
  // scrolled up. Keyed on the run id once its cell is in the rows (the run and its
  // command land in separate store updates); a run is handled once.
  const scrolledRunRef = useRef<string | null>(null);
  useEffect(() => {
    if (!runningId || scrolledRunRef.current === runningId) return;
    if (!rows.some((row) => row.kind === 'cell' && (row.command.commandId || row.command.id) === runningId)) return;
    scrolledRunRef.current = runningId;
    pinnedRef.current = true;
    pinnedTopRef.current = null;
    setPinnedUi(true);
    setNewCount(0);
    scrollToBottom();
  }, [runningId, rows, scrollToBottom]);

  const filtered = levelFilter !== 'all' || query.trim().length > 0;

  return (
    <section className="xray-console-stream-wrap">
      <div className="xray-console-stream" ref={parentRef} onScroll={handleScroll}>
        <div ref={sizerRef} style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
          {virtualizer.getVirtualItems().map((item) => {
            // rows can shrink between the virtualizer's last measurement and this
            // render (a filter keystroke, or clearConsole mid-stream), leaving an
            // index past the end — matching the guard getItemKey already uses.
            const row = rows[item.index];
            if (!row) return null;
            return (
              <div key={item.key} data-index={item.index} ref={virtualizer.measureElement} style={{ position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${item.start}px)` }}>
                {row.kind === 'cell' ? (
                  <CommandCell
                    command={row.command}
                    result={row.result}
                    running={runningId === (row.command.commandId || row.command.id)}
                    rerunDisabled={runningId !== null}
                    view={views[row.command.commandId || row.command.id]}
                    onViewChange={setView}
                    onRerun={onRerun}
                    onOpenInspector={onOpenInspector}
                  />
                ) : (
                  <ConsoleRow event={row.event} count={row.count} onOpenInspector={onOpenInspector} />
                )}
              </div>
            );
          })}
        </div>
        {!rows.length && (
          <EmptyState
            label={filtered ? 'No matching messages' : 'No console messages'}
            hint={filtered ? 'Nothing matches the current level filter and search.' : 'console.log / warn / error from the page appear here, alongside results from commands you run below.'}
            action={filtered ? <button className="xray-btn" onClick={onClearFilter}>Clear filter</button> : <ExampleCommands />}
          />
        )}
      </div>
      {!pinnedUi && newCount > 0 && (
        <button type="button" className="xray-newmsg-pill" onClick={jumpToLatest}>
          <IconArrowDown size={14} stroke={2} aria-hidden="true" />
          <span>{newCount} new {newCount === 1 ? 'message' : 'messages'}</span>
          <span className="xray-newmsg-sep" aria-hidden="true">·</span>
          <span>Jump to latest</span>
        </button>
      )}
    </section>
  );
}

// The first logged object/array that is big by the C6 threshold, for Open in inspector.
// The item count settles most cases without serializing; only small-but-maybe-heavy
// values pay for describeResult's size check.
function bigLogValue(event: ConsoleEvent): unknown {
  if (event.type !== 'log' || !Array.isArray(event.args)) return undefined;
  for (const arg of event.args) {
    if (!arg || typeof arg !== 'object') continue;
    const count = Array.isArray(arg) ? arg.length : Object.keys(arg).length;
    if (count > BIG_ITEM_LIMIT) return stripXrayRefs(arg);
    const value = stripXrayRefs(arg);
    if (describeResult(value, '').big) return value;
  }
  return undefined;
}

export const ConsoleRow = React.memo(function ConsoleRow({ event, count, onOpenInspector }: {
  event: ConsoleEvent;
  count: number;
  onOpenInspector?: (request: InspectRequest) => void;
}): React.ReactElement {
  const expandedId = usePanelStore((state) => state.expandedId);
  const toggleExpanded = usePanelStore((state) => state.toggleExpanded);
  const isExpanded = expandedId === event.id;
  const consoleError = useMemo(() => extractConsoleError(event), [event]);
  const canExpand = event.type === 'result' || (consoleError ? !!consoleError.stack : false) ||
    event.data !== undefined || !!event.args?.some((arg) => arg && typeof arg === 'object');
  // Only carry a glyph where it means something — input (>), output (<), errors
  // and warnings. Plain page logs get a quiet dot, so the stream reads as text,
  // not a column of repeated terminal icons (Chrome/Firefox console model).
  const icon = event.type === 'command'
    ? <IconChevronRight {...iconProps} />
    : event.type === 'result'
      ? <IconChevronLeft {...iconProps} />
      : event.level === 'error'
        ? <IconCircleX {...iconProps} />
        : event.level === 'warn'
          ? <IconAlertTriangle {...iconProps} />
          : <span className="xray-console-dot" aria-hidden="true" />;

  // Page logs go through LogDetail (lazy "Load full object" support); everything
  // else renders a JSON tree with internal lazy-ref markers stripped out.
  const logEntry: XrayEntry | null = isExpanded && event.type === 'log' && event.entryId && !consoleError
    ? usePanelStore.getState().entries.find((entry) => entry.id === event.entryId) || null
    : null;
  const expandedData = useMemo(
    () => (isExpanded && !logEntry && !consoleError ? stripXrayRefs(event.data ?? event.args ?? event.message) : null),
    [isExpanded, logEntry, consoleError, event],
  );

  const inspectable = useMemo(() => (onOpenInspector ? bigLogValue(event) : undefined), [onOpenInspector, event]);

  // The toggle (glyph + message + badges) and the aside (source, Open in inspector,
  // time) are siblings, so no interactive control nests inside another.
  return (
    <div className={`xray-console-row ${event.type} ${event.level} ${consoleError ? 'is-error' : ''}`}>
      <div
        className="xray-console-toggle"
        role={canExpand ? 'button' : undefined}
        tabIndex={canExpand ? 0 : undefined}
        aria-expanded={canExpand ? isExpanded : undefined}
        onClick={canExpand ? () => toggleExpanded(event.id) : undefined}
        onKeyDown={canExpand ? (keyEvent) => { if (keyEvent.key === 'Enter' || keyEvent.key === ' ') { keyEvent.preventDefault(); toggleExpanded(event.id); } } : undefined}
      >
        <span className="xray-console-glyph">{isExpanded ? <IconChevronDown {...iconProps} /> : icon}</span>
        <span className="xray-console-message">
          {consoleError
            ? <><span className="xray-error-name">{consoleError.name}</span>{consoleError.message ? `: ${consoleError.message}` : ''}</>
            : event.message}
          {count > 1 && <span className="xray-repeat-badge" title={`${count} identical consecutive messages`}>×{count}</span>}
          {event.truncated && <span className="xray-truncated-badge" title="The result was truncated to fit the transfer limit">truncated</span>}
        </span>
      </div>
      <span className="xray-console-aside">
        {/* Error origin (top stack frame) shown where it's free - the parsed
            stack already has it (Chrome/Firefox file:line convention). */}
        {consoleError && errorOrigin(consoleError) && <span className="xray-console-source" title={errorOrigin(consoleError)}>{shortLocation(errorOrigin(consoleError))}</span>}
        {inspectable !== undefined && onOpenInspector && (
          <button
            type="button"
            className="xray-icon-btn xray-console-inspect"
            aria-label="Open in inspector"
            title="Open in inspector"
            data-inspect-id={event.id}
            onClick={() => onOpenInspector({ cellId: event.id, value: inspectable, label: event.message.slice(0, 80) || 'Page log' })}
          >
            <IconLayoutSidebarRightExpand size={15} stroke={1.8} />
          </button>
        )}
        <span className="xray-console-time">{formatTime(event.timestamp)}</span>
      </span>
      {isExpanded && (
        <div className="xray-detail">
          {consoleError ? (
            <ErrorBlock error={consoleError} />
          ) : logEntry ? (
            <LogDetail entry={logEntry} />
          ) : (
            <JsonView value={expandedData} />
          )}
        </div>
      )}
    </div>
  );
});
