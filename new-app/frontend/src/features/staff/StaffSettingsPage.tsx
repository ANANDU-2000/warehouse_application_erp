import { useNavigate } from "react-router-dom";
import { readPrimaryBusiness, clearPrimaryBusiness } from "../../shared/auth/sessionStore";
import { clearTokens } from "../../shared/auth/tokenStore";
import "./StaffSettingsPage.css";

export function StaffSettingsPage() {
  const navigate = useNavigate();
  const session = readPrimaryBusiness();
  const name = session?.name ?? "Staff";
  const initial = name.charAt(0).toUpperCase();

  function logout() {
    clearTokens();
    clearPrimaryBusiness();
    navigate("/login", { replace: true });
  }

  return (
    <div className="sts-page">
      <header className="sts-hdr">
        <button type="button" className="sts-back" onClick={() => navigate(-1)}>←</button>
        <h1 className="sts-title">Settings</h1>
      </header>
      <div className="sts-body">
        <div className="sts-profile">
          <div className="sts-avatar">{initial}</div>
          <div className="sts-profile-info">
            <p className="sts-name">{name}</p>
            <p className="sts-role">Staff</p>
          </div>
        </div>

        <div className="sts-card">
          <h3 className="sts-section">Quick Links</h3>
          <button type="button" className="sts-item" onClick={() => navigate("/staff/stock")}>View Stock</button>
          <button type="button" className="sts-item" onClick={() => navigate("/staff/deliveries")}>Deliveries</button>
          <button type="button" className="sts-item" onClick={() => navigate("/staff/low-stock")}>Low Stock Alerts</button>
          <button type="button" className="sts-item" onClick={() => navigate("/staff/activity")}>Activity Log</button>
          <button type="button" className="sts-item" onClick={() => navigate("/barcode/scan")}>Scan Barcode</button>
        </div>

        <div className="sts-card">
          <h3 className="sts-section">Account</h3>
          <div className="sts-info-row"><span>Signed in as</span><span>{session?.id ? "Active" : "No session"}</span></div>
        </div>

        <button type="button" className="sts-logout" onClick={logout}>Sign Out</button>
      </div>
    </div>
  );
}
