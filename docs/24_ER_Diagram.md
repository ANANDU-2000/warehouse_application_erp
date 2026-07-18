# 24 — ER Diagram (Mermaid)

> **Phase:** 1.9 Relationships / ER diagram  
> **Status:** Review PASS (2026-07-18)  
> **Source:** ORM `ForeignKey` names from `source-app/backend/app/models/*.py` and `docs/20_Database_Analysis.md` `FK->` lines  
> **Companion:** `docs/23_Relationships.md` (row-level inventory)  
> **Rule:** Only declared ORM FKs appear as relationships. Soft UUID links are noted in text, not as hard edges.

Mermaid `erDiagram` relationship labels use the **FK column name** from the child table. Cardinality markers:

| Marker | Meaning |
|--------|---------|
| `\|\|--o{` | 1 : N (one parent, many children) |
| `\|\|--\|\|` | 1 : 1 (UniqueConstraint implies at most one child) |
| `}o--o{` | N : M via association table |

---

## Core

`businesses`, `users`, `memberships`, `user_sessions`, `password_reset_tokens`, `api_usage_logs`.

```mermaid
erDiagram
  businesses ||--o{ memberships : "business_id"
  users ||--o{ memberships : "user_id"
  users }o--o{ businesses : "via memberships N:M"

  users ||--o{ users : "created_by"
  users ||--o{ user_sessions : "user_id"
  businesses ||--o{ user_sessions : "business_id"
  users ||--o{ password_reset_tokens : "user_id"
  businesses ||--o{ api_usage_logs : "business_id"
  users ||--o{ api_usage_logs : "user_id"

  businesses {
    uuid id PK
  }
  users {
    uuid id PK
    uuid created_by FK
  }
  memberships {
    uuid id PK
    uuid user_id FK
    uuid business_id FK
  }
  user_sessions {
    uuid id PK
    uuid user_id FK
    uuid business_id FK
  }
  password_reset_tokens {
    uuid id PK
    uuid user_id FK
  }
  api_usage_logs {
    uuid id PK
    uuid business_id FK
    uuid user_id FK
  }
```

**Notes (Core):**

- `memberships`: `UniqueConstraint(user_id, business_id)` → N:M association (`uq_membership_user_business`).
- `user_sessions.business_id` / `api_usage_logs.*`: nullable FKs where model declares `nullable=True`.
- `users.created_by` → `users.id`, `ondelete=SET NULL`.
- Session/token FKs use `ondelete=CASCADE` on `user_id` (and session `business_id`).
- No ORM FKs: `admin_audit_logs`, `webhook_event_logs` (omit from diagram).

---

## Catalog

Categories, types, items, variants, default supplier/broker links, supplier item defaults, unit-intelligence satellites.

