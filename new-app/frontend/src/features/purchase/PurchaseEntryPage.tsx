import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { readPrimaryBusiness } from "../../shared/auth/sessionStore";
import { sharePurchasePdf, printPurchasePdf, emailPurchasePdf } from "./purchasePdf";
import "./PurchaseEntryPage.css";

type Party = {
  id: string;
  name: string;
  type: "supplier" | "broker";
  phone?: string;
  last_purchase_date?: string;
  balance?: number;
};

type CatalogItem = {
  id: string;
  name: string;
  unit: string;
  item_code?: string;
  hsn_code?: string;
  default_kg_per_unit?: number;
  last_purchase_price?: number | null;
  last_purchase_date?: string | null;
  last_purchase_qty?: number | null;
  supplier_name?: string | null;
};

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

function generateTempId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

const WIP_STORAGE_KEY = "hexa_purchase_wip_draft";

function persistWip(state: Record<string, unknown>): void {
  try { localStorage.setItem(WIP_STORAGE_KEY, JSON.stringify(state)); } catch {}
}

function clearWip(): void {
  try { localStorage.removeItem(WIP_STORAGE_KEY); } catch {}
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("hexa_access_token_bk") ?? localStorage.getItem("access_token") ?? "";
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

export function PurchaseEntryPage() {
  const navigate = useNavigate();
  const { purchaseId: editPurchaseId } = useParams<{ purchaseId: string }>();
  const isEditMode = !!editPurchaseId;
  const session = readPrimaryBusiness();
  const businessId = session?.id ?? "";

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [moreChargesOpen, setMoreChargesOpen] = useState(false);

  // Step 1: Party & Terms
  const [suppliers, setSuppliers] = useState<Party[]>([]);
  const [brokers, setBrokers] = useState<Party[]>([]);
  const [supplierQuery, setSupplierQuery] = useState("");
  const [brokerQuery, setBrokerQuery] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState<Party | null>(null);
  const [selectedBroker, setSelectedBroker] = useState<Party | null>(null);
  const [invoiceRef, setInvoiceRef] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split("T")[0]);

  const [paymentDays, setPaymentDays] = useState("");
  const [commissionMode, setCommissionMode] = useState("percent");
  const [commissionValue, setCommissionValue] = useState("");
  const [headerDiscount, setHeaderDiscount] = useState("");
  const [freightAmount, setFreightAmount] = useState("");
  const [deliveredRate, setDeliveredRate] = useState("");
  const [billtyRate, setBilltyRate] = useState("");
  const [narration, setNarration] = useState("");

  // Step 2: Items
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

  // Autofill hint
  const [autofillHint, setAutofillHint] = useState<string | null>(null);
  const [autofillDismissed, setAutofillDismissed] = useState(false);
  const pickSeqRef = useRef(0);

  // Post-save sheet
  const [savedId, setSavedId] = useState<string | null>(null);
  const [savedStockUpdates, setSavedStockUpdates] = useState<Array<{ item_name: string; old_qty: number; new_qty: number; unit: string }>>([]);
  const [savedHasMissingDetails, setSavedHasMissingDetails] = useState(false);
  const [showSavedSheet, setShowSavedSheet] = useState(false);

  // Supplier/broker creation callbacks
  const [supplierGen, setSupplierGen] = useState(0);
  const [brokerGen, setBrokerGen] = useState(0);
  const [showNewSupplier, setShowNewSupplier] = useState(false);
  const [newSupplierPreFill, setNewSupplierPreFill] = useState("");
  const [showNewBroker, setShowNewBroker] = useState(false);
  const [newBrokerPreFill, setNewBrokerPreFill] = useState("");

  // Load initial data
  useEffect(() => {
    if (!businessId) return;
    const headers = authHeaders();
    Promise.all([
      fetch(`/v1/businesses/${businessId}/suppliers`, { headers }).then(r => r.ok ? r.json() : []),
      fetch(`/v1/businesses/${businessId}/brokers`, { headers }).then(r => r.ok ? r.json() : []),
      fetch(`/v1/businesses/${businessId}/catalog-items/`, { headers }).then(r => r.ok ? r.json() : []),
    ]).then(([supData, brokData, itmData]) => {
      const supList: Party[] = (Array.isArray(supData) ? supData : supData.suppliers ?? []).map((p: Record<string, unknown>) => ({
        id: String(p.id ?? ""), name: String(p.name ?? p.display_name ?? ""), type: "supplier" as const,
        phone: String(p.phone ?? ""), last_purchase_date: String(p.last_purchase_date ?? ""),
        balance: Number(p.balance ?? 0),
      }));
      const brokList: Party[] = (Array.isArray(brokData) ? brokData : brokData.brokers ?? []).map((p: Record<string, unknown>) => ({
        id: String(p.id ?? ""), name: String(p.name ?? p.display_name ?? ""), type: "broker" as const,
        phone: String(p.phone ?? ""),
      }));
      setSuppliers(supList);
      setBrokers(brokList);
      setItems(
        (Array.isArray(itmData) ? itmData : itmData.items ?? []).map((i: Record<string, unknown>) => ({
          id: String(i.id ?? ""), name: String(i.name ?? ""), unit: String(i.unit ?? "kg"),
          item_code: String(i.item_code ?? ""), hsn_code: String(i.hsn_code ?? ""),
          default_kg_per_unit: Number(i.default_kg_per_unit ?? 0),
          last_purchase_price: i.last_purchase_price != null ? Number(i.last_purchase_price) : null,
          last_purchase_date: i.last_purchase_date ? String(i.last_purchase_date) : null,
          last_purchase_qty: i.last_purchase_qty != null ? Number(i.last_purchase_qty) : null,
          supplier_name: i.supplier_name ? String(i.supplier_name) : null,
        })),
      );
    });
  }, [businessId, supplierGen, brokerGen]);

  // Load existing purchase data for edit mode
  useEffect(() => {
    if (!businessId || !editPurchaseId || !isEditMode) return;
    const headers = authHeaders();
    fetch(`/v1/businesses/${businessId}/trade-purchases/${editPurchaseId}`, { headers })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        setPurchaseDate(data.purchase_date?.split("T")[0] ?? new Date().toISOString().split("T")[0]);
        setInvoiceRef(data.invoice_number ?? "");
        setPaymentDays(String(data.payment_days ?? ""));
        setCommissionMode(data.commission_mode ?? "percent");
        setCommissionValue(String(data.commission_money ?? ""));
        setHeaderDiscount(String(data.header_discount ?? ""));
        setFreightAmount(String(data.freight_amount ?? ""));
        setDeliveredRate(String(data.delivered_rate ?? ""));
        setBilltyRate(String(data.billty_rate ?? ""));
        setNarration(data.narration ?? "");
        if (data.lines?.length) {
          setLines(data.lines.map((l: Record<string, unknown>) => ({
            tempId: generateTempId(),
            item_id: String(l.catalog_item_id ?? l.item_id ?? ""),
            item_name: String(l.item_name ?? ""),
            quantity: Number(l.qty ?? 0),
            unit: String(l.unit ?? "kg"),
            landing_cost: Number(l.landing_cost ?? 0),
            selling_price: Number(l.selling_cost ?? 0),
            kg_per_unit: Number(l.kg_per_unit ?? 0),
            tax_percent: Number(l.tax_percent ?? 0),
            discount_percent: Number(l.discount ?? 0),
            freight_type: String(l.freight_type ?? ""),
            freight_value: Number(l.freight_value ?? 0),
            delivered_rate: Number(l.delivered_rate ?? 0),
            billty_rate: Number(l.billty_rate ?? 0),
            line_notes: String(l.description ?? ""),
            hsn_code: String(l.hsn_code ?? ""),
            amount: Number(l.line_total ?? 0),
          })));
        }
        setSupplierQuery(data.supplier_name ?? "");
        setBrokerQuery(data.broker_name ?? "");
      })
      .catch(() => {});
  }, [businessId, editPurchaseId, isEditMode]);

  // Match supplier/broker names when data arrives
  useEffect(() => {
    if (!isEditMode || !editPurchaseId) return;
    const headers = authHeaders();
    fetch(`/v1/businesses/${businessId}/trade-purchases/${editPurchaseId}`, { headers })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        const sup = suppliers.find(s => s.id === data.supplier_id || s.name === data.supplier_name);
        if (sup) setSelectedSupplier(sup);
        const brok = brokers.find(b => b.id === data.broker_id || b.name === data.broker_name);
        if (brok) setSelectedBroker(brok);
      })
      .catch(() => {});
  }, [suppliers, brokers, isEditMode, editPurchaseId, businessId]);

  // Auto-generated purchase ID preview
  const autoIdPreview = useMemo(() => {
    if (invoiceRef.trim()) return null;
    const now = new Date();
    return `PUR-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}${String(Math.floor(Math.random() * 900) + 100)}`;
  }, [invoiceRef]);

  // Filtered lists
  const filteredSuppliers: Party[] = useMemo(() => {
    if (!supplierQuery.trim()) return suppliers;
    const q = supplierQuery.toLowerCase();
    return suppliers.filter(p => p.name.toLowerCase().includes(q) || p.phone?.includes(q));
  }, [suppliers, supplierQuery]);

  const filteredBrokers: Party[] = useMemo(() => {
    if (!brokerQuery.trim()) return brokers;
    const q = brokerQuery.toLowerCase();
    return brokers.filter(p => p.name.toLowerCase().includes(q) || p.phone?.includes(q));
  }, [brokers, brokerQuery]);

  const filteredItems: CatalogItem[] = useMemo(() => {
    if (!itemQuery.trim()) return items;
    const q = itemQuery.toLowerCase();
    return items.filter(i => i.name.toLowerCase().includes(q) || i.item_code?.toLowerCase().includes(q));
  }, [items, itemQuery]);

  // Grand total
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
    lines.forEach(l => { m[l.unit] = (m[l.unit] ?? 0) + l.quantity; });
    return m;
  }, [lines]);

  // Payment due
  const paymentDue = useMemo(() => {
    const days = parseInt(paymentDays) || 0;
    if (!days) return "";
    const d = new Date(purchaseDate);
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }, [paymentDays, purchaseDate]);

  // Review breakdown
  const taxTotal = useMemo(() => {
    return lines.reduce((s, l) => {
      const base = l.quantity * l.landing_cost * (1 - l.discount_percent / 100);
      return s + base * (l.tax_percent / 100);
    }, 0);
  }, [lines]);

  const chargesTotal = useMemo(() => {
    const commVal = parseFloat(commissionValue) || 0;
    let commAmt = 0;
    if (commissionMode === "percent") commAmt = lines.reduce((s, l) => s + l.amount, 0) * (commVal / 100);
    else if (commissionMode === "flat_invoice") commAmt = commVal;
    else if (commissionMode === "flat_kg") {
      const totalKg = lines.reduce((s, l) => s + (l.unit === "kg" ? l.quantity : l.quantity * l.kg_per_unit), 0);
      commAmt = commVal * totalKg;
    }
    const freight = parseFloat(freightAmount) || 0;
    return commAmt + freight;
  }, [lines, commissionMode, commissionValue, freightAmount]);

  const estProfit = useMemo(() => {
    let retail = 0;
    for (const l of lines) {
      if (l.selling_price <= 0) continue;
      const buy = l.quantity * l.landing_cost;
      retail += l.selling_price * l.quantity - buy;
    }
    return retail;
  }, [lines]);

  // Auto-save WIP on field changes
  useEffect(() => {
    if (saving) return;
    const t = setTimeout(() => persistWip({
      step, invoiceRef, purchaseDate, paymentDays, commissionMode,
      commissionValue, headerDiscount, freightAmount, deliveredRate,
      billtyRate, narration, supplierQuery, brokerQuery, itemQuery,
      lines: lines.map(l => ({ ...l })),
    }), 500);
    return () => clearTimeout(t);
  }, [step, invoiceRef, purchaseDate, paymentDays, commissionMode, commissionValue, headerDiscount, freightAmount, deliveredRate, billtyRate, narration, lines, itemQuery, saving]);

  // ------ Autofill logic ------
  function fetchLastDefaults(item: CatalogItem, seq: number) {
    if (!item.id || !businessId) return;
    // Server fetch
    fetch(`/v1/businesses/${businessId}/catalog-items/${item.id}/insights`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (seq !== pickSeqRef.current) return;
        if (data && data.last_purchase_price != null && data.last_purchase_price > 0) {
          const defaults: Record<string, string | number> = {};
          let changed = false;
          if (!eLanding && data.last_purchase_price) { defaults.landing = String(data.last_purchase_price); changed = true; }
          if (!eSelling && data.selling_price) { defaults.selling = String(data.selling_price); changed = true; }
          if (data.unit && !eUnit) { defaults.unit = data.unit; changed = true; }
          if (data.kg_per_unit && !eKgPerUnit) { defaults.kgPerUnit = String(data.kg_per_unit); changed = true; }
          if (data.tax_percent != null) { defaults.tax = String(data.tax_percent); changed = true; }
          if (data.delivered_rate && !eDelivered) { defaults.delivered = String(data.delivered_rate); changed = true; }
          if (data.billty_rate && !eBillty) { defaults.billty = String(data.billty_rate); changed = true; }
          if (changed) {
            if (defaults.landing) setELanding(defaults.landing as string);
            if (defaults.selling) setESelling(defaults.selling as string);
            if (defaults.unit) setEUnit(defaults.unit as string);
            if (defaults.kgPerUnit) setEKgPerUnit(defaults.kgPerUnit as string);
            if (defaults.tax) setETax(defaults.tax as string);
            if (defaults.delivered) setEDelivered(defaults.delivered as string);
            if (defaults.billty) setEBillty(defaults.billty as string);
            const dateStr = data.last_purchase_date ? new Date(data.last_purchase_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";
            setAutofillHint(`Filled from last purchase · ₹${data.last_purchase_price}${data.supplier_name ? ` · ${data.supplier_name}` : ""}${dateStr ? ` · ${dateStr}` : ""}`);
            setAutofillDismissed(false);
          }
        }
      })
      .catch(() => {
        // Network error — try device fallback
        if (seq !== pickSeqRef.current) return;
        const cached = localStorage.getItem(`pe_last_rate_${item.id}`);
        if (cached && !eLanding) {
          setELanding(cached);
          setAutofillHint(`Filled from your last entry on this device (₹${cached})`);
          setAutofillDismissed(false);
        }
      });
  }

  function openItemEntry(item?: CatalogItem, idx?: number) {
    if (idx != null) {
      const l = lines[idx];
      setEItem(items.find(i => i.id === l.item_id) ?? null);
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
      setAutofillHint(null);
      setAutofillDismissed(false);
    } else if (item) {
      setEItem(item);
      setEQty("");
      setEUnit(item.unit || "kg");
      setELanding("");
      setESelling("");
      setEKgPerUnit(item.default_kg_per_unit ? String(item.default_kg_per_unit) : "");
      setETax("0");
      setEDiscount("0");
      setEFreightType("separate");
      setEFreightVal("0");
      setEDelivered("0");
      setEBillty("0");
      setENotes("");
      setEHsn(item.hsn_code ?? "");
      setEditingLineIdx(null);
      setAutofillHint(null);
      setAutofillDismissed(false);
      // Fetch last purchase defaults
      const seq = ++pickSeqRef.current;
      setTimeout(() => fetchLastDefaults(item, seq), 300);
    } else return;
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

    // Validation: landing > 0, qty > 0
    if (qty <= 0) return;
    if (landing <= 0) return;
    if (disc > 100) return;
    if (tax > 100) return;

    const amount = qty * landing - (qty * landing * disc / 100) + (eFreightType === "included" ? 0 : fv);

    const line: LineItem = {
      tempId: editingLineIdx != null ? lines[editingLineIdx].tempId : generateTempId(),
      item_id: eItem.id, item_name: eItem.name, quantity: qty, unit: eUnit,
      landing_cost: landing, selling_price: selling, kg_per_unit: kgpu,
      tax_percent: tax, discount_percent: disc, freight_type: eFreightType,
      freight_value: fv, delivered_rate: dr, billty_rate: br,
      line_notes: eNotes, hsn_code: eHsn, amount,
    };

    if (editingLineIdx != null) {
      setLines(prev => prev.map((l, i) => i === editingLineIdx ? line : l));
    } else {
      setLines(prev => [...prev, line]);
      // Persist last rate for this item
      if (landing > 0) {
        localStorage.setItem(`pe_last_rate_${eItem.id}`, String(landing));
        // Rolling quantity history
        try {
          const raw = localStorage.getItem(`pe_qty_history_${eItem.id}`);
          const arr: number[] = raw ? JSON.parse(raw) : [];
          arr.push(qty);
          if (arr.length > 8) arr.shift();
          localStorage.setItem(`pe_qty_history_${eItem.id}`, JSON.stringify(arr));
        } catch {}
      }
    }
    setShowItemEntry(false);
    setEditingLineIdx(null);
  }

  function removeLine(tempId: string) {
    setLines(prev => prev.filter(l => l.tempId !== tempId));
  }

  // ------ Handlers ------
  function handleSelectSupplier(p: Party) {
    setSelectedSupplier(p);
    setSupplierQuery("");
    // Clear item pricing hints
    if (lines.length > 0) {
      setLines([]);
    }
  }

  function handleNewSupplier(name: string) {
    setNewSupplierPreFill(name);
    setShowNewSupplier(true);
  }

  function handleNewSupplierDone(created: Party | null) {
    setShowNewSupplier(false);
    if (created) {
      setSelectedSupplier(created);
      setSupplierGen(g => g + 1);
    }
  }

  function handleNewBroker(name: string) {
    setNewBrokerPreFill(name);
    setShowNewBroker(true);
  }

  function handleNewBrokerDone(created: Party | null) {
    setShowNewBroker(false);
    if (created) {
      setSelectedBroker(created);
      setBrokerGen(g => g + 1);
    }
  }

  async function handleSave() {
    if (!businessId || !selectedSupplier || lines.length === 0) return;
    setSaving(true);
    setError(null);
    try {
      const headers = authHeaders();
      const url = isEditMode && editPurchaseId
        ? `/v1/businesses/${businessId}/trade-purchases/${editPurchaseId}`
        : `/v1/businesses/${businessId}/trade-purchases/`;
      const method = isEditMode ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers,
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
          items: lines.map(l => ({
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
      const saved = await res.json();
      const purchaseId = saved.id ?? saved.purchase_id;
      clearWip();
      if (isEditMode) {
        navigate(`/purchase/${editPurchaseId}`);
      } else {
        setSavedId(purchaseId);
        setSavedStockUpdates(
          (saved.stock_updates ?? []).map((u: Record<string, unknown>) => ({
            item_name: String(u.item_name ?? u.name ?? ""),
            old_qty: Number(u.old_qty ?? 0),
            new_qty: Number(u.new_qty ?? 0),
            unit: String(u.unit ?? ""),
          }))
        );
        setSavedHasMissingDetails(!!saved.has_missing_details);
        setShowSavedSheet(true);
      }
    } catch (e) { setError(e instanceof Error ? e.message : "Save failed"); }
    finally { setSaving(false); }
  }

  const canNext =
    (step === 1 && selectedSupplier != null) ||
    (step === 2 && lines.length > 0) ||
    step === 3;

  const stepTitle = step === 1 ? "Party & Terms" : step === 2 ? "Items" : "Review";
  const canAddItem = eItem && parseFloat(eQty) > 0 && parseFloat(eLanding) > 0;
  const eDiscNum = parseFloat(eDiscount) || 0;
  const eTaxNum = parseFloat(eTax) || 0;

  // ------ Render helpers ------
  function renderSupplierList(arr: Party[]) {
    return arr.map(p => {
      const sel = selectedSupplier?.id === p.id;
      return (
        <button key={p.id} type="button" className={`pe__pcard${sel ? " pe__pcard--sel" : ""}`} onClick={() => handleSelectSupplier(p)}>
          <div className="pe__pavatar">{p.name.charAt(0).toUpperCase()}</div>
          <div className="pe__pinfo">
            <span className="pe__pname">{p.name}</span>
            {p.phone && <span className="pe__pmeta">{p.phone}</span>}
            {p.last_purchase_date && <span className="pe__pmeta">Last: {new Date(p.last_purchase_date).toLocaleDateString("en-GB")}</span>}
            {p.balance != null && p.balance !== 0 && <span className="pe__pmeta">Balance: {inr(p.balance)}</span>}
          </div>
          {sel && <svg width="20" height="20" viewBox="0 0 24 24" fill="#0E7C6B"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>}
        </button>
      );
    });
  }

  function renderBrokerList(arr: Party[]) {
    return arr.map(p => {
      const sel = selectedBroker?.id === p.id;
      return (
        <button key={p.id} type="button" className={`pe__pcard${sel ? " pe__pcard--sel" : ""}`} onClick={() => { setSelectedBroker(p); setBrokerQuery(""); }}>
          <div className="pe__pavatar">{p.name.charAt(0).toUpperCase()}</div>
          <div className="pe__pinfo">
            <span className="pe__pname">{p.name}</span>
            {p.phone && <span className="pe__pmeta">{p.phone}</span>}
          </div>
          {sel && <svg width="20" height="20" viewBox="0 0 24 24" fill="#0E7C6B"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>}
        </button>
      );
    });
  }

  // ------ Render: New Supplier Dialog ------
  function renderNewSupplierDialog() {
    if (!showNewSupplier) return null;
    return (
      <div className="pe__modal" onClick={() => setShowNewSupplier(false)}>
        <div className="pe__modal-body" onClick={e => e.stopPropagation()}>
          <div className="pe__modal-hdr">
            <h3 className="pe__modal-title">New Supplier</h3>
            <button type="button" className="pe__modal-close" onClick={() => setShowNewSupplier(false)}>×</button>
          </div>
          <p className="pe__modal-sub">Fill basic details to get started</p>
          <NewSupplierForm businessId={businessId} preFillName={newSupplierPreFill} onDone={handleNewSupplierDone} onCancel={() => setShowNewSupplier(false)} />
        </div>
      </div>
    );
  }

  // ------ Render: New Broker Dialog (2-step) ------
  function renderNewBrokerDialog() {
    if (!showNewBroker) return null;
    return (
      <div className="pe__modal" onClick={() => setShowNewBroker(false)}>
        <div className="pe__modal-body" onClick={e => e.stopPropagation()}>
          <NewBrokerForm businessId={businessId} preFillName={newBrokerPreFill} onDone={handleNewBrokerDone} onCancel={() => setShowNewBroker(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="pe">
      <header className="pe__hdr">
        <button type="button" className="pe__back" onClick={() => step > 1 ? setStep(s => (s - 1) as 1 | 2 | 3) : navigate(isEditMode ? `/purchase/${editPurchaseId}` : "/purchase")}>←</button>
        <h1 className="pe__title">{isEditMode ? `Edit ${stepTitle}` : stepTitle}</h1>
        <span className="pe__step">{step}/3</span>
      </header>
      <div className="pe__progress">{[1, 2, 3].map(s => <div key={s} className={`pe__dot${s <= step ? " pe__dot--on" : ""}`} />)}</div>

      <main className="pe__body">
        {/* STEP 1: Party & Terms (combined) */}
        {step === 1 && (
          <div className="pe__step-body">
            {/* Invoice Ref + auto preview */}
            <div className="pe__field">
              <label className="pe__label">Invoice Ref</label>
              <div className="pe__input-row">
                <input className="pe__input" placeholder="e.g. INV-001" value={invoiceRef} onChange={e => setInvoiceRef(e.target.value)} />
                {autoIdPreview && <span className="pe__preview-id">{autoIdPreview}</span>}
              </div>
            </div>

            {/* Purchase Date */}
            <div className="pe__field">
              <label className="pe__label">Purchase Date</label>
              <div className="pe__date-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#9CA3AF"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z" /></svg>
                <input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} className="pe__input pe__input--date" />
              </div>
            </div>

            {/* Supplier */}
            <div className="pe__field">
              <label className="pe__label">Supplier *</label>
              {selectedSupplier ? (
                <div className="pe__selected-chip">
                  <div className="pe__schip-left">
                    <div className="pe__pavatar pe__pavatar--sm">{selectedSupplier.name.charAt(0).toUpperCase()}</div>
                    <span>{selectedSupplier.name}</span>
                  </div>
                  <button type="button" className="pe__schip-del" onClick={() => { setSelectedSupplier(null); setLines([]); }}>×</button>
                </div>
              ) : (
                <>
                  <div className="pe__search">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#9CA3AF"><path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>
                    <input className="pe__search-input" type="search" placeholder="Search supplier by name…" value={supplierQuery} onChange={e => setSupplierQuery(e.target.value)} />
                  </div>
                  <div className="pe__party-list">
                    {renderSupplierList(filteredSuppliers)}
                    <button type="button" className="pe__new-party" onClick={() => handleNewSupplier(supplierQuery)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="#0E7C6B"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>
                      <span>+ New Supplier{supplierQuery.trim() ? `: "${supplierQuery.trim()}"` : ""}</span>
                    </button>
                    {filteredSuppliers.length === 0 && !supplierQuery.trim() && (
                      <div className="pe__empty">
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="#D1D5DB"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                        <p>No suppliers loaded. Create one above.</p>
                      </div>
                    )}
                    {filteredSuppliers.length === 0 && supplierQuery.trim() && (
                      <div className="pe__empty pe__empty--search">No suppliers match "<span className="pe__em-q">{supplierQuery}</span>"</div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Broker */}
            <div className="pe__field">
              <label className="pe__label">Broker (optional)</label>
              {selectedBroker ? (
                <div className="pe__selected-chip">
                  <div className="pe__schip-left">
                    <div className="pe__pavatar pe__pavatar--sm">{selectedBroker.name.charAt(0).toUpperCase()}</div>
                    <span>{selectedBroker.name}</span>
                  </div>
                  <button type="button" className="pe__schip-del" onClick={() => setSelectedBroker(null)}>×</button>
                </div>
              ) : (
                <>
                  <div className="pe__search">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#9CA3AF"><path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>
                    <input className="pe__search-input" type="search" placeholder="Search broker by name…" value={brokerQuery} onChange={e => setBrokerQuery(e.target.value)} />
                  </div>
                  <div className="pe__party-list">
                    {renderBrokerList(filteredBrokers)}
                    <button type="button" className="pe__new-party" onClick={() => handleNewBroker(brokerQuery)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="#0E7C6B"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>
                      <span>+ New Broker{brokerQuery.trim() ? `: "${brokerQuery.trim()}"` : ""}</span>
                    </button>
                    {filteredBrokers.length === 0 && !brokerQuery.trim() && (
                      <div className="pe__empty">
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="#D1D5DB"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                        <p>No brokers loaded. Create one above.</p>
                      </div>
                    )}
                    {filteredBrokers.length === 0 && brokerQuery.trim() && (
                      <div className="pe__empty pe__empty--search">No brokers match "<span className="pe__em-q">{brokerQuery}</span>"</div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Conditional helper banner */}
            {!selectedSupplier && (
              <div className="pe__helper-banner">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#D97706"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg>
                <span>Select a supplier first. You can still edit payment days and charges below.</span>
              </div>
            )}

            {/* Divider */}
            <div className="pe__section-divider"><span>Terms & charges</span></div>

            {/* Payment terms */}
            <div className="pe__field">
              <label className="pe__label">Payment Days</label>
              <input className="pe__input" type="number" placeholder="e.g. 30" value={paymentDays} onChange={e => setPaymentDays(e.target.value)} min="0" />
              {paymentDue && <span className="pe__hint-inline">Due: {paymentDue}</span>}
            </div>

            <div className="pe__field">
              <label className="pe__label">Discount %</label>
              <input className="pe__input" type="number" placeholder="0" value={headerDiscount} onChange={e => setHeaderDiscount(e.target.value)} min="0" max="100" step="0.01" />
            </div>

            <div className="pe__field">
              <label className="pe__label">Narration / Ref</label>
              <textarea className="pe__textarea" placeholder="Notes about this purchase..." value={narration} onChange={e => setNarration(e.target.value)} rows={2} />
            </div>

            {/* More charges collapsible */}
            <div className={`pe__collapse${moreChargesOpen ? " pe__collapse--on" : ""}`}>
              <button type="button" className="pe__collapse-hdr" onClick={() => setMoreChargesOpen(!moreChargesOpen)}>
                <span>More charges (commission, freight, rate overrides)</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#6B7280" className={`pe__chevron${moreChargesOpen ? " pe__chevron--up" : ""}`}><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" /></svg>
              </button>
              {moreChargesOpen && (
                <div className="pe__collapse-body">
                  <div className="pe__field">
                    <label className="pe__label">Commission</label>
                    <div className="pe__row">
                      <select className="pe__select pe__select--sm" value={commissionMode} onChange={e => setCommissionMode(e.target.value)}>
                        {COMMISSION_MODES.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                      </select>
                      <input className="pe__input pe__input--sm" type="number" placeholder="0" value={commissionValue} onChange={e => setCommissionValue(e.target.value)} min="0" step="0.01" />
                    </div>
                  </div>
                  <div className="pe__field">
                    <label className="pe__label">Freight Amount (₹)</label>
                    <input className="pe__input" type="number" placeholder="0" value={freightAmount} onChange={e => setFreightAmount(e.target.value)} min="0" step="0.01" />
                  </div>
                  <div className="pe__field">
                    <label className="pe__label">Delivered Rate (₹/kg)</label>
                    <input className="pe__input" type="number" placeholder="0" value={deliveredRate} onChange={e => setDeliveredRate(e.target.value)} min="0" step="0.01" />
                  </div>
                  <div className="pe__field">
                    <label className="pe__label">Billty Rate (₹/kg)</label>
                    <input className="pe__input" type="number" placeholder="0" value={billtyRate} onChange={e => setBilltyRate(e.target.value)} min="0" step="0.01" />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: Items */}
        {step === 2 && (
          <div className="pe__step-body">
            <div className="pe__search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#9CA3AF"><path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>
              <input className="pe__search-input" type="search" placeholder="Search items to add…" value={itemQuery} onChange={e => setItemQuery(e.target.value)} />
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
                  {l.line_notes && <span className="pe__note-icon">📝</span>}
                </div>
                <button type="button" className="pe__line-del" onClick={e => { e.stopPropagation(); removeLine(l.tempId); }} aria-label="Remove line">×</button>
              </div>
            ))}

            <div className="pe__item-catalog">
              {filteredItems.length === 0 && !itemQuery.trim() && (
                <div className="pe__empty">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="#D1D5DB"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" /></svg>
                  <p>No catalog items loaded.</p>
                </div>
              )}
              {filteredItems.length === 0 && itemQuery.trim() && (
                <div className="pe__empty pe__empty--search">
                  No items match "<span className="pe__em-q">{itemQuery}</span>"
                </div>
              )}
              {filteredItems.map(item => {
                const added = lines.some(l => l.item_id === item.id);
                return (
                  <button key={item.id} type="button" className={`pe__icard${added ? " pe__icard--added" : ""}`} onClick={() => openItemEntry(item)}>
                    <div className="pe__iavatar">{item.name.charAt(0).toUpperCase()}</div>
                    <div className="pe__iinfo">
                      <span className="pe__iname">{item.name}</span>
                      <span className="pe__icode">{item.item_code ?? item.unit}</span>
                      {item.last_purchase_price != null && item.last_purchase_price > 0 && (
                        <span className="pe__imeta">
                          Last buy: {inr(item.last_purchase_price)}
                          {item.last_purchase_date && ` · ${new Date(item.last_purchase_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`}
                        </span>
                      )}
                    </div>
                    {added && <svg width="18" height="18" viewBox="0 0 24 24" fill="#0E7C6B"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: Review Tally */}
        {step === 3 && (
          <div className="pe__step-body">
            <div className="pe__review-hdr" onClick={() => setStep(1)}>
              <div className="pe__rhdr-supplier">
                <div className="pe__pavatar">{selectedSupplier?.name.charAt(0).toUpperCase()}</div>
                <div>
                  <p className="pe__rhdr-name">{selectedSupplier?.name}{selectedBroker ? ` · ${selectedBroker.name}` : ""}</p>
                  <p className="pe__rhdr-sub">
                    {new Date(purchaseDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} · {invoiceRef || autoIdPreview || "New"}
                  </p>
                </div>
              </div>
              <span className="pe__edit-link">Edit</span>
            </div>

            {/* Stats card: QTY + GRAND TOTAL + TAX + CHARGES + EST PROFIT */}
            <div className="pe__review-stats">
              <div className="pe__rs-row">
                <div className="pe__rs-stat">
                  <span className="pe__rs-label">QTY</span>
                  <span className="pe__rs-value">
                    {totalKg > 0 && `${totalKg.toFixed(1)} KG`}
                    {Object.entries(totalQtyByUnit).filter(([u]) => u !== "kg").map(([u, q]) => (
                      <span key={u}> · {q} {u.toUpperCase()}</span>
                    ))}
                  </span>
                </div>
                <div className="pe__rs-stat pe__rs-stat--right">
                  <span className="pe__rs-label">GRAND TOTAL</span>
                  <span className="pe__rs-value pe__rs-value--lg">{inr(grandTotal)}</span>
                </div>
              </div>
              <div className="pe__rs-divider" />
              <div className="pe__rs-row pe__rs-row--sub">
                <div className="pe__rs-stat">
                  <span className="pe__rs-label">TAX TOTAL</span>
                  <span className="pe__rs-value">{inr(taxTotal)}</span>
                </div>
                <div className="pe__rs-stat">
                  <span className="pe__rs-label">CHARGES</span>
                  <span className="pe__rs-value">{inr(chargesTotal)}</span>
                </div>
                {lines.some(l => l.selling_price > 0) && (
                  <div className="pe__rs-stat">
                    <span className="pe__rs-label">EST. PROFIT</span>
                    <span className="pe__rs-value pe__rs-value--success">{inr(estProfit)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Items section */}
            <h3 className="pe__section-title">Items <span className="pe__edit-link" onClick={() => setStep(2)}>Edit</span></h3>
            <div className="pe__review-lines">
              {lines.map((l, i) => (
                <div key={l.tempId} className="pe__rline" onClick={() => { setStep(2); openItemEntry(undefined, i); }}>
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

            {/* Terms section */}
            <h3 className="pe__section-title">Terms <span className="pe__edit-link" onClick={() => setStep(1)}>Edit</span></h3>
            <div className="pe__review-terms">
              {paymentDays && <div className="pe__rt-row"><span>Payment</span><span>{paymentDays} days (Due: {paymentDue})</span></div>}
              {headerDiscount && <div className="pe__rt-row"><span>Discount</span><span>{headerDiscount}%</span></div>}
              {commissionValue && <div className="pe__rt-row"><span>Commission</span><span>{commissionMode === "percent" ? `${commissionValue}%` : `${inr(parseFloat(commissionValue))} / ${commissionMode.replace("flat_", "")}`}</span></div>}
              {freightAmount && <div className="pe__rt-row"><span>Freight</span><span>{inr(parseFloat(freightAmount))}</span></div>}
              {deliveredRate && <div className="pe__rt-row"><span>Delivered Rate</span><span>{inr(parseFloat(deliveredRate))}/kg</span></div>}
              {billtyRate && <div className="pe__rt-row"><span>Billty Rate</span><span>{inr(parseFloat(billtyRate))}/kg</span></div>}
              {narration && <div className="pe__rt-row"><span>Narration</span><span>{narration}</span></div>}
              {!paymentDays && !headerDiscount && !commissionValue && !freightAmount && !deliveredRate && !billtyRate && !narration && (
                <div className="pe__rt-row"><span>Terms</span><span className="pe__rt-muted">(none set)</span></div>
              )}
            </div>

            {error && <div className="pe__error">{error}</div>}
          </div>
        )}
      </main>

      {/* Item Entry Modal */}
      {showItemEntry && eItem && (
        <div className="pe__modal" onClick={() => setShowItemEntry(false)}>
          <div className="pe__modal-body" onClick={e => e.stopPropagation()}>
            <h3 className="pe__modal-title">{editingLineIdx != null ? "Edit Item" : "Add Item"}: {eItem.name}</h3>

            {autofillHint && !autofillDismissed && (
              <div className="pe__autofill-hint">
                <span>{autofillHint}</span>
                <button type="button" className="pe__autofill-dismiss" onClick={() => setAutofillDismissed(true)}>×</button>
              </div>
            )}

            <div className="pe__field"><label className="pe__label">Quantity *</label>
              <input className="pe__input" type="number" value={eQty} onChange={e => setEQty(e.target.value)} min="0" step="0.01" autoFocus inputMode="decimal" />
            </div>
            <div className="pe__field"><label className="pe__label">Unit</label>
              <div className="pe__chips">{UNITS.map(u => <button key={u} type="button" className={`pe__chip${eUnit === u ? " pe__chip--on" : ""}`} onClick={() => setEUnit(u)}>{u}</button>)}</div>
            </div>
            <div className="pe__field"><label className="pe__label">KG per Unit</label>
              <input className="pe__input" type="number" value={eKgPerUnit} onChange={e => setEKgPerUnit(e.target.value)} min="0" step="0.01" placeholder="e.g. 25 for bags" />
            </div>
            <div className="pe__field"><label className="pe__label">Landing Cost (₹/{eUnit}) *</label>
              <input className="pe__input" type="number" value={eLanding} onChange={e => setELanding(e.target.value)} min="0" step="0.01" inputMode="decimal" />
              {!eLanding && <span className="pe__hint-inline">Required — will be filled from last purchase if available</span>}
            </div>
            <div className="pe__field"><label className="pe__label">Selling Price (₹/{eUnit})</label>
              <input className="pe__input" type="number" value={eSelling} onChange={e => setESelling(e.target.value)} min="0" step="0.01" />
            </div>
            <div className="pe__field"><label className="pe__label">Tax %</label>
              <input className="pe__input" type="number" value={eTax} onChange={e => setETax(e.target.value)} min="0" max="100" step="0.01" />
              {eTaxNum > 100 && <span className="pe__hint-inline pe__hint-inline--err">Max 100%</span>}
            </div>
            <div className="pe__field"><label className="pe__label">Line Discount %</label>
              <input className="pe__input" type="number" value={eDiscount} onChange={e => setEDiscount(e.target.value)} min="0" max="100" step="0.01" />
              {eDiscNum > 100 && <span className="pe__hint-inline pe__hint-inline--err">Max 100%</span>}
            </div>
            <div className="pe__field"><label className="pe__label">HSN Code</label>
              <input className="pe__input" type="text" value={eHsn} onChange={e => setEHsn(e.target.value)} placeholder="HSN" />
            </div>
            <div className="pe__field"><label className="pe__label">Freight Type</label>
              <div className="pe__chips">
                <button type="button" className={`pe__chip${eFreightType === "separate" ? " pe__chip--on" : ""}`} onClick={() => setEFreightType("separate")}>Separate</button>
                <button type="button" className={`pe__chip${eFreightType === "included" ? " pe__chip--on" : ""}`} onClick={() => setEFreightType("included")}>Included</button>
              </div>
            </div>
            {eFreightType === "separate" && (
              <div className="pe__field"><label className="pe__label">Freight Value (₹)</label>
                <input className="pe__input" type="number" value={eFreightVal} onChange={e => setEFreightVal(e.target.value)} min="0" step="0.01" />
              </div>
            )}
            <div className="pe__field"><label className="pe__label">Delivered Rate (₹)</label>
              <input className="pe__input" type="number" value={eDelivered} onChange={e => setEDelivered(e.target.value)} min="0" step="0.01" />
            </div>
            <div className="pe__field"><label className="pe__label">Billty Rate (₹)</label>
              <input className="pe__input" type="number" value={eBillty} onChange={e => setEBillty(e.target.value)} min="0" step="0.01" />
            </div>
            <div className="pe__field"><label className="pe__label">Line Notes</label>
              <input className="pe__input" type="text" value={eNotes} onChange={e => setENotes(e.target.value)} placeholder="Optional notes" />
            </div>

            <div className="pe__modal-actions">
              <button type="button" className="pe__btn pe__btn--sec" onClick={() => setShowItemEntry(false)}>Cancel</button>
              <button type="button" className="pe__btn pe__btn--pri" disabled={!canAddItem} onClick={confirmItemEntry}>{editingLineIdx != null ? "Update" : "Add"}</button>
            </div>
          </div>
        </div>
      )}

      {/* New Supplier Dialog */}
      {renderNewSupplierDialog()}
      {/* New Broker Dialog */}
      {renderNewBrokerDialog()}

      {/* Post-save Sheet */}
      {showSavedSheet && savedId && (
        <PurchaseSavedSheet
          savedId={savedId}
          businessId={businessId}
          purchaseDate={purchaseDate}
          supplierName={selectedSupplier?.name ?? ""}
          grandTotal={grandTotal}
          lineCount={lines.length}
          stockUpdates={savedStockUpdates}
          hasMissingDetails={savedHasMissingDetails}
          onHome={() => navigate("/purchase")}
          onAddMore={() => { setShowSavedSheet(false); setStep(1); setSelectedSupplier(null); setSelectedBroker(null); setLines([]); setInvoiceRef(""); setPaymentDays(""); setCommissionValue(""); setHeaderDiscount(""); setFreightAmount(""); setDeliveredRate(""); setBilltyRate(""); setNarration(""); clearWip(); }}
          onView={() => navigate(`/purchase/${savedId}`)}
          onClose={() => { setShowSavedSheet(false); navigate("/purchase"); }}
        />
      )}

      <footer className="pe__footer">
        {step > 1 && <button type="button" className="pe__btn pe__btn--sec" onClick={() => setStep(s => (s - 1) as 1 | 2 | 3)}>Back</button>}
        <button type="button" className="pe__btn pe__btn--pri" disabled={!canNext || saving} onClick={() => step < 3 ? setStep(s => (s + 1) as 1 | 2 | 3) : handleSave()}>
          {saving ? "Saving..." : step === 3 ? `Save ${inr(grandTotal)}` : "Continue →"}
        </button>
      </footer>
    </div>
  );
}

// ------ Sub-components ------

function NewSupplierForm({ businessId, preFillName, onDone, onCancel }: {
  businessId: string; preFillName: string; onDone: (created: Party | null) => void; onCancel: () => void;
}) {
  const [name, setName] = useState(preFillName);
  const [phone, setPhone] = useState("");
  const [place, setPlace] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMore, setShowMore] = useState(false);
  const [gst, setGst] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [openingBalance, setOpeningBalance] = useState("");
  const [notes, setNotes] = useState("");
  const [nameErr, setNameErr] = useState(false);
  const [placeErr, setPlaceErr] = useState(false);

  async function handleSave() {
    let hasErr = false;
    if (!name.trim()) { setNameErr(true); hasErr = true; } else setNameErr(false);
    if (!place.trim()) { setPlaceErr(true); hasErr = true; } else setPlaceErr(false);
    if (hasErr) return;

    setSaving(true);
    setError(null);
    try {
      const headers = authHeaders();
      const res = await fetch(`/v1/businesses/${businessId}/suppliers`, {
        method: "POST", headers,
        body: JSON.stringify({
          name: name.trim(), phone: phone.trim(), place: place.trim(),
          gst_number: gst.trim() || undefined,
          address_line2: addressLine2.trim() || undefined,
          opening_balance: parseFloat(openingBalance) || 0,
          notes: notes.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        if (res.status === 409) throw new Error("A supplier with this name already exists. Create anyway?");
        throw new Error(b.detail ?? "Save failed");
      }
      const data = await res.json();
      if (!data.id) { throw new Error("Supplier not saved (missing id)."); }
      onDone({ id: String(data.id), name: String(data.name ?? name.trim()), type: "supplier", phone: phone.trim() || undefined });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally { setSaving(false); }
  }

  return (
    <div className="pe__dialog-form">
      <div className="pe__field"><label className="pe__label">Supplier Name *</label>
        <div className="pe__input-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="#9CA3AF"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg></div>
        <input className={`pe__input pe__input--icon${nameErr ? " pe__input--err" : ""}`} value={name} onChange={e => setName(e.target.value)} placeholder="Supplier name" />
        {nameErr && <span className="pe__field-err">Required</span>}
      </div>
      <div className="pe__field"><label className="pe__label">Phone (optional)</label>
        <div className="pe__input-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="#9CA3AF"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" /></svg></div>
        <input className="pe__input pe__input--icon" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number" />
      </div>
      <div className="pe__field"><label className="pe__label">Place *</label>
        <div className="pe__input-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="#9CA3AF"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg></div>
        <input className={`pe__input pe__input--icon${placeErr ? " pe__input--err" : ""}`} value={place} onChange={e => setPlace(e.target.value)} placeholder="City / location" />
        {placeErr && <span className="pe__field-err">Required</span>}
      </div>

      <button type="button" className="pe__more-toggle" onClick={() => setShowMore(!showMore)}>
        <span>Add more details (optional)</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#6B7280" className={`pe__chevron${showMore ? " pe__chevron--up" : ""}`}><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" /></svg>
      </button>
      {showMore && (
        <div className="pe__more-fields">
          <div className="pe__field"><label className="pe__label">GST Number</label>
            <input className="pe__input" value={gst} onChange={e => setGst(e.target.value)} placeholder="GSTIN" />
          </div>
          <div className="pe__field"><label className="pe__label">Address Line 2</label>
            <input className="pe__input" value={addressLine2} onChange={e => setAddressLine2(e.target.value)} placeholder="Street / area" />
          </div>
          <div className="pe__field"><label className="pe__label">Opening Balance (₹)</label>
            <input className="pe__input" type="number" value={openingBalance} onChange={e => setOpeningBalance(e.target.value)} min="0" step="0.01" />
          </div>
          <div className="pe__field"><label className="pe__label">Notes</label>
            <textarea className="pe__textarea" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes" rows={2} />
          </div>
        </div>
      )}

      {error && <div className="pe__error">{error}</div>}

      <div className="pe__modal-actions">
        <button type="button" className="pe__btn pe__btn--sec" onClick={onCancel}>Cancel</button>
        <button type="button" className="pe__btn pe__btn--pri" disabled={saving} onClick={handleSave}>{saving ? "Saving..." : "Save Supplier"}</button>
      </div>
    </div>
  );
}

function NewBrokerForm({ businessId, preFillName, onDone, onCancel }: {
  businessId: string; preFillName: string; onDone: (created: Party | null) => void; onCancel: () => void;
}) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState(preFillName);
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [commType, setCommType] = useState<"percent" | "fixed">("percent");
  const [commValue, setCommValue] = useState("");
  const [payDays, setPayDays] = useState("");
  const [headerDisc, setHeaderDisc] = useState("");
  const [defaultDelivered, setDefaultDelivered] = useState("");
  const [defaultBillty, setDefaultBillty] = useState("");
  const [freightHandling, setFreightHandling] = useState<"included" | "separate">("separate");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nameErr, setNameErr] = useState(false);

  async function handleSave() {
    if (!name.trim()) { setNameErr(true); return; }
    setNameErr(false);
    setSaving(true);
    setError(null);
    try {
      const headers = authHeaders();
      const body: Record<string, unknown> = {
        name: name.trim(), phone: phone.trim() || undefined,
        location: location.trim() || undefined, notes: notes.trim() || undefined,
        commission_type: commType,
        commission_value: parseFloat(commValue) || 0,
        payment_days: parseInt(payDays) || 0,
        header_discount_percent: parseFloat(headerDisc) || 0,
        default_delivered_rate: parseFloat(defaultDelivered) || 0,
        default_billty_rate: parseFloat(defaultBillty) || 0,
        freight_handling: freightHandling,
      };
      const res = await fetch(`/v1/businesses/${businessId}/brokers`, {
        method: "POST", headers, body: JSON.stringify(body),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.detail ?? "Save failed");
      }
      const data = await res.json();
      if (!data.id) throw new Error("Broker not saved (missing id).");
      onDone({ id: String(data.id), name: String(data.name ?? name.trim()), type: "broker", phone: phone.trim() || undefined });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally { setSaving(false); }
  }

  if (step === 1) {
    return (
      <div className="pe__dialog-form">
        <div className="pe__modal-hdr">
          <button type="button" className="pe__modal-back" onClick={onCancel}>←</button>
          <div>
            <h3 className="pe__modal-title">New broker</h3>
            <p className="pe__modal-sub">Broker details · Step 1 of 2</p>
          </div>
        </div>
        <div className="pe__field"><label className="pe__label">Broker Name *</label>
          <input className={`pe__input${nameErr ? " pe__input--err" : ""}`} value={name} onChange={e => setName(e.target.value)} placeholder="Broker name" />
          {nameErr && <span className="pe__field-err">Required</span>}
        </div>
        <div className="pe__field"><label className="pe__label">Phone (optional)</label>
          <input className="pe__input" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number" />
        </div>
        <div className="pe__field"><label className="pe__label">Location</label>
          <input className="pe__input" value={location} onChange={e => setLocation(e.target.value)} placeholder="City / area" />
        </div>
        <div className="pe__field"><label className="pe__label">Notes</label>
          <textarea className="pe__textarea" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes" rows={2} />
        </div>

        <button type="button" className="pe__more-toggle" onClick={() => setShowAdvanced(!showAdvanced)}>
          <span>Advanced (optional)</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#6B7280" className={`pe__chevron${showAdvanced ? " pe__chevron--up" : ""}`}><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" /></svg>
        </button>
        {showAdvanced && (
          <div className="pe__field"><label className="pe__label">Link suppliers & item preferences — can be edited later from broker detail</label></div>
        )}

        <div className="pe__modal-actions">
          <button type="button" className="pe__btn pe__btn--sec" onClick={onCancel}>Cancel</button>
          <button type="button" className="pe__btn pe__btn--pri" onClick={() => setStep(2)}>Next</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pe__dialog-form">
      <div className="pe__modal-hdr">
        <button type="button" className="pe__modal-back" onClick={() => setStep(1)}>←</button>
        <div>
          <h3 className="pe__modal-title">New broker</h3>
          <p className="pe__modal-sub">Commission · Step 2 of 2</p>
        </div>
      </div>

      <div className="pe__segmented">
        <button type="button" className={`pe__seg-btn${commType === "percent" ? " pe__seg-btn--on" : ""}`} onClick={() => setCommType("percent")}>
          {commType === "percent" && <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>}
          Percentage %
        </button>
        <button type="button" className={`pe__seg-btn${commType === "fixed" ? " pe__seg-btn--on" : ""}`} onClick={() => setCommType("fixed")}>
          {commType === "fixed" && <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>}
          Fixed ₹
        </button>
      </div>

      <div className="pe__field"><label className="pe__label">Commission Value {commType === "percent" ? "(%)" : "(₹)"}</label>
        <input className="pe__input" type="number" value={commValue} onChange={e => setCommValue(e.target.value)} min="0" step="0.01" />
      </div>

      <div className="pe__section-label">Default deal terms for new purchases</div>
      <div className="pe__field"><label className="pe__label">Payment days</label>
        <input className="pe__input" type="number" value={payDays} onChange={e => setPayDays(e.target.value)} min="0" />
      </div>
      <div className="pe__field"><label className="pe__label">Header discount %</label>
        <input className="pe__input" type="number" value={headerDisc} onChange={e => setHeaderDisc(e.target.value)} min="0" step="0.01" />
      </div>
      <div className="pe__field"><label className="pe__label">Default delivered rate ₹</label>
        <input className="pe__input" type="number" value={defaultDelivered} onChange={e => setDefaultDelivered(e.target.value)} min="0" step="0.01" />
      </div>
      <div className="pe__field"><label className="pe__label">Default billty rate ₹</label>
        <input className="pe__input" type="number" value={defaultBillty} onChange={e => setDefaultBillty(e.target.value)} min="0" step="0.01" />
      </div>

      <div className="pe__section-label">Freight handling</div>
      <div className="pe__segmented">
        <button type="button" className={`pe__seg-btn${freightHandling === "included" ? " pe__seg-btn--on" : ""}`} onClick={() => setFreightHandling("included")}>Included</button>
        <button type="button" className={`pe__seg-btn${freightHandling === "separate" ? " pe__seg-btn--on" : ""}`} onClick={() => setFreightHandling("separate")}>Separate</button>
      </div>

      {error && <div className="pe__error">{error}</div>}

      <div className="pe__modal-actions">
        <button type="button" className="pe__btn pe__btn--sec" onClick={onCancel}>Cancel</button>
        <button type="button" className="pe__btn pe__btn--pri" disabled={saving} onClick={handleSave}>{saving ? "Saving..." : "Save Broker"}</button>
      </div>
    </div>
  );
}

function PurchaseSavedSheet({ savedId, businessId, purchaseDate, supplierName, grandTotal, lineCount, stockUpdates, hasMissingDetails, onHome, onAddMore, onView, onClose }: {
  savedId: string; businessId: string; purchaseDate: string; supplierName: string; grandTotal: number; lineCount: number;
  stockUpdates?: Array<{ item_name: string; old_qty: number; new_qty: number; unit: string }>;
  hasMissingDetails?: boolean;
  onHome: () => void; onAddMore: () => void; onView: () => void; onClose: () => void;
}) {
  const navigate = useNavigate();

  function handleSharePdf() {
    alert("Preparing PDF...");
    sharePurchasePdf(businessId, savedId).then(r => alert(r.message));
  }

  function handlePrint() {
    alert("Preparing PDF...");
    printPurchasePdf(businessId, savedId).then(r => alert(r.message));
  }

  function handleEmail() {
    emailPurchasePdf(savedId, supplierName);
  }

  return (
    <div className="pe__modal" onClick={onClose}>
      <div className="pe__modal-body pe__modal-body--sheet" onClick={e => e.stopPropagation()}>
        <div className="pe__ss-success">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="#059669"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
          <h3>Purchase saved</h3>
        </div>
        <div className="pe__ss-id">{savedId}</div>
        <div className="pe__ss-summary">
          {new Date(purchaseDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} · {supplierName} · {inr(grandTotal)} · {lineCount} line(s)
        </div>

        <div className="pe__ss-divider" />

        <div className="pe__ss-delivery">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#D97706"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
          <span>Has this shipment arrived at your warehouse?</span>
        </div>
        <div className="pe__ss-deliv-actions">
          <button type="button" className="pe__btn pe__btn--sec" onClick={onHome}>Not yet</button>
          <button type="button" className="pe__btn pe__btn--pri" onClick={() => navigate(`/staff/receive/${savedId}`)}>Yes, received</button>
        </div>

        {stockUpdates && stockUpdates.length > 0 && (
          <div className="pe__ss-stock">
            <p className="pe__ss-stock-title">Stock updated</p>
            {stockUpdates.slice(0, 6).map((u, i) => (
              <p key={i} className="pe__ss-stock-row">{u.item_name}: {u.old_qty} → {u.new_qty} {u.unit}</p>
            ))}
          </div>
        )}

        {hasMissingDetails && (
          <div className="pe__ss-missing">
            <div className="pe__ss-missing-top">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#D97706"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
              <span className="pe__ss-missing-title">Some details missing — update now?</span>
            </div>
            <p className="pe__ss-missing-sub">Broker, payment days, freight type/amount, or header discount were left blank.</p>
            <div className="pe__ss-missing-actions">
              <button type="button" className="pe__btn pe__btn--sec" onClick={onHome}>Later</button>
              <button type="button" className="pe__btn pe__btn--pri" onClick={onView}>Edit now</button>
            </div>
          </div>
        )}

        <div className="pe__ss-actions">
          <button type="button" className="pe__ss-action" onClick={onAddMore}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#0E7C6B"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
            <span>Add more items</span>
            <span className="pe__ss-sub">Continue adding items to a new purchase</span>
          </button>
          <button type="button" className="pe__ss-action" onClick={onHome}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#0E7C6B"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
            <span>Home dashboard</span>
            <span className="pe__ss-sub">Close entry and go to overview</span>
          </button>
          <button type="button" className="pe__ss-action" onClick={onView}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#0E7C6B"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
            <span>View purchase</span>
            <span className="pe__ss-sub">See order details</span>
          </button>
          <button type="button" className="pe__ss-action" onClick={handleSharePdf}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#0E7C6B"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>
            <span>Share PDF</span>
            <span className="pe__ss-sub">Download or share purchase order</span>
          </button>
          <button type="button" className="pe__ss-action" onClick={handlePrint}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#0E7C6B"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>
            <span>Print</span>
            <span className="pe__ss-sub">Send to printer</span>
          </button>
          <button type="button" className="pe__ss-action" onClick={handleEmail}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#0E7C6B"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
            <span>Email</span>
            <span className="pe__ss-sub">Compose email with PDF attached</span>
          </button>
        </div>
      </div>
    </div>
  );
}
