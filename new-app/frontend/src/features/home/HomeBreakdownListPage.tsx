/**
 * Owner `/home/breakdown-more` — Step 1 SCAFFOLD.
 * Source: home_breakdown_list_page.dart — empty slots only.
 */
import { useSearchParams } from "react-router-dom";
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
        <h1 className="home-breakdown-page__title">{title}</h1>
      </header>

      <div className="home-breakdown-page__body">
        <section
          className="home-breakdown-page__total-header"
          data-slot="total-header"
          data-testid="home-breakdown-slot-total-header"
          aria-label="Total header"
        />
        <section
          className="home-breakdown-page__search"
          data-slot="search"
          data-testid="home-breakdown-slot-search"
          aria-label="Search"
        />
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