```mermaid
erDiagram
  businesses ||--o{ item_categories : "business_id"
  item_categories ||--o{ category_types : "category_id"
  businesses ||--o{ catalog_items : "business_id"
  item_categories ||--o{ catalog_items : "category_id"
  category_types ||--o{ catalog_items : "type_id"
  suppliers ||--o{ catalog_items : "last_supplier_id"
  brokers ||--o{ catalog_items : "last_broker_id"
  trade_purchases ||--o{ catalog_items : "last_trade_purchase_id"
  users ||--o{ catalog_items : "created_by_user_id"
  users ||--o{ catalog_items : "updated_by_user_id"

  businesses ||--o{ catalog_variants : "business_id"
  catalog_items ||--o{ catalog_variants : "catalog_item_id"

  businesses ||--o{ catalog_item_default_suppliers : "business_id"
  catalog_items ||--o{ catalog_item_default_suppliers : "catalog_item_id"
  suppliers ||--o{ catalog_item_default_suppliers : "supplier_id"
  catalog_items }o--o{ suppliers : "via catalog_item_default_suppliers N:M"

  businesses ||--o{ catalog_item_default_brokers : "business_id"
  catalog_items ||--o{ catalog_item_default_brokers : "catalog_item_id"
  brokers ||--o{ catalog_item_default_brokers : "broker_id"
  catalog_items }o--o{ brokers : "via catalog_item_default_brokers N:M"

  businesses ||--o{ supplier_item_defaults : "business_id"
  suppliers ||--o{ supplier_item_defaults : "supplier_id"
  catalog_items ||--o{ supplier_item_defaults : "catalog_item_id"

  businesses ||--o{ item_packaging_profiles : "business_id"
  catalog_items ||--o{ item_packaging_profiles : "catalog_item_id"
  businesses ||--o{ ocr_item_aliases : "business_id"
  catalog_items ||--o{ ocr_item_aliases : "catalog_item_id"
  businesses ||--o{ smart_unit_rules : "business_id"
  businesses ||--o{ item_learning_history : "business_id"
  catalog_items ||--o{ item_learning_history : "catalog_item_id"
  businesses ||--o{ unit_confidence_logs : "business_id"
  catalog_items ||--o{ unit_confidence_logs : "catalog_item_id"
  businesses ||--o{ ai_item_profiles : "business_id"
  catalog_items ||--|| ai_item_profiles : "catalog_item_id"
  businesses ||--o{ smart_package_rules : "business_id"

  item_categories {
    uuid id PK
    uuid business_id FK
  }
  category_types {
    uuid id PK
    uuid category_id FK
  }
  catalog_items {
    uuid id PK
    uuid business_id FK
    uuid category_id FK
    uuid type_id FK
    uuid last_supplier_id FK
    uuid last_broker_id FK
    uuid last_trade_purchase_id FK
    uuid created_by_user_id FK
    uuid updated_by_user_id FK
  }
  catalog_variants {
    uuid id PK
    uuid business_id FK
    uuid catalog_item_id FK
  }
  catalog_item_default_suppliers {
    uuid id PK
    uuid business_id FK
    uuid catalog_item_id FK
    uuid supplier_id FK
  }
  catalog_item_default_brokers {
    uuid id PK
    uuid business_id FK
    uuid catalog_item_id FK
    uuid broker_id FK
  }
  supplier_item_defaults {
    uuid id PK
    uuid business_id FK
    uuid supplier_id FK
    uuid catalog_item_id FK
  }
  item_packaging_profiles {
    uuid id PK
    uuid business_id FK
    uuid catalog_item_id FK
  }
  ocr_item_aliases {
    uuid id PK
    uuid business_id FK
    uuid catalog_item_id FK
  }
  smart_unit_rules {
    uuid id PK
    uuid business_id FK
  }
  item_learning_history {
    uuid id PK
    uuid business_id FK
    uuid catalog_item_id FK
  }
  unit_confidence_logs {
    uuid id PK
    uuid business_id FK
    uuid catalog_item_id FK
  }
  ai_item_profiles {
    uuid id PK
    uuid business_id FK
    uuid catalog_item_id FK
  }
  smart_package_rules {
    uuid id PK
    uuid business_id FK
  }
```

**Notes (Catalog):**

- `category_types.category_id` → `ondelete=CASCADE`; `catalog_items.type_id` → `SET NULL`.
- Snapshot FKs on `catalog_items` (`last_supplier_id`, `last_broker_id`, `last_trade_purchase_id`) → `SET NULL`.
- `ai_item_profiles`: `uq_ai_item_profile_item` → **1:1** with `catalog_items` within a business.
- `master_units`: no FKs — reference data only (not drawn).
- Cross-domain edges to `suppliers` / `brokers` / `trade_purchases` / `users` are real ORM FKs (shown); those entities are owned in Contacts / Trade / Core diagrams.

---

## Contacts

`brokers`, `suppliers`, M2M junction `broker_supplier_m2m`.

