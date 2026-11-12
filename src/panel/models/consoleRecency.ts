/**
 * Completion recency (spec §3): the last accepted suggestion labels, newest first, so a
 * recently accepted name leads its ranking tier. Pure: the caller supplies synchronous
 * storage (the editor backs it with memory hydrated from extension storage).
 */
export const RECENCY_KEY = 'console_completion_recency';

export interface RecencyStorage { get(): string[]; set(value: string[]): void }

export function createRecency(storage: RecencyStorage, limit = 200): { record(label: string): void; score(label: string): number } {
  let seen: unknown = undefined;
  let ranks = new Map<string, number>();
  const list = (): string[] => {
    const value = storage.get();
    return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string').slice(0, limit) : [];
  };
  return {
    record(label: string): void {
      const name = String(label ?? '');
      if (!name) return;
      storage.set([name, ...list().filter((v) => v !== name)].slice(0, limit));
    },
    // limit for the newest, falling by one per older accept; 0 when absent.
    score(label: string): number {
      const value = storage.get();
      if (value !== seen) {
        seen = value;
        ranks = new Map();
        list().forEach((name, index) => { if (!ranks.has(name)) ranks.set(name, limit - index); });
      }
      return ranks.get(label) ?? 0;
    },
  };
}
