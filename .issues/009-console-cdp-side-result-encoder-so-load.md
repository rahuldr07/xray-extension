---
id: 9
title: Console: CDP-side result encoder so load-time built-in patches cannot alter displayed results
status: open
priority: med
labels: [console, security, follow-up]
by: claude
files: [shared/console-scope.js, shared/console-helpers.js, background.js, docs/threat-model.md]
created: 2026-10-21 23:12
updated: 2026-10-21 23:12
---
Console round 2 (Task 6 rulings, accepted limit in docs/threat-model.md C-1): the result encoder runs in the page with natives captured at scope creation. A page that patches built-ins at load (before XRAY's scope exists) can alter how computed console results display (it never sees the scope or unnamed context). Encoding results from the worker via CDP (Runtime.getProperties / descriptor reads on the RemoteObject, no page code) would remove this limit. Redesign of the result path; measure the extra CDP round trips against today's Run latency (acceptance: `1+1` p50 ~40 ms, `res` p50 ~65 ms Enter→cell). Source: .superpowers/sdd/2026-10-18-console-output-autocomplete-implementation/progress.md (Task 6 fix round 2/3 rulings).

## Log
- 2026-10-21 23:12 claude: filed
