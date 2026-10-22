---
id: 5
title: Console value list reopens after a finished identifier argument and captures Enter
status: done
priority: low
labels: [console, autocomplete]
by: claude
files: [src/panel/models/consoleAssist.ts, src/panel/components/console/ConsoleEditor.tsx]
created: 2026-10-14 00:27
updated: 2026-10-18 18:43
---
In the Console prompt, after a helper argument that is a finished identifier or keyword followed by a space (e.g. `$status(res ` or `$status(true `), the status-code value list can reopen and take over Enter/Tab/arrows, so Enter accepts a suggestion instead of running. `endsComplete` (src/panel/models/consoleAssist.ts ~355-365) treats only a closed string, a number + whitespace, or a trailing operator as complete. Fix: also treat an identifier/keyword token followed by whitespace as complete; add unit cases. Found in the final review of the autocomplete batch (re-review of the fix wave); not covered by its tests. Related leftovers: pick/omit skip-listed-keys unescape mangles keys with control characters (re-offered as duplicates); Backspace ends a Ctrl+Space manual open.

## Log
- 2026-10-14 00:27 claude: filed
- 2026-10-18 18:26 claude: Task 3 of console round 2: Enter rule, endsComplete identifier␠, tiered ranking, helper insert, $ trigger.
- 2026-10-18 18:43 claude: done: Fixed in console round 2 Task 3. consoleAssist.ts: endsComplete treats identifier/value keyword/closing bracket + whitespace as finished (`$status(res `, `$status(true ` keep the list shut); new isCompleteCommand + shouldEnterAccept (Enter accepts only for an unfinished command, a token not yet equal to a suggestion, or after ↑/↓; otherwise runs/newline). ConsoleEditor.tsx wires it (navigated ref, `exact` from visibleSuggestions). Tests: test/unit/consoleAssist.test.mjs, test/e2e/console-editor.e2e.mjs. Leftovers (pick/omit unescape, Backspace ending Ctrl+Space) not addressed.
