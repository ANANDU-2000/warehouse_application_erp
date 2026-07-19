# Notifications `/notifications` — BUTTONS compare (Step 4)

**Branch:** `ops/dashboard-module`  
**Sources:** `notifications_page.dart` AppBar back / mark-all / clear dialog / empty CTAs

## Task board

| State | Step |
|---|---|
| ✅ Completed | SCAFFOLD · LAYOUT · FIELDS · BUTTONS · **WIRE** |
| 🟡 Current | WIRE PASS — ask before **STATES** |
| ⬜ Pending | STATES→COMPARE · other Subagent 4 stubs |
| ⏸ Deferred | Purchase-due synthetics; Approve/Review; STATES polish |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Back → popOrGo `/home` | Yes | `popOrGo` + `NOTIFICATIONS_BACK_FALLBACK` | PASS |
| 2 | Mark all read when hasUnread | Yes | gated + stub handler | PASS* |
| 3 | Clear disabled when server empty | Yes | `clearDisabled` | PASS |
| 4 | Clear dialog title/body/Cancel/Clear | AlertDialog exact | exact copy constants | PASS |
| 5 | Clear confirm API | `clearAllAppNotifications` | **no fetch** stub | PASS (WIRE) |
| 6 | Empty CTA staff → `/staff/receive` | Yes | `NOTIFICATIONS_CTA_PATH_STAFF` | PASS |
| 7 | Empty CTA owner → `/purchase/new` | Yes | `NOTIFICATIONS_CTA_PATH_OWNER` | PASS |
| 8 | Show all alerts | setState all | already FIELDS | PASS |
| 9 | Live list / mark-all API / invalidate | Yes | **Deferred** | N/A |

\*With empty local feed, Mark all read stays hidden (Flutter `if (hasUnread)`).

**Smoke:** `npm run test:notifications-buttons` (+ scaffold/layout/fields PASS); `npm run build` PASS.

**Rollback:** Revert BUTTONS commit; restore FIELDS inert AppBar + aria-disabled CTA; remove clear dialog CSS/copy + this compare + script; boards → ask before BUTTONS.

**Next (ask first):** `/notifications` WIRE — done → [`notifications_wire_compare.md`](notifications_wire_compare.md). Ask before COMPARE.
