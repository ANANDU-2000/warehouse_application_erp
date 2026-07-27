# Owner `/home` — LAYOUT compare (Step 2)

**Branch:** `ops/dashboard-module`  
**Sources:** `home_compact_header.dart`; `HexaOp` gutters; `HexaColors.brandPrimary`

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Page bg operational (not auth mint) | Hexa surface | `#F7F9F6` | PASS |
| 2 | Header height ~48 | Yes | CSS 48px | PASS |
| 3 | Avatar brandPrimary α0.12 + initial | Yes | `.home-page__avatar` | PASS |
| 4 | Title + code + OWNER chip | Session-driven | Static Warehouse / WH-0000 / OWNER | PASS (LAYOUT) |
| 5 | Synced green `#2E7D32` | Online state | Static Synced | PASS |
| 6 | Bell/settings icons | Navigate | Inert (no handlers) | PASS |
| 7 | Section cards r12 white border | Card chrome | `.home-page__card` | PASS |
| 8 | Period strip chrome only | Chips later | Muted bar, no chips | PASS |
| 9 | API / KPI values | Yes | **Deferred** | N/A |

**Rollback:** Revert LAYOUT commit; restore SCAFFOLD dashed slots.
