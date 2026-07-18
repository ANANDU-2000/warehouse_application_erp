# Login UI — FIELDS compare (Step 3)

**Branch:** `phase4/login-scaffold`  
**Sources:** `docs/modules/login.md` §6–9; `login_page.dart`; `auth_input_styles.dart`; `auth.schemas.ts`

| Field | Source spec | Built | Match? |
|---|---|---|---|
| Email name | API body `email` | `name="email"` | PASS |
| Email UI | hint **Email**, email keyboard, autofill | `type=email`, `autoComplete=email`, placeholder Email | PASS |
| Email valid | trim, contains `@`, length ≥ 5 for form valid | `isLoginFormValid` | PASS |
| Email error | `Enter a valid email address` if empty/no `@` when showValidation | `emailError` | PASS |
| Password name | API body `password` | `name="password"` | PASS |
| Password UI | hint **Password**, obscure, Show/Hide | obscure + toggle tooltips | PASS |
| Password valid | length ≥ 6 (client); no invented strength | `isLoginFormValid` | PASS |
| Password error | `Password must be at least 6 characters` when showValidation | `passwordError` | PASS |
| showValidation | false until submit/disabled tap | state default `false` | PASS |
| Sign In / Forgot / API | Present in legacy | **Deferred** to BUTTONS/WIRE | N/A |
| Layout | One adaptive tree | One responsive form | PASS |

**Rollback:** Revert FIELDS commit; remove `loginValidation.ts` / field CSS.
