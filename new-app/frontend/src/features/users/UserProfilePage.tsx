/**
 * User profile — SCAFFOLD (Step 1).
 * Source: user_profile_page.dart chrome regions; users-roles.md §2;
 * post_auth_route sessionCanManageUsers on /settings/users*
 * No fields, CTAs, or API — LAYOUT next.
 */
import { Navigate, useParams } from "react-router-dom";
import { readPrimaryBusiness } from "../../shared/auth/sessionStore";
import { sessionCanManageUsers } from "../../shared/auth/sessionGates";
import {
  USER_PROFILE_TAB_ACTIVITY,
  USER_PROFILE_TAB_OVERVIEW,
  USER_PROFILE_TAB_PERMISSIONS,
  USER_PROFILE_TITLE,
} from "./userProfileCopy";
import "./UserProfilePage.css";

export function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const session = readPrimaryBusiness();

  if (!sessionCanManageUsers(session)) {
    return <Navigate to="/settings" replace />;
  }

  return (
    <div
      className="user-profile"
      data-testid="user-profile-page"
      data-user-id={userId ?? ""}
    >
      <header className="user-profile__appbar" data-slot="appBar">
        <div
          className="user-profile__appbar-leading"
          data-slot="appBar.leading"
        >
          <span
            className="user-profile__icon-slot"
            data-testid="user-profile-back"
            aria-hidden="true"
          />
        </div>
        <h1 className="user-profile__title">{USER_PROFILE_TITLE}</h1>
        <div
          className="user-profile__appbar-actions"
          data-slot="appBar.actions"
        />
      </header>

      <div className="user-profile__body">
        <section
          className="user-profile__header"
          data-slot="header"
          data-testid="user-profile-header-chrome"
          aria-hidden="true"
        />
        <nav
          className="user-profile__tabs"
          data-slot="tabBar"
          data-testid="user-profile-tabs-chrome"
          aria-label="Profile sections"
        >
          <span
            className="user-profile__tab-slot"
            data-testid="user-profile-tab-overview"
          >
            {USER_PROFILE_TAB_OVERVIEW}
          </span>
          <span
            className="user-profile__tab-slot"
            data-testid="user-profile-tab-activity"
          >
            {USER_PROFILE_TAB_ACTIVITY}
          </span>
          <span
            className="user-profile__tab-slot"
            data-testid="user-profile-tab-permissions"
          >
            {USER_PROFILE_TAB_PERMISSIONS}
          </span>
        </nav>
        <section
          className="user-profile__tab-body"
          data-slot="tabBody"
          data-testid="user-profile-tab-body-chrome"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
