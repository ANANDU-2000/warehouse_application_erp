import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { readPrimaryBusiness } from "../../shared/auth/sessionStore";
import { apiGet, apiPatch, apiDelete } from "../../shared/api/apiClient";
import "./StockReorderPage.css";

type ReorderEntry = {
  id: string;
  item_id: string;
  item_name: string;
  item_code: string | null;
  current_stock: number;
  reorder_level: number;
  unit: string;
  status: string;
  supplier_name: string | null;
  last_purchase_rate: number | null;
  added_by: string;
  added_at: string;
};

type ReorderTab = "pending" | "ordered" | "done";

export function StockReorderPage() {
  const navigate = useNavigate();
  const session = readPrimaryBusiness();
  const biz = session?.id ?? "";
  const [tab, setTab] = useState<ReorderTab>("pending");
  const [entries, setEntries] = useState<ReorderEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  function load() {
    if (!biz) return;
    setLoading(true);
    apiGet<ReorderEntry[]>(`/v1/businesses/${biz}/stock/reorder`)
      .then((data) => { setEntries(data); setLoading(false); setError(null); })
      .catch((e) => { setError(e instanceof Error ? e.message : "Load failed"); setLoading(false); });
  }

  useEffect(() => { load(); }, [biz]);

  const filtered = useMemo(() => {
    let r = entries.filter((e) => e.status === tab);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((e) => e.item_name.toLowerCase().includes(q) || (e.supplier_name ?? "").toLowerCase().includes(q));
    }
    return r;
  }, [entries, tab, search]);

  const counts = useMemo(() => ({
    pending: entries.filter((e) => e.status === "pending").length,
    ordered: entries.filter((e) => e.status === "ordered").length,
    done: entries.filter((e) => e.status === "done").length,
  }), [entries]);

  async function markOrdered(id: string) {
    await apiPatch(`/v1/businesses/${biz}/stock/reorder/${id}`, { status: "ordered" });
    load();
  }

  async function markDone(id: string) {
    await apiPatch(`/v1/businesses/${biz}/stock/reorder/${id}`, { status: "done" });
    load();
  }

  async function removeEntry(id: string) {
    await apiDelete(`/v1/businesses/${biz}/stock/reorder/${id}`);
    load();
  }

  function inr(n: number | null) {
    if (n == null) return "";
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
  }

  return (
    <div className="ror-page">
      <header className="ror-hdr">
        <button type="button" className="ror-back" onClick={() => navigate(-1)}>←</button>
        <h1 className="ror-title">Reorder List</h1>
        <span className="ror-count">{counts.pending} pending</span>
      </header>

      <div className="ror-tabs">
        {(["pending", "ordered", "done"] as ReorderTab[]).map((t) => (
          <button key={t} type="button" className={`ror-tab${tab === t ? " ror-tab--on" : ""}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)} ({counts[t]})
          </button>
        ))}
      </div>

      <div className="ror-search-wrap">
        <input className="ror-search" type="search" placeholder="Search items or suppliers..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading && <div className="ror-loading">Loading...</div>}
      {error && <div className="ror-error">{error} <button onClick={load}>Retry</button></div>}

      {!loading && !error && filtered.length === 0 && (
        <div className="ror-empty">
          <p>No {tab} reorder entries</p>
        </div>
      )}

      <div className="ror-list">
        {filtered.map((e) => (
          <div key={e.id} className="ror-card">
            <div className="ror-card-top">
              <div className="ror-dot" data-status={e.status} />
              <div className="ror-card-info">
                <span className="ror-card-name">{e.item_name}</span>
                <span className="ror-card-sub">Stock {e.current_stock} / reorder {e.reorder_level} {e.unit}</span>
                {e.supplier_name && <span className="ror-card-sup">{e.supplier_name}{e.last_purchase_rate != null ? ` · ${inr(e.last_purchase_rate)}` : ""}</span>}
                <span className="ror-card-meta">Added by {e.added_by} · {new Date(e.added_at).toLocaleDateString("en-GB")}</span>
              </div>
            </div>
            <div className="ror-card-actions">
              {e.status === "pending" && (
                <>
                  <button type="button" className="ror-btn ror-btn--pri" onClick={() => navigate(`/purchase/new?catalogItemId=${e.item_id}`)}>Order</button>
                  <button type="button" className="ror-btn ror-btn--sec" onClick={() => markOrdered(e.id)}>Mark ordered</button>
                  <button type="button" className="ror-btn ror-btn--del" onClick={() => removeEntry(e.id)}>Remove</button>
                </>
              )}
              {e.status === "ordered" && (
                <>
                  <button type="button" className="ror-btn ror-btn--pri" onClick={() => markDone(e.id)}>Mark done</button>
                  <button type="button" className="ror-btn ror-btn--del" onClick={() => removeEntry(e.id)}>Remove</button>
                </>
              )}
              {e.status === "done" && (
                <button type="button" className="ror-btn ror-btn--del" onClick={() => removeEntry(e.id)}>Remove</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
