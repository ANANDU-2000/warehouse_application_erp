# 06 — Master Page Build Order

**Status:** Reference (2026-07-18)  
**Source routes:** [`05_Navigation_Map.md`](05_Navigation_Map.md) (~**101** unique paths from `app_router.dart` — not 180; param-variant duplicates may collapse to ~90–95 screens when built)  
**Rule:** A page cannot start until its **backend module** is built and `docs/modules/<x>.md` exists.  
**Page loop:** [`FRONTEND_PAGE_BUILD_LOOP.md`](FRONTEND_PAGE_BUILD_LOOP.md)

---

## 1. Module sequence (backend-gated)

| Seq | Module | Routes (approx) | Doc ready | Backend ready | Unlocked for UI? |
|---|---|---|---|---|---|
| 1 | Login/Auth | 5 | ✅ `login.md` | ✅ login/refresh + me/businesses | Login COMPARE PASS · Splash **7 COMPARE** |
| 2 | Dashboard/Home | 2+ | ✅ `dashboard.md` | 🟡 WIRE-2 · Staff stock LAYOUT | Next: ask before FIELDS — [`staff_stock_layout_compare.md`](modules/staff_stock_layout_compare.md) |
| 3 | Users & Roles | 2 | ✅ `users-roles.md` | 🟡 list+profile COMPARE · Activity WIRE | Next: ask next Subagent 4 stub — [`dashboard_subagent4_inventory.md`](modules/dashboard_subagent4_inventory.md) |
| 4 | Products/Catalog | 19 | ✅ `products.md`, `categories.md` | ❌ | Blocked |
| 5 | Categories | 1 | ✅ `categories.md` | ❌ | Blocked |
| 6 | Suppliers/Brokers | 12 | ✅ `suppliers.md` | ❌ | Blocked |
| 7 | Purchase Orders | 6 | ✅ `purchase-orders.md` | ❌ | Blocked |
| 8 | Goods Receipt (staff receive) | 2 | ✅ `goods-receipt.md` | ❌ | Blocked |
| 9 | Inventory/Stock | 15 | ✅ `inventory.md` | ❌ | Blocked |
| 10 | Stock Movement | 2 | ✅ `stock-movement.md` | ❌ | Blocked |
| 11 | Barcode | 7 | Covered in inventory/goods-receipt? — **verify** | ❌ | Blocked |
| 12 | Reports | 5 | ✅ `reports.md` | ❌ | Blocked |
| 13 | Settings (business/backup/help) | 4+ | ✅ `settings.md` | ❌ | Blocked |
| 14 | Staff shell (other) | 11 | Partial — **confirm ownership** | ❌ | Blocked |
| 15 | Operations | 3 | **verify** which doc owns | ❌ | Blocked |
| 16 | Notifications | 1 | **verify** doc ownership | ❌ | Blocked |
| 17 | Item public/history | 2 | Covered in `products.md`? — **verify** | ❌ | Blocked |
| 18 | Search | 1 | **verify** | ❌ | Blocked |
| — | Dead aliases | 4 | ✅ redirects in `05` | — | **Do not build** |
| — | Root `/` | 1 | — | — | Redirect → `/splash` (SCAFFOLD) |

---

## 2. Per-module loop

```
FOR each module in order:
  1. Backend: repository → service → controller → routes → tests (spec = docs/modules/<x>.md)
  2. Verify endpoints vs docs/18_API_Inventory.md
  3. Frontend per route: SCAFFOLD → LAYOUT → FIELDS → BUTTONS → WIRE API → STATES → COMPARE PASS/FAIL
  4. Update docs/00_MASTER_CHECKLIST.md
  5. Next module — do not parallelize
```

Login UI: **COMPARE PASS**. Splash: **7 COMPARE PASS**. Dashboard `/home`+`/staff/home`+`/home/activity`+`/home/breakdown-more` COMPARE PASS. Staff **WIRE-2a–2f COMPLETE**. Users list+profile **COMPARE PASS**. Profile Activity **WIRE PASS**. Subagent 4: `/notifications` **COMPARE PASS**. Staff search **COMPARE PASS**. Staff items **COMPARE PASS**. Staff stock **LAYOUT PASS**. Next: ask before **FIELDS**.

---

## 3. SQL / pool note for implementers

