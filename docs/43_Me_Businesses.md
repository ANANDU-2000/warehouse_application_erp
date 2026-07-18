# 43 — Me Businesses (Login E2E Slice L1)

**Status:** Review PASS (2026-07-18)  
**Checklist:** Login E2E **L1** (post-auth businesses list)  
**Location:** `new-app/backend/src/services/meBusinesses.service.ts`, `controllers/me.controller.ts`, `routes/me.routes.ts`  
**Branch:** `phase3/me-businesses`  
**Source:** [`me.py`](../source-app/backend/app/routers/me.py) `GET /v1/me/businesses` + `BusinessBrief`; Flutter `HexaApi.meBusinesses()`  

---

## 1. Purpose

Close the post-login session gap: authenticated users can list their workspaces as `BusinessBrief[]`. No React, no login DB writes (L2).

---

## 2. Endpoint

| Method | Path | Auth |
|---|---|---|
| GET | `/v1/me/businesses` | Bearer `requireAuth` only |

**Response:** JSON array of `BusinessBrief` (snake_case):

| Field | Type |
|---|---|
| `id` | uuid string |
| `name` | string |
| `role` | string |
| `permissions` | map of permission keys → bool (`membershipPermissions`) |
| `branding_title` | string \| null |
| `branding_logo_url` | string \| null |
| `gst_number` | string \| null |
| `address` | string \| null |
| `phone` | string \| null |
| `contact_email` | string \| null |

Missing business rows for a membership are **skipped** (same as join miss).

---

## 3. Login E2E roadmap

| Slice | Status | Notes |
|---|---|---|
| **L1** me/businesses | ✅ this doc | |
| **L2** login DB commit | ⬜ next | Intentional fix: **commit** side effects (vs legacy flush-only Unknown #1) |
| **L3** Phase 4.1 scaffold | ⬜ | Vite + React + TS |
| **L4** splash + login UI | ⬜ | Port Flutter `/splash` → `/login` |
| **L5** E2E Compare PASS | ⬜ | then Dashboard |

---

## 4. Tests

`tests/me/meBusinesses.test.ts` — service skip/empty/permissions; HTTP 401 / 200 empty / 200 shape.

```bash
cd new-app/backend && npm test && npm run build
```

---

## 5. Review PASS/FAIL (Legacy vs New)

| Check | Legacy / source | New | Result |
|---|---|---|---|
| Path | `GET /v1/me/businesses` | Same | PASS |
| Auth | `get_current_user` | `requireAuth` | PASS |
| Shape | `BusinessBrief` in `me.py` | Same fields | PASS |
| Permissions | `membership_permissions` | `membershipPermissions` | PASS |
| Skip missing biz | join | skip if `findById` null | PASS |
| No profile/branding | separate routes | Out of L1 | PASS |
| Unit tests | — | mocked repos | PASS |

**Verdict: PASS**

---

## 6. Rollback

1. Revert `phase3/me-businesses`.
2. Remove `/v1/me` mount from `app.ts`.
3. Checklist: Login L1 → open; next remains L2.

---

## 7. Checklist impact

- Login E2E **L1** → ✅  
- Next → **L2** login DB commit (Unknown #1 fix)  
- Phase **4.1** unchanged ⬜ (not this slice)  
