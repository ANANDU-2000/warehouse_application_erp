import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { readPrimaryBusiness } from "../../shared/auth/sessionStore";
import { apiGet } from "../../shared/api/apiClient";
import "./MissingBarcodesPage.css";

type MissingItem = {
  id: string;
  name: string;
  item_code: string | null;
  barcode: string | null;
  current_stock: number;
  unit: string;
  category_name: string | null;
};

type MissingTab = "barcode" | "code";

export function MissingBarcodesPage() {
  const navigate = useNavigate();
  const session = readPrimaryBusiness();
  const biz = session?.id ?? "";
  const [tab, setTab] = useState<MissingTab>("barcode");
  const [items, setItems] = useState<MissingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load() {
    if (!biz) return;
    setLoading(true);
    apiGet<{ items?: MissingItem[] } | MissingItem[]>(`/v1/businesses/${biz}/stock/opening/missing`)
      .then((data) => {
        setItems(Array.isArray(data) ? data : (data as { items?: MissingItem[] }).items ?? []);
        setLoading(false);
        setError(null);
      })
      .catch((e) => { setError(e instanceof Error ? e.message : "Load failed"); setLoading(false); });
  }

  useEffect(() => { load(); }, [biz]);

  const barcodeMissing = items.filter((i) => !i.barcode);
  const codeMissing = items.filter((i) => !i.item_code);
  const shown = tab === "barcode" ? barcodeMissing : codeMissing;

  return (
    <div className="mb-page">
      <header className="mb-hdr">
        <button type="button" className="mb-back" onClick={() => navigate(-1)}>←</button>
        <h1 className="mb-title">Missing Labels</h1>
        <button type="button" className="mb-scan-btn" onClick={() => navigate("/barcode/scan")} aria-label="Scan">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#374151"><path d="M4 7V4h3M17 4h3v3M20 17v3h-3M7 20H4v-3"/><rect x="7" y="7" width="10" height="10" rx="1"/></svg>
        </button>
      </header>

      <div className="mb-tabs">
        <button type="button" className={`mb-tab${tab === "barcode" ? " mb-tab--on" : ""}`} onClick={() => setTab("barcode")}>
          Missing Barcode ({barcodeMissing.length})
        </button>
        <button type="button" className={`mb-tab${tab === "code" ? " mb-tab--on" : ""}`} onClick={() => setTab("code")}>
          Missing Item Code ({codeMissing.length})
        </button>
      </div>

      {loading && <div className="mb-loading">Loading...</div>}
      {error && <div className="mb-error">{error} <button onClick={load}>Retry</button></div>}

      {!loading && !error && shown.length === 0 && (
        <div className="mb-empty">
          <p>{tab === "barcode" ? "All items have barcodes" : "All items have item codes"}</p>
        </div>
      )}

      <div className="mb-list">
        {shown.map((item) => (
          <div key={item.id} className="mb-card" onClick={() => navigate(`/catalog/item/${item.id}`)}>
            <div className="mb-card-avatar">{item.name.charAt(0).toUpperCase()}</div>
            <div className="mb-card-info">
              <span className="mb-card-name">{item.name}</span>
              <span className="mb-card-sub">
                Stock: {item.current_stock} {item.unit}
                {tab === "barcode" ? ` · Code: ${item.item_code ?? "—"}` : ` · Barcode: ${item.barcode ?? "—"}`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
