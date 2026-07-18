import { useState, type ReactElement } from "react";
import {
  STAFF_HOME_GREETING_AVATAR_FALLBACK,
  STAFF_HOME_GREETING_NAME_FALLBACK,
  STAFF_HOME_ROLE_LABEL,
  STAFF_HOME_SECTION,
} from "./staffHomeCopy";
import {
  STAFF_HOME_FOCUS_HEADING,
  STAFF_HOME_FOCUS_LABELS,
  STAFF_HOME_FOCUS_ORDER,
  readStaffHomeFocus,
  writeStaffHomeFocus,
  type StaffHomeFocus,
} from "./staffHomeFocus";
import "./StaffHomePage.css";

/**
 * Staff home LAYOUT + FIELDS — greeting chrome, section headers, Home focus radios.
 * Source: staff_home_page.dart + staff_home_providers.dart
 * BUTTONS+: profile sheet, scan CTA, navigate / APIs.
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
  const [focus, setFocus] = useState<StaffHomeFocus>(() => readStaffHomeFocus());

  function onFocusChange(next: StaffHomeFocus): void {
    setFocus(next);
    writeStaffHomeFocus(next);
  }

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
            className="staff-home-card"
            data-testid="staff-home-focus"
            aria-labelledby="staff-home-focus-heading"
          >
            <h2
              id="staff-home-focus-heading"
              className="staff-home-focus-heading"
            >
              {STAFF_HOME_FOCUS_HEADING}
            </h2>
            <div
              className="staff-home-focus-list"
              role="radiogroup"
              aria-labelledby="staff-home-focus-heading"
            >
              {STAFF_HOME_FOCUS_ORDER.map((value) => {
                const selected = focus === value;
                const inputId = `staff-home-focus-${value}`;
                return (
                  <label
                    key={value}
                    className={
                      selected
                        ? "staff-home-focus-option staff-home-focus-option--selected"
                        : "staff-home-focus-option"
                    }
                    htmlFor={inputId}
                  >
                    <input
                      id={inputId}
                      type="radio"
                      name="staff-home-focus"
                      value={value}
                      checked={selected}
                      onChange={() => onFocusChange(value)}
                    />
                    <span
                      className="staff-home-focus-radio"
                      aria-hidden="true"
                      data-selected={selected ? "true" : "false"}
                    />
                    <span className="staff-home-focus-label">
                      {STAFF_HOME_FOCUS_LABELS[value]}
                    </span>
                  </label>
                );
              })}
            </div>
          </section>

          <section
            className="staff-home-card"
            data-slot="floor-kpis"
            data-testid="staff-home-slot-floor-kpis"
            aria-label="Floor KPIs"
          >
            <h2 className="staff-home-slot-label">Floor KPIs</h2>
          </section>

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
