# Staff activity `/staff/activity` — LAYOUT compare (Step 2)

**Branch:** `ops/dashboard-module`  
**Sources:** `staff_activity_page.dart` · `HexaColors` · `HexaDsLayout` (`pageGutter` 24 · `sectionGap` 24)

## Task board

| State | Step |
|---|---|
| ✅ Completed | Staff low-stock COMPARE · Staff activity SCAFFOLD → **FIELDS** |
| 🟡 Current | `/staff/activity` **FIELDS PASS** — ask before BUTTONS |
| ⬜ Pending | BUTTONS → COMPARE · other Subagent 4 stubs |
| ⏸ Deferred | listActivityLog API · ListSkeleton / HexaErrorCard · purchase entry · barcode/print · receive · Settings · merge to `main` |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Page bg `#F7F9F6` | theme / brandBackground | `--sa-bg` | PASS |
| 2 | Title onSurface `#0F172A` w800 · ~20 | `titleLarge` w800 | `.staff-act-appbar__title` | PASS |
| 3 | AppBar toolbar ~56 | Material AppBar | `--sa-toolbar: 56px` | PASS |
| 4 | Body gutter 24 | `HexaDsLayout.pageGutter` | `--sa-gutter: 24px` | PASS |
| 5 | Body vertical sectionGap 24 | `HexaDsLayout.sectionGap` | `--sa-section-gap: 24px` | PASS |
| 6 | brandPrimary `#0E4F46` | HexaColors | `--sa-brand` | PASS |
| 7 | brandAccent `#159A8A` token | HexaColors | `--sa-accent` | PASS |
| 8 | brandBorder `#E2E8E6` | HexaColors | `--sa-border` | PASS |
| 9 | Segment unselected `#F1F5F4` / fg `#334155` | Material SegmentedButton | `--sa-tab` / `--sa-tab-fg` | PASS |
| 10 | Segment selected `#065F46` + white | selected style | `--sa-tab-selected` | PASS |
| 11 | Periods inert (`pointer-events: none`) | N/A | `--inert` | PASS |
| 12 | Empty icon outline chrome | `Icons.history_rounded` 48 | `.staff-act-empty__icon` | PASS |
| 13 | Empty title 16 w800 · sub bodySmall muted | exact | empty styles | PASS |
| 14 | Row avatar 36 · brandPrimary @12% | CircleAvatar r18 | `rgba(14,79,70,0.12)` | PASS |
| 15 | Row title w700 · ago labelSmall w700 · when 10 muted | ListTile | `.staff-act-row*` | PASS |
| 16 | Divider / row separator | Divider height 1 | border-bottom | PASS |
| 17 | History vs purchase avatar kinds | icon branch | `data-kind` + avatar modifiers | PASS |
| 18 | Period onSelectionChanged / API / skeleton | Yes | **Deferred** FIELDS/WIRE/STATES | N/A |

**Smoke:** `npm run test:staff-activity-layout` (+ scaffold PASS); `npm run build` PASS.

**Rollback:** Revert LAYOUT commit; restore SCAFFOLD page/CSS; remove layout script + this compare; boards → ask before LAYOUT.

**Next (ask first):** FIELDS done — [`staff_activity_fields_compare.md`](staff_activity_fields_compare.md). Ask before BUTTONS.
