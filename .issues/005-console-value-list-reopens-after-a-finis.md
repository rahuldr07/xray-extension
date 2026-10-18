---
id: 5
title: Console value list reopens after a finished identifier argument and captures Enter
status: open
priority: low
labels: [console, autocomplete]
by: claude
files: [src/panel/models/consoleAssist.ts, src/panel/components/console/ConsoleEditor.tsx]
created: 2026-10-14 00:27
updated: 2026-10-14 00:27
---
In the Console prompt, after a helper argument that is a finished identifier or keyword followed by a space (e.g. `$status(res ` or `$status(true `), the status-code value list can reopen and take over Enter/Tab/arrows, so Enter accepts a suggestion instead of running. `endsComplete` (src/panel/models/consoleAssist.ts ~355-365) treats only a closed string, a number + whitespace, or a trailing operator as complete. Fix: also treat an identifier/keyword token followed by whitespace as complete; add unit cases. Found in the final review of the autocomplete batch (re-review of the fix wave); not covered by its tests. Related leftovers: pick/omit skip-listed-keys unescape mangles keys with control characters (re-offered as duplicates); Backspace ends a Ctrl+Space manual open.

## Log
- 2026-10-14 00:27 claude: filed
