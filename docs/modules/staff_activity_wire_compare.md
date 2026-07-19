# Staff activity `/staff/activity` — WIRE compare (Step 5)

**Branch:** `ops/dashboard-module`  
**Sources:** `staff_activity_page.dart` — `staffActivityLogProvider` / `listActivityLog(period)`; `_staffActivityLabel` / `_timeAgo` / `DateFormat.MMMd().add_Hm()`; ListTile no `onTap`

## Task board

| State | Step |
|---|---|
| ✅ Completed | Staff low-stock COMPARE · Staff activity SCAFFOLD → **WIRE** |
| 🟡 Current | `/staff/activity` **WIRE PASS** — ask before STATES |
| ⬜ Pending | STATES → COMPARE · other Subagent 4 stubs |
| ⏸ Deferred | ListSkeleton / HexaErrorCard polish · purchase entry · barcode/print · receive · Settings · merge to `main` |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | `GET …/activity-log?period=&page=1&per_page=50` | `listActivityLog` | `fetchStaffActivityLog` | PASS |
| 2 | Period today / week / month refetch | provider watch | `useEffect([period])` | PASS |
| 3 | `_staffActivityLabel` map | Exact cases | `staffActLabel` | PASS |
| 4 | `_timeAgo` incl. `d ago` & MMMd fallback | Page helper | `staffActTimeAgo` | PASS |
| 5 | Trailing `MMMd().add_Hm()` stamp | Yes | `staffActWhenStamp` | PASS |
| 6 | Subtitle = `item_name` or empty | Yes | same | PASS |
| 7 | PURCHASE → cart avatar else history | `contains('PURCHASE')` | `staffActRowKind` | PASS |
| 8 | Empty copy | Exact | Exact | PASS |
| 9 | Rows display-only (no onTap) | ListTile | `data-interactive="false"` | PASS |
| 10 | Back + period chips | BUTTONS/FIELDS | same | PASS |
| 11 | Loading / error + Retry (basic) | AsyncValue | slots (STATES polishes) | PASS* |
| 12 | ListSkeleton (10) / HexaErrorCard map | Yes | **Deferred** STATES | N/A |

\*FriendlyLoadError / ListSkeleton polish deferred to STATES.

**Smoke:** `npm run test:staff-activity-wire` (+ scaffold→buttons PASS); `npm run build` PASS.

**Rollback:** Revert WIRE commit; restore BUTTONS sample deferred list; remove `staffActivityApi.ts` / `staffActivityFormat.ts` + this compare + wire script; boards → ask before WIRE.

**Next (ask first):** STATES — do not start until approved.
