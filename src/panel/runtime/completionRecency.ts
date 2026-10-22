import { createRecency, RECENCY_KEY } from '../models/consoleRecency';
import { getStoredValue, setStoredValue } from './storageBridge';

// Completion recency (spec §3) for this surface: memory hydrated once from extension
// storage, written through on each accept. Storage failures only cost the boost.
// Each surface (panel, HUD, pop-out, DevTools) keeps its own memory; the last to write wins.
let memory: string[] = [];
let hydrated = false;

function persist(next: string[]): void {
  setStoredValue(RECENCY_KEY, next).catch(() => undefined);
}

export const completionRecency = createRecency({
  get: () => memory,
  set: (next) => {
    memory = next;
    persist(next);
  },
});

export function hydrateCompletionRecency(): void {
  if (hydrated) return;
  hydrated = true;
  getStoredValue<unknown>(RECENCY_KEY, [])
    .then((stored) => {
      if (!Array.isArray(stored)) return;
      const early = memory;
      // Accepts made before the read finished stay newest, and are written back merged.
      memory = [...early, ...stored.filter((v): v is string => typeof v === 'string' && !early.includes(v))];
      if (early.length) persist(memory);
    })
    .catch(() => undefined);
}

/** Forget every remembered accept (Clear console: everything or my commands). */
export function clearCompletionRecency(): void {
  hydrated = true;
  memory = [];
  persist([]);
}
