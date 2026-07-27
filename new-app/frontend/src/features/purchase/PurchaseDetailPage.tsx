import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { readPrimaryBusiness } from "../../shared/auth/sessionStore";
import { DeliveryBanner } from "./DeliveryBanner";
import { DeliveryTimeline } from "./DeliveryTimeline";
import { DamageSection } from "./DamageSection";
import { ChargesAndBalance } from "./ChargesAndBalance";
import { DetailActionBar } from "./DetailActionBar";
import "./PurchaseDetailPage.css";

type PurchaseLine = {
  id: string;
  catalog_item_id: string | null;
  item_name: string;
  qty: number;
  unit: string;
  landing_cost: number;
  selling_cost: number | null;
  purchase_rate: number | null;
  selling_rate: number | null;
  line_total: number | null;
  profit: number | null;
  discount: number | null;
  received_qty: number | null;
  damaged_qty: number | null;
  return_qty: number | null;
  line_landing_gross: number;
  line_selling_gross: number;
  line_profit: number | null;
};

type PurchaseData = {
  id: string;
  human_id: string;
  invoice_number: string | null;
  purchase_date: string;
  supplier_id: string;
  supplier_name: string | null;
  broker_id: string | null;
  broker_name: string | null;
  payment_days: number | null;
  due_date: string | null;
  paid_amount: number;
  remaining: number;
  total_amount: number;
  total_qty: number | null;
  total_landing_subtotal: number | null;
  total_selling_subtotal: number | null;
  total_line_profit: number | null;
  delivery_status: string;
  dispatched_at: string | null;
  arrived_at: string | null;
  staff_verified_at: string | null;
  stock_committed_at: string | null;
  truck_number: string | null;
  driver_contact: string | null;
  dispatch_note: string | null;
  has_missing_details: boolean;
  status: string;
  delivery_notes: string | null;
  commission_mode: string;
  commission_money: number | null;
  header_discount: number | null;
  freight_amount: number | null;
  freight_type: string | null;
  delivered_rate: number | null;
  billty_rate: number | null;
  created_at: string;
  lines: PurchaseLine[];
  items_count: number;
};

