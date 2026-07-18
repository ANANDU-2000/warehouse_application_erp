# 42 — Transactions (Phase 3.10)

**Status:** Review PASS (2026-07-18)  
**Checklist:** Phase 3 task **3.10**  
**Location:** `new-app/backend/src/db/withTransaction.ts`, `src/repositories/sql.ts` (`SqlClient`)  
**Branch:** `phase3/transactions`  
**Source intent:** FastAPI request-scoped session; services own **one** `commit` / `rollback` ([`database.py`](../source-app/backend/app/database.py), [`commit_trade_purchase_delivery`](../source-app/backend/app/services/trade_purchase_service.py)); stock writers flush only — caller owns txn ([`stock_movement_service.py`](../source-app/backend/app/services/stock_movement_service.py))  

---

## 1. Purpose

Provide multi-table write infrastructure so future domain flows (e.g. purchase commit-stock) can run several repository writes on one SQL Server transaction. **Not** GR/stock business logic in this phase.

---

## 2. API

```ts
await withTransaction(pool, async (tx) => {
  const users = createUsersRepository(tx);
  // … multiple writes …
  return value; // commits
});
// throw → rollback then rethrow
```

| Piece | Behavior |
|---|---|
| `SqlClient` | `ConnectionPool` \| `Transaction` \| `{ request() }` |
| `queryMany` / `queryOne` | Use `client.request()` (works inside txn) |
| Repos | Constructors / factories take `SqlClient` |
| `withTransaction` | `begin` → `fn` → `commit`; on error `rollback` then rethrow |

Optional `createTransaction` option is a **test seam** only (defaults to `new sql.Transaction(pool)`).

---

## 3. Legacy parity

| Legacy | New |
|---|---|
| Service-owned commit once | `withTransaction` commit once |
| `rollback` on failure | `rollback` then rethrow |
| Lower layers do not commit | Repos still query-only; no repo-level commit |
| `begin_nested` (audit best-effort) | **Deferred** (savepoints) |
| `pg_advisory_xact_lock` / `FOR UPDATE` | **Unknown — needs verification** (SQL Server equivalent); do not invent |

---

## 4. Out of scope (this phase)

- Purchase `commit-stock` / stock math / delivery state machine  
- Login session / `last_login_at` writes (Unknown #1)  
- `GET /v1/me/businesses`  
- Savepoints, advisory locks, live SQL for PASS  

---

## 5. Tests

`tests/db/withTransaction.test.ts` — commit on success; rollback on throw; rollback failure still rethrows; `SqlClient` + `queryOne` via tx `request()`.

```bash
cd new-app/backend && npm test && npm run build
```

---

## 6. Review PASS/FAIL (Legacy vs New)

| Check | Legacy / source | New | Result |
|---|---|---|---|
| Unit-of-work boundary | Service commit/rollback | `withTransaction` | PASS |
| Queries on same txn | Shared `AsyncSession` | `SqlClient` = pool or `Transaction` | PASS |
| Repos usable in txn | Session-injected DAOs | Factories accept `SqlClient` | PASS |
| No GR business logic | commit-stock in trade service | Not ported | PASS |
| Locks | Postgres advisory | Documented Unknown | PASS |
| Unit tests without live DB | — | Mocked TransactionHandle | PASS |

**Verdict: PASS**

---

## 7. Rollback

1. Revert `phase3/transactions`.
2. Restore pool-only `sql.ts` / repo constructors.
3. Checklist: **3.10 → ⬜**, **3.11 → 🔒**.

---

## 8. Checklist impact

- **3.10** → ✅  
- **3.11** Phase 3 sign-off → unlocked ⬜  

Future consumers: first real multi-table domain flow (e.g. GR commit-stock) should call `withTransaction` and keep lower writers commit-free.
