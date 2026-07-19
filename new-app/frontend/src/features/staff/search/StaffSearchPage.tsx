/**
 * Staff search `/staff/search` — WIRE (Step 5).
 * Source: search_page.dart + hexa_api.unifiedSearch
 */
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { readPrimaryBusiness } from "../../../shared/auth/sessionStore";
import {
  STAFF_SEARCH_BACK_FALLBACK,
  STAFF_SEARCH_DEBOUNCE_MS,
  STAFF_SEARCH_EMPTY_HELPER,
  STAFF_SEARCH_FAILED,
  STAFF_SEARCH_FUZZY_CATALOG_STAFF,
  STAFF_SEARCH_FUZZY_ITEM_HINT,
  STAFF_SEARCH_HINT,
  STAFF_SEARCH_NO_MATCH_GLOBAL,
  STAFF_SEARCH_QUICK_FILTERS_TITLE,
  STAFF_SEARCH_RECENT_CLEAR,
  STAFF_SEARCH_RECENT_TITLE,
  STAFF_SEARCH_SECTION_EMPTY_BILLS,
  STAFF_SEARCH_SECTION_EMPTY_ITEMS,
  STAFF_SEARCH_SECTION_TITLE_BILLS,
  STAFF_SEARCH_SECTION_TITLE_ITEMS,
  STAFF_SEARCH_UPDATING,
} from "./staffSearchCopy";
import {
  fetchUnifiedSearch,
  StaffSearchApiError,
  StaffSearchNetworkError,
  type UnifiedSearchResponse,
} from "./staffSearchApi";
import {
  STAFF_SEARCH_QUICK_FILTERS,
  type StaffSearchNavMode,
} from "./staffSearchQuickFilters";
import {
  addRecentSearchQuery,
  clearRecentSearchQueries,
  loadRecentSearchQueries,
} from "./staffSearchRecents";
import {
  STAFF_SEARCH_DEFAULT_SECTION,
  STAFF_SEARCH_SECTION_LABELS,
  STAFF_SEARCH_SECTION_ORDER,
  type StaffSearchSection,
} from "./staffSearchSections";
import "./StaffSearchPage.css";

function parseSectionParam(raw: string | null): StaffSearchSection | null {
  if (raw === "items" || raw === "types" || raw === "bills") return raw;
  return null;
}

function navigateQuickFilter(
  navigate: ReturnType<typeof useNavigate>,
  path: string,
  nav: StaffSearchNavMode,
): void {
  if (nav === "go") {
    navigate(path, { replace: true });
    return;
  }
  navigate(path);
}

function emptyData(): UnifiedSearchResponse {
  return {
    catalog_items: [],
    suppliers: [],
    brokers: [],
    entries: [],
    catalog_subcategories: [],
    recent_purchases: [],
    fuzzy_catalog_used: false,
    fuzzy_suppliers_used: false,
    fuzzy_brokers_used: false,
  };
}

function pickPurchaseLine(
  p: Record<string, unknown>,
  q: string,
): string | null {
  const needle = q.toLowerCase();
  const lines = Array.isArray(p.lines) ? p.lines : [];
  for (const raw of lines) {
    if (!raw || typeof raw !== "object") continue;
    const name = String((raw as { item_name?: unknown }).item_name ?? "");
    if (name && name.toLowerCase().includes(needle)) return name;
  }
  if (lines[0] && typeof lines[0] === "object") {
    const n = String((lines[0] as { item_name?: unknown }).item_name ?? "");
    return n || null;
  }
  return null;
}

