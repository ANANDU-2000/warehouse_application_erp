/**
 * Staff search `/staff/search` — LAYOUT (Step 2).
 * Source: search_page.dart SearchPage(staffShellEmbedded: true)
 * Chrome + empty-query Quick filters shell — no typing/API (FIELDS/WIRE).
 */
import {
  STAFF_SEARCH_BACK_FALLBACK,
  STAFF_SEARCH_EMPTY_HELPER,
  STAFF_SEARCH_HINT,
  STAFF_SEARCH_QUICK_FILTERS_TITLE,
} from "./staffSearchCopy";
import { STAFF_SEARCH_QUICK_FILTERS } from "./staffSearchQuickFilters";
import {
  STAFF_SEARCH_DEFAULT_SECTION,
  STAFF_SEARCH_SECTION_LABELS,
  STAFF_SEARCH_SECTION_ORDER,
} from "./staffSearchSections";
import "./StaffSearchPage.css";

export function StaffSearchPage() {
  const selected = STAFF_SEARCH_DEFAULT_SECTION;

  return (
    <div
      className="staff-search-page"
      data-testid="staff-search-page"
      data-back-fallback={STAFF_SEARCH_BACK_FALLBACK}
      data-staff-shell-embedded="true"
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
            className="staff-search-page__search-input"
            type="search"
            placeholder={STAFF_SEARCH_HINT}
            aria-label={STAFF_SEARCH_HINT}
            data-testid="staff-search-input"
            readOnly
            tabIndex={-1}
            value=""
          />
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
              aria-selected={selected === s}
              className={
                selected === s
                  ? "staff-search-page__chip staff-search-page__chip--selected"
                  : "staff-search-page__chip"
              }
              data-testid={`staff-search-section-${s}`}
              tabIndex={-1}
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
          {/* Empty-query chrome — Flutter q.isEmpty (Recent deferred until FIELDS) */}
          <div
            className="staff-search-page__empty"
            data-slot="empty"
            data-testid="staff-search-empty-chrome"
          >
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
                  className="staff-search-page__action-chip"
                  data-testid={`staff-search-qf-${qf.id}`}
                  data-path={qf.path}
                  tabIndex={-1}
                >
                  <span
                    className="staff-search-page__action-chip-icon"
                    aria-hidden="true"
                  />
                  {qf.label}
                </button>
              ))}
            </div>
            <p className="staff-search-page__helper">{STAFF_SEARCH_EMPTY_HELPER}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
