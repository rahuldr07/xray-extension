import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  IconAlertTriangle,
  IconArrowDown,
  IconArrowDownLeft,
  IconArrowUpRight,
  IconBookmark,
  IconBookmarkPlus,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconCircleX,
  IconDownload,
  IconFilter,
  IconHelp,
  IconNetwork,
  IconPlayerPlay,
  IconPlayerRecord,
  IconRefresh,
  IconSearch,
  IconTerminal2,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import { EmptyState } from '../common/EmptyState';
import { RequestDetail } from '../detail/RequestDetail';
import { LogDetail } from '../detail/LogDetail';
import { JsonView } from '../detail/JsonView';
import { usePanelStore } from '../../store';
import type { ConsoleEvent, ConsoleMiniTab, NetworkFilter, Snippet, XrayEntry } from '../../types';
import { duration, entryPath, isApi } from '../../models/entries';
import { executeConsoleCommand, navigateConsoleHistory } from '../../runtime/consoleBridge';
import { eventEntry, formatBytes, formatTime, methodClass, preview, statusClass, stripXrayRefs } from '../../utils';

const iconProps = { size: 16, stroke: 1.8 } as const;

const networkFilters: Array<{ id: NetworkFilter; label: string; icon: React.ReactNode }> = [
  { id: 'all', label: 'All', icon: <IconFilter {...iconProps} /> },
  { id: 'xhr', label: 'XHR', icon: <IconArrowUpRight {...iconProps} /> },
  { id: 'fetch', label: 'Fetch', icon: <IconArrowDownLeft {...iconProps} /> },
  { id: 'ws', label: 'WS', icon: <IconRefresh {...iconProps} /> },
  { id: 'errors', label: 'Errors', icon: <IconCircleX {...iconProps} /> },
];

const miniTabs: Array<{ id: ConsoleMiniTab; label: string; icon: React.ReactNode }> = [
  { id: 'network', label: 'Network', icon: <IconNetwork {...iconProps} /> },
  { id: 'console', label: 'Console', icon: <IconTerminal2 {...iconProps} /> },
];

type ConsoleLevelFilter = 'all' | 'log' | 'warn' | 'error' | 'result';

const consoleLevelFilters: Array<{ id: ConsoleLevelFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'log', label: 'Logs' },
  { id: 'warn', label: 'Warnings' },
  { id: 'error', label: 'Errors' },
  { id: 'result', label: 'Results' },
];

function matchesLevel(event: ConsoleEvent, filter: ConsoleLevelFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'error') return event.level === 'error' || event.type === 'error';
  if (filter === 'warn') return event.level === 'warn';
  if (filter === 'result') return event.type === 'result' || event.type === 'command';
  return event.type === 'log' && event.level !== 'warn' && event.level !== 'error';
}

function eventDuration(event: ConsoleEvent): number {
  return duration(eventEntry(event));
}

function useFilteredNetworkEvents(): ConsoleEvent[] {
  const events = usePanelStore((state) => state.consoleEvents);
  const filter = usePanelStore((state) => state.networkFilter);
  const query = usePanelStore((state) => state.searchQuery.trim().toLowerCase());

  return useMemo(() => events.filter((event) => {
    if (event.type !== 'network') return false;
    const entry = eventEntry(event);
    if (!entry) return false;
    const source = String(entry.source || '').toLowerCase();
    const status = Number(entry.status) || 0;
    if (filter === 'errors' && status < 400) return false;
    if (filter !== 'all' && filter !== 'errors' && source !== filter) return false;
    if (!query) return true;
    return String(entry.method || '').toLowerCase().includes(query) ||
      String(entry.status || '').includes(query) ||
      entryPath(entry).toLowerCase().includes(query) ||
      source.includes(query);
  }), [events, filter, query]);
}

function useConsoleEvents(): ConsoleEvent[] {
  const events = usePanelStore((state) => state.consoleEvents);
  return useMemo(() => events.filter((event) => event.type !== 'network'), [events]);
}

