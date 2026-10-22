---
id: 20
title: Split shared/console-scope.js: the ~830-line scope template string has no lint or typecheck
status: open
priority: low
labels: [console, tech-debt, follow-up]
by: claude
files: [shared/console-scope.js, background.js]
created: 2026-10-22 11:17
updated: 2026-10-22 11:17
---
Final review M-7 (follow-up, not blocking): shared/console-scope.js is ~1,900 lines, of which about 830 (buildScopeExpression, ~:744-1574) are one template string that becomes the in-page scope. ESLint and tsc never see that code as code, so typos, unused natives or a sloppy-mode slip are caught only by the unit/e2e suites. Proposal: move the scope body into its own source file (e.g. shared/console-scope-page.js, a strict function) that lint covers, and build it into the string at build time or read it with Function.prototype.toString of a module-local function in the worker (keeping the 'no page-realm call on XRAY objects' rules of C-1). Also consider splitting background.js (1,600+ lines; console section ~140-1260) into importScripts modules. Related sizes: shared/console-helpers.js 1,914; ConsoleEditor.tsx 1,035; consoleAssist.ts 1,500.

## Log
- 2026-10-22 11:17 claude: filed
