# 25 — Postgres / ORM → SQL Server Type Mapping (Phase 2.2)

**Status:** PASS (2026-07-18)  
**Checklist:** Phase 2 task **2.2**  
**Branch:** `phase2/type-mapping`  
**Sources:** `source-app/backend/app/models/*.py`, `docs/20_Database_Analysis.md`, sampled `sqlite_bootstrap.py` / SQL scripts for NUMERIC confirmation.  
**Target:** SQL Server 2022 on Windows Server 2022.

---

## 1. Locked mapping decisions

| ORM / Postgres family | SQL Server target | Notes |
|---|---|---|
| `Uuid(as_uuid=True)` | `UNIQUEIDENTIFIER` | All PKs/FKs in ORM |
| Soft UUID **without** FK | `UNIQUEIDENTIFIER NULL` | No FK constraint (see §5) |
| `DateTime(timezone=True)` / timestamptz | `DATETIMEOFFSET` | Preserve offset; app uses UTC |
| `Date` | `DATE` | Purchase / usage / audit dates |
| `Boolean` | `BIT` | |
| `Integer` | `INT` | |
| `BigInteger` (if any) | `BIGINT` | None dominant in models |
| `String(n)` | `NVARCHAR(n)` | Unicode (names, GST, etc.) |
| `Text` | `NVARCHAR(MAX)` | Notes / long body |
| `Numeric(p, s)` | `DECIMAL(p, s)` | Exact p,s from ORM (§3) |
| `JSON` / `JSON().with_variant(JSONB, "postgresql")` | `NVARCHAR(MAX)` | Store JSON text; use `JSON_*` / `OPENJSON` — **not** PG `@>` |
| `Float` (if any) | `FLOAT` | Prefer DECIMAL for money/qty |

**Not used in this design:** SQL Server 2022 native JSON type as column type (prefer `NVARCHAR(MAX)` + JSON functions for portability with Node drivers).

---

## 2. Global type families (must appear in DDL)

Every distinct ORM type family used in models:

| Family | Present | SQL Server |
|---|---|---|
| UUID | Yes | `UNIQUEIDENTIFIER` |
| DateTime TZ | Yes | `DATETIMEOFFSET` |
| Date | Yes | `DATE` |
| Boolean | Yes | `BIT` |
| Integer | Yes | `INT` |
| String(n) | Yes | `NVARCHAR(n)` |
| Text | Yes | `NVARCHAR(MAX)` |
| Numeric(p,s) | Yes | `DECIMAL(p,s)` |
| JSON / JSONB variant | Yes | `NVARCHAR(MAX)` |

---

## 3. NUMERIC → DECIMAL precision (from ORM)

Distinct ORM precisions found in `models/*.py`:

| ORM | SQL Server | Typical use |
|---|---|---|
| `Numeric(5, 2)` | `DECIMAL(5,2)` | Percents (discount, tax, commission %, confidence) |
| `Numeric(8, 3)` | `DECIMAL(8,3)` | Rare qty-like |
| `Numeric(10, 2)` | `DECIMAL(10,2)` | Money mid |
| `Numeric(12, 2)` | `DECIMAL(12,2)` | Rates, line money |
| `Numeric(12, 3)` | `DECIMAL(12,3)` | Stock qty, weights |
| `Numeric(14, 2)` | `DECIMAL(14,2)` | Headers / totals |
| `Numeric(14, 3)` | `DECIMAL(14,3)` | Larger weights / qty |
| `Numeric(14, 4)` | `DECIMAL(14,4)` | Commission money, package size |
| `Numeric(14, 6)` | `DECIMAL(14,6)` | Conversion factors |
| `Numeric(18, 4)` | `DECIMAL(18,4)` | High-precision money/qty |

**Confirmation:** `sqlite_bootstrap.py` and stock/trade SQL alters use matching `NUMERIC(12,3)`, `NUMERIC(12,2)`, `NUMERIC(14,2)`, `NUMERIC(5,2)`, etc. — aligned with ORM.

### High-traffic examples (not exhaustive — DDL must follow ORM per column)

| Table | Column (examples) | DECIMAL |
|---|---|---|
| `catalog_items` | `current_stock`, `reorder_level` | `(12,3)` |
| `catalog_items` | `last_purchase_price`, costs | `(12,2)` |
| `stock_movements` | `delta_qty`, `qty_before`, `qty_after` | `(12,3)` |
| `stock_adjustment_log` | `old_qty`, `new_qty` | `(12,3)` |
| `trade_purchases` | `total_amount`, `paid_amount` | `(14,2)` |
| `trade_purchases` | `commission_money` | `(14,4)` |
| `trade_purchase_lines` | `qty`, `received_qty` | `(12,3)` |
| `trade_purchase_lines` | `landing_cost`, rates | `(12,2)` |

