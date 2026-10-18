# Phases 6–7 — Evidence and reusable investigations

## Approved intent

Build the reviewed local deterministic finding ledger, optional AI synthesis, and saved investigations with assertions and step-explicit scenarios. Preserve Phases 0–5 and all capture/credential boundaries. No dependencies, commits, pushes, cloud services, or automatic execution.

## Phase 6

- Derive slow (inclusive configured threshold), HTTP error (400+), repeated endpoint (3+ GraphQL-aware calls), and schema-drift findings from captured evidence.
- Separate versioned `finding_state` ledger tied to session ID; cap 100 findings, 5 compact references per finding. Store IDs, sanitized origin/path, status/timing/size and bounded fixed claims, not bodies/headers/schema payloads.
- Stable semantic IDs and material fingerprints; dismiss only the matching ID/fingerprint. Minor repeated-count growth does not revive a dismissed claim. Restore is explicit. History retains unavailable references after eviction.
- Reconcile capture before eviction; refresh after patches/imports/settings changes. Clear session clears ledger. Serialize bounded plain data; unsupported versions are not overwritten silently.
- Insights retains current summaries and adds Findings with evidence navigation, dismiss/restore, history/unavailability, and selection (max 5) for synthesis.
- Synthesis uses frozen sanitized compact facts only, exact prompt preview and existing BYOK destination guard. Explicit Analyze only; no raw body opt-ins in synthesis. AI interpretation is transient, cannot mutate findings, and is not a diagnosis/causality assertion. Existing request Explain remains unchanged.

## Phase 7

- One `saved_investigations` schema-v1 envelope independent of live session. Cap 25 investigations, 20 scenarios each, 20 steps each, 50 assertions each, 20 scalar run receipts per scenario, aggregate envelope 1 MB. Normalize untrusted persisted data and guard unsupported future versions.
- Save title/notes, selected/pinned entry references, compare pair, API filter snapshot and linked finding IDs. References use session ID + entry ID and safe metadata; saved artifacts survive Clear. No implicit pins or silent substitution. Rebinding requires explicit choice.
- Assertion specs wrap existing status/presence/structural ExperimentCheck. Baseline structural expectations freeze bounded sanitized values at authoring; results are passed/failed/unavailable. Shared experiment sanitization and evaluation remain authoritative.
- Scenarios are ordered sanitized replay/mock plans referencing retained baselines/disabled rules. Draft/edit/save/restore are inert. Run one step explicitly; Run next step is another explicit action. No hidden sequence loop.
- Existing experiment actions execute each step, own mock cleanup, capture association, timeouts and cancellation. Thin reproduction receipts reference experiment IDs and adapt terminal results; no new bridge, capture listener/matcher or network executor.
- Interrupted running receipts fail closed on restore. Cancel stops waiting and cannot recall submitted replay. Missing/wrong-session refs refuse execution, with explicit rebind. No unattended execution, arbitrary JS, variable templating, export/import or cloud sync.
- Saved Investigations lives in Rules alongside existing experiments. Request detail and Command Palette expose preparation/open actions. Reopen restores retained references/filter/compare context only and never runs work.

## Verification

Pure model RED/GREEN tests cover normalization, identity/dismissal, bounds/privacy, tri-state assertions and references. Browser fixtures cover real store/components and mocked extension/provider boundaries: save/reload/clear races, navigation, exact synthesis consent, explicit-only reproduction, timeout/cancel/interruption and document/closed-shadow mobile/wide geometry. Run check, full e2e, coverage without lowering thresholds/exclusions, bundle synchronization and whitespace checks. Do not claim live provider certification, complete accessibility certification or full performance certification.
