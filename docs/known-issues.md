# Known issues

Logic bugs confirmed by executing the code, not by reading it.

**The 21 bugs this file used to list are fixed.** They were found while building the unit
suite and recorded here rather than changed, because altering product behaviour was out of
scope for that work. They have since been fixed as a batch; each one's test now describes
the corrected behaviour and carries a `FIXED` marker naming what the old behaviour was, so
the record of the defect survives in the assertion rather than in this file. See
`CHANGELOG.md` for the list.

Security findings live separately in [threat-model.md](threat-model.md).

What remains below is the part that was never a bug list: behaviours that are surprising
but deliberate, and one property that was suspected and cleared.

---

## Behaviours worth knowing (characterized, not necessarily wrong)

- `tokenizeEntry` returns `[]` for any entry type other than `api` or `log`, so **WebSocket
  and GraphQL frames are captured but can never match a search query**.
- A request with `status: 0` (blocked or aborted) contributes no status token and is
  unsearchable by status.
- `searchEntries` trusts a stale `_searchTokens` cache absolutely; the live entry is never
  consulted.
- `buildMock` rewrites a genuine `status: 0` to `200`, so a replayed mock claims success
  for a request that never completed.
- `store.clear()` reports success and deletes nothing when the storage call rejects —
  relevant because the BYOK API key lives behind it.

---

## Verified as *not* a bug

`drift.detectDrift`'s indexed and backwards-scan code paths were property-tested against
each other across 400 randomized histories, asserting both drift and non-drift outcomes
occur so the property is not vacuous. They agree. They diverge only when the caller passes
a stale index, which is a caller contract rather than a defect in the function.
