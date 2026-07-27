# Staff deliveries `/staff/deliveries` — FIELDS compare (Step 3)

**Branch:** `ops/dashboard-module`  
**Sources:** `staff_pending_deliveries_page.dart` — **no** TextField / ChoiceChip / SegmentedButton; AppBar title + section `(count)` + global empty gate only

## Task board

| State | Step |
|---|---|
| ✅ Completed | Staff activity COMPARE · Staff deliveries SCAFFOLD → **FIELDS** |
| 🟡 Current | superseded — see [`staff_deliveries_buttons_compare.md`](staff_deliveries_buttons_compare.md) |
| ⬜ Pending | WIRE → COMPARE · other Subagent 4 stubs |
| ⏸ Deferred | back/scan/row handlers · trade-purchases grouping · ListSkeleton / FriendlyLoadError · receive body · barcode · purchase entry · Settings · merge to `main` |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | No search / filter / period inputs | none on page | none invented | PASS |
| 2 | AppBar title without count when total 0 | exact | `staffDelAppBarTitle(0)` | PASS |
| 3 | AppBar title `Pending deliveries (N)` when total > 0 | exact | `STAFF_DEL_TITLE_COUNTED` | PASS |
| 4 | Section order Dispatched → Arrived → Pending verification | exact | `STAFF_DEL_SECTION_ORDER` | PASS |
| 5 | Section heading `$title ($count)` | exact | `staffDelSectionHeading` | PASS |
| 6 | Global empty only when total == 0 | `if (data.total == 0)` | `staffDelShowEmptyAll` | PASS |
| 7 | Arrived title hot only when count > 0 | exact | `staffDelSectionTitleHot` | PASS |
| 8 | Client empty counts catalog | provider later | `STAFF_DEL_EMPTY_COUNTS` + `useState` | PASS |
| 9 | Section empty card when count == 0 | purchases.isEmpty | `count === 0` | PASS |
| 10 | Back / scan / row onTap | Yes | **Deferred** BUTTONS | N/A |
| 11 | trade-purchases fill counts | Yes | **Deferred** WIRE | N/A |

**Smoke:** `npm run test:staff-deliveries-fields` (+ scaffold→layout PASS); `npm run build` PASS.

**Rollback:** Revert FIELDS commit; restore LAYOUT page without helpers; remove `staffDeliveriesFields.ts` + fields script + this compare; boards → ask before FIELDS.

**Next (ask first):** BUTTONS — do not start until approved.
