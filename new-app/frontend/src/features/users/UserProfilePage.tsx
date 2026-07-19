/**
 * User profile — WIRE (Step 5).
 * Source: user_profile_page.dart AppBar/edit/more/permissions;
 * user_profile_header.dart Edit user + PopupMenu
 */
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { readPrimaryBusiness } from "../../shared/auth/sessionStore";
import {
  sessionCanAdminUsers,
  sessionCanManageUsers,
} from "../../shared/auth/sessionGates";
import {
  USER_PROFILE_BACK_FALLBACK,
  USER_PROFILE_CANCEL,
  USER_PROFILE_COPY_AND_CLOSE,
  USER_PROFILE_DELETE_BODY,
  USER_PROFILE_DELETE_TITLE,
  USER_PROFILE_EDIT_USER,
  USER_PROFILE_EMAIL_COPIED,
  USER_PROFILE_FIELD_EMAIL,
  USER_PROFILE_FIELD_FULL_NAME,
  USER_PROFILE_FIELD_PHONE,
  USER_PROFILE_FIELD_ROLE,
  USER_PROFILE_LAST_ACTIVE_PREFIX,
  USER_PROFILE_LOAD_ERROR,
  USER_PROFILE_LOADING,
  USER_PROFILE_MORE_ACTIVATE,
  USER_PROFILE_MORE_BLOCK,
  USER_PROFILE_MORE_COPY_EMAIL,
  USER_PROFILE_MORE_DEACTIVATE,
  USER_PROFILE_MORE_DELETE,
  USER_PROFILE_MORE_RESET,
  USER_PROFILE_MORE_UNBLOCK,
  USER_PROFILE_NAME_EMPTY,
  USER_PROFILE_NEW_PASSWORD_TITLE,
  USER_PROFILE_NOT_FOUND,
  USER_PROFILE_PERMISSIONS_SAVED,
  USER_PROFILE_RETRY,
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
  type UserProfileKpiKey,
  type UserProfileTab,
} from "./userProfileFields";
import {
  displayUserRole,
  userLastActiveLabel,
  userStatusLabel,
} from "./userLastActive";
import {
  deleteBusinessUser,
  getBusinessUser,
  getUserPermissions,
  patchBusinessUser,
  patchUserPermissions,
  resetBusinessUserPassword,
  UsersApiError,
  UsersNetworkError,
  type BusinessUserProfile,
} from "./usersApi";
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

function actionErrorMessage(error: unknown): string {
  if (error instanceof UsersApiError) return error.detail;
  if (error instanceof UsersNetworkError) return error.message;
  return "Something went wrong. Please try again.";
}

