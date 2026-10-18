# Phases 3–5 — Session foundations, exploration, and controlled experiments

## Status and intent

Date: 2026-10-08, Asia/Calcutta. This specification records the autonomous
implementation decision for the next roadmap slice. It preserves the completed
Phases 1–2 and deliberately avoids a capture-protocol rewrite.

The goal is to make an XRAY investigation resumable and falsifiable: a session has
an identity and health receipt, a developer can compare any two captured requests,
and replay/mock work is recorded as an explicit experiment rather than an opaque
button side effect.

## Phase 3 — Runtime, session, message, and persistence foundations

### Session envelope

Persist a bounded `SessionEnvelope` under the existing local storage path. It has:

- `schemaVersion`, `sessionId`, `createdAt`, `updatedAt`;
- `source` metadata: last known origin/title when available, without secrets;
- `entryCount`, `apiCount`, `logCount`, `lastEntryAt` summary fields;
- bounded captured entries using the existing `serializeSessionEntries()` rules;
- `runtime` receipt: capture route state, worker state, last event timestamp, last
  error code (not raw page payload), and dropped/accepted counters.

Existing `session_entries` data migrates into one envelope in memory and remains
readable. Persist writes are debounced and replace the envelope atomically through
`XRAY_Store`; no localStorage fallback or cloud storage is introduced. Clear data
clears the envelope. Export/import remains explicit and does not silently merge
remote or other sessions.

### Runtime health and message accounting

Add a small health state machine with `unknown | healthy | degraded | unavailable`.
Capture entry/batch/update paths increment accepted/dropped counters and update the
last-event timestamp. Invalid bridge payloads remain dropped at the existing content
boundary; only aggregate reasons/counts reach the panel. Do not log captured bodies,
headers, URLs with query values, keys, or provider payloads.

The worker client must reject all pending requests when a worker errors, expose a
health/restart receipt, and allow one bounded recreation attempt. A missing worker
is an honest degraded state, not a ready state with silent empty results. Existing
main-thread fallbacks remain bounded and explicit.

### Reconnect and surface behavior

DevTools relay and in-page capture retain their existing routes. A reconnect or
worker restart never duplicates entries, resets selection, or replays a command.
The UI exposes health only through a compact status/tooltip and a diagnostic action;
it does not turn routine capture into a modal interruption.

## Phase 4 — Deep exploration and arbitrary comparison

### Exploration model

Add an exploration query model over the existing captured entries: text/regex,
case-sensitivity, fields, result cap, and selected result IDs. Search is read-only,
bounded to the existing 20,000-character field scan and 200-result cap, and returns
field/snippet evidence. No arbitrary code execution or network fetch is introduced.

### Two-entry comparison

Allow any two API entries in the retained session to be selected as `left` and
`right`, regardless of endpoint, timestamp, method, or GraphQL operation. Produce a
deterministic comparison containing identity differences, status/timing/size
differences, request-header/body differences, response-header/body structural
differences, and explicit unavailable/truncated notices.

The comparison is a pure model and never replaces the existing endpoint drift
baseline. It is launched from request detail/command search, remains available while
switching list views, and is cleared explicitly. Sensitive values use the existing
captured redaction; comparison never reconstructs MAIN-world secrets.

## Phase 5 — Controlled replay and mock experiments

### Experiment record

Add a bounded local `ExperimentRecord` with:

- stable ID, created/updated timestamps, title and `status` (`draft`, `armed`,
  `running`, `observed`, `failed`, `cancelled`);
- baseline entry ID;
- sanitized planned request delta (method, URL, headers, body) and/or mock-rule ID;
- expected checks: status, response presence, or structural comparison mode;
- observed replay/mock entry ID and deterministic check results when available;
- error code/reason without raw credentials or full payloads.

Creating/editing an experiment is local and inert. Arming is explicit. Running uses
the existing origin-pinned replay or disabled-by-default mock rule path; it never
executes arbitrary Console code. A replay is marked by its existing `replayOf` field;
the panel associates the first matching captured result with the experiment and
marks it observed. If no result arrives before a bounded timeout, the experiment
fails honestly. A mock experiment records the rule and waits for an observed mocked
entry; it never claims application merely because a bridge post succeeded.

### Safety and lifecycle

- No experiment can send while its URL is empty, malformed, cross-origin from its
  baseline without an explicit retarget acknowledgement, or while another run is
  active for the same baseline.
- Sensitive headers remain placeholders in the panel; MAIN-world replay restoration
  stays origin-pinned and out of persisted records.
- Experiments are capped at 50 records, persisted in the session envelope or a
  separate existing local key with the same private storage bridge, and can be
  discarded without clearing captured traffic.
- Results compare captured representations only. They do not claim causality or
  replace the deterministic diff/drift models.

## Cross-phase exclusions

No cloud collaboration, server-side session store, arbitrary request crawler,
provider orchestration, automatic replay loops, production traffic mutation without
an explicit armed action, or Phase 6 AI finding synthesis. No new dependencies.

## Acceptance and verification

- Session migration, envelope round-trip, debounce/clear, bounds, private storage,
  and runtime counters have model tests. Existing imports/exports remain valid.
- Worker error rejects pending requests, exposes degraded health, and one restart
  recovers without duplicate messages; repeated failure is unavailable.
- Search remains bounded and evidence-linked. Arbitrary comparison tests unrelated
  endpoints, malformed/cyclic/truncated values, redacted headers, and stable output.
- Experiment tests cover draft/arm/run/observe/fail/cancel, cross-origin refusal,
  duplicate-run refusal, mock/replay association, timeout, cap, and clear.
- Browser tests exercise session health, compare selection, experiment controls,
  closed-shadow focus, mobile reachability, and no side effects before explicit Run.
- Run `npm run check`, `npm run test:e2e`, `npm run test:coverage`,
  `node scripts/check-dist-sync.mjs`, and new phase-specific browser fixtures.
  Rebuild all three tracked bundles and capture synthetic UI screenshots.
