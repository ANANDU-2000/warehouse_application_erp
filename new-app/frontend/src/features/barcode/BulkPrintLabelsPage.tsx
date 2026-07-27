import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { readPrimaryBusiness } from "../../shared/auth/sessionStore";
import { apiGet } from "../../shared/api/apiClient";
import "./BulkPrintLabelsPage.css";

type PrintItem = {
  id: string;
  name: string;
  item_code: string | null;
  barcode: string | null;
  current_stock: number;
  unit: string;
  category_name: string | null;
  selected?: boolean;
};

export function BulkPrintLabelsPage() {
  const navigate = useNavigate();
  const session = readPrimaryBusiness();
  const biz = session?.id ?? "";
  const [items, setItems] = useState<PrintItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function load() {
    if (!biz) return;
    setLoading(true);
    apiGet<{ items?: PrintItem[] } | PrintItem[]>(`/v1/businesses/${biz}/stock/opening/missing`)
      .then((data) => {
        const raw = Array.isArray(data) ? data : (data as { items?: PrintItem[] }).items ?? [];
        setItems(raw);
        setLoading(false);
        setError(null);
      })
      .catch((e) => { setError(e instanceof Error ? e.message : "Load failed"); setLoading(false); });
  }

  useEffect(() => { load(); }, [biz]);

  const filtered = items.filter((i) =>
    !search.trim() || i.name.toLowerCase().includes(search.toLowerCase())
  );

  function toggleItem(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(filtered.map((i) => i.id)));
  }

  function clearAll() {
    setSelected(new Set());
  }

  return (
    <div className="bpl-page">
      <header className="bpl-hdr">
        <button type="button" className="bpl-back" onClick={() => navigate(-1)}>←</button>
        <h1 className="bpl-title">Bulk Print Labels</h1>
        {selected.size > 0 && <span className="bpl-count">{selected.size} selected</span>}
      </header>

      <div className="bpl-search-wrap">
        <input className="bpl-search" type="search" placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {selected.size > 0 && (
        <div className="bpl-actions">
          <button type="button" className="bpl-btn bpl-btn--sec" onClick={clearAll}>Clear ({selected.size})</button>
          <button type="button" className="bpl-btn bpl-btn--pri" onClick={() => alert(`PDF generation for ${selected.size} labels coming soon`)}>
            Download PDF
          </button>
        </div>
      )}

      {selected.size === 0 && filtered.length > 0 && (
        <div className="bpl-actions">
          <button type="button" className="bpl-btn bpl-btn--sec" onClick={selectAll}>Select all ({filtered.length})</button>
        </div>
      )}

      {loading && <div className="bpl-loading">Loading...</div>}
      {error && <div className="bpl-error">{error} <button onClick={load}>Retry</button></div>}

      {!loading && filtered.length === 0 && (
        <div className="bpl-empty"><p>No items to print</p></div>
      )}

      <div className="bpl-list">
        {filtered.map((item) => (
          <div key={item.id} className={`bpl-card${selected.has(item.id) ? " bpl-card--sel" : ""}`} onClick={() => toggleItem(item.id)}>
            <div className="bpl-check">{selected.has(item.id) ? "✓" : ""}</div>
            <div className="bpl-card-info">
              <span className="bpl-card-name">{item.name}</span>
              <span className="bpl-card-sub">{item.item_code ?? "No code"} · {item.barcode ?? "No barcode"} · {item.current_stock} {item.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
