import React, { useId, useMemo, useRef, useState } from 'react';
import { IconArrowRight, IconLetterCase, IconRegex, IconSearch } from '@tabler/icons-react';
import { usePanelStore } from '../../store';
import { ModalShell } from '../common/ModalShell';
import { searchEntries } from '../../models/globalSearch';
import type { GlobalSearchField, GlobalSearchMatch } from '../../models/globalSearch';
import { entryPath } from '../../models/entries';
import { methodClass, statusClass } from '../../utils';
import { visibleText } from '../common/VisibleText';

const iconProps = { size: 16, stroke: 1.8 } as const;

// Renders a snippet with the matched slice highlighted, using the exact offsets
// the search model returned (no re-matching, so regex highlights stay correct).
// A bidi control in a snippet shows as its escape (spec J13), so it cannot reorder the result.
function Snippet({ match }: { match: GlobalSearchMatch }): React.ReactElement {
  const { snippet, matchStart, matchLength } = match;
  if (matchStart < 0 || matchStart >= snippet.length) return <span className="xray-gsearch-snippet">{visibleText(snippet)}</span>;
  const before = snippet.slice(0, matchStart);
  const hit = snippet.slice(matchStart, matchStart + matchLength);
  const after = snippet.slice(matchStart + matchLength);
  return (
    <span className="xray-gsearch-snippet">
      {visibleText(before)}<mark>{visibleText(hit)}</mark>{visibleText(after)}
    </span>
  );
}

