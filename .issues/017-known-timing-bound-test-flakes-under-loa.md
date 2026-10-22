---
id: 17
title: Known timing-bound test flakes under load (console E2E, json-views 5 MB, coverage perf units)
status: open
priority: low
labels: [tests, flaky, follow-up]
by: claude
files: [test/e2e/console-editor.e2e.mjs, test/e2e/json-views.e2e.mjs, test/e2e/console-inspector.e2e.mjs, test/unit/consoleAssist.test.mjs]
created: 2026-10-21 23:13
updated: 2026-10-21 23:13
---
Recorded through console round 2 (Tasks 5–9); each passes when rerun alone:
- console-editor.e2e.mjs: recency storage order / preview recency test fails occasionally in the full suite.
- json-views.e2e.mjs: the 5 MB body long-task bound (200 ms) measured 233 ms under load.
- console-inspector.e2e.mjs: the 420 px overlay test's 30 s wait times out under load.
- Under `npm run test:coverage` with other work on the machine (load avg 7–20 on 12 cores) timing units fail: consoleAssist "ranking stays fast on a large candidate list", "declaredNames is fast on a long command", the 10,000-key ranking test (fixed in Task 9: limit 150 ms when NODE_V8_COVERAGE is set; it failed in every full coverage run since Task 7 with fNWSC ~57–61 ms vs 6–8 ms unranked), and the preview deadline test.
Make the bounds relative to a same-run baseline or move them to a perf script that the acceptance probe runs, so CI under load stays green.

## Log
- 2026-10-21 23:13 claude: filed
