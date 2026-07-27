import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { readPrimaryBusiness } from "../../shared/auth/sessionStore";
import "./StockPage.css";

type StockItem = {
  id: string;
  name: string;
  item_code: string;
  category_name: string;
  current_stock: number;
  unit: string;
  status: string;
  reorder_level: number;
  last_updated: string;
};

type StockTab = "all" | "low" | "out";

export function StockPage() {
  const navigate = useNavigate();
  const session = readPrimaryBusiness();
  const businessId = session?.id ?? "";

  const [tab, setTab] = useState<StockTab>("all");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!businessId) {
      setLoading(false);
      return;
    }
    const token = localStorage.getItem("hexa_access_token_bk") ?? localStorage.getItem("access_token") ?? "";
    fetch(`/v1/businesses/${businessId}/stock/list`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load stock");
        return r.json();
      })
      .then((data) => {
        setItems(Array.isArray(data) ? data : data.items ?? []);
        setLoading(false);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Load failed");
        setLoading(false);
      });
  }, [businessId]);

  const filtered = useMemo(() => {
    let result = items;
    if (tab === "low") result = result.filter((i) => i.status === "low");
    if (tab === "out") result = result.filter((i) => i.status === "out" || i.current_stock <= 0);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.item_code?.toLowerCase().includes(q) ||
          i.category_name?.toLowerCase().includes(q),
      );
    }
    return result;
  }, [items, tab, search]);

  const counts = useMemo(
    () => ({
      all: items.length,
      low: items.filter((i) => i.status === "low").length,
      out: items.filter((i) => i.status === "out" || i.current_stock <= 0).length,
    }),
    [items],
  );

  function statusColor(s: string): string {
    const m: Record<string, string> = {
      good: "#059669",
      low: "#D97706",
      out: "#DC2626",
      critical: "#DC2626",
    };
    return m[s] ?? "#6B7280";
  }

  return (
    <div className="stock-page">
      <header className="stock-page__header">
        <button type="button" className="stock-page__back" onClick={() => navigate("/home")}>←</button>
        <h1 className="stock-page__title">Stock</h1>
        <button type="button" className="stock-page__fab-sm" onClick={() => navigate("/stock/opening-setup")}>
          Setup
        </button>
      </header>

      <div className="stock-page__tabs">
        {(["all", "low", "out"] as StockTab[]).map((t) => (
          <button
            key={t}
            type="button"
            className={`stock-page__tab${tab === t ? " stock-page__tab--selected" : ""}`}
            onClick={() => setTab(t)}
          >
            {t === "all" ? "All" : t === "low" ? "Low Stock" : "Out of Stock"}
            <span className="stock-page__tab-count">{counts[t]}</span>
          </button>
        ))}
      </div>

      <div className="stock-page__search">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#9CA3AF">
          <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
        </svg>
        <input
          type="search"
          placeholder="Search stock..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="stock-page__search-input"
        />
      </div>

      <main className="stock-page__list">
        {loading && (
          <div className="stock-page__skeleton">
            {[1, 2, 3, 4].map((i) => <div key={i} className="stock-page__skeleton-row" />)}
          </div>
        )}

        {!loading && error && (
          <div className="stock-page__error">
            <p>{error}</p>
            <button type="button" onClick={() => window.location.reload()}>Retry</button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="stock-page__empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="#D1D5DB">
              <path d="M21 2H3c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H3V4h18v16z" />
            </svg>
            <p>No stock items found</p>
          </div>
        )}

        {!loading && !error && filtered.map((item) => (
          <div key={item.id} className="stock-page__card">
            <div className="stock-page__card-top">
              <div className="stock-page__card-avatar">{item.name.charAt(0).toUpperCase()}</div>
              <div className="stock-page__card-info">
                <p className="stock-page__card-name">{item.name}</p>
                <p className="stock-page__card-code">{item.item_code} · {item.category_name}</p>
              </div>
              <span className="stock-page__card-status" style={{ background: statusColor(item.status) }}>
                {item.status?.toUpperCase()}
              </span>
            </div>
            <div className="stock-page__card-bottom">
              <div className="stock-page__card-stock">
                <span className="stock-page__card-stock-value">{item.current_stock}</span>
                <span className="stock-page__card-stock-unit">{item.unit}</span>
              </div>
              <div className="stock-page__card-reorder">
                <span>Reorder: {item.reorder_level} {item.unit}</span>
              </div>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
