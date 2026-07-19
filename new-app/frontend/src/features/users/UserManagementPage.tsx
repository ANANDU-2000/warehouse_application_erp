/**
 * Users list — SCAFFOLD only (Step 1).
 * Source: user_management_page.dart build chrome regions.
 * Forbidden this step: fields, CTAs, API.
 */
import { Navigate } from "react-router-dom";
import { readPrimaryBusiness } from "../../shared/auth/sessionStore";
import { sessionCanManageUsers } from "../../shared/auth/sessionGates";
import "./UserManagementPage.css";

export function UserManagementPage() {
  const session = readPrimaryBusiness();
  if (!sessionCanManageUsers(session)) {
    return <Navigate to="/settings" replace />;
  }

  return (
    <div className="users-mgmt" data-testid="user-management-page">
      <header className="users-mgmt__appbar" data-slot="appBar">
        <div className="users-mgmt__appbar-leading" data-slot="appBar.leading" />
        <h1 className="users-mgmt__title">Users</h1>
        <div className="users-mgmt__appbar-actions" data-slot="appBar.actions" />
      </header>

      <div className="users-mgmt__body">
        <div
          className="users-mgmt__search-filter"
          data-slot="searchFilter"
          aria-hidden="true"
        />
        <div
          className="users-mgmt__status-chips"
          data-slot="statusChips"
          aria-hidden="true"
        />

        <div className="users-mgmt__split">
          <section
            className="users-mgmt__list"
            data-slot="list"
            aria-hidden="true"
          />
          <aside
            className="users-mgmt__detail"
            data-slot="detailPanel"
            aria-hidden="true"
          />
        </div>
      </div>

      <footer
        className="users-mgmt__bulk"
        data-slot="bulkBar"
        aria-hidden="true"
      />
    </div>
  );
}
