# Staff search `/staff/search` — BUTTONS compare (Step 4)

**Branch:** `ops/dashboard-module`  
**Sources:** `search_page.dart` staffShellEmbedded Quick filters `ActionChip` `onPressed` (push / go)

## Task board

| State | Step |
|---|---|
| ✅ Completed | Notifications COMPARE · Staff search SCAFFOLD · LAYOUT · FIELDS · BUTTONS · **WIRE** |
| 🟡 Current | Staff search **WIRE PASS** — ask before STATES |
| ⬜ Pending | STATES → COMPARE · other stubs |
| ⏸ Deferred | `/staff/settings` · `/settings`; owner `/search`; TradeIntel full fact-rich tile polish (STATES) |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Item gallery → push `/staff/items` | Yes | `nav: push` | PASS |
| 2 | Missing barcode → push `?filter=missing_barcode` | Yes | same | PASS |
| 3 | Missing item code → push `?filter=missing_code` | Yes | same | PASS |
| 4 | Opening stock → push `/stock/opening-setup` | Yes | same | PASS |
| 5 | Low stock → push `/staff/low-stock` | staff path | same | PASS |
| 6 | Scan barcode → **go** `/staff/scan` | `context.go` | `navigate(..., { replace: true })` | PASS |
| 7 | QF chips interactive | onPressed | `action-chip--active` + onClick | PASS |
| 8 | Stub routes exist for QF targets | Yes | router stubs | PASS |
| 9 | AppBar back | None (staff embedded) | none | PASS |
| 10 | Result-row / catalog item / bill taps | Yes | **Deferred** WIRE | N/A |
| 11 | GET unified search API | Yes | **Deferred** WIRE | N/A |

**Smoke:** `npm run test:staff-search-buttons` (+ scaffold/layout/fields PASS); `npm run build` PASS.

**Rollback:** Revert BUTTONS commit; restore FIELDS `aria-disabled` QF chips; remove `nav` modes + this compare + script; boards → ask before BUTTONS.

**Next (ask first):** `/staff/search` WIRE — done → [`staff_search_wire_compare.md`](staff_search_wire_compare.md). Ask before STATES.
