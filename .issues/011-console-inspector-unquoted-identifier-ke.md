---
id: 11
title: Console inspector: unquoted identifier keys and [0 … 99] buckets like the inline Tree
status: open
priority: low
labels: [console, follow-up]
by: claude
files: [src/panel/components/console/ResultInspector.tsx, src/panel/components/detail/JsonView.tsx]
created: 2026-10-21 23:12
updated: 2026-10-21 23:12
---
Console round 2 Task 2 ruling: the inline result Tree now shows unquoted identifier keys and buckets big arrays as [0 … 99], [100 … 199]; the "Open in inspector" view still uses the old JSON-style quoted keys and flat lists. Align the inspector with the inline Tree (spec docs/superpowers/specs/2026-10-18-console-output-autocomplete-design.md §1).

## Log
- 2026-10-21 23:12 claude: filed
