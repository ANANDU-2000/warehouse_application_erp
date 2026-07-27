import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { readPrimaryBusiness } from "../../../shared/auth/sessionStore";
import { apiGet, apiPost } from "../../../shared/api/apiClient";
import "./StaffReceivePage.css";

type PurchaseLine = {
  line_id: string;
  item_name: string;
  quantity: number;
  unit: string;
  received_qty: number;
  damaged_qty: number;
};

type Purchase = {
  id: string;
  human_id: string;
  supplier_name: string;
  purchase_date: string;
  delivery_status: string;
  stock_committed: boolean;
  lines: PurchaseLine[];
  truck_number: string | null;
  driver_name: string | null;
};

export function StaffReceivePage() {
  const navigate = useNavigate();
  const { purchaseId } = useParams<{ purchaseId: string }>();
  const session = readPrimaryBusiness();
  const biz = session?.id ?? "";
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lineQty, setLineQty] = useState<Record<string, string>>({});
  const [lineDmg, setLineDmg] = useState<Record<string, string>>({});
  const [truck, setTruck] = useState("");
  const [driver, setDriver] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!biz || !purchaseId) { setLoading(false); return; }
    setLoading(true);
    apiGet<Purchase>(`/v1/businesses/${biz}/trade-purchases/${purchaseId}`)
      .then((data) => {
        setPurchase(data);
        const rq: Record<string, string> = {};
        const dq: Record<string, string> = {};
        data.lines.forEach((l) => { rq[l.line_id] = String(l.quantity); dq[l.line_id] = "0"; });
        setLineQty(rq);
        setLineDmg(dq);
        setTruck(data.truck_number ?? "");
        setDriver(data.driver_name ?? "");
        setLoading(false);
      })
      .catch((e) => { setError(e instanceof Error ? e.message : "Load failed"); setLoading(false); });
  }, [biz, purchaseId]);

  async function handleArrive() {
    if (!biz || !purchaseId || !purchase) return;
    setSaving(true);
    try {
      if (purchase.delivery_status === "pending" || purchase.delivery_status === "dispatched") {
        await apiPost(`/v1/businesses/${biz}/trade-purchases/${purchaseId}/arrive`, {
          truck_number: truck || undefined,
          driver_name: driver || undefined,
          notes: notes || undefined,
        });
      }
      await apiPost(`/v1/businesses/${biz}/trade-purchases/${purchaseId}/verify`, {
        lines: purchase.lines.map((l) => ({
          line_id: l.line_id,
          received_qty: parseFloat(lineQty[l.line_id] ?? String(l.quantity)) || 0,
          damaged_qty: parseFloat(lineDmg[l.line_id] ?? "0") || 0,
          return_qty: 0,
        })),
      });
      navigate("/staff/deliveries");
    } catch {
      alert("Failed to process delivery");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="rcv-page"><div className="rcv-loading">Loading...</div></div>;
  if (error || !purchase) return <div className="rcv-page"><div className="rcv-loading">{error ?? "Not found"}</div></div>;

  if (purchase.stock_committed) {
    return (
      <div className="rcv-page">
        <header className="rcv-hdr"><button type="button" className="rcv-back" onClick={() => navigate(-1)}>←</button><h1 className="rcv-title">Receive Shipment</h1></header>
        <div className="rcv-body"><div className="rcv-done">Stock already committed for this purchase.</div></div>
      </div>
    );
  }

  return (
    <div className="rcv-page">
      <header className="rcv-hdr">
        <button type="button" className="rcv-back" onClick={() => navigate(-1)}>←</button>
        <h1 className="rcv-title">Receive Shipment</h1>
      </header>
      <div className="rcv-body">
        <div className="rcv-info-card">
          <div className="rcv-info-row"><span>Purchase</span><span>{purchase.human_id}</span></div>
          <div className="rcv-info-row"><span>Supplier</span><span>{purchase.supplier_name}</span></div>
          <div className="rcv-info-row"><span>Date</span><span>{new Date(purchase.purchase_date).toLocaleDateString("en-GB")}</span></div>
        </div>

        <div className="rcv-banner">Enter received and damaged qty per line. Defaults match the PO — adjust only when counts differ.</div>

        {purchase.lines.map((l) => (
          <div key={l.line_id} className="rcv-line">
            <p className="rcv-line-name">{l.item_name}</p>
            <p className="rcv-line-ordered">Ordered {l.quantity} {l.unit}</p>
            <div className="rcv-line-fields">
              <div className="rcv-field">
                <label className="rcv-label">Received</label>
                <input className="rcv-input" type="number" value={lineQty[l.line_id] ?? ""} onChange={(e) => setLineQty((p) => ({ ...p, [l.line_id]: e.target.value }))} min="0" step="0.01" />
              </div>
              <div className="rcv-field">
                <label className="rcv-label">Damaged</label>
                <input className="rcv-input" type="number" value={lineDmg[l.line_id] ?? "0"} onChange={(e) => setLineDmg((p) => ({ ...p, [l.line_id]: e.target.value }))} min="0" step="0.01" />
              </div>
            </div>
          </div>
        ))}

        <div className="rcv-field"><label className="rcv-label">Truck Number (optional)</label><input className="rcv-input" type="text" value={truck} onChange={(e) => setTruck(e.target.value)} /></div>
        <div className="rcv-field"><label className="rcv-label">Driver Name (optional)</label><input className="rcv-input" type="text" value={driver} onChange={(e) => setDriver(e.target.value)} /></div>
        <div className="rcv-field"><label className="rcv-label">Arrival Notes (optional)</label><textarea className="rcv-textarea" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} /></div>

        <div className="rcv-actions">
          <button type="button" className="rcv-btn rcv-btn--sec" onClick={() => navigate(-1)}>Not yet</button>
          <button type="button" className="rcv-btn rcv-btn--pri" onClick={handleArrive} disabled={saving}>{saving ? "Processing..." : "Arrive & verify"}</button>
        </div>
      </div>
    </div>
  );
}
