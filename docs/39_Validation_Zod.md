# 39 — Validation layer Zod (Phase 3.7)

**Status:** Review PASS (2026-07-18)  
**Checklist:** Phase 3 task **3.7**  
**Location:** `new-app/backend/src/validation/`  
**Branch:** `phase3/zod-validation`  
**Source:** `source-app/backend/app/schemas/auth.py` (LoginRequest, RefreshRequest)  

---

## 1. Purpose

Introduce Zod as the Pydantic equivalent for request body validation on the **Login auth surface** (`POST /login`, `POST /refresh`). Replace manual parsers. Do not Zod-ify the full API inventory in this phase.

---

## 2. Pattern

| Piece | Role |
|---|---|
| `validation/auth.schemas.ts` | Zod schemas + inferred types |
| `validation/validate.ts` | `validateWithSchema` + `SchemaValidationError` |
| `auth/loginRequest.ts` | Thin wrapper `parseLoginRequest` (stable import) |

Future modules: add `validation/<module>.schemas.ts` and call `validateWithSchema` from controllers (or a `validateBody` middleware later).

---

## 3. Schemas delivered

| Schema | Legacy | HTTP on failure |
|---|---|---|
| `loginRequestSchema` | `LoginRequest` | **400** `{ detail: "Sign in with your email address and password" }` |
| `refreshRequestSchema` | `RefreshRequest` | **401** `{ detail: "Invalid refresh token" }` |

**Not in 3.7:** Register / Forgot / Reset / Google (routes remain 501).

Login keeps single-string detail (not FastAPI 422 error arrays).

---

## 4. Rules ported (Login)

- `email` optional 5–320 **or** `identifier` max 320  
- `password` required 1–128  
- `device_token` optional max 512  
- Resolve `(email || identifier).strip().lower()`; must contain `@`  

---

## 5. Tests

- `tests/validation/auth.schemas.test.ts` — normalize, identifier, reject, device_token, refresh  
- Existing `tests/auth/login.test.ts` — 400/401/403/200 unchanged  

```bash
cd new-app/backend && npm test && npm run build
```

---

## 6. Review PASS/FAIL

| Check | Result |
|---|---|
| Login/Refresh rules match auth.py | PASS |
| Login 400 detail string unchanged | PASS |
| Refresh Zod failure → 401 same detail | PASS |
| No domain-wide Zod dump | PASS |
| Tests + build | PASS |

**Verdict: PASS**

---

## 7. Rollback

1. Revert `phase3/zod-validation`.
2. Restore pre-Zod `loginRequest.ts` / inline refresh parse.
3. Checklist: **3.7 → ⬜**, **3.8 → 🔒**.

---

## 8. Checklist impact

- **3.7** → ✅  
- **3.8** Error handling middleware → unlocked ⬜  
