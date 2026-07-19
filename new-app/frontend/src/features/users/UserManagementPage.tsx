/**
 * Users list — WIRE (Step 5).
 * Source: business_users_provider + hexa_api list/create/bulk; user_management_page.dart
 * Full skeleton / FriendlyLoadError → STATES.
 */
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { readPrimaryBusiness } from "../../shared/auth/sessionStore";
import {
  sessionCanAdminUsers,
  sessionCanCreateUsers,
  sessionCanManageUsers,
} from "../../shared/auth/sessionGates";
import {
  USERS_MGMT_ADD_LABEL,
  USERS_MGMT_ADD_SHEET_TITLE,
  USERS_MGMT_BACK_FALLBACK,
  USERS_MGMT_BULK_ACTIVATE,
  USERS_MGMT_BULK_BLOCK,
  USERS_MGMT_BULK_DEACTIVATE,
  USERS_MGMT_BULK_DELETE,
  USERS_MGMT_CREATE_CANCEL,
  USERS_MGMT_CREATE_USER,
  USERS_MGMT_CREDENTIALS_COPIED,
  USERS_MGMT_CREDENTIALS_COPY,
  USERS_MGMT_CREDENTIALS_DONE,
  USERS_MGMT_CREDENTIALS_TITLE,
  USERS_MGMT_EMPTY_FILTERS,
  USERS_MGMT_FIELD_ACTIVE,
  USERS_MGMT_FIELD_EMAIL,
  USERS_MGMT_FIELD_FULL_NAME,
  USERS_MGMT_FIELD_NOTES,
  USERS_MGMT_FIELD_PASSWORD,
  USERS_MGMT_FIELD_PHONE,
  USERS_MGMT_FIELD_ROLE,
  USERS_MGMT_FILTER_APPLY,
  USERS_MGMT_FILTER_CLEAR,
  USERS_MGMT_FILTER_HEADING,
  USERS_MGMT_LOAD_ERROR,
  USERS_MGMT_LOADING,
  USERS_MGMT_PASSWORD_HELPER,
  USERS_MGMT_ROLE_ADMIN_OWNER,
  USERS_MGMT_ROLE_MANAGER,
  USERS_MGMT_ROLE_STAFF,
  USERS_MGMT_SEARCH_HINT,
  USERS_MGMT_TITLE,
  USERS_MGMT_TOOLTIP_BACK,
  USERS_MGMT_TOOLTIP_EXIT_SELECT,
  USERS_MGMT_TOOLTIP_FILTER,
  USERS_MGMT_TOOLTIP_REFRESH,
  USERS_MGMT_TOOLTIP_SELECT,
  USERS_MGMT_USER_CREATED,
} from "./usersManagementCopy";
import {
  USER_LIST_PRIMARY_LABELS,
  USER_LIST_PRIMARY_ORDER,
  applyUserListFilters,
  copyUserListFilter,
  countForPrimaryFilter,
  DEFAULT_USER_LIST_FILTER,
  drawerActiveCount,
  type UserListFilterState,
  type UserListPrimaryFilter,
} from "./userListFilters";
import {
  bulkBusinessUsers,
  createBusinessUser,
  listBusinessUsers,
  UsersApiError,
  UsersNetworkError,
  type BusinessUserListItem,
} from "./usersApi";
import { UserCompactCard } from "./UserCompactCard";
import "./UserManagementPage.css";

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