```mermaid
erDiagram
  businesses ||--o{ brokers : "business_id"
  businesses ||--o{ suppliers : "business_id"
  brokers ||--o{ suppliers : "broker_id"
  brokers ||--o{ broker_supplier_m2m : "broker_id"
  suppliers ||--o{ broker_supplier_m2m : "supplier_id"
  brokers }o--o{ suppliers : "via broker_supplier_m2m N:M"

  brokers {
    uuid id PK
    uuid business_id FK
  }
  suppliers {
    uuid id PK
    uuid business_id FK
    uuid broker_id FK
  }
  broker_supplier_m2m {
    uuid id PK
    uuid broker_id FK
    uuid supplier_id FK
  }
```

**Notes (Contacts):**

- Legacy optional `suppliers.broker_id` (1:N) **and** explicit M2M `broker_supplier_m2m` with `uq_broker_supplier_m2m_pair` coexist — both are declared in ORM (`contacts.py`, `trade_purchase.py`).
- No `ondelete` declared on these Contact FKs in the ORM.

---

## Trade

Purchases, lines, drafts, lifecycle events, damage reports.

```mermaid
erDiagram
  businesses ||--o{ trade_purchases : "business_id"
  users ||--o{ trade_purchases : "user_id"
  suppliers ||--o{ trade_purchases : "supplier_id"
  brokers ||--o{ trade_purchases : "broker_id"
  users ||--o{ trade_purchases : "staff_verified_by"

  trade_purchases ||--o{ trade_purchase_lines : "trade_purchase_id"
  catalog_items ||--o{ trade_purchase_lines : "catalog_item_id"

  businesses ||--|| trade_purchase_drafts : "business_id"
  users ||--|| trade_purchase_drafts : "user_id"

  trade_purchases ||--o{ purchase_lifecycle_events : "purchase_id"
  businesses ||--o{ purchase_lifecycle_events : "business_id"
  users ||--o{ purchase_lifecycle_events : "actor_id"

  businesses ||--o{ purchase_damage_reports : "business_id"
  trade_purchases ||--o{ purchase_damage_reports : "purchase_id"
  catalog_items ||--o{ purchase_damage_reports : "catalog_item_id"
  users ||--o{ purchase_damage_reports : "reported_by_user_id"

  trade_purchases {
    uuid id PK
    uuid business_id FK
    uuid user_id FK
    uuid supplier_id FK
    uuid broker_id FK
    uuid staff_verified_by FK
  }
  trade_purchase_lines {
    uuid id PK
    uuid trade_purchase_id FK
    uuid catalog_item_id FK
  }
  trade_purchase_drafts {
    uuid id PK
    uuid business_id FK
    uuid user_id FK
  }
  purchase_lifecycle_events {
    uuid id PK
    uuid purchase_id FK
    uuid business_id FK
    uuid actor_id FK
  }
  purchase_damage_reports {
    uuid id PK
    uuid business_id FK
    uuid purchase_id FK
    uuid catalog_item_id FK
    uuid reported_by_user_id FK
  }
```

**Notes (Trade):**

- `trade_purchase_lines.trade_purchase_id` → `ondelete=CASCADE` (+ ORM `delete-orphan`).
- `trade_purchase_drafts`: `uq_trade_purchase_drafts_biz_user` → **1:1** per (business, user).
- Lifecycle / damage report purchase FKs → `CASCADE`; optional user/item FKs → `SET NULL` where declared.
- Inverse snapshot: `catalog_items.last_trade_purchase_id` → `trade_purchases` (drawn under Catalog).

---

## Stock

Movements, adjustment log, physical counts, audits, disputes, reorder, staff purchase logs.

