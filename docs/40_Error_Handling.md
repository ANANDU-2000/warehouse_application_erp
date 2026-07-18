# 40 — Error handling middleware (Phase 3.8)

**Status:** Review PASS (2026-07-18)  
**Checklist:** Phase 3 task **3.8**  
**Location:** `new-app/backend/src/middleware/errorHandler.ts`, `src/errors/httpError.ts`, `src/http/sendDetail.ts`  
**Branch:** `phase3/error-handling`  
**Source intent:** `source-app/backend/app/main.py` `global_exception_handler` (HTTPException → `{ detail }`; unknown → safe client payload)  

---

## 1. Purpose

Replace the stub error handler that returned `{ error }` + always 500. Unify on FastAPI-style **`{ detail: string }`**. Map known domain/schema/token errors to correct statuses when thrown via `next(err)`.

---

## 2. Client contract

| Case | Status | Body |
|---|---|---|
| `HttpError` | `err.status` | `{ detail: err.detail }` |
| Account inactive/blocked, permission denied | 403 | `{ detail: message }` |
| Schema / login validation / password strength | 400 | `{ detail: message }` |
| Token issuance unavailable | 503 | `{ detail: message }` |
| Unknown | 500 | `{ detail: "Internal Server Error" }` |

Never leak stack traces or SQL to the client. Full err logged when `NODE_ENV !== "test"`.

Intentional controller/authz responses still use `sendDetail` / `sendAuthzDetail` (same JSON shape).

---

## 3. Files

| File | Role |
|---|---|
| `errors/httpError.ts` | `throw new HttpError(status, detail)` |
| `http/sendDetail.ts` | Shared `{ detail }` writer |
| `middleware/errorHandler.ts` | Maps + emits |
| `middleware/authzHttp.ts` | Re-exports `sendDetail` as `sendAuthzDetail` |

---

## 4. Deferred

| Item | Phase |
|---|---|
| Structured logging / correlation | **3.9** |
| Integrity 409 / DB-specific mapping | When write repos land |
| Login 422 validation arrays | Not required (Login keeps 400 string) |

---

## 5. Tests

`tests/middleware/errorHandler.test.ts` — each mapped type; unknown → safe 500; body has `detail` not `error`.

```bash
cd new-app/backend && npm test && npm run build
```

---

## 6. Review PASS/FAIL

| Check | Result |
|---|---|
| Unhandled uses `{ detail }` not `{ error }` | PASS |
| Domain throws mapped to correct status | PASS |
| No client leak of internal messages | PASS |
| Auth sendDetail behavior unchanged | PASS |
| Tests + build | PASS |

**Verdict: PASS**

---

## 7. Rollback

1. Revert `phase3/error-handling`.
2. Restore stub `{ error }` handler.
3. Checklist: **3.8 → ⬜**, **3.9 → 🔒**.

---

## 8. Checklist impact

- **3.8** → ✅  
- **3.9** Logging → unlocked ⬜  
