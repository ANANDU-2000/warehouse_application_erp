import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { readPrimaryBusiness } from "../../../shared/auth/sessionStore";
import { apiGet } from "../../../shared/api/apiClient";
import "./StaffPurchaseDetailPage.css";

type PurchaseLine = {
  item_name: string;
  quantity: number;
  unit: string;
  rate: number | null;
  amount: number;
};

type PurchaseDetail = {
  id: string;
  human_id: string;
  supplier_name: string;
  broker_name: string | null;
  purchase_date: string;
  delivery_status: string;
  total_amount: number;
  lines: PurchaseLine[];
  payment_days: number | null;
  commission_mode: string | null;
  narration: string | null;
};

export function StaffPurchaseDetailPage() {
  const navigate = useNavigate();
  const { purchaseId } = useParams<{ purchaseId: string }>();
  const session = readPrimaryBusiness();
  const biz = session?.id ?? "";
  const [detail, setDetail] = useState<PurchaseDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!biz || !purchaseId) { setLoading(false); return; }
    apiGet<PurchaseDetail>(`/v1/businesses/${biz}/trade-purchases/${purchaseId}`)
      .then((data) => { setDetail(data); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, [biz, purchaseId]);

  function inr(n: number) {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
  }

  if (loading) return <div className="spd-page"><div className="spd-loading">Loading...</div></div>;
  if (!detail) return <div className="spd-page"><div className="spd-loading">Not found</div></div>;

  return (
    <div className="spd-page">
      <header className="spd-hdr">
        <button type="button" className="spd-back" onClick={() => navigate(-1)}>←</button>
        <h1 className="spd-title">{detail.human_id}</h1>
        <span className={`spd-status spd-status--${detail.delivery_status}`}>{detail.delivery_status}</span>
      </header>
      <div className="spd-body">
        <div className="spd-card">
          <div className="spd-row"><span>Supplier</span><span>{detail.supplier_name}</span></div>
          {detail.broker_name && <div className="spd-row"><span>Broker</span><span>{detail.broker_name}</span></div>}
          <div className="spd-row"><span>Date</span><span>{new Date(detail.purchase_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span></div>
          {detail.payment_days && <div className="spd-row"><span>Payment</span><span>{detail.payment_days} days</span></div>}
          {detail.narration && <div className="spd-row"><span>Narration</span><span>{detail.narration}</span></div>}
        </div>

        <div className="spd-card">
          <h3 className="spd-section-title">Items ({detail.lines.length})</h3>
          {detail.lines.map((l, i) => (
            <div key={i} className="spd-line">
              <span className="spd-line-idx">{i + 1}</span>
              <div className="spd-line-info">
                <span className="spd-line-name">{l.item_name}</span>
                <span className="spd-line-detail">{l.quantity} {l.unit} × {l.rate != null ? inr(l.rate) : "—"}</span>
              </div>
              <span className="spd-line-amt">{inr(l.amount)}</span>
            </div>
          ))}
          <div className="spd-total"><span>Total</span><span>{inr(detail.total_amount)}</span></div>
        </div>
      </div>
    </div>
  );
}
