# Splash UI — LAYOUT compare (Step 2)

**Branch:** `phase4/login-scaffold`  
**Source:** `splash_page.dart` (chrome + fade; no `_boot`)

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Logo `app_logo.png` in 96×96 box | `assets/images/app_logo.png` | `/brand/app_logo.png` | PASS |
| 2 | Image clip r≈22 / contain | `ClipRRect` 22 | `border-radius: 22px` | PASS |
| 3 | Logo error → warehouse icon | `Icons.warehouse_rounded` | SVG `onError` | PASS |
| 4 | Fade 800ms easeOut | `AnimationController` + `Curves.easeOut` | `splash-fade` 800ms ease-out | PASS |
| 5 | Gap tagline→spinner 48 | `SizedBox(height: 48)` | `margin-top: 48px` | PASS |
| 6 | Spinner 24×24 stroke 2.5 white α0.8 | when `_busy` | static ring (visual only) | PASS |
| 7 | Retry / Use another account | Yes | **Deferred BUTTONS** | N/A |
| 8 | `_boot` / restore / API | Yes | **Deferred WIRE** | N/A |

**Rollback:** Revert LAYOUT commit; delete `public/brand/app_logo.png`; keep SCAFFOLD shell.
