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

## Verified as *not* a bug

`drift.detectDrift`'s indexed and backwards-scan code paths were property-tested against
each other across 400 randomized histories, asserting both drift and non-drift outcomes
occur so the property is not vacuous. They agree. They diverge only when the caller passes
a stale index, which is a caller contract rather than a defect in the function.
