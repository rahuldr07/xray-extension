---
id: 16
title: Console suggestion list: keydown → list over one frame for long lists (forced layouts per keystroke)
status: done
priority: med
labels: [console, autocomplete, performance]
by: claude
files: [src/panel/components/console/ConsoleEditor.tsx]
created: 2026-10-21 23:13
updated: 2026-10-22 10:53
---
Console round 2 acceptance (real extension, in-page MutationObserver stamp; output/console-round2/acceptance/acceptance.md latency table): keydown → list is ~6–9 ms for 3-row lists but 23–45 ms for `res.users.` (45 rows) and 16–30 ms for `Object.` (24 rows); the spec budget is p95 ≤ 16 ms (audit baseline before round 2: p95 3.4 ms with ~13 plain rows). The first catalogue popup of a page load (`JSON.st`) took ~140 ms once. suggest() itself costs 0.1–0.3 ms (node). A CDP CPU profile of 8× typing `res.users.` attributes the time to forced layouts, three per keystroke: the textarea autosize (`style.height = 'auto'` then `scrollHeight`), the overlay scroll sync reading `scrollTop/scrollLeft`, and the active-option `offsetTop` read in a layout effect; plus per-row SVG kind icons (createElementNS/setAttribute) and React commit. Fix shape: render at most the visible rows (virtualize with @tanstack/react-virtual, already a dependency, or cap rendered rows ~30 with the rest on scroll), skip the autosize when the line count did not change, and batch layout reads before writes in one layout effect. Re-measure with output/console-round2/acceptance/probe.mjs.txt `latency` + `profile` phases.
Wide body (Task 3 ruling probe, 10,000-key captured response, list capped at 100 rows): `res.` 47–72 ms, `res.key99` / `res.key12` 34–39 ms keydown → list.

## Log
- 2026-10-21 23:13 claude: filed
- 2026-10-22 10:53 claude: done: ConsoleEditor.tsx: one forced layout per keystroke (append-only autosize without the auto reset, overlay scroll sync deferred a frame after a height write, no offsetTop read for the first option of a list that has not scrolled, collapsed popup styles written only when set). Long lists render the first 16 rows on the keystroke and the rest after the next paint, or at once when navigation passes row 15. Quiet-machine probe (load 4.9): keydown → list p95 5.6 ms (res.users. 3.5–5.6, Object. 3.0–4.8, short lists 1.7–2.8); 10k-key body p95 11 ms. The first catalogue popup of a page load (JSON.st) still costs ~128 ms once.
