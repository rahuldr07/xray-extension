---
id: 1
title: Failed session read at startup lets the next capture overwrite the stored session
status: open
priority: med
labels: [bug, persistence]
by: claude
files: [src/panel/store.ts]
created: 2026-10-12 04:47
updated: 2026-10-12 04:47
---
In `restorePreferences` (src/panel/store.ts ~1131-1164), if the batched storage read throws, the code falls through with empty preferences/envelope. `authoritativeReadOK` only drives the health flag. The next capture's `persistSession` then writes an envelope containing only live entries, replacing the stored session. Suggest gating session writes on a successful authoritative read, or making the first post-failure write merge rather than replace. Behaviour trade-off: Task 2 spec expects live entries to persist after storage recovers, so design carefully.

## Log
- 2026-10-12 04:47 claude: filed
