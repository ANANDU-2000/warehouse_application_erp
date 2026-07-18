import type { ReactElement } from "react";
import {
  STAFF_HOME_GREETING_AVATAR_FALLBACK,
  STAFF_HOME_GREETING_NAME_FALLBACK,
  STAFF_HOME_ROLE_LABEL,
  STAFF_HOME_SCAN_CTA_LABEL,
  STAFF_HOME_SECTION,
} from "./staffHomeCopy";
import "./StaffHomePage.css";

/**
 * Staff home LAYOUT — greeting chrome + section headers (exact Flutter copy).
 * Source: source-app/flutter_app/lib/features/staff/presentation/staff_home_page.dart
 * FIELDS: focus filter chips. BUTTONS+: tile bodies / navigate / APIs.
 */

function staffHomeLayoutDateLabel(now: Date): string {
  // Flutter DateFormat('EEE d MMM') — e.g. Sat 18 Jul
  const weekday = now.toLocaleDateString("en-GB", { weekday: "short" });
  const day = String(now.getDate());
  const month = now.toLocaleDateString("en-GB", { month: "short" });
  return `${weekday} ${day} ${month}`;
}

function StaffHomeSectionHeader(props: {
  title: string;
  subtitle: string;
}): ReactElement {
  return (
    <header className="staff-home-section-header">
      <h2 className="staff-home-section-title">{props.title}</h2>
      <p className="staff-home-section-subtitle">{props.subtitle}</p>
    </header>
  );
}

export function StaffHomePage(): ReactElement {
  const dateLabel = staffHomeLayoutDateLabel(new Date());

  return (
    <div className="staff-home-page" data-testid="staff-home-page">
      <div className="staff-home-scroll">
        <div className="staff-home-inner">
          <header
            className="staff-home-greeting"
            data-slot="greeting"
            data-testid="staff-home-slot-greeting"
          >
            <div className="staff-home-greeting-main">
              <div className="staff-home-avatar" aria-hidden="true">
                {STAFF_HOME_GREETING_AVATAR_FALLBACK}
              </div>
              <div className="staff-home-greeting-text">
                <p className="staff-home-greeting-name-row">
                  <span className="staff-home-greeting-name">
                    {STAFF_HOME_GREETING_NAME_FALLBACK}
                  </span>
                  <span className="staff-home-greeting-role">
                    {STAFF_HOME_ROLE_LABEL}
                  </span>
                </p>
                <p className="staff-home-greeting-date">{dateLabel}</p>
              </div>
            </div>
            <button
              type="button"
              className="staff-home-bell"
              aria-label="Notifications"
              disabled
              title="Notifications — BUTTONS"
            >
              <span className="staff-home-bell-icon" aria-hidden="true" />
            </button>
          </header>

          <section
            className="staff-home-slot staff-home-slot--bare"
            data-slot="floor-kpis"
            data-testid="staff-home-slot-floor-kpis"
            aria-label="Floor KPIs"
          />

          <section
            className="staff-home-card"
            data-slot="warehouse"
            data-testid="staff-home-slot-warehouse"
          >
            <StaffHomeSectionHeader
              title={STAFF_HOME_SECTION.warehouse.title}
              subtitle={STAFF_HOME_SECTION.warehouse.subtitle}
            />
          </section>

          <section
            className="staff-home-card"
            data-slot="pending-deliveries"
            data-testid="staff-home-slot-pending-deliveries"
          >
            <StaffHomeSectionHeader
              title={STAFF_HOME_SECTION.pendingDeliveries.title}
              subtitle={STAFF_HOME_SECTION.pendingDeliveries.subtitle}
            />
          </section>

          <section
            className="staff-home-card"
            data-slot="shift-today"
            data-testid="staff-home-slot-shift-today"
          >
            <StaffHomeSectionHeader
              title={STAFF_HOME_SECTION.shiftToday.title}
              subtitle={STAFF_HOME_SECTION.shiftToday.subtitle}
            />
          </section>

          <section
            className="staff-home-card"
            data-slot="tools"
            data-testid="staff-home-slot-tools"
          >
            <StaffHomeSectionHeader
              title={STAFF_HOME_SECTION.tools.title}
              subtitle={STAFF_HOME_SECTION.tools.subtitle}
            />
          </section>

          <section
            className="staff-home-card"
            data-slot="quick-actions"
            data-testid="staff-home-slot-quick-actions"
          >
            <StaffHomeSectionHeader
              title={STAFF_HOME_SECTION.quickActions.title}
              subtitle={STAFF_HOME_SECTION.quickActions.subtitle}
            />
          </section>

          <section
            className="staff-home-card"
            data-slot="scan-cta"
            data-testid="staff-home-slot-scan-cta"
          >
            <StaffHomeSectionHeader
              title={STAFF_HOME_SECTION.scanCta.title}
              subtitle={STAFF_HOME_SECTION.scanCta.subtitle}
            />
            <div className="staff-home-scan-cta" aria-hidden="true">
              <span className="staff-home-scan-cta-label">
                {STAFF_HOME_SCAN_CTA_LABEL}
              </span>
            </div>
          </section>

          <section
            className="staff-home-card"
            data-slot="needs-attention"
            data-testid="staff-home-slot-needs-attention"
          >
            <StaffHomeSectionHeader
              title={STAFF_HOME_SECTION.needsAttention.title}
              subtitle={STAFF_HOME_SECTION.needsAttention.subtitle}
            />
          </section>

          <section
            className="staff-home-card"
            data-slot="recent-activity"
            data-testid="staff-home-slot-recent-activity"
          >
            <StaffHomeSectionHeader
              title={STAFF_HOME_SECTION.recentActivity.title}
              subtitle={STAFF_HOME_SECTION.recentActivity.subtitle}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
