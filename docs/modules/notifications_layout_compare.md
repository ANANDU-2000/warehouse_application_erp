# Notifications `/notifications` — LAYOUT compare (Step 2)

**Branch:** `ops/dashboard-module`  
**Sources:** `notifications_page.dart` AppBar / search / `_FilterChip`; `notification_alert_card.dart` row chrome; `HexaColors`

## Task board

| State | Step |
|---|---|
| ✅ Completed | SCAFFOLD · LAYOUT · FIELDS · **BUTTONS** |
| 🟡 Current | BUTTONS PASS — ask before **WIRE** |
| ⬜ Pending | WIRE→COMPARE · other Subagent 4 stubs |
| ⏸ Deferred | Settings hub; live list/API (WIRE) |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Page bg brandBackground | `#F7F9F6` | same | PASS |
| 2 | AppBar bg matches scaffold (not white) | adaptiveAppBarBg | `#F7F9F6` | PASS |
| 3 | Title weight 800 | titleLarge w800 | `font-weight: 800` | PASS |
| 4 | Inert back / clear / chips | IconButtons | `pointer-events: none` | PASS |
| 5 | Search Outline radius 12 + hint grey | InputDecoration | `#E5E7EB` / `#9CA3AF` + icon | PASS |
| 6 | Selected chip `primaryMid` + white | HexaColors.primaryMid | `#159A8A` + white | PASS |
| 7 | Unselected chip surface container | surfaceContainerHighest | `#EFF2F1` + muted | PASS |
| 8 | Chip radius 20 / pad 14×8 | `_FilterChip` | same | PASS |
| 9 | List alert-card chrome (priority 4px + icon + bars) | card shape | inert shells ×2 | PASS |
| 10 | Slot order SCAFFOLD | unchanged | unchanged | PASS |
| 11 | Search typing / filter select / API | Yes | **Deferred** FIELDS/BUTTONS/WIRE | N/A |

**Smoke:** `npm run test:notifications-layout` (+ scaffold PASS); `npm run build` PASS.

**Rollback:** Revert LAYOUT commit; restore SCAFFOLD page/CSS; remove this compare + script; boards → ask before LAYOUT.

**Next (ask first):** `/notifications` FIELDS — done → [`notifications_fields_compare.md`](notifications_fields_compare.md). BUTTONS — done → [`notifications_buttons_compare.md`](notifications_buttons_compare.md). Ask before WIRE.
