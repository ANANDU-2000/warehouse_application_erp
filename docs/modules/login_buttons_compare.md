# Login UI — BUTTONS compare (Step 4)

**Branch:** `phase4/login-scaffold`  
**Sources:** `docs/modules/login.md` §10–11; `login_page.dart` FilledButton / TextButton

| Control | Source | Built | Match? |
|---|---|---|---|
| Sign In | Full-width h=50, brandPrimary, radius 10, label Sign In | `.login-page__submit` | PASS |
| Invalid click | set `_showValidation` | `setShowValidation(true)` | PASS |
| Valid click | `_signIn` | `onSignInStub` no-op (WIRE later) | PASS (by design) |
| Password Enter | same as Sign In | `attemptSignIn` | PASS |
| Forgot password? | `context.go('/forgot-password')` | `<Link to="/forgot-password">` | PASS |
| Forgot disabled while loading | yes | span when loading | PASS |
| Helper | Contact your manager… | same | PASS |
| © 2026 | footer | same | PASS |
| Biometric / API | present / calls API | **Deferred** | N/A |

**Rollback:** Revert BUTTONS commit; remove forgot stub route.
