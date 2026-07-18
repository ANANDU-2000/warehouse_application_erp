import { AuthPageShell } from "../../shared/auth/AuthPageShell";
import { AuthFormCard } from "../../shared/auth/AuthFormCard";
import { hexaColors } from "../../shared/theme/colors";
import "./LoginPage.css";

/**
 * Login page — Step 2 LAYOUT.
 * Brand chrome only: icon + titles + Sign In heading.
 * No fields, CTA, forgot link, or API (docs/modules/login.md §2–5).
 * Source: source-app/.../login_page.dart build() title block.
 */
export function LoginPage() {
  return (
    <div className="login-page">
      <AuthPageShell>
        <AuthFormCard>
          <div className="login-page__brand">
            <WarehouseIcon />
            <div className="login-page__titles">
              <h1 className="login-page__agency">Harisree Agency</h1>
              <p className="login-page__subtitle">Warehouse Management</p>
            </div>
          </div>
          <h2 className="login-page__sign-in">Sign In</h2>
        </AuthFormCard>
      </AuthPageShell>
    </div>
  );
}

/** Material Icons.warehouse_outlined stand-in — size 36, brandPrimary. */
function WarehouseIcon() {
  return (
    <svg
      className="login-page__icon"
      width="36"
      height="36"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M22 21V7L12 2 2 7v14h6v-8h8v8h6zM11 19H7v-6h4v6zm6 0h-4v-6h4v6z"
        fill={hexaColors.brandPrimary}
      />
    </svg>
  );
}
