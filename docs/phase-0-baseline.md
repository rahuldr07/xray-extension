# Phase 0 — Product baseline

## Scope and execution checklist

Approved scope: preserve the existing fixes, verify the working baseline, refresh
verified audit statuses, define representative workloads, and measure initial
performance. No product-behavior changes, dependency upgrades, commits, merges,
pushes, or changes to global settings belong to this phase.

- [x] Inventory and fingerprint pre-existing source and test fixes.
- [x] Rerun the repository checks and verify generated bundles match source.
- [x] Record repeated production-worker and panel-model measurements.
- [x] Define the workload matrix and disclose unmeasured areas.
- [x] Refresh only supported audit statuses and verify preservation at the end.

This is a verification/measurement task, not an enhancement implementation plan.
No new architectural subsystem is introduced. Phase 1 remains a separate design
and implementation step.

## Baseline identity

- Date: 10/07/2026, Asia/Calcutta (UTC+05:30).
- Repository HEAD: `2f7735d4f82b568c6dfcb6111dde0c7e4f7d62a1`.
- Branch: `main`, eight commits ahead of the locally retained `origin/main`.
- The actual baseline is HEAD **plus the uncommitted fixes listed below**, not
  HEAD alone. Remote refs were not refreshed as part of this phase.
- Host: Linux x86_64; Intel Core i5-11400H @ 2.70GHz, 12 logical CPUs.
- Node: v24.21.0; npm: 11.19.0. This does not certify Node 20.11 or Node 22.
- Dependencies use the existing lockfile. No Dependabot update is included.

### Pre-existing fixes (not Phase 0 implementation)

Git blob IDs recorded before Phase 0; these cover file contents, not file names.
The same IDs must be present after Phase 0.

| File | Initial Git blob ID |
| --- | --- |
| `src/panel/components/api/EntriesWorkspace.tsx` | `c59ddb2d3727f303d8645e8d459c99e43d040bdc` |
| `src/panel/components/common/ModalShell.tsx` | `e7b900c6051f807a8c2e5fc938c5d48efce8ecf3` |
| `src/panel/runtime/panelKeyboard.ts` | `de7d4fbd3bb6153a5f5a0c52fd31b0437b32435c` |
| `src/panel/styles.css` | `e8fffd823786e0ae8d4e83b69d79cd26b0d34482` |
| `test/accessibility.test.js` | `7dab216b38505773432f4a6cf6b4feee4dd31322` |
| `test/responsive-motion-css.test.js` | `0c20e45a4b67de4107e28474183f751692a6c740` |
| `test/shell-navigation-modals.test.js` | `f8b1701d8109f6f6769a53e28ac85cddf82bc991` |
| `test/e2e/api-layout.e2e.mjs` | `099deba01b3715e46151994b37d891e89dbb38f1` |
| `test/e2e/modal-stack.e2e.mjs` | `e4743e9932acbbd7f6b2c08f8f813d50b53946cd` |

Also pre-existing: rebuilt `dist/panel-ui.js`, `dist/hud-ui.js`, and
`dist/window-ui.js`; the untracked runtime/UI plan under `docs/superpowers/plans/`;
and untracked `graphify-out/` exploration output. They must not be removed or
mistaken for Phase 0 changes. A tracked-diff backup is retained in the approved
temporary area outside the repository; it does not include untracked files.

Dependency-manifest fingerprints:

- `package.json`: `cbae0bb5a1949ce2cb608c8724b6d263fa775dd1`
- `package-lock.json`: `cc133562f62f03bcaaa72c8d90ca2d1a6eee8b48`

Build verification may refresh the generated timestamp. Compare normalized
bundle content separately; do not mistake a timestamp refresh for product work.

## Fresh verification receipts

Executed on the baseline above, not inferred from an earlier session:

| Command | Observed result |
| --- | --- |
| `npm run check` | Passed: typecheck, lint, build, and 528/528 regular tests |
| `node scripts/check-dist-sync.mjs` | Passed: all three working-tree bundles match source after timestamp normalization |
| `npm run test:e2e` | Passed: 13/13 Chromium tests |
| `npm run test:coverage` | Passed: 528/528 tests and aggregate threshold gates |
| `npm run ui:shots -- --out output/phase0/ui-shots --tabs api,console --widths 360,420,760,960,1600` | Generated ten 1000px-high preview screenshots |

