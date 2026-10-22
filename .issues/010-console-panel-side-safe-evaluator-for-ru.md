---
id: 10
title: Console: panel-side safe evaluator for Run-free previews of captured data (res.*, entry.*, pins)
status: open
priority: med
labels: [console, autocomplete, follow-up]
by: claude
files: [src/panel/components/console/ConsoleEditor.tsx, src/panel/models/consolePreview.ts]
created: 2026-10-21 23:12
updated: 2026-10-21 23:12
---
Task 8 ruling (security over convenience): the typing path never sends context to the page, so a draft naming captured data (e.g. `res.users.length * 2`, `res.users.map(u => u.id)`) previews only after an explicit Run revived the same members. Acceptance probe: before a Run → no preview; after `res.users.length` was run → `→ 6`. A small hand-written evaluator in the panel (literals, member/index access, arithmetic, `.length`, whitelisted pure array/string methods with arrow callbacks — no eval/new Function, MV3 CSP) over captured roots would give Run-free previews without touching the page. Today only plain paths preview locally ("(from captured data)").

## Log
- 2026-10-21 23:12 claude: filed
