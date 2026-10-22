---
id: 12
title: Console result Tree: arrow-key navigation (↑/↓ move, →/← expand/collapse)
status: open
priority: low
labels: [console, a11y, follow-up]
by: claude
files: [src/panel/components/detail/JsonView.tsx, src/panel/components/console/ResultView.tsx]
created: 2026-10-21 23:12
updated: 2026-10-22 11:17
---
Console round 2 Task 2 fix round (Minor 4) left keyboard tree navigation as a follow-up: inline result trees (objects, DOM nodes, functions, buckets) expand by click/Enter on each toggle but have no roving focus with ↑/↓/→/← as in DevTools and the WAI-ARIA tree pattern.

## Log
- 2026-10-21 23:12 claude: filed
- 2026-10-22 11:17 claude: Related (final review M-8): the editor's preview and getter hint row (ConsoleEditor.tsx hint row) sits outside any live region, so `→ value` previews and the "getter — not evaluated" row are not announced per keystroke; only list counts and notes reach the live region. By design, like DevTools (announcing every keystroke's preview would be noise). Revisit together with keyboard navigation if screen-reader users ask for it.
