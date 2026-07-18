# 18 — API Inventory

> Extracted directly from `@router.get/post/put/patch/delete(...)` decorators in `backend/app/routers/*.py` and `backend/app/routers/stock/*.py`, cross-referenced with each router's `APIRouter(prefix=...)` declaration and the registration order in `backend/app/main.py`. **Total: 214 endpoint decorators** across 26 router files. This is a structural extraction (verb + path); request/response schemas, status codes, and per-endpoint business rules are documented separately as each module doc is written (`31–37`) — do not treat this file as the full API contract.

## Auth pattern (applies across nearly all routes)

`backend/app/routers/*.py` import from `app/deps.py`: `get_current_user`, `require_membership`, `require_permission`, `require_role`. Every `/v1/businesses/{business_id}/...` route is expected to depend on one of these for tenant-scoping + auth — **confirmed present on `trade_purchases.py`**, not yet individually verified per-endpoint on every other router in this batch. That verification is required before the React/Node port defines its own auth middleware, and will be done per-module in the next batch (each module doc will state, per endpoint, which dependency guards it).

Two endpoint families are explicitly **not** business-scoped:
- `/v1/auth/*` (registration/login — pre-authentication)
- `/public/items/*` (public QR-code lookups — intentionally unauthenticated)
- `health.py` routes (no prefix, used for infra liveness checks)

## Full endpoint listing, grouped by router file


### `auth.py`  — prefix: `/v1/auth`

| Method | Path (relative) |
|---|---|
| POST | `/register` |
| POST | `/forgot-password` |
| POST | `/reset-password` |
| POST | `/login` |
| POST | `/google` |
| POST | `/refresh` |

### `catalog.py`  — prefix: `/v1/businesses/{business_id}`

| Method | Path (relative) |
|---|---|
| GET | `/item-categories` |
| GET | `/category-types-index` |
| POST | `/item-categories` |
| GET | `/item-categories/{category_id}` |
| GET | `/item-categories/{category_id}/trade-summary` |
| PATCH | `/item-categories/{category_id}` |
| DELETE | `/item-categories/{category_id}` |
| GET | `/item-categories/{category_id}/category-types` |
| POST | `/item-categories/{category_id}/category-types` |
| PATCH | `/item-categories/{category_id}/category-types/{type_id}` |
| DELETE | `/item-categories/{category_id}/category-types/{type_id}` |
| GET | `/catalog/duplicate-clusters` |
| POST | `/catalog/items/bulk-archive` |
| PATCH | `/catalog/items/bulk-reorder` |
| GET | `/catalog/fuzzy-check` |
| GET | `/catalog-items` |
| POST | `/catalog-items/from-scan` |
| PATCH | `/catalog-items/{item_id}/item-code` |
| PATCH | `/catalog-items/{item_id}/barcode` |
| POST | `/catalog-items` |
| POST | `/catalog-items/batch` |
| GET | `/catalog-items/{item_id}` |
| POST | `/catalog-items/{item_id}/generate-code` |
| GET | `/catalog-items/{item_id}/supplier-purchase-defaults` |
| GET | `/catalog-items/{item_id}/trade-supplier-prices` |
| GET | `/catalog-items/{item_id}/insights` |
| GET | `/catalog-items/{item_id}/lines` |
| GET | `/item-categories/{category_id}/insights` |
| PATCH | `/catalog-items/{item_id}` |
| DELETE | `/catalog-items/{item_id}` |
| GET | `/catalog-items/{item_id}/variants` |
| POST | `/catalog-items/{item_id}/variants` |
| PATCH | `/catalog-variants/{variant_id}` |
| DELETE | `/catalog-variants/{variant_id}` |

### `contacts.py`  — prefix: `/v1/businesses/{business_id}`

| Method | Path (relative) |
|---|---|
| GET | `/suppliers` |
| POST | `/suppliers` |
| PATCH | `/suppliers/{supplier_id}` |
| DELETE | `/suppliers/{supplier_id}` |
| GET | `/brokers` |
| POST | `/brokers` |
| PATCH | `/brokers/{broker_id}` |
| DELETE | `/brokers/{broker_id}` |
| GET | `/brokers/{broker_id}` |
| GET | `/brokers/{broker_id}/linked-suppliers` |
| GET | `/suppliers/{supplier_id}` |
| GET | `/suppliers/{supplier_id}/metrics` |
| GET | `/brokers/{broker_id}/metrics` |
| GET | `/contacts/search` |
| GET | `/contacts/category-items` |

