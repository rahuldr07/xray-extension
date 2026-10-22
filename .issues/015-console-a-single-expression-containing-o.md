---
id: 15
title: Console: a single expression containing `;` or a newline inside brackets returns undefined
status: done
priority: med
labels: [console, bug]
by: claude
files: [shared/console-scope.js]
created: 2026-10-21 23:13
updated: 2026-10-22 10:53
---
Found in console round 2 acceptance (real extension, output/console-round2/acceptance/run-*.txt). These commands show `→ undefined` instead of their value:
- `[1,2].map(x => { const y = x * 2; return y })` (expected [2, 4])
- `(() => { const f = new FormData(); f.append('name', 'Ada'); return f; })()`
- `Math.max(\n1,\n2\n)` and `({ a: 1,\n b: 2 })` (multi-line single expressions)
while `(() => { return 5 })()` works. Cause: `isExpression` (shared/console-scope.js userSource) rejects any text containing `;` or `\n`, and `lastStatementStart` finds no depth-0 separator, so `start <= 0` returns the body without the result box. Pre-existing: HEAD's background.js `_isConsoleExpression`/`_consoleUserBody` has the same check. Fix in userSource's `start <= 0` branch: when the whole command is one top-level statement that is not a declaration/keyword statement, box it as the result (keep the line map); add unit + E2E cases.

## Log
- 2026-10-21 23:13 claude: filed
- 2026-10-22 10:53 claude: done: Fixed in shared/console-scope.js: userSource boxes a lone top-level statement whose ; and newlines sit inside brackets (unless a keyword, async function or block opens it); lastStatementStart no longer splits at a depth-0 newline that continues the expression (trailing operator, or next line starting with . ?. ?? or a binary operator). Tests: background-service-worker.test.js "issue #15" (RED then GREEN), test/e2e/console-scope.e2e.mjs "issue #15" (RED with the change reverted, GREEN with it). Preview eligibility was already depth-aware.
