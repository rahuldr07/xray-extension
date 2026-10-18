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
