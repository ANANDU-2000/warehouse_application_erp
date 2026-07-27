import { Link } from "react-router-dom";
import "./DashboardRouteStubPage.css";

/**
 * Local stub for owner-home BUTTONS destinations not built yet.
 * No API — WIRE and later modules own real pages.
 */
export function DashboardRouteStubPage({ title }: { title: string }) {
  return (
    <div className="dash-stub" data-testid="dashboard-route-stub">
      <h1 className="dash-stub__title">{title}</h1>
      <p className="dash-stub__body">
        Not built yet — owner /home BUTTONS stub only.
      </p>
      <Link to="/home" className="dash-stub__back">
        Back to Home
      </Link>
    </div>
  );
}
