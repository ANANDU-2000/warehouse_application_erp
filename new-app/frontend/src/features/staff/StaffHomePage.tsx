import "./StaffHomePage.css";

/**
 * Staff `/staff/home` — Step 1 SCAFFOLD.
 * Empty section slots in legacy body order (dashboard.md §1 Staff).
 * No focus fields, CTAs, or network calls.
 */
const SLOTS: { slot: string; title: string }[] = [
  { slot: "greeting", title: "Greeting" },
  { slot: "floor-kpis", title: "Floor KPIs" },
  { slot: "warehouse", title: "Warehouse stats" },
  { slot: "pending-deliveries", title: "Pending deliveries" },
  { slot: "shift-today", title: "Shift today" },
  { slot: "tools", title: "Tools" },
  { slot: "quick-actions", title: "Quick actions" },
  { slot: "scan-cta", title: "Scan CTA" },
  { slot: "needs-attention", title: "Needs attention" },
  { slot: "recent-activity", title: "Recent activity" },
];

export function StaffHomePage() {
  return (
    <div className="staff-home" data-testid="staff-home-page">
      <div className="staff-home__shell">
        {SLOTS.map(({ slot, title }) => (
          <section
            key={slot}
            className="staff-home__slot"
            aria-label={title}
            data-slot={slot}
          >
            <h2 className="staff-home__slot-title">{title}</h2>
          </section>
        ))}
      </div>
    </div>
  );
}
