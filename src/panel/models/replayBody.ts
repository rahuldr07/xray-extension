/**
 * What Replay sends for a captured request (docs/superpowers/specs/2026-10-14-json-fidelity-design.md
 * §7, J10): the request text exactly as captured (requestBodyText) — never a re-serialization of its
 * parsed copy, which JSON.parse rounded and a saved session key-sorted — or, for FormData whose fields
 * are all text, those fields to rebuild the form from in the page (names, values and order; the
 * browser picks a new multipart boundary). A body that cannot be sent as it was captured says why, so
 * Replay refuses it and Edit & Replay warns: text cut at capture, FormData with file fields (the files
 * were never captured) or saved without its fields, bytes that are not text, and a body the capture
 * could not read.
 */
import type { XrayEntry } from '../types';
import { requestBody, type CapturedBody } from './capturedBody';
import { isSensitiveName } from './experiments';
import { fromValue, parseJson, printJson, toValue } from './jsonText';

/**
 * Replay rebuilds a FormData of at most this many fields, and of at most this many characters of names
 * and values; content/interceptor.js holds the same bounds. A form captured whole always fits the
 * characters: its fields share the 50,000-character capture budget.
 */
export const REPLAY_FORM_MAX_FIELDS = 1_000;
export const REPLAY_FORM_MAX_CHARS = 50_000;

export type ReplayFormPair = [string, string];

export interface ReplayBody {
  /** The body to send; null for no body. A captured "" is a body (J4). For a form, its text rendering. */
  text: string | null;
  /** FormData of text fields: what the page rebuilds the form from, [name, value] in order. */
  form?: ReplayFormPair[];
  /** False when the request cannot be sent as captured: cut at capture, files, binary, unread. */
  exact: boolean;
  /** Why the body cannot be replayed exactly — one line, no captured data — else null. */
  reason: string | null;
  /**
   * Set when not exact: whether Edit & Replay may invite an edited text in its place. Never for a form,
   * whose text rendering is not a body anyone sent.
   */
  editHint?: boolean;
}

const count = (value: number): string => value.toLocaleString('en-US');

function refused(text: string | null, reason: string, editHint: boolean): ReplayBody {
  return { text, exact: false, reason, editHint };
}

function cutReason(body: CapturedBody): string {
  const cut = body.truncation;
  const total = typeof cut?.totalChars === 'number' ? ` of ${count(cut.totalChars)} characters`
    : typeof cut?.totalBytes === 'number' ? ` characters of ${count(cut.totalBytes)} bytes` : ' characters';
  return `The request body was cut at capture (${count(body.text.length)}${total} kept); replaying it would send only that part.`;
}

export function replayBody(entry: XrayEntry): ReplayBody {
  const body = requestBody(entry);
  if (body.kind === 'none') {
    // Capture records requestBodyKind for every body it reads ('none' included); a degraded entry
    // without one is a body whose read failed — not an empty request.
    if (entry.captureDegraded === true && entry.requestBodyKind === undefined) {
      return refused(null, 'The request body could not be read at capture, so it cannot be replayed exactly.', true);
    }
    return { text: null, exact: true, reason: null };
  }
  if (body.kind === 'binary') {
    return refused(null, 'The request body was bytes that are not text; they were not captured, so they cannot be replayed.', true);
  }
  // A request saved before J4 kept only its parsed value: its JSON is the best text there is.
  if (body.kind === 'value') return { text: printJson(fromValue(body.value)), exact: true, reason: null };
  if (entry.requestBodyKind === 'formdata') return formBody(body);
  if (body.truncation) return refused(body.text, cutReason(body), true);
  return { text: body.text, exact: true, reason: null };
}

/** A captured FormData: its text fields to rebuild, or why it cannot be (fix round 1 ruling). */
function formBody(body: CapturedBody): ReplayBody {
  if (body.truncation) return refused(body.text, cutReason(body), false);
  // A saved session keeps a form's text rendering without its fields when they did not fit (J9).
  if (body.format !== 'formdata' || !body.pairs) {
    return refused(body.text, 'The request sent FormData whose fields were not kept with the saved session, so it cannot be replayed.', false);
  }
  const problem = formProblem(body.pairs);
  return problem ? refused(body.text, problem, false) : { text: body.text, form: textPairs(body.pairs), exact: true, reason: null };
}

/** Why these fields cannot be rebuilt as a form, or null. */
function formProblem(pairs: readonly unknown[]): string | null {
  let chars = 0;
  for (const pair of pairs) {
    const value = Array.isArray(pair) ? pair[1] : undefined;
    if (value && typeof value === 'object' && 'file' in value) {
      return 'The request sent FormData with file fields; the files were not captured, so it cannot be replayed.';
    }
    if (!Array.isArray(pair) || pair.length !== 2 || typeof pair[0] !== 'string' || typeof value !== 'string') {
      return 'The request sent FormData with fields that are not text, so it cannot be replayed exactly.';
    }
    chars += pair[0].length + value.length;
  }
  if (pairs.length > REPLAY_FORM_MAX_FIELDS) return `The request sent FormData with more than ${count(REPLAY_FORM_MAX_FIELDS)} fields, more than replay sends.`;
  if (chars > REPLAY_FORM_MAX_CHARS) return `The request sent FormData with more than ${count(REPLAY_FORM_MAX_CHARS)} characters of fields, more than replay sends.`;
  return null;
}

function textPairs(pairs: readonly unknown[]): ReplayFormPair[] {
  return pairs.map((pair) => [(pair as string[])[0], (pair as string[])[1]]);
}

/**
 * Fields an experiment sends as a form (its sanitized plan body for a FormData baseline): text pairs
 * within the replay bounds, copied; null when they cannot be rebuilt as a form.
 */
export function replayFormPairs(value: unknown): ReplayFormPair[] | null {
  return Array.isArray(value) && !formProblem(value) ? textPairs(value) : null;
}

/**
 * A request text as the value an experiment's sanitized plan holds (spec J10): an object or array as its
 * lossless parse (an integer past 2^53 stays exact), anything else — a JSON scalar such as "hello",
 * null or false, or text that is not JSON — as the text itself, so the plan printed back
 * (experiments.ts planBodyText) is that text again.
 */
export function planValueOfText(text: string): unknown {
  const doc = parseJson(text);
  return doc.ok && doc.kind === 'json' && (doc.root.t === 'obj' || doc.root.t === 'arr') ? toValue(doc.root) : text;
}

/**
 * The captured request body as the value an experiment or a scenario step plans from: its text through
 * planValueOfText (a cut text stays text); FormData fields — a text field under a sensitive name
 * redacted, as an object key would be — a binary descriptor or a value saved before J4 as captured;
 * null for no body — undefined when the entry has no body field at all.
 */
export function capturedPlanValue(entry: XrayEntry): unknown {
  const body = requestBody(entry);
  if (body.kind === 'none') return entry.requestBody === undefined && entry.requestBodyKind === undefined ? undefined : null;
  if (body.kind === 'value') return body.value;
  if (body.kind === 'binary') return body.binary ?? null;
  if (body.format === 'formdata') {
    return body.pairs ? body.pairs.map((pair) => (Array.isArray(pair) && typeof pair[0] === 'string' && typeof pair[1] === 'string'
      && isSensitiveName(pair[0]) ? [pair[0], '[REDACTED]'] : pair)) : body.text;
  }
  if (body.format === 'urlencoded' || body.truncation) return body.text;
  return planValueOfText(body.text);
}