export function GlobalSearch(): React.ReactElement | null {
  const open = usePanelStore((state) => state.globalSearchOpen);
  const setOpen = usePanelStore((state) => state.setGlobalSearchOpen);
  const entries = usePanelStore((state) => state.entries);
  const selectEntry = usePanelStore((state) => state.selectEntry);
  const setActiveTab = usePanelStore((state) => state.setActiveTab);
  const [query, setQuery] = useState('');
  const [regex, setRegex] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [field, setField] = useState<GlobalSearchField>('all');
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement | null>(null);
  const evidenceId = useId();

  const result = useMemo(() => field === 'all'
    ? searchEntries(entries, query, { regex, caseSensitive })
    : searchEntries(entries, query, { regex, caseSensitive, fields: [field] }),
  [entries, query, regex, caseSensitive, field]);
  const matches = result.matches;
  const activeIndex = Math.max(0, Math.min(active, matches.length - 1));
  const activeMatch = matches[activeIndex];

  // Live eviction can shrink results without changing the query or scope.
  if (active !== activeIndex) setActive(activeIndex);

  React.useEffect(() => { setActive(0); }, [open]);
  React.useEffect(() => { if (!open) { setQuery(''); } }, [open]);
  React.useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-match-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, matches]);

  function runMatch(index: number): void {
    const target = matches[index];
    if (!target) return;
    selectEntry(target.entry.id);
    setActiveTab(target.entry.type === 'api' ? 'api' : 'logs');
    setOpen(false);
  }

  function onKeyDown(event: React.KeyboardEvent): void {
    if (event.key === 'ArrowDown') { event.preventDefault(); setActive((activeIndex + 1) % Math.max(1, matches.length)); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); setActive((activeIndex - 1 + Math.max(1, matches.length)) % Math.max(1, matches.length)); }
    else if (event.key === 'Enter') { event.preventDefault(); runMatch(activeIndex); }
    else if (event.key === 'Home') { event.preventDefault(); setActive(0); }
    else if (event.key === 'End') { event.preventDefault(); setActive(Math.max(0, matches.length - 1)); }
  }

  if (!open) return null;

  return (
    <ModalShell
      title="Find in traffic"
      subtitle="Search selected fields in retained captured traffic"
      icon={<IconSearch {...iconProps} />}
      className="xray-gsearch-modal"
      onClose={() => setOpen(false)}
    >
      <div className="xray-gsearch-controls">
        <label className="xray-search xray-gsearch-input">
          <IconSearch {...iconProps} />
          <input
            className="xray-input"
            aria-label="Search captured traffic"
            aria-describedby={evidenceId}
            aria-controls="xray-global-search-results"
            aria-activedescendant={activeMatch ? `xray-global-search-result-${activeMatch.id}-${activeIndex}` : undefined}
            autoFocus
            value={query}
            onChange={(event) => { setQuery(event.currentTarget.value); setActive(0); }}
            onKeyDown={onKeyDown}
            placeholder={regex ? 'Regular expression…' : 'Search text in selected fields…'}
            spellCheck={false}
          />
        </label>
      </div>
      <div className="xray-gsearch-controls xray-filter-chips compact">
        <label className="xray-filter-label">
          Search field
          <select
            className="xray-select"
            aria-label="Search field"
            aria-describedby={evidenceId}
            value={field}
            onChange={(event) => { setField(event.currentTarget.value as GlobalSearchField); setActive(0); }}
          >
            <option value="all">All fields</option>
            <option value="method">Method</option>
            <option value="url">URL</option>
            <option value="status">Status</option>
            <option value="headers">Headers</option>
            <option value="requestBody">Request body</option>
            <option value="responseBody">Response body</option>
            <option value="message">Message</option>
          </select>
        </label>
        <button
          className={`xray-chip ${regex ? 'active' : ''}`}
          onClick={() => { setRegex((v) => !v); setActive(0); }}
          aria-pressed={regex}
          title="Match with a regular expression"
        >
          <IconRegex {...iconProps} />Regex
        </button>
        <button
          className={`xray-chip ${caseSensitive ? 'active' : ''}`}
          onClick={() => { setCaseSensitive((v) => !v); setActive(0); }}
          aria-pressed={caseSensitive}
          title="Case-sensitive matching"
        >
          <IconLetterCase {...iconProps} />Case
        </button>
      </div>
      <div className="xray-gsearch-controls xray-gsearch-limits xray-modal-hint" id={evidenceId}>
        Retained captured evidence only: first 20,000 characters per field, up to 200 matching entries.
        Missing, redacted, truncated, or uncaptured data may be unavailable.
      </div>
      <div
        className="xray-modal-body xray-gsearch-list"
        id="xray-global-search-results"
        role="listbox"
        aria-label="Search results"
        ref={listRef}
      >
        {result.error && <div className="xray-gsearch-error" role="alert">{result.error}</div>}
        {!result.error && !query.trim() && (
          <div className="xray-command-empty">
            <IconSearch size={20} stroke={1.6} />
            <span>Search inside your captured traffic</span>
            <small>Matches selected captured fields. All fields includes methods, status, and log messages. Toggle Regex for patterns.</small>
          </div>
        )}
        {!result.error && query.trim() && matches.length === 0 && (
          <div className="xray-command-empty">
            <IconSearch size={20} stroke={1.6} />
            <span>No matches for “{query}”</span>
            <small>Try different text or search fields, or enable Regex.</small>
          </div>
        )}
        {matches.map((match, index) => {
          const method = String(match.entry.method || match.entry.logLevel || 'GET').toUpperCase();
          return (
            <button
              key={`${match.id}-${index}`}
              id={`xray-global-search-result-${match.id}-${index}`}
              data-match-index={index}
              role="option"
              aria-selected={index === activeIndex}
              className={`xray-gsearch-row ${index === activeIndex ? 'active' : ''}`}
              aria-current={index === activeIndex ? 'true' : undefined}
              onMouseMove={() => setActive(index)}
              onClick={() => runMatch(index)}
            >
              <span className={`xray-cmd-method ${methodClass(match.entry.method)}`}>{method.slice(0, 4)}</span>
              <span className="xray-gsearch-main">
                <span className="xray-gsearch-path">
                  {entryPath(match.entry)}
                  <span className="xray-gsearch-field">{match.field}</span>
                </span>
                <Snippet match={match} />
              </span>
              {match.entry.status ? <span className={`xray-gsearch-status ${statusClass(Number(match.entry.status))}`}>{match.entry.status}</span> : null}
              {index === activeIndex && <IconArrowRight size={14} stroke={2} className="xray-command-enter" />}
            </button>
          );
        })}
      </div>
      <div className="xray-command-foot">
        <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
        <span><kbd>↵</kbd> open</span>
        <span><kbd>esc</kbd> close</span>
        <span className="xray-spacer" />
        <span role="status" aria-live="polite" aria-atomic="true">{matches.length}{result.truncated ? '+' : ''} match{matches.length === 1 ? '' : 'es'}</span>
        <span className="xray-visually-hidden" role="status" aria-live="polite" aria-atomic="true">
          {activeMatch ? `Active result ${activeIndex + 1} of ${matches.length}: ${entryPath(activeMatch.entry)}` : 'No active search result'}
        </span>
      </div>
    </ModalShell>
  );
}
