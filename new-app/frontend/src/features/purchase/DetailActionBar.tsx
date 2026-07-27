import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { downloadPurchasePdf, sharePurchasePdf, printPurchasePdf, emailPurchasePdf } from "./purchasePdf";
import "./DetailActionBar.css";

function showAlert(result: { ok: boolean; message: string }): void {
  alert(result.message);
}

type Props = {
  purchaseId: string;
  businessId: string;
  supplierName: string;
  hideFinancials: boolean;
  paidAmount: number;
  remaining: number;
  onMarkPaid: (amount: number) => void;
  onDelete: () => void;
};

export function DetailActionBar({ purchaseId, businessId, supplierName, hideFinancials, paidAmount, remaining, onMarkPaid, onDelete }: Props) {
  const navigate = useNavigate();
  const [showPayment, setShowPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  function handleEdit() {
    navigate(`/purchase/${purchaseId}/edit`);
  }

  return (
    <>
      <div className="pd-actions">
        <div className="pd-actions__scroll">
          {!hideFinancials && (
            <button type="button" className="pd-actions__btn pd-actions__btn--pay" onClick={() => setShowPayment(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
              <span>Pay</span>
            </button>
          )}
          <button type="button" className="pd-actions__btn pd-actions__btn--edit" onClick={handleEdit}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
            <span>Edit</span>
          </button>
          <button type="button" className="pd-actions__btn pd-actions__btn--delete" onClick={() => setShowDeleteConfirm(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
            <span>Delete</span>
          </button>
          {!hideFinancials && (
            <>
              <button type="button" className="pd-actions__btn pd-actions__btn--pdf" onClick={() => { alert("Preparing PDF..."); downloadPurchasePdf(businessId, purchaseId).then(showAlert); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z"/></svg>
                <span>PDF</span>
              </button>
              <button type="button" className="pd-actions__btn pd-actions__btn--share" onClick={() => { alert("Preparing PDF..."); sharePurchasePdf(businessId, purchaseId).then(showAlert); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>
                <span>Share</span>
              </button>
              <button type="button" className="pd-actions__btn pd-actions__btn--print" onClick={() => { alert("Preparing PDF..."); printPurchasePdf(businessId, purchaseId).then(showAlert); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>
                <span>Print</span>
              </button>
              <button type="button" className="pd-actions__btn pd-actions__btn--email" onClick={() => emailPurchasePdf(purchaseId, supplierName)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                <span>Email</span>
              </button>
            </>
          )}
        </div>
      </div>

      {showPayment && (
        <div className="pd-actions__modal" onClick={() => setShowPayment(false)}>
          <div className="pd-actions__sheet" onClick={e => e.stopPropagation()}>
            <h3 className="pd-actions__sheet-title">Mark as Paid</h3>
            <p className="pd-actions__sheet-desc">
              Paid so far: {paidAmount.toLocaleString("en-IN")} · Remaining: {remaining.toLocaleString("en-IN")}
            </p>
            <div className="pd-actions__field">
              <label className="pd-actions__label">Payment Amount</label>
              <input type="number" className="pd-actions__input" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} placeholder="Enter amount" min={1} max={remaining} />
            </div>
            <div className="pd-actions__sheet-actions">
              <button type="button" className="pd-actions__cancel" onClick={() => setShowPayment(false)}>Cancel</button>
              <button type="button" className="pd-actions__confirm" disabled={!paymentAmount || parseFloat(paymentAmount) <= 0} onClick={() => { onMarkPaid(parseFloat(paymentAmount)); setShowPayment(false); }}>
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="pd-actions__modal" onClick={() => setShowDeleteConfirm(false)}>
          <div className="pd-actions__confirm-dialog" onClick={e => e.stopPropagation()}>
            <h3 className="pd-actions__sheet-title">Delete Purchase?</h3>
            <p className="pd-actions__sheet-desc">This action cannot be undone. Are you sure you want to delete this purchase?</p>
            <div className="pd-actions__sheet-actions">
              <button type="button" className="pd-actions__cancel" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button type="button" className="pd-actions__confirm pd-actions__confirm--danger" onClick={() => { onDelete(); setShowDeleteConfirm(false); }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