### `damage_reports.py`  — prefix: `/v1/businesses/{business_id}/damage-reports`

| Method | Path (relative) |
|---|---|
| GET | `/pending-count` |
| PATCH | `/{report_id}` |

### `dashboard.py`  — prefix: `/v1/businesses/{business_id}`

| Method | Path (relative) |
|---|---|
| GET | `/dashboard` |

### `exports.py`  — prefix: `/v1/businesses/{business_id}/exports`

| Method | Path (relative) |
|---|---|
| POST | `/backup` |
| GET | `/stock-inventory.xlsx` |
| GET | `/purchases-month.pdf` |
| GET | `/backup/export` |

### `health.py`  — prefix: ``

| Method | Path (relative) |
|---|---|
| GET | `/` |
| GET | `/health/live` |
| GET | `/health` |
| GET | `/health/ready` |
| GET | `/health/db-check` |

### `me.py`  — prefix: `/v1/me`

| Method | Path (relative) |
|---|---|
| GET | `/profile` |
| PATCH | `/profile` |
| POST | `/bootstrap-workspace` |
| GET | `/businesses` |
| PATCH | `/businesses/{business_id}/branding` |
| POST | `/businesses/{business_id}/branding/logo` |

### `media.py`  — prefix: `/v1/businesses/{business_id}/media`

| Method | Path (relative) |
|---|---|
| POST | `/ocr` |

### `notifications.py`  — prefix: `/v1/businesses/{business_id}/notifications`

| Method | Path (relative) |
|---|---|
| GET | `/` |
| GET | `/summary` |
| GET | `/unread-count` |
| POST | `/mark-all-read` |
| DELETE | `/clear-all` |
| POST | `/client-event` |
| PATCH | `/{notification_id}` |

### `operations.py`  — prefix: `/v1/businesses/{business_id}/operations`

| Method | Path (relative) |
|---|---|
| GET | `/checklist/today` |
| POST | `/checklist/{slot}/complete` |
| GET | `/usage/today` |
| POST | `/usage/today` |
| GET | `/checklist/templates` |
| PUT | `/checklist/templates` |
| GET | `/checklist/summary` |
| POST | `/snapshots/materialize` |
| GET | `/snapshots` |
| GET | `/usage/summary` |
| GET | `/reports/summary` |

### `public_items.py`  — prefix: `/public/items`

| Method | Path (relative) |
|---|---|
| GET | `/{token}.json` |
| GET | `/lookup` |
| GET | `/{token}` |

### `realtime.py`  — prefix: `/v1/businesses/{business_id}/realtime`

| Method | Path (relative) |
|---|---|
| GET | `/events` |
| GET | `/recent` |

### `report_views.py`  — prefix: `/v1/businesses/{business_id}/report-views`

| Method | Path (relative) |
|---|---|
| GET | `/` |
| POST | `/` |
| PATCH | `/{view_id}` |
| DELETE | `/{view_id}` |

### `reports_trade.py`  — prefix: `/v1/businesses/{business_id}/reports (custom, verify exact prefix in file)`

| Method | Path (relative) |
|---|---|
| POST | `/sales-comparison` |
| GET | `/trade-supplier-broker-map` |
| GET | `/trade-last-supplier-autofill` |
| GET | `/trade-dashboard-snapshot` |
| GET | `/home-overview` |
| GET | `/trade-summary` |
| GET | `/trade-daily-profit` |
| GET | `/trade-items` |
| GET | `/trade-suppliers` |
| GET | `/trade-categories` |
| GET | `/trade-types` |
| GET | `/period-comparison` |
| GET | `/movement-summary` |
| GET | `/activity-feed` |
| GET | `/item/{catalog_item_id}` |

### `search.py`  — prefix: `/v1/businesses/{business_id}`

| Method | Path (relative) |
|---|---|
| GET | `/search` |

### `stock/stock_audit.py`  — prefix: `/v1/businesses/{business_id}/stock`

| Method | Path (relative) |
|---|---|
| GET | `/audit/feed` |
| GET | `/audit/recent` |
| GET | `/variances/today` |
| GET | `/audit/{item_id}` |
| GET | `/staff-purchases` |
| POST | `/staff-purchases` |

### `stock/stock_barcode.py`  — prefix: `/v1/businesses/{business_id}/stock`