Live local SQL uses the pool wired in [`new-app/backend/src/index.ts`](../new-app/backend/src/index.ts) (`connect()` + real repos). On Windows, default driver is **`msnodesqlv8`** (ODBC) when TCP is off — see [`docs/44_Local_SQL_Bootstrap.md`](44_Local_SQL_Bootstrap.md). Do not invent a second connection path per module.

---

## 4. Dead aliases (do not build as pages)

| Path | Behavior (from `05`) |
|---|---|
| `/dashboard` | redirect → `/home` |
| `/history` | redirect → `/purchase` |
| `/scan/:token` | redirect → `/item/:token` |
| `/entries` | Unknown — needs opening; treat as **do not build** until confirmed live |

---

## 5. Route buckets (from `05_Navigation_Map.md` only)

### Seq 1 — Login/Auth

| Path | Notes |
|---|---|
| `/splash` | **Step 7 COMPARE PASS** |
| `/login` | **COMPARE PASS** |
| `/forgot-password` | Stub only (full page later) |
| `/home` | **COMPARE PASS** (owner) — see Seq 2 |
| `/staff/home` | **COMPARE PASS** (in-scope) — see Seq 2 |
| `/reset-password` | Later |
| `/get-started` | Unknown — needs opening (likely redirect to login) |

Backend (wire in later steps): `POST /v1/auth/login`, `POST /v1/auth/refresh`, `GET /v1/me/businesses`.

### Seq 2 — Dashboard/Home

| Path | Notes |
|---|---|
| `/home` | Owner dashboard |
| `/home/activity` | Nested under `/home` — **Step 7 COMPARE PASS** |
| `/home/breakdown-more` | Nested under `/home` — **Step 7 COMPARE PASS** |
| `/staff/home` | **COMPARE PASS** + WIRE-2a–**2f COMPLETE** |

### Seq 3 — Users & Roles

| Path | Notes |
|---|---|
| `GET /v1/businesses/:businessId/users` | Backend Slice 1 **PASS** — [`users_roles_backend_list_compare.md`](modules/users_roles_backend_list_compare.md) |
| `POST /v1/businesses/:businessId/users` | Backend Slice 2 **PASS** — [`users_roles_backend_create_compare.md`](modules/users_roles_backend_create_compare.md) |
| `GET /v1/businesses/:businessId/users/:userId` | Backend Slice 3 **PASS** — [`users_roles_backend_profile_compare.md`](modules/users_roles_backend_profile_compare.md) |
| `PATCH /v1/businesses/:businessId/users/:userId` | Backend Slice 4 **PASS** — [`users_roles_backend_patch_compare.md`](modules/users_roles_backend_patch_compare.md) |
| `DELETE /v1/businesses/:businessId/users/:userId` | Backend Slice 5 **PASS** — [`users_roles_backend_delete_compare.md`](modules/users_roles_backend_delete_compare.md) |
| `/settings/users` | Users list UI — **COMPARE PASS** — [`users_management_compare.md`](modules/users_management_compare.md) |
| `/settings/users/:userId` | User profile — **COMPARE + Activity WIRE PASS** — [`user_profile_activity_wire_compare.md`](modules/user_profile_activity_wire_compare.md) |

### Seq 4 — Products/Catalog

| Path | Notes |
|---|---|
| `/catalog` | CatalogPage |
| `/catalog/missing-codes` | |
| `/catalog/item/create` | |
| `/catalog/quick-add-from-scan` | |
| `/catalog/quick-add` | |
| `/catalog/setup-reorder-levels` | |
| `/catalog/taxonomy` | |
| `/catalog/new-category` | |
| `/catalog/category/:id/new-subcategory` | |
| `/catalog/category/:id/type/:tid/add-item` | |
| `/catalog/item/:id` | |
| `/catalog/item/:id/edit` | |
| `/catalog/item/:id/timeline` | |
| `/catalog/item/:id/purchase-history` | |
| `/catalog/item/:id/ledger` | |
| `/catalog/category/:id` | |
| `/catalog/category/:id/type/:tid` | |
| `/catalog/duplicates` | |

### Seq 5 — Categories

Primarily via `/catalog/taxonomy`, `/catalog/new-category`, `/catalog/category/:id` (listed under Catalog; separate module doc `categories.md`).

### Seq 6 — Suppliers/Brokers

