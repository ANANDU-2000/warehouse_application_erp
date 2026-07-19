/**
 * User list filters — port of user_list_filters.dart.
 * Client-side only until WIRE supplies rows.
 */

export type UserListPrimaryFilter =
  | "all"
  | "active"
  | "inactive"
  | "blocked";

export const USER_LIST_PRIMARY_ORDER: readonly UserListPrimaryFilter[] = [
  "all",
  "active",
  "inactive",
  "blocked",
] as const;

/** Exact Flutter _label strings. */
export const USER_LIST_PRIMARY_LABELS: Record<UserListPrimaryFilter, string> = {
  all: "All users",
  active: "Active",
  inactive: "Inactive",
  blocked: "Blocked",
};

export type UserListRow = {
  id?: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  is_active?: boolean | null;
  is_blocked?: boolean | null;
  last_active_at?: string | null;
  created_at?: string | null;
};

export type UserListFilterState = {
  search: string;
  primary: UserListPrimaryFilter;
  roles: Set<string>;
};

export const DEFAULT_USER_LIST_FILTER: UserListFilterState = {
  search: "",
  primary: "all",
  roles: new Set(),
};

export function copyUserListFilter(
  state: UserListFilterState,
  patch: Partial<{
    search: string;
    primary: UserListPrimaryFilter;
    roles: Set<string>;
  }>,
): UserListFilterState {
  return {
    search: patch.search ?? state.search,
    primary: patch.primary ?? state.primary,
    roles: patch.roles ?? state.roles,
  };
}

/**
 * applyUserListFilters — same rules as Dart.
 * admin role filter matches admin|owner.
 */
export function applyUserListFilters<T extends UserListRow>(
  rows: T[],
  filters: UserListFilterState,
): T[] {
  let it: T[] = rows;

  switch (filters.primary) {
    case "active":
      it = it.filter((u) => u.is_active === true && u.is_blocked !== true);
      break;
    case "inactive":
      it = it.filter((u) => u.is_active !== true && u.is_blocked !== true);
      break;
    case "blocked":
      it = it.filter((u) => u.is_blocked === true);
      break;
    case "all":
      break;
  }

  if (filters.roles.size > 0) {
    it = it.filter((u) => {
      const r = (u.role?.toString() ?? "").toLowerCase();
      if (filters.roles.has("admin") && (r === "admin" || r === "owner")) {
        return true;
      }
      return filters.roles.has(r);
    });
  }

  const q = filters.search.trim().toLowerCase();
  if (q.length > 0) {
    it = it.filter((u) => {
      const name = (u.name?.toString() ?? "").toLowerCase();
      const email = (u.email?.toString() ?? "").toLowerCase();
      const phone = (u.phone?.toString() ?? "").toLowerCase();
      return name.includes(q) || email.includes(q) || phone.includes(q);
    });
  }

  return it;
}

export function countForPrimaryFilter(
  rows: UserListRow[],
  filter: UserListPrimaryFilter,
): number {
  return applyUserListFilters(rows, {
    search: "",
    primary: filter,
    roles: new Set(),
  }).length;
}

export function drawerActiveCount(roles: Set<string>): number {
  return roles.size;
}
