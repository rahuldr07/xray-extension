# JSON fidelity — design

Requested 2026-10-14 ("are you parsing the JSON perfectly? see in the API tabs, also across the
app"). Evidence: end-to-end audit with a fixture battery in the real extension —
`docs/superpowers/specs/assets/2026-10-14-json-audit.md` (findings #1–#29 with file:line, RAN/TRACED;
artifacts in `output/json-audit/`). Decided under the user's standing delegation. This spec is the
authority for the implementation plan.

## Purpose

What XRAY shows, searches, replays and exports must be what went over the wire. Today the captured
response text is exact, but almost every surface re-derives it from `JSON.parse()` output (big
integers rounded, keys reordered, duplicates collapsed, lexemes changed), request bodies are
parsed and their text discarded, some bodies are silently not captured, and two inputs crash the
panel or the page. Success: every fixture in the audit battery round-trips exactly on every surface
that claims to show or send the original, values that JavaScript cannot represent are shown as
written and flagged, and no input can crash the panel, the page, or silently lose an entry.

## Principles

- **Captured text is the source of truth.** Response and request bodies keep their text verbatim
  (up to the capture cap); parsed structures are derived views.
- **One parser.** A single lossless JSON parser in the panel (`src/panel/models/jsonText.ts`) feeds
  every view, search, diff and export. Plain `JSON.parse` is not used on captured bodies anywhere
  in `src/panel` (a source-scan test enforces this, with a documented allowlist).
- **Never throw into the host page; never drop silently.** Capture code catches per item, and a
  failure produces either a degraded entry with a flag or a counted drop visible in diagnostics.

## 1. Lossless parser (J1)

`parseJson(text, { contentType? }) → JsonDoc`:
- `ok`, `root: JsonNode`, `error?: { pos, line, col, message }` (first syntax error), `prefix?`
  (stripped XSSI guard: `)]}'`, `)]}',`, `while(1);`, `for(;;);`), `kind: 'json' | 'ndjson'`,
  `duplicates: number`, `inexactNumbers: number`.
- `JsonNode` = `{t:'obj', entries: {key, value, dup?}[]}` (source order, duplicates kept and marked)
  | `{t:'arr', items}` | `{t:'str', value}` | `{t:'num', raw, value, exact}` (`exact` false when
  `Number(raw)` does not round-trip to the same lexeme meaningfully: unsafe integers, overflow to
  ±Infinity, underflow to 0 of a non-zero lexeme, `-0`) | `{t:'bool'}` | `{t:'null'}`.
- Iterative (explicit stack): any nesting depth without stack overflow; 5 MB parses without
  blocking the UI for more than one frame budget per chunk (parse off the render path; show
  "Parsing…" for large bodies).
- NDJSON: content-type `application/x-ndjson`, `application/jsonl`, `application/json-seq`, or
  multiple newline-separated top-level values → `kind:'ndjson'`, root = array of documents.
- Any top-level value parses (scalars included); non-JSON content types are attempted only when
  the text looks like JSON (current heuristic extended to scalars) and shown as text on failure.
- `toValue(node, { bigint })` → plain JS (unsafe integers → `BigInt` when `bigint`, else the
  `LosslessNumber` wrapper `{ raw }` with `valueOf`); objects built with `Object.defineProperty`
  so `__proto__`/`constructor` are plain keys. `printJson(node, { indent })` → text preserving
  every lexeme and key order (pretty or compact).

## 2. Views (J2, J3, J12–J15)

- **Raw** shows the captured text verbatim (virtualized; no 80,000 cut below the capture cap); a
  "Pretty" toggle shows `printJson(root, {indent:2})`; invalid JSON shows the error line/column with
  a marker. Copy copies the captured text (or the pretty text when Pretty is on).
- **Tree** renders from `JsonNode`: source order, duplicate keys shown with a "duplicate" tag,
  numbers shown by lexeme with an "inexact in JS" hint when `exact` is false. Virtualized at every
  size (the inspector's flattened rows); "Expand all" expands progressively and can never mount an
  unbounded tree (2,000-deep and 5 MB fixtures stay responsive).
- **Table / Schema / Visualize / Diff** use the same node model: table notice "Showing R of N rows
  · C of K columns" whenever capped; schema types from nodes (42 → number, true → boolean, null →
  null, "hi" → string); diff compares lexemes (…992 ≠ …993) and shows a notice when a depth or size
  limit stops it — never "no differences" silently.
- **Search** indexes the captured text (and the compact printed form), so original lexemes, escapes
  as written and pretty-printed spacing are all findable; the existing per-field limit stays and is
  stated.
- **Crash safety (J12)**: `JsonView` value-change detection uses `Object.is` (NaN no longer loops);
  an error boundary wraps the detail panes, Logs detail and Console results showing "This value
  couldn't be displayed" with Copy raw, so one bad value never unmounts the panel.
- **Display safety (J13)**: bidi control characters (U+202A–U+202E, U+2066–U+2069, U+200E/F) render
  as visible escapes (`‮`) in Tree/Table/Raw/Search results.

## 3. Capture (J4–J6, J16)

- **Request text (J4)**: the interceptor stores `requestBodyText` verbatim (cap as today) for
  string bodies; `URLSearchParams` → its string; `FormData` → `[name, value | {file, size, type}]`
  plus a text rendering; `Blob`/`ArrayBuffer`/typed arrays → decoded UTF-8 text when valid, else
  `{binary:true, size, base64Prefix}`. `null`, `false`, `""` bodies are distinct from "no body".
  The parsed `requestBody` stays derived (panel-side from the text).
- **Never lose an entry (J5)**: `_post` catches DataCloneError, re-posts a sanitized entry (bodies
  replaced by text/descriptors) with `captureDegraded: true`; if that fails too, a drop counter
  (`clone-failed`) increments and shows in diagnostics. XHR `responseType` `json` (re-serialized,
  flagged `bodyReserialized`), `arraybuffer`/`blob` (decoded text when UTF-8 JSON/text) are captured.
- **Truncation is metadata (J6)**: no in-band "… truncated N chars" suffix in stored text;
  `responseTruncated: { totalChars, keptChars }` (same for request text and frames). Views show a
  banner "Response truncated: showing the first 250,000 of 938,891 characters"; Tree/Table are
  unavailable for a truncated JSON body (Raw shows the prefix) — never a fake "string" schema.
- **Frames (J16)**: frame size in bytes; truncated frames flagged; share-safe frames printed with
  the lossless printer.

## 4. Logs (J7)

- `console-capture.js` never throws into the page: per-entry try/catch in flush; top-level values
  go through the typed preview encoding (function → `{__type__:'function', name}`, Symbol →
  description, invalid Date → "Invalid Date", BigInt → `{__type__:'bigint', value:'10'}`, NaN /
  ±Infinity / -0 / undefined tagged, Map/Set entries (first N), Error with `cause`).
- Markers (`__xray_ref__`, `__type__`) are stripped/decoded at the `content.js` boundary into a
  typed model; they never appear in the UI or exports; a user object that happens to contain
  `__type__` is not misread (encoding uses a reserved, unforgeable shape).
- `objectRefs` are carried through `_validateEntry` so "Load full object" works.
- `console.log([1,2,3])` (one array argument) and `console.log(1,2,3)` stay distinct and are never
  merged as repeats; `null`/`undefined` messages render as `null`/`undefined`.

## 5. Console (J8)

- The command context (`res`, `req`, pins, vars) is sent as a tagged JSON string and revived in the
  page by a tiny reviver in `shared/console-helpers.js`: unsafe integers become `BigInt`, other
  tags restore NaN/±Infinity/-0/undefined; `__proto__` keys are plain properties.
- Results are serialized in the page into a tagged, order-preserving string (circular detection by
  ancestor stack, so repeated non-circular references are not "[Circular]"; Map/Set/NaN/±Infinity/
  -0/undefined/BigInt/lone surrogates preserved; existing caps kept but stated: "showing 1,000 of
  5,000 items") and revived in the panel; `returnByValue` no longer reorders keys.
- The table-render marker is not a user-visible string key (Symbol or out-of-band flag).
- `groupBy`/`countBy` and other helpers use null-prototype accumulators.

## 6. Persistence (J9)

- Persist captured text (+ truncation metadata) and the typed log model; never persist typed
  arrays or non-JSON-safe values; on restore the panel re-parses text, so Tree/Table work after a
  reload. Entries exceeding the persistence cap are restored with a truncation banner, never as a
  "string".
- A storage write failure shows a visible, non-blocking notice ("Couldn't save the session — 
  <reason>") once per failure streak, not only a diagnostics tooltip.

## 7. Replay and exports (J10)

- Replay and Edit & Replay send `requestBodyText` unchanged unless the user edits it; Edit &
  Replay's editor holds the raw text (no "… truncated" suffix).
- cURL / fetch / Axios / Playwright use the raw request text (and send `false`/`null` bodies
  correctly); HAR `content.text` = captured response text, `postData.text` = captured request
  text, `mimeType` from headers; Selected JSON and Mock embed bodies via `printJson` (exact
  lexemes, original order); share-safe redaction walks `JsonNode` and prints losslessly.

## 8. One implementation (J11)

DevTools and the pop-out use the same panel-side models for table/schema/diff as the docked panel;
`workers/xray-worker.js` no longer has its own versions of these (it may keep search indexing if it
uses the same text-based index).

## 9. Testing

- `test/unit/jsonText.test.mjs`: the audit's full fixture battery (big ints, floats incl. 1e400,
  -0, 1.0, 1E5, 5e-324; key order; duplicates; `__proto__`/`constructor`; unicode/lone surrogates;
  long strings; empty values; top-level scalars; 2,000- and 100,000-deep nesting; 5 MB; XSSI;
  NDJSON; BOM; invalid JSON with positions; double-encoded strings) — parse, `printJson` round-trip
  equals input (compact and pretty token-equivalent), `toValue` exactness.
- A source-scan test: no `JSON.parse` on captured bodies in `src/panel` outside `jsonText.ts`
  (allowlist documented).
- Capture tests (`test/capture-interceptor.test.js` harness): FormData/URLSearchParams/Blob/typed
  arrays captured; DataCloneError path degrades instead of dropping; XHR json responseType;
  truncation metadata; request text verbatim for `"hello"`, double-encoded, `null`, `false`.
- Console-capture tests (VM): function/Symbol/invalid Date/BigInt/-0/NaN/Map/Set/Error cause never
  throw and never drop siblings in the batch.
- E2E (document + closed shadow): NaN log click keeps the panel mounted; 2,000-deep Expand all stays
  responsive; Raw shows the exact text; Tree shows `9007199254740993`; Diff detects …992 vs …993;
  table notice; truncation banner; storage-failure notice.
- Acceptance: re-run the audit scripts (`output/json-audit/*.mjs.txt`, adapted) against the built
  extension; every HIGH/CRITICAL finding passes; report the before/after table.

## Out of scope

IndexedDB storage for unlimited bodies (the capture cap stays 250,000 chars); editing JSON in
place; non-JSON body formats beyond text/binary descriptors (XML/protobuf viewers).
