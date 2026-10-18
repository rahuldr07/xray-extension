import { flushSync } from 'react-dom';
import { usePanelStore } from '../../store';

/** The `Console command` field in `scope`'s root (document or the panel's closed shadow root). */
function consoleField(scope: Node): HTMLTextAreaElement | HTMLInputElement | null {
  const root = scope.getRootNode() as Document | ShadowRoot;
  return root.querySelector<HTMLTextAreaElement | HTMLInputElement>(
    'textarea[aria-label="Console command"], input[aria-label="Console command"]',
  );
}

/** Commit `next` as the draft, then focus the field with the caret at `caret`. */
function commitDraft(field: HTMLTextAreaElement | HTMLInputElement | null, next: string, caret: number): void {
  flushSync(() => usePanelStore.getState().setConsoleDraft(next));
  if (!field) return;
  field.focus();
  field.setSelectionRange(caret, caret);
}

/**
 * Insert text into the Console draft at the caret of the `Console command` field
 * (replacing its selection), then focus the field with the caret after the insert.
 * The store's `consoleDraft` is the source of truth; the field is found by its
 * accessible name in `scope`'s root (document or the panel's closed shadow root),
 * so any editor that keeps that label and a native selection keeps working.
 * Without a field the text is appended. Never evaluates anything.
 */
export function insertAtConsoleCaret(scope: Node, text: string): void {
  const field = consoleField(scope);
  const draft = usePanelStore.getState().consoleDraft;
  const start = Math.min(field?.selectionStart ?? draft.length, draft.length);
  const end = Math.max(start, Math.min(field?.selectionEnd ?? draft.length, draft.length));
  commitDraft(field, draft.slice(0, start) + text + draft.slice(end), start + text.length);
}

/**
 * Add a starter (P8) to the draft: it becomes the draft when that is empty, else it
 * goes on a new line below it (a typed draft is never clobbered). The caret lands at
 * `caretOffset` within the inserted text (e.g. before the `)` of `find(u => u.id === )`).
 * Never evaluates anything.
 */
export function appendToConsoleDraft(scope: Node, text: string, caretOffset = text.length): void {
  const draft = usePanelStore.getState().consoleDraft.trimEnd();
  const prefix = draft ? `${draft}\n` : '';
  commitDraft(consoleField(scope), prefix + text, prefix.length + caretOffset);
}