| Method | Path (relative) |
|---|---|
| GET | `/barcode/lookup` |
| GET | `/barcode/{item_id}` |
| POST | `/barcode/batch` |

### `stock/stock_detail.py`  — prefix: `/v1/businesses/{business_id}/stock`

| Method | Path (relative) |
|---|---|
| GET | `/items/{item_id}/purchase-intelligence` |
| GET | `/{item_id}/activity` |
| GET | `/{item_id}/intelligence` |
| GET | `/item/{item_id}/summary` |
| GET | `/{item_id}/bundle` |
| GET | `/{item_id}` |
| POST | `/{item_id}/opening-stock` |
| POST | `/{item_id}/physical-count` |
| POST | `/{item_id}/physical-update` |
| POST | `/{item_id}/verify-count` |
| PATCH | `/{item_id}` |
| POST | `/{item_id}/undo-last` |
| POST | `/{item_id}/notify-owner` |

### `stock/stock_list.py`  — prefix: `/v1/businesses/{business_id}/stock`

| Method | Path (relative) |
|---|---|
| GET | `/list` |
| GET | `/shell-bundle` |
| GET | `/delivery-indicator-counts` |
| GET | `/list/compact` |
| GET | `/search` |
| GET | `/low` |
| GET | `/critical` |
| GET | `/alerts/summary` |
| GET | `/warehouse/alerts-summary` |
| GET | `/low-stock/summary` |
| GET | `/low-stock/operations` |

### `stock/stock_ops.py`  — prefix: `/v1/businesses/{business_id}/stock`

| Method | Path (relative) |
|---|---|
| GET | `/opening/setup` |
| GET | `/inventory-summary` |
| GET | `/totals` |
| GET | `/reorder` |
| PATCH | `/reorder/{entry_id}` |
| DELETE | `/reorder/{entry_id}` |
| GET | `/opening/missing` |
| POST | `/{item_id}/quick-purchase` |
| POST | `/{item_id}/reorder` |

### `stock_audits.py`  — prefix: `/v1/businesses/{business_id}/stock-audits (+legacy /v1/stock-audits)`

| Method | Path (relative) |
|---|---|
| POST | `/` |
| GET | `/active` |
| GET | `/` |
| GET | `/kpis` |
| GET | `/pending-lines` |
| GET | `/{audit_id}` |
| PUT | `/{audit_id}` |
| POST | `/{audit_id}/lines` |
| POST | `/{audit_id}/complete` |
| POST | `/{audit_id}/lines/{line_id}/approve` |
| DELETE | `/{audit_id}` |

### `trade_purchases.py`  — prefix: `/v1/businesses/{business_id}/trade-purchases`

| Method | Path (relative) |
|---|---|
| GET | `/draft` |
| PUT | `/draft` |
| DELETE | `/draft` |
| POST | `/preview-lines` |
| POST | `/validate` |
| POST | `/check-duplicate` |
| GET | `/next-human-id` |
| GET | `/` |
| GET | `/last-defaults` |
| POST | `/` |
| PATCH | `/{purchase_id}/payment` |
| GET | `/delivery-pipeline` |
| PATCH | `/{purchase_id}/delivery` |
| POST | `/{purchase_id}/dispatch` |
| POST | `/{purchase_id}/arrive` |
| POST | `/{purchase_id}/commit-stock` |
| POST | `/{purchase_id}/auto-commit` |
| POST | `/{purchase_id}/verify` |
| POST | `/{purchase_id}/mark-paid` |
| POST | `/{purchase_id}/cancel` |
| PUT | `/{purchase_id}` |
| DELETE | `/{purchase_id}` |
| GET | `/{purchase_id}` |
| POST | `/{purchase_id}/damage-reports` |
| GET | `/{purchase_id}/damage-reports` |
| GET | `/{purchase_id}/lifecycle-events` |
| POST | `/{purchase_id}/lifecycle` |

### `users.py`  — prefix: `/v1/businesses/{business_id}/users (+ activity_router: /v1/businesses/{business_id}/activity-log)`

| Method | Path (relative) |
|---|---|
| POST | `/` |
| GET | `/` |
| GET | `/active-sessions` |
| POST | `/bulk` |
| GET | `/{user_id}` |
| PATCH | `/{user_id}` |
| DELETE | `/{user_id}` |
| POST | `/{user_id}/reset-password` |
| GET | `/{user_id}/credentials` |
| GET | `/{user_id}/created-items` |
| GET | `/{user_id}/stock-adjustments` |
| GET | `/{user_id}/purchases` |
| GET | `/{user_id}/ledger` |
| GET | `/{user_id}/permissions` |
| PATCH | `/{user_id}/permissions` |
| POST | `/` *(activity_router)* |
| GET | `/` *(activity_router)* |

