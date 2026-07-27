import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { readPrimaryBusiness } from "../../../shared/auth/sessionStore";
import { apiGet } from "../../../shared/api/apiClient";
import "./StaffScanPage.css";

type ScanResult = {
  id: string;
  name: string;
  item_code: string | null;
  barcode: string | null;
  current_stock: number;
  unit: string;
};

export function StaffScanPage() {
  const navigate = useNavigate();
  const session = readPrimaryBusiness();
  const biz = session?.id ?? "";
  const [manualCode, setManualCode] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [recentScans, setRecentScans] = useState<{ code: string; name: string }[]>(() => {
    try { return JSON.parse(localStorage.getItem("hexa_recent_scans") ?? "[]"); } catch { return []; }
  });

  async function lookup(code: string) {
    if (!biz || !code.trim()) return;
    setSearching(true);
    setError(null);
    setResult(null);
    try {
      const data = await apiGet<ScanResult>(`/v1/businesses/${biz}/stock/barcode/lookup?code=${encodeURIComponent(code.trim())}`);
      setResult(data);
      const updated = [{ code: code.trim(), name: data.name }, ...recentScans.filter((s) => s.code !== code.trim())].slice(0, 8);
      setRecentScans(updated);
      localStorage.setItem("hexa_recent_scans", JSON.stringify(updated));
    } catch {
      setError(`No item found for "${code.trim()}"`);
    } finally {
      setSearching(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    lookup(manualCode);
  }

  return (
    <div className="ssc-page">
      <header className="ssc-hdr">
        <button type="button" className="ssc-back" onClick={() => navigate(-1)}>←</button>
        <h1 className="ssc-title">Scan Barcode</h1>
      </header>
      <div className="ssc-body">
        <div className="ssc-scanner">
          <div className="ssc-scanner-frame">
            <div className="ssc-corner ssc-corner--tl" />
            <div className="ssc-corner ssc-corner--tr" />
            <div className="ssc-corner ssc-corner--bl" />
            <div className="ssc-corner ssc-corner--br" />
            <div className="ssc-scan-line" />
            <span className="ssc-scanner-text">Camera unavailable</span>
            <span className="ssc-scanner-hint">Use manual entry below</span>
          </div>
        </div>

        <form className="ssc-form" onSubmit={handleSubmit}>
          <input className="ssc-input" type="text" value={manualCode} onChange={(e) => setManualCode(e.target.value)} placeholder="Enter barcode or item code..." />
          <button type="submit" className="ssc-submit" disabled={searching || !manualCode.trim()}>
            {searching ? "..." : "→"}
          </button>
        </form>

        {recentScans.length > 0 && (
          <div className="ssc-recent">
            <p className="ssc-recent-title">Recent Scans</p>
            <div className="ssc-recent-list">
              {recentScans.map((s) => (
                <button key={s.code} type="button" className="ssc-recent-chip" onClick={() => { setManualCode(s.code); lookup(s.code); }}>
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <div className="ssc-error">{error}</div>}

        {result && (
          <div className="ssc-result">
            <div className="ssc-result-top">
              <div className="ssc-result-avatar">{result.name.charAt(0).toUpperCase()}</div>
              <div className="ssc-result-info">
                <span className="ssc-result-name">{result.name}</span>
                <span className="ssc-result-sub">{result.item_code ?? "No code"} · {result.current_stock} {result.unit}</span>
              </div>
            </div>
            <div className="ssc-result-actions">
              <button type="button" className="ssc-btn ssc-btn--pri" onClick={() => navigate(`/catalog/item/${result.id}`)}>View Details</button>
              <button type="button" className="ssc-btn ssc-btn--sec" onClick={() => navigate(`/catalog/item/${result.id}`)}>Update Stock</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
