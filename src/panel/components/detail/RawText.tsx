import React from 'react';
import { layoutRawText, rawBlocks, rowForOffset } from '../../models/textDisplay';
import { visibleText } from '../common/VisibleText';
import { useRowWindow } from '../common/useRowWindow';

/** A character to mark (a JSON syntax error), as an offset into the text. */
export interface RawMark {
  offset: number;
  message: string;
}

export interface RawTextHandle {
  /** Scroll the row holding `offset` into view. */
  reveal(offset: number): void;
}

const RAW_LINE_HEIGHT = 18;
/** Estimate for a long row before it is measured. */
const RAW_CHARS_PER_LINE = 100;

/**
 * Text exactly as given, windowed (spec J2): one row per line, long lines in segments, rows grouped
 * into blocks (models/textDisplay.ts), and only the blocks in view mounted — so 5 MB of text, a
 * 200,000-line pretty print or one 250,000-character line stays responsive. Bidi controls show as
 * escapes (J13); the text itself is not changed. With `mark`, the character at the offset is
 * highlighted (an end-of-input offset gets a marker of its own). Line numbers in a gutter unless
 * `gutter` is false. The parent bounds its height.
 */
export function RawText({ text, mark = null, gutter = true, label, handle }: {
  text: string;
  mark?: RawMark | null;
  gutter?: boolean;
  label: string;
  handle?: React.Ref<RawTextHandle>;
}): React.ReactElement {
  const layout = React.useMemo(() => layoutRawText(text), [text]);
  const blocks = React.useMemo(() => rawBlocks(layout), [layout]);
  // Blocks are keyed per text: Pretty swaps the text under the same indexes, and a size measured
  // for an old block must not position a new one. (Numeric keys: no string per block.)
  const [keyed, setKeyed] = React.useState(() => ({ text, generation: 0 }));
  if (keyed.text !== text) setKeyed({ text, generation: keyed.generation + 1 });
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const rowHeight = (row: number): number => Math.max(1, Math.ceil((layout.end[row] - layout.start[row]) / RAW_CHARS_PER_LINE)) * RAW_LINE_HEIGHT;
  const virtualizer = useRowWindow({
    count: blocks.length - 1,
    scrollRef,
    estimateSize: (block) => {
      let height = 0;
      for (let row = blocks[block]; row < blocks[block + 1]; row++) height += rowHeight(row);
      return height;
    },
    getItemKey: (block) => keyed.generation * 2 ** 32 + block,
    overscan: 2,
  });
  React.useImperativeHandle(handle, () => ({
    reveal: (offset: number) => virtualizer.scrollToIndex(blockOf(blocks, rowForOffset(layout, offset)), { align: 'center' }),
  }), [blocks, layout, virtualizer]);

  const markRow = mark ? rowForOffset(layout, mark.offset) : -1;

  function rowContent(index: number): React.ReactNode {
    const from = layout.start[index];
    const to = layout.end[index];
    if (index !== markRow || !mark) return visibleText(text.slice(from, to));
    const at = mark.offset;
    if (at < from || at >= to) {
      // The offset is the end of the text (or of this line): mark the gap after the last character.
      return <>{visibleText(text.slice(from, to))}<mark className="xray-raw-mark gap" title={mark.message}>{' '}</mark></>;
    }
    const pair = (text.charCodeAt(at) & 0xfc00) === 0xd800 && at + 1 < to && (text.charCodeAt(at + 1) & 0xfc00) === 0xdc00;
    const after = at + (pair ? 2 : 1);
    return (
      <>
        {visibleText(text.slice(from, at))}
        <mark className="xray-raw-mark" title={mark.message}>{visibleText(text.slice(at, after))}</mark>
        {visibleText(text.slice(after, to))}
      </>
    );
  }

  return (
    <div ref={scrollRef} className={`xray-json xray-raw${gutter ? '' : ' no-gutter'}`} role="region" aria-label={label} tabIndex={0}>
      <div className="xray-raw-list" style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((item) => {
          const rows: React.ReactElement[] = [];
          for (let index = blocks[item.index]; index < blocks[item.index + 1]; index++) {
            const first = layout.first[index] === 1;
            rows.push(
              <div key={index} data-raw-row={index} data-cont={first ? undefined : ''} className={`xray-json-line${index === markRow ? ' has-mark' : ''}`}>
                {gutter && <span className="xray-json-line-no" aria-hidden="true">{first ? layout.line[index] : ''}</span>}
                <span className="xray-json-line-text">{rowContent(index)}</span>
              </div>,
            );
          }
          return (
            <div key={item.key} data-index={item.index} ref={virtualizer.measureElement} className="xray-raw-block" style={{ transform: `translateY(${item.start}px)` }}>
              {rows}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** The block holding `row` (blocks: each block's first row, then the row count). */
function blockOf(blocks: Int32Array, row: number): number {
  let low = 0;
  let high = blocks.length - 2;
  while (low < high) {
    const mid = (low + high + 1) >> 1;
    if (blocks[mid] <= row) low = mid;
    else high = mid - 1;
  }
  return low;
}
