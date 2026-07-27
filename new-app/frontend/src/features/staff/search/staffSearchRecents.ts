/**
 * Recent unified-search strings — recent_unified_search_provider.dart
 * Key: pref_recent_unified_search_v1_{businessId}
 * addQuery deferred to WIRE (after successful search, len >= 2).
 */
import { readPrimaryBusiness } from "../../../shared/auth/sessionStore";

const PREFIX = "pref_recent_unified_search_v1_";
const MAX = 12;

export function recentSearchStorageKey(businessId: string): string {
  return `${PREFIX}${businessId}`;
}

export function loadRecentSearchQueries(): string[] {
  const biz = readPrimaryBusiness();
  if (!biz) return [];
  try {
    const raw = localStorage.getItem(recentSearchStorageKey(biz.id));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string");
  } catch {
    return [];
  }
}

export function clearRecentSearchQueries(): string[] {
  const biz = readPrimaryBusiness();
  if (!biz) return [];
  localStorage.setItem(recentSearchStorageKey(biz.id), JSON.stringify([]));
  return [];
}

/** Exposed for WIRE / tests — mirrors notifier.addQuery rules */
export function addRecentSearchQuery(raw: string, current: string[]): string[] {
  const biz = readPrimaryBusiness();
  if (!biz) return current;
  const t = raw.trim();
  if (t.length < 2 || t.length > 200) return current;
  const next = [
    t,
    ...current.filter((e) => e.toLowerCase() !== t.toLowerCase()),
  ].slice(0, MAX);
  localStorage.setItem(recentSearchStorageKey(biz.id), JSON.stringify(next));
  return next;
}