```mermaid
erDiagram
  businesses ||--o{ stock_movements : "business_id"
  catalog_items ||--o{ stock_movements : "item_id"
  users ||--o{ stock_movements : "actor_id"

  businesses ||--o{ stock_adjustment_log : "business_id"
  catalog_items ||--o{ stock_adjustment_log : "item_id"
  users ||--o{ stock_adjustment_log : "updated_by"

  businesses ||--o{ stock_physical_counts : "business_id"
  catalog_items ||--o{ stock_physical_counts : "item_id"
  users ||--o{ stock_physical_counts : "counted_by"

  users ||--o{ stock_audits : "auditor_id"
  businesses ||--o{ stock_audits : "business_id"
  stock_audits ||--o{ stock_audit_items : "audit_id"
  catalog_items ||--o{ stock_audit_items : "item_id"

  businesses ||--o{ stock_dispute_cases : "business_id"
  catalog_items ||--o{ stock_dispute_cases : "item_id"
  users ||--o{ stock_dispute_cases : "created_by"
  users ||--o{ stock_dispute_cases : "resolved_by"

  businesses ||--o{ reorder_list : "business_id"
  catalog_items ||--o{ reorder_list : "item_id"
  users ||--o{ reorder_list : "added_by"

  businesses ||--o{ staff_purchase_logs : "business_id"
  catalog_items ||--o{ staff_purchase_logs : "item_id"
  suppliers ||--o{ staff_purchase_logs : "supplier_id"
  brokers ||--o{ staff_purchase_logs : "broker_id"
  stock_movements ||--o{ staff_purchase_logs : "stock_movement_id"
  users ||--o{ staff_purchase_logs : "created_by"

  stock_movements {
    uuid id PK
    uuid business_id FK
    uuid item_id FK
    uuid actor_id FK
    uuid source_id "logical no FK"
  }
  stock_adjustment_log {
    uuid id PK
    uuid business_id FK
    uuid item_id FK
    uuid updated_by FK
  }
  stock_physical_counts {
    uuid id PK
    uuid business_id FK
    uuid item_id FK
    uuid counted_by FK
  }
  stock_audits {
    uuid id PK
    uuid auditor_id FK
    uuid business_id FK
  }
  stock_audit_items {
    uuid id PK
    uuid audit_id FK
    uuid item_id FK
  }
  stock_dispute_cases {
    uuid id PK
    uuid business_id FK
    uuid item_id FK
    uuid created_by FK
    uuid resolved_by FK
  }
  reorder_list {
    uuid id PK
    uuid business_id FK
    uuid item_id FK
    uuid added_by FK
  }
  staff_purchase_logs {
    uuid id PK
    uuid business_id FK
    uuid item_id FK
    uuid supplier_id FK
    uuid broker_id FK
    uuid stock_movement_id FK
    uuid created_by FK
  }
```

**Notes (Stock):**

- Business/item FKs on stock tables typically `ondelete=CASCADE`; actor-style user FKs `SET NULL`.
- `stock_audit_items.audit_id` → `CASCADE` with ORM `delete-orphan` / `passive_deletes`.
- **Logical (not drawn as FK edge):** `stock_movements.source_id` + `source_type` (polymorphic; no ORM `ForeignKey`).

---

## Ops / Aux

Notifications, saved report views, staff activity, daily usage, checklists, business goals.

```mermaid
erDiagram
  businesses ||--o{ notifications : "business_id"
  users ||--o{ notifications : "user_id"
  users ||--o{ notifications : "triggered_by_user_id"

  businesses ||--o{ report_saved_views : "business_id"
  users ||--o{ report_saved_views : "user_id"

  businesses ||--o{ staff_activity_log : "business_id"
  users ||--o{ staff_activity_log : "user_id"
  catalog_items ||--o{ staff_activity_log : "item_id"

  businesses ||--o{ daily_usage_logs : "business_id"
  catalog_items ||--o{ daily_usage_logs : "item_id"
  users ||--o{ daily_usage_logs : "logged_by_user_id"

  businesses ||--o{ staff_checklist_templates : "business_id"
  businesses ||--o{ staff_checklist_completions : "business_id"
  users ||--o{ staff_checklist_completions : "user_id"

  businesses ||--o{ business_goals : "business_id"

  notifications {
    uuid id PK
    uuid business_id FK
    uuid user_id FK
    uuid triggered_by_user_id FK
    uuid related_item_id "logical no FK"
    uuid related_purchase_id "logical no FK"
    uuid related_supplier_id "logical no FK"
  }
  report_saved_views {
    uuid id PK
    uuid business_id FK
    uuid user_id FK
  }
  staff_activity_log {
    uuid id PK
    uuid business_id FK
    uuid user_id FK
    uuid item_id FK
  }
  daily_usage_logs {
    uuid id PK
    uuid business_id FK
    uuid item_id FK
    uuid logged_by_user_id FK
  }
  staff_checklist_templates {
    uuid id PK
    uuid business_id FK
  }
  staff_checklist_completions {
    uuid id PK
    uuid business_id FK
    uuid user_id FK
  }
  business_goals {
    uuid id PK
    uuid business_id FK
  }
```