Lint reports **0 errors and 61 existing warnings**. Build emits the existing
Vite native-config-loader compatibility warning. Coverage is 98.73% lines,
91.18% branches, and 97.61% functions **for the instrumented model/utils files**.
It is not whole-extension coverage: source-string tests and VM-loaded capture
scripts do not certify those paths, and React components are not in this report.

The E2E suite exercises real extension fetch capture and sensitive-header
redaction, plus real React component fixtures for API layout, filtered-empty
states, and modal stacking in document/closed-shadow roots. The component
fixtures are not a complete end-to-end test of every shipped surface.

Screenshots live in `output/phase0/ui-shots/`. The preview has no storage bridge:
its expected `XRAY_Store unavailable` warnings are retained in `console.log`.
No console errors or page exceptions were reported. These are visual reference
artifacts, not performance measurements or a full UX/accessibility sign-off.

## Representative workload matrix

All data must be synthetic; never benchmark with captured production secrets.
This defines future comparisons without pretending all workloads were executed.

| ID | Fixed workload | Metrics/checks | Phase 0 evidence |
| --- | --- | --- | --- |
| W1 | 1000 API entries, 100 paths, alternating fetch/XHR, 10% HTTP 500, small JSON bodies | List derivation, full-scan search, session export elapsed ms | Measured with production panel models |
| W2 | Same shape at 5000 entries | Same metrics; later add capture overhead, rendered input latency, and memory | Model timings measured; browser performance not measured |
| W3 | 10000 JSON rows, 24 generated string fields plus id/nested; mutate field_0 every 17 rows | Schema, diff, grid, stats, combined analysis elapsed ms | Production worker functions measured in Node VM; 6,892,251-byte offline fixture |
| W4 | WebSocket and SSE: 100 messages/sec for 60sec, 1KiB each, panel open and closed | Missing/duplicate frame counts, update latency, retained bytes, peak memory | Defined only; no sustained-stream measurement |
| W5 | Main document + two frames, two local origins, 100 fetches per frame; reload then navigate | Attribution, duplicate/missing captures, recovery, origin/session separation | Defined only; current capture E2E covers a simpler single-frame fetch |
| W6 | API and Console preview at widths 360/420/760/960/1600, height 1000 | Saved visual baseline; later measure response area, click count, input latency | Ten screenshots; component layout checks at 420/1600 × 700 |
| W7 | Open each surface, apply a setting, reload/navigate, reconnect after worker suspension | State parity and recovery; inspect unsupported capabilities | Defined only; no complete cross-surface lifecycle certification |

W3 intentionally stresses offline analysis beyond normal capture-body limits;
it is not evidence the live interceptor captures a 6.9MB response in full.
Functional checks and timings are separate. Before optimization, add browser
measurements for the specific user interaction being improved.

## Performance method and reproduction

Use `scripts/benchmark-phase0.mjs`, which calls the actual panel models through
the existing unit harness and loads `workers/xray-worker.js` into a Node VM.
The existing `scripts/benchmark-worker-core.mjs` is left untouched: it defines
copied algorithms, including a different diff cap, so it is not used as a
production-worker baseline.

```sh
mkdir -p output/phase0
node scripts/benchmark-phase0.mjs output/phase0/performance-run-1.json
node scripts/benchmark-phase0.mjs output/phase0/performance-run-2.json
node scripts/benchmark-phase0.mjs output/phase0/performance-run-3.json
```

Destinations must be new files under `output/`; the runner refuses to overwrite
them. For a later comparison, use distinct filenames and retain both sets.
The runner records environment, HEAD, source SHA-256 hashes, fixture byte counts,
first-call timing, every measured sample, medians, and min/max.

Three separate process runs, one first call and one additional warmup per
operation, then five warm samples per run. Timings use `performance.now()` in
milliseconds and exclude fixture creation and result validation. Assertions
verify list sizes, search outcomes, valid exports, and analysis outputs.
There is a 60-second between-operation budget; runs were also launched with a
90/120-second tool timeout. Completed runs took only a few seconds.

