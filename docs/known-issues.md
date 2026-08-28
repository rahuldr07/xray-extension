# Known issues

Logic bugs confirmed by executing the code, not by reading it. Each one has a passing
test in `test/unit/` that **documents current behaviour** — so fixing the bug will fail
its test, and that test must be updated in the same change.

None of these are fixed. They were found while building the unit suite and are recorded
here rather than changed, because altering product behaviour was out of scope for that
work. Ordered roughly by user impact.

Security findings live separately in [threat-model.md](threat-model.md).

---

## Wrong results shown to the user

### 1. The Diff view reports "no changes" for arrays that differ

`src/panel/models/detail.ts:106-111`

`structuralDiff` caps array comparison at index 50, but only emits the `[…]` truncation
notice when the two arrays have **different lengths**. Two 60-element arrays differing
only at index 55 therefore produce an empty diff — the UI says identical for demonstrably
different data. Change one array's length and the summary line appears.

*Fix:* drop the length condition so the truncation notice always fires when
`length > 50`.

### 2. Insights disagrees with the request list about what is slow

`src/panel/models/insights.ts:44`

`duration(entry) > 500` is hardcoded. Everywhere else (`entries.ts:146`, `:235`, `:259`)
uses the configurable `slowThresholdMs` with `>=`. Two consequences: at exactly 500 ms the
list badges a request slow and Insights does not, and Insights ignores the setting
entirely — with a 200 ms threshold configured, two 250 ms requests are 2 slow in the list
and 0 in Insights.

### 3. Insights reports false N+1 on any GraphQL app

`src/panel/models/insights.ts:24-29`

`repeatedEndpoints` groups by `entryPath`, not `entryGroupPath`. Every GraphQL operation
collapses into a single `POST /graphql` bucket, so three distinct operations are counted
as three calls to one endpoint and flagged as an N+1 candidate. `buildEndpointGroups`
handles this correctly and shows three separate groups.

### 4. Charts silently drop categories and claim they did not

`src/panel/models/viz.ts:88-96` and `:114-117`

Both category paths `.slice(0, MAX_BARS)` and then hardcode `truncated: 0`. 55 categories
render as 40 bars with no "15 more" indicator. The numeric paths compute `truncated`
correctly, so the inconsistency is within one module.

### 5. Global search claims truncation when nothing was cut

`src/panel/models/globalSearch.ts:107`

`truncated: matches.length >= MAX_MATCHES`. Exactly 200 matches returns all 200 and still
reports truncation. 199 reports honestly.

---

## Features that silently do less than intended

### 6. Response action buttons lose their best behaviour when several conditions apply

`src/panel/models/operations.ts:55-57`

`pushUnique` keeps the **first** priority pushed and discards later ones. Because branch
order is effectively load-bearing, a request that is both slow *and* drifted gets
`compare-previous` at priority 78 with `kind: 'console'` (from the slow branch) instead of
87 with `kind: 'view'`, `view: 'diff'` — so the button cannot open the diff view. A *fast*
drifted request gets the correct 87/view/diff. `schema` is likewise pinned at 75 rather
than the drift branch's 86.

*Fix:* take the maximum priority on collision, or document the branch ordering as
intentional.

### 7. Partial settings updates silently switch booleans off

`src/panel/models/panelSettings.ts:83`

`normalizePanelSettings` spreads `{...DEFAULTS, ...input}`, so an explicit
`key: undefined` shadows the default, and `Boolean(undefined)` is `false`. Every boolean
defaulting to `true` — `captureFetch`, `captureXhr`, `showHostInPath`, `glow`,
`confirmDestructiveActions` — turns **off** on a partial in-memory update. `captureWs` is
the only one guarded against this.

JSON-persisted preferences never hit it, because `JSON.stringify` drops `undefined`. It
only bites in-memory callers.

### 8. Stored numeric settings fall back to the wrong value

`src/panel/models/panelSettings.ts`

`null` and `[]` coerce to `0`, which is finite, so `clampNumber` never reaches its
fallback and clamps instead. A stored `maxEntries: null` becomes **50** — the floor — not
the 1000 default.

### 9. Three-digit hex overrides are silently dropped

`src/panel/models/customTheme.ts:63`

Override colors are gated on `isHex`, which accepts 6 digits only, while base colors go
through `clampHex`, which expands `#abc`. `parseThemeInput`'s own picker accepts
`#[0-9a-f]{3,6}`. So a 3-digit override copied out of an exported CSS block is discarded
while a 3-digit base color in the same block survives.

---

## Data integrity

### 10. HAR import produces negative durations

`src/panel/models/import.ts:46`

`Math.round(Number(harEntry.time) || Number(timings?.wait) || 0)`. The HAR spec uses
`time: -1` for "unknown", and `-1` is truthy, so the `timings.wait` fallback is skipped and
`duration: -1` is imported. (`time: 0` correctly falls back.) The list UI clamps to 0, but
a HAR re-export writes `-1` straight back out.

### 11. Shared objects are reported as circular

`src/panel/utils.ts` — `safeStringify`

The `seen` WeakSet is added to unconditionally rather than tracked per-branch, so a
non-cyclic object referenced twice as a sibling is serialized as `[Circular]`:
`{first: shared, second: shared}` becomes `{"first":{"a":1},"second":"[Circular]"}`.

### 12. Out-of-range theme seeds all produce the same "random" theme

`src/panel/models/customTheme.ts:142`

`RANDOM_ACCENTS[Math.floor(seed * len) % len]` yields a negative index for a negative
seed, so the lookup is `undefined` and `clampHex` substitutes the default accent. Every
out-of-range seed returns an identical theme. `NaN` behaves the same.

