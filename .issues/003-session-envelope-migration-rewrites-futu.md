---
id: 3
title: Session envelope migration rewrites future-version data as v1
status: open
priority: low
labels: [bug, persistence]
by: claude
files: [src/panel/models/sessionEnvelope.ts, src/panel/store.ts]
created: 2026-10-12 04:47
updated: 2026-10-12 04:47
---
`migrateSessionEnvelope` (src/panel/models/sessionEnvelope.ts) accepts an envelope with a newer schema version and the next write stores it back as v1, losing fields. Findings and investigations refuse unsupported future versions and leave stored data intact; the session envelope should do the same.

## Log
- 2026-10-12 04:47 claude: filed
- 2026-10-15 claude (JSON fidelity Task 8): the session envelope is now schemaVersion 2. A build from before it reads a v2 envelope as its own format: entries load, but every log shows no value there — v2 stores a log's typed value as `logDataJson` text (chrome.storage sorts object keys) and the old build reads `logData`. (Its save copies unknown fields through, so a later upgrade reads `logDataJson` again; it does relabel the envelope as v1, which the new build then migrates as legacy.) Versions newer than 2 are not migrated as legacy, but are still rewritten as 2 on the next save (this issue).
