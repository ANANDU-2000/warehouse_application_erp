# Staff search `/staff/search` — LAYOUT compare (Step 2)

**Branch:** `ops/dashboard-module`  
**Sources:** `search_page.dart` `_embeddedSearchTextField` / `_embeddedCategoryChips` / empty `q.isEmpty` Quick filters; `app_theme.dart` `chipTheme`; `HexaColors`

## Task board

| State | Step |
|---|---|
| ✅ Completed | Notifications COMPARE · Staff search SCAFFOLD · **LAYOUT** |
| 🟡 Current | Staff search **LAYOUT PASS** — ask before FIELDS |
| ⬜ Pending | FIELDS → BUTTONS → WIRE → STATES → COMPARE · other stubs |
| ⏸ Deferred | `/staff/settings` · `/settings`; owner `/search`; Recent chips (needs FIELDS store); API |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Page bg brandBackground | `#F7F9F6` | same | PASS |
| 2 | No AppBar (staff embedded) | Scaffold Column only | unchanged | PASS |
| 3 | Search radius 14 + filled surface + no border | OutlineInputBorder 14 / none | `border-radius: 14px; border: none` | PASS |
| 4 | Search hint `#9CA3AF` | HexaColors.inputHint | `--ss-hint` | PASS |
| 5 | Chip row height 52 / pad 16×6 / gap 8 | `_embeddedCategoryChips` | same | PASS |
| 6 | ChoiceChip selected `primaryContainer` | `#D8ECE8` + brandPrimary label | `--ss-chip-selected` + `--ss-brand` | PASS |
| 7 | ChoiceChip idle surface + outlineVariant | chipTheme | white + `#D7E7E3` / radius 12 | PASS |
| 8 | Empty: “Quick filters” w800 / 17 | titleSmall | `.staff-search-page__section-title` | PASS |
| 9 | Staff ActionChip labels ×6 | gallery…scan | `STAFF_SEARCH_QUICK_FILTERS` inert | PASS |
| 10 | Empty helper copy exact | staff helper string | `STAFF_SEARCH_EMPTY_HELPER` | PASS |
| 11 | Results pad top 4 / bottom 96 | staff `listPadding` | `4px 16px 96px` | PASS |
| 12 | Slot order SCAFFOLD | unchanged | + `empty` under results | PASS |
| 13 | Typing / chip select / QF nav / API | Yes | **Deferred** FIELDS/BUTTONS/WIRE | N/A |
| 14 | Recent + Clear (when recents nonempty) | Yes | **Deferred** FIELDS | N/A |

**Smoke:** `npm run test:staff-search-layout` (+ scaffold PASS); `npm run build` PASS.

**Rollback:** Revert LAYOUT commit; restore SCAFFOLD page/CSS/copy; remove quick-filters module + this compare + layout script; boards → ask before LAYOUT.

**Next (ask first):** `/staff/search` FIELDS — do not start until approved.
