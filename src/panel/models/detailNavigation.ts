import type { DetailTab, DetailView } from '../types';

export type DetailFacet = 'response' | 'request' | 'headers' | 'timing' | 'frames' | 'cookies' | 'initiator' | 'tokens';
export const bodyViews = ['tree', 'raw', 'grid', 'schema', 'diff', 'viz'] as const;
export type BodyView = typeof bodyViews[number];

/** Project existing persisted preferences; specialized views take precedence. */
export function resolveDetailFacet(tab: DetailTab, view: DetailView): DetailFacet {
  if (view === 'waterfall') return 'timing';
  if (view === 'headers' || tab === 'headers') return 'headers';
  return tab === 'request' ? 'request' : 'response';
}

export function isBodyView(view: DetailView): view is BodyView {
  return (bodyViews as readonly string[]).includes(view);
}
