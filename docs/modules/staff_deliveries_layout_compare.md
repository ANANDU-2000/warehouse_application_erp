# Staff deliveries `/staff/deliveries` — LAYOUT compare (Step 2)

**Branch:** `ops/dashboard-module`  
**Sources:** `staff_pending_deliveries_page.dart` · `HexaColors` · ListView `fromLTRB(16, 8, 16, 88)` · Card radius 12 · Arrived `0xFFE65100`

## Task board

| State | Step |
|---|---|
| ✅ Completed | Staff activity COMPARE · Staff deliveries SCAFFOLD → **LAYOUT** |
| 🟡 Current | superseded — see [`staff_deliveries_fields_compare.md`](staff_deliveries_fields_compare.md) |
| ⬜ Pending | BUTTONS → COMPARE · other Subagent 4 stubs |
| ⏸ Deferred | back/scan/row handlers · trade-purchases grouping · ListSkeleton / FriendlyLoadError · receive body · barcode · purchase entry · Settings · merge to `main` |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Page bg `#F7F9F6` | brandBackground | `--sd-bg` | PASS |
| 2 | AppBar fg brandPrimary `#0E4F46` | AppBar foregroundColor | title/actions | PASS |
| 3 | Toolbar ~56 | Material AppBar | `--sd-toolbar: 56px` | PASS |
| 4 | Body pad 16 / 8 / 16 / 88 | ListView padding | gutter + bottom 88 | PASS |
| 5 | Section gap 16 | `SizedBox(height: 16)` | `--sd-section-gap: 16px` | PASS |
| 6 | brandBorder `#E2E8E6` | HexaColors | `--sd-border` | PASS |
| 7 | brandAccent token | HexaColors | `--sd-accent` | PASS |
| 8 | Empty Card pad 14 · radius 12 | Card | `.staff-del-section__empty` | PASS |
| 9 | Row radius 12 · white · border | Material shape | `.staff-del-row` | PASS |
| 10 | Avatar 36 · brandPrimary @10% | CircleAvatar r18 | `rgba(14,79,70,0.1)` | PASS |
| 11 | Supplier title w800 | ListTile title | `.staff-del-row__title` | PASS |
| 12 | Bags label 11 muted | HexaDsType.label(11) | `.staff-del-row__bags` | PASS |
| 13 | Index w900 11 muted `#64748B` | trailing | `.staff-del-row__index` | PASS |
| 14 | Qty w800 | trailing | `.staff-del-row__qty` | PASS |
| 15 | Arrived hot `#E65100` when count > 0 | exact | `--sd-highlight` + `--hot` | PASS |
| 16 | Empty-all body 15 muted | HexaDsType.body(15) | `.staff-del-empty-all__text` | PASS |
| 17 | Controls inert | N/A SCAFFOLD | `pointer-events: none` | PASS |
| 18 | Back / scan / receive / API | Yes | **Deferred** BUTTONS/WIRE | N/A |

**Smoke:** `npm run test:staff-deliveries-layout` (+ scaffold PASS); `npm run build` PASS.

**Rollback:** Revert LAYOUT commit; restore SCAFFOLD page/CSS; remove layout script + this compare; boards → ask before LAYOUT.

**Next (ask first):** FIELDS — do not start until approved.
