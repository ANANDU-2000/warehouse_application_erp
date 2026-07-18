import "./HomePage.css";

/**
 * Owner `/home` — Step 1 SCAFFOLD only.
 * Empty section slots matching home_page.dart / dashboard.md §1.
 * No network calls, period state, or KPI data.
 */
export function HomePage() {
  return (
    <div className="home-page" data-testid="home-page">
      <header
        className="home-page__slot home-page__slot--header"
        aria-label="Compact header"
        data-slot="compact-header"
      >
        <span className="home-page__slot-label">Compact header</span>
      </header>

      <div
        className="home-page__slot home-page__slot--period"
        aria-label="Period filter"
        data-slot="sticky-period"
      >
        <span className="home-page__slot-label">Sticky period</span>
      </div>

      <main className="home-page__body">
        <section
          className="home-page__slot"
          aria-label="Alerts"
          data-slot="alerts"
        >
          <span className="home-page__slot-label">Alerts</span>
        </section>

        <section
          className="home-page__slot home-page__slot--kpi"
          aria-label="KPI grid"
          data-slot="kpi-grid"
        >
          <span className="home-page__slot-label">KPI grid</span>
        </section>

        <section
          className="home-page__slot"
          aria-label="Delivery pipeline"
          data-slot="delivery"
        >
          <span className="home-page__slot-label">Delivery pipeline</span>
        </section>

        <section
          className="home-page__slot"
          aria-label="Purchase control center"
          data-slot="purchase-center"
        >
          <span className="home-page__slot-label">Purchase control center</span>
        </section>

        <section
          className="home-page__slot"
          aria-label="Quick actions"
          data-slot="tools"
        >
          <span className="home-page__slot-label">Owner quick actions</span>
        </section>

        <section
          className="home-page__slot"
          aria-label="Warehouse activity"
          data-slot="activity"
        >
          <span className="home-page__slot-label">Warehouse activity</span>
        </section>
      </main>
    </div>
  );
}
