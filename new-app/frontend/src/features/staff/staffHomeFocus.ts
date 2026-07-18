/**
 * Staff home focus — port of staff_home_providers.dart StaffHomeFocus.
 * Source: source-app/flutter_app/lib/core/providers/staff_home_providers.dart
 * Labels: source-app/flutter_app/lib/features/staff/presentation/staff_home_page.dart
 */

export type StaffHomeFocus = "all" | "barcode" | "stock" | "purchase";

export const STAFF_HOME_FOCUS_ORDER: StaffHomeFocus[] = [
  "all",
  "barcode",
  "stock",
  "purchase",
];

export const STAFF_HOME_FOCUS_LABELS: Record<StaffHomeFocus, string> = {
  all: "All tasks",
  barcode: "Barcode & labels",
  stock: "Stock & warehouse",
  purchase: "Purchases & delivery",
};

/** SharedPreferences key in Flutter. */
export const STAFF_HOME_FOCUS_STORAGE_KEY = "staff_home_focus";

export const STAFF_HOME_FOCUS_HEADING = "Home focus";

export function staffHomeFocusFromStorage(
  raw: string | null | undefined,
): StaffHomeFocus {
  if (raw === "all" || raw === "barcode" || raw === "stock" || raw === "purchase") {
    return raw;
  }
  return "all";
}

export function readStaffHomeFocus(
  storage: Pick<Storage, "getItem"> = localStorage,
): StaffHomeFocus {
  try {
    return staffHomeFocusFromStorage(storage.getItem(STAFF_HOME_FOCUS_STORAGE_KEY));
  } catch {
    return "all";
  }
}

export function writeStaffHomeFocus(
  focus: StaffHomeFocus,
  storage: Pick<Storage, "setItem"> = localStorage,
): void {
  try {
    storage.setItem(STAFF_HOME_FOCUS_STORAGE_KEY, focus);
  } catch {
    // ignore quota / private mode
  }
}

export function staffHomeShowsWarehouse(f: StaffHomeFocus): boolean {
  return f === "all" || f === "stock";
}

export function staffHomeShowsBarcodeTools(f: StaffHomeFocus): boolean {
  return f === "all" || f === "barcode";
}

export function staffHomeShowsPurchaseTools(f: StaffHomeFocus): boolean {
  return f === "all" || f === "purchase";
}
