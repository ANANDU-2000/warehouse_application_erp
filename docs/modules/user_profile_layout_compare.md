# User profile `/settings/users/:userId` — LAYOUT compare (Step 2)

**Branch:** `ops/dashboard-module`  
**Sources:** `user_profile_page.dart` AppBar/TabBar; `user_profile_header.dart`; `HexaColors`

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Page bg brandBackground | `#F7F9F6` | same | PASS |
| 2 | AppBar bg brandBackground (not white) | Yes | same | PASS |
| 3 | Title “User profile” | AppBar | `USER_PROFILE_TITLE` | PASS |
| 4 | Inert back icon | IconButton | SVG + `pointer-events: none` | PASS |
| 5 | Header avatar circle brand tint | radius 26 | 52px circle `0.15` alpha | PASS |
| 6 | Header muted name + pills chrome | live text later | bars / pills **no data** | PASS |
| 7 | Admin Edit user + More chrome | canAdmin | `sessionCanAdminUsers` inert | PASS |
| 8 | TabBar surface + elevation | Material surface | white + border/shadow | PASS |
| 9 | Selected tab brandPrimary | Overview | `--selected` + `#0E4F46` | PASS |
| 10 | Unselected tab secondary | textSecondary | `#5C6578` | PASS |
| 11 | Tab body surface | TabBarView area | white | PASS |
| 12 | Slot order + manage gate | SCAFFOLD | unchanged | PASS |
| 13 | Fields / onClick / API | Yes | **Deferred** | N/A |

**Smoke:** `npm run test:user-profile-layout` (+ scaffold PASS); `npm run build` PASS.

**Rollback:** Revert LAYOUT commit; restore SCAFFOLD page/CSS; remove this compare + script; boards → ask before LAYOUT.

**Next (ask first):** `/settings/users/:userId` FIELDS — done → [`user_profile_fields_compare.md`](user_profile_fields_compare.md). Ask before BUTTONS.
