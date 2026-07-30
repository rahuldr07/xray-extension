import React, { useMemo, useRef, useState } from 'react';
import { IconArrowRight, IconLetterCase, IconRegex, IconSearch } from '@tabler/icons-react';
import { usePanelStore } from '../../store';
import { ModalShell } from '../common/ModalShell';
import { searchEntries } from '../../models/globalSearch';
import type { GlobalSearchMatch } from '../../models/globalSearch';
import { entryPath } from '../../models/entries';
import { methodClass, statusClass } from '../../utils';

const iconProps = { size: 16, stroke: 1.8 } as const;

// Renders a snippet with the matched slice highlighted, using the exact offsets
// the search model returned (no re-matching, so regex highlights stay correct).
function Snippet({ match }: { match: GlobalSearchMatch }): React.ReactElement {
  const { snippet, matchStart, matchLength } = match;
  if (matchStart < 0 || matchStart >= snippet.length) return <span className="xray-gsearch-snippet">{snippet}</span>;
  const before = snippet.slice(0, matchStart);
  const hit = snippet.slice(matchStart, matchStart + matchLength);
  const after = snippet.slice(matchStart + matchLength);
  return (
    <span className="xray-gsearch-snippet">
      {before}<mark>{hit}</mark>{after}
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
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement | null>(null);

  const result = useMemo(() => searchEntries(entries, query, { regex, caseSensitive }), [entries, query, regex, caseSensitive]);
  const matches = result.matches;

  React.useEffect(() => { setActive(0); }, [query, regex, caseSensitive, open]);
  React.useEffect(() => { if (!open) { setQuery(''); } }, [open]);
  React.useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-match-index="${active}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  function runMatch(index: number): void {
    const target = matches[index];
    if (!target) return;
    selectEntry(target.entry.id);
    setActiveTab(target.entry.type === 'api' ? 'api' : 'logs');
    setOpen(false);
  }

  function onKeyDown(event: React.KeyboardEvent): void {
    if (event.key === 'ArrowDown') { event.preventDefault(); setActive((i) => (i + 1) % Math.max(1, matches.length)); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); setActive((i) => (i - 1 + matches.length) % Math.max(1, matches.length)); }
    else if (event.key === 'Enter') { event.preventDefault(); runMatch(active); }
    else if (event.key === 'Home') { event.preventDefault(); setActive(0); }
    else if (event.key === 'End') { event.preventDefault(); setActive(matches.length - 1); }
  }

  if (!open) return null;

  return (
    <ModalShell
      title="Find in traffic"
      subtitle="Search across every captured URL, header, and request/response body"
      icon={<IconSearch {...iconProps} />}
      className="xray-gsearch-modal"
      onClose={() => setOpen(false)}
    >
      <div className="xray-gsearch-controls">
        <label className="xray-search xray-gsearch-input">
          <IconSearch {...iconProps} />
          <input
            className="xray-input"
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            onKeyDown={onKeyDown}
            placeholder={regex ? 'Regular expression…' : 'Search text across all captured traffic…'}
            spellCheck={false}
          />
        </label>
        <button
          className={`xray-chip ${regex ? 'active' : ''}`}
          onClick={() => setRegex((v) => !v)}
          aria-pressed={regex}
          title="Match with a regular expression"
        >
          <IconRegex {...iconProps} />Regex
        </button>
        <button
          className={`xray-chip ${caseSensitive ? 'active' : ''}`}
          onClick={() => setCaseSensitive((v) => !v)}
          aria-pressed={caseSensitive}
          title="Case-sensitive matching"
        >
          <IconLetterCase {...iconProps} />Case
        </button>
      </div>
      <div className="xray-modal-body xray-gsearch-list" ref={listRef}>
        {result.error && <div className="xray-gsearch-error">{result.error}</div>}
        {!result.error && !query.trim() && (
          <div className="xray-command-empty">
            <IconSearch size={20} stroke={1.6} />
            <span>Search inside your captured traffic</span>
            <small>Matches URLs, methods, status, headers, and request &amp; response bodies. Toggle Regex for patterns.</small>
          </div>
        )}
        {!result.error && query.trim() && matches.length === 0 && (
          <div className="xray-command-empty">
            <IconSearch size={20} stroke={1.6} />
            <span>No matches for “{query}”</span>
            <small>Try different text, or enable Regex.</small>
          </div>
        )}
        {matches.map((match, index) => {
          const method = String(match.entry.method || match.entry.logLevel || 'GET').toUpperCase();
          return (
            <button
              key={`${match.id}-${index}`}
              data-match-index={index}
              className={`xray-gsearch-row ${index === active ? 'active' : ''}`}
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
              {index === active && <IconArrowRight size={14} stroke={2} className="xray-command-enter" />}
            </button>
          );
        })}
      </div>
      <div className="xray-command-foot">
        <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
        <span><kbd>↵</kbd> open</span>
        <span><kbd>esc</kbd> close</span>
        <span className="xray-spacer" />
        <span>{matches.length}{result.truncated ? '+' : ''} match{matches.length === 1 ? '' : 'es'}</span>
      </div>
    </ModalShell>
  );
}