function kpiValue(
  key: UserProfileKpiKey,
  stats: BusinessUserProfile["stats"],
): number {
  switch (key) {
    case "purchases":
      return stats?.purchases_total ?? 0;
    case "stock":
      return stats?.stock_edits_total ?? 0;
    case "items":
      return stats?.items_created_total ?? 0;
    case "scans":
      return stats?.scans_total ?? 0;
    default:
      return 0;
  }
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

type ResetCred = {
  email: string;
  password: string;
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
  const [resetCred, setResetCred] = useState<ResetCred | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [profile, setProfile] = useState<BusinessUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<unknown | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [retryTick, setRetryTick] = useState(0);

  const permKeys = useMemo(() => {
    const keys: string[] = [];
    for (const g of USER_PERMISSION_GROUPS) {
      for (const p of g.permissions) keys.push(p.key);
    }
    return keys;
  }, []);

  const canAdmin = sessionCanAdminUsers(session);
  const businessId = session?.id;

  const loadProfile = useCallback(async () => {
    if (!businessId || !userId) {
      setProfile(null);
      setLoading(false);
      setLoadError(null);
      setNotFound(false);
      return;
    }

    setLoading(true);
    setLoadError(null);
    setNotFound(false);

    try {
      const data = await getBusinessUser({ businessId, userId });
      setProfile(data);

      if (sessionCanAdminUsers(session)) {
        try {
          const perms = await getUserPermissions({ businessId, userId });
          setPermDraft({ ...perms.permissions });
        } catch {
          setPermDraft({});
        }
      }
    } catch (e) {
      setProfile(null);
      if (e instanceof UsersApiError && e.status === 404) {
        setNotFound(true);
      } else {
        setLoadError(e);
      }
    } finally {
      setLoading(false);
    }
  }, [businessId, session, userId]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile, retryTick]);

  if (!sessionCanManageUsers(session)) {
    return <Navigate to="/settings" replace />;
  }

  const profileRole = profile?.role ?? "";
  const isBlocked = profile?.is_blocked ?? false;
  const isActiveComputed =
    (profile?.is_active ?? false) && !isBlocked;
  const profileEmail =
    profile?.email?.trim() ||
    profile?.login_email?.trim() ||
    "";
  const warehouse =
    profile?.warehouse_name?.trim() ||
    profile?.business_name?.trim() ||
    "";
  const phone = profile?.phone?.trim() ?? "";
  const name = profile?.name?.trim() || USER_PROFILE_NAME_EMPTY;
  const roleLabel = displayUserRole(profile?.role);
  const statusLabel = userStatusLabel({
    blocked: isBlocked,
    active: isActiveComputed,
  });
  const lastActive = userLastActiveLabel(
    profile?.last_active_at,
    profile?.created_at,
  );
  const initial =
    name !== USER_PROFILE_NAME_EMPTY
      ? name.charAt(0).toUpperCase()
      : "?";
  const showOwnerExtras = profileRole !== "owner";

  function onRetry() {
    setRetryTick((n) => n + 1);
  }

  function togglePerm(key: string) {
    if (!canAdmin) return;
    setPermDraft((prev) => ({
      ...prev,
      [key]: !(prev[key] ?? false),
    }));
  }

  function openEdit() {
    if (!profile) return;
    setEditDraft({
      fullName: profile.name?.trim() ?? "",
      email: profile.email?.trim() ?? "",
      phone: profile.phone?.trim() ?? "",
      role: profile.role?.trim() || "staff",
    });
    setEditOpen(true);
    setMoreOpen(false);
  }

  async function onSaveChanges() {
    if (!businessId || !userId) return;
    try {
      await patchBusinessUser({
        businessId,
        userId,
        fullName: editDraft.fullName,
        email: editDraft.email,
        phone: editDraft.phone,
        role: editDraft.role,
      });
      setEditOpen(false);
      await loadProfile();
    } catch (e) {
      setToast(actionErrorMessage(e));
    }
  }

  async function onSavePermissions() {
    if (!businessId || !userId || !canAdmin) return;
    try {
      await patchUserPermissions({
        businessId,
        userId,
        permissions: permDraft,
      });
      setToast(USER_PROFILE_PERMISSIONS_SAVED);
      const perms = await getUserPermissions({ businessId, userId });
      setPermDraft({ ...perms.permissions });
    } catch (e) {
      setToast(actionErrorMessage(e));
    }
  }

  async function onMoreAction(action: string) {
    setMoreOpen(false);
    if (!businessId || !userId) return;

    switch (action) {
      case "reset":
        try {
          const out = await resetBusinessUserPassword({ businessId, userId });
          setResetCred({
            email: out.login_email?.trim() ?? profileEmail,
            password: out.new_password,
          });
        } catch (e) {
          setToast(actionErrorMessage(e));
        }
        break;
      case "copy":
        if (!profileEmail) return;
        void navigator.clipboard.writeText(profileEmail).then(
          () => setToast(USER_PROFILE_EMAIL_COPIED),
          () => setToast(USER_PROFILE_EMAIL_COPIED),
        );
        break;
      case "block":
        try {
          await patchBusinessUser({
            businessId,
            userId,
            isBlocked: !isBlocked,
          });
          await loadProfile();
        } catch (e) {
          setToast(actionErrorMessage(e));
        }
        break;
      case "toggle_active":
        try {
          await patchBusinessUser({
            businessId,
            userId,
            isActive: !isActiveComputed,
          });
          await loadProfile();
        } catch (e) {
          setToast(actionErrorMessage(e));
        }
        break;
      case "delete":
        setDeleteOpen(true);
        break;
      default:
        break;
    }
  }

  async function onConfirmDelete() {
    if (!businessId || !userId) return;
    setDeleteOpen(false);
    try {
      await deleteBusinessUser({ businessId, userId });
      popOrGo(navigate, USER_PROFILE_BACK_FALLBACK);
    } catch (e) {
      setToast(actionErrorMessage(e));
    }
  }

  function onCopyResetPassword() {
    if (!resetCred) return;
    void navigator.clipboard.writeText(resetCred.password).then(
      () => setResetCred(null),
      () => setResetCred(null),
    );
  }

  let bodyContent: ReactNode;

  if (loading) {
    bodyContent = (
      <p
        className="user-profile__meta"
        data-testid="user-profile-loading"
      >
        {USER_PROFILE_LOADING}
      </p>
    );
  } else if (notFound) {
    bodyContent = (
      <p
        className="user-profile__meta"
        data-testid="user-profile-not-found"
      >
        {USER_PROFILE_NOT_FOUND}
      </p>
    );
  } else if (loadError) {
    bodyContent = (
      <div data-testid="user-profile-load-error">
        <p className="user-profile__meta">{USER_PROFILE_LOAD_ERROR}</p>
        <button
          type="button"
          className="user-profile__edit-btn"
          data-testid="user-profile-retry"
          onClick={onRetry}
        >
          {USER_PROFILE_RETRY}
        </button>
      </div>
    );
  } else {
    bodyContent = (
      <>
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
          {warehouse ? (
            <p
              className="user-profile__meta"
              data-testid="user-profile-warehouse"
            >
              {USER_PROFILE_WAREHOUSE_PREFIX}
              {warehouse}
            </p>
          ) : null}
          {profileEmail ? (
            <p
              className="user-profile__meta"
              data-testid="user-profile-email"
            >
              {profileEmail}
            </p>
          ) : null}
          {phone && phone !== USER_PROFILE_NAME_EMPTY ? (
            <p
              className="user-profile__meta"
              data-testid="user-profile-phone"
            >
              {phone}
            </p>
          ) : null}
          <p
            className="user-profile__meta"
            data-testid="user-profile-last-active"
          >
            {USER_PROFILE_LAST_ACTIVE_PREFIX}
            {lastActive}
          </p>
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
                      onClick={() => void onMoreAction("reset")}
                    >
                      {USER_PROFILE_MORE_RESET}
                    </MenuItem>
                    <MenuItem
                      testId="user-profile-more-copy"
                      onClick={() => void onMoreAction("copy")}
                    >
                      {USER_PROFILE_MORE_COPY_EMAIL}
                    </MenuItem>
                    {showOwnerExtras ? (
                      <>
                        <MenuItem
                          testId="user-profile-more-block"
                          onClick={() => void onMoreAction("block")}
                        >
                          {isBlocked
                            ? USER_PROFILE_MORE_UNBLOCK
                            : USER_PROFILE_MORE_BLOCK}
                        </MenuItem>
                        <MenuItem
                          testId="user-profile-more-active"
                          onClick={() => void onMoreAction("toggle_active")}
                        >
                          {isActiveComputed
                            ? USER_PROFILE_MORE_DEACTIVATE
                            : USER_PROFILE_MORE_ACTIVATE}
                        </MenuItem>
                        <MenuItem
                          testId="user-profile-more-delete"
                          danger
                          onClick={() => void onMoreAction("delete")}
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
                  <span className="user-profile__kpi-value">
                    {kpiValue(key, profile?.stats ?? null)}
                  </span>
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
                  onClick={() => void onSavePermissions()}
                >
                  {USER_PROFILE_SAVE_PERMISSIONS}
                </button>
              ) : null}
              <span hidden data-perm-keys={permKeys.join(",")} />
            </div>
          ) : null}
        </section>
      </>
    );
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

      <div className="user-profile__body">{bodyContent}</div>

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
              onClick={() => void onSaveChanges()}
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
                onClick={() => void onConfirmDelete()}
              >
                {USER_PROFILE_MORE_DELETE}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {resetCred ? (
        <div
          className="user-profile__overlay"
          data-testid="user-profile-reset-dialog"
          role="dialog"
          aria-modal="true"
          aria-label={USER_PROFILE_NEW_PASSWORD_TITLE}
        >
          <button
            type="button"
            className="user-profile__overlay-scrim"
            aria-label="Close"
            onClick={() => setResetCred(null)}
          />
          <div className="user-profile__drawer user-profile__drawer--dialog">
            <h2 className="user-profile__drawer-title">
              {USER_PROFILE_NEW_PASSWORD_TITLE}
            </h2>
            {resetCred.email ? (
              <p className="user-profile__dialog-body">
                Email: {resetCred.email}
              </p>
            ) : null}
            <p className="user-profile__dialog-body">
              Password: {resetCred.password}
            </p>
            <button
              type="button"
              className="user-profile__drawer-btn user-profile__drawer-btn--filled"
              data-testid="user-profile-reset-copy"
              onClick={onCopyResetPassword}
            >
              {USER_PROFILE_COPY_AND_CLOSE}
            </button>
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
