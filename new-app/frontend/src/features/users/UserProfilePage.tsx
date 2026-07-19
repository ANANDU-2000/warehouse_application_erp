/**
 * User profile — LAYOUT (Step 2).
 * Source: user_profile_page.dart AppBar/tabs; user_profile_header.dart chrome;
 * HexaColors brandBackground / brandPrimary.
 * No fields, click handlers, or API — FIELDS next.
 */
import { Navigate, useParams } from "react-router-dom";
import { readPrimaryBusiness } from "../../shared/auth/sessionStore";
import {
  sessionCanAdminUsers,
  sessionCanManageUsers,
} from "../../shared/auth/sessionGates";
import {
  USER_PROFILE_EDIT_USER,
  USER_PROFILE_TAB_ACTIVITY,
  USER_PROFILE_TAB_OVERVIEW,
  USER_PROFILE_TAB_PERMISSIONS,
  USER_PROFILE_TITLE,
  USER_PROFILE_TOOLTIP_BACK,
  USER_PROFILE_TOOLTIP_MORE,
} from "./userProfileCopy";
import "./UserProfilePage.css";

export function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const session = readPrimaryBusiness();

  if (!sessionCanManageUsers(session)) {
    return <Navigate to="/settings" replace />;
  }

  const canAdmin = sessionCanAdminUsers(session);

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
            className="user-profile__icon-btn"
            title={USER_PROFILE_TOOLTIP_BACK}
            data-testid="user-profile-back"
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" width="22" height="22">
              <path
                fill="currentColor"
                d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
              />
            </svg>
          </span>
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
        >
          <div className="user-profile__header-row">
            <span className="user-profile__avatar" aria-hidden="true" />
            <div className="user-profile__header-main">
              <span className="user-profile__name-bar" aria-hidden="true" />
              <div className="user-profile__pills">
                <span className="user-profile__pill" aria-hidden="true" />
                <span className="user-profile__pill" aria-hidden="true" />
              </div>
            </div>
          </div>
          <span className="user-profile__meta-bar" aria-hidden="true" />
          <span className="user-profile__meta-bar user-profile__meta-bar--short" aria-hidden="true" />
          <span className="user-profile__meta-bar user-profile__meta-bar--tiny" aria-hidden="true" />
          {canAdmin ? (
            <div
              className="user-profile__admin-row"
              data-testid="user-profile-admin-chrome"
            >
              <span className="user-profile__edit-chrome">
                {USER_PROFILE_EDIT_USER}
              </span>
              <span
                className="user-profile__more-chrome"
                title={USER_PROFILE_TOOLTIP_MORE}
                aria-hidden="true"
              >
                <svg viewBox="0 0 24 24" width="22" height="22">
                  <path
                    fill="currentColor"
                    d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
                  />
                </svg>
              </span>
            </div>
          ) : null}
        </section>

        <nav
          className="user-profile__tabs"
          data-slot="tabBar"
          data-testid="user-profile-tabs-chrome"
          aria-label="Profile sections"
        >
          <span
            className="user-profile__tab-slot user-profile__tab-slot--selected"
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
