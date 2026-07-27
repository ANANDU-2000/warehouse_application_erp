import { useState } from "react";
import "./DamageSection.css";

type Props = {
  purchaseId: string;
  businessId: string;
};

export function DamageSection({ purchaseId, businessId }: Props) {
  const [showSheet, setShowSheet] = useState(false);

  return (
    <>
      <div className="pd-damage">
        <div className="pd-damage__header">
          <h3 className="pd-damage__title">Damage Reports</h3>
          <button type="button" className="pd-damage__add" onClick={() => setShowSheet(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
            Report Damage
          </button>
        </div>
        <div className="pd-damage__placeholder">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="#D1D5DB"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
          <span className="pd-damage__placeholder-text">Damage reporting coming soon</span>
        </div>
      </div>

      {showSheet && <DamageReportSheet purchaseId={purchaseId} businessId={businessId} onClose={() => setShowSheet(false)} />}
    </>
  );
}

function DamageReportSheet({ purchaseId, businessId, onClose }: Props & { onClose: () => void }) {
  const [note, setNote] = useState("");

  async function handleSubmit() {
    try {
      const token = localStorage.getItem("hexa_access_token_bk") ?? localStorage.getItem("access_token") ?? "";
      const res = await fetch(`/v1/businesses/${businessId}/trade-purchases/${purchaseId}/damage-reports`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
      if (res.status === 501) {
        alert("Damage reports are not yet available. This feature is coming soon.");
        onClose();
        return;
      }
      if (!res.ok) throw new Error("Failed to submit");
      alert("Damage report submitted");
      onClose();
    } catch {
      alert("Failed to submit damage report");
    }
  }

  return (
    <div className="pd-damage__modal" onClick={onClose}>
      <div className="pd-damage__sheet" onClick={e => e.stopPropagation()}>
        <div className="pd-damage__sheet-header">
          <h3>Report Damage</h3>
          <button type="button" className="pd-damage__close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#6B7280"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          </button>
        </div>
        <div className="pd-damage__sheet-body">
          <p className="pd-damage__sheet-desc">Describe the damage and affected items</p>
          <textarea className="pd-damage__textarea" value={note} onChange={e => setNote(e.target.value)} placeholder="e.g., 2 bags of rice torn during unloading..." rows={4} />
          <button type="button" className="pd-damage__submit" disabled={!note.trim()} onClick={handleSubmit}>
            Submit Report
          </button>
        </div>
      </div>
    </div>
  );
}
