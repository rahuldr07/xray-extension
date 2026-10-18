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

// Reusable draggable divider between two panes. Clones the interaction model of
// the panel-edge resize handle: pointer drag with capture, arrow-key nudge,
// Home/End, double-click reset, and separator semantics for assistive tech.
// `value` must be the effective current size (parents resolve their own "auto"
// default before rendering). The default divider sits between COLUMNS and
// drags along x in px; `orientation="horizontal"` sits between ROWS and drags
// along y. `unitsPerPx` converts pointer pixels into the value's unit (e.g. a
// percent of the container height); it defaults to 1 (px).
export function PaneDivider({ label, value, min, max, step = 24, orientation = 'vertical', unitsPerPx, valueText, onLiveChange, onCommit, onReset }: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  orientation?: 'vertical' | 'horizontal';
  unitsPerPx?: () => number;
  valueText?: (value: number) => string;
  onLiveChange(next: number): void;
  onCommit(next: number): void;
  onReset(): void;
}): React.ReactElement {
  const horizontal = orientation === 'horizontal';
  const coord = (event: React.PointerEvent): number => (horizontal ? event.clientY : event.clientX);
  const drag = React.useRef<{ startX: number; width: number; latest: number; scale: number } | null>(null);
  const raf = React.useRef(0);
  const [dragging, setDragging] = React.useState(false);
  const clamp = (width: number): number => Math.max(min, Math.min(max, Math.round(width)));

  React.useEffect(() => () => { if (raf.current) cancelAnimationFrame(raf.current); }, []);

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>): void {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { startX: coord(event), width: value, latest: coord(event), scale: unitsPerPx?.() ?? 1 };
    setDragging(true);
    onLiveChange(value);
  }

  // Coalesce pointer moves to one layout update per frame — dragging fires
  // moves far faster than the browser can relayout the grid, and unthrottled
  // setState made the resize feel jumpy.
  function onPointerMove(event: React.PointerEvent<HTMLDivElement>): void {
    const state = drag.current;
    if (!state) return;
    // Record the newest position BEFORE the frame guard, so the queued frame
    // applies where the cursor is now rather than where it was on the first
    // move of the frame (matching PanelShell's edge-resize handler).
    state.latest = coord(event);
    if (raf.current) return;
    raf.current = requestAnimationFrame(() => {
      raf.current = 0;
      const current = drag.current;
      if (current) onLiveChange(clamp(current.width + (current.latest - current.startX) * current.scale));
    });
  }

  function commit(event: React.PointerEvent<HTMLDivElement>): void {
    const state = drag.current;
    if (!state) return;
    drag.current = null;
    if (raf.current) { cancelAnimationFrame(raf.current); raf.current = 0; }
    setDragging(false);
    try { event.currentTarget.releasePointerCapture(event.pointerId); } catch {}
    onCommit(clamp(state.width + (coord(event) - state.startX) * state.scale));
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>): void {
    const [decrease, increase] = horizontal ? ['ArrowUp', 'ArrowDown'] : ['ArrowLeft', 'ArrowRight'];
    let next: number;
    if (event.key === 'Home') next = min;
    else if (event.key === 'End') next = max;
    else if (event.key === decrease || event.key === increase) next = value + (event.key === increase ? step : -step);
    else return;
    event.preventDefault();
    onCommit(clamp(next));
  }

  return (
    <div
      className={`xray-pane-divider ${horizontal ? 'xray-pane-divider-rows' : ''} ${dragging ? 'dragging' : ''}`}
      role="separator"
      aria-orientation={orientation}
      aria-label={`${label} - drag, or use arrow keys`}
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuetext={valueText?.(value)}
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