| Path | Notes |
|---|---|
| `/contacts` | Tabbed; `?tab=` |
| `/contacts/category` | |
| `/contacts/supplier/new` | |
| `/suppliers/quick-create` | |
| `/brokers/quick-create` | |
| `/supplier/:id` | |
| `/supplier/:id/ledger` | Also `/supplier/:supplierId/ledger` — confirm same screen when building |
| `/supplier/:id/batch-items` | |
| `/broker/:id` | |
| `/broker/:id/ledger` | |
| `/item-analytics/:itemKey` | Contacts/analytics deep link |

### Seq 7 — Purchase Orders

| Path | Notes |
|---|---|
| `/purchase` | Owner shell branch |
| `/purchase/new` | |
| `/purchase/scan` | |
| `/purchase/scan-draft` | |
| `/purchase/edit/:id` | |
| `/purchase/detail/:id` | |

### Seq 8 — Goods Receipt

| Path | Notes |
|---|---|
| `/staff/receive` | |
| `/staff/receive/:purchaseId` | |

### Seq 9 — Inventory/Stock

| Path | Notes |
|---|---|
| `/stock` | Owner shell |
| `/stock/missing-barcodes` | |
| `/stock/reorder-suggestions` | |
| `/stock/reorder` | |
| `/stock/opening-setup` | |
| `/stock/staff-purchases` | |
| `/stock/low-stock` | |
| `/stock/today-feed` | |
| `/stock/intelligence/:itemId` | |
| `/stock/:itemId/history` | |
| `/stock/dead` | |
| `/stock/fast-moving` | |
| `/stock/slow-moving` | |
| `/staff/stock` | Staff shell — **LAYOUT PASS** — [`staff_stock_layout_compare.md`](modules/staff_stock_layout_compare.md) |
| `/staff/low-stock` | |
| `/staff/items` | Staff gallery — **COMPARE PASS** — [`staff_items_compare.md`](modules/staff_items_compare.md) |

### Seq 10 — Stock Movement

| Path | Notes |
|---|---|
| `/stock/movement` | |
| `/stock/changes` | Confirm vs staff nested `changes` when building |

### Seq 11 — Barcode

| Path | Notes |
|---|---|
| `/barcode/scan` | |
| `/scan-history` | |
| `/audit-session` | |
| `/audit-summary` | |
| `/print/:itemId` | |
| `/bulk-print` | |
| `/staff/scan` | Staff shell |

### Seq 12 — Reports

| Path | Notes |
|---|---|
| `/reports` | Owner shell |
| `/reports/item/:catalogItemId` | |
| `/reports/purchase/:purchaseId` | |
| `/reports/item-detail` | |

### Seq 13 — Settings

| Path | Notes |
|---|---|
| `/settings` | |
| `/settings/business` | |
| `/settings/backup` | |
| `/settings/help` | |
| `/staff/settings` | Staff |

### Seq 14 — Staff shell (other)

| Path | Notes |
|---|---|
| `/staff/deliveries` | Shell branch |
| `/staff/tasks` | Shell branch |
| `/staff/purchase-history` | |
| `/staff/purchase-history/:purchaseId` | |
| `/staff/activity` | |

### Seq 15 — Operations

| Path | Notes |
|---|---|
| `/operations/usage` | Doc ownership TBD |
| `/operations/checklist` | |
| `/operations/owner-tasks` | |

### Seq 16 — Notifications

| Path | Notes |
|---|---|
| `/notifications` | Notifications — **COMPARE PASS** — [`notifications_compare.md`](modules/notifications_compare.md) |

### Seq 17 — Item public/history

| Path | Notes |
|---|---|
| `/item/:lookupKey` | Public QR lookup |
| `/catalog/item/:id/purchase-history` | Also listed under Catalog |

### Seq 18 — Search

| Path | Notes |
|---|---|
| `/search` | Owner shell — deferred |
| `/staff/search` | Staff shell — **COMPARE PASS** — [`staff_search_compare.md`](modules/staff_search_compare.md) |

### Unresolved (needs opening — do not invent)

| Path | Notes |
|---|---|
| `/` | Redirect → `/splash` (SCAFFOLD entry) |
| `/get-started` | Not yet opened |
| `/entries` | Likely legacy |
| `/analytics` | Not yet opened |

---

## 6. Rollback

Docs-only: revert this file. UI LAYOUT: revert LAYOUT commit on `phase4/login-scaffold`; keep SCAFFOLD.
