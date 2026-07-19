# Staff deliveries `/staff/deliveries` — BUTTONS compare (Step 4)

**Branch:** `ops/dashboard-module`  
**Sources:** `staff_pending_deliveries_page.dart` — AppBar back; scan `push('/barcode/scan')`; ListTile `onTap` → `/staff/receive/${id}`

## Task board

| State | Step |
|---|---|
| ✅ Completed | Staff activity COMPARE · Staff deliveries SCAFFOLD → **BUTTONS** |
| 🟡 Current | `/staff/deliveries` **BUTTONS PASS** — ask before WIRE |
| ⬜ Pending | WIRE → COMPARE · other Subagent 4 stubs |
| ⏸ Deferred | trade-purchases grouping · ListSkeleton / FriendlyLoadError · receive **body** · barcode **body** · purchase entry · Settings · merge to `main` |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Back → pop or `/staff/home` | default AppBar / home | `onBack` + `popOrGo` | PASS |
| 2 | Scan → `/barcode/scan` | `context.push` | `onScan` → `STAFF_DEL_SCAN_PATH` | PASS |
| 3 | Row → `/staff/receive/:id` | ListTile onTap | `onOpenReceive` + `staffDelReceivePath` | PASS |
| 4 | Title/count gates still FIELDS | exact | same helpers | PASS |
| 5 | Sample row until API | N/A | `data-sample="buttons"` · `data-deferred="delivery-rows"` | PASS |
| 6 | No live trade-purchases fetch | Yes | **Deferred** WIRE | N/A |
| 7 | Receive / barcode page bodies | Full Flutter | stubs (backend blocked) | N/A |

**Smoke:** `npm run test:staff-deliveries-buttons` (+ scaffold→fields PASS); `npm run build` PASS.

**Rollback:** Revert BUTTONS commit; restore FIELDS deferred back/scan/rows; remove buttons script + this compare; boards → ask before BUTTONS.

**Next (ask first):** WIRE — do not start until approved.
