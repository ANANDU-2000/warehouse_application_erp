import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { readPrimaryBusiness } from "../../shared/auth/sessionStore";
import "./PurchaseHomePage.css";

const WIP_STORAGE_KEY = "hexa_purchase_wip_draft";

type WipDraft = Record<string, unknown> | null;

function readWipDraft(): WipDraft {
  try {
    const raw = localStorage.getItem(WIP_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function discardWipDraft(): void {
  try { localStorage.removeItem(WIP_STORAGE_KEY); } catch {}
}

type PurchaseRow = {
  id: string;
  purchase_number: string;
  party_name: string;
  purchase_date: string;
  total_amount: number;
  status: string;
  delivery_status: string;
  item_count: number;
};

type Period = "today" | "week" | "month" | "year" | "all";

const PERIOD_LABELS: Record<Period, string> = {
  today: "Today",
  week: "This Week",
  month: "This Month",
  year: "This Year",
  all: "All",
};

const PERIOD_ORDER: Period[] = ["today", "week", "month", "year", "all"];

const STATUS_COLORS: Record<string, string> = {
  draft: "#9CA3AF",
  confirmed: "#2563EB",
  delivered: "#059669",
  partially_delivered: "#D97706",
  cancelled: "#DC2626",
};

export function PurchaseHomePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const session = readPrimaryBusiness();
  const businessId = session?.id ?? "";

  const [period, setPeriod] = useState<Period>("month");
  const [search, setSearch] = useState("");
  const [wipDraft, setWipDraft] = useState<WipDraft>(null);

  // Check for WIP draft on mount
  useEffect(() => {
    setWipDraft(readWipDraft());
  }, []);
  const [purchases, setPurchases] = useState<PurchaseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filter = searchParams.get("filter") ?? "";

  useEffect(() => {
    if (!businessId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (filter) params.set("filter", filter);

    fetch(`/v1/businesses/${businessId}/trade-purchases/?${params}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("hexa_access_token_bk") ?? localStorage.getItem("access_token") ?? ""}`,
      },
    })
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load");
        return r.json();
      })
      .then((data) => {
        if (!cancelled) {
          setPurchases(Array.isArray(data) ? data : data.purchases ?? []);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Load failed");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [businessId, filter]);

  const filtered = useMemo(() => {
    let result = purchases;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.party_name?.toLowerCase().includes(q) ||
          p.purchase_number?.toLowerCase().includes(q),
      );
    }
    return result;
  }, [purchases, search]);

  const totalAmount = filtered.reduce((s, p) => s + (p.total_amount ?? 0), 0);

  function formatRupee(n: number): string {
    return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }

  function statusLabel(status: string): string {
    return (status ?? "draft").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  function deliveryLabel(ds: string): string {
    if (ds === "delivered") return "Delivered";
    if (ds === "partially") return "Partial";
    if (ds === "pending") return "Pending";
    return ds ?? "";
  }

  return (
    <div className="purchase-home">
      <header className="purchase-home__header">
        <button
          type="button"
          className="purchase-home__back"
          onClick={() => navigate("/home")}
          aria-label="Back"
        >
          ←
        </button>
        <h1 className="purchase-home__title">Purchases</h1>
        <div className="purchase-home__header-actions">
          <button
            type="button"
            className="purchase-home__fab-sm"
            onClick={() => navigate("/purchase/new")}
            aria-label="New purchase"
          >
            + New
          </button>
        </div>
      </header>

      {/* WIP resume banner */}
      {wipDraft && (
        <div className="purchase-home__wip-banner">
          <div className="purchase-home__wip-info">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#D97706"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg>
            <span>Resume unsaved purchase</span>
          </div>
          <div className="purchase-home__wip-actions">
            <button type="button" className="purchase-home__wip-resume" onClick={() => navigate("/purchase/new")}>Resume</button>
            <button type="button" className="purchase-home__wip-discard" onClick={() => { discardWipDraft(); setWipDraft(null); }}>Discard</button>
          </div>
        </div>
      )}

      <div className="purchase-home__period">
        {PERIOD_ORDER.map((key) => (
          <button
            key={key}
            type="button"
            className={`purchase-home__period-chip${period === key ? " purchase-home__period-chip--selected" : ""}`}
            onClick={() => setPeriod(key)}
          >
            {PERIOD_LABELS[key]}
          </button>
        ))}
      </div>

      <div className="purchase-home__search-row">
        <div className="purchase-home__search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#9CA3AF">
            <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
          <input
            type="search"
            placeholder="Search purchases..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="purchase-home__search-input"
          />
        </div>
      </div>

      <div className="purchase-home__summary">
        <span className="purchase-home__summary-count">{filtered.length} purchases</span>
        <span className="purchase-home__summary-amount">{formatRupee(totalAmount)}</span>
      </div>

      <main className="purchase-home__list">
        {loading && (
          <div className="purchase-home__skeleton">
            {[1, 2, 3].map((i) => (
              <div key={i} className="purchase-home__skeleton-row" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="purchase-home__error">
            <p>{error}</p>
            <button type="button" onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="purchase-home__empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="#D1D5DB">
              <path d="M18 17H6v-2h12v2zm0-4H6v-2h12v2zm0-4H6V7h12v2zM3 22l1.5-1.5L6 22l1.5-1.5L9 22l1.5-1.5L12 22l1.5-1.5L15 22l1.5-1.5L18 22l1.5-1.5L21 22V2l-1.5 1.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2 4.5 3.5 3 2v20z" />
            </svg>
            <p>No purchases found</p>
            <button
              type="button"
              className="purchase-home__empty-btn"
              onClick={() => navigate("/purchase/new")}
            >
              + Add First Purchase
            </button>
          </div>
        )}

        {!loading && !error && filtered.map((p) => (
          <button
            key={p.id}
            type="button"
            className="purchase-home__card"
            onClick={() => navigate(`/purchase/${p.id}`)}
          >
            <div className="purchase-home__card-top">
              <div className="purchase-home__card-party">
                <div className="purchase-home__card-avatar">
                  {p.party_name?.charAt(0)?.toUpperCase() ?? "?"}
                </div>
                <div>
                  <p className="purchase-home__card-name">{p.party_name}</p>
                  <p className="purchase-home__card-number">{p.purchase_number}</p>
                </div>
              </div>
              <div className="purchase-home__card-amount">
                {formatRupee(p.total_amount ?? 0)}
              </div>
            </div>
            <div className="purchase-home__card-bottom">
              <span className="purchase-home__card-date">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#9CA3AF">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z" />
                </svg>
                {new Date(p.purchase_date).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              <span className="purchase-home__card-items">{p.item_count ?? 0} items</span>
              <span
                className="purchase-home__card-status"
                style={{ background: STATUS_COLORS[p.status] ?? "#9CA3AF" }}
              >
                {statusLabel(p.status)}
              </span>
              {p.delivery_status && p.delivery_status !== "delivered" && (
                <span className="purchase-home__card-delivery">
                  {deliveryLabel(p.delivery_status)}
                </span>
              )}
            </div>
          </button>
        ))}
      </main>
    </div>
  );
}
