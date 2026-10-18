---
id: 4
title: 'no-consumer' shows as an error code whenever DevTools is closed
status: open
priority: low
labels: [ux, runtime]
by: claude
files: [src/panel/store.ts, src/panel/components/settings/SettingsModal.tsx, shared/worker-client.js]
created: 2026-10-12 04:47
updated: 2026-10-12 04:47
---
With DevTools closed, every capture records delivery `no-consumer`, and the store sets `runtimeHealth.lastErrorCode = 'no-consumer'` (src/panel/store.ts noteCapture). Settings then shows "Code no-consumer" during normal use. Track delivery outcome separately from error codes, or don't surface no-consumer as an error. Related: the Settings "Restart worker" button is always disabled because XRAY_Worker has no restart(); either implement it or remove the control.

## Log
- 2026-10-12 04:47 claude: filed