No benchmarks ran concurrently with our test/build/screenshot commands. The
shared host was not CPU-pinned or otherwise isolated, so background load and GC
can contribute noise. Each run uses fixed operation order and warm immutable
fixtures: existing memoization and JIT state are included. A first call here is
not a cold-browser startup measurement. VM worker timings exclude thread IPC,
structured clone, IndexedDB, DOM rendering, and live interception.

### Observed warm medians (ms)

Each column is the median of five samples in a separate process, not an
improvement comparison. Full individual values remain in the three JSON files.

| Workload / operation | Run 1 | Run 2 | Run 3 |
| --- | ---: | ---: | ---: |
| 1000 entries / flat list | 0.441 | 0.432 | 0.806 |
| 1000 entries / no-match global search | 2.087 | 3.147 | 3.508 |
| 1000 entries / session JSON serialization | 1.768 | 2.099 | 2.015 |
| 5000 entries / flat list | 2.100 | 2.794 | 3.129 |
| 5000 entries / no-match global search | 11.120 | 11.947 | 18.188 |
| 5000 entries / session JSON serialization | 9.386 | 11.098 | 10.457 |
| 10000 rows / worker schema (first-element sampling) | 0.016 | 0.022 | 0.013 |
| 10000 rows / worker diff (full traversal) | 145.889 | 163.639 | 152.100 |
| 10000 rows / worker grid (200 output rows) | 2.621 | 2.837 | 1.710 |
| 10000 rows / worker stats (bounded sampling) | 9.555 | 10.965 | 9.717 |
| 10000 rows / worker combined detail analysis | 166.295 | 183.052 | 181.726 |

### Interpretation, not optimization claims

- The schema number reflects first-element sampling, not full-array validation.
- `computeDiff` traverses the full input and returns 589 changes for W3.
  `detailAnalysis` slices the completed diff to 500 results; it does **not** stop
  traversal at 500. This differs from the copied algorithm in `bench:worker`.
- Diff/combined analysis are useful profiling leads on this synthetic workload.
  VM/realm overhead means these values must not be presented as browser-worker
  latency or used by themselves to justify WASM or an architectural rewrite.
- Search variation (11.120–18.188ms run medians at 5000 entries) is visible.
  Future comparisons must repeat the same workload and include the variation.
- These are initial measurements only: no before/after speedup was attempted.

## Audit refresh policy and remaining gaps

The dated follow-up in `docs/ui-audit.md` overrides historical statuses only for
revalidated findings. Composite findings are marked partially fixed when the
available checks prove only part of the original observation. Original measured
values remain as historical evidence; the original count table is not a current
backlog count.

Not certified in Phase 0: Node 20.11/22 compatibility, memory/peak heap, sustained
WebSocket/SSE capture, multi-frame attribution, cross-surface state parity,
service-worker lifecycle recovery, theme/accessibility matrices, and full AI or
replay-provider workflows. No real-provider requests were sent.

Phase 1 must still design the trust fixes: command ranking, truthful action
receipts/states, settings save semantics, explicit AI consent/redaction, and
rule drafting/arming. The new benchmark is verification tooling only.

## Final preservation and Phase 0 changes

All nine pre-existing source/test blob IDs above matched at the final check.
HEAD, `package.json`, and `package-lock.json` also remained unchanged. No commit,
merge, push, dependency install, or global-settings change was performed in
Phase 0. Builds regenerated bundles from unchanged product source.

Phase 0's new work is limited to:

- `docs/phase-0-baseline.md` — this baseline and execution record.
- `docs/ui-audit.md` — a dated, evidence-scoped status follow-up.
- `scripts/benchmark-phase0.mjs` — reproducible verification tooling, not product code.
- Ignored `output/phase0/performance-run-1.json`, `performance-run-2.json`, and
  `performance-run-3.json`, plus ten screenshots and the preview console log in
  `output/phase0/ui-shots/`.

The runner passed syntax checking, targeted ESLint, and three complete executions
with result assertions. Final whole-repository ESLint (`--quiet`) and
`git diff --check` passed. Existing exploration/planning artifacts remain intact.
Phase 0 is complete for the approved baseline scope; the unmeasured workloads
above remain explicit follow-up work, not implied passing checks.
