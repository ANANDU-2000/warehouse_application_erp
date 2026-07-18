# 05 — Navigation Map (Confirmed from `core/router/app_router.dart`)

> Source: `flutter_app/lib/core/router/app_router.dart` (1,374 lines), cross-checked with `grep` for dead imports. This resolves Phase 1.8 and the orphan-module question from `03_Module_Inventory.md`.

## Top-level finding: TWO separate shells, not one

The app has two distinct `StatefulShellRoute` navigation structures — an **Owner/Manager shell** and a **Staff shell** — each with its own `NavigationRail` (desktop) / bottom nav (mobile) branches. This is a real architectural fact, not a guess, and it changes the React routing design: you need two separate authenticated layouts, gated by role, not one shell with conditional menu items.

### Owner/Manager shell — branches (rail destinations)
| Branch path | Feature module |
|---|---|
| `/home` | `features/home/` (owner dashboard) |
| `/stock` | `features/stock/` |
| `/reports` | `features/reports/` |
| `/purchase` | `features/purchase/` |
| `/search` | `features/search/` |

Sub-routes nested under `/home`: `activity`, `breakdown-more`.
Sub-routes nested under `/stock`: `changes` (also appears under staff — see below, needs confirmation whether it's the same page reused or a distinct one).

### Staff shell — branches (separate rail)
| Branch path | Feature module |
|---|---|
| `/staff/home` | `features/staff/` |
| `/staff/stock` | `features/staff/` or `features/stock/` shared (sub: `changes`) |
| `/staff/scan` | `features/barcode/` (shared) |
| `/staff/search` | `features/search/` (shared) |
| `/staff/deliveries` | `features/staff/` (pending deliveries) |
| `/staff/tasks` | `features/staff/` / `features/operations/` |

**This confirms the README's "Owner, manager, staff" role framing has real UI consequences** — staff get an entirely different navigation shell, not just hidden buttons. For `17_Roles_and_Permissions.md`, this means role-gating happens at the **route/shell level**, not just the button/field level — important for how you structure React route guards.

## Dead code confirmed
- `features/dashboard/home_page.dart` — **zero imports anywhere in the codebase.** `GoRoute(path: '/dashboard', redirect: (_, __) => '/home')` — the path exists only as a redirect to the real `/home`. **Do not port this file.** Flagged for `46_Missing_Features.md`/`45_Technical_Debt.md` as confirmed-dead, not "unknown."
- `GoRoute(path: '/history', redirect: (_, __) => '/purchase')` — same pattern, another redirect-only legacy path. Whatever `features/item/`'s `history` naming implied historically, the live route is `/purchase`.

## Confirmed-live "orphan" modules (not dead — just small)
| Module | Route(s) | Page class |
|---|---|---|
| `features/item/` | `/catalog/item/:itemId/purchase-history` (or similar — exact param route at line ~594) | `ItemHistoryPage` |
| `features/supplier/` | `/supplier/:supplierId/ledger` | `SupplierLedgerPage` |
| `features/broker/` | `/broker/:brokerId/ledger` | `BrokerHistoryPage` |

## Full route table (path → page, top-level, non-nested routes only)

| Path | Destination | Notes |
|---|---|---|
| `/` | (root — needs opening to confirm, likely auth-gate redirect) | |
| `/splash` | Splash page | |
| `/get-started` | Onboarding? | Not yet opened |
| `/login` | Login page | |
| `/forgot-password` | Forgot password | |
| `/reset-password` | Reset password | |
| `/dashboard` | **redirect → `/home`** | dead route alias |
| `/history` | **redirect → `/purchase`** | dead route alias |
| `/contacts` | ContactsPage (tabbed — supports `?tab=` query param) | |
| `/catalog` | CatalogPage | |
| `/scan/:token` | **redirect → `/item/:token`** | |
| `/item/:lookupKey` | PublicItemScanPage | Public QR lookup — matches `/public/items/*` backend routes |
| `/barcode/scan`, `/scan-history`, `/audit-session`, `/audit-summary`, `/print/:itemId`, `/bulk-print` | Barcode module pages | |
| `/catalog/missing-codes`, `/catalog/item/create`, `/catalog/quick-add-from-scan`, `/catalog/quick-add`, `/catalog/setup-reorder-levels`, `/catalog/taxonomy`, `/catalog/new-category`, `/catalog/category/:id/new-subcategory`, `/catalog/category/:id/type/:tid/add-item`, `/catalog/item/:id`, `/catalog/item/:id/edit`, `/catalog/item/:id/timeline`, `/catalog/item/:id/purchase-history`, `/catalog/item/:id/ledger`, `/catalog/category/:id`, `/catalog/category/:id/type/:tid`, `/catalog/duplicates` | Catalog module — deep, hierarchical (category → type → item) | |
| `/stock/missing-barcodes`, `/stock/movement`, `/stock/changes`, `/stock/reorder-suggestions`, `/stock/reorder`, `/stock/opening-setup`, `/stock/staff-purchases`, `/stock/low-stock`, `/stock/today-feed`, `/stock/intelligence/:itemId`, `/stock/:itemId/history`, `/stock/dead`, `/stock/fast-moving`, `/stock/slow-moving` | Stock module — many specialized list views | |
| `/supplier/:id`, `/supplier/:id/ledger`, `/supplier/:id/batch-items`, `/broker/:id`, `/broker/:id/ledger`, `/contacts/category`, `/item-analytics/:itemKey` | Contacts/analytics deep links | |
| `/settings`, `/settings/business`, `/settings/backup`, `/settings/help`, `/settings/users`, `/settings/users/:userId` | Settings module | |
| `/staff/receive`, `/staff/receive/:purchaseId`, `/staff/low-stock`, `/staff/items`, `/staff/settings`, `/staff/purchase-history`, `/staff/activity`, `/staff/purchase-history/:purchaseId` | Staff module (non-shell deep pages) | |
| `/entries`, `/analytics` | Not yet resolved — likely legacy, needs opening | |
| `/purchase/new`, `/purchase/scan`, `/purchase/scan-draft`, `/purchase/edit/:id`, `/purchase/detail/:id` | Purchase module | |
| `/contacts/supplier/new`, `/suppliers/quick-create`, `/brokers/quick-create` | Quick-create flows | |
| `/notifications` | Notifications page | |
| `/operations/usage`, `/operations/checklist`, `/operations/owner-tasks` | Operations module | |
| `/reports/item/:catalogItemId`, `/reports/purchase/:purchaseId`, `/reports/item-detail` | Reports drill-down | |

## Still unresolved (need to open code, not guess)
- Exact widget/page class for: `/`, `/get-started`, `/entries`, `/analytics` — filenames suggest legacy (`entries` was called out in the README as the **old**, non-trade-based reporting source — "not legacy entries analytics" — so `/entries` route likely predates the trade-based rebuild and needs a live/dead determination like `/dashboard` got).
- Whether `/stock/changes` (owner) and the nested `changes` under `/staff/stock` are the same page instance or two different ones.
- Full role-guard logic — *which* routes check `MembershipRole`/`permissions_json` and how (needs `core/auth/` review, not yet done).

## What this changes about the plan

Phase 1.7 wireframe docs should be written **per confirmed route**, not per feature folder — folders don't map 1:1 to pages, as `dashboard/` (dead), `catalog/` (13+ routes from one folder), and `item/`+`supplier/`+`broker/` (one route each, legitimately) all demonstrate. I'll update the wireframe plan's page inventory to be route-driven before writing any per-page doc.