Latent: both call sites pass `Math.random()`, so it cannot fire today.

---

---

## Capture runtime and worker

Found the same way, by executing the code. Tests in `test/unit/runtime/`.

### 13. A cyclic payload hangs the worker forever and exhausts its heap

`workers/xray-worker.js:159` — `safeClone`

No cycle detection. Because the recursion is `async`, every level is a microtask, so the
stack never grows and **nothing ever throws**. The promise neither resolves nor rejects,
so the `try/catch` in `self.onmessage` never runs and **no reply is ever posted** — the
panel's pending request for that message id hangs for the life of the worker, while the
clone tree grows until the heap is exhausted and the worker is torn down, taking every
other in-flight request and the in-memory entry cache with it.

Measured out-of-process: ~4 GB in 40 s before `FATAL ERROR: Reached heap limit`. The test
verifies this via `execFileSync` with a short race, precisely because reproducing it
in-process would OOM the test runner.

Reachable: `postMessage`'s structured-clone transport carries cycles fine.

`computeStats` (`:192`) has a depth cap and terminates on the same input, so the fix
pattern already exists in the file.

### 14. `computeDiff` overflows the stack on a cyclic input

`workers/xray-worker.js:234`

Synchronous recursion, no depth cap, no visited set → `RangeError`. **Contained** — the
`try/catch` in `self.onmessage` catches it and posts `{success: false}`, so the worker
survives. There is also an asymmetric case that does *not* throw: a cycle on one side only
emits the raw cyclic node as a diff `value`, which then throws in any consumer that
`JSON.stringify`s the result.

### 15. One bad timestamp discards an entire export

`workers/xray-worker.js:367` and `:387`

`new Date(entry.timestamp).toISOString()` is unguarded and throws `RangeError` on Invalid
Date, while every other column has an `|| ''` fallback. A single entry with a missing or
string timestamp — an imported HAR, an unstamped entry — fails the **whole** CSV and HAR
export, discarding the good entries with it. `exportToCSV([{type: 'api'}])` throws today.

### 16. CSV exports do not guard formula injection

`workers/xray-worker.js:351` and `shared/console-helpers.js:45`

Neither escaper prefixes `=`, `+`, `-` or `@`. RFC4180 quoting does not help, because the
spreadsheet strips the quotes before evaluating. Captured response data lands in a cell
that Excel or Sheets will execute.

### 17. The two CSV escapers disagree on non-strings

`workers/xray-worker.js:351` vs `shared/console-helpers.js:45`

The worker uses `String(value)`, so `{o: 1}` becomes `[object Object]` and `[1,2]` becomes
`1,2` — which reads as extra columns. The helper uses `JSON.stringify` and preserves the
value. Quoting policy also differs (unconditional vs only on `[",\n\r]`); both are
RFC4180-valid, but the same data produces two different files depending on the path.

### 18. `toCSV` escapes every cell but not the header row

`shared/console-helpers.js:48`

`keys.join(',')`. A response key containing a comma or quote yields a CSV whose header
column count does not match its rows. The worker escapes its headers, but only ever sees a
fixed literal list, which hid the divergence.

### 19. `toCSV` derives its columns from row 0 only

`shared/console-helpers.js:47`

Captured payloads are routinely heterogeneous, and any key absent from the first row is
silently dropped. `toCSV([{}, {a: 1}])` erases the entire table.

### 20. `analyzeEntries` divides by the wrong count

`workers/xray-worker.js:462`

`totalDuration` accumulates only truthy durations, but the divisor is `apiEntries.length`.
Three requests where only one is timed at 100 ms reports an average of 33 ms.

### 21. `shared/utils.js` crashes on ordinary input — and is dead code

- `methodClass` (`:44`) throws `TypeError` on any truthy non-string method.
- `shortPath` (`:67`) throws on `null`/`undefined`, because the catch handler dereferences
  `url.length` on the same null value that caused the throw.
- `shortPath` (`:66`) has no absolute length cap on its 3-segment branch, so a long final
  segment is returned essentially in full, defeating the function's purpose.
- `safeClone` (`:49`) returns the **original reference** on failure, so a "safe clone" of a
  cyclic value aliases the caller's object and writes to the clone mutate the source.

The file is injected into every page and loaded by `devtools/devtools-panel.html`, but a
repo-wide search finds **no reader** of `window.XRAY_Utils`. It is parsed and executed on
every page visit for no consumer. Its contract is pinned by tests anyway, so these crashes
are on record before anyone wires it up.

---

## Behaviours worth knowing (characterized, not necessarily wrong)

- `tokenizeEntry` returns `[]` for any entry type other than `api` or `log`, so **WebSocket
  and GraphQL frames are captured but can never match a search query**.
- A request with `status: 0` (blocked or aborted) contributes no status token and is
  unsearchable by status.
- `searchEntries` trusts a stale `_searchTokens` cache absolutely; the live entry is never
  consulted.
- `buildMock` rewrites a genuine `status: 0` to `200`, so a replayed mock claims success
  for a request that never completed.
- `store.clear()` reports success and deletes nothing when the storage call rejects —
  relevant because the BYOK API key lives behind it.

---

## Verified as *not* a bug

`drift.detectDrift`'s indexed and backwards-scan code paths were property-tested against
each other across 400 randomized histories, asserting both drift and non-drift outcomes
occur so the property is not vacuous. They agree. They diverge only when the caller passes
a stale index, which is a caller contract rather than a defect in the function.
