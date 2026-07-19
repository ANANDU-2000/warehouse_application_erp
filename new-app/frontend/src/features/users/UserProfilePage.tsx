/**
 * User profile — FIELDS (Step 3).
 * Source: user_profile_header.dart; user_overview_kpi_grid.dart;
 * user_activity_tab.dart; user_permission_groups.dart
 * Local tab/section/permission draft state only — no API (WIRE).
 */
import { useMemo, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { readPrimaryBusiness } from "../../shared/auth/sessionStore";
import {
  sessionCanAdminUsers,
  sessionCanManageUsers,
} from "../../shared/auth/sessionGates";
import {
  USER_PROFILE_EDIT_USER,
  USER_PROFILE_LAST_ACTIVE_PREFIX,
  USER_PROFILE_NAME_EMPTY,
  USER_PROFILE_TAB_ACTIVITY,
  USER_PROFILE_TAB_OVERVIEW,
  USER_PROFILE_TAB_PERMISSIONS,
  USER_PROFILE_TITLE,
  USER_PROFILE_TOOLTIP_BACK,
  USER_PROFILE_TOOLTIP_MORE,
  USER_PROFILE_WAREHOUSE_PREFIX,
} from "./userProfileCopy";
import {
  USER_ACTIVITY_SECTION_LABELS,
  USER_ACTIVITY_SECTION_ORDER,
  USER_PERMISSION_GROUPS,
  USER_PROFILE_KPI_LABELS,
  USER_PROFILE_KPI_ORDER,
  type UserActivitySection,
  type UserProfileTab,
} from "./userProfileFields";
import { displayUserRole, userLastActiveLabel, userStatusLabel } from "./userLastActive";
import "./UserProfilePage.css";

export function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const session = readPrimaryBusiness();
  const [tab, setTab] = useState<UserProfileTab>("overview");
  const [activitySection, setActivitySection] =
    useState<UserActivitySection>("feed");
  const [permDraft, setPermDraft] = useState<Record<string, boolean>>({});

  const permKeys = useMemo(() => {
    const keys: string[] = [];
    for (const g of USER_PERMISSION_GROUPS) {
      for (const p of g.permissions) keys.push(p.key);
    }
    return keys;
  }, []);

  if (!sessionCanManageUsers(session)) {
    return <Navigate to="/settings" replace />;
  }

  const canAdmin = sessionCanAdminUsers(session);
  const name = USER_PROFILE_NAME_EMPTY;
  const roleLabel = displayUserRole(null);
  const statusLabel = userStatusLabel({ blocked: false, active: false });
  const lastActive = userLastActiveLabel(null, null);
  const initial = "?";

  function togglePerm(key: string) {
    if (!canAdmin) return;
    setPermDraft((prev) => ({
      ...prev,
      [key]: !(prev[key] ?? false),
    }));
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
            <span className="user-profile__avatar" aria-hidden="true">
              {initial}
            </span>
            <div className="user-profile__header-main">
              <h2
                className="user-profile__name"
                data-testid="user-profile-name"
              >
                {name}
              </h2>
              <div className="user-profile__pills">
                <span
                  className="user-profile__pill user-profile__pill--live"
                  data-testid="user-profile-role-pill"
                >
                  {roleLabel}
                </span>
                <span
                  className="user-profile__pill user-profile__pill--live"
                  data-testid="user-profile-status-pill"
                >
                  {statusLabel}
                </span>
              </div>
            </div>
          </div>
          <p
            className="user-profile__meta"
            data-testid="user-profile-last-active"
          >
            {USER_PROFILE_LAST_ACTIVE_PREFIX}
            {lastActive}
          </p>
          {/* Warehouse / email / phone appear when WIRE supplies values */}
          <span className="user-profile__warehouse-prefix" hidden>
            {USER_PROFILE_WAREHOUSE_PREFIX}
          </span>
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
          role="tablist"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === "overview"}
            className={
              tab === "overview"
                ? "user-profile__tab-slot user-profile__tab-slot--selected"
                : "user-profile__tab-slot"
            }
            data-testid="user-profile-tab-overview"
            onClick={() => setTab("overview")}
          >
            {USER_PROFILE_TAB_OVERVIEW}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "activity"}
            className={
              tab === "activity"
                ? "user-profile__tab-slot user-profile__tab-slot--selected"
                : "user-profile__tab-slot"
            }
            data-testid="user-profile-tab-activity"
            onClick={() => setTab("activity")}
          >
            {USER_PROFILE_TAB_ACTIVITY}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "permissions"}
            className={
              tab === "permissions"
                ? "user-profile__tab-slot user-profile__tab-slot--selected"
                : "user-profile__tab-slot"
            }
            data-testid="user-profile-tab-permissions"
            onClick={() => setTab("permissions")}
          >
            {USER_PROFILE_TAB_PERMISSIONS}
          </button>
        </nav>

        <section
          className="user-profile__tab-body"
          data-slot="tabBody"
          data-testid="user-profile-tab-body-chrome"
        >
          {tab === "overview" ? (
            <div
              className="user-profile__kpi-grid"
              data-testid="user-profile-kpi-grid"
            >
              {USER_PROFILE_KPI_ORDER.map((key) => (
                <div
                  key={key}
                  className="user-profile__kpi-card"
                  data-testid={`user-profile-kpi-${key}`}
                >
                  <span className="user-profile__kpi-label">
                    {USER_PROFILE_KPI_LABELS[key]}
                  </span>
                  <span className="user-profile__kpi-value">0</span>
                </div>
              ))}
            </div>
          ) : null}

          {tab === "activity" ? (
            <div data-testid="user-profile-activity">
              <div
                className="user-profile__activity-chips"
                data-testid="user-profile-activity-chips"
                role="tablist"
                aria-label="Activity section"
              >
                {USER_ACTIVITY_SECTION_ORDER.map((sec) => {
                  const selected = activitySection === sec;
                  return (
                    <button
                      key={sec}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      className={
                        selected
                          ? "user-profile__activity-chip user-profile__activity-chip--selected"
                          : "user-profile__activity-chip"
                      }
                      data-testid={`user-profile-activity-${sec}`}
                      onClick={() => setActivitySection(sec)}
                    >
                      {USER_ACTIVITY_SECTION_LABELS[sec]}
                    </button>
                  );
                })}
              </div>
              <div
                className="user-profile__activity-panel"
                data-testid="user-profile-activity-panel"
                aria-hidden="true"
              />
            </div>
          ) : null}

          {tab === "permissions" ? (
            <div
              className="user-profile__perms"
              data-testid="user-profile-permissions"
            >
              {USER_PERMISSION_GROUPS.map((group) => (
                <div
                  key={group.title}
                  className="user-profile__perm-group"
                  data-testid={`user-profile-perm-group-${group.title}`}
                >
                  <h3 className="user-profile__perm-group-title">
                    {group.title}
                  </h3>
                  {group.permissions.map((p) => {
                    const checked = permDraft[p.key] ?? false;
                    return (
                      <label
                        key={p.key}
                        className="user-profile__perm-row"
                        data-testid={`user-profile-perm-${p.key}`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={!canAdmin}
                          onChange={() => togglePerm(p.key)}
                        />
                        <span className="user-profile__perm-text">
                          <span className="user-profile__perm-label">
                            {p.label}
                          </span>
                          {p.subtitle ? (
                            <span className="user-profile__perm-sub">
                              {p.subtitle}
                            </span>
                          ) : null}
                        </span>
                      </label>
                    );
                  })}
                </div>
              ))}
              {/* ensure catalog keys reachable for smoke */}
              <span hidden data-perm-keys={permKeys.join(",")} />
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
