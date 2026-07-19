# Catalog hub `/catalog` — STATES compare (Step 6)

**Branch:** `ops/products-module`  
**Sources:** `catalog_page.dart` (`ListSkeleton()` / `FriendlyLoadError`); `list_skeleton.dart` defaults 6×84; `friendly_load_error.dart` (`Unable to load data` / `Tap to retry.`)

## Task board

| State | Step |
|---|---|
| ✅ Completed | Catalog SCAFFOLD → … → STATES · **COMPARE** |
| 🟡 Current | superseded — see [`catalog_compare.md`](catalog_compare.md) |
| ⬜ Pending | `/catalog/taxonomy` SCAFFOLD · other catalog routes |
| ⏸ Deferred | pull gesture · keepAlive · purchase entry · barcode/print · receive · Settings · merge to `main` |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Cold load ListSkeleton 6 × 84 | default ListSkeleton | `CATALOG_SKELETON_*` | PASS |
| 2 | Error title `Unable to load data` | FriendlyLoadError default | `mapCatalogLoadTitle` | PASS |
| 3 | Subtitle `Tap to retry.` | kFriendlyLoadNetworkSubtitle | `mapCatalogLoadSubtitle` | PASS |
| 4 | Retry refetches lists | invalidate providers | `retryLoad` / `retryTick` | PASS |
| 5 | AppBar stays during load/error | Scaffold | same | PASS |
| 6 | Skeleton only when !hasData + loading | AsyncValue | `showInitialSkeleton` | PASS |
| 7 | Error only when !hasData + error | exact | `showError` | PASS |
| 8 | No raw exception in cold error UI | FriendlyLoadError | mapped title/subtitle | PASS |
| 9 | Soft reload keeps body when hasData | skipLoadingOnReload | hasData gate | PASS |
| 10 | Empty catalogs | exact | unchanged | PASS |
| 11 | Pull RefreshIndicator gesture | Yes | **Deferred** (retry covers) | N/A |

## Smoke

```bash
cd new-app/frontend
npm run test:catalog-states
npm run build
```

## Rollback

Revert STATES commit; restore WIRE `Loading…` / plain error; remove `catalogLoadSubtitle.ts` + states script + this compare; boards → ask before STATES.

**Next (ask first):** COMPARE — done → [`catalog_compare.md`](catalog_compare.md). Ask before `/catalog/taxonomy` SCAFFOLD.
