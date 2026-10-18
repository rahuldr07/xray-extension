import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { IconChevronDown, IconExternalLink, IconPin, IconX } from '@tabler/icons-react';
import { usePanelStore } from '../../store';
import { entryPath } from '../../models/entries';
import { formatResultBytes } from '../../models/consoleResults';
import { entryResponse } from '../../utils';
import type { ConsolePin, XrayEntry } from '../../types';
import { focusFirstItem, handleMenuKeyDown, useMenuDismiss } from '../common/menuBehavior';

const iconProps = { size: 16, stroke: 1.8 } as const;
// The picker renders at most this many matches; typing narrows the rest.
const MAX_OPTIONS = 100;
const NO_PINS: Record<string, unknown> = {};

function requestLabel(entry: XrayEntry): string {
  return `${(entry.method || 'GET').toUpperCase()} ${entryPath(entry)}`;
}

/** `200 · 14 kb` — status and size of a captured request (P1). */
function requestMeta(entry: XrayEntry): string {
  const parts = [String(entry.status || 'pending')];
  const size = Number(entry.size);
  if (size > 0) parts.push(formatResultBytes(size));
  return parts.join(' · ');
}

function ageLabel(timestamp: unknown, now: number): string {
  const at = Number(timestamp);
  if (!at) return '';
  const seconds = Math.max(0, Math.round((now - at) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m ago`;
  if (seconds < 86_400) return `${Math.round(seconds / 3600)}h ago`;
  // Older than a day (a restored session): the date reads better than "40d ago".
  const date = new Date(at);
  const sameYear = date.getFullYear() === new Date(now).getFullYear();
  return `on ${date.toLocaleDateString('en-GB', sameYear ? { day: 'numeric', month: 'short' } : { day: 'numeric', month: 'short', year: 'numeric' })}`;
}

/**
 * Pinned requests as editor roots: `a` → that request's parsed response body (the
 * same value `res` would be). Captured data only; nothing is evaluated.
 */
export function usePinnedRoots(): Record<string, unknown> {
  const pins = usePanelStore((state) => state.consolePins);
  const entries = usePanelStore((state) => state.entries);
  // entryResponse caches per entry object, so only a patched pinned entry re-parses.
  return useMemo(() => {
    if (!pins.length) return NO_PINS;
    const roots: Record<string, unknown> = {};
    for (const pin of pins) {
      const entry = entries.find((item) => item.id === pin.entryId);
      if (entry) roots[pin.name] = entryResponse(entry);
    }
    return roots;
  }, [pins, entries]);
}

/**
 * P1–P2: the request context line above the editor (`res = GET /path · 200 · 14 kb`),
 * a searchable picker (a disclosure of buttons; keyboard: type to filter, ↑/↓, Enter,
 * Escape), pinned-request chips `a`…`f`, and Inspect in API.
 */
export function RequestContextLine({ selected }: { selected: XrayEntry | null }): React.ReactElement {
  const entries = usePanelStore((state) => state.entries);
  const pins = usePanelStore((state) => state.consolePins);
  const selectEntry = usePanelStore((state) => state.selectEntry);
  const setActiveTab = usePanelStore((state) => state.setActiveTab);
  const pinConsoleRequest = usePanelStore((state) => state.pinConsoleRequest);
  const unpinConsoleRequest = usePanelStore((state) => state.unpinConsoleRequest);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const [now, setNow] = useState(() => Date.now());
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const filterRef = useRef<HTMLInputElement | null>(null);
  const menuId = useId();
  const nameId = useId();
  const textId = useId();
  const current = selected?.type === 'api' ? selected : null;
  const currentPin = current ? pins.find((pin) => pin.entryId === current.id) ?? null : null;
  const nextLetter = ['a', 'b', 'c', 'd', 'e', 'f'].find((letter) => !pins.some((pin) => pin.name === letter));

  // The age in the tooltip is relative; refresh it while a request is shown.
  useEffect(() => {
    if (!current) return;
    const timer = window.setInterval(() => setNow(Date.now()), 15_000);
    return () => window.clearInterval(timer);
  }, [current]);

  useEffect(() => {
    if (open) focusFirstItem(menuRef.current, true);
  }, [open]);

  useMenuDismiss(open, wrapRef, triggerRef, () => setOpen(false));

  const requests = useMemo(() => entries.filter((entry) => entry.type === 'api'), [entries]);
  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const newestFirst = [...requests].reverse();
    if (!needle) return newestFirst;
    return newestFirst.filter((entry) => `${requestLabel(entry)} ${entry.url || ''} ${entry.status || ''}`.toLowerCase().includes(needle));
  }, [requests, query]);

  function close(): void {
    setOpen(false);
    triggerRef.current?.focus();
  }

  function choose(id: string): void {
    selectEntry(id, { openDetail: false });
    close();
  }

  function pinCurrent(): void {
    if (!current) return;
    const name = pinConsoleRequest(current.id);
    if (name) setAnnouncement(`Pinned ${requestLabel(current)} as ${name}`);
    close();
  }

  function unpin(pin: ConsolePin, chip: HTMLElement | null): void {
    // Hand focus to a neighbouring chip (or the picker) before this one unmounts.
    const neighbour = (chip?.nextElementSibling ?? chip?.previousElementSibling)?.querySelector<HTMLElement>('button');
    (neighbour ?? triggerRef.current)?.focus();
    unpinConsoleRequest(pin.name);
    setAnnouncement(`Unpinned ${pin.name}`);
  }

  function inspectInApi(): void {
    if (!current) return;
    selectEntry(current.id, { openDetail: true });
    setActiveTab('api');
  }

  function onMenuKeyDown(event: React.KeyboardEvent<HTMLDivElement>): void {
    // Typing while an option has focus goes back to the filter.
    if (event.target !== filterRef.current && event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey && event.key !== ' ') {
      filterRef.current?.focus();
      return;
    }
    handleMenuKeyDown(event, menuRef.current, wrapRef.current, triggerRef.current, () => setOpen(false), true);
  }

  function onFilterKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    const options = [...(menuRef.current?.querySelectorAll<HTMLButtonElement>('.xray-context-option') ?? [])];
    if (event.key === 'Enter') {
      event.preventDefault();
      if (matches[0]) choose(matches[0].id);
    } else if (event.key === 'ArrowDown' && options.length) {
      event.preventDefault();
      options[0].focus();
    } else if (event.key === 'ArrowUp' && options.length) {
      event.preventDefault();
      options[options.length - 1].focus();
    }
  }

  const age = current ? ageLabel(current.timestamp, now) : '';
  const title = current
    ? `res = ${requestLabel(current)} · ${requestMeta(current)}${age ? ` · captured ${age}` : ''} — res/req evaluate against this request`
    : 'No request selected — res and req need a request; plain JavaScript still runs';
  const shown = matches.slice(0, MAX_OPTIONS);
  const pinLabel = !current ? 'Pin request'
    : currentPin ? `Pinned as ${currentPin.name}`
      : nextLetter ? `Pin request as ${nextLetter}` : 'Pin request (limit 6)';

  return (
    <div className="xray-context-wrap" ref={wrapRef}>
      <div className="xray-prompt-context-row xray-context-line" title={title}>
        {current ? (
          <span className="xray-context-summary">
            <span className="xray-context-prefix">{'res = '}</span>
            <span className="xray-context-request">{requestLabel(current)}</span>
            <span className="xray-context-meta">{` · ${requestMeta(current)}`}</span>
            {age && <span className="xray-context-age">{` · ${age}`}</span>}
          </span>
        ) : (
          <span className="xray-context-summary xray-context-none">No request selected · plain JavaScript only</span>
        )}
        {pins.length > 0 && (
          <span className="xray-pin-chips" role="group" aria-label="Pinned requests">
            {pins.map((pin) => {
              const entry = entries.find((item) => item.id === pin.entryId);
              const label = entry ? requestLabel(entry) : pin.entryId;
              return (
                <span key={pin.name} className="xray-pin-chip" title={`${pin.name} = ${label} — its response body`}>
                  <span className="xray-pin-chip-name">{pin.name}</span>
                  {entry && <span className="xray-pin-chip-path">{entryPath(entry)}</span>}
                  <button className="xray-pin-chip-remove" aria-label={`Unpin ${pin.name} (${label})`} title={`Unpin ${pin.name}`} onClick={(event) => unpin(pin, event.currentTarget.closest('.xray-pin-chip'))}>
                    <IconX size={11} stroke={2.2} />
                  </button>
                </span>
              );
            })}
          </span>
        )}
        <span className="xray-context-actions">
          <button
            ref={triggerRef}
            className={current ? 'xray-context-change' : 'xray-context-change pick'}
            aria-label="Console request context"
            aria-labelledby={`${nameId} ${textId}`}
            aria-expanded={open}
            aria-controls={open ? menuId : undefined}
            title={current ? 'Change the request res and req evaluate against' : 'Pick a request for res and req'}
            onClick={() => { setQuery(''); setOpen((value) => !value); }}
          >
            <span id={nameId} className="xray-visually-hidden">Console request context</span>
            <span id={textId} className="xray-context-change-text">{current ? 'Change' : 'Pick request'}</span><IconChevronDown size={14} stroke={2} />
          </button>
          {current && (
            <button className="xray-context-inspect" aria-label="Inspect in API" title="Inspect selected request in API" onClick={inspectInApi}>
              <IconExternalLink {...iconProps} /><span className="xray-visually-hidden">Inspect in API</span>
            </button>
          )}
        </span>
      </div>
      {open && (
        <div id={menuId} ref={menuRef} className="xray-context-menu" role="group" aria-label="Choose request context" onKeyDown={onMenuKeyDown}>
          <input
            ref={filterRef}
            className="xray-input xray-context-filter"
            aria-label="Filter requests"
            placeholder="Filter requests — Enter picks the first"
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            onKeyDown={onFilterKeyDown}
          />
          <div className="xray-context-options">
            {shown.map((entry) => {
              const pin = pins.find((item) => item.entryId === entry.id);
              return (
                <button
                  key={entry.id}
                  className="xray-context-option"
                  aria-current={entry.id === current?.id ? 'true' : undefined}
                  title={`${requestLabel(entry)} · ${requestMeta(entry)}`}
                  onClick={() => choose(entry.id)}
                >
                  <span className="xray-context-option-method">{(entry.method || 'GET').toUpperCase()}</span>
                  <span className="xray-context-option-path">{entryPath(entry)}</span>
                  <span className="xray-context-option-meta">{entry.status || 'pending'}</span>
                  {pin && <span className="xray-context-option-pin"><span aria-hidden="true">{pin.name}</span><span className="xray-visually-hidden">pinned as {pin.name}</span></span>}
                </button>
              );
            })}
            {!shown.length && <p className="xray-muted xray-context-empty">{requests.length ? 'No matching requests' : 'No requests captured yet'}</p>}
            {matches.length > shown.length && <p className="xray-muted xray-context-empty">+{matches.length - shown.length} more — keep typing to narrow</p>}
          </div>
          <div className="xray-menu-sep" role="separator" />
          <button
            className="xray-menu-item xray-context-pin"
            disabled={!current || !!currentPin}
            title={!current ? 'Select a request to pin it' : currentPin ? `Already pinned as ${currentPin.name}` : 'Keep this request as a variable (its response body)'}
            onClick={pinCurrent}
          >
            <IconPin {...iconProps} /><span>{pinLabel}</span>
          </button>
        </div>
      )}
      <span className="xray-visually-hidden" aria-live="polite">{announcement}</span>
    </div>
  );
}
