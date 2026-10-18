import React, { useEffect, useId, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import {
  IconAlignLeft,
  IconArrowsMaximize,
  IconArrowsMinimize,
  IconBookmarkPlus,
  IconChevronRight,
  IconCursorText,
} from '@tabler/icons-react';
import { navigateConsoleHistory } from '../../runtime/consoleBridge';
import { parsePlainPath, resolvePath, signatureAt, suggest, tokenize, type CapturedSummary, type Suggestion } from '../../models/consoleAssist';
import { hasOpenDialog } from '../common/ModalShell';

const iconProps = { size: 16, stroke: 1.8 } as const;
const PREVIEW_TEXT_MAX = 80;
const PREVIEW_KEYS_MAX = 4;
// Expanded editor: the suggestion list's gap to the caret line and its height cap (CSS 232px).
const SUGGESTION_GAP = 4;
const SUGGESTIONS_MAX_HEIGHT = 232;

// P9: fixed helper chips; saved and pinned variables are inserted between them.
const LEADING_CHIPS = ['res', 'req', 'schema(res)', '$prev'];
const TRAILING_CHIPS = ['$help'];

// P10: auto-closing pairs in the expanded editor.
const PAIRS: Record<string, string> = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'", '`': '`' };
const CLOSERS = new Set([')', ']', '}', '"', "'", '`']);
const QUOTES = new Set(['"', "'", '`']);

export interface ConsoleEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRun: () => void;
  /** Ctrl/⌘+↑ and the Expand toggle (P10 expanded editor). Without it neither exists. */
  onExpandToggle?: () => void;
  /** P10: the large editor — line numbers, auto-closing pairs, Format, Run all/selection, Save as snippet. */
  expanded?: boolean;
  /** Expanded editor: run this code through the prompt's normal run path (Run all, Run selection). */
  onRunCode?: (code: string) => void;
  /** Expanded editor: Save as snippet. */
  onSaveSnippet?: (code: string) => void;
  /** A command is running: Run selection waits. */
  running?: boolean;
  /** Helper chips under the editor (P9). Off while the empty stream shows its own chips. */
  showChips?: boolean;
  /** Values that plain paths and member suggestions resolve against locally (`res`, `req`, pins, temp vars). */
  roots: Record<string, unknown>;
  /** Saved variable names (`temp1`, `$_`) and pinned letters, offered as suggestions and chips. */
  variables: string[];
  /** What the captured calls look like (Task 4 passes it); lets suggestions offer keys and values. */
  captured?: CapturedSummary;
  /** Controls rendered on the command row after the field (Run, Snippets, …). */
  actions?: React.ReactNode;
}

function lineStart(text: string, at: number): boolean {
  return !text.slice(0, at).includes('\n');
}

function lineEnd(text: string, at: number): boolean {
  return !text.slice(at).includes('\n');
}

/**
 * Format (P10): re-indent every line by bracket depth, two spaces per level — no
 * external formatter. Brackets inside strings, template literals and comments do
 * not count; a line that starts with closers dedents first; lines that begin
 * inside a template literal or block comment are left exactly as written.
 * Regex literals are not recognised (a bracket in one counts).
 */
