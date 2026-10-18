---
id: 6
title: Share-safe export keeps plain strings from multi-argument console logs (emails, stack text)
status: open
priority: high
labels: [privacy, export]
by: claude
files: [src/panel/models/export.ts, content/console-capture.js, test/unit/exportCorrectness.test.mjs, test/e2e/theme-visual-system.e2e.mjs]
created: 2026-10-14 11:46
updated: 2026-10-14 11:46
---
Share-safe export promises "Opaque text and diagnostics are omitted", but for console calls with several arguments, `console-capture.js` (~254-262) emits an array and the array branch of `clean()` in src/panel/models/export.ts (~151) only rewrites URLs inside each string. Repro through the export harness: logData ['Lookup failed for','bob@example.com', err, err.stack] exports the email, the error message and a url()-mangled stack frame; only the Error object itself is reduced to {"name":"Error"}. A single-string logData becomes [OMITTED]. Pre-existing (the pre-E4 clean() behaved the same). Fix: omit string elements of log args/logData arrays the same way a top-level log string is omitted (keep numbers/booleans/structure), with a unit test. Also tighten two tests found in the same review: exportCorrectness.test.mjs ~72/77 uses a `?token=` frame that url() always redacts, so the `%3A10%3A5` leak marker can never trip (use an allow-listed `?v=2:10:5)`); theme-visual-system.e2e.mjs ~139-147 chevron check should also assert the ::before pseudo's display/visibility/opacity.

## Log
- 2026-10-14 11:46 claude: filed
