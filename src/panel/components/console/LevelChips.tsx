import React, { useCallback, useEffect, useRef, useState } from 'react';
import { consoleLevelFilters, type ConsoleFilter } from '../../models/logLevels';

// Level chips are one row that never wraps: when it does not fit beside the
// search it scrolls sideways, and a fade on the clipped edge says so.
export function LevelChips({ levelFilter, counts, onChange }: {
  levelFilter: ConsoleFilter;
  counts: Record<ConsoleFilter, number>;
  onChange: (filter: ConsoleFilter) => void;
}): React.ReactElement {
  const ref = useRef<HTMLDivElement | null>(null);
  const [overflow, setOverflow] = useState<'none' | 'start' | 'end' | 'both'>('none');

  const measure = useCallback((): void => {
    const el = ref.current;
    if (!el) return;
    const start = el.scrollLeft > 1;
    const end = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
    setOverflow(start && end ? 'both' : start ? 'start' : end ? 'end' : 'none');
  }, []);

  // Scroll and resize listeners are installed once…
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener('scroll', measure, { passive: true });
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(measure) : null;
    observer?.observe(el);
    return () => {
      el.removeEventListener('scroll', measure);
      observer?.disconnect();
    };
  }, [measure]);

  // …and a count change (wider or narrower chips) only re-measures.
  useEffect(() => { measure(); }, [counts, measure]);

  return (
    <div ref={ref} className="xray-filter-chips xray-console-levels" role="group" aria-label="Console level filters" data-overflow={overflow}>
      {consoleLevelFilters.map((filter) => (
        <button
          key={filter.id}
          className={`xray-chip ${levelFilter === filter.id ? 'active' : ''}`}
          aria-pressed={levelFilter === filter.id}
          title={filter.title}
          onClick={(event) => { onChange(filter.id); event.currentTarget.scrollIntoView?.({ block: 'nearest', inline: 'nearest' }); }}
        >
          {filter.label}
          <span className="xray-chip-count">{counts[filter.id]}</span>
        </button>
      ))}
    </div>
  );
}
