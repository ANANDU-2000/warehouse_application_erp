import { useState } from "react";
import "./ChargesAndBalance.css";

type Props = {
  totalAmount: number;
  paidAmount: number;
  remaining: number;
  commissionMode: string;
  commissionMoney: number;
  headerDiscount: number;
  freightAmount: number;
  freightType: string;
  deliveredRate: number;
  billtyRate: number;
  totalLandingSubtotal: number;
  totalSellingSubtotal: number;
  totalLineProfit: number;
  hideFinancials: boolean;
  defaultCollapsed?: boolean;
};

function inr(n: number): string {
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function ChargesAndBalance(props: Props) {
  const { hideFinancials } = props;
  const [collapsed, setCollapsed] = useState(props.defaultCollapsed ?? false);

  if (hideFinancials) return null;

  return (
    <div className="pd-charges">
      <button type="button" className="pd-charges__toggle" onClick={() => setCollapsed(c => !c)}>
        <h3 className="pd-charges__title">Charges & Balance</h3>
        <span className="pd-charges__chevron">{collapsed ? "▸" : "▾"}</span>
      </button>

      {!collapsed && (
        <div className="pd-charges__body">
          <div className="pd-charges__row">
            <span>Total Amount</span>
            <span className="pd-charges__val">{inr(props.totalAmount)}</span>
          </div>
          <div className="pd-charges__row">
            <span>Paid</span>
            <span className="pd-charges__val pd-charges__val--green">{inr(props.paidAmount)}</span>
          </div>
          <div className="pd-charges__row">
            <span>Remaining</span>
            <span className={`pd-charges__val ${props.remaining > 0 ? "pd-charges__val--red" : "pd-charges__val--green"}`}>
              {inr(props.remaining)}
            </span>
          </div>

          <div className="pd-charges__divider" />

          <div className="pd-charges__row">
            <span>Commission ({props.commissionMode})</span>
            <span className="pd-charges__val">{inr(props.commissionMoney)}</span>
          </div>
          <div className="pd-charges__row">
            <span>Header Discount</span>
            <span className="pd-charges__val">{inr(props.headerDiscount)}</span>
          </div>
          <div className="pd-charges__row">
            <span>Freight {props.freightType ? `(${props.freightType})` : ""}</span>
            <span className="pd-charges__val">{inr(props.freightAmount)}</span>
          </div>
          <div className="pd-charges__row">
            <span>Delivered Rate</span>
            <span className="pd-charges__val">{inr(props.deliveredRate)}</span>
          </div>
          <div className="pd-charges__row">
            <span>Billty Rate</span>
            <span className="pd-charges__val">{inr(props.billtyRate)}</span>
          </div>

          <div className="pd-charges__divider" />

          <div className="pd-charges__row">
            <span>Landing Subtotal</span>
            <span className="pd-charges__val">{inr(props.totalLandingSubtotal)}</span>
          </div>
          <div className="pd-charges__row">
            <span>Selling Subtotal</span>
            <span className="pd-charges__val">{inr(props.totalSellingSubtotal)}</span>
          </div>
          <div className="pd-charges__row pd-charges__row--profit">
            <span>Total Line Profit</span>
            <span className={`pd-charges__val ${props.totalLineProfit >= 0 ? "pd-charges__val--green" : "pd-charges__val--red"}`}>
              {inr(props.totalLineProfit)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
