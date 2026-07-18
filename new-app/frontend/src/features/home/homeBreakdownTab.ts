/**
 * Home breakdown tab — port of HomeBreakdownTab + homeBreakdownTabFromQuery.
 * Source: home_breakdown_tab_providers.dart
 */
export type HomeBreakdownTab =
  | "category"
  | "subcategory"
  | "supplier"
  | "items";

export const HOME_BREAKDOWN_TAB_ORDER: readonly HomeBreakdownTab[] = [
  "category",
  "subcategory",
  "supplier",
  "items",
] as const;

export const HOME_BREAKDOWN_TAB_LABELS: Record<HomeBreakdownTab, string> = {
  category: "Category",
  subcategory: "Subcategory",
  supplier: "Supplier",
  items: "Items",
};

/** Flutter `homeBreakdownTabFromQuery` — match enum `.name`. */
export function homeBreakdownTabFromQuery(
  raw: string | null | undefined,
): HomeBreakdownTab | null {
  if (raw == null || raw.trim() === "") return null;
  const key = raw.trim().toLowerCase();
  for (const t of HOME_BREAKDOWN_TAB_ORDER) {
    if (t === key) return t;
  }
  return null;
}

/** Flutter `homeBreakdownTabQuery` — query string value. */
export function homeBreakdownTabQuery(tab: HomeBreakdownTab): string {
  return tab;
}

/** AppBar title — `All — ${tab.label}`. */
export function homeBreakdownAppBarTitle(tab: HomeBreakdownTab): string {
  return `All — ${HOME_BREAKDOWN_TAB_LABELS[tab]}`;
}
