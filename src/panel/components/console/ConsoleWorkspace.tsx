import React, { useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  IconAlertTriangle,
  IconArrowDownLeft,
  IconArrowUpRight,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconCircleX,
  IconDownload,
  IconFilter,
  IconNetwork,
  IconPlayerPlay,
  IconPlayerRecord,
  IconRefresh,
  IconSearch,
  IconTerminal2,
  IconTrash,
} from '@tabler/icons-react';
import { EmptyState } from '../common/EmptyState';
import { RequestDetail } from '../detail/RequestDetail';
import { JsonView } from '../detail/JsonView';
import { usePanelStore } from '../../store';
import type { ConsoleEvent, ConsoleMiniTab, NetworkFilter } from '../../types';
import { duration, entryPath, isApi } from '../../models/entries';
import { executeConsoleCommand, navigateConsoleHistory } from '../../runtime/consoleBridge';
import { eventEntry, formatBytes, formatTime, methodClass, preview, statusClass } from '../../utils';

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
  const setRecording = usePanelStore((state) => state.setRecording);
  const clearConsole = usePanelStore((state) => state.clearConsole);
  const requestConfirmation = usePanelStore((state) => state.requestConfirmation);
  const setExportOpen = usePanelStore((state) => state.setExportOpen);
  const setSearchQuery = usePanelStore((state) => state.setSearchQuery);
  const networkFilter = usePanelStore((state) => state.networkFilter);
  const setNetworkFilter = usePanelStore((state) => state.setNetworkFilter);

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
          <button className="xray-btn" onClick={() => setRecording(!recording)}>
            <IconPlayerRecord {...iconProps} />{recording ? 'Record' : 'Paused'}
          </button>
          <button className="xray-btn" onClick={() => setExportOpen(true)}><IconDownload {...iconProps} />Export</button>
        </div>
      </section>
      {mini === 'network' && (
        <section className="xray-filterbar">
          <label className="xray-search">
            <IconSearch {...iconProps} />
            <input className="xray-input" placeholder="Filter by path, method, status..." onChange={(event) => setSearchQuery(event.currentTarget.value)} />
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
      <NetworkTable hidden={mini !== 'network'} />
      <ConsoleStream />
      <ConsolePrompt />
      <Statusbar />
    </>
  );
}

function NetworkTable({ hidden }: { hidden: boolean }): React.ReactElement | null {
  const events = useFilteredNetworkEvents();
  const parentRef = useRef<HTMLDivElement | null>(null);
  const virtualizer = useVirtualizer({
    count: events.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => usePanelStore.getState().expandedId === events[index]?.id ? 240 : 34,
    getItemKey: (index) => events[index]?.id || index,
    measureElement: (element) => element.getBoundingClientRect().height,
    overscan: 8,
  });

  if (hidden) return null;

  return (
    <section className="xray-network">
      <div className="xray-network-head">
        <span>Method</span><span>Status</span><span>Path</span><span>Timing</span><span>Size</span><span>Time</span>
      </div>
      <div className="xray-virtual-list" ref={parentRef}>
        <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
          {virtualizer.getVirtualItems().map((item) => (
            <div key={item.key} data-index={item.index} ref={virtualizer.measureElement} style={{ position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${item.start}px)` }}>
              <NetworkRow event={events[item.index]} />
            </div>
          ))}
        </div>
        {!events.length && <EmptyState label="No matching requests" />}
      </div>
    </section>
  );
}

function NetworkRow({ event }: { event: ConsoleEvent }): React.ReactElement {
  const entry = eventEntry(event);
  const slowThresholdMs = usePanelStore((state) => state.settings.slowThresholdMs);
  const selectedId = usePanelStore((state) => state.selectedId);
  const expandedId = usePanelStore((state) => state.expandedId);
  const selectEntry = usePanelStore((state) => state.selectEntry);
  const toggleExpanded = usePanelStore((state) => state.toggleExpanded);
  const maxDuration = Math.max(100, ...useFilteredNetworkEvents().map(eventDuration));
  if (!entry) return <div />;

  const status = Number(entry.status) || 0;
  const isSelected = selectedId === entry.id;
  const isExpanded = expandedId === event.id;
  const pct = Math.max(6, Math.min(100, duration(entry) / maxDuration * 100));

  return (
    <div>
      <div className={`xray-network-row ${isSelected ? 'selected' : ''}`} onClick={() => { selectEntry(entry.id); toggleExpanded(event.id); }}>
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
}

function ConsoleStream(): React.ReactElement {
  const events = useConsoleEvents();
  const expandedId = usePanelStore((state) => state.expandedId);
  const parentRef = useRef<HTMLDivElement | null>(null);
  const virtualizer = useVirtualizer({
    count: events.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => expandedId === events[index]?.id ? 220 : 36,
    getItemKey: (index) => events[index]?.id || index,
    measureElement: (element) => element.getBoundingClientRect().height,
    overscan: 10,
  });

  return (
    <section className="xray-console-stream" ref={parentRef}>
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualizer.getVirtualItems().map((item) => (
          <div key={item.key} data-index={item.index} ref={virtualizer.measureElement} style={{ position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${item.start}px)` }}>
            <ConsoleRow event={events[item.index]} />
          </div>
        ))}
      </div>
      {!events.length && <EmptyState label="No console messages" />}
    </section>
  );
}