export function reindent(code: string): string {
  let depth = 0;
  // A construct still open at the end of the previous line.
  let carried: '`' | '/*' | null = null;
  return code.split('\n').map((line) => {
    const startsInside = carried !== null;
    const text = startsInside ? line : line.replace(/^[ \t]+/, '');
    const before = depth;
    let mode: '`' | '/*' | '"' | "'" | null = carried;
    let leadingClosers = 0;
    let leading = true;
    for (let i = 0; i < text.length; i += 1) {
      const ch = text[i];
      if (mode === '/*') {
        if (ch === '*' && text[i + 1] === '/') { mode = null; i += 1; }
        leading = false;
        continue;
      }
      if (mode) {
        if (ch === '\\') i += 1;
        else if (ch === mode) mode = null;
        leading = false;
        continue;
      }
      if (ch === '/' && text[i + 1] === '/') break;
      if (ch === '/' && text[i + 1] === '*') { mode = '/*'; i += 1; leading = false; continue; }
      if (ch === '"' || ch === "'" || ch === '`') { mode = ch; leading = false; continue; }
      if (ch === '(' || ch === '[' || ch === '{') { depth += 1; leading = false; continue; }
      if (ch === ')' || ch === ']' || ch === '}') {
        depth = Math.max(0, depth - 1);
        if (leading) leadingClosers += 1;
        continue;
      }
      if (!/\s/.test(ch)) leading = false;
    }
    // Plain quotes end with the line; template literals and block comments carry on.
    carried = mode === '`' || mode === '/*' ? mode : null;
    if (startsInside) return line;
    if (!text.trim()) return '';
    return '  '.repeat(Math.max(0, before - leadingClosers)) + text;
  }).join('\n');
}

/**
 * Size the collapsed editor to its content (CSS caps it at 8 lines). Without a layout
 * box — the in-page panel mounts hidden — scrollHeight is 0 and would pin the field
 * collapsed, so the inline height is cleared instead and the width observer re-fits
 * once the field is shown.
 */
function fitHeight(el: HTMLTextAreaElement, expanded: boolean): void {
  if (expanded || !el.isConnected || el.getClientRects().length === 0) {
    el.style.height = '';
    return;
  }
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}

/** Short, one-line rendering of a locally resolved value for the live preview (P7). */
function previewValue(value: unknown): string {
  if (value === undefined) return 'undefined';
  if (value === null || typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value === 'string') {
    return JSON.stringify(value.length > PREVIEW_TEXT_MAX ? value.slice(0, PREVIEW_TEXT_MAX) + '…' : value);
  }
  if (Array.isArray(value)) return `Array(${value.length})`;
  if (typeof value === 'object') {
    const keys = Object.keys(value as Record<string, unknown>);
    const shown = keys.slice(0, PREVIEW_KEYS_MAX).join(', ');
    return `{${shown}${keys.length > PREVIEW_KEYS_MAX ? ', …' : ''}}`;
  }
  return String(value);
}

