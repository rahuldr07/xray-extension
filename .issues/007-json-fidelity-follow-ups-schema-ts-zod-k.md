---
id: 7
title: JSON fidelity follow-ups: Schema/TS/Zod key order, invalid-JSON Schema, page-side parses, save cost
status: open
priority: low
labels: [json, follow-up]
by: claude
files: []
created: 2026-10-16 03:57
updated: 2026-10-16 03:57
---
Leftovers from the JSON-fidelity plan's acceptance and final review (docs/superpowers/specs/2026-10-14-json-fidelity-design.md; report .superpowers/sdd/2026-10-14-json-fidelity-implementation/task-10-report.md):
- Audit #21 (LOW): Schema, TypeScript and Zod exports list integer-like keys first (JS object order); build them from the JsonNode to keep source order.
- Audit #26 (LOW): the Schema view says "string" for an unparseable JSON body (Tree/Raw already show the error line/col).
- M2: interceptor.js still JSON.parses every text request body ≤ 50,000 chars in the page and posts/saves the parsed copy; content.js passes requestBody/responseDecrypted through unvalidated; request binary descriptor not validated like responseBinary.
- M3: every captured response is JSON-parsed in the page only to compute decryptStatus — parse only when the parse token is set.
- M5: each session save of a full 6.9 MB session is an 83–110 ms main-thread task (ASCII fast path in fitText).
- Inert worker client cache-health code and `clone` remain after the cache removal.

## Log
- 2026-10-16 03:57 claude: filed
