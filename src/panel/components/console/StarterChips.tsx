import React, { useMemo } from 'react';
import { usePanelStore } from '../../store';
import { starters, type Starter } from '../../models/consoleAssist';
import { entryResponse } from '../../utils';
import { previousCallAvailable } from '../../models/consoleContext';
import { appendToConsoleDraft } from './consoleCaret';

/**
 * Smart starters (spec P8) for the selected request: generated from the shape of its
 * parsed response body (`res`), plus "Diff with previous call" when the runtime's
 * `prev` will resolve (see previousCallAvailable). Captured data only: nothing here
 * evaluates.
 */
export function useStarters(): Starter[] {
  const entries = usePanelStore((state) => state.entries);
  const selectedId = usePanelStore((state) => state.selectedId);
  const selected = useMemo(() => {
    const entry = selectedId ? entries.find((item) => item.id === selectedId) : undefined;
    return entry && entry.type === 'api' ? entry : null;
  }, [entries, selectedId]);
  // Offered only when the runtime's `prev` will actually hold that call's body
  // (it sees a bounded window of the capture — see models/consoleContext).
  const hasPrevious = useMemo(() => previousCallAvailable(entries, selectedId), [entries, selectedId]);
  // entryResponse is cached per entry, so this only re-derives on a new selection.
  return useMemo(() => (selected ? starters(entryResponse(selected), hasPrevious) : []), [selected, hasPrevious]);
}

/**
 * Starter chips. A click fills the draft (caret placed where the starter says) and
 * focuses the prompt; running stays an explicit Enter/Run.
 */
export function StarterChips({ items, className = '' }: { items: Starter[]; className?: string }): React.ReactElement | null {
  if (!items.length) return null;
  return (
    <div className={`xray-starter-chips ${className}`.trim()} role="group" aria-label="Starter commands">
      {items.map((starter) => (
        <button
          key={starter.label}
          type="button"
          className="xray-chip xray-starter-chip"
          title={`Insert ${starter.insert} (does not run)`}
          onMouseDown={(event) => event.preventDefault()}
          onClick={(event) => appendToConsoleDraft(event.currentTarget, starter.insert, starter.caretOffset)}
        >
          {starter.label}
        </button>
      ))}
    </div>
  );
}
