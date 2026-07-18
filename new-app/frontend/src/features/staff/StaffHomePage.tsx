import { useState, type ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import { clearPrimaryBusiness } from "../../shared/auth/sessionStore";
import { clearTokens } from "../../shared/auth/tokenStore";
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
import {
  STAFF_HOME_CLOSE_LABEL,
  STAFF_HOME_LOGOUT_BODY,
  STAFF_HOME_LOGOUT_CANCEL,
  STAFF_HOME_LOGOUT_LABEL,
  STAFF_HOME_LOGOUT_TITLE,
  STAFF_HOME_QUICK_ACTIONS,
  STAFF_HOME_SCAN_CTA_LABEL,
  STAFF_HOME_SCAN_CTA_PATH,
  STAFF_HOME_SETTINGS_LABEL,
  STAFF_HOME_SETTINGS_PATH,
  staffHomeToolsForFocus,
} from "./staffHomeTools";
import "./StaffHomePage.css";

/**
 * Staff home LAYOUT + FIELDS + BUTTONS.
 * Source: staff_home_page.dart + staff_home_dashboard_widgets.dart
 * WIRE+: floor KPIs / counts / attention / activity APIs.
 */

function staffHomeLayoutDateLabel(now: Date): string {
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

function StaffHomeFocusRadios(props: {
  focus: StaffHomeFocus;
  onFocusChange: (next: StaffHomeFocus) => void;
  name: string;
}): ReactElement {
  return (
    <div
      className="staff-home-focus-list"
      role="radiogroup"
      aria-label={STAFF_HOME_FOCUS_HEADING}
      data-testid="staff-home-focus"
    >
      {STAFF_HOME_FOCUS_ORDER.map((value) => {
        const selected = props.focus === value;
        const inputId = `${props.name}-${value}`;
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
              name={props.name}
              value={value}
              checked={selected}
              onChange={() => props.onFocusChange(value)}
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
  );
}

export function StaffHomePage(): ReactElement {
  const navigate = useNavigate();
  const dateLabel = staffHomeLayoutDateLabel(new Date());
  const [focus, setFocus] = useState<StaffHomeFocus>(() => readStaffHomeFocus());
  const [sheetOpen, setSheetOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  function onFocusChange(next: StaffHomeFocus): void {
    setFocus(next);
    writeStaffHomeFocus(next);
  }

  function confirmLogout(): void {
    clearTokens();
    clearPrimaryBusiness();
    setLogoutOpen(false);
    setSheetOpen(false);
    navigate("/login", { replace: true });
  }

  const tools = staffHomeToolsForFocus(focus);

  return (
    <div className="staff-home-page" data-testid="staff-home-page">
      <div className="staff-home-scroll">
        <div className="staff-home-inner">
          <header
            className="staff-home-greeting"
            data-slot="greeting"
            data-testid="staff-home-slot-greeting"
          >
            <button
              type="button"
              className="staff-home-greeting-main staff-home-greeting-main--button"
              onClick={() => setSheetOpen(true)}
              aria-label="Open profile"
            >
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
            </button>
            <button
              type="button"
              className="staff-home-bell"
              aria-label="Notifications"
              title="Notifications"
              onClick={() => navigate("/notifications")}
            >
              <span className="staff-home-bell-icon" aria-hidden="true" />
            </button>
          </header>

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
            <div className="staff-home-tools-grid">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  type="button"
                  className="staff-home-tool"
                  style={{
                    ["--staff-tool-color" as string]: tool.color,
                  }}
                  onClick={() => navigate(tool.path)}
                >
                  <span className="staff-home-tool-label">{tool.label}</span>
                </button>
              ))}
            </div>
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
            <div className="staff-home-quick-actions">
              {STAFF_HOME_QUICK_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  className="staff-home-quick-action"
                  onClick={() => navigate(action.path)}
                >
                  {action.label}
                </button>
              ))}
            </div>
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
            <button
              type="button"
              className="staff-home-scan-cta"
              onClick={() => navigate(STAFF_HOME_SCAN_CTA_PATH)}
            >
              {STAFF_HOME_SCAN_CTA_LABEL}
            </button>
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

      {sheetOpen ? (
        <div
          className="staff-home-sheet-backdrop"
          role="presentation"
          onClick={() => setSheetOpen(false)}
        >
          <div
            className="staff-home-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Staff profile"
            data-testid="staff-home-profile-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="staff-home-sheet-profile">
              <div className="staff-home-avatar staff-home-avatar--sheet">
                {STAFF_HOME_GREETING_AVATAR_FALLBACK}
              </div>
              <div>
                <p className="staff-home-sheet-name">
                  {STAFF_HOME_GREETING_NAME_FALLBACK}
                </p>
                <p className="staff-home-sheet-role">Role: Staff</p>
              </div>
            </div>

            <button
              type="button"
              className="staff-home-sheet-row"
              onClick={() => {
                setSheetOpen(false);
                navigate(STAFF_HOME_SETTINGS_PATH);
              }}
            >
              {STAFF_HOME_SETTINGS_LABEL}
            </button>

            <h2 className="staff-home-focus-heading">{STAFF_HOME_FOCUS_HEADING}</h2>
            <StaffHomeFocusRadios
              focus={focus}
              onFocusChange={onFocusChange}
              name="staff-home-focus-sheet"
            />

            <button
              type="button"
              className="staff-home-sheet-logout"
              onClick={() => setLogoutOpen(true)}
            >
              {STAFF_HOME_LOGOUT_LABEL}
            </button>

            <button
              type="button"
              className="staff-home-sheet-close"
              onClick={() => setSheetOpen(false)}
            >
              {STAFF_HOME_CLOSE_LABEL}
            </button>
          </div>
        </div>
      ) : null}

      {logoutOpen ? (
        <div
          className="staff-home-dialog-backdrop"
          role="presentation"
          onClick={() => setLogoutOpen(false)}
        >
          <div
            className="staff-home-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="staff-home-logout-title"
            aria-describedby="staff-home-logout-body"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="staff-home-logout-title" className="staff-home-dialog-title">
              {STAFF_HOME_LOGOUT_TITLE}
            </h2>
            <p id="staff-home-logout-body" className="staff-home-dialog-body">
              {STAFF_HOME_LOGOUT_BODY}
            </p>
            <div className="staff-home-dialog-actions">
              <button
                type="button"
                className="staff-home-dialog-cancel"
                onClick={() => setLogoutOpen(false)}
              >
                {STAFF_HOME_LOGOUT_CANCEL}
              </button>
              <button
                type="button"
                className="staff-home-dialog-confirm"
                onClick={confirmLogout}
              >
                {STAFF_HOME_LOGOUT_LABEL}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