function ConsoleRow({ event }: { event: ConsoleEvent }): React.ReactElement {
  const expandedId = usePanelStore((state) => state.expandedId);
  const toggleExpanded = usePanelStore((state) => state.toggleExpanded);
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

  return (
    <div className={`xray-console-row ${event.type} ${event.level}`} onClick={() => canExpand && toggleExpanded(event.id)}>
      <span>{expandedId === event.id ? <IconChevronDown {...iconProps} /> : icon}</span>
      <span className="xray-console-message">{event.message}</span>
      <span className="xray-muted">{formatTime(event.timestamp)}</span>
      {expandedId === event.id && <div className="xray-detail"><JsonView value={event.data ?? event.args ?? event.message} /></div>}
    </div>
  );
}

function ConsolePrompt(): React.ReactElement {
  const selected = usePanelStore((state) => state.selectedId ? state.entries.find((entry) => entry.id === state.selectedId) || null : null);
  const addConsoleEvent = usePanelStore((state) => state.addConsoleEvent);
  const command = usePanelStore((state) => state.consoleDraft);
  const setConsoleDraft = usePanelStore((state) => state.setConsoleDraft);

  async function run(): Promise<void> {
    const code = command.trim();
    if (!code) return;
    setConsoleDraft('');
    const commandId = 'cmd_' + Date.now().toString(36);
    addConsoleEvent({ id: commandId, type: 'command', level: 'info', timestamp: Date.now(), message: code, args: [code], commandId });
    const result = await executeConsoleCommand(code);
    if (!result || result.type === 'empty') return;
    if (result.type === 'error') {
      addConsoleEvent({
        id: 'res_' + commandId,
        type: 'error',
        level: 'error',
        timestamp: Date.now(),
        message: result.error?.message || 'Execution failed',
        data: result.error,
        commandId,
      });
    } else {
      addConsoleEvent({
        id: 'res_' + commandId,
        type: 'result',
        level: 'info',
        timestamp: Date.now(),
        message: preview(result.result, 260),
        data: result.result,
        commandId,
        truncated: !!result.truncated,
      });
    }
  }

  return (
    <div className="xray-prompt">
      <IconChevronRight {...iconProps} />
      <div className="xray-prompt-command">
        <input
          value={command}
          onChange={(event) => setConsoleDraft(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              void run();
            } else if (event.key === 'ArrowUp' && !command) {
              const previous = navigateConsoleHistory('up');
              if (previous != null) setConsoleDraft(previous);
            }
          }}
          placeholder={selected ? 'Try res.data, Object.keys(res), schema(res)' : 'Select a request, then try res.data'}
        />
        <button className="xray-btn" onClick={() => void run()}><IconPlayerPlay {...iconProps} />Run</button>
      </div>
      <span className="xray-context-chip">{selected ? `Selected ${selected.method || 'GET'} ${entryPath(selected)}` : 'No request selected'}</span>
    </div>
  );
}

function Statusbar(): React.ReactElement {
  const entries = usePanelStore((state) => state.entries);
  const slowThresholdMs = usePanelStore((state) => state.settings.slowThresholdMs);
  const apis = entries.filter(isApi);
  const errors = apis.filter((entry) => Number(entry.status) >= 400);
  const slow = apis.filter((entry) => duration(entry) > slowThresholdMs);
  const avg = apis.length ? apis.reduce((sum, entry) => sum + duration(entry), 0) / apis.length : 0;
  return (
    <footer className="xray-statusbar">
      <span style={{ color: 'var(--xray-green)' }}>{apis.length - errors.length} ok</span>
      <span style={{ color: 'var(--xray-red)' }}>{errors.length} errors</span>
      <span style={{ color: 'var(--xray-yellow)' }}>{slow.length} slow (&gt;{slowThresholdMs}ms)</span>
      <span className="xray-spacer" />
      <span>{apis.length} requests - avg {Math.round(avg)}ms</span>
    </footer>
  );
}