function inr(n: number): string {
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

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("hexa_access_token_bk") ?? localStorage.getItem("access_token") ?? "";
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

export function PurchaseDetailPage() {
  const navigate = useNavigate();
  const { purchaseId } = useParams();
  const session = readPrimaryBusiness();
  const businessId = session?.id ?? "";
  const role = session?.role ?? "";
  const hideFinancials = role === "staff" || role === "employee";

  const [purchase, setPurchase] = useState<PurchaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deliveryBusy, setDeliveryBusy] = useState(false);

  const load = useCallback(() => {
    if (!businessId || !purchaseId) {
      setLoading(false);
      setError("Missing business or purchase ID");
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    const headers = authHeaders();
    fetch(`/v1/businesses/${businessId}/trade-purchases/${purchaseId}`, { headers })
      .then(r => {
        if (!r.ok) throw new Error(r.status === 404 ? "Purchase not found" : "Failed to load");
        return r.json();
      })
      .then((data: PurchaseData) => {
        if (!cancelled) { setPurchase(data); setLoading(false); }
      })
      .catch((e: unknown) => {
        if (!cancelled) { setError(e instanceof Error ? e.message : "Load failed"); setLoading(false); }
      });
    return () => { cancelled = true; };
  }, [businessId, purchaseId]);

  useEffect(load, [load]);

  async function handleDeliveryAction(url: string, body?: Record<string, unknown>): Promise<boolean> {
    setDeliveryBusy(true);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: authHeaders(),
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        if (res.status === 501) { alert("This feature is coming soon."); return false; }
        const b = await res.json().catch(() => ({}));
        throw new Error(b.error ?? "Action failed");
      }
      load();
      return true;
    } catch (e) {
      alert(e instanceof Error ? e.message : "Action failed");
      return false;
    } finally {
      setDeliveryBusy(false);
    }
  }

  function handleDispatch() {
    handleDeliveryAction(`/v1/businesses/${businessId}/trade-purchases/${purchaseId}/dispatch`, {
      mark_in_transit: true,
    });
  }

  function handleArrive() {
    handleDeliveryAction(`/v1/businesses/${businessId}/trade-purchases/${purchaseId}/arrive`);
  }

  function handleVerify() {
    handleDeliveryAction(`/v1/businesses/${businessId}/trade-purchases/${purchaseId}/verify`, {
      lines: purchase?.lines?.map(l => ({ line_id: l.id, received_qty: l.qty, damaged_qty: 0, return_qty: 0 })) ?? [],
    });
  }

  function handleCommitStock() {
    handleDeliveryAction(`/v1/businesses/${businessId}/trade-purchases/${purchaseId}/commit-stock`);
  }

  async function handleMarkPaid(amount: number) {
    const res = await fetch(`/v1/businesses/${businessId}/trade-purchases/${purchaseId}/mark-paid`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ amount }),
    });
    if (!res.ok) { const b = await res.json().catch(() => ({})); alert(b.error ?? "Payment failed"); return; }
    load();
  }

  async function handleDelete() {
    const res = await fetch(`/v1/businesses/${businessId}/trade-purchases/${purchaseId}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (!res.ok) { alert("Delete failed"); return; }
    navigate("/purchase");
  }

  function formatDate(d: string): string {
    return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  if (loading) {
    return (
      <div className="pd-page">
        <header className="pd-page__header">
          <button type="button" className="pd-page__back" onClick={() => navigate(-1)}>←</button>
          <h1 className="pd-page__title">Purchase Detail</h1>
        </header>
        <div className="pd-page__skeleton">
          <div className="pd-page__skeleton-bar" />
          <div className="pd-page__skeleton-bar" />
          <div className="pd-page__skeleton-bar" />
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
        <h1 className="pd-page__title">{purchase.human_id}</h1>
        <span className="pd-page__status" style={{ background: statusColor(purchase.status) }}>
          {purchase.status?.replace(/_/g, " ").toUpperCase()}
        </span>
      </header>

      <div className="pd-page__body">
        <main className="pd-page__main">
          <DeliveryBanner
            deliveryStatus={purchase.delivery_status}
            role={role}
            deliveryBusy={deliveryBusy}
            onDispatch={handleDispatch}
            onArrive={handleArrive}
            onVerify={handleVerify}
            onCommitStock={handleCommitStock}
          />

          <section className="pd-card">
            <div className="pd-card__party">
              <div className="pd-card__avatar">{purchase.supplier_name?.charAt(0)?.toUpperCase() ?? "?"}</div>
              <div>
                <p className="pd-card__name">{purchase.supplier_name}</p>
                {purchase.broker_name && <p className="pd-card__broker">via {purchase.broker_name}</p>}
              </div>
            </div>
            <div className="pd-card__meta">
              <span className="pd-card__meta-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#9CA3AF"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z" /></svg>
                {formatDate(purchase.purchase_date)}
              </span>
              {purchase.invoice_number && (
                <span className="pd-card__meta-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#9CA3AF"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" /></svg>
                  {purchase.invoice_number}
                </span>
              )}
              {purchase.payment_days ? (
                <span className="pd-card__meta-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#9CA3AF"><path d="M11.5 1L1 11.5 11.5 22 22 11.5 11.5 1zm.5 17h-2v-2h2v2zm0-4h-2V7h2v7z" /></svg>
                  {purchase.payment_days}d
                </span>
              ) : null}
              {purchase.due_date && (
                <span className="pd-card__meta-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#9CA3AF"><path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" /></svg>
                  Due {formatDate(purchase.due_date)}
                </span>
              )}
            </div>
            {purchase.delivery_notes && (
              <div className="pd-card__notes">
                <span className="pd-card__notes-label">Delivery Notes</span>
                <span>{purchase.delivery_notes}</span>
              </div>
            )}
          </section>

          {!hideFinancials && (
            <section className="pd-card pd-summary">
              <div className="pd-summary__grid">
                <div className="pd-summary__item">
                  <span className="pd-summary__label">Qty</span>
                  <span className="pd-summary__value">{purchase.total_qty ?? 0}</span>
                </div>
                <div className="pd-summary__item">
                  <span className="pd-summary__label">Amount</span>
                  <span className="pd-summary__value">{inr(purchase.total_amount)}</span>
                </div>
                <div className="pd-summary__item">
                  <span className="pd-summary__label">Landing</span>
                  <span className="pd-summary__value">{inr(purchase.total_landing_subtotal ?? 0)}</span>
                </div>
                <div className="pd-summary__item">
                  <span className="pd-summary__label">Selling</span>
                  <span className="pd-summary__value">{inr(purchase.total_selling_subtotal ?? 0)}</span>
                </div>
                <div className="pd-summary__item">
                  <span className="pd-summary__label">Profit</span>
                  <span className={`pd-summary__value ${(purchase.total_line_profit ?? 0) >= 0 ? "pd-summary__value--green" : "pd-summary__value--red"}`}>
                    {inr(purchase.total_line_profit ?? 0)}
                  </span>
                </div>
              </div>
            </section>
          )}

          <section className="pd-card">
            <h2 className="pd-card__title">Items ({purchase.lines?.length ?? 0})</h2>
            <div className="pd-items">
              {purchase.lines?.map((line, i) => (
                <div key={line.id} className="pd-item">
                  <div className="pd-item__info">
                    <span className="pd-item__idx">{i + 1}</span>
                    <div>
                      <span className="pd-item__name">{line.item_name}</span>
                      <span className="pd-item__qty">
                        {line.qty} {line.unit}
                        {line.received_qty != null && <span className="pd-item__received"> · Rcvd: {line.received_qty}</span>}
                        {line.damaged_qty ? <span className="pd-item__damaged"> · Damg: {line.damaged_qty}</span> : null}
                        {line.return_qty ? <span className="pd-item__returned"> · Ret: {line.return_qty}</span> : null}
                      </span>
                    </div>
                  </div>
                  {!hideFinancials && (
                    <div className="pd-item__rates">
                      <span className="pd-item__rate">P: {inr(line.landing_cost)}</span>
                      <span className="pd-item__rate">S: {inr(line.selling_cost ?? 0)}</span>
                      <span className="pd-item__total">{inr(line.line_total ?? 0)}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <DeliveryTimeline
            createdAt={purchase.created_at}
            dispatchedAt={purchase.dispatched_at}
            arrivedAt={purchase.arrived_at}
            staffVerifiedAt={purchase.staff_verified_at}
            stockCommittedAt={purchase.stock_committed_at}
          />

          <DamageSection purchaseId={purchase.id} businessId={businessId} />

          <div className="pd-page__inline-charges">
            <ChargesAndBalance
              totalAmount={purchase.total_amount}
              paidAmount={purchase.paid_amount}
              remaining={purchase.remaining}
              commissionMode={purchase.commission_mode}
              commissionMoney={purchase.commission_money ?? 0}
              headerDiscount={purchase.header_discount ?? 0}
              freightAmount={purchase.freight_amount ?? 0}
              freightType={purchase.freight_type ?? ""}
              deliveredRate={purchase.delivered_rate ?? 0}
              billtyRate={purchase.billty_rate ?? 0}
              totalLandingSubtotal={purchase.total_landing_subtotal ?? 0}
              totalSellingSubtotal={purchase.total_selling_subtotal ?? 0}
              totalLineProfit={purchase.total_line_profit ?? 0}
              hideFinancials={hideFinancials}
              defaultCollapsed={true}
            />
          </div>
        </main>

        {!hideFinancials && (
          <aside className="pd-page__aside">
            <ChargesAndBalance
              totalAmount={purchase.total_amount}
              paidAmount={purchase.paid_amount}
              remaining={purchase.remaining}
              commissionMode={purchase.commission_mode}
              commissionMoney={purchase.commission_money ?? 0}
              headerDiscount={purchase.header_discount ?? 0}
              freightAmount={purchase.freight_amount ?? 0}
              freightType={purchase.freight_type ?? ""}
              deliveredRate={purchase.delivered_rate ?? 0}
              billtyRate={purchase.billty_rate ?? 0}
              totalLandingSubtotal={purchase.total_landing_subtotal ?? 0}
              totalSellingSubtotal={purchase.total_selling_subtotal ?? 0}
              totalLineProfit={purchase.total_line_profit ?? 0}
              hideFinancials={false}
            />
          </aside>
        )}
      </div>

      <DetailActionBar
        purchaseId={purchase.id}
        businessId={businessId}
        supplierName={purchase.supplier_name ?? ""}
        hideFinancials={hideFinancials}
        paidAmount={purchase.paid_amount}
        remaining={purchase.remaining}
        onMarkPaid={handleMarkPaid}
        onDelete={handleDelete}
      />
    </div>
  );
}
