# Login UI — STATES compare (Step 6)

**Branch:** `phase4/login-scaffold`  
**Sources:** `login.md` §10–12; `login_page.dart` `_signIn` / `_retryAfterNetwork`; `auth_network_error_banner.dart`; `auth_error_messages.dart`

| Situation | Source message / UI | Built | Match? |
|---|---|---|---|
| HTTP 401 | `Invalid email or password. Try again.` | `MSG_401` | PASS |
| HTTP 403 blocked | `This account is blocked. Contact your owner.` | detail contains blocked | PASS |
| HTTP 403 inactive | `This account is inactive.` | detail contains inactive | PASS |
| HTTP 403 other | `Sign-in not allowed for this account.` | else | PASS |
| HTTP 422 | staff `@staff.harisree.local` hint | `MSG_422` | PASS |
| HTTP 503 | Sign-in temporarily unavailable… | `MSG_503` | PASS |
| HTTP 5xx | Something went wrong on our side… | `MSG_5XX` | PASS |
| Network | Banner + Retry | `AuthNetworkErrorBanner` | PASS |
| Retry | clear banner; sign-in or showValidation | `retryAfterNetwork` | PASS |
| Loading | spinner / disabled | existing | PASS |
| Biometric / query snackbars | — | **Deferred** | N/A |

**Rollback:** Revert STATES commit; keep WIRE 401/generic only.