// Bare identifiers need two characters before the list opens, so a one-letter
// word (`a`, `x`) never captures ↑/↓/Enter. Member access (`res.`, `res[`) opens
// at once. An exact match of what is already typed is not offered: Enter runs.
function visibleSuggestions(
  draft: string,
  caret: number,
  roots: Record<string, unknown>,
  variables: string[],
  captured: CapturedSummary | undefined,
  manual: boolean,
): { from: number; items: Suggestion[] } {
  const result = suggest(draft, caret, { roots, variables, captured, manual });
  const partial = draft.slice(result.from, caret);
  const before = draft.slice(0, result.from);
  const member = /(?:\.|\[["']?)$/.test(before);
  const open = manual || member || result.context === 'member' || result.context === 'argument';
  if (!open && partial.length < 2) return { from: result.from, items: [] };
  return {
    from: result.from,
    items: result.items.filter((item) => item.insert !== draft.slice(item.from ?? result.from, caret)),
  };
}

/** Consecutive items sharing a `group` render under one header; flat indices stay global. */
function groupItems(items: Suggestion[]): Array<{ group?: string; entries: Array<{ item: Suggestion; index: number }> }> {
  const out: Array<{ group?: string; entries: Array<{ item: Suggestion; index: number }> }> = [];
  items.forEach((item, index) => {
    const last = out[out.length - 1];
    if (last && last.group === item.group && item.group !== undefined) last.entries.push({ item, index });
    else out.push({ group: item.group, entries: [{ item, index }] });
  });
  return out;
}

/**
 * The Console prompt editor (spec P3–P7, P9). The real input is a native, labelled
 * textarea with transparent text; an `aria-hidden`, pointer-transparent overlay behind
 * it paints the syntax colours, so caret, selection, IME, undo and accessibility stay
 * native. Suggestions, the signature hint, the live path preview and the chips work on
 * captured data only — nothing here evaluates code.
 */
export const ConsoleEditor = React.forwardRef<HTMLTextAreaElement | null, ConsoleEditorProps>(function ConsoleEditor(
  { value, onChange, onRun, onExpandToggle, expanded = false, onRunCode, onSaveSnippet, running = false, showChips = true, roots, variables, captured, actions },
  ref,
): React.ReactElement {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const overlayRef = useRef<HTMLPreElement | null>(null);
  const gutterRef = useRef<HTMLDivElement | null>(null);
  // Run selection needs a non-empty selection; kept in state so the button tracks it.
  const [hasSelection, setHasSelection] = useState(false);
  const historyRef = useRef<{ active: boolean; draft: string }>({ active: false, draft: '' });
  const [caret, setCaret] = useState(0);
  // The list opens only from the user's own typing, never from a draft set elsewhere
  // (snippets, starters, history), and stays shut once dismissed until the next edit.
  const [listOpen, setListOpen] = useState(false);
  // Ctrl+Space: browse even on an empty word, no 2-character gate; lasts while identifier
  // characters are typed, until any other edit, Escape, blur or accept.
  const [manualOpen, setManualOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const listId = useId();
  const listRef = useRef<HTMLUListElement | null>(null);
  const emptyRef = useRef<HTMLDivElement | null>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLTextAreaElement, []);

  const at = Math.min(caret, value.length);
  const suggestions = useMemo(
    () => (listOpen ? visibleSuggestions(value, at, roots, variables, captured, manualOpen) : { from: at, items: [] as Suggestion[] }),
    [listOpen, value, at, roots, variables, captured, manualOpen],
  );
  const open = suggestions.items.length > 0;
  // A manual open with nothing to offer shows a "No suggestions" row in the list's place.
  const showEmpty = !open && listOpen && manualOpen;
  const active = open ? Math.min(activeIndex, suggestions.items.length - 1) : -1;
  const optionId = (index: number): string => `${listId}-option-${index}`;

  // Expanded (P10): the list sits inside the field beside the caret's line — below it,
  // or above it when there is more room there — so it never covers what is being typed
  // and never leaves the field (at full height the field starts at the Console's top).
  useLayoutEffect(() => {
    const list = listRef.current ?? emptyRef.current;
    const input = inputRef.current;
    const field = list?.parentElement;
    if (!list || !input || !field) return;
    list.style.top = '';
    list.style.maxHeight = '';
    if (!expanded) return;
    const style = getComputedStyle(input);
    const lineHeight = parseFloat(style.lineHeight) || 18;
    const inputTop = input.getBoundingClientRect().top - field.getBoundingClientRect().top - field.clientTop;
    const line = value.slice(0, at).split('\n').length - 1;
    const room = field.clientHeight;
    const caretTop = Math.min(Math.max(inputTop + (parseFloat(style.paddingTop) || 0) + line * lineHeight - input.scrollTop, 0), room);
    const caretBottom = Math.min(caretTop + lineHeight, room);
    const below = room - caretBottom - SUGGESTION_GAP;
    const above = caretTop - SUGGESTION_GAP;
    const natural = Math.min(list.scrollHeight, SUGGESTIONS_MAX_HEIGHT);
    const placeBelow = natural <= below || below >= above;
    const height = Math.max(0, Math.min(natural, placeBelow ? below : above));
    list.style.maxHeight = `${Math.floor(height)}px`;
    list.style.top = `${Math.round(placeBelow ? caretBottom + SUGGESTION_GAP / 2 : caretTop - SUGGESTION_GAP / 2 - height)}px`;
  }, [expanded, open, showEmpty, value, at, suggestions.items.length]);

  // Keep the active option inside the list's scroll box (↑ wraps to the last one).
  // Only the list scrolls — never the Console around it.
  useLayoutEffect(() => {
    const list = listRef.current;
    const option = list?.querySelector<HTMLElement>('[role="option"][aria-selected="true"]') ?? undefined;
    if (!list || !option) return;
    if (option.offsetTop < list.scrollTop) list.scrollTop = option.offsetTop;
    else if (option.offsetTop + option.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTop = option.offsetTop + option.offsetHeight - list.clientHeight;
    }
  }, [active, open]);

  const hint = useMemo((): { kind: 'signature' | 'preview'; text: string; note: string; parts?: [string, string, string] } | null => {
    const signature = signatureAt(value, at);
    if (signature) {
      const param = signature.index < signature.params.length ? signature.params[signature.index] : undefined;
      // Split the signature around the active parameter's name (scanning the params in order).
      let parts: [string, string, string] | undefined;
      if (param) {
        let pos = signature.signature.indexOf('(') + 1;
        let found = -1;
        for (let i = 0; i <= signature.index; i += 1) {
          found = signature.signature.indexOf(signature.params[i].name, pos);
          if (found < 0) break;
          pos = found + signature.params[i].name.length;
        }
        if (found >= 0) parts = [signature.signature.slice(0, found), param.name, signature.signature.slice(found + param.name.length)];
      }
      return { kind: 'signature', text: signature.signature, note: param?.description || signature.description, parts };
    }
    const path = parsePlainPath(value);
    if (!path) return null;
    const hit = resolvePath(path, roots);
    return hit.found ? { kind: 'preview', text: `→ ${previewValue(hit.value)}`, note: '(from captured data)' } : null;
  }, [value, at, roots]);

  const tokens = useMemo(() => tokenize(value), [value]);

  // P3: grow with the content; CSS caps the height at 8 lines, after which it scrolls.
  // Expanded (P10), the pane's height comes from the layout instead.
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    fitHeight(el, expanded);
    syncScroll(el);
  }, [value, expanded]);

  // The wrap — and so the height — also changes with the field's width: the in-page
  // panel mounts hidden and is shown later, and the panel can be resized. Re-fit when
  // the width changes (a frame later, so the height change is not reported back to
  // this observer within the same frame).
  useEffect(() => {
    const el = inputRef.current;
    const field = el?.closest<HTMLElement>('.xray-editor-field');
    if (!el || !field || typeof ResizeObserver === 'undefined') return undefined;
    const win = el.ownerDocument.defaultView;
    let width = field.clientWidth;
    let frame = 0;
    const observer = new ResizeObserver(() => {
      if (field.clientWidth === width) return;
      width = field.clientWidth;
      if (frame) win?.cancelAnimationFrame(frame);
      frame = win?.requestAnimationFrame(() => { frame = 0; fitHeight(el, expanded); }) ?? 0;
    });
    observer.observe(field);
    return () => {
      observer.disconnect();
      if (frame) win?.cancelAnimationFrame(frame);
    };
  }, [expanded]);

  // The native `select` event also covers selections set from script; collapsing
  // clicks and keys are caught by onMouseUp/onKeyUp.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return undefined;
    const update = (): void => setHasSelection(el.selectionStart !== el.selectionEnd);
    el.addEventListener('select', update);
    return () => el.removeEventListener('select', update);
  }, []);

  function syncScroll(el: HTMLTextAreaElement): void {
    if (overlayRef.current) {
      overlayRef.current.scrollTop = el.scrollTop;
      overlayRef.current.scrollLeft = el.scrollLeft;
    }
    if (gutterRef.current) gutterRef.current.scrollTop = el.scrollTop;
  }

  // The window listener below outlives renders; it reads the latest list state and
  // onChange through refs.
  const openRef = useRef(open);
  const onChangeRef = useRef(onChange);
  useLayoutEffect(() => {
    // A manual open with nothing to show still counts: Escape dismisses "No suggestions" first.
    openRef.current = open || (listOpen && manualOpen);
    onChangeRef.current = onChange;
  });

  // The editor's own Escape — close the suggestion list, else leave a history recall
  // (restoring the draft) — comes before anything else claims the key (the inspector,
  // the panel): window capture runs ahead of the panel keyboard's document capture.
  // One Escape does one thing.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return undefined;
    const win = el.ownerDocument.defaultView;
    function escape(event: KeyboardEvent): void {
      if (event.key !== 'Escape' || !el) return;
      const root = el.getRootNode() as Document | ShadowRoot;
      if (root.activeElement !== el) return;
      if (hasOpenDialog(root instanceof ShadowRoot ? root : document)) return;
      if (openRef.current) {
        event.preventDefault();
        event.stopImmediatePropagation();
        setListOpen(false);
        setManualOpen(false);
        return;
      }
      if (historyRef.current.active) {
        event.preventDefault();
        event.stopImmediatePropagation();
        const draft = historyRef.current.draft;
        historyRef.current = { active: false, draft: '' };
        onChangeRef.current(draft);
      }
    }
    win?.addEventListener('keydown', escape, true);
    return () => win?.removeEventListener('keydown', escape, true);
  }, []);

  /** Replace [from, to) with text, then put the caret after it. */
  function replaceRange(from: number, to: number, text: string): void {
    const el = inputRef.current;
    const next = value.slice(0, from) + text + value.slice(to);
    const position = from + text.length;
    historyRef.current.active = false;
    flushSync(() => {
      onChange(next);
      setCaret(position);
    });
    if (!el) return;
    el.focus();
    el.setSelectionRange(position, position);
  }

  /**
   * Replace [from, to) through the browser's own editing command, so the change
   * joins the native undo stack (Ctrl/⌘+Z). Falls back to a controlled replace.
   */
  function edit(from: number, to: number, text: string, caretFrom: number, caretTo = caretFrom): void {
    const el = inputRef.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(from, to);
    const done = el.ownerDocument.execCommand(text ? 'insertText' : 'delete', false, text);
    if (!done) {
      replaceRange(from, to, text);
    }
    // The command's input event opened the suggestion list as if typed; a
    // programmatic edit (a pair, Format) must not.
    setListOpen(false);
    setManualOpen(false);
    el.setSelectionRange(caretFrom, caretTo);
    setCaret(caretFrom);
    setHasSelection(caretFrom !== caretTo);
  }

  /**
   * Expanded editor: auto-close pairs, step over closers, delete an empty pair.
   * Deliberately not string/comment-aware (it looks only at the neighbouring
   * characters): a `(` typed inside a string literal is paired too, like most
   * lightweight editors — acceptable, and one Backspace removes the pair.
   */
  function handlePairs(event: React.KeyboardEvent<HTMLTextAreaElement>): boolean {
    const el = event.currentTarget;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const key = event.key;
    const next = value[end];
    if (key === 'Backspace') {
      if (start !== end || start === 0 || PAIRS[value[start - 1]] !== value[start]) return false;
      edit(start - 1, start + 1, '', start - 1);
      return true;
    }
    if (start === end && CLOSERS.has(key) && next === key) {
      el.setSelectionRange(start + 1, start + 1);
      setCaret(start + 1);
      return true;
    }
    const close = PAIRS[key];
    if (!close) return false;
    if (start !== end) {
      // Wrap the selection, keeping it selected inside the pair.
      edit(start, end, key + value.slice(start, end) + close, start + 1, end + 1);
      return true;
    }
    if (next !== undefined && !/[\s)\]};,]/.test(next)) return false;
    // `don't`, `\"`: a quote after a word character or backslash is just a quote.
    if (QUOTES.has(key) && start > 0 && /[\w\\]/.test(value[start - 1])) return false;
    edit(start, start, key + close, start + 1);
    return true;
  }

  function format(): void {
    const formatted = reindent(value);
    if (formatted === value) return;
    edit(0, value.length, formatted, formatted.length);
  }

  function runSelection(): void {
    const el = inputRef.current;
    if (!el || !onRunCode) return;
    const code = value.slice(el.selectionStart, el.selectionEnd);
    if (code.trim()) onRunCode(code);
  }

  // Accepting a suggestion and inserting a chip are native edits, so Ctrl/⌘+Z undoes them.
  // A closing quote (or `"]`) the insert ends with replaces one already after the caret —
  // the expanded editor's auto-paired closer — instead of doubling it. A self-contained
  // literal (`'id'`, `"users"]`) starts with its own quote: only its `]` can stand in.
  function accept(item: Suggestion): void {
    const start = item.from ?? suggestions.from;
    const m = /(["'`])(\]?)$/.exec(item.insert);
    const closers = m ? (item.insert.startsWith(m[1]) ? m[2] : m[0]) : '';
    const after = value.slice(at);
    const over = [closers, ...closers].find((c) => c && after.startsWith(c)) ?? '';
    edit(start, at + over.length, item.insert, start + (item.caret ?? item.insert.length));
  }

  function insertChip(text: string): void {
    const el = inputRef.current;
    const start = Math.min(el?.selectionStart ?? value.length, value.length);
    const end = Math.max(start, Math.min(el?.selectionEnd ?? value.length, value.length));
    if (!el) {
      setListOpen(false);
      replaceRange(start, end, text);
      return;
    }
    edit(start, end, text, start + text.length);
  }

  function recall(direction: 'up' | 'down'): boolean {
    if (direction === 'up') {
      if (!historyRef.current.active) historyRef.current = { active: true, draft: value };
      const previous = navigateConsoleHistory('up');
      if (previous) onChange(previous);
      return true;
    }
    const next = navigateConsoleHistory('down');
    if (next === '') {
      onChange(historyRef.current.draft);
      historyRef.current = { active: false, draft: '' };
    } else if (next != null) {
      onChange(next);
    }
    return true;
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>): void {
    // Never act on keys that are part of an IME composition.
    if (event.nativeEvent.isComposing || event.keyCode === 229) return;
    const el = event.currentTarget;
    const mod = event.ctrlKey || event.metaKey;
    if (event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey && event.code === 'Space') {
      event.preventDefault();
      setActiveIndex(0);
      setCaret(el.selectionStart);
      setManualOpen(true);
      setListOpen(true);
      return;
    }
    if (open && !mod && !event.altKey) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const count = suggestions.items.length;
        setActiveIndex((active + (event.key === 'ArrowDown' ? 1 : count - 1)) % count);
        return;
      }
      if ((event.key === 'Tab' || event.key === 'Enter') && !event.shiftKey) {
        event.preventDefault();
        accept(suggestions.items[active]);
        return;
      }
      // Escape is the window-capture listener's (above), so it never reaches here.
    }
    if (mod && event.key === 'ArrowUp' && onExpandToggle) {
      event.preventDefault();
      setListOpen(false);
      onExpandToggle();
      return;
    }
    if (expanded) {
      // Expanded (P10): Enter is a newline, Ctrl/⌘+Enter runs all, ↑/↓ only move
      // the caret (no history walk inside a code pane). With the suggestion list
      // open, Enter/Tab/↑/↓ were already claimed above: Enter accepts, as collapsed.
      if (event.key === 'Enter') {
        setListOpen(false);
        if (mod && !event.altKey) {
          event.preventDefault();
          if (onRunCode) { if (value.trim()) onRunCode(value); } else onRun();
        }
        return;
      }
      if (!mod && !event.altKey && handlePairs(event)) event.preventDefault();
      return;
    }
    if (event.key === 'Enter' && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      setListOpen(false);
      historyRef.current = { active: false, draft: '' };
      onRun();
      return;
    }
    if (event.key === 'Enter') {
      setListOpen(false);
      return;
    }
    // ↑/↓ walk history only from the first/last line; elsewhere they move the caret.
    if (event.key === 'ArrowUp' && !mod && !event.shiftKey && lineStart(value, el.selectionStart)) {
      event.preventDefault();
      setListOpen(false);
      recall('up');
      return;
    }
    if (event.key === 'ArrowDown' && !mod && !event.shiftKey && historyRef.current.active && lineEnd(value, el.selectionEnd)) {
      event.preventDefault();
      recall('down');
    }
  }

  const chips = [...LEADING_CHIPS, ...variables.filter((name) => !LEADING_CHIPS.includes(name)), ...TRAILING_CHIPS];
  const lineCount = expanded ? value.split('\n').length : 0;
  const modKey = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl';

  return (
    <div className={`xray-editor ${expanded ? 'is-expanded' : ''}`}>
      <div className="xray-prompt-command-row xray-prompt-command">
        <IconChevronRight {...iconProps} />
        {expanded && (
          <div className="xray-editor-tools" role="group" aria-label="Editor tools">
            <button type="button" className="xray-btn xray-console-action" aria-label="Format" title="Re-indent by bracket depth (2 spaces)" onMouseDown={(event) => event.preventDefault()} onClick={format} disabled={!value.trim()}>
              <IconAlignLeft {...iconProps} /><span>Format</span>
            </button>
            {onRunCode && (
              <button type="button" className="xray-btn xray-console-action" aria-label="Run selection" title={hasSelection ? 'Run only the selected text' : 'Select some code to run just that'} onMouseDown={(event) => event.preventDefault()} onClick={runSelection} disabled={running || !hasSelection}>
                <IconCursorText {...iconProps} /><span>Run selection</span>
              </button>
            )}
            {onSaveSnippet && (
              <button type="button" className="xray-btn xray-console-action" aria-label="Save as snippet" title="Save the whole draft as a snippet" onMouseDown={(event) => event.preventDefault()} onClick={() => onSaveSnippet(value)} disabled={!value.trim()}>
                <IconBookmarkPlus {...iconProps} /><span>Save as snippet</span>
              </button>
            )}
            <span className="xray-editor-tools-hint">{modKey}+Enter runs all · {modKey}+↑ collapses</span>
          </div>
        )}
        <div className="xray-editor-field">
          {expanded && (
            <div className="xray-editor-gutter" aria-hidden="true" ref={gutterRef}>
              {Array.from({ length: lineCount }, (_, index) => <span key={index}>{index + 1}</span>)}
            </div>
          )}
          <div className="xray-editor-code">
            <pre className="xray-editor-highlight" aria-hidden="true" ref={overlayRef}>
              {tokens.map((token, index) => (
                <span key={index} className={`xray-tok-${token.kind}`}>{token.text}</span>
              ))}
              {/* Keeps a trailing empty line as tall as the textarea's. */}
              {' '}
            </pre>
            <textarea
              ref={inputRef}
              className="xray-editor-input"
              rows={1}
              value={value}
              wrap={expanded ? 'off' : 'soft'}
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              onChange={(event) => {
                historyRef.current.active = false;
                setCaret(event.currentTarget.selectionStart);
                setActiveIndex(0);
                // Ctrl+Space lasts while identifier characters are typed; anything else ends it.
                const input = event.nativeEvent as InputEvent;
                if (!(input.inputType === 'insertText' && /^[\w$]+$/.test(input.data ?? ''))) setManualOpen(false);
                setListOpen(true);
                onChange(event.currentTarget.value);
              }}
              onSelect={(event) => { setCaret(event.currentTarget.selectionStart); setHasSelection(event.currentTarget.selectionStart !== event.currentTarget.selectionEnd); }}
              onKeyUp={(event) => setHasSelection(event.currentTarget.selectionStart !== event.currentTarget.selectionEnd)}
              onMouseUp={(event) => setHasSelection(event.currentTarget.selectionStart !== event.currentTarget.selectionEnd)}
              onScroll={(event) => syncScroll(event.currentTarget)}
              onBlur={() => { setListOpen(false); setManualOpen(false); }}
              onKeyDown={handleKeyDown}
              placeholder={expanded ? `Write JavaScript · ${modKey}+Enter runs all` : 'Type JavaScript · Shift+Enter for a new line'}
              title={expanded ? `Enter for a new line · ${modKey}+Enter to run all` : 'Enter to run · Shift+Enter for a new line'}
              aria-label="Console command"
              aria-autocomplete="list"
              aria-controls={open ? listId : undefined}
              aria-activedescendant={open ? optionId(active) : undefined}
            />
          </div>
          {open && (
            <ul ref={listRef} className="xray-editor-suggestions" role="listbox" id={listId} aria-label="Suggestions">
              {groupItems(suggestions.items).map((segment, segmentIndex) => {
                const options = segment.entries.map(({ item, index }) => (
                  <li
                    key={`${index}-${item.label}`}
                    id={optionId(index)}
                    role="option"
                    aria-selected={index === active}
                    className={`xray-editor-option ${index === active ? 'active' : ''}`}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => accept(item)}
                  >
                    <span className="xray-editor-option-label">{item.label}</span>
                    <span className="xray-editor-option-detail">{item.detail}</span>
                  </li>
                ));
                if (segment.group === undefined) return options;
                const headerId = `${listId}-group-${segmentIndex}`;
                return (
                  <li key={`group-${segmentIndex}`} role="group" aria-labelledby={headerId} className="xray-editor-group">
                    <div id={headerId} className="xray-editor-group-label" role="presentation">{segment.group}</div>
                    <ul role="none" className="xray-editor-group-options">{options}</ul>
                  </li>
                );
              })}
            </ul>
          )}
          {showEmpty && (
            <div ref={emptyRef} className="xray-editor-suggestions xray-editor-suggestions-empty" role="presentation">No suggestions</div>
          )}
        </div>
        <span className="xray-editor-live xray-visually-hidden" aria-live="polite">
          {listOpen && open ? `${suggestions.items.length} ${suggestions.items.length === 1 ? 'suggestion' : 'suggestions'}` : listOpen && manualOpen ? 'No suggestions' : ''}
        </span>
        <div className="xray-editor-actions">
          {onExpandToggle && (
            <button
              type="button"
              className="xray-btn xray-editor-expand"
              aria-label="Expand editor"
              aria-pressed={expanded}
              title={expanded ? `Collapse to the one-line editor (${modKey}+↑)` : `Expand the editor (${modKey}+↑)`}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => { setListOpen(false); onExpandToggle(); inputRef.current?.focus(); }}
            >
              {expanded ? <IconArrowsMinimize {...iconProps} /> : <IconArrowsMaximize {...iconProps} />}
            </button>
          )}
          {actions}
        </div>
      </div>
      {hint && (
        <div className={`xray-editor-hint ${hint.kind}`}>
          <span className="xray-editor-hint-main">
            {hint.parts ? <>{hint.parts[0]}<strong className="xray-editor-hint-param">{hint.parts[1]}</strong>{hint.parts[2]}</> : hint.text}
          </span> <span className="xray-editor-hint-note">{hint.note}</span>
        </div>
      )}
      {showChips && (
        <div className="xray-editor-chips" role="group" aria-label="Insert into command">
          {chips.map((chip) => (
            <button
              key={chip}
              type="button"
              className="xray-editor-chip"
              title={`Insert ${chip} at the caret`}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => insertChip(chip)}
            >
              {chip}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});
