/**
 * Owner `/home/breakdown-more` — Step 2 LAYOUT.
 * Source: home_breakdown_list_page.dart — AppBar + Total card + search chrome; no API.
 */
import { useSearchParams } from "react-router-dom";
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

function resolveTab(raw: string | null): HomeBreakdownTab {
  return homeBreakdownTabFromQuery(raw) ?? "category";
}

export function HomeBreakdownListPage() {
  const [params] = useSearchParams();
  const tab = resolveTab(params.get("tab"));
  const title = homeBreakdownAppBarTitle(tab);
  /** Flutter: showBreakdownSearch only for non-category tabs. */
  const showSearchChrome = tab !== "category";

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
        {/* LAYOUT: inert back chrome — navigate → BUTTONS */}
        <span
          className="home-breakdown-page__back"
          data-slot="appbar-leading"
          aria-label="Back"
          aria-hidden="false"
        >
          <BackIcon />
        </span>
        <h1 className="home-breakdown-page__title">{title}</h1>
      </header>

      <div className="home-breakdown-page__body">
        <section
          className="home-breakdown-page__total-header"
          data-slot="total-header"
          data-testid="home-breakdown-slot-total-header"
          aria-label="Total header"
        >
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
        </section>

        <section
          className="home-breakdown-page__search"
          data-slot="search"
          data-testid="home-breakdown-slot-search"
          aria-label="Search"
          hidden={!showSearchChrome}
        >
          {showSearchChrome ? (
            <div className="home-breakdown-page__search-chrome">
              <SearchIcon />
              <span className="home-breakdown-page__search-hint">
                {HOME_BREAKDOWN_SEARCH_HINT}
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
