import React from 'react';

// Container-aware split state for a resizable list/detail layout. The stored
// width (0 = auto) is never mutated by an outer resize — instead the divider's
// max and the applied CSS var are derived from the CURRENT container width, so
// shrinking the panel temporarily clamps the split (keeping the detail pane
// usable) and widening it restores the user's chosen width. Pair the returned
// `containerRef`/`paneRef` with the grid element and the list pane.
export function usePaneSplit(options: {
  stored: number;
  varName: string;
  minList: number;
  minRest: number;
}): {
  containerRef: React.RefObject<HTMLDivElement | null>;
  paneRef: React.RefObject<HTMLDivElement | null>;
  value: number;
  max: number;
  min: number;
  splitStyle: React.CSSProperties | undefined;
  setLive(next: number | null): void;
} {
  const { stored, varName, minList, minRest } = options;
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const paneRef = React.useRef<HTMLDivElement | null>(null);
  const [live, setLive] = React.useState<number | null>(null);
  const [containerWidth, setContainerWidth] = React.useState(0);
  const [measuredPane, setMeasuredPane] = React.useState(0);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === 'undefined') return;
    const update = (): void => {
      setContainerWidth(Math.round(container.getBoundingClientRect().width));
      if (paneRef.current) setMeasuredPane(Math.round(paneRef.current.getBoundingClientRect().width));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Largest the list may grow to while leaving the rest of the row usable.
  const max = containerWidth > 0 ? Math.max(minList, containerWidth - minRest) : Math.max(minList, 1200);
  const desired = live ?? (stored || measuredPane || minList);
  const value = Math.min(max, Math.max(minList, desired));
  // Only emit the var once there's a real chosen width; auto mode leaves the
  // grid's default sizing in place. The emitted value is container-clamped so a
  // stored width wider than the panel doesn't overflow.
  const active = live ?? stored;
  const splitStyle = active > 0 ? ({ [varName]: `${Math.min(max, Math.max(minList, active))}px` } as React.CSSProperties) : undefined;

  return { containerRef, paneRef, value, max, min: minList, splitStyle, setLive };
}

// Reusable draggable column divider between two panes. Clones the interaction
// model of the panel-edge resize handle: pointer drag with capture, arrow-key
// nudge, double-click reset, and separator semantics for assistive tech.
// `value` must be the effective current width in px (parents resolve their
// own "auto" default before rendering).
export function PaneDivider({ label, value, min, max, step = 24, onLiveChange, onCommit, onReset }: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onLiveChange(next: number): void;
  onCommit(next: number): void;
  onReset(): void;
}): React.ReactElement {
  const drag = React.useRef<{ startX: number; width: number } | null>(null);
  const raf = React.useRef(0);
  const [dragging, setDragging] = React.useState(false);
  const clamp = (width: number): number => Math.max(min, Math.min(max, Math.round(width)));

  React.useEffect(() => () => { if (raf.current) cancelAnimationFrame(raf.current); }, []);

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>): void {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { startX: event.clientX, width: value };
    setDragging(true);
    onLiveChange(value);
  }

  // Coalesce pointer moves to one layout update per frame — dragging fires
  // moves far faster than the browser can relayout the grid, and unthrottled
  // setState made the resize feel jumpy.
  function onPointerMove(event: React.PointerEvent<HTMLDivElement>): void {
    const state = drag.current;
    if (!state) return;
    const clientX = event.clientX;
    if (raf.current) return;
    raf.current = requestAnimationFrame(() => {
      raf.current = 0;
      if (drag.current) onLiveChange(clamp(state.width + (clientX - state.startX)));
    });
  }

  function commit(event: React.PointerEvent<HTMLDivElement>): void {
    const state = drag.current;
    if (!state) return;
    drag.current = null;
    if (raf.current) { cancelAnimationFrame(raf.current); raf.current = 0; }
    setDragging(false);
    try { event.currentTarget.releasePointerCapture(event.pointerId); } catch {}
    onCommit(clamp(state.width + (event.clientX - state.startX)));
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>): void {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    onCommit(clamp(value + (event.key === 'ArrowRight' ? step : -step)));
  }

  return (
    <div
      className={`xray-pane-divider ${dragging ? 'dragging' : ''}`}
      role="separator"
      aria-orientation="vertical"
      aria-label={`${label} — drag, or use arrow keys`}
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={commit}
      onPointerCancel={commit}
      onKeyDown={onKeyDown}
      onDoubleClick={onReset}
      title="Drag to resize · double-click to reset"
    />
  );
}
