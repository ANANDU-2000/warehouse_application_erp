/**
 * Owner `/home/breakdown-more` — Step 4 BUTTONS.
 * Source: home_breakdown_list_page.dart AppBar leading popOrGo('/home').
 */
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  HOME_BREAKDOWN_SEARCH_HINT,
  HOME_BREAKDOWN_TOTAL_LABEL,
} from "./homeBreakdownCopy";
import {
  homeBreakdownAppBarTitle,
  homeBreakdownTabFromQuery,
  type HomeBreakdownTab,
} from "./homeBreakdownTab";
import "./HomeBreakdownListPage.css";

/** Flutter navigation_ext.popOrGo — pop when stack allows, else go fallback. */
function popOrGo(navigate: ReturnType<typeof useNavigate>, fallback: string) {
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

function resolveTab(raw: string | null): HomeBreakdownTab {
  return homeBreakdownTabFromQuery(raw) ?? "category";
}

export function HomeBreakdownListPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const tab = resolveTab(params.get("tab"));
  const title = homeBreakdownAppBarTitle(tab);
  /** Flutter: showBreakdownSearch only for non-category tabs. */
  const showSearch = tab !== "category";

  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  /** Flutter `_breakdownSearchActive` — collapses total header chrome. */
  const searchActive =
    showSearch && (searchFocused || searchQuery.trim() !== "");

  function clearSearch() {
    setSearchQuery("");
  }

  function handleBack() {
    popOrGo(navigate, "/home");
  }

  return (
    <div
      className="home-breakdown-page"
      data-testid="home-breakdown-list-page"
    >
      <header
        className="home-breakdown-page__appbar"
        data-slot="appbar"
        data-testid="home-breakdown-slot-appbar"
      >
        <button
          type="button"
          className="home-breakdown-page__back"
          data-slot="appbar-leading"
          aria-label="Back"
          onClick={handleBack}
        >
          <BackIcon />
        </button>
        <h1 className="home-breakdown-page__title">{title}</h1>
      </header>

      <div className="home-breakdown-page__body">
        {showSearch ? (
          <section
            className="home-breakdown-page__search"
            data-slot="search"
            data-testid="home-breakdown-slot-search"
            aria-label="Search"
          >
            <div className="home-breakdown-page__search-chrome">
              <SearchIcon />
              <input
                type="search"
                className="home-breakdown-page__search-input"
                placeholder={HOME_BREAKDOWN_SEARCH_HINT}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                aria-label={HOME_BREAKDOWN_SEARCH_HINT}
                data-testid="home-breakdown-search-input"
              />
              {searchQuery.trim() !== "" ? (
                <button
                  type="button"
                  className="home-breakdown-page__search-clear"
                  aria-label="Clear"
                  onClick={clearSearch}
                  data-testid="home-breakdown-search-clear"
                >
                  <ClearIcon />
                </button>
              ) : null}
            </div>
          </section>
        ) : (
          <section
            className="home-breakdown-page__search"
            data-slot="search"
            data-testid="home-breakdown-slot-search"
            aria-label="Search"
            hidden
          />
        )}

        <section
          className="home-breakdown-page__total-header"
          data-slot="total-header"
          data-testid="home-breakdown-slot-total-header"
          aria-label="Total header"
          hidden={searchActive}
        >
          {!searchActive ? (
            <div className="home-breakdown-page__total-card">
              <span className="home-breakdown-page__total-label">
                {HOME_BREAKDOWN_TOTAL_LABEL}
              </span>
              <span
                className="home-breakdown-page__total-amount home-breakdown-page__total-amount--placeholder"
                aria-hidden="true"
              >
                —
              </span>
              <span
                className="home-breakdown-page__total-units home-breakdown-page__total-units--placeholder"
                aria-hidden="true"
              >
                —
              </span>
            </div>
          ) : null}
        </section>

        <section
          className="home-breakdown-page__ranked-list"
          data-slot="ranked-list"
          data-testid="home-breakdown-slot-ranked-list"
          aria-label="Ranked list"
        />
      </div>
    </div>
  );
}

function BackIcon() {
  return (
    <svg
      className="home-breakdown-page__back-icon"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M19 11H7.83l4.58-4.59L11 5l-7 7 7 7 1.41-1.41L7.83 13H19v-2z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      className="home-breakdown-page__search-icon"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg
      className="home-breakdown-page__clear-icon"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  );
}
