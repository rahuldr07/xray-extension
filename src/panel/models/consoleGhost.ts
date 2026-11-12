import type { Suggestion } from './consoleAssist';

export interface GhostState {
  draft: string;
  caret: number;
  /** The list's active suggestion (the top one unless ↑/↓ moved the selection). */
  top?: Suggestion;
  /** Console history, newest first. */
  history: readonly unknown[];
  listOpen: boolean;
}

/**
 * Ghost text (spec §3): the characters a Tab or → at line end would complete, painted faint
 * after the caret. With the list open it is the rest of the active suggestion's label, only
 * when the label continues exactly what was typed (case included: `ma` → `Math` rewrites
 * the typed text, so no ghost). With the list closed it is the rest of the newest history
 * entry that starts with the whole draft and is longer (a multi-line rest is skipped), for
 * a draft of 2 or more characters (the list's own gate: a 1-character draft never makes
 * Tab insert). Empty unless the caret ends its line: the ghost is drawn inline, so any text
 * after it — even an auto-closed `)` — would be pushed out of line with the textarea.
 */
export function ghostFor(state: GhostState): string {
  const draft = String(state.draft ?? '');
  const caret = Math.max(0, Math.min(Number(state.caret) || 0, draft.length));
  const before = draft.slice(0, caret);
  const after = draft.slice(caret);
  if (after.split('\n', 1)[0]) return '';
  if (state.listOpen) {
    const top = state.top;
    if (!top) return '';
    const typed = top.from != null && top.from <= caret ? draft.slice(top.from, caret) : (/[\w$]*$/.exec(before)?.[0] ?? '');
    if (!typed || !top.label.startsWith(typed) || top.label.length <= typed.length) return '';
    return top.label.slice(typed.length);
  }
  if (after || draft.trim().length < 2) return '';
  for (const entry of state.history ?? []) {
    if (typeof entry !== 'string' || entry.length <= draft.length || !entry.startsWith(draft)) continue;
    const ghost = entry.slice(draft.length);
    if (!ghost.includes('\n')) return ghost;
  }
  return '';
}
