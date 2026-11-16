import React, { useRef, useState } from 'react';
import { DIVIDER_STEP_PX } from '../../models/sqlLayout';

// A focusable splitter: drag with the pointer, or step it with the arrow keys (24 px a step); Home and
// End jump to the limits, and a double-click restores the default.
// `orientation` is the separator's own: "horizontal" sits between stacked panes, "vertical" between
// side-by-side ones.
export function SqlDivider({
  orientation,
  label,
  value,
  valueText,
  min,
  max,
  defaultValue,
  onSet,
  onStep,
  onDrag,
}: {
  orientation: 'horizontal' | 'vertical';
  label: string;
  value: number;
  valueText: string;
  min: number;
  max: number;
  defaultValue: number;
  onSet(value: number): void;
  onStep(deltaPx: number): void;
  onDrag(clientX: number, clientY: number): void;
}): React.ReactElement {
  const [dragging, setDragging] = useState(false);
  const pointer = useRef<number | null>(null);
  const back = orientation === 'horizontal' ? 'ArrowUp' : 'ArrowLeft';
  const forward = orientation === 'horizontal' ? 'ArrowDown' : 'ArrowRight';

  return (
    <div
      role="separator"
      tabIndex={0}
      aria-label={label}
      aria-orientation={orientation}
      aria-valuenow={Math.round(value)}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuetext={valueText}
      title={`${label} (double-click to reset)`}
      className={`xray-sql-divider ${orientation}${dragging ? ' dragging' : ''}`}
      onKeyDown={(e) => {
        if (e.key === back || e.key === forward) {
          e.preventDefault();
          onStep(e.key === back ? -DIVIDER_STEP_PX : DIVIDER_STEP_PX);
        } else if (e.key === 'Home' || e.key === 'End') {
          e.preventDefault();
          onSet(e.key === 'Home' ? min : max);
        }
      }}
      onDoubleClick={() => onSet(defaultValue)}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        pointer.current = e.pointerId;
        e.currentTarget.setPointerCapture(e.pointerId);
        setDragging(true);
      }}
      onPointerMove={(e) => {
        if (pointer.current === e.pointerId) onDrag(e.clientX, e.clientY);
      }}
      onPointerUp={(e) => {
        if (pointer.current !== e.pointerId) return;
        pointer.current = null;
        e.currentTarget.releasePointerCapture(e.pointerId);
        setDragging(false);
      }}
      onPointerCancel={() => {
        pointer.current = null;
        setDragging(false);
      }}
    />
  );
}
