# JSON Fidelity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every XRAY surface show, search, replay and export exactly what went over the wire, and make no input able to crash the panel or the page or silently lose an entry.

**Architecture:** Captured text becomes the source of truth. One iterative, lossless parser (`src/panel/models/jsonText.ts`: `parseJson`, `JsonNode`, `toValue`, `printJson`) feeds every view, diff, search and export; capture code (`content/interceptor.js`, `content/console-capture.js`, `content/content.js`) keeps bodies as text, encodes awkward values, never throws into the page and degrades instead of dropping; the Console exchanges tagged JSON strings with the page.

**Tech Stack:** MV3 content scripts (plain JS), React 19 + Zustand panel, Vite → `dist/`, Node test runner (`test/*.test.js`, `test/unit/*.test.mjs` via `test/unit/harness.mjs`; interceptor VM harness in `test/capture-interceptor.test.js`), Playwright E2E (`test/e2e`, document + closed shadow).

**Spec:** `docs/superpowers/specs/2026-10-14-json-fidelity-design.md` (J1–J16, §9). Evidence and file:line for every defect: `docs/superpowers/specs/assets/2026-10-14-json-audit.md` (#1–#29); audit scripts to reuse: `output/json-audit/*.mjs.txt`, fixtures `output/json-audit/fixtures.mjs.txt`.

## Global Constraints

- Captured text is the source of truth; no `JSON.parse` on captured bodies in `src/panel` outside `jsonText.ts` (a source-scan test enforces it from Task 2 on, allowlist documented).
- Capture code never throws into the host page and never drops an entry silently (degrade + flag, or counted drop visible in diagnostics).
- Capture caps unchanged (response 250,000 chars, request 50,000, frames 2,000 chars × 200) but truncation is metadata, never an in-band suffix in stored text.
- Backward compatible persisted sessions: old entries (with in-band suffixes, parsed request bodies only) still load and display; new fields are additive.
- No new dependencies. Theme tokens only for any UI (banners, notices, tags). Document, closed-shadow HUD, pop-out window, DevTools surfaces.
- Never commit, stash, reset or checkout. Lint 0 errors ≤ 53 warnings (`npx eslint .`). After `src/` changes: `npm run build` + `node scripts/check-dist-sync.mjs`. Scratch scripts under `output/` with `.txt` suffix when done.

## Review Focus

- **Old persisted sessions** (stored before this change: in-band "... truncated" suffix, parsed-only request bodies, `__xray_ref__` markers in logs): load without errors, show sensibly (suffix detected → truncation banner), no crash. → Task 8 test `legacy session restore`.
- **Performance on big bodies** (250 KB response, 5 MB NDJSON attempt, 50,000-item array): selecting the request keeps the UI responsive (no long task > 200 ms on the main thread in the E2E trace or a measured parse budget). → Task 2 unit timing + Task 5 E2E `big body stays responsive`.
- **Malicious-looking bodies** (`__proto__` keys, bidi overrides, `<img onerror>`, huge single string): no pollution, no XSS, bidi visibly escaped. → Tasks 2, 5 tests.
- **Mixed failures in one capture batch** (a FormData POST + a normal fetch + console.log(Symbol()) within 16 ms): every entry arrives (degraded where needed), page sees no error. → Task 3 + Task 4 tests.
- **Console exactness both ways** (`res.id` where id = 9007199254740993 → `9007199254740993n`; a result object with numeric keys keeps page order; repeated non-circular references aren't "[Circular]"). → Task 7 E2E.

---

### Task 1: Crash safety (J12; J7 never-throw part)
**Files:** `src/panel/components/detail/JsonView.tsx` (Object.is value-change), new `src/panel/components/common/ErrorBoundary.tsx` wrapping detail panes (`RequestDetail.tsx`, `LogDetail.tsx`) and Console results (`ResultView.tsx`), `content/console-capture.js` (per-entry try/catch in `_flushBatch`; top-level function/Symbol/invalid Date through the preview encoder; `toISOString` guarded). Tests: VM test for console-capture (no throw, siblings survive); E2E `NaN log click keeps panel mounted`; unit/E2E boundary shows "This value couldn't be displayed" with Copy raw.
- [ ] RED (capture output) → implement → GREEN → gate (`npm run typecheck && npx eslint . && npm test && npm run build && node scripts/check-dist-sync.mjs` + touched E2E files).

### Task 2: Lossless parser (J1)
**Files:** create `src/panel/models/jsonText.ts`; create `test/unit/jsonText.test.mjs`; create the source-scan test `test/unit/noRawJsonParse.test.mjs` (allowlist = current call sites, to be emptied by Tasks 5–9; each later task removes its entries).
**Interfaces (produced):** `parseJson(text: string, opts?: { contentType?: string }): JsonDoc`; `type JsonNode` (spec §1); `toValue(node, { bigint?: boolean }): unknown`; `printJson(node, { indent?: number }): string`; `isExact(node)`; `LosslessNumber`.
- [ ] RED: the full audit fixture battery (spec §9 list) incl. round-trip `printJson(parseJson(t).root) === t` for compact canonical inputs and token-equivalence for pretty inputs; 100,000-deep nesting parses; 5 MB parses within a stated budget (measure and assert a generous bound); errors carry line/col.
- [ ] Implement → GREEN → gate.

### Task 3: Capture fidelity (J4, J5, J6, J16)
**Files:** `content/interceptor.js`, `content/content.js` (`_validateEntry` carries `requestBodyText`, truncation metadata, `captureDegraded`, `objectRefs`), `test/capture-interceptor.test.js`.
- [ ] RED: request text verbatim for `"hello"`, double-encoded, `null`, `false`, pretty, key order; URLSearchParams/FormData/Blob/ArrayBuffer/Uint8Array captured (no drop); DataCloneError → degraded entry, else counted `clone-failed`; XHR `responseType` json/arraybuffer/blob; `responseTruncated` metadata without in-band suffix; frames byte size + truncation flag; mixed-failure batch all arrive.
- [ ] Implement → GREEN → gate.

### Task 4: Logs model (J7)
**Files:** `content/console-capture.js` (typed encoding: bigint, NaN, ±Infinity, -0, undefined, Map/Set entries, Error cause; reserved marker shape), `content/content.js` (decode/strip markers; objectRefs), `src/panel/store.ts` (console message building: single array vs multi-arg distinct; null/undefined text), `src/panel/components/detail/LogDetail.tsx`, `EntriesWorkspace.tsx` log row preview. Tests: VM + unit + E2E (Load full object returns the object; markers absent from UI and Session JSON; `console.log([1,2,3])` vs `console.log(1,2,3)` not merged; a user object containing `__type__:'Error'` renders as a plain object).
- [ ] RED → implement → GREEN → gate.

### Task 5: Raw and Tree views (J2, J3 tree, J13)
**Files:** `src/panel/components/detail/RequestDetail.tsx` (Raw = captured text, Pretty toggle via `printJson`, error marker, Copy semantics, truncation banner), `src/panel/components/detail/JsonView.tsx` (render from `JsonNode`; virtualized at every size; progressive Expand all; duplicate tag; inexact-number hint; bidi escapes), `src/panel/utils.ts` (`entryResponse`/`entryRequest` via `parseJson`), `src/panel/styles.css` (tags/banners with tokens). Tests: E2E Raw exact for key-order/dup/float fixtures; Tree shows `9007199254740993`; 2,000-deep Expand all responsive; `big body stays responsive`; bidi visible escape; truncation banner. Remove this task's entries from the scan allowlist.
- [ ] RED → implement → GREEN → gate (+ `npm run test:e2e` once).

### Task 6: Table, Schema, Visualize, Diff, Search, worker parity (J3 rest, J11, J14, J15)
**Files:** `src/panel/models/detail.ts`, `comparison.ts`, `viz.ts`, `globalSearch.ts`, `sessionIndex.ts`, schema helper path, `workers/xray-worker.js` (drop its own table/schema/diff or delegate), `shared/console-helpers.js` schema for scalars. Tests: table notice; schema for 42/true/null/"hi"; diff …992 ≠ …993 and depth notice; search finds original lexemes and pretty spacing; DevTools/pop-out parity (same table for `{"errors":[],"data":[…]}`). Remove allowlist entries.
- [ ] RED → implement → GREEN → gate.

### Task 7: Console fidelity (J8)
**Files:** `panel/console.js` (`_contextPayload` → tagged string), `background.js` (context parsed via `JSON.parse(<string>)` + reviver; result serializer → tagged ordered string with ancestor-stack circular detection; caps stated), `shared/console-helpers.js` (reviver; null-prototype accumulators; `__proto__` safe), `src/panel/models/consoleResults.ts` + `ResultView.tsx` (revive tags; render marker out-of-band). Tests: VM/unit for serializer/reviver; E2E `res.id` → `9007199254740993n`; key order kept; NaN/Infinity/-0/undefined/Map/Set shown; repeated reference not "[Circular]"; `__proto__` key plain; groupBy with "constructor".
- [ ] RED → implement → GREEN → gate.

### Task 8: Persistence (J9)
**Files:** `src/panel/models/sessionStore.ts`, `src/panel/store.ts` (persist/restore text + metadata; storage-failure notice), relevant UI notice component. Tests: unit restore re-parses text (Tree works after reload); typed arrays never persisted; `legacy session restore`; storage failure shows the notice once per streak (E2E with a failing XRAY_Store.set).
- [ ] RED → implement → GREEN → gate. Remove allowlist entries.

### Task 9: Replay and exports (J10)
**Files:** `src/panel/store.ts` (`replayEntry` body = `requestBodyText`), `content/interceptor.js` replay path (send text unchanged), `src/panel/components/replay/ReplayModal.tsx` (raw text editor, no suffix), `src/panel/models/export.ts` (HAR text/postData raw; Selected JSON/Mock/Jest/MSW via `printJson`; share-safe redaction over `JsonNode`), `shared/console-helpers.js` cURL/fetch from raw text incl. `false`/`null`. Tests: server-observed replay equals original bytes for the request fixtures; HAR re-import round-trip exact; exports keep `9007199254740993`; share-safe still redacts (existing tests green). Empty the scan allowlist (or document any intentional remainder).
- [ ] RED → implement → GREEN → gate (+ `npm run test:e2e` once).

### Task 10: Integration and acceptance
**Files:** only on failure; `docs/ui-audit.md` (one line referencing the spec).
- [ ] Full gate: `npm run check && npm run test:e2e && npm run test:coverage` (lines ≥ 98.5 %, branches ≥ 89 %); `git diff --check`; dist synced.
- [ ] Acceptance: adapt and re-run the audit scripts (`output/json-audit/run-*.mjs.txt`) against the built extension; produce a before/after table for findings #1–#29 (PASS/FAIL with observed values); every CRITICAL/HIGH must PASS; save evidence under `output/json-fidelity/`.
