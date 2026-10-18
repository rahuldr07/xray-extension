import type React from 'react';
import { useVirtualizer, type Virtualizer } from '@tanstack/react-virtual';

/**
 * Windowed rows of variable height inside their own scroll container (the JSON Tree and Raw views):
 * rows are measured as they mount, and the first render already lays out a window of rows (an
 * assumed 800×480 viewport) instead of waiting a frame for the container's size.
 */
export function useRowWindow({ count, scrollRef, estimateSize, getItemKey, overscan = 10 }: {
  count: number;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  estimateSize: (index: number) => number;
  getItemKey: (index: number) => React.Key;
  overscan?: number;
}): Virtualizer<HTMLDivElement, Element> {
  return useVirtualizer({
    count,
    getScrollElement: () => scrollRef.current,
    estimateSize,
    getItemKey,
    measureElement: (element) => element.getBoundingClientRect().height,
    overscan,
    initialRect: { width: 800, height: 480 },
  });
}
