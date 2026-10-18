import React from 'react';
import { bidiEscape, bidiName, splitBidi } from '../../models/textDisplay';

/**
 * Captured text for display (spec J13): a bidi control (an override such as U+202E, an isolate or a
 * mark) is shown as its escape, `‮`, set apart so it reads as a marker and not as text — left in,
 * it would reorder the characters around it on screen. Text without one is returned as it is.
 */
export function visibleText(text: string): React.ReactNode {
  const parts = splitBidi(text);
  if (parts.length === 0) return text;
  if (parts.length === 1 && typeof parts[0] === 'string') return text;
  return parts.map((part, index) => (typeof part === 'number'
    ? <span key={index} className="xray-bidi" title={`${bidiName(part)}, shown escaped`}>{bidiEscape(part)}</span>
    : <React.Fragment key={index}>{part}</React.Fragment>));
}

export function VisibleText({ text }: { text: string }): React.ReactElement {
  return <>{visibleText(text)}</>;
}
