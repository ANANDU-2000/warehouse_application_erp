import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { readPrimaryBusiness } from "../../shared/auth/sessionStore";
import "./PurchaseEntryPage.css";

type Party = {
  id: string;
  name: string;
  type: "supplier" | "broker";
  phone?: string;
  last_purchase_date?: string;
  balance?: number;
};
type CatalogItem = { id: string; name: string; unit: string; item_code?: string; hsn_code?: string; default_kg_per_unit?: number };
type LineItem = {
  tempId: string;
  item_id: string;
  item_name: string;
  quantity: number;
  unit: string;
  landing_cost: number;
  selling_price: number;
  kg_per_unit: number;
  tax_percent: number;
  discount_percent: number;
  freight_type: string;
  freight_value: number;
  delivered_rate: number;
  billty_rate: number;
  line_notes: string;
  hsn_code: string;
  amount: number;
};

const UNITS = ["kg", "bags", "box", "tin", "pcs", "ltr", "mtr"];
const COMMISSION_MODES = [
  { id: "percent", label: "%" },
  { id: "flat_invoice", label: "Flat / bill" },
  { id: "flat_kg", label: "Flat / kg" },
  { id: "flat_bag", label: "Flat / bag" },
];

function inr(n: number): string {
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function PurchaseEntryPage() {
  const navigate = useNavigate();
  const session = readPrimaryBusiness();
  const businessId = session?.id ?? "";

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Party
  const [partyType, setPartyType] = useState<"supplier" | "broker">("supplier");
  const [parties, setParties] = useState<Party[]>([]);
  const [partyQuery, setPartyQuery] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState<Party | null>(null);
  const [selectedBroker, setSelectedBroker] = useState<Party | null>(null);
  const [invoiceRef, setInvoiceRef] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split("T")[0]);

  // Step 2: Terms
  const [paymentDays, setPaymentDays] = useState("");
  const [commissionMode, setCommissionMode] = useState("percent");
  const [commissionValue, setCommissionValue] = useState("");
  const [headerDiscount, setHeaderDiscount] = useState("");
  const [freightAmount, setFreightAmount] = useState("");
  const [deliveredRate, setDeliveredRate] = useState("");
  const [billtyRate, setBilltyRate] = useState("");
  const [narration, setNarration] = useState("");

  // Step 3: Items
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [itemQuery, setItemQuery] = useState("");
  const [lines, setLines] = useState<LineItem[]>([]);
  const [showItemEntry, setShowItemEntry] = useState(false);
  const [editingLineIdx, setEditingLineIdx] = useState<number | null>(null);

  // Item entry form
  const [eItem, setEItem] = useState<CatalogItem | null>(null);
  const [eQty, setEQty] = useState("");
  const [eUnit, setEUnit] = useState("kg");
  const [eLanding, setELanding] = useState("");
  const [eSelling, setESelling] = useState("");
  const [eKgPerUnit, setEKgPerUnit] = useState("");
  const [eTax, setETax] = useState("0");
  const [eDiscount, setEDiscount] = useState("0");
  const [eFreightType, setEFreightType] = useState("separate");
  const [eFreightVal, setEFreightVal] = useState("0");
  const [eDelivered, setEDelivered] = useState("0");
  const [eBillty, setEBillty] = useState("0");
  const [eNotes, setENotes] = useState("");
  const [eHsn, setEHsn] = useState("");

  useEffect(() => {
    if (!businessId) return;
    const token = localStorage.getItem("hexa_access_token_bk") ?? localStorage.getItem("access_token") ?? "";
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch(`/v1/businesses/${businessId}/suppliers`, { headers }).then((r) => r.ok ? r.json() : []),
      fetch(`/v1/businesses/${businessId}/brokers`, { headers }).then((r) => r.ok ? r.json() : []),
      fetch(`/v1/businesses/${businessId}/catalog-items/`, { headers }).then((r) => r.ok ? r.json() : []),
    ]).then(([supData, brokData, itmData]) => {
      setParties([
        ...(Array.isArray(supData) ? supData : supData.suppliers ?? []).map((p: Record<string, unknown>) => ({
          id: String(p.id ?? ""), name: String(p.name ?? p.display_name ?? ""), type: "supplier" as const,
          phone: String(p.phone ?? ""), last_purchase_date: String(p.last_purchase_date ?? ""),
          balance: Number(p.balance ?? 0),
        })),
        ...(Array.isArray(brokData) ? brokData : brokData.brokers ?? []).map((p: Record<string, unknown>) => ({
          id: String(p.id ?? ""), name: String(p.name ?? p.display_name ?? ""), type: "broker" as const,
          phone: String(p.phone ?? ""),
        })),
      ]);
      setItems(
        (Array.isArray(itmData) ? itmData : itmData.items ?? []).map((i: Record<string, unknown>) => ({
          id: String(i.id ?? ""), name: String(i.name ?? ""), unit: String(i.unit ?? "kg"),
          item_code: String(i.item_code ?? ""), hsn_code: String(i.hsn_code ?? ""),
          default_kg_per_unit: Number(i.default_kg_per_unit ?? 0),
        })),
      );
    });
  }, [businessId]);

  const filteredParties = useMemo(() => {
    const pool = partyType === "supplier" ? parties.filter((p) => p.type === "supplier") : parties.filter((p) => p.type === "broker");
    if (!partyQuery.trim()) return pool;
    const q = partyQuery.toLowerCase();
    return pool.filter((p) => p.name.toLowerCase().includes(q) || p.phone?.includes(q));
  }, [parties, partyType, partyQuery]);

  const filteredItems = useMemo(() => {
    if (!itemQuery.trim()) return items;
    const q = itemQuery.toLowerCase();
    return items.filter((i) => i.name.toLowerCase().includes(q) || i.item_code?.toLowerCase().includes(q));
  }, [items, itemQuery]);

  const grandTotal = useMemo(() => {
    const itemsTotal = lines.reduce((s, l) => s + l.amount, 0);
    const commVal = parseFloat(commissionValue) || 0;
    let commAmt = 0;
    if (commissionMode === "percent") commAmt = itemsTotal * (commVal / 100);
    else if (commissionMode === "flat_invoice") commAmt = commVal;
    else if (commissionMode === "flat_kg") {
      const totalKg = lines.reduce((s, l) => s + (l.unit === "kg" ? l.quantity : l.quantity * l.kg_per_unit), 0);
      commAmt = commVal * totalKg;
    }
    const disc = parseFloat(headerDiscount) || 0;
    const discAmt = itemsTotal * (disc / 100);
    const freight = parseFloat(freightAmount) || 0;
    return itemsTotal - discAmt + commAmt + freight;
  }, [lines, commissionMode, commissionValue, headerDiscount, freightAmount]);

  const totalKg = useMemo(() => lines.reduce((s, l) => s + (l.unit === "kg" ? l.quantity : l.quantity * l.kg_per_unit), 0), [lines]);
  const totalQtyByUnit = useMemo(() => {
    const m: Record<string, number> = {};
    lines.forEach((l) => { m[l.unit] = (m[l.unit] ?? 0) + l.quantity; });
    return m;
  }, [lines]);

  function openItemEntry(item?: CatalogItem, idx?: number) {
    if (idx != null) {
      const l = lines[idx];
      setEItem(items.find((i) => i.id === l.item_id) ?? null);
      setEQty(String(l.quantity));
      setEUnit(l.unit);
      setELanding(String(l.landing_cost));
      setESelling(String(l.selling_price));
      setEKgPerUnit(String(l.kg_per_unit || ""));
      setETax(String(l.tax_percent));
      setEDiscount(String(l.discount_percent));
      setEFreightType(l.freight_type);
      setEFreightVal(String(l.freight_value));
      setEDelivered(String(l.delivered_rate));
      setEBillty(String(l.billty_rate));
      setENotes(l.line_notes);
      setEHsn(l.hsn_code);
      setEditingLineIdx(idx);
    } else {
      setEItem(item ?? null);
      setEQty("1");
      setEUnit(item?.unit ?? "kg");
      setELanding("");
      setESelling("");
      setEKgPerUnit(item?.default_kg_per_unit ? String(item.default_kg_per_unit) : "");
      setETax("0");
      setEDiscount("0");
      setEFreightType("separate");
      setEFreightVal("0");
      setEDelivered("0");
      setEBillty("0");
      setENotes("");
      setEHsn(item?.hsn_code ?? "");
      setEditingLineIdx(null);
    }
    setShowItemEntry(true);
  }

  function confirmItemEntry() {
    if (!eItem) return;
    const qty = parseFloat(eQty) || 0;
    const landing = parseFloat(eLanding) || 0;
    const selling = parseFloat(eSelling) || 0;
    const kgpu = parseFloat(eKgPerUnit) || 0;
    const tax = parseFloat(eTax) || 0;
    const disc = parseFloat(eDiscount) || 0;
    const fv = parseFloat(eFreightVal) || 0;
    const dr = parseFloat(eDelivered) || 0;
    const br = parseFloat(eBillty) || 0;
    const amount = qty * landing - (qty * landing * disc / 100) + (eFreightType === "included" ? 0 : fv);

    const line: LineItem = {
      tempId: editingLineIdx != null ? lines[editingLineIdx].tempId : crypto.randomUUID(),
      item_id: eItem.id, item_name: eItem.name, quantity: qty, unit: eUnit,
      landing_cost: landing, selling_price: selling, kg_per_unit: kgpu,
      tax_percent: tax, discount_percent: disc, freight_type: eFreightType,
      freight_value: fv, delivered_rate: dr, billty_rate: br,
      line_notes: eNotes, hsn_code: eHsn, amount,
    };

    if (editingLineIdx != null) {
      setLines((prev) => prev.map((l, i) => i === editingLineIdx ? line : l));
    } else {
      setLines((prev) => [...prev, line]);
    }
    setShowItemEntry(false);
    setEditingLineIdx(null);
  }

  function removeLine(tempId: string) {
    setLines((prev) => prev.filter((l) => l.tempId !== tempId));
  }

  async function handleSave() {
    if (!businessId || !selectedSupplier || lines.length === 0) return;
    setSaving(true);
    setError(null);
    try {
      const token = localStorage.getItem("hexa_access_token_bk") ?? localStorage.getItem("access_token") ?? "";
      const res = await fetch(`/v1/businesses/${businessId}/trade-purchases/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          business_id: businessId, supplier_id: selectedSupplier.id,
          broker_id: selectedBroker?.id, purchase_date: purchaseDate,
          invoice_number: invoiceRef, narration,
          payment_days: parseInt(paymentDays) || 0,
          commission_mode: commissionMode, commission_value: parseFloat(commissionValue) || 0,
          header_discount_percent: parseFloat(headerDiscount) || 0,
          freight_amount: parseFloat(freightAmount) || 0,
          delivered_rate: parseFloat(deliveredRate) || 0,
          billty_rate: parseFloat(billtyRate) || 0,
          items: lines.map((l) => ({
            item_id: l.item_id, quantity: l.quantity, unit: l.unit,
            landing_cost: l.landing_cost, selling_price: l.selling_price,
            kg_per_unit: l.kg_per_unit, tax_percent: l.tax_percent,
            discount_percent: l.discount_percent, freight_type: l.freight_type,
            freight_value: l.freight_value, delivered_rate: l.delivered_rate,
            billty_rate: l.billty_rate, line_notes: l.line_notes,
            hsn_code: l.hsn_code,
          })),
        }),
      });
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b.detail ?? "Save failed"); }
      navigate("/purchase");
    } catch (e) { setError(e instanceof Error ? e.message : "Save failed"); }
    finally { setSaving(false); }
  }

  const canNext =
    (step === 1 && selectedSupplier != null) ||
    (step === 2) ||
    (step === 3 && lines.length > 0) ||
    step === 4;

  const paymentDue = useMemo(() => {
    const days = parseInt(paymentDays) || 0;
    if (!days) return "";
    const d = new Date(purchaseDate);
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }, [paymentDays, purchaseDate]);

  return (
    <div className="pe">
      <header className="pe__hdr">
        <button type="button" className="pe__back" onClick={() => step > 1 ? setStep((s) => (s - 1) as 1 | 2 | 3 | 4) : navigate("/purchase")}>←</button>
        <h1 className="pe__title">{step === 1 ? "Party" : step === 2 ? "Terms" : step === 3 ? "Items" : "Review"}</h1>
        <span className="pe__step">{step}/4</span>
      </header>
      <div className="pe__progress">{[1, 2, 3, 4].map((s) => <div key={s} className={`pe__dot${s <= step ? " pe__dot--on" : ""}`} />)}</div>

      <main className="pe__body">
        {/* STEP 1: Party + Invoice Ref + Date */}
        {step === 1 && (
          <div className="pe__step-body">
            <div className="pe__field">
              <label className="pe__label">Invoice Ref</label>
              <input className="pe__input" placeholder="e.g. INV-001" value={invoiceRef} onChange={(e) => setInvoiceRef(e.target.value)} />
            </div>
            <div className="pe__field">
              <label className="pe__label">Purchase Date</label>
              <input className="pe__input" type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
            </div>

            <div className="pe__party-tabs">
              <button type="button" className={`pe__ptab${partyType === "supplier" ? " pe__ptab--on" : ""}`} onClick={() => { setPartyType("supplier"); setPartyQuery(""); }}>Supplier *</button>
              <button type="button" className={`pe__ptab${partyType === "broker" ? " pe__ptab--on" : ""}`} onClick={() => { setPartyType("broker"); setPartyQuery(""); }}>Broker (optional)</button>
            </div>

            {partyType === "broker" && selectedSupplier && (
              <div className="pe__selected-chip">
                <span>Supplier: {selectedSupplier.name}</span>
                <button type="button" onClick={() => setSelectedSupplier(null)}>×</button>
              </div>
            )}

            <div className="pe__search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#9CA3AF"><path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>
              <input className="pe__search-input" type="search" placeholder={`Search ${partyType}s...`} value={partyQuery} onChange={(e) => setPartyQuery(e.target.value)} />
            </div>

            <div className="pe__party-list">
              {filteredParties.map((p) => {
                const sel = partyType === "supplier" ? selectedSupplier?.id === p.id : selectedBroker?.id === p.id;
                return (
                  <button key={p.id} type="button" className={`pe__pcard${sel ? " pe__pcard--sel" : ""}`} onClick={() => partyType === "supplier" ? setSelectedSupplier(p) : setSelectedBroker(p)}>
                    <div className="pe__pavatar">{p.name.charAt(0).toUpperCase()}</div>
                    <div className="pe__pinfo">
                      <span className="pe__pname">{p.name}</span>
                      {p.phone && <span className="pe__pmeta">{p.phone}</span>}
                      {partyType === "supplier" && p.last_purchase_date && <span className="pe__pmeta">Last: {new Date(p.last_purchase_date).toLocaleDateString("en-GB")}</span>}
                      {partyType === "supplier" && p.balance != null && p.balance !== 0 && <span className="pe__pmeta">Balance: {inr(p.balance)}</span>}
                    </div>
                    {sel && <svg width="20" height="20" viewBox="0 0 24 24" fill="#0E7C6B"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>}
                  </button>
                );
              })}
              {filteredParties.length === 0 && <div className="pe__empty">No {partyType}s found</div>}
            </div>

            {partyType === "supplier" && !selectedSupplier && (
              <p className="pe__hint">← Select a supplier first, then optionally switch to Broker tab to add one</p>
            )}
          </div>
        )}

        {/* STEP 2: Terms */}
        {step === 2 && (
          <div className="pe__step-body">
            <div className="pe__field">
              <label className="pe__label">Payment Days</label>
              <input className="pe__input" type="number" placeholder="e.g. 30" value={paymentDays} onChange={(e) => setPaymentDays(e.target.value)} min="0" />
              {paymentDue && <span className="pe__hint-inline">Due: {paymentDue}</span>}
            </div>

            <div className="pe__field">
              <label className="pe__label">Commission</label>
              <div className="pe__row">
                <select className="pe__select" value={commissionMode} onChange={(e) => setCommissionMode(e.target.value)}>
                  {COMMISSION_MODES.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
                </select>
                <input className="pe__input pe__input--sm" type="number" placeholder="0" value={commissionValue} onChange={(e) => setCommissionValue(e.target.value)} min="0" step="0.01" />
              </div>
            </div>

            <div className="pe__field">
              <label className="pe__label">Header Discount %</label>
              <input className="pe__input" type="number" placeholder="0" value={headerDiscount} onChange={(e) => setHeaderDiscount(e.target.value)} min="0" max="100" step="0.01" />
            </div>

            <div className="pe__field">
              <label className="pe__label">Freight Amount (₹)</label>
              <input className="pe__input" type="number" placeholder="0" value={freightAmount} onChange={(e) => setFreightAmount(e.target.value)} min="0" step="0.01" />
            </div>

            <div className="pe__field">
              <label className="pe__label">Delivered Rate (₹/kg)</label>
              <input className="pe__input" type="number" placeholder="0" value={deliveredRate} onChange={(e) => setDeliveredRate(e.target.value)} min="0" step="0.01" />
            </div>

            <div className="pe__field">
              <label className="pe__label">Billty Rate (₹/kg)</label>
              <input className="pe__input" type="number" placeholder="0" value={billtyRate} onChange={(e) => setBilltyRate(e.target.value)} min="0" step="0.01" />
            </div>

            <div className="pe__field">
              <label className="pe__label">Narration / Ref</label>
              <textarea className="pe__textarea" placeholder="Notes about this purchase..." value={narration} onChange={(e) => setNarration(e.target.value)} rows={2} />
            </div>

            <div className="pe__terms-preview">
              <div className="pe__tp-row"><span>Supplier</span><span>{selectedSupplier?.name ?? "—"}</span></div>
              {selectedBroker && <div className="pe__tp-row"><span>Broker</span><span>{selectedBroker.name}</span></div>}
              <div className="pe__tp-row"><span>Date</span><span>{new Date(purchaseDate).toLocaleDateString("en-GB")}</span></div>
              {invoiceRef && <div className="pe__tp-row"><span>Invoice</span><span>{invoiceRef}</span></div>}
            </div>
          </div>
        )}

        {/* STEP 3: Items */}
        {step === 3 && (
          <div className="pe__step-body">
            <div className="pe__search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#9CA3AF"><path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>
              <input className="pe__search-input" type="search" placeholder="Search items to add..." value={itemQuery} onChange={(e) => setItemQuery(e.target.value)} />
            </div>

            {lines.length > 0 && (
              <div className="pe__lines-summary">
                <div className="pe__ls-total">
                  <span>TOTAL</span>
                  <span className="pe__ls-grand">{inr(grandTotal)}</span>
                </div>
                <div className="pe__ls-units">
                  {totalKg > 0 && <span>{totalKg.toFixed(1)} KG</span>}
                  {Object.entries(totalQtyByUnit).filter(([u]) => u !== "kg").map(([u, q]) => (
                    <span key={u}>{q} {u.toUpperCase()}</span>
                  ))}
                </div>
              </div>
            )}

            {lines.map((l, i) => (
              <div key={l.tempId} className="pe__line-card" onClick={() => openItemEntry(undefined, i)}>
                <div className="pe__line-top">
                  <span className="pe__line-idx">{i + 1}</span>
                  <div className="pe__line-info">
                    <span className="pe__line-name">{l.item_name}</span>
                    <span className="pe__line-qty">{l.quantity} {l.unit} × {inr(l.landing_cost)}{l.discount_percent > 0 ? ` -${l.discount_percent}%` : ""}</span>
                  </div>
                  <span className="pe__line-amt">{inr(l.amount)}</span>
                </div>
                <div className="pe__line-meta">
                  {l.selling_price > 0 && <span>S: {inr(l.selling_price)}</span>}
                  {l.tax_percent > 0 && <span>Tax: {l.tax_percent}%</span>}
                  {l.kg_per_unit > 0 && <span>{l.kg_per_unit} kg/u</span>}
                  {l.hsn_code && <span>HSN: {l.hsn_code}</span>}
                  {l.line_notes && <span>📝</span>}
                </div>
                <button type="button" className="pe__line-del" onClick={(e) => { e.stopPropagation(); removeLine(l.tempId); }}>×</button>
              </div>
            ))}

            <div className="pe__item-catalog">
              {filteredItems.map((item) => {
                const added = lines.some((l) => l.item_id === item.id);
                return (
                  <button key={item.id} type="button" className={`pe__icard${added ? " pe__icard--added" : ""}`} onClick={() => openItemEntry(item)}>
                    <div className="pe__iavatar">{item.name.charAt(0).toUpperCase()}</div>
                    <div className="pe__iinfo">
                      <span className="pe__iname">{item.name}</span>
                      <span className="pe__icode">{item.item_code ?? item.unit}</span>
                    </div>
                    {added && <svg width="18" height="18" viewBox="0 0 24 24" fill="#0E7C6B"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: Review Tally */}
        {step === 4 && (
          <div className="pe__step-body">
            <div className="pe__review-hdr">
              <div className="pe__rhdr-supplier">
                <div className="pe__pavatar">{selectedSupplier?.name.charAt(0).toUpperCase()}</div>
                <div>
                  <p className="pe__rhdr-name">{selectedSupplier?.name}</p>
                  {selectedBroker && <p className="pe__rhdr-sub">Broker: {selectedBroker.name}</p>}
                </div>
              </div>
              <div className="pe__rhdr-right">
                <span>{new Date(purchaseDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                {invoiceRef && <span>Ref: {invoiceRef}</span>}
              </div>
            </div>

            <div className="pe__review-lines">
              {lines.map((l, i) => (
                <div key={l.tempId} className="pe__rline">
                  <span className="pe__rline-idx">{i + 1}</span>
                  <div className="pe__rline-info">
                    <span className="pe__rline-name">{l.item_name}</span>
                    <span className="pe__rline-detail">
                      {l.quantity} {l.unit} × {inr(l.landing_cost)}
                      {l.discount_percent > 0 ? ` -${l.discount_percent}%` : ""}
                      {l.tax_percent > 0 ? ` +${l.tax_percent}% tax` : ""}
                    </span>
                    <div className="pe__rline-extra">
                      {l.selling_price > 0 && <span>Sell: {inr(l.selling_price)}</span>}
                      {l.kg_per_unit > 0 && <span>{l.kg_per_unit} kg/u</span>}
                      {l.hsn_code && <span>HSN: {l.hsn_code}</span>}
                    </div>
                  </div>
                  <span className="pe__rline-amt">{inr(l.amount)}</span>
                </div>
              ))}
            </div>

            <div className="pe__review-terms">
              <h3>Terms</h3>
              {paymentDays && <div className="pe__rt-row"><span>Payment</span><span>{paymentDays} days (Due: {paymentDue})</span></div>}
              {commissionValue && <div className="pe__rt-row"><span>Commission</span><span>{commissionMode === "percent" ? `${commissionValue}%` : `${inr(parseFloat(commissionValue))} / ${commissionMode.replace("flat_", "")}`}</span></div>}
              {headerDiscount && <div className="pe__rt-row"><span>Header Discount</span><span>{headerDiscount}%</span></div>}
              {freightAmount && <div className="pe__rt-row"><span>Freight</span><span>{inr(parseFloat(freightAmount))}</span></div>}
              {deliveredRate && <div className="pe__rt-row"><span>Delivered Rate</span><span>{inr(parseFloat(deliveredRate))}/kg</span></div>}
              {billtyRate && <div className="pe__rt-row"><span>Billty Rate</span><span>{inr(parseFloat(billtyRate))}/kg</span></div>}
              {narration && <div className="pe__rt-row"><span>Narration</span><span>{narration}</span></div>}
            </div>

            <div className="pe__review-totals">
              <div className="pe__rt-row"><span>Items</span><span>{lines.length}</span></div>
              <div className="pe__rt-row"><span>Total KG</span><span>{totalKg.toFixed(1)}</span></div>
              {Object.entries(totalQtyByUnit).filter(([u]) => u !== "kg").map(([u, q]) => (
                <div key={u} className="pe__rt-row"><span>Total {u.toUpperCase()}</span><span>{q}</span></div>
              ))}
              <div className="pe__rt-row pe__rt-row--grand"><span>Grand Total</span><span>{inr(grandTotal)}</span></div>
            </div>

            {error && <div className="pe__error">{error}</div>}
          </div>
        )}
      </main>

      {/* Item Entry Modal */}
      {showItemEntry && eItem && (
        <div className="pe__modal" onClick={() => setShowItemEntry(false)}>
          <div className="pe__modal-body" onClick={(e) => e.stopPropagation()}>
            <h3 className="pe__modal-title">{editingLineIdx != null ? "Edit Item" : "Add Item"}: {eItem.name}</h3>

            <div className="pe__field"><label className="pe__label">Quantity</label>
              <input className="pe__input" type="number" value={eQty} onChange={(e) => setEQty(e.target.value)} min="0" step="0.01" autoFocus />
            </div>
            <div className="pe__field"><label className="pe__label">Unit</label>
              <div className="pe__chips">{UNITS.map((u) => <button key={u} type="button" className={`pe__chip${eUnit === u ? " pe__chip--on" : ""}`} onClick={() => setEUnit(u)}>{u}</button>)}</div>
            </div>
            <div className="pe__field"><label className="pe__label">KG per Unit</label>
              <input className="pe__input" type="number" value={eKgPerUnit} onChange={(e) => setEKgPerUnit(e.target.value)} min="0" step="0.01" placeholder="e.g. 25 for bags" />
            </div>
            <div className="pe__field"><label className="pe__label">Landing Cost (₹/{eUnit})</label>
              <input className="pe__input" type="number" value={eLanding} onChange={(e) => setELanding(e.target.value)} min="0" step="0.01" />
            </div>
            <div className="pe__field"><label className="pe__label">Selling Price (₹/{eUnit})</label>
              <input className="pe__input" type="number" value={eSelling} onChange={(e) => setESelling(e.target.value)} min="0" step="0.01" />
            </div>
            <div className="pe__field"><label className="pe__label">Tax %</label>
              <input className="pe__input" type="number" value={eTax} onChange={(e) => setETax(e.target.value)} min="0" max="100" step="0.01" />
            </div>
            <div className="pe__field"><label className="pe__label">Line Discount %</label>
              <input className="pe__input" type="number" value={eDiscount} onChange={(e) => setEDiscount(e.target.value)} min="0" max="100" step="0.01" />
            </div>
            <div className="pe__field"><label className="pe__label">HSN Code</label>
              <input className="pe__input" type="text" value={eHsn} onChange={(e) => setEHsn(e.target.value)} placeholder="HSN" />
            </div>
            <div className="pe__field"><label className="pe__label">Freight Type</label>
              <div className="pe__chips">
                <button type="button" className={`pe__chip${eFreightType === "separate" ? " pe__chip--on" : ""}`} onClick={() => setEFreightType("separate")}>Separate</button>
                <button type="button" className={`pe__chip${eFreightType === "included" ? " pe__chip--on" : ""}`} onClick={() => setEFreightType("included")}>Included</button>
              </div>
            </div>
            {eFreightType === "separate" && (
              <div className="pe__field"><label className="pe__label">Freight Value (₹)</label>
                <input className="pe__input" type="number" value={eFreightVal} onChange={(e) => setEFreightVal(e.target.value)} min="0" step="0.01" />
              </div>
            )}
            <div className="pe__field"><label className="pe__label">Delivered Rate (₹)</label>
              <input className="pe__input" type="number" value={eDelivered} onChange={(e) => setEDelivered(e.target.value)} min="0" step="0.01" />
            </div>
            <div className="pe__field"><label className="pe__label">Billty Rate (₹)</label>
              <input className="pe__input" type="number" value={eBillty} onChange={(e) => setEBillty(e.target.value)} min="0" step="0.01" />
            </div>
            <div className="pe__field"><label className="pe__label">Line Notes</label>
              <input className="pe__input" type="text" value={eNotes} onChange={(e) => setENotes(e.target.value)} placeholder="Optional notes" />
            </div>

            <div className="pe__modal-actions">
              <button type="button" className="pe__btn pe__btn--sec" onClick={() => setShowItemEntry(false)}>Cancel</button>
              <button type="button" className="pe__btn pe__btn--pri" onClick={confirmItemEntry}>{editingLineIdx != null ? "Update" : "Add"}</button>
            </div>
          </div>
        </div>
      )}

      <footer className="pe__footer">
        {step > 1 && <button type="button" className="pe__btn pe__btn--sec" onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3 | 4)}>Back</button>}
        <button type="button" className="pe__btn pe__btn--pri" disabled={!canNext || saving} onClick={() => step < 4 ? setStep((s) => (s + 1) as 1 | 2 | 3 | 4) : handleSave()}>
          {saving ? "Saving..." : step === 4 ? `Save ${inr(grandTotal)}` : "Next"}
        </button>
      </footer>
    </div>
  );
}
