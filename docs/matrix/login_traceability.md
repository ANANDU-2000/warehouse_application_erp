# Traceability matrix — Login

Status values: `Missing` | `Complete` (spec documented) | `Needs Review`

Future React paths are **placeholders only** (no implementation in Phase 1).

| Legacy Feature | Future React (placeholder) | Future API | DB Tables | Validation | Business Rules | Status |
|---|---|---|---|---|---|---|
| Email/password sign-in UI | `new-app/frontend/src/features/auth/LoginPage` | `POST /v1/auth/login` | users, user_sessions | Client email+pwd; server LoginRequest | Blocked/inactive/deleted checks; bcrypt verify | Complete |
| Session resume on open | same + session provider | `POST /v1/auth/refresh` + me businesses | users | Token presence | Skip if session-expired circuit | Complete |
| Biometric re-entry | auth biometric control | (none — restore/refresh) | — | Device biometric + stored tokens | Web disabled | Complete |
| Forgot password | `ForgotPasswordPage` | `POST /v1/auth/forgot-password` | password_reset_tokens, users | Email regex | Uniform response; 1h token | Complete |
| Reset password | `ResetPasswordPage` | `POST /v1/auth/reset-password` | password_reset_tokens, users | Min 8 + match | Hash token; mark used | Complete |
| Post-login navigation Owner/Staff | app router guards | — | memberships | Role `staff` vs other | `/home` vs `/staff/home` | Complete |
| JWT access/refresh storage | token store | TokenPair | — | — | Web prefs vs secure storage | Complete |
| Staff LOGIN audit | — | login side effect | staff_activity_log, user_sessions | Role staff/manager/admin | Flush without commit — verify at implement | Needs Review |
| Google Sign-In | (not on Login UI) | `POST /v1/auth/google` | users, businesses, memberships | Google ID token | API-only for this module | Complete |
| Self-registration | (not on Login UI) | `POST /v1/auth/register` | users, businesses, memberships | RegisterRequest + password strength | Often 403 public reg off | Complete |
| Brand shell background/logo | auth layout | — | — | Asset fallback | getstarted_bg; icon not logo.png on login | Complete |

## Spec evidence

- Full analysis: [`docs/modules/login.md`](../modules/login.md)
