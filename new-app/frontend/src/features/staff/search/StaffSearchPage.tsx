/**
 * Staff search `/staff/search` — BUTTONS (Step 4).
 * Source: search_page.dart SearchPage(staffShellEmbedded: true)
 * Quick-filter push/go — no API (WIRE).
 */
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  STAFF_SEARCH_BACK_FALLBACK,
  STAFF_SEARCH_DEBOUNCE_MS,
  STAFF_SEARCH_EMPTY_HELPER,
  STAFF_SEARCH_HINT,
  STAFF_SEARCH_NO_MATCH_GLOBAL,
  STAFF_SEARCH_QUICK_FILTERS_TITLE,
  STAFF_SEARCH_RECENT_CLEAR,
  STAFF_SEARCH_RECENT_TITLE,
  STAFF_SEARCH_SECTION_EMPTY_BILLS,
  STAFF_SEARCH_SECTION_EMPTY_ITEMS,
  STAFF_SEARCH_SECTION_TITLE_BILLS,
  STAFF_SEARCH_SECTION_TITLE_ITEMS,
} from "./staffSearchCopy";
import {
  STAFF_SEARCH_QUICK_FILTERS,
  type StaffSearchNavMode,
} from "./staffSearchQuickFilters";
import {
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

/** Flutter context.push vs context.go */
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

export function StaffSearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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

  const qEmpty = debounced.length === 0;

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
              {/* FIELDS: no API yet — empty catalogs match Flutter hasAny==false */}
              <p
                className="staff-search-page__no-match"
                data-testid="staff-search-no-match-global"
              >
                {STAFF_SEARCH_NO_MATCH_GLOBAL}
              </p>
              {section === "items" ? (
                <div data-testid="staff-search-section-block-items">
                  <h2 className="staff-search-page__result-title">
                    {STAFF_SEARCH_SECTION_TITLE_ITEMS}
                  </h2>
                  <p className="staff-search-page__result-empty">
                    {STAFF_SEARCH_SECTION_EMPTY_ITEMS}
                  </p>
                </div>
              ) : null}
              {/* Staff types list block gated in Flutter (!staffShellEmbedded) — N/A */}
              {section === "bills" ? (
                <div data-testid="staff-search-section-block-bills">
                  <h2 className="staff-search-page__result-title">
                    {STAFF_SEARCH_SECTION_TITLE_BILLS}
                  </h2>
                  <p className="staff-search-page__result-empty">
                    {STAFF_SEARCH_SECTION_EMPTY_BILLS}
                  </p>
                </div>
              ) : null}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
