---
id: 14
title: Console Runs and previews: revived context, declared values and named helpers run on page-realm built-ins
status: open
priority: low
labels: [console, security, follow-up]
by: claude
files: [shared/console-scope.js, shared/console-helpers.js, docs/threat-model.md]
created: 2026-10-21 23:12
updated: 2026-10-22 11:16
---
Accepted limit (threat model C-1, Task 6 rulings): on an explicit Run, the members the command references are revived in the page and helpers the user names (pick, table, schema, $status …) run with page-realm built-ins (Array.prototype.map, Object.keys …) and promise machinery, so a hostile page that wrapped them can observe/alter the data passing through on that Run. XRAY's own plumbing never routes the scope or the whole context through page code, and the typing path never sends or revives context (Task 8). Previews (final review I-1): a page preview of a draft over values the user's last Run revived or the user declared (`res.users.map((u) => u.id).length`, `users.map(…)`) runs page-realm built-ins and prototypes on them under the side-effect check — patched `Array.prototype` methods, `Object.prototype` getters on missing keys, `valueOf`/`toString` on coercion. A hostile page can measure them (timing channel, same class as C-1 limit (i); ~1 byte per preview); it cannot write or keep a copy; the data is limited to what the last Run revived or the user declared; turning off "Preview results while typing" removes it. Follow-up (covers both): build the revived context and helper internals from natives captured at scope creation (or worker-side), so only the user's own code touches page built-ins.

## Log
- 2026-10-21 23:12 claude: filed
- 2026-10-22 11:16 claude: Final review I-1 (ruling B): the same page-realm exposure reaches page previews of drafts over values a prior Run revived or the user declared, under the side-effect check — a timing channel (class of C-1 limit (i)), no writes, no stored copy; data limited to what the last Run revived or the user declared; turning off "Preview results while typing" removes it. Body corrected; pinned by console-scope-attacks.e2e.mjs (mapComputes/mapWrites/protoWrites).
