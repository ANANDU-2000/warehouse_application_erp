/**
 * Owner `/home/activity` — Step 2 LAYOUT.
 * Source: home_warehouse_activity_page.dart AppBar + caption + list card chrome.
 * No period chips (FIELDS), no back navigate (BUTTONS), no API (WIRE).
 */
import {
  HOME_ACTIVITY_APPBAR_TITLE,
  HOME_ACTIVITY_COL_BILL,
  HOME_ACTIVITY_COL_QTY,
  HOME_ACTIVITY_COL_VERIFIED,
  HOME_ACTIVITY_PERIOD_CAPTION,
} from "./homeActivityCopy";
import "./HomeWarehouseActivityPage.css";

export function HomeWarehouseActivityPage() {
  return (
    <div
      className="home-activity-page"
      data-testid="home-warehouse-activity-page"
    >
      <header
        className="home-activity-page__appbar"
        data-slot="appbar"
        data-testid="home-activity-slot-appbar"
      >
        <span
          className="home-activity-page__back"
          data-slot="appbar-leading"
          aria-hidden="true"
        >
          <BackIcon />
        </span>
        <h1 className="home-activity-page__title">{HOME_ACTIVITY_APPBAR_TITLE}</h1>
      </header>

      <div className="home-activity-page__body">
        <div className="home-activity-page__period-block">
          <section
            className="home-activity-page__period-strip"
            data-slot="period-filter"
            data-testid="home-activity-slot-period-filter"
            aria-label="Period filter"
          />
          <p
            className="home-activity-page__period-caption"
            data-slot="period-caption"
            data-testid="home-activity-slot-period-caption"
          >
            {HOME_ACTIVITY_PERIOD_CAPTION}
          </p>
        </div>

        <section
          className="home-activity-page__list"
          data-slot="activity-list"
          data-testid="home-activity-slot-activity-list"
          aria-label="Activity list"
        >
          <div className="home-activity-page__card">
            <div className="home-activity-page__card-head" aria-hidden="true" />
            <div className="home-activity-page__table-header" role="row">
              <span className="home-activity-page__col home-activity-page__col--bill">
                {HOME_ACTIVITY_COL_BILL}
              </span>
              <span className="home-activity-page__col home-activity-page__col--qty">
                {HOME_ACTIVITY_COL_QTY}
              </span>
              <span className="home-activity-page__col home-activity-page__col--verified">
                {HOME_ACTIVITY_COL_VERIFIED}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function BackIcon() {
  return (
    <svg
      className="home-activity-page__back-icon"
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