export function StaffSearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const session = readPrimaryBusiness();
  const businessId = session?.id ?? "";
  const [section, setSection] = useState<StaffSearchSection>(() => {
    return (
      parseSectionParam(searchParams.get("section")) ??
      STAFF_SEARCH_DEFAULT_SECTION
    );
  });
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [recents, setRecents] = useState<string[]>(() =>
    loadRecentSearchQueries(),
  );
  const [data, setData] = useState<UnifiedSearchResponse>(emptyData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recordedKey = useRef<string | null>(null);
  const cacheRef = useRef<Map<string, UnifiedSearchResponse>>(new Map());

  useEffect(() => {
    const fromUrl = parseSectionParam(searchParams.get("section"));
    if (fromUrl) setSection(fromUrl);
  }, [searchParams]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      const next = query.trim();
      setDebounced((prev) => (prev === next ? prev : next));
    }, STAFF_SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (!debounced || !businessId) {
      setData(emptyData());
      setLoading(false);
      setError(null);
      return;
    }
    const cacheKey = `${businessId}|${debounced}`;
    const hit = cacheRef.current.get(cacheKey);
    if (hit) {
      setData(hit);
      setLoading(false);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    void fetchUnifiedSearch(businessId, debounced)
      .then((res) => {
        if (cancelled) return;
        cacheRef.current.set(cacheKey, res);
        while (cacheRef.current.size > 40) {
          const first = cacheRef.current.keys().next().value;
          if (first) cacheRef.current.delete(first);
        }
        setData(res);
        setLoading(false);
        const keyNorm = debounced.trim().toLowerCase();
        if (keyNorm.length >= 2 && recordedKey.current !== keyNorm) {
          recordedKey.current = keyNorm;
          setRecents((cur) => addRecentSearchQuery(debounced, cur));
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setLoading(false);
        if (
          err instanceof StaffSearchApiError ||
          err instanceof StaffSearchNetworkError
        ) {
          setError(STAFF_SEARCH_FAILED);
        } else {
          setError(STAFF_SEARCH_FAILED);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [debounced, businessId]);

  const qEmpty = debounced.length === 0;
  const items = data.catalog_items;
  const bills = data.recent_purchases;
  const hasAny =
    items.length > 0 ||
    bills.length > 0 ||
    data.catalog_subcategories.length > 0 ||
    data.suppliers.length > 0 ||
    data.brokers.length > 0;

  function applyQuery(raw: string) {
    setQuery(raw);
    setDebounced(raw.trim());
  }

  function clearSearch() {
    setQuery("");
    setDebounced("");
  }

  function onClearRecents() {
    setRecents(clearRecentSearchQueries());
  }

  return (
    <div
      className="staff-search-page"
      data-testid="staff-search-page"
      data-back-fallback={STAFF_SEARCH_BACK_FALLBACK}
      data-staff-shell-embedded="true"
      data-section={section}
      data-debounced={debounced}
    >
      <div className="staff-search-page__body" data-slot="body">
        <div
          className="staff-search-page__search"
          data-slot="search"
          data-testid="staff-search-field-chrome"
        >
          <span className="staff-search-page__search-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path
                fill="currentColor"
                d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
              />
            </svg>
          </span>
          <input
            className="staff-search-page__search-input staff-search-page__search-input--active"
            type="search"
            placeholder={STAFF_SEARCH_HINT}
            aria-label={STAFF_SEARCH_HINT}
            data-testid="staff-search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query.length > 0 ? (
            <button
              type="button"
              className="staff-search-page__search-clear"
              data-testid="staff-search-clear"
              aria-label="Clear search"
              onClick={clearSearch}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                />
              </svg>
            </button>
          ) : null}
        </div>

        <div
          className="staff-search-page__filters"
          data-slot="filters"
          data-testid="staff-search-filters"
          role="tablist"
          aria-label="Search sections"
        >
          {STAFF_SEARCH_SECTION_ORDER.map((s) => (
            <button
              key={s}
              type="button"
              role="tab"
              aria-selected={section === s}
              className={
                section === s
                  ? "staff-search-page__chip staff-search-page__chip--selected staff-search-page__chip--active"
                  : "staff-search-page__chip staff-search-page__chip--active"
              }
              data-testid={`staff-search-section-${s}`}
              onClick={() => setSection(s)}
            >
              {STAFF_SEARCH_SECTION_LABELS[s]}
            </button>
          ))}
        </div>

        <section
          className="staff-search-page__results"
          data-slot="results"
          data-testid="staff-search-results-chrome"
          aria-label="Search results"
        >
          {qEmpty ? (
            <div
              className="staff-search-page__empty"
              data-slot="empty"
              data-testid="staff-search-empty-chrome"
            >
              {recents.length > 0 ? (
                <div
                  className="staff-search-page__recents"
                  data-testid="staff-search-recents"
                >
                  <div className="staff-search-page__recents-head">
                    <h2 className="staff-search-page__section-title staff-search-page__section-title--inline">
                      {STAFF_SEARCH_RECENT_TITLE}
                    </h2>
                    <button
                      type="button"
                      className="staff-search-page__text-btn"
                      data-testid="staff-search-recents-clear"
                      onClick={onClearRecents}
                    >
                      {STAFF_SEARCH_RECENT_CLEAR}
                    </button>
                  </div>
                  <div className="staff-search-page__recents-wrap">
                    {recents.map((r) => (
                      <button
                        key={r}
                        type="button"
                        className="staff-search-page__recent-chip"
                        data-testid="staff-search-recent-chip"
                        onClick={() => applyQuery(r)}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              <h2 className="staff-search-page__section-title">
                {STAFF_SEARCH_QUICK_FILTERS_TITLE}
              </h2>
              <div
                className="staff-search-page__quick-filters"
                data-testid="staff-search-quick-filters"
              >
                {STAFF_SEARCH_QUICK_FILTERS.map((qf) => (
                  <button
                    key={qf.id}
                    type="button"
                    className="staff-search-page__action-chip staff-search-page__action-chip--active"
                    data-testid={`staff-search-qf-${qf.id}`}
                    data-path={qf.path}
                    data-nav={qf.nav}
                    onClick={() =>
                      navigateQuickFilter(navigate, qf.path, qf.nav)
                    }
                  >
                    <span
                      className="staff-search-page__action-chip-icon"
                      aria-hidden="true"
                    />
                    {qf.label}
                  </button>
                ))}
              </div>
              <p className="staff-search-page__helper">
                {STAFF_SEARCH_EMPTY_HELPER}
              </p>
            </div>
          ) : (
            <div
              className="staff-search-page__query-results"
              data-slot="query-results"
              data-testid="staff-search-query-results"
            >
              {loading ? (
                <div
                  className="staff-search-page__progress"
                  data-testid="staff-search-loading"
                >
                  <div className="staff-search-page__progress-bar" />
                  <p className="staff-search-page__updating">
                    {STAFF_SEARCH_UPDATING}
                  </p>
                </div>
              ) : null}
              {error ? (
                <p
                  className="staff-search-page__error"
                  data-testid="staff-search-error"
                >
                  {error}
                </p>
              ) : null}
              {!loading && !error && data.fuzzy_catalog_used ? (
                <p
                  className="staff-search-page__fuzzy"
                  data-testid="staff-search-fuzzy-banner"
                >
                  {STAFF_SEARCH_FUZZY_CATALOG_STAFF}
                </p>
              ) : null}
              {!loading && !error && !hasAny ? (
                <p
                  className="staff-search-page__no-match"
                  data-testid="staff-search-no-match-global"
                >
                  {STAFF_SEARCH_NO_MATCH_GLOBAL}
                </p>
              ) : null}
              {!loading && !error && section === "items" ? (
                <div data-testid="staff-search-section-block-items">
                  <h2 className="staff-search-page__result-title">
                    {STAFF_SEARCH_SECTION_TITLE_ITEMS}
                  </h2>
                  {items.length === 0 ? (
                    <p className="staff-search-page__result-empty">
                      {STAFF_SEARCH_SECTION_EMPTY_ITEMS}
                    </p>
                  ) : (
                    <ul className="staff-search-page__result-list">
                      {items.map((m) => {
                        const id = String(m.id ?? "");
                        const name = String(m.name ?? "Item");
                        const cat = String(m.category_name ?? "");
                        const typ = String(m.type_name ?? "");
                        const sub = [cat, typ].filter(Boolean).join(" · ");
                        return (
                          <li key={id || name}>
                            <button
                              type="button"
                              className="staff-search-page__result-row"
                              data-testid="staff-search-item-row"
                              onClick={() => {
                                if (id) navigate(`/catalog/item/${id}`);
                              }}
                            >
                              <span className="staff-search-page__result-row-title">
                                {name}
                              </span>
                              {data.fuzzy_catalog_used ? (
                                <span className="staff-search-page__result-row-sub">
                                  {STAFF_SEARCH_FUZZY_ITEM_HINT}
                                </span>
                              ) : sub ? (
                                <span className="staff-search-page__result-row-sub">
                                  {sub}
                                </span>
                              ) : null}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              ) : null}
              {/* Staff types list block gated in Flutter (!staffShellEmbedded) — N/A */}
              {!loading && !error && section === "bills" ? (
                <div data-testid="staff-search-section-block-bills">
                  <h2 className="staff-search-page__result-title">
                    {STAFF_SEARCH_SECTION_TITLE_BILLS}
                  </h2>
                  {bills.length === 0 ? (
                    <p className="staff-search-page__result-empty">
                      {STAFF_SEARCH_SECTION_EMPTY_BILLS}
                    </p>
                  ) : (
                    <ul className="staff-search-page__result-list">
                      {bills.map((p) => {
                        const id = String(p.id ?? "");
                        const hid = String(p.human_id ?? "Purchase");
                        const sup = String(p.supplier_name ?? "Supplier");
                        const line = pickPurchaseLine(p, debounced);
                        return (
                          <li key={id || hid}>
                            <button
                              type="button"
                              className="staff-search-page__result-row"
                              data-testid="staff-search-bill-row"
                              onClick={() => {
                                if (id)
                                  navigate(`/staff/purchase-history/${id}`);
                              }}
                            >
                              <span className="staff-search-page__result-row-title staff-search-page__result-row-title--bill">
                                {hid}
                              </span>
                              <span className="staff-search-page__result-row-sub">
                                {sup}
                                {line ? ` · ${line}` : ""}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
