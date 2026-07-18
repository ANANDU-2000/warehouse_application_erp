# 41 — Logging (Phase 3.9)

**Status:** Review PASS (2026-07-18)  
**Checklist:** Phase 3 task **3.9**  
**Location:** `new-app/backend/src/logging/logger.ts`, `src/middleware/requestLog.ts`  
**Branch:** `phase3/logging`  
**Source intent:** FastAPI stdlib logging + `settings.log_level` ([`main.py`](../source-app/backend/app/main.py)); never log PII/tokens ([security-rules](../.cursor/rules/security-rules.mdc))  

---

## 1. Purpose

Add structured JSON-line logging with `LOG_LEVEL`, requestId correlation, HTTP access trail, and wire startup + unhandled errors through the logger. No pino/winston.

---

## 2. Log shape

One JSON object per line:

```json
{ "level": "info", "msg": "http.access", "time": "…", "requestId": "…", "method": "GET", "path": "/api/health", "statusCode": 200, "durationMs": 3 }
```

Levels: `debug` | `info` | `warn` | `error` (env `LOG_LEVEL`, default `info`).

---

## 3. Redaction rules

**Never log:** passwords, JWT/access/refresh tokens, full `Authorization` headers, request bodies with credentials.

Access log fields only: method, path, statusCode, durationMs, requestId.

---

## 4. Wiring

| Piece | Behavior |
|---|---|
| `requestId` then `requestLog` | Access log on `res.finish` |
| `errorHandler` | `logger.error("Unhandled", { err, stack?, requestId })` for unknown |
| `index.ts` | `logger.info("server.listen", { port, nodeEnv })` |

---

## 5. Tests

`tests/logging/logger.test.ts` — level filter, JSON shape, child requestId, access middleware, errorHandler log.

```bash
cd new-app/backend && npm test && npm run build
```

---

## 6. Review PASS/FAIL

| Check | Result |
|---|---|
| Structured JSON + LOG_LEVEL | PASS |
| requestId on access + unhandled | PASS |
| No password/token logging | PASS |
| Tests + build | PASS |

**Verdict: PASS**

---

## 7. Rollback

1. Revert `phase3/logging`.
2. Restore console.error/log.
3. Checklist: **3.9 → ⬜**, **3.10 → 🔒**.

---

## 8. Checklist impact

- **3.9** → ✅  
- **3.10** Transactions → unlocked ⬜  