**Rule for 2.3 DDL:** copy `(p,s)` from the matching `mapped_column(Numeric(p, s))` — do not invent.

---

## 4. JSON / JSONB columns → NVARCHAR(MAX)

| Table | Column (DB / ORM) | ORM pattern |
|---|---|---|
| `users` | `device_info` | `JSON().with_variant(JSONB, "postgresql")` |
| `user_sessions` | `device_info` | same |
| `staff_activity_log` | `details` | same |
| `memberships` | `permissions_json` | same |
| `notifications` | `payload` | same |
| `notifications` | `metadata` (ORM attr `alert_metadata`) | same — **DB column name `metadata`** |
| `purchase_lifecycle_events` | payload JSON (see model) | JSONB variant |
| `report_saved_views` | `filters_json` | JSONB variant, default `{}` |
| `admin_audit_logs` | `details` | `JSON` |
| `api_usage_logs` | `meta` | `JSON` |
| `catalog_items` | `ml_profile` | `JSON` |
| `stock_movements` | `metadata_json` | `JSON` |
| `item_learning_history` / unit intel | `payload_json` | `JSON` |
| `ai_item_profiles` | `profile_json` | `JSON` |

### Query rewrite risks

| Postgres | SQL Server approach |
|---|---|
| JSONB `@>`, `?`, `->>` operators | `OPENJSON` / `JSON_VALUE` / `JSON_QUERY` — **rewrite service SQL** |
| GIN indexes on JSONB | Separate Phase 2.5 index plan; often app-layer filter instead |
| Default `{}` | `CONSTRAINT` / default `N'{}'` or app default |

**Unknown until code audit:** exact list of raw SQLAlchemy/`text()` queries using JSONB operators — flag for Phase 3 service port. Schema mapping alone is sufficient for 2.2.

---

## 5. Soft UUID columns (no FK)

Map as `UNIQUEIDENTIFIER NULL` without FK (from `docs/23_Relationships.md`):

| Table | Column |
|---|---|
| `notifications` | `related_item_id`, `related_purchase_id`, `related_supplier_id` |
| `stock_movements` | `source_id` (polymorphic with `source_type`) |

---

## 6. String length guidance

Use ORM `String(n)` → `NVARCHAR(n)` exactly. Common lengths observed: 3, 15, 16, 20, 24, 30, 32, 50, 64, 100, 120, 128, 220, 255, 256, 320, 500, 512, 1024, 2000.

**Unknown:** live PG varchar lengths that differ from ORM (drift) — verify with `information_schema` before cutover if needed.

---

## 7. Identity / defaults

| Concern | SQL Server |
|---|---|
| UUID PK default | `DEFAULT NEWSEQUENTIALID()` or app-generated `NEWID()` — prefer **app UUID** to match FastAPI `uuid4` behavior |
| `server_default="0"` ints | `DEFAULT (0)` |
| Timestamps | App sets UTC; column type `DATETIMEOFFSET`; optional `DEFAULT SYSUTCDATETIME()` only if parity requires |

---

## 8. Unknowns (do not block 2.2 PASS)

1. Live Postgres catalog vs ORM drift for any column (not dumped in this workspace).  
2. Exact JSONB operator call sites in services (Phase 3).  
3. Whether any `FLOAT` / `REAL` columns exist only in raw SQL not in ORM — sample SQL focused on NUMERIC; full SQL parse is Phase 2.5/2.7.  
4. `notifications.metadata` reserved-word quoting in T-SQL (`[metadata]`).

---

## 9. Review PASS/FAIL

| # | Check | Status |
|---|---|---|
| 1 | All ORM type families mapped | PASS |
| 2 | All distinct Numeric(p,s) listed | PASS |
| 3 | JSON columns inventoried | PASS |
| 4 | Soft UUID links called out | PASS |
| 5 | JSON `@>` rewrite risk documented | PASS |
| 6 | Unknowns labeled | PASS |

**Verdict:** Phase 2.2 **PASS**. Unlock **2.3 SQL Server DDL**.

---

## 10. Next (2.3)

Generate per-table T-SQL `CREATE TABLE` using:

1. Column list from `docs/20_Database_Analysis.md`
2. Types from this document
3. FKs / ondelete from `docs/23_Relationships.md`
4. No Customers/Sales tables

---

*Phase 2.2 complete — analysis/design docs only; no DDL files in this commit.*