## Notable structural observations (for migration planning, not guesses — direct from the route table above)

1. **Duplicate `/search` behavior:** `search.py` exposes `GET /v1/businesses/{business_id}/search`, and `stock/stock_list.py` separately exposes `GET /v1/businesses/{business_id}/stock/search`. Different scope (global vs stock-only) — verify no functional overlap before consolidating in the Node port.
2. **Two stock-audit systems:** `stock_audits.py` (`/stock-audits`, full CRUD lifecycle: create → lines → approve → complete) is a *different* subsystem from `stock/stock_audit.py` (`/stock/audit/*`, read-only feed/variance reporting + a `staff-purchases` endpoint that seems out of place in an "audit" file — needs a business-rule check in `31_Business_Rules.md`).
3. **Legacy route alias:** `stock_audits.py` also registers a `legacy_router` at `/v1/stock-audits` (no `/businesses/{business_id}` prefix) — likely a pre-multi-tenancy route kept for backward compatibility. Decide during migration whether the Node/Express API needs to preserve this alias (only if an old client build still calls it) or can be dropped.
4. **`reports_trade.py` naming vs prefix:** file is named for "trade" reports but registers under the generic `/reports` prefix — the README notes reports are "trade-backed" (not the legacy `entries` table), so this is intentional, not a bug — flagged for `31_Business_Rules.md` / `38_Reports.md` to explain *why* "trade" is the canonical data source.
5. **Multi-line decorators fully resolved:** the initial single-line grep in `03_Module_Inventory.md` undercounted by ~60 routes (153 vs the accurate 214 here) because several files use multi-line `@router.get(\n    "/path",\n    ...)` decorators. This file's extraction handles both single- and start-of-multi-line decorators correctly by matching directly after `(` regardless of surrounding whitespace/newline. **214 is the number to carry forward** into the migration checklist.
6. **File upload endpoint:** `POST /v1/businesses/{business_id}/media/ocr` — needs explicit attention in the Node/Express port for multipart handling (Express doesn't have FastAPI's built-in `UploadFile`; will need `multer` or equivalent) — noted for `19_Backend_Architecture.md`.
7. **Export/backup endpoints return binary files** (`.xlsx`, `.pdf`, ZIP) — `exports.py`. Node port needs equivalent streaming/file-response handling (`openpyxl`/`reportlab` equivalents: e.g. `exceljs`, `pdfkit`/`pdf-lib`).

## Endpoint count by router

| Router | Endpoints |
|---|---|
| `trade_purchases.py` | 27 |
| `catalog.py` | 33 |
| `stock/stock_detail.py` | 13 |
| `stock/stock_list.py` | 11 |
| `operations.py` | 11 |
| `stock_audits.py` | 11 |
| `contacts.py` | 15 |
| `reports_trade.py` | 15 |
| `users.py` (incl. activity_router) | 17 |
| `stock/stock_ops.py` | 9 |
| `notifications.py` | 7 |
| `me.py` | 6 |
| `auth.py` | 6 |
| `stock/stock_audit.py` | 6 |
| `health.py` | 5 |
| `exports.py` | 4 |
| `report_views.py` | 4 |
| `dashboard.py` | 1 |
| `damage_reports.py` | 2 |
| `realtime.py` | 2 |
| `stock/stock_barcode.py` | 3 |
| `public_items.py` | 3 |
| `media.py` | 1 |
| `search.py` | 1 |
| **Total** | **214** |

## Not yet covered by this doc (next batch)

- Request/response Pydantic schema per endpoint (from `backend/app/schemas/*.py` — only 8 files exist for 26 routers, so many endpoints likely use inline models; needs per-endpoint confirmation)
- Status codes and error response shapes
- Rate limiting rules (`middleware/rate_limit.py` — not yet opened)
- Caching (`http_etag.py`, `read_cache_generation.py`, `app_cache.py` — several endpoints reference caching, e.g. `reports_trade.py`'s `_trade_dashboard_cache`)
- OpenAPI/Swagger doc generation status (FastAPI auto-generates one at `/docs` — not exported to a file in this repo; the README's linked `docs/api/openapi.yaml` is missing)
