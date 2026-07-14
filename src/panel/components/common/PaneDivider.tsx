import React from 'react';

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
  const [dragging, setDragging] = React.useState(false);
  const clamp = (width: number): number => Math.max(min, Math.min(max, Math.round(width)));

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>): void {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { startX: event.clientX, width: value };
    setDragging(true);
    onLiveChange(value);
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>): void {
    const state = drag.current;
    if (!state) return;
    const next = clamp(state.width + (event.clientX - state.startX));
    onLiveChange(next);
  }

  function commit(event: React.PointerEvent<HTMLDivElement>): void {
    const state = drag.current;
    if (!state) return;
    drag.current = null;
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