function IconBtn({
  className,
  label,
  onClick,
  children,
  testId,
  disabled,
}: {
  className: string;
  label: string;
  onClick: () => void;
  children: ReactNode;
  testId?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className={`users-mgmt__icon-btn ${className}`}
      title={label}
      aria-label={label}
      onClick={onClick}
      data-testid={testId}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

type CreateDraft = {
  fullName: string;
  email: string;
  phone: string;
  notes: string;
  role: "staff" | "manager" | "admin";
  password: string;
  active: boolean;
};

const EMPTY_CREATE: CreateDraft = {
  fullName: "",
  email: "",
  phone: "",
  notes: "",
  role: "staff",
  password: "",
  active: true,
};

type CredShare = {
  name: string;
  loginEmail: string;
  password: string;
  phone: string;
};

export function UserManagementPage() {
  const navigate = useNavigate();
  const session = readPrimaryBusiness();
  const [filter, setFilter] = useState<UserListFilterState>(
    DEFAULT_USER_LIST_FILTER,
  );
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [filterOpen, setFilterOpen] = useState(false);
  const [draftRoles, setDraftRoles] = useState<Set<string>>(() => new Set());
  const [createOpen, setCreateOpen] = useState(false);
  const [createDraft, setCreateDraft] = useState<CreateDraft>(EMPTY_CREATE);
  const [createSaving, setCreateSaving] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [credShare, setCredShare] = useState<CredShare | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [rows, setRows] = useState<BusinessUserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryTick, setRetryTick] = useState(0);
  const [bulkBusy, setBulkBusy] = useState(false);

  const loadUsers = useCallback(async () => {
    if (!session?.id) {
      setRows([]);
      setLoading(false);
      setLoadError("Not signed in");
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const list = await listBusinessUsers({
        businessId: session.id,
        includeInactive: true,
      });
      setRows(list);
    } catch (e) {
      const msg =
        e instanceof UsersApiError || e instanceof UsersNetworkError
          ? e.message
          : USERS_MGMT_LOAD_ERROR;
      setLoadError(msg);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [session?.id]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers, retryTick]);

  const filtered = useMemo(
    () => applyUserListFilters(rows, filter),
    [rows, filter],
  );

  if (!sessionCanManageUsers(session)) {
    return <Navigate to="/settings" replace />;
  }

  const canAdmin = sessionCanAdminUsers(session);
  const canCreate = sessionCanCreateUsers(session);
  const roleBadge = drawerActiveCount(filter.roles);
  const businessId = session!.id;

  function setPrimary(primary: UserListPrimaryFilter) {
    setFilter((prev) => copyUserListFilter(prev, { primary }));
  }

  function setSearch(search: string) {
    setFilter((prev) => copyUserListFilter(prev, { search }));
  }

  function onLeading() {
    if (selectMode) {
      setSelectMode(false);
      setSelected(new Set());
      return;
    }
    popOrGo(navigate, USERS_MGMT_BACK_FALLBACK);
  }

  function onToggleSelect() {
    setSelectMode((prev) => {
      if (prev) {
        setSelected(new Set());
        return false;
      }
      return true;
    });
  }

  function onRefresh() {
    setRetryTick((n) => n + 1);
  }

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function onBulkAction(
    action: "activate" | "deactivate" | "block" | "delete",
  ) {
    if (selected.size === 0 || bulkBusy) return;
    setBulkBusy(true);
    try {
      await bulkBusinessUsers({
        businessId,
        userIds: [...selected],
        action,
      });
      setSelectMode(false);
      setSelected(new Set());
      await loadUsers();
    } catch (e) {
      const msg =
        e instanceof UsersApiError || e instanceof UsersNetworkError
          ? e.message
          : "Bulk action failed";
      setToast(msg);
    } finally {
      setBulkBusy(false);
    }
  }

  function openFilterDrawer() {
    setDraftRoles(new Set(filter.roles));
    setFilterOpen(true);
  }

  function toggleDraftRole(role: string) {
    setDraftRoles((prev) => {
      const next = new Set(prev);
      if (next.has(role)) next.delete(role);
      else next.add(role);
      return next;
    });
  }

  function applyFilterRoles() {
    setFilter((prev) =>
      copyUserListFilter(prev, { roles: new Set(draftRoles) }),
    );
    setFilterOpen(false);
  }

  function openCreate() {
    setCreateDraft(EMPTY_CREATE);
    setCreateError(null);
    setCreateOpen(true);
  }

  async function onCreateSubmit() {
    if (createSaving) return;
    const name = createDraft.fullName.trim();
    const email = createDraft.email.trim();
    const phone = createDraft.phone.trim();
    if (!name || email.length < 5 || phone.length < 6) {
      setCreateError("Full name, email, and phone are required");
      return;
    }
    setCreateSaving(true);
    setCreateError(null);
    try {
      const body = await createBusinessUser({
        businessId,
        fullName: name,
        email,
        phone,
        role: createDraft.role,
        notes: createDraft.notes.trim() || null,
        password: createDraft.password.trim() || null,
        isActive: createDraft.active,
      });
      setCreateOpen(false);
      await loadUsers();
      const user = body.user;
      const gen = body.generated_password?.toString();
      const pwd =
        gen ||
        (createDraft.password.trim() ? createDraft.password.trim() : null);
      const loginEmail =
        body.login_email?.toString() ||
        user?.email?.toString() ||
        email;
      if (pwd) {
        setCredShare({
          name: user?.name || name,
          loginEmail,
          password: pwd,
          phone,
        });
      } else {
        setToast(USERS_MGMT_USER_CREATED);
      }
    } catch (e) {
      const msg =
        e instanceof UsersApiError || e instanceof UsersNetworkError
          ? e.message
          : "Could not create user";
      setCreateError(msg);
    } finally {
      setCreateSaving(false);
    }
  }

  async function copyCredentials() {
    if (!credShare) return;
    const lines = [
      "Harisree workspace login",
      `Name: ${credShare.name}`,
      `Email: ${credShare.loginEmail}`,
      `Password: ${credShare.password}`,
      ...(credShare.phone ? [`Phone: ${credShare.phone}`] : []),
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setToast(USERS_MGMT_CREDENTIALS_COPIED);
    } catch {
      setToast(USERS_MGMT_CREDENTIALS_COPIED);
    }
  }

  const titleText = selectMode
    ? `${selected.size} selected`
    : USERS_MGMT_TITLE;

  return (
    <div className="users-mgmt" data-testid="user-management-page">
      <header className="users-mgmt__appbar" data-slot="appBar">
        <div className="users-mgmt__appbar-leading" data-slot="appBar.leading">
          <IconBtn
            className="users-mgmt__icon--back"
            label={
              selectMode
                ? USERS_MGMT_TOOLTIP_EXIT_SELECT
                : USERS_MGMT_TOOLTIP_BACK
            }
            onClick={onLeading}
            testId="users-mgmt-back"
          >
            {selectMode ? (
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
                />
              </svg>
            )}
          </IconBtn>
        </div>
        <h1 className="users-mgmt__title">{titleText}</h1>
        <div className="users-mgmt__appbar-actions" data-slot="appBar.actions">
          {canAdmin ? (
            <IconBtn
              className="users-mgmt__icon--select"
              label={
                selectMode
                  ? USERS_MGMT_TOOLTIP_EXIT_SELECT
                  : USERS_MGMT_TOOLTIP_SELECT
              }
              onClick={onToggleSelect}
              testId="users-mgmt-select"
            >
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M22 7h-9v2h9V7zm0 8h-9v2h9v-2zM5.5 3C4.12 3 3 4.12 3 5.5S4.12 8 5.5 8 8 6.88 8 5.5 6.88 3 5.5 3zM7.5 14c-.83 0-1.5.67-1.5 1.5v5c0 .83.67 1.5 1.5 1.5h1c.83 0 1.5-.67 1.5-1.5v-5c0-.83-.67-1.5-1.5-1.5h-1zm6.5-7.5C14 5.67 13.33 5 12.5 5h-1C10.67 5 10 5.67 10 6.5v5c0 .83.67 1.5 1.5 1.5h1c.83 0 1.5-.67 1.5-1.5v-5zM5.5 10C4.12 10 3 11.12 3 12.5S4.12 15 5.5 15 8 13.88 8 12.5 6.88 10 5.5 10z"
                />
              </svg>
            </IconBtn>
          ) : null}
          <IconBtn
            className="users-mgmt__icon--refresh"
            label={USERS_MGMT_TOOLTIP_REFRESH}
            onClick={onRefresh}
            testId="users-mgmt-refresh"
            disabled={loading}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path
                fill="currentColor"
                d="M17.65 6.35A7.95 7.95 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"
              />
            </svg>
          </IconBtn>
          {canCreate && !selectMode ? (
            <button
              type="button"
              className="users-mgmt__add users-mgmt__add--btn"
              title={USERS_MGMT_ADD_LABEL}
              aria-label={USERS_MGMT_ADD_LABEL}
              onClick={openCreate}
              data-testid="users-mgmt-add"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                />
              </svg>
              <span className="users-mgmt__add-label">{USERS_MGMT_ADD_LABEL}</span>
            </button>
          ) : null}
        </div>
      </header>

      <div className="users-mgmt__body">
        <div
          className="users-mgmt__search-filter"
          data-slot="searchFilter"
          data-testid="users-mgmt-search-chrome"
        >
          <div className="users-mgmt__search-row">
            <label className="users-mgmt__search-field">
              <span className="users-mgmt__search-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path
                    fill="currentColor"
                    d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
                  />
                </svg>
              </span>
              <input
                type="text"
                className="users-mgmt__search-input"
                placeholder={USERS_MGMT_SEARCH_HINT}
                value={filter.search}
                onChange={(e) => setSearch(e.target.value)}
                data-testid="users-mgmt-search-input"
                aria-label={USERS_MGMT_SEARCH_HINT}
              />
            </label>
            <button
              type="button"
              className="users-mgmt__icon-btn users-mgmt__icon--filter"
              title={USERS_MGMT_TOOLTIP_FILTER}
              aria-label={USERS_MGMT_TOOLTIP_FILTER}
              onClick={openFilterDrawer}
              data-testid="users-mgmt-filter"
            >
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"
                />
              </svg>
              {roleBadge > 0 ? (
                <span
                  className="users-mgmt__filter-badge"
                  data-testid="users-mgmt-filter-badge"
                >
                  {roleBadge}
                </span>
              ) : null}
            </button>
          </div>
        </div>

        <div
          className="users-mgmt__status-chips"
          data-slot="statusChips"
          data-testid="users-mgmt-chips-chrome"
          role="tablist"
          aria-label="User status filter"
        >
          {USER_LIST_PRIMARY_ORDER.map((key) => {
            const selectedChip = filter.primary === key;
            const count = countForPrimaryFilter(rows, key);
            const label = USER_LIST_PRIMARY_LABELS[key];
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={selectedChip}
                className={
                  selectedChip
                    ? "users-mgmt__chip users-mgmt__chip--selected"
                    : "users-mgmt__chip"
                }
                data-testid={`users-mgmt-chip-${key}`}
                onClick={() => setPrimary(key)}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>

        <div className="users-mgmt__split">
          <section
            className="users-mgmt__list users-mgmt__list--live"
            data-slot="list"
            data-testid="users-mgmt-list-chrome"
          >
            {loading ? (
              <p className="users-mgmt__status-msg" data-testid="users-mgmt-loading">
                {USERS_MGMT_LOADING}
              </p>
            ) : loadError ? (
              <div className="users-mgmt__status-msg" data-testid="users-mgmt-error">
                <p>{USERS_MGMT_LOAD_ERROR}</p>
                <p>{loadError}</p>
                <button
                  type="button"
                  className="users-mgmt__drawer-btn users-mgmt__drawer-btn--filled"
                  onClick={() => setRetryTick((n) => n + 1)}
                >
                  Retry
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <p className="users-mgmt__status-msg" data-testid="users-mgmt-empty">
                {USERS_MGMT_EMPTY_FILTERS}
              </p>
            ) : (
              filtered.map((u) => {
                const id = u.id;
                return (
                  <UserCompactCard
                    key={id}
                    user={u}
                    selectMode={selectMode}
                    selected={selected.has(id)}
                    onToggleSelect={() => toggleSelected(id)}
                    onTap={() => {
                      if (selectMode) {
                        toggleSelected(id);
                      } else {
                        navigate(`/settings/users/${encodeURIComponent(id)}`);
                      }
                    }}
                  />
                );
              })
            )}
          </section>
          <aside
            className="users-mgmt__detail"
            data-slot="detailPanel"
            data-testid="users-mgmt-detail-chrome"
            aria-hidden="true"
          />
        </div>
      </div>

      {selectMode && canAdmin ? (
        <footer
          className="users-mgmt__bulk users-mgmt__bulk--active"
          data-slot="bulkBar"
          data-testid="users-mgmt-bulk-chrome"
        >
          <button
            type="button"
            className="users-mgmt__bulk-btn"
            data-testid="users-mgmt-bulk-activate"
            disabled={bulkBusy || selected.size === 0}
            onClick={() => void onBulkAction("activate")}
          >
            {USERS_MGMT_BULK_ACTIVATE}
          </button>
          <button
            type="button"
            className="users-mgmt__bulk-btn"
            data-testid="users-mgmt-bulk-deactivate"
            disabled={bulkBusy || selected.size === 0}
            onClick={() => void onBulkAction("deactivate")}
          >
            {USERS_MGMT_BULK_DEACTIVATE}
          </button>
          <button
            type="button"
            className="users-mgmt__bulk-btn"
            data-testid="users-mgmt-bulk-block"
            disabled={bulkBusy || selected.size === 0}
            onClick={() => void onBulkAction("block")}
          >
            {USERS_MGMT_BULK_BLOCK}
          </button>
          <button
            type="button"
            className="users-mgmt__bulk-btn"
            data-testid="users-mgmt-bulk-delete"
            disabled={bulkBusy || selected.size === 0}
            onClick={() => void onBulkAction("delete")}
          >
            {USERS_MGMT_BULK_DELETE}
          </button>
        </footer>
      ) : (
        <footer
          className="users-mgmt__bulk"
          data-slot="bulkBar"
          data-testid="users-mgmt-bulk-chrome"
          aria-hidden="true"
        />
      )}

      {filterOpen ? (
        <div
          className="users-mgmt__overlay"
          data-testid="users-mgmt-filter-drawer"
          role="dialog"
          aria-modal="true"
          aria-labelledby="users-mgmt-filter-heading"
        >
          <button
            type="button"
            className="users-mgmt__overlay-scrim"
            aria-label="Close"
            onClick={() => setFilterOpen(false)}
          />
          <div className="users-mgmt__drawer">
            <h2
              id="users-mgmt-filter-heading"
              className="users-mgmt__drawer-title"
            >
              {USERS_MGMT_FILTER_HEADING}
            </h2>
            <label className="users-mgmt__check">
              <input
                type="checkbox"
                checked={draftRoles.has("staff")}
                onChange={() => toggleDraftRole("staff")}
              />
              {USERS_MGMT_ROLE_STAFF}
            </label>
            <label className="users-mgmt__check">
              <input
                type="checkbox"
                checked={draftRoles.has("manager")}
                onChange={() => toggleDraftRole("manager")}
              />
              {USERS_MGMT_ROLE_MANAGER}
            </label>
            <label className="users-mgmt__check">
              <input
                type="checkbox"
                checked={draftRoles.has("admin")}
                onChange={() => toggleDraftRole("admin")}
              />
              {USERS_MGMT_ROLE_ADMIN_OWNER}
            </label>
            <div className="users-mgmt__drawer-actions">
              <button
                type="button"
                className="users-mgmt__drawer-btn users-mgmt__drawer-btn--outline"
                data-testid="users-mgmt-filter-clear"
                onClick={() => setDraftRoles(new Set())}
              >
                {USERS_MGMT_FILTER_CLEAR}
              </button>
              <button
                type="button"
                className="users-mgmt__drawer-btn users-mgmt__drawer-btn--filled"
                data-testid="users-mgmt-filter-apply"
                onClick={applyFilterRoles}
              >
                {USERS_MGMT_FILTER_APPLY}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {createOpen ? (
        <div
          className="users-mgmt__overlay"
          data-testid="users-mgmt-create-sheet"
          role="dialog"
          aria-modal="true"
          aria-labelledby="users-mgmt-create-heading"
        >
          <button
            type="button"
            className="users-mgmt__overlay-scrim"
            aria-label="Close"
            onClick={() => setCreateOpen(false)}
          />
          <div className="users-mgmt__sheet">
            <h2
              id="users-mgmt-create-heading"
              className="users-mgmt__drawer-title"
            >
              {USERS_MGMT_ADD_SHEET_TITLE}
            </h2>
            {createError ? (
              <p className="users-mgmt__form-error">{createError}</p>
            ) : null}
            <label className="users-mgmt__field">
              <span>{USERS_MGMT_FIELD_FULL_NAME}</span>
              <input
                type="text"
                value={createDraft.fullName}
                onChange={(e) =>
                  setCreateDraft((d) => ({ ...d, fullName: e.target.value }))
                }
              />
            </label>
            <label className="users-mgmt__field">
              <span>{USERS_MGMT_FIELD_EMAIL}</span>
              <input
                type="email"
                value={createDraft.email}
                onChange={(e) =>
                  setCreateDraft((d) => ({ ...d, email: e.target.value }))
                }
              />
            </label>
            <label className="users-mgmt__field">
              <span>{USERS_MGMT_FIELD_PHONE}</span>
              <input
                type="tel"
                value={createDraft.phone}
                onChange={(e) =>
                  setCreateDraft((d) => ({ ...d, phone: e.target.value }))
                }
              />
            </label>
            <label className="users-mgmt__field">
              <span>{USERS_MGMT_FIELD_NOTES}</span>
              <textarea
                rows={2}
                value={createDraft.notes}
                onChange={(e) =>
                  setCreateDraft((d) => ({ ...d, notes: e.target.value }))
                }
              />
            </label>
            <label className="users-mgmt__field">
              <span>{USERS_MGMT_FIELD_ROLE}</span>
              <select
                value={createDraft.role}
                onChange={(e) =>
                  setCreateDraft((d) => ({
                    ...d,
                    role: e.target.value as CreateDraft["role"],
                  }))
                }
              >
                <option value="staff">{USERS_MGMT_ROLE_STAFF}</option>
                <option value="manager">{USERS_MGMT_ROLE_MANAGER}</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <label className="users-mgmt__field">
              <span>{USERS_MGMT_FIELD_PASSWORD}</span>
              <input
                type="password"
                value={createDraft.password}
                onChange={(e) =>
                  setCreateDraft((d) => ({ ...d, password: e.target.value }))
                }
              />
              <span className="users-mgmt__field-hint">
                {USERS_MGMT_PASSWORD_HELPER}
              </span>
            </label>
            <label className="users-mgmt__check">
              <input
                type="checkbox"
                checked={createDraft.active}
                onChange={(e) =>
                  setCreateDraft((d) => ({ ...d, active: e.target.checked }))
                }
              />
              {USERS_MGMT_FIELD_ACTIVE}
            </label>
            <div className="users-mgmt__drawer-actions">
              <button
                type="button"
                className="users-mgmt__drawer-btn users-mgmt__drawer-btn--outline"
                data-testid="users-mgmt-create-cancel"
                onClick={() => setCreateOpen(false)}
              >
                {USERS_MGMT_CREATE_CANCEL}
              </button>
              <button
                type="button"
                className="users-mgmt__drawer-btn users-mgmt__drawer-btn--filled"
                data-testid="users-mgmt-create-submit"
                disabled={createSaving}
                onClick={() => void onCreateSubmit()}
              >
                {USERS_MGMT_CREATE_USER}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {credShare ? (
        <div
          className="users-mgmt__overlay"
          data-testid="users-mgmt-cred-dialog"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="users-mgmt__overlay-scrim"
            aria-label="Close"
            onClick={() => setCredShare(null)}
          />
          <div className="users-mgmt__sheet">
            <h2 className="users-mgmt__drawer-title">
              {USERS_MGMT_CREDENTIALS_TITLE}
            </h2>
            <p>
              Email: <strong>{credShare.loginEmail}</strong>
            </p>
            <p>
              Password: <strong>{credShare.password}</strong>
            </p>
            <div className="users-mgmt__drawer-actions">
              <button
                type="button"
                className="users-mgmt__drawer-btn users-mgmt__drawer-btn--outline"
                onClick={() => void copyCredentials()}
              >
                {USERS_MGMT_CREDENTIALS_COPY}
              </button>
              <button
                type="button"
                className="users-mgmt__drawer-btn users-mgmt__drawer-btn--filled"
                onClick={() => setCredShare(null)}
              >
                {USERS_MGMT_CREDENTIALS_DONE}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className="users-mgmt__toast" role="status">
          {toast}
          <button type="button" onClick={() => setToast(null)}>
            ×
          </button>
        </div>
      ) : null}
    </div>
  );
}
