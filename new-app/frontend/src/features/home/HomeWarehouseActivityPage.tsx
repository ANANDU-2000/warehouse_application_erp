/**
 * Owner `/home/activity` — Step 1 SCAFFOLD.
 * Source: home_warehouse_activity_page.dart section order (empty slots only).
 * No period chips, list rows, back CTA, or API.
 */
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
        <div
          className="home-activity-page__slot"
          data-slot="appbar-leading"
          aria-hidden="true"
        />
        <h1 className="home-activity-page__title">Warehouse activity</h1>
      </header>

      <div className="home-activity-page__body">
        <section
          className="home-activity-page__slot"
          data-slot="period-filter"
          data-testid="home-activity-slot-period-filter"
          aria-label="Period filter"
        />
        <section
          className="home-activity-page__slot"
          data-slot="period-caption"
          data-testid="home-activity-slot-period-caption"
          aria-label="Period caption"
        />
        <section
          className="home-activity-page__slot home-activity-page__slot--list"
          data-slot="activity-list"
          data-testid="home-activity-slot-activity-list"
          aria-label="Activity list"
        />
      </div>
    </div>
  );
}