export function ConsoleWorkspace(): React.ReactElement {
  const mini = usePanelStore((state) => state.consoleMiniTab);
  const setMini = usePanelStore((state) => state.setConsoleMiniTab);
  const recording = usePanelStore((state) => state.recording);
  const pausedCount = usePanelStore((state) => state.pausedCount);
  const setRecording = usePanelStore((state) => state.setRecording);
  const clearConsole = usePanelStore((state) => state.clearConsole);
  const requestConfirmation = usePanelStore((state) => state.requestConfirmation);
  const setExportOpen = usePanelStore((state) => state.setExportOpen);
  const searchQuery = usePanelStore((state) => state.searchQuery);
  const setSearchQuery = usePanelStore((state) => state.setSearchQuery);
  const networkFilter = usePanelStore((state) => state.networkFilter);
  const setNetworkFilter = usePanelStore((state) => state.setNetworkFilter);
  const [levelFilter, setLevelFilter] = useState<ConsoleLevelFilter>('all');
  const [consoleQuery, setConsoleQuery] = useState('');
  const consoleEvents = useConsoleEvents();

  const levelCounts = useMemo(() => {
    const counts: Record<ConsoleLevelFilter, number> = { all: consoleEvents.length, log: 0, warn: 0, error: 0, result: 0 };
    for (const event of consoleEvents) {
      if (matchesLevel(event, 'error')) counts.error += 1;
      else if (matchesLevel(event, 'warn')) counts.warn += 1;
      else if (matchesLevel(event, 'result')) counts.result += 1;
      else counts.log += 1;
    }
    return counts;
  }, [consoleEvents]);

  return (
    <>
      <section className="xray-console-head">
        <div className="xray-console-tabs">
          {miniTabs.map((tab) => (
            <button key={tab.id} className={`xray-mini-tab ${mini === tab.id ? 'active' : ''}`} onClick={() => setMini(tab.id)}>
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
        <div className="xray-toolbar">
          <button className="xray-btn" onClick={() => requestConfirmation({
            title: 'Clear console stream?',
            message: 'This clears the React console stream only. Captured API entries remain available.',
            confirmLabel: 'Clear console',
            tone: 'danger',
            onConfirm: clearConsole,
          })}><IconTrash {...iconProps} />Clear</button>
          <button
            className={`xray-btn ${recording ? 'xray-live' : 'xray-paused'}`}
            title="Pause the live console stream. Messages keep buffering and flush back in when you resume; capture itself is toggled in Settings → Capture."
            aria-pressed={recording}
            onClick={() => setRecording(!recording)}
          >
            <IconPlayerRecord {...iconProps} />{recording ? 'Live' : pausedCount > 0 ? `Paused · ${pausedCount} new` : 'Paused'}
          </button>
          <button className="xray-btn" onClick={() => setExportOpen(true)}><IconDownload {...iconProps} />Export</button>
        </div>
      </section>
      {mini === 'network' && (
        <section className="xray-filterbar">
          <label className="xray-search">
            <IconSearch {...iconProps} />
            <input className="xray-input" placeholder="Filter by path, method, status..." value={searchQuery} onChange={(event) => setSearchQuery(event.currentTarget.value)} />
          </label>
          <div className="xray-filter-chips">
            {networkFilters.map((filter) => (
              <button key={filter.id} className={`xray-chip ${networkFilter === filter.id ? 'active' : ''}`} onClick={() => setNetworkFilter(filter.id)}>
                {filter.icon}
                {filter.label}
              </button>
            ))}
          </div>
        </section>
      )}
      {mini === 'console' && (
        <section className="xray-filterbar">
          <label className="xray-search">
            <IconSearch {...iconProps} />
            <input className="xray-input" placeholder="Filter console messages..." value={consoleQuery} onChange={(event) => setConsoleQuery(event.currentTarget.value)} />
          </label>
          <div className="xray-filter-chips">
            {consoleLevelFilters.map((filter) => (
              <button key={filter.id} className={`xray-chip ${levelFilter === filter.id ? 'active' : ''}`} onClick={() => setLevelFilter(filter.id)}>
                {filter.label}
                <span className="xray-chip-count">{levelCounts[filter.id]}</span>
              </button>
            ))}
          </div>
        </section>
      )}
      {mini === 'network' && <NetworkTable />}
      <ConsoleStream levelFilter={levelFilter} query={consoleQuery} onClearFilter={() => { setLevelFilter('all'); setConsoleQuery(''); }} />
      <SnippetBar />
      <ConsolePrompt />
      <Statusbar />
    </>
  );
}

function SnippetBar(): React.ReactElement {
  const snippets = usePanelStore((state) => state.snippets);
  const setConsoleDraft = usePanelStore((state) => state.setConsoleDraft);
  const removeSnippet = usePanelStore((state) => state.removeSnippet);
  const renameSnippet = usePanelStore((state) => state.renameSnippet);
  const saveSnippet = usePanelStore((state) => state.saveSnippet);
  const draft = usePanelStore((state) => state.consoleDraft);
  const [naming, setNaming] = useState(false);
  const [nameText, setNameText] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameText, setRenameText] = useState('');
  const [undoSnippet, setUndoSnippet] = useState<Snippet | null>(null);
  const undoTimer = useRef<number | undefined>(undefined);

  function confirmSave(): void {
    saveSnippet({ code: draft, title: nameText.trim() || undefined });
    setNaming(false);
    setNameText('');
  }

  function handleRemove(snippet: Snippet): void {
    removeSnippet(snippet.id);
    setUndoSnippet(snippet);
    window.clearTimeout(undoTimer.current);
    undoTimer.current = window.setTimeout(() => setUndoSnippet(null), 6000);
  }

  function confirmRename(id: string): void {
    renameSnippet(id, renameText);
    setRenamingId(null);
  }

  return (
    <div className="xray-snippet-bar" aria-label="Saved console snippets">
      <span className="xray-snippet-label"><IconBookmark {...iconProps} />Snippets</span>
      <div className="xray-snippet-chips">
        {snippets.length === 0 && !undoSnippet && <span className="xray-muted">Save reusable commands here.</span>}
        {snippets.map((snippet) => (
          <span key={snippet.id} className="xray-snippet-chip">
            {renamingId === snippet.id ? (
              <input
                className="xray-input xray-snippet-rename"
                value={renameText}
                autoFocus
                placeholder="Snippet name"
                onChange={(event) => setRenameText(event.currentTarget.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') confirmRename(snippet.id);
                  else if (event.key === 'Escape') setRenamingId(null);
                }}
                onBlur={() => confirmRename(snippet.id)}
              />
            ) : (
              <button
                className="xray-snippet-load"
                title={`${snippet.code}\n\nDouble-click to rename`}
                onClick={() => setConsoleDraft(snippet.code)}
                onDoubleClick={() => { setRenamingId(snippet.id); setRenameText(snippet.title || ''); }}
              >
                {snippet.title || snippet.code}
              </button>
            )}
            <button className="xray-snippet-remove" aria-label="Delete snippet" onClick={() => handleRemove(snippet)}><IconX size={12} stroke={2} /></button>
          </span>
        ))}
        {undoSnippet && (
          <button className="xray-btn xray-snippet-undo" onClick={() => { saveSnippet({ code: undoSnippet.code, title: undoSnippet.title }); setUndoSnippet(null); }}>
            Undo delete
          </button>
        )}
      </div>
      {naming ? (
        <span className="xray-snippet-chip xray-snippet-naming">
          <input
            className="xray-input xray-snippet-rename"
            value={nameText}
            autoFocus
            placeholder="Name (optional) — Enter to save"
            onChange={(event) => setNameText(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') confirmSave();
              else if (event.key === 'Escape') { setNaming(false); setNameText(''); }
            }}
          />
          <button className="xray-btn" onClick={confirmSave}>Save</button>
        </span>
      ) : (
        <button className="xray-btn xray-snippet-save" disabled={!draft.trim()} title={draft.trim() ? 'Save current command as a snippet' : 'Type a command to save it'} onClick={() => setNaming(true)}>
          <IconBookmarkPlus {...iconProps} />Save
        </button>
      )}
    </div>
  );
}

function NetworkTable(): React.ReactElement {
  const events = useFilteredNetworkEvents();
  const networkFilter = usePanelStore((state) => state.networkFilter);
  const searchQuery = usePanelStore((state) => state.searchQuery);
  const setNetworkFilter = usePanelStore((state) => state.setNetworkFilter);
  const setSearchQuery = usePanelStore((state) => state.setSearchQuery);
  const filtered = networkFilter !== 'all' || searchQuery.trim().length > 0;
  const parentRef = useRef<HTMLDivElement | null>(null);
  // One pass here instead of every row re-filtering the whole event array to
  // derive the same shared maximum.
  const maxDuration = useMemo(() => Math.max(100, ...events.map(eventDuration)), [events]);
  const virtualizer = useVirtualizer({
    count: events.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => usePanelStore.getState().expandedId === events[index]?.id ? 240 : 34,
    getItemKey: (index) => events[index]?.id || index,
    measureElement: (element) => element.getBoundingClientRect().height,
    overscan: 8,
  });

  return (
    <section className="xray-network">
      <div className="xray-network-head">
        <span>Method</span><span>Status</span><span>Path</span><span>Timing</span><span>Size</span><span>Time</span>
      </div>
      <div className="xray-virtual-list" ref={parentRef}>
        <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
          {virtualizer.getVirtualItems().map((item) => (
            <div key={item.key} data-index={item.index} ref={virtualizer.measureElement} style={{ position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${item.start}px)` }}>
              <NetworkRow event={events[item.index]} maxDuration={maxDuration} />
            </div>
          ))}
        </div>
        {!events.length && (
          <EmptyState
            label={filtered ? 'No matching requests' : 'No network activity yet'}
            hint={filtered ? 'Nothing matches the current filter and search.' : 'Trigger a request on the page — fetch, XHR, and WebSocket traffic streams in here live.'}
            action={filtered ? (
              <button className="xray-btn" onClick={() => { setNetworkFilter('all'); setSearchQuery(''); }}>Clear filter</button>
            ) : undefined}
          />
        )}
      </div>
    </section>
  );
}

const NetworkRow = React.memo(function NetworkRow({ event, maxDuration }: { event: ConsoleEvent; maxDuration: number }): React.ReactElement {
  const entry = eventEntry(event);
  const slowThresholdMs = usePanelStore((state) => state.settings.slowThresholdMs);
  const selectedId = usePanelStore((state) => state.selectedId);
  const expandedId = usePanelStore((state) => state.expandedId);
  const selectEntry = usePanelStore((state) => state.selectEntry);
  const toggleExpanded = usePanelStore((state) => state.toggleExpanded);
  if (!entry) return <div />;

  const status = Number(entry.status) || 0;
  const isSelected = selectedId === entry.id;
  const isExpanded = expandedId === event.id;
  const pct = Math.max(6, Math.min(100, duration(entry) / maxDuration * 100));

  return (
    <div>
      <div
        className={`xray-network-row ${isSelected ? 'selected' : ''}`}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        onClick={() => { selectEntry(entry.id); toggleExpanded(event.id); }}
        onKeyDown={(keyEvent) => { if (keyEvent.key === 'Enter' || keyEvent.key === ' ') { keyEvent.preventDefault(); selectEntry(entry.id); toggleExpanded(event.id); } }}
      >
        <span className={`xray-method ${methodClass(entry.method)}`}>{String(entry.method || 'GET').toUpperCase().replace('DELETE', 'DEL')}</span>
        <span className={`xray-status ${statusClass(status)}`}>{status || '---'}</span>
        <span className="xray-path" title={String(entry.url || '')}>{entryPath(entry)}</span>
        <span className="xray-timing">
          <span className="xray-bar-track"><span className={`xray-bar ${duration(entry) > slowThresholdMs ? 'slow' : ''} ${status >= 400 ? 'error' : ''}`} style={{ width: `${pct}%` }} /></span>
          <span>{Math.round(duration(entry))}ms</span>
        </span>
        <span className="xray-muted">{formatBytes(entry.size)}</span>
        <span className="xray-muted">{formatTime(entry.timestamp)}</span>
      </div>
      {isExpanded && <div className="xray-detail"><RequestDetail entry={entry} compact /></div>}
    </div>
  );
});

interface StreamRow {
  event: ConsoleEvent;
  count: number;
}

function ConsoleStream({ levelFilter, query, onClearFilter }: {
  levelFilter: ConsoleLevelFilter;
  query: string;
  onClearFilter: () => void;
}): React.ReactElement {
  const events = useConsoleEvents();
  const expandedId = usePanelStore((state) => state.expandedId);
  const parentRef = useRef<HTMLDivElement | null>(null);
  const pinnedRef = useRef(true);
  const lastTotalRef = useRef(0);
  const [pinnedUi, setPinnedUi] = useState(true);
  const [newCount, setNewCount] = useState(0);

  const filteredEvents = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    return events.filter((event) => matchesLevel(event, levelFilter) &&
      (!trimmed || event.message.toLowerCase().includes(trimmed)));
  }, [events, levelFilter, query]);

  // Collapse consecutive identical page logs into one row with a ×N badge —
  // heartbeat/polling logs otherwise bury everything else.
  const rows = useMemo(() => {
    const out: StreamRow[] = [];
    for (const event of filteredEvents) {
      const prev = out[out.length - 1];
      if (prev && event.type === 'log' && prev.event.type === 'log' &&
        prev.event.level === event.level && prev.event.message === event.message) {
        prev.count += 1;
        continue;
      }
      out.push({ event, count: 1 });
    }
    return out;
  }, [filteredEvents]);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => expandedId === rows[index]?.event.id ? 220 : 36,
    getItemKey: (index) => rows[index]?.event.id || index,
    measureElement: (element) => element.getBoundingClientRect().height,
    overscan: 10,
  });

  const scrollToBottom = useCallback(() => {
    if (rows.length) virtualizer.scrollToIndex(rows.length - 1, { align: 'end' });
    // Dynamic row measurement grows the scroll area for a couple of frames
    // after the jump, so a single pin lands short — settle it over a few beats.
    const pin = (): void => {
      const el = parentRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    };
    requestAnimationFrame(() => {
      pin();
      requestAnimationFrame(pin);
    });
    window.setTimeout(pin, 80);
  }, [rows.length, virtualizer]);

  // Follow the tail while the user is at the bottom; otherwise count what they
  // haven't seen and offer a jump pill.
  useEffect(() => {
    const total = filteredEvents.length;
    // Capture the delta by value: the updater callback runs after this effect
    // has already advanced lastTotalRef, so reading the ref inside it would
    // always yield zero.
    const delta = total - lastTotalRef.current;
    lastTotalRef.current = total;
    if (delta > 0) {
      if (pinnedRef.current) scrollToBottom();
      else setNewCount((count) => count + delta);
    }
  }, [filteredEvents.length, scrollToBottom]);

  const handleScroll = useCallback(() => {
    const el = parentRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
    pinnedRef.current = atBottom;
    setPinnedUi(atBottom);
    if (atBottom) setNewCount(0);
  }, []);

  const filtered = levelFilter !== 'all' || query.trim().length > 0;

  return (
    <section className="xray-console-stream-wrap">
      <div className="xray-console-stream" ref={parentRef} onScroll={handleScroll}>
        <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
          {virtualizer.getVirtualItems().map((item) => (
            <div key={item.key} data-index={item.index} ref={virtualizer.measureElement} style={{ position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${item.start}px)` }}>
              <ConsoleRow event={rows[item.index].event} count={rows[item.index].count} />
            </div>
          ))}
        </div>
        {!rows.length && (
          <EmptyState
            label={filtered ? 'No matching messages' : 'No console messages'}
            hint={filtered ? 'Nothing matches the current level filter and search.' : 'console.log / warn / error from the page appear here, alongside results from commands you run below.'}
            action={filtered ? <button className="xray-btn" onClick={onClearFilter}>Clear filter</button> : undefined}
          />
        )}
      </div>
      {!pinnedUi && newCount > 0 && (
        <button className="xray-newmsg-pill" onClick={() => { setNewCount(0); pinnedRef.current = true; setPinnedUi(true); scrollToBottom(); }}>
          <IconArrowDown size={14} stroke={2} />{newCount} new
        </button>
      )}
    </section>
  );
}

const ConsoleRow = React.memo(function ConsoleRow({ event, count }: { event: ConsoleEvent; count: number }): React.ReactElement {
  const expandedId = usePanelStore((state) => state.expandedId);
  const toggleExpanded = usePanelStore((state) => state.toggleExpanded);
  const isExpanded = expandedId === event.id;
  const canExpand = event.type === 'result' || event.type === 'error' || event.data !== undefined || !!event.args?.some((arg) => arg && typeof arg === 'object');
  const icon = event.type === 'command'
    ? <IconChevronRight {...iconProps} />
    : event.type === 'result'
      ? <IconChevronLeft {...iconProps} />
      : event.level === 'error'
        ? <IconCircleX {...iconProps} />
        : event.level === 'warn'
          ? <IconAlertTriangle {...iconProps} />
          : <IconTerminal2 {...iconProps} />;

  // Page logs go through LogDetail (lazy "Load full object" support); everything
  // else renders a JSON tree with internal lazy-ref markers stripped out.
  const logEntry: XrayEntry | null = isExpanded && event.type === 'log' && event.entryId
    ? usePanelStore.getState().entries.find((entry) => entry.id === event.entryId) || null
    : null;
  const expandedData = useMemo(
    () => (isExpanded && !logEntry ? stripXrayRefs(event.data ?? event.args ?? event.message) : null),
    [isExpanded, logEntry, event],
  );
  const errorStack = event.type === 'error' && event.data && typeof event.data === 'object'
    ? String((event.data as { stack?: unknown }).stack || '')
    : '';

  return (
    <div
      className={`xray-console-row ${event.type} ${event.level}`}
      role={canExpand ? 'button' : undefined}
      tabIndex={canExpand ? 0 : undefined}
      aria-expanded={canExpand ? isExpanded : undefined}
      onClick={() => canExpand && toggleExpanded(event.id)}
      onKeyDown={canExpand ? (keyEvent) => { if (keyEvent.key === 'Enter' || keyEvent.key === ' ') { keyEvent.preventDefault(); toggleExpanded(event.id); } } : undefined}
    >
      <span>{isExpanded ? <IconChevronDown {...iconProps} /> : icon}</span>
      <span className="xray-console-message">
        {event.message}
        {count > 1 && <span className="xray-repeat-badge" title={`${count} identical consecutive messages`}>×{count}</span>}
        {event.truncated && <span className="xray-truncated-badge" title="The result was truncated to fit the transfer limit">truncated</span>}
      </span>
      <span className="xray-muted">{formatTime(event.timestamp)}</span>
      {isExpanded && (
        <div className="xray-detail">
          {logEntry ? (
            <LogDetail entry={logEntry} />
          ) : errorStack ? (
            <pre className="xray-error-stack">{errorStack}</pre>
          ) : (
            <JsonView value={expandedData} />
          )}
        </div>
      )}
    </div>
  );
});

function ConsolePrompt(): React.ReactElement {
  const selected = usePanelStore((state) => state.selectedId ? state.entries.find((entry) => entry.id === state.selectedId) || null : null);
  const addConsoleEvent = usePanelStore((state) => state.addConsoleEvent);
  const command = usePanelStore((state) => state.consoleDraft);
  const setConsoleDraft = usePanelStore((state) => state.setConsoleDraft);
  const setMini = usePanelStore((state) => state.setConsoleMiniTab);
  const [running, setRunning] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const historyRef = useRef<{ active: boolean; draft: string }>({ active: false, draft: '' });

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 110) + 'px';
  }, [command]);

  async function run(codeOverride?: string): Promise<void> {
    const code = (codeOverride ?? command).trim();
    if (!code || running) return;
    historyRef.current = { active: false, draft: '' };
    setConsoleDraft('');
    setRunning(true);
    const commandId = 'cmd_' + Date.now().toString(36);
    addConsoleEvent({ id: commandId, type: 'command', level: 'info', timestamp: Date.now(), message: code, args: [code], commandId });
    try {
      const result = await executeConsoleCommand(code);
      if (!result || result.type === 'empty') return;
      if (result.type === 'error') {
        const message = result.error?.message || 'Execution failed';
        addConsoleEvent({
          id: 'res_' + commandId,
          type: 'error',
          level: 'error',
          timestamp: Date.now(),
          message,
          data: result.error,
          commandId,
        });
        // Give the failed command back so it can be fixed instead of retyped.
        if (!codeOverride) setConsoleDraft(code);
        setAnnouncement(`Error: ${message}`);
      } else {
        const message = preview(result.result, 260);
        addConsoleEvent({
          id: 'res_' + commandId,
          type: 'result',
          level: 'info',
          timestamp: Date.now(),
          message,
          data: result.result,
          commandId,
          truncated: !!result.truncated,
        });
        setAnnouncement(`Result: ${message.slice(0, 140)}`);
      }
    } finally {
      setRunning(false);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>): void {
    const el = event.currentTarget;
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void run();
      return;
    }
    if (event.key === 'ArrowUp' && (historyRef.current.active || !command || (el.selectionStart === 0 && el.selectionEnd === 0))) {
      event.preventDefault();
      if (!historyRef.current.active) historyRef.current = { active: true, draft: command };
      const previous = navigateConsoleHistory('up');
      if (previous) setConsoleDraft(previous);
      return;
    }
    if (event.key === 'ArrowDown' && historyRef.current.active && el.selectionEnd === command.length) {
      event.preventDefault();
      const next = navigateConsoleHistory('down');
      if (next === '') {
        setConsoleDraft(historyRef.current.draft);
        historyRef.current = { active: false, draft: '' };
      } else if (next != null) {
        setConsoleDraft(next);
      }
      return;
    }
    if (event.key === 'Escape' && historyRef.current.active) {
      event.preventDefault();
      event.stopPropagation();
      setConsoleDraft(historyRef.current.draft);
      historyRef.current = { active: false, draft: '' };
    }
  }

  return (
    <div className="xray-prompt">
      <IconChevronRight {...iconProps} />
      <div className="xray-prompt-command">
        <textarea
          ref={inputRef}
          rows={1}
          value={command}
          onChange={(event) => {
            historyRef.current.active = false;
            setConsoleDraft(event.currentTarget.value);
          }}
          onKeyDown={handleKeyDown}
          placeholder={selected ? 'Try res.data, Object.keys(res), schema(res) — Shift+Enter for a new line' : 'Select a request, then try res.data'}
          aria-label="Console command"
        />
        <button className="xray-btn xray-prompt-help" title="Show the console helpers cheatsheet ($help)" onClick={() => void run('$help')}>
          <IconHelp {...iconProps} />
        </button>
        <button className="xray-btn" disabled={running} onClick={() => void run()}>
          {running ? <IconRefresh {...iconProps} className="xray-spin" /> : <IconPlayerPlay {...iconProps} />}
          {running ? 'Running…' : 'Run'}
        </button>
      </div>
      <button
        className="xray-context-chip"
        title={selected ? 'The prompt evaluates res/req against this request. Click to open the request strip.' : 'Pick a request in the Network strip to give the prompt a res/req context.'}
        onClick={() => setMini('network')}
      >
        {selected ? `Selected ${selected.method || 'GET'} ${entryPath(selected)}` : 'No request selected'}
      </button>
      <span className="xray-visually-hidden" aria-live="polite">{announcement}</span>
    </div>
  );
}

function Statusbar(): React.ReactElement {
  const entries = usePanelStore((state) => state.entries);
  const slowThresholdMs = usePanelStore((state) => state.settings.slowThresholdMs);
  const stats = useMemo(() => {
    const apis = entries.filter(isApi);
    const errors = apis.filter((entry) => Number(entry.status) >= 400);
    const slow = apis.filter((entry) => duration(entry) > slowThresholdMs);
    const avg = apis.length ? apis.reduce((sum, entry) => sum + duration(entry), 0) / apis.length : 0;
    return { total: apis.length, errors: errors.length, slow: slow.length, avg };
  }, [entries, slowThresholdMs]);
  return (
    <footer className="xray-statusbar">
      <span style={{ color: 'var(--xray-green)' }}>{stats.total - stats.errors} ok</span>
      <span style={{ color: 'var(--xray-red)' }}>{stats.errors} errors</span>
      <span style={{ color: 'var(--xray-yellow)' }}>{stats.slow} slow (&gt;{slowThresholdMs}ms)</span>
      <span className="xray-spacer" />
      <span>{stats.total} requests - avg {Math.round(stats.avg)}ms</span>
    </footer>
  );
}
