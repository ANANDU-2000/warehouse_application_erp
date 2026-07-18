# 06 — Master Page Build Order

**Status:** Reference (2026-07-18)  
**Source routes:** [`05_Navigation_Map.md`](05_Navigation_Map.md) (~**101** unique paths from `app_router.dart` — not 180; param-variant duplicates may collapse to ~90–95 screens when built)  
**Rule:** A page cannot start until its **backend module** is built and `docs/modules/<x>.md` exists.

---

## 1. Module sequence (backend-gated)

| Seq | Module | Doc ready | Backend ready | Unlocked for UI? |
|---|---|---|---|---|
| 1 | Login/Auth | ✅ `login.md` | ✅ login/refresh + me/businesses | **YES** (UI Step 1 SCAFFOLD) |
| 2 | Dashboard/Home | ✅ | ❌ | Blocked |
| 3 | Users & Roles | ✅ | 🟡 me/businesses only | Blocked |
| 4 | Products/Catalog | ✅ | ❌ | Blocked |
| 5 | Categories | ✅ | ❌ | Blocked |
| 6 | Suppliers/Brokers | ✅ | ❌ | Blocked |
| 7 | Purchase Orders | ✅ | ❌ | Blocked |
| 8 | Goods Receipt | ✅ | ❌ | Blocked |
| 9 | Inventory/Stock | ✅ | ❌ | Blocked |
| 10 | Stock Movement | ✅ | ❌ | Blocked |
| 11 | Barcode | verify ownership | ❌ | Blocked |
| 12 | Reports | ✅ | ❌ | Blocked |
| 13 | Settings | ✅ | ❌ | Blocked |
| 14 | Staff shell (other) | partial | ❌ | Blocked |
| 15 | Operations | verify doc | ❌ | Blocked |
| 16 | Notifications | verify doc | ❌ | Blocked |
| 17 | Item public/history | verify | ❌ | Blocked |
| 18 | Search | verify doc | ❌ | Blocked |
| — | Dead aliases (`/dashboard`, `/history`, `/entries`, `/scan/:token`) | ✅ redirects | — | **Do not build** |
| — | Root `/` | redirect to `/login` for now | — | Scaffold redirect only |

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

Login UI steps: **1 SCAFFOLD** (current) → 2 LAYOUT → 3 FIELDS → 4 BUTTONS/WIRE → splash later.

---

## 3. SQL / pool note for implementers

Live local SQL uses the pool wired in [`new-app/backend/src/index.ts`](../new-app/backend/src/index.ts) (`connect()` + real repos). On Windows, default driver is **`msnodesqlv8`** (ODBC) when TCP is off — see [`docs/44_Local_SQL_Bootstrap.md`](44_Local_SQL_Bootstrap.md). Do not invent a second connection path per module.

---

## 4. Auth routes (confirmed live for Login)

| Path | Notes |
|---|---|
| `/splash` | Later |
| `/login` | **Step 1 SCAFFOLD** |
| `/forgot-password` | Later |
| `/reset-password` | Later |

Backend: `POST /v1/auth/login`, `POST /v1/auth/refresh`, `GET /v1/me/businesses` (wire in FIELDS+ steps).
