import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { readPrimaryBusiness } from "../../shared/auth/sessionStore";
import "./PurchaseDetailPage.css";

type PurchaseDetail = {
  id: string;
  purchase_number: string;
  party_name: string;
  party_type: string;
  purchase_date: string;
  total_amount: number;
  status: string;
  delivery_status: string;
  payment_terms: string;
  delivery_notes: string;
  items: Array<{
    item_name: string;
    quantity: number;
    unit: string;
    rate: number;
    discount: number;
    amount: number;
  }>;
};

export function PurchaseDetailPage() {
  const navigate = useNavigate();
  const { purchaseId } = useParams();
  const session = readPrimaryBusiness();
  const businessId = session?.id ?? "";

  const [purchase, setPurchase] = useState<PurchaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!businessId || !purchaseId) {
      setLoading(false);
      return;
    }
    const token = localStorage.getItem("hexa_access_token_bk") ?? localStorage.getItem("access_token") ?? "";
    fetch(`/v1/businesses/${businessId}/trade-purchases/${purchaseId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => {
        setPurchase(data);
        setLoading(false);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Load failed");
        setLoading(false);
      });
  }, [businessId, purchaseId]);

  function formatRupee(n: number): string {
    return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }

  function statusColor(s: string): string {
    const m: Record<string, string> = {
      draft: "#9CA3AF",
      confirmed: "#2563EB",
      delivered: "#059669",
      partially_delivered: "#D97706",
      cancelled: "#DC2626",
    };
    return m[s] ?? "#9CA3AF";
  }

  if (loading) {
    return (
      <div className="pd-page">
        <header className="pd-page__header">
          <button type="button" className="pd-page__back" onClick={() => navigate(-1)}>←</button>
          <h1 className="pd-page__title">Purchase Detail</h1>
        </header>
        <div className="pd-page__skeleton">
          {[1, 2, 3].map((i) => <div key={i} className="pd-page__skeleton-bar" />)}
        </div>
      </div>
    );
  }

  if (error || !purchase) {
    return (
      <div className="pd-page">
        <header className="pd-page__header">
          <button type="button" className="pd-page__back" onClick={() => navigate(-1)}>←</button>
          <h1 className="pd-page__title">Purchase Detail</h1>
        </header>
        <div className="pd-page__error">
          <p>{error ?? "Purchase not found"}</p>
          <button type="button" onClick={() => navigate("/purchase")}>Back to List</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pd-page">
      <header className="pd-page__header">
        <button type="button" className="pd-page__back" onClick={() => navigate(-1)}>←</button>
        <h1 className="pd-page__title">{purchase.purchase_number}</h1>
        <span className="pd-page__status" style={{ background: statusColor(purchase.status) }}>
          {purchase.status?.replace(/_/g, " ").toUpperCase()}
        </span>
      </header>

      <main className="pd-page__body">
        <section className="pd-page__card">
          <div className="pd-page__card-row">
            <div className="pd-page__card-party">
              <div className="pd-page__card-avatar">
                {purchase.party_name?.charAt(0)?.toUpperCase() ?? "?"}
              </div>
              <div>
                <p className="pd-page__card-name">{purchase.party_name}</p>
                <p className="pd-page__card-type">{purchase.party_type}</p>
              </div>
            </div>
          </div>
          <div className="pd-page__card-meta">
            <span className="pd-page__meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#9CA3AF">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z" />
              </svg>
              {new Date(purchase.purchase_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </span>
            {purchase.delivery_status && (
              <span className={`pd-page__delivery-badge pd-page__delivery-badge--${purchase.delivery_status}`}>
                {purchase.delivery_status}
              </span>
            )}
          </div>
        </section>

        <section className="pd-page__card">
          <h2 className="pd-page__section-title">Items ({purchase.items?.length ?? 0})</h2>
          <div className="pd-page__items">
            {purchase.items?.map((item, i) => (
              <div key={i} className="pd-page__item-row">
                <span className="pd-page__item-idx">{i + 1}</span>
                <div className="pd-page__item-info">
                  <span className="pd-page__item-name">{item.item_name}</span>
                  <span className="pd-page__item-qty">
                    {item.quantity} {item.unit} × {formatRupee(item.rate)}
                    {item.discount > 0 ? ` - ${formatRupee(item.discount)}` : ""}
                  </span>
                </div>
                <span className="pd-page__item-amount">{formatRupee(item.amount)}</span>
              </div>
            ))}
          </div>
          <div className="pd-page__total">
            <span>Total</span>
            <span>{formatRupee(purchase.total_amount)}</span>
          </div>
        </section>

        {(purchase.payment_terms || purchase.delivery_notes) && (
          <section className="pd-page__card">
            <h2 className="pd-page__section-title">Notes</h2>
            {purchase.payment_terms && (
              <div className="pd-page__note">
                <span className="pd-page__note-label">Payment Terms</span>
                <span>{purchase.payment_terms}</span>
              </div>
            )}
            {purchase.delivery_notes && (
              <div className="pd-page__note">
                <span className="pd-page__note-label">Delivery Notes</span>
                <span>{purchase.delivery_notes}</span>
              </div>
            )}
          </section>
        )}

        <section className="pd-page__card pd-page__card--actions">
          <button type="button" className="pd-page__action-btn pd-page__action-btn--primary" onClick={() => navigate("/purchase")}>
            Back to Purchases
          </button>
        </section>
      </main>
    </div>
  );
}
