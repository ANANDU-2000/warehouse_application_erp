import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { readPrimaryBusiness } from "../../shared/auth/sessionStore";
import { apiGet, apiPost } from "../../shared/api/apiClient";
import "./StockOpeningSetupPage.css";

type OpeningItem = {
  item_id: string;
  item_name: string;
  category_name: string | null;
  current_opening_qty: number | null;
  unit: string;
  locked: boolean;
};

export function StockOpeningSetupPage() {
  const navigate = useNavigate();
  const session = readPrimaryBusiness();
  const biz = session?.id ?? "";
  const [items, setItems] = useState<OpeningItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editItem, setEditItem] = useState<OpeningItem | null>(null);
  const [editQty, setEditQty] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editReason, setEditReason] = useState("");
  const [saving, setSaving] = useState(false);

  function load() {
    if (!biz) return;
    setLoading(true);
    apiGet<{ items?: OpeningItem[] } | OpeningItem[]>(`/v1/businesses/${biz}/stock/opening/missing`)
      .then((data) => {
        setItems(Array.isArray(data) ? data : (data as { items?: OpeningItem[] }).items ?? []);
        setLoading(false);
        setError(null);
      })
      .catch((e) => { setError(e instanceof Error ? e.message : "Load failed"); setLoading(false); });
  }

  useEffect(() => { load(); }, [biz]);

  const filtered = items.filter((i) =>
    !search.trim() || i.item_name.toLowerCase().includes(search.toLowerCase()) || (i.category_name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const completed = items.filter((i) => i.current_opening_qty != null && i.current_opening_qty > 0).length;

  function openEdit(item: OpeningItem) {
    setEditItem(item);
    setEditQty(item.current_opening_qty != null ? String(item.current_opening_qty) : "");
    setEditNotes("");
    setEditReason("");
  }

  async function saveOpening() {
    if (!editItem || !biz) return;
    setSaving(true);
    try {
      await apiPost(`/v1/businesses/${biz}/stock/${editItem.item_id}/opening-stock`, {
        opening_stock_qty: parseFloat(editQty) || 0,
        notes: editNotes || undefined,
        reason: editReason || undefined,
      });
      setEditItem(null);
      load();
    } catch {
      alert("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="ops-page">
      <header className="ops-hdr">
        <button type="button" className="ops-back" onClick={() => navigate(-1)}>←</button>
        <h1 className="ops-title">Opening Stock Setup</h1>
      </header>

      <div className="ops-summary">
        <div className="ops-sum-item"><span className="ops-sum-val">{items.length}</span><span className="ops-sum-lbl">Total</span></div>
        <div className="ops-sum-item"><span className="ops-sum-val">{completed}</span><span className="ops-sum-lbl">Set</span></div>
        <div className="ops-sum-item"><span className="ops-sum-val">{items.length - completed}</span><span className="ops-sum-lbl">Pending</span></div>
      </div>

      <div className="ops-search-wrap">
        <input className="ops-search" type="search" placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading && <div className="ops-loading">Loading...</div>}
      {error && <div className="ops-error">{error} <button onClick={load}>Retry</button></div>}

      {!loading && filtered.length === 0 && (
        <div className="ops-empty">
          <p>{items.length === 0 ? "All items have opening stock set" : "No matching items"}</p>
        </div>
      )}

      <div className="ops-list">
        {filtered.map((item) => (
          <div key={item.item_id} className="ops-card" onClick={() => openEdit(item)}>
            <div className="ops-card-info">
              <span className="ops-card-name">{item.item_name}</span>
              <span className="ops-card-sub">{item.category_name ?? "Uncategorized"}</span>
            </div>
            <div className="ops-card-right">
              <span className="ops-card-qty">{item.current_opening_qty ?? "—"} {item.unit}</span>
              <span className={`ops-card-status${item.locked ? " ops-card-status--locked" : ""}`}>
                {item.locked ? "Locked" : item.current_opening_qty != null ? "Set" : "Pending"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {editItem && (
        <div className="ops-modal" onClick={() => setEditItem(null)}>
          <div className="ops-modal-body" onClick={(e) => e.stopPropagation()}>
            <h3 className="ops-modal-title">Set Opening Stock</h3>
            <p className="ops-modal-item">{editItem.item_name} ({editItem.unit})</p>
            {editItem.locked && (
              <p className="ops-modal-hint">Current value is locked. Provide a reason to change.</p>
            )}
            <div className="ops-field">
              <label className="ops-label">Opening Quantity</label>
              <input className="ops-input" type="number" value={editQty} onChange={(e) => setEditQty(e.target.value)} min="0" step="0.01" />
            </div>
            <div className="ops-field">
              <label className="ops-label">Notes (optional)</label>
              <textarea className="ops-textarea" value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={2} />
            </div>
            {editItem.locked && (
              <div className="ops-field">
                <label className="ops-label">Reason for change</label>
                <input className="ops-input" type="text" value={editReason} onChange={(e) => setEditReason(e.target.value)} placeholder="Required" />
              </div>
            )}
            <div className="ops-modal-actions">
              <button type="button" className="ops-btn ops-btn--sec" onClick={() => setEditItem(null)}>Cancel</button>
              <button type="button" className="ops-btn ops-btn--pri" onClick={saveOpening} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
