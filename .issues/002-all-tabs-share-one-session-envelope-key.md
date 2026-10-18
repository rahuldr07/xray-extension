---
id: 2
title: All tabs share one session_envelope key, so Clear doesn't survive another active tab
status: open
priority: med
labels: [bug, persistence]
by: claude
files: [src/panel/store.ts]
created: 2026-10-12 04:47
updated: 2026-10-12 04:47
---
Every tab persists to the same `session_envelope` key (src/panel/store.ts ~1579). An active tab B rewrites its entries within the 4s persist window after tab A's Clear, so the Clear is lost on reload, and a new tab restores traffic from other sites. "Clear wins" only holds within one tab. Consider per-tab/per-origin keys or a clear epoch shared across tabs.

## Log
- 2026-10-12 04:47 claude: filed
