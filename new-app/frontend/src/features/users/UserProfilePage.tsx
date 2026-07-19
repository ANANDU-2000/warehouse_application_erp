/**
 * User profile — BUTTONS (Step 4).
 * Source: user_profile_page.dart AppBar/edit/more/permissions;
 * user_profile_header.dart Edit user + PopupMenu
 * Local CTAs only — no fetch (WIRE).
 */
import { useMemo, useState, type ReactNode } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { readPrimaryBusiness } from "../../shared/auth/sessionStore";
import {
  sessionCanAdminUsers,
  sessionCanManageUsers,
} from "../../shared/auth/sessionGates";
import {
  USER_PROFILE_BACK_FALLBACK,
  USER_PROFILE_CANCEL,
  USER_PROFILE_DELETE_BODY,
  USER_PROFILE_DELETE_TITLE,
  USER_PROFILE_EDIT_USER,
  USER_PROFILE_EMAIL_COPIED,
  USER_PROFILE_FIELD_EMAIL,
  USER_PROFILE_FIELD_FULL_NAME,
  USER_PROFILE_FIELD_PHONE,
  USER_PROFILE_FIELD_ROLE,
  USER_PROFILE_LAST_ACTIVE_PREFIX,
  USER_PROFILE_MORE_ACTIVATE,
  USER_PROFILE_MORE_BLOCK,
  USER_PROFILE_MORE_COPY_EMAIL,
  USER_PROFILE_MORE_DEACTIVATE,
  USER_PROFILE_MORE_DELETE,
  USER_PROFILE_MORE_RESET,
  USER_PROFILE_MORE_UNBLOCK,
  USER_PROFILE_NAME_EMPTY,
  USER_PROFILE_PERMISSIONS_SAVED,
  USER_PROFILE_ROLE_ADMIN,
  USER_PROFILE_ROLE_MANAGER,
  USER_PROFILE_ROLE_STAFF,
  USER_PROFILE_SAVE_CHANGES,
  USER_PROFILE_SAVE_PERMISSIONS,
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
import {
  displayUserRole,
  userLastActiveLabel,
  userStatusLabel,
} from "./userLastActive";
import "./UserProfilePage.css";

function popOrGo(
  navigate: ReturnType<typeof useNavigate>,
  fallback: string,
): void {
  const idx =
    typeof window !== "undefined" &&
    window.history.state &&
    typeof (window.history.state as { idx?: unknown }).idx === "number"
      ? (window.history.state as { idx: number }).idx
      : 0;
  if (idx > 0) {
    navigate(-1);
    return;
  }
  navigate(fallback, { replace: true });
}

type EditDraft = {
  fullName: string;
  email: string;
  phone: string;
  role: string;
};

const EMPTY_EDIT: EditDraft = {
  fullName: "",
  email: "",
  phone: "",
  role: "staff",
};

export function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const session = readPrimaryBusiness();
  const [tab, setTab] = useState<UserProfileTab>("overview");
  const [activitySection, setActivitySection] =
    useState<UserActivitySection>("feed");
  const [permDraft, setPermDraft] = useState<Record<string, boolean>>({});
  const [editOpen, setEditOpen] = useState(false);
  const [editDraft, setEditDraft] = useState<EditDraft>(EMPTY_EDIT);
  const [moreOpen, setMoreOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  /** Until WIRE: treat as non-owner inactive unblocked for menu labels. */
  const profileRole: string = "staff";
  const isBlocked = false;
  const isActive = false;
  const profileEmail = "";

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
  const showOwnerExtras = profileRole !== "owner";

  function togglePerm(key: string) {
    if (!canAdmin) return;
    setPermDraft((prev) => ({
      ...prev,
      [key]: !(prev[key] ?? false),
    }));
  }

  function openEdit() {
    setEditDraft({ ...EMPTY_EDIT });
    setEditOpen(true);
    setMoreOpen(false);
  }

  function onSaveChanges() {
    /* PATCH user — WIRE */
    setEditOpen(false);
  }

  function onSavePermissions() {
    /* PATCH permissions — WIRE */
    setToast(USER_PROFILE_PERMISSIONS_SAVED);
  }

  function onMoreAction(action: string) {
    setMoreOpen(false);
    switch (action) {
      case "reset":
        /* POST reset-password — WIRE */
        break;
      case "copy":
        if (!profileEmail) return;
        void navigator.clipboard.writeText(profileEmail).then(
          () => setToast(USER_PROFILE_EMAIL_COPIED),
          () => setToast(USER_PROFILE_EMAIL_COPIED),
        );
        break;
      case "block":
      case "toggle_active":
        /* PATCH — WIRE */
        break;
      case "delete":
        setDeleteOpen(true);
        break;
      default:
        break;
    }
  }

  function onConfirmDelete() {
    setDeleteOpen(false);
    /* DELETE — WIRE; then popOrGo list */
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
          <button
            type="button"
            className="user-profile__icon-btn user-profile__icon-btn--active"
            title={USER_PROFILE_TOOLTIP_BACK}
            aria-label={USER_PROFILE_TOOLTIP_BACK}
            data-testid="user-profile-back"
            onClick={() => popOrGo(navigate, USER_PROFILE_BACK_FALLBACK)}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path
                fill="currentColor"
                d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
              />
            </svg>
          </button>
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
          <span className="user-profile__warehouse-prefix" hidden>
            {USER_PROFILE_WAREHOUSE_PREFIX}
          </span>
          {canAdmin ? (
            <div
              className="user-profile__admin-row"
              data-testid="user-profile-admin-chrome"
            >
              <button
                type="button"
                className="user-profile__edit-btn"
                data-testid="user-profile-edit"
                onClick={openEdit}
              >
                {USER_PROFILE_EDIT_USER}
              </button>
              <div className="user-profile__more-wrap">
                <button
                  type="button"
                  className="user-profile__more-btn"
                  title={USER_PROFILE_TOOLTIP_MORE}
                  aria-label={USER_PROFILE_TOOLTIP_MORE}
                  aria-expanded={moreOpen}
                  data-testid="user-profile-more"
                  onClick={() => setMoreOpen((v) => !v)}
                >
                  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                    <path
                      fill="currentColor"
                      d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
                    />
                  </svg>
                </button>
                {moreOpen ? (
                  <div
                    className="user-profile__more-menu"
                    role="menu"
                    data-testid="user-profile-more-menu"
                  >
                    <MenuItem
                      testId="user-profile-more-reset"
                      onClick={() => onMoreAction("reset")}
                    >
                      {USER_PROFILE_MORE_RESET}
                    </MenuItem>
                    <MenuItem
                      testId="user-profile-more-copy"
                      onClick={() => onMoreAction("copy")}
                    >
                      {USER_PROFILE_MORE_COPY_EMAIL}
                    </MenuItem>
                    {showOwnerExtras ? (
                      <>
                        <MenuItem
                          testId="user-profile-more-block"
                          onClick={() => onMoreAction("block")}
                        >
                          {isBlocked
                            ? USER_PROFILE_MORE_UNBLOCK
                            : USER_PROFILE_MORE_BLOCK}
                        </MenuItem>
                        <MenuItem
                          testId="user-profile-more-active"
                          onClick={() => onMoreAction("toggle_active")}
                        >
                          {isActive
                            ? USER_PROFILE_MORE_DEACTIVATE
                            : USER_PROFILE_MORE_ACTIVATE}
                        </MenuItem>
                        <MenuItem
                          testId="user-profile-more-delete"
                          danger
                          onClick={() => onMoreAction("delete")}
                        >
                          {USER_PROFILE_MORE_DELETE}
                        </MenuItem>
                      </>
                    ) : null}
                  </div>
                ) : null}
              </div>
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
              {canAdmin ? (
                <button
                  type="button"
                  className="user-profile__save-perms"
                  data-testid="user-profile-save-permissions"
                  onClick={onSavePermissions}
                >
                  {USER_PROFILE_SAVE_PERMISSIONS}
                </button>
              ) : null}
              <span hidden data-perm-keys={permKeys.join(",")} />
            </div>
          ) : null}
        </section>
      </div>

      {editOpen ? (
        <div
          className="user-profile__overlay"
          data-testid="user-profile-edit-sheet"
          role="dialog"
          aria-modal="true"
          aria-label={USER_PROFILE_EDIT_USER}
        >
          <button
            type="button"
            className="user-profile__overlay-scrim"
            aria-label="Close"
            onClick={() => setEditOpen(false)}
          />
          <div className="user-profile__drawer">
            <h2 className="user-profile__drawer-title">{USER_PROFILE_EDIT_USER}</h2>
            <label className="user-profile__field">
              {USER_PROFILE_FIELD_FULL_NAME}
              <input
                value={editDraft.fullName}
                onChange={(e) =>
                  setEditDraft((d) => ({ ...d, fullName: e.target.value }))
                }
                data-testid="user-profile-edit-name"
              />
            </label>
            <label className="user-profile__field">
              {USER_PROFILE_FIELD_EMAIL}
              <input
                value={editDraft.email}
                onChange={(e) =>
                  setEditDraft((d) => ({ ...d, email: e.target.value }))
                }
                data-testid="user-profile-edit-email"
              />
            </label>
            <label className="user-profile__field">
              {USER_PROFILE_FIELD_PHONE}
              <input
                value={editDraft.phone}
                onChange={(e) =>
                  setEditDraft((d) => ({ ...d, phone: e.target.value }))
                }
                data-testid="user-profile-edit-phone"
              />
            </label>
            {showOwnerExtras ? (
              <label className="user-profile__field">
                {USER_PROFILE_FIELD_ROLE}
                <select
                  value={editDraft.role}
                  onChange={(e) =>
                    setEditDraft((d) => ({ ...d, role: e.target.value }))
                  }
                  data-testid="user-profile-edit-role"
                >
                  <option value="staff">{USER_PROFILE_ROLE_STAFF}</option>
                  <option value="manager">{USER_PROFILE_ROLE_MANAGER}</option>
                  <option value="admin">{USER_PROFILE_ROLE_ADMIN}</option>
                </select>
              </label>
            ) : null}
            <button
              type="button"
              className="user-profile__drawer-btn user-profile__drawer-btn--filled"
              data-testid="user-profile-save-changes"
              onClick={onSaveChanges}
            >
              {USER_PROFILE_SAVE_CHANGES}
            </button>
          </div>
        </div>
      ) : null}

      {deleteOpen ? (
        <div
          className="user-profile__overlay"
          data-testid="user-profile-delete-dialog"
          role="dialog"
          aria-modal="true"
          aria-label={USER_PROFILE_DELETE_TITLE}
        >
          <button
            type="button"
            className="user-profile__overlay-scrim"
            aria-label="Close"
            onClick={() => setDeleteOpen(false)}
          />
          <div className="user-profile__drawer user-profile__drawer--dialog">
            <h2 className="user-profile__drawer-title">
              {USER_PROFILE_DELETE_TITLE}
            </h2>
            <p className="user-profile__dialog-body">{USER_PROFILE_DELETE_BODY}</p>
            <div className="user-profile__drawer-actions">
              <button
                type="button"
                className="user-profile__drawer-btn user-profile__drawer-btn--outline"
                data-testid="user-profile-delete-cancel"
                onClick={() => setDeleteOpen(false)}
              >
                {USER_PROFILE_CANCEL}
              </button>
              <button
                type="button"
                className="user-profile__drawer-btn user-profile__drawer-btn--danger"
                data-testid="user-profile-delete-confirm"
                onClick={onConfirmDelete}
              >
                {USER_PROFILE_MORE_DELETE}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className="user-profile__toast" role="status">
          {toast}
          <button type="button" onClick={() => setToast(null)}>
            ×
          </button>
        </div>
      ) : null}
    </div>
  );
}

function MenuItem({
  children,
  onClick,
  testId,
  danger,
}: {
  children: ReactNode;
  onClick: () => void;
  testId: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      className={
        danger
          ? "user-profile__menu-item user-profile__menu-item--danger"
          : "user-profile__menu-item"
      }
      data-testid={testId}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