**Notes (Ops / Aux):**

- Notification recipient FKs → `CASCADE`; `triggered_by_user_id` → `SET NULL`.
- **Logical (attribute only, not FK edges):** `notifications.related_item_id`, `related_purchase_id`, `related_supplier_id`.
- `daily_usage_logs`: unique per `(business_id, item_id, usage_date)`.
- `business_goals`: unique per `(business_id, period)`.

---

## Cross-domain hub (summary)

High-level tenant + product spine (not a substitute for the domain diagrams above):

```mermaid
erDiagram
  businesses ||--o{ users_via_memberships : "N:M memberships"
  businesses ||--o{ catalog_items : "business_id"
  businesses ||--o{ brokers : "business_id"
  businesses ||--o{ suppliers : "business_id"
  businesses ||--o{ trade_purchases : "business_id"
  businesses ||--o{ stock_movements : "business_id"
  catalog_items ||--o{ trade_purchase_lines : "catalog_item_id"
  catalog_items ||--o{ stock_movements : "item_id"
  suppliers ||--o{ trade_purchases : "supplier_id"
  trade_purchases ||--o{ trade_purchase_lines : "trade_purchase_id"
```

---

## Soft UUID / logical links (not ORM FK edges)

| From | Column | Logical to | Why not an edge |
|------|--------|------------|-----------------|
| `notifications` | `related_item_id` | `catalog_items.id` | No `ForeignKey` in `notification.py`; `docs/20` has no `FK->` |
| `notifications` | `related_purchase_id` | `trade_purchases.id` | Same |
| `notifications` | `related_supplier_id` | `suppliers.id` | Same |
| `stock_movements` | `source_id` | Polymorphic (`source_type`) | No `ForeignKey` in `stock_movement.py`; `docs/20` has no `FK->` |

---

## Coverage checklist vs `23_Relationships.md`

| Domain | FK rows in 23 | Diagram section |
|--------|--------------:|-----------------|
| Core | 8 | Core |
| Catalog | 33 | Catalog |
| Contacts | 5 | Contacts |
| Trade | 16 | Trade |
| Stock | 26 | Stock |
| Ops / Aux | 15 | Ops / Aux |
| **Total** | **103** | All domains |

---

## Unknowns — needs verification

1. Raw SQL under `source-app/backend/sql/` may add FKs / `ON DELETE` not present on ORM columns — parse in later Phase 1/2 index/constraint docs (`25` / `30`).
2. Whether polymorphic `stock_movements.source_id` should become a formal FK in SQL Server (legacy does not).
3. Whether notification `related_*` columns should gain FKs in the target schema (legacy ORM does not).

---

## Review PASS/FAIL

| Check | Result |
|-------|--------|
| Mermaid blocks for Core, Catalog, Contacts, Trade, Stock, Ops/Aux | PASS |
| FK column names match ORM / `docs/20` `FK->` | PASS |
| Soft UUID links not drawn as hard FKs | PASS |
| N:M junctions called out | PASS (`memberships`, `broker_supplier_m2m`, default supplier/broker tables) |
| 1:1 UniqueConstraint called out | PASS (`trade_purchase_drafts`, `ai_item_profiles`) |
| Companion inventory | `docs/23_Relationships.md` |
| No invented FKs | PASS |

**Verdict:** Review **PASS** (analysis / documentation only — no DDL or application code changes).
)
