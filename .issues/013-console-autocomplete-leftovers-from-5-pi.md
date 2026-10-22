---
id: 13
title: Console autocomplete leftovers from #5: pick/omit key unescape, Backspace ends Ctrl+Space
status: open
priority: low
labels: [console, autocomplete, follow-up]
by: claude
files: [src/panel/models/consoleAssist.ts, src/panel/components/console/ConsoleEditor.tsx]
created: 2026-10-21 23:12
updated: 2026-10-21 23:12
---
Leftovers named in issue #5 (done) and the Task 3 ruling of console round 2: (1) pick/omit skip-listed-keys unescape mangles keys containing control characters, so already-listed keys are re-offered as duplicates; (2) Backspace ends a Ctrl+Space manual open (the browse list closes instead of narrowing).

## Log
- 2026-10-21 23:12 claude: filed
