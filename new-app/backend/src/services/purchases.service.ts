import { randomUUID } from "crypto";
import type { PurchaseRepository } from "../repositories/purchases.repository";
import type { PurchaseRow, PurchaseLineRow } from "../repositories/types";
import { validateWithSchema } from "../validation/validate";
import {
  createPurchaseSchema,
  updatePurchaseSchema,
  paymentPatchSchema,
  markPaidSchema,
  duplicateCheckSchema,
  draftUpsertSchema,
  previewLinesSchema,
  lifecycleTransitionSchema,
  dispatchSchema,
  arriveSchema,
  verifySchema,
  deliveryPatchSchema,
  type PurchaseLineIn,
  type CreatePurchaseIn,
  type PurchaseOut,
  type PurchaseLineOut,
  type DispatchIn,
  type ArriveIn,
  type VerifyIn,
  type DeliveryPatchIn,
  type DeliveryPipelineOut,
} from "../validation/purchases.schemas";

// --- Decimal helpers ---
function d(v: unknown): number {
  if (v === null || v === undefined) return 0;
  if (typeof v === "string") return parseFloat(v);
  return Number(v);
}

function round(v: number, decimals = 2): number {
  const m = Math.pow(10, decimals);
  return Math.round(v * m) / m;
}

function rate(v: unknown): number { return round(d(v), 2); }
function qty(v: unknown): number { return round(d(v), 3); }
function weight(v: unknown): number { return round(d(v), 3); }
function total(v: unknown): number { return round(d(v), 2); }
function money(v: unknown): number { return round(d(v), 2); }
function percent(v: unknown): number { return round(d(v), 2); }
function clampPercent(v: number, max = 100): number { return Math.min(Math.max(v, 0), max); }

// --- Error classes ---
export class PurchaseValidationError extends Error {
  readonly code = "VALIDATION_ERROR";
  readonly status = 422;
  details: Record<string, unknown>[];
  constructor(details: Record<string, unknown>[]) {
    super("Validation failed");
    this.details = details;
  }
}

export class PurchaseDuplicateError extends Error {
  readonly code = "DUPLICATE_PURCHASE_DETECTED";
  readonly status = 409;
  existingId: string;
  existingHumanId: string;
  constructor(existingId: string, existingHumanId: string) {
    super("DUPLICATE_PURCHASE_DETECTED");
    this.existingId = existingId;
    this.existingHumanId = existingHumanId;
  }
}

export class PurchaseStateConflictError extends Error {
  readonly code: string;
  readonly status = 409;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export class NotFoundError extends Error {
  readonly code = "NOT_FOUND";
  readonly status = 404;
}

// --- Line totals (from line_totals_service.py) ---
function lineGrossBase(li: PurchaseLineIn): number {
  const q = d(li.qty);
  const kpu = li.kg_per_unit ?? li.weight_per_unit;
  const lcpk = li.landing_cost_per_kg;
  const landing = li.purchase_rate ?? li.landing_cost;
  if (kpu && lcpk && landing) {
    const derived = d(kpu) * d(lcpk);
    if (d(kpu) > 0 && d(lcpk) > 0 && Math.abs(derived - d(landing)) <= 0.05) {
      return q * d(kpu) * d(lcpk);
    }
  }
  return q * d(landing);
}

function lineItemFreightCharges(li: PurchaseLineIn): number {
  const ft = li.freight_type;
  const fv = li.freight_value;
  const f = (fv !== null && fv !== undefined && ft === "separate") ? d(fv) : 0;
  const del = li.delivered_rate ? d(li.delivered_rate) : 0;
  const bil = li.billty_rate ? d(li.billty_rate) : 0;
  return f + del + bil;
}

function lineMoney(li: PurchaseLineIn): number {
  const base = lineGrossBase(li);
  const ld = li.discount ? d(li.discount) : 0;
  const afterDisc = base * (1 - clampPercent(ld) / 100);
  const tax = li.tax_percent ? d(li.tax_percent) : 0;
  return total(afterDisc * (1 + clampPercent(tax, 1000) / 100));
}

function lineTotalWeight(li: PurchaseLineIn): number {
  const ut = (li.unit ?? "").toUpperCase();
  const kpuSrc = li.weight_per_unit ?? li.kg_per_unit;
  const q = d(li.qty);
  if (ut === "KG") return weight(q);
  if ((ut === "BAG" || ut === "SACK") && kpuSrc) return weight(q * d(kpuSrc));
  if (ut === "BOX" || ut === "TIN") return 0;
  if (kpuSrc) return weight(q * d(kpuSrc));
  return 0;
}

function lineProfit(li: PurchaseLineIn): number | null {
  if (li.selling_rate === null && li.selling_cost === null) return null;
  const sr = li.selling_rate ?? li.selling_cost ?? 0;
  const revenue = d(li.qty) * d(sr);
  const totalCost = lineMoney(li) + lineItemFreightCharges(li);
  return total(revenue - totalCost);
}

// --- Aggregate totals (from aggregate_totals_service.py) ---
function aggregateLandingSellingProfit(lines: PurchaseLineIn[]): [number, number | null, number | null] {
  let land = 0;
  let sell = 0;
  let hasSell = false;
  for (const li of lines) {
    land += lineMoney(li) + lineItemFreightCharges(li);
    const sr = li.selling_rate ?? li.selling_cost;
    if (sr !== null && sr !== undefined) {
      sell += d(li.qty) * d(sr);
      hasSell = true;
    }
  }
  land = total(land);
  if (!hasSell || sell <= 0) return [land, null, null];
  sell = total(sell);
  return [land, sell, total(sell - land)];
}

// --- Header commission (from trade_purchase_service.py _header_commission_rupees) ---
function headerCommissionRupees(body: CreatePurchaseIn, afterHeader: number): number {
  const mode = (body.commission_mode ?? "percent").toLowerCase();
  if (mode === "percent") {
    const comm = body.commission_percent ? d(body.commission_percent) : 0;
    if (comm <= 0) return 0;
    return total(afterHeader * clampPercent(comm) / 100);
  }
  const moneyVal = body.commission_money ? d(body.commission_money) : 0;
  if (moneyVal <= 0) return 0;
  if (mode === "flat_invoice") return total(moneyVal);
  let units = 0;
  for (const li of body.lines) {
    const u = (li.unit ?? "").toLowerCase();
    if (mode === "flat_kg") {
      units += lineTotalWeight(li);
    } else if (mode === "flat_bag" && (u === "bag" || u === "sack")) {
      units += d(li.qty);
    } else if (mode === "flat_box" && u === "box") {
      units += d(li.qty);
    } else if (mode === "flat_tin" && u === "tin") {
      units += d(li.qty);
    }
  }
  if (units <= 0) return 0;
  return total(moneyVal * units);
}

// --- compute_totals (from trade_purchase_service.py) ---
function computeTotals(body: CreatePurchaseIn): [number, number] {
  let qtySum = 0;
  let amtSum = 0;
  let hasItemCharges = false;
  for (const li of body.lines) {
    qtySum += d(li.qty);
    amtSum += lineMoney(li) + lineItemFreightCharges(li);
    if (li.freight_value || li.delivered_rate || li.billty_rate) {
      hasItemCharges = true;
    }
  }
  const headerDisc = body.discount ? d(body.discount) : 0;
  let afterHeader = amtSum;
  if (headerDisc > 0) {
    afterHeader = amtSum * (1 - clampPercent(headerDisc) / 100);
  }
  amtSum = afterHeader;
  if (!hasItemCharges) {
    const freight = body.freight_amount ? d(body.freight_amount) : 0;
    if (body.freight_type !== "included") amtSum += freight;
  }
  const commAmt = headerCommissionRupees(body, afterHeader);
  if (commAmt > 0) amtSum += commAmt;
  if (!hasItemCharges) {
    const billty = body.billty_rate ? d(body.billty_rate) : 0;
    const delivered = body.delivered_rate ? d(body.delivered_rate) : 0;
    amtSum += billty + delivered;
  }
  return [qty(qtySum), total(amtSum)];
}

// --- Status helpers ---
function normalizePurchaseStatus(raw: string | null | undefined): string {
  const s = (raw ?? "").toLowerCase().trim();
  if (s === "saved") return "draft";
  if (s === "confirmed") return "active";
  if (s === "delivered") return "added_to_stock";
  return s || "active";
}

function computePaymentStatus(
  storedStatus: string,
  totalAmount: number,
  paidAmount: number,
  dueDate: string | null,
): string {
  const st = (storedStatus || "confirmed").toLowerCase().trim();
  if (st === "cancelled" || st === "deleted" || st === "draft") return st;
  const totalVal = d(totalAmount);
  const paidVal = d(paidAmount);
  if (totalVal <= 0) return ["saved", "confirmed", "paid", "partially_paid", "overdue"].includes(st) ? st : "confirmed";
  const remaining = totalVal - paidVal;
  if (remaining <= 0 || paidVal >= totalVal) return "paid";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (dueDate) {
    const dd = new Date(dueDate);
    dd.setHours(0, 0, 0, 0);
    if (today > dd) return "overdue";
    const delta = Math.round((dd.getTime() - today.getTime()) / 86400000);
    if (delta >= 0 && delta <= 3) return "due_soon";
  }
  if (paidVal > 0) return "partially_paid";
  if (["saved", "confirmed", "partially_paid", "paid", "overdue", "due_soon"].includes(st)) return st;
  return "confirmed";
}

function dueDateFrom(purchaseDate: string, paymentDays: number | null): string | null {
  if (paymentDays === null || paymentDays === undefined) return null;
  const d = new Date(purchaseDate);
  d.setDate(d.getDate() + paymentDays);
  return d.toISOString().split("T")[0];
}

function stripDisallowedFields(li: PurchaseLineIn): PurchaseLineIn {
  const unit = (li.unit ?? "").toUpperCase();
  if (unit === "BOX") {
    return { ...li, kg_per_unit: undefined, weight_per_unit: undefined, landing_cost_per_kg: undefined, box_mode: undefined, items_per_box: undefined, weight_per_item: undefined, kg_per_box: undefined };
  }
  if (unit === "TIN") {
    return { ...li, kg_per_unit: undefined, weight_per_unit: undefined, landing_cost_per_kg: undefined, weight_per_tin: undefined };
  }
  return li;
}

// --- Duplicate fingerprint helpers ---
function lineFingerprint(name: string, qtyV: number, landing: number, disc: number, taxPct: number, kpu?: number | null, perKg?: number | null): string {
  return `${name.trim().toLowerCase()}|${qty(qtyV).toFixed(3)}|${rate(landing).toFixed(2)}|${percent(disc || 0).toFixed(2)}|${percent(taxPct || 0).toFixed(2)}|${weight(kpu || 0).toFixed(3)}|${rate(perKg || 0).toFixed(2)}`;
}

function fingerprintLinesFromIn(lines: PurchaseLineIn[]): string {
  return lines.map((li) => lineFingerprint(li.item_name, d(li.qty), d(li.landing_cost), d(li.discount), d(li.tax_percent), li.kg_per_unit ?? li.weight_per_unit, li.landing_cost_per_kg)).sort().join("|");
}

function fingerprintLinesFromDb(lines: PurchaseLineRow[]): string {
  return lines.map((li) => lineFingerprint(li.item_name, d(li.qty), d(li.landing_cost), d(li.discount), d(li.tax_percent), li.kg_per_unit ?? li.weight_per_unit, li.landing_cost_per_kg)).sort().join("|");
}

function lineKeyAndRates(li: PurchaseLineIn): [string, number, number] {
  const key = `${li.catalog_item_id ?? ""}|${(li.item_name ?? "").trim().toLowerCase()}`;
  const q = qty(d(li.qty));
  if (li.kg_per_unit && li.landing_cost_per_kg) {
    return [key, q, rate(d(li.landing_cost_per_kg))];
  }
  return [key, q, rate(d(li.landing_cost))];
}

function lineKeyAndRatesDb(li: PurchaseLineRow): [string, number, number] {
  const key = `${li.catalog_item_id ?? ""}|${(li.item_name ?? "").trim().toLowerCase()}`;
  const q = qty(d(li.qty));
  const kpu = li.kg_per_unit ?? li.weight_per_unit;
  const lpk = li.landing_cost_per_kg;
  if (kpu && lpk) return [key, q, rate(d(lpk))];
  return [key, q, rate(d(li.landing_cost))];
}

function fingerprintApproxMatch(linesIn: PurchaseLineIn[], dbLines: PurchaseLineRow[]): boolean {
  if (linesIn.length !== dbLines.length) return false;
  const pairsIn = linesIn.map(lineKeyAndRates).sort((a, b) => a[0].localeCompare(b[0]));
  const pairsDb = dbLines.map(lineKeyAndRatesDb).sort((a, b) => a[0].localeCompare(b[0]));
  const eps = 0.02;
  const rateEps = 0.05;
  for (let i = 0; i < pairsIn.length; i++) {
    if (pairsIn[i][0] !== pairsDb[i][0]) return false;
    if (Math.abs(pairsIn[i][1] - pairsDb[i][1]) > eps) return false;
    if (Math.abs(pairsIn[i][2] - pairsDb[i][2]) > rateEps) return false;
  }
  return true;
}

// --- Validation ---
function collectValidationErrors(body: CreatePurchaseIn): Record<string, unknown>[] {
  const errs: Record<string, unknown>[] = [];
  if (!body.lines || body.lines.length === 0) {
    errs.push({ loc: ["body", "lines"], msg: "At least one line item is required" });
    return errs;
  }
  const seenCatalogUnit = new Set<string>();
  for (let i = 0; i < body.lines.length; i++) {
    const li = body.lines[i];
    const base = ["body", "lines", i];
    if (!(li.item_name ?? "").trim()) {
      errs.push({ loc: [...base, "item_name"], msg: "item name is required" });
    }
    const u = (li.unit ?? "").trim().toLowerCase();
    if (!u) {
      errs.push({ loc: [...base, "unit"], msg: "unit is required" });
    }
    if (d(li.qty) <= 0) {
      errs.push({ loc: [...base, "qty"], msg: "quantity must be greater than 0" });
    }
    if (li.catalog_item_id) {
      const key = `${li.catalog_item_id}|${u}`;
      if (seenCatalogUnit.has(key)) {
        errs.push({ loc: [...base, "catalog_item_id"], msg: "duplicate line for the same catalog item and unit" });
      } else {
        seenCatalogUnit.add(key);
      }
    }
    const gross = lineGrossBase(li);
    if (gross <= 0) {
      errs.push({ loc: [...base, "landing_cost"], msg: "line gross must be greater than 0" });
    }
  }
  return errs;
}



// --- Service type ---
export type PurchaseService = {
  getDraft(businessId: string, userId: string): Promise<{ step: number; payload: Record<string, unknown>; updated_at: string } | null>;
  upsertDraft(businessId: string, userId: string, body: unknown): Promise<void>;
  deleteDraft(businessId: string, userId: string): Promise<void>;
  previewLines(body: unknown): Promise<{ lines: Record<string, unknown>[]; total_qty: number; total_amount: number; total_landing_subtotal: number | null; total_selling_subtotal: number | null; total_line_profit: number | null }>;
  validate(body: unknown): Promise<{ ok: boolean; errors: Record<string, unknown>[]; warnings: Record<string, unknown>[] }>;
  checkDuplicate(businessId: string, body: unknown): Promise<{ duplicate: boolean; message: string | null; existing_id: string | null; existing_human_id: string | null }>;
  nextHumanId(businessId: string): Promise<{ human_id: string }>;
  lastDefaults(businessId: string, catalogItemId: string, supplierId?: string, brokerId?: string): Promise<Record<string, unknown>>;
  listPurchases(businessId: string, limit: number, offset: number, filters: Record<string, unknown>): Promise<PurchaseOut[]>;
  getPurchase(businessId: string, purchaseId: string): Promise<PurchaseOut>;
  createPurchase(businessId: string, userId: string, body: unknown): Promise<PurchaseOut>;
  updatePurchase(businessId: string, purchaseId: string, body: unknown): Promise<PurchaseOut>;
  deletePurchase(businessId: string, purchaseId: string): Promise<void>;
  patchPayment(businessId: string, purchaseId: string, body: unknown): Promise<PurchaseOut>;
  markPaid(businessId: string, purchaseId: string, body: unknown): Promise<PurchaseOut>;
  cancelPurchase(businessId: string, purchaseId: string): Promise<PurchaseOut>;
  listLifecycleEvents(businessId: string, purchaseId: string): Promise<Record<string, unknown>[]>;
  transitionLifecycle(businessId: string, purchaseId: string, body: unknown): Promise<void>;
  // Delivery pipeline
  getDeliveryPipeline(businessId: string): Promise<DeliveryPipelineOut>;
  purchaseDispatch(businessId: string, purchaseId: string, body: unknown): Promise<PurchaseOut>;
  purchaseArrive(businessId: string, purchaseId: string, body: unknown): Promise<PurchaseOut>;
  purchaseVerify(businessId: string, purchaseId: string, body: unknown): Promise<PurchaseOut>;
  patchDelivery(businessId: string, purchaseId: string, body: unknown): Promise<PurchaseOut>;
  commitStock(businessId: string, purchaseId: string): Promise<PurchaseOut>;
  autoCommitStock(businessId: string, purchaseId: string): Promise<PurchaseOut | null>;
};

// --- Map DB row to API response ---
function toPurchaseOut(
  header: PurchaseRow,
  lines: PurchaseLineRow[],
  supplierName?: string | null,
  brokerName?: string | null,
): PurchaseOut {
  const lineOuts: PurchaseLineOut[] = lines.map((li) => ({
    id: li.id,
    catalog_item_id: li.catalog_item_id,
    item_name: li.item_name,
    qty: d(li.qty),
    unit: li.unit,
    unit_type: li.unit_type,
    landing_cost: d(li.landing_cost),
    purchase_rate: li.purchase_rate ? d(li.purchase_rate) : null,
    kg_per_unit: li.kg_per_unit ? d(li.kg_per_unit) : null,
    weight_per_unit: li.weight_per_unit ? d(li.weight_per_unit) : null,
    landing_cost_per_kg: li.landing_cost_per_kg ? d(li.landing_cost_per_kg) : null,
    selling_cost: li.selling_cost ? d(li.selling_cost) : null,
    selling_rate: li.selling_rate ? d(li.selling_rate) : null,
    freight_type: li.freight_type,
    freight_value: li.freight_value ? d(li.freight_value) : null,
    delivered_rate: li.delivered_rate ? d(li.delivered_rate) : null,
    billty_rate: li.billty_rate ? d(li.billty_rate) : null,
    total_weight: li.total_weight ? d(li.total_weight) : null,
    line_total: li.line_total ? d(li.line_total) : null,
    profit: li.profit ? d(li.profit) : null,
    box_mode: li.box_mode,
    items_per_box: li.items_per_box ? d(li.items_per_box) : null,
    weight_per_item: li.weight_per_item ? d(li.weight_per_item) : null,
    kg_per_box: li.kg_per_box ? d(li.kg_per_box) : null,
    weight_per_tin: li.weight_per_tin ? d(li.weight_per_tin) : null,
    discount: li.discount ? d(li.discount) : null,
    tax_percent: li.tax_percent ? d(li.tax_percent) : null,
    hsn_code: li.hsn_code,
    item_code: li.item_code,
    description: li.description,
    received_qty: li.received_qty ? d(li.received_qty) : null,
    damaged_qty: li.damaged_qty ? d(li.damaged_qty) : null,
    return_qty: li.return_qty ? d(li.return_qty) : null,
    default_unit: null,
    default_kg_per_bag: null,
    default_purchase_unit: null,
    line_landing_gross: 0,
    line_selling_gross: 0,
    line_profit: li.profit ? d(li.profit) : null,
    rate_context: {},
  }));

  const totalDec = d(header.total_amount);
  const paidDec = d(header.paid_amount);
  const remaining = total(paidDec > 0 ? Math.max(totalDec - paidDec, 0) : totalDec);
  const derivedStatus = computePaymentStatus(header.status, totalDec, paidDec, header.due_date);

  const hasMissing = !header.broker_id || !header.payment_days || !header.discount || !header.freight_amount || !header.freight_type;

  return {
    id: header.id,
    human_id: header.human_id,
    invoice_number: header.invoice_number,
    purchase_date: header.purchase_date,
    supplier_id: header.supplier_id,
    broker_id: header.broker_id,
    payment_days: header.payment_days,
    due_date: header.due_date,
    paid_amount: paidDec,
    paid_at: header.paid_at,
    discount: header.discount ? d(header.discount) : null,
    commission_percent: header.commission_percent ? d(header.commission_percent) : null,
    commission_mode: header.commission_mode ?? "percent",
    commission_money: header.commission_money ? d(header.commission_money) : null,
    delivered_rate: header.delivered_rate ? d(header.delivered_rate) : null,
    billty_rate: header.billty_rate ? d(header.billty_rate) : null,
    freight_amount: header.freight_amount ? d(header.freight_amount) : null,
    freight_type: header.freight_type,
    total_qty: header.total_qty ? d(header.total_qty) : null,
    total_amount: totalDec,
    total_landing_subtotal: header.total_landing_subtotal ? d(header.total_landing_subtotal) : null,
    total_selling_subtotal: header.total_selling_subtotal ? d(header.total_selling_subtotal) : null,
    total_line_profit: header.total_line_profit ? d(header.total_line_profit) : null,
    status: header.status,
    remaining,
    derived_status: derivedStatus,
    items_count: lines.length,
    supplier_name: supplierName ?? null,
    broker_name: brokerName ?? null,
    supplier_gst: null,
    supplier_address: null,
    supplier_phone: null,
    broker_phone: null,
    broker_location: null,
    broker_image_url: null,
    created_at: header.created_at,
    updated_at: header.updated_at,
    lines: lineOuts,
    is_delivered: header.is_delivered,
    delivered_at: header.delivered_at,
    delivery_notes: header.delivery_notes,
    delivery_status: header.delivery_status ?? "pending",
    dispatched_at: header.dispatched_at,
    arrived_at: header.arrived_at,
    staff_verified_at: header.staff_verified_at,
    staff_verified_by_name: header.staff_verified_by_name,
    created_by_name: null,
    stock_committed_at: header.stock_committed_at,
    staff_verified_qty: header.staff_verified_qty ? d(header.staff_verified_qty) : null,
    delivered_qty_committed: header.delivered_qty_committed ? d(header.delivered_qty_committed) : null,
    truck_number: header.truck_number,
    driver_contact: header.driver_contact,
    dispatch_note: header.dispatch_note,
    header_discount: header.discount ? d(header.discount) : null,
    freight_value: header.freight_amount ? d(header.freight_amount) : null,
    has_missing_details: hasMissing,
  };
}

export function createPurchaseService(repo: PurchaseRepository): PurchaseService {
  return {
    async getDraft(businessId, userId) {
      const row = await repo.getDraft(businessId, userId);
      if (!row) return null;
      return {
        step: row.step,
        payload: JSON.parse(row.payload_json || "{}"),
        updated_at: row.updated_at,
      };
    },

    async upsertDraft(businessId, userId, body) {
      const data = validateWithSchema(draftUpsertSchema, body);
      await repo.upsertDraft(businessId, userId, data.step, JSON.stringify(data.payload));
    },

    async deleteDraft(businessId, userId) {
      await repo.deleteDraft(businessId, userId);
    },

    async previewLines(body) {
      const data = validateWithSchema(previewLinesSchema, body);
      const lines = data.lines.map((li: PurchaseLineIn) => stripDisallowedFields(li));
      const previewTotalsBody: CreatePurchaseIn = {
        purchase_date: new Date().toISOString().split("T")[0],
        supplier_id: "00000000-0000-4000-8000-000000000000",
        status: "draft",
        force_duplicate: false,
        commission_mode: "percent",
        lines,
      };
      const [qtySum, amtSum] = computeTotals(previewTotalsBody);
      const [landS, sellS, prof] = aggregateLandingSellingProfit(lines);
      const previewLines = lines.map((li, i) => ({
        index: i,
        line_total: lineMoney(li),
        line_landing_gross: lineGrossBase(li),
        line_profit: lineProfit(li),
        line_total_weight_kg: lineTotalWeight(li),
        resolved_labels: {},
        rate_context: {},
      }));
      return { lines: previewLines, total_qty: qtySum, total_amount: amtSum, total_landing_subtotal: landS, total_selling_subtotal: sellS, total_line_profit: prof };
    },

    async validate(body) {
      const data = validateWithSchema(createPurchaseSchema, body);
      const errs = collectValidationErrors(data);
      return { ok: errs.length === 0, errors: errs, warnings: [] };
    },

    async checkDuplicate(businessId, body) {
      const data = validateWithSchema(duplicateCheckSchema, body);
      // 24h window
      const windowStart = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const candidates = await repo.findDuplicatePurchases(businessId, data.supplier_id ?? null, windowStart);
      const targetTotal = total(d(data.total_amount));
      const inFp = fingerprintLinesFromIn(data.lines);
      for (const cand of candidates) {
        if (Math.abs(d(cand.total_amount) - targetTotal) > 1.0) continue;
        const candLines = await repo.getPurchaseLinesForCheck([cand.id]);
        const dbFp = fingerprintLinesFromDb(candLines);
        if (inFp === dbFp || fingerprintApproxMatch(data.lines, candLines)) {
          return { duplicate: true, message: "A purchase with the same lines and total already exists", existing_id: cand.id, existing_human_id: cand.human_id };
        }
      }
      return { duplicate: false, message: null, existing_id: null, existing_human_id: null };
    },

    async nextHumanId(businessId) {
      const year = new Date().getFullYear();
      const seq = await repo.maxHumanIdSequence(businessId, year);
      return { human_id: `PUR-${year}-${(seq + 1).toString().padStart(4, "0")}` };
    },

    async lastDefaults(businessId, catalogItemId, supplierId, brokerId) {
      const result = await repo.lastTradeLineForItem(businessId, catalogItemId, supplierId, brokerId);
      if (!result) return { source: "none" };
      const li = result.line as Record<string, unknown>;
      const p = result.purchase as Record<string, unknown>;
      const kpu = (li.weight_per_unit as number) ?? (li.kg_per_unit as number);
      return {
        source: supplierId && brokerId ? "supplier_broker_item" : supplierId ? "supplier_item" : "item_global_last_trade",
        purchase_id: p.id as string,
        purchase_date: p.purchase_date as string,
        payment_days: p.payment_days as number | null,
        broker_id: p.broker_id as string | null,
        unit: li.unit as string,
        purchase_rate: rate((li.purchase_rate ?? li.landing_cost) as number),
        landing_cost: rate(li.landing_cost as number),
        landing_cost_per_kg: li.landing_cost_per_kg ? rate(li.landing_cost_per_kg as number) : null,
        selling_rate: li.selling_rate ? rate(li.selling_rate as number) : null,
        selling_cost: li.selling_cost ? rate(li.selling_cost as number) : null,
        weight_per_unit: kpu ? weight(kpu as number) : null,
        kg_per_unit: kpu ? weight(kpu as number) : null,
        tax_percent: li.tax_percent ? percent(li.tax_percent as number) : null,
        delivered_rate: p.delivered_rate ? money(p.delivered_rate as number) : null,
        billty_rate: p.billty_rate ? money(p.billty_rate as number) : null,
        freight_type: (p.freight_type as string) ?? "separate",
        freight_value: li.freight_value ? money(li.freight_value as number) : (p.freight_amount ? money(p.freight_amount as number) : null),
        freight_amount: li.freight_value ? money(li.freight_value as number) : (p.freight_amount ? money(p.freight_amount as number) : null),
        box_mode: li.box_mode as string | null,
        items_per_box: li.items_per_box ? qty(li.items_per_box as number) : null,
        weight_per_item: li.weight_per_item ? weight(li.weight_per_item as number) : null,
        kg_per_box: li.kg_per_box ? weight(li.kg_per_box as number) : null,
        weight_per_tin: li.weight_per_tin ? weight(li.weight_per_tin as number) : null,
      };
    },

    async listPurchases(businessId, limit, offset, filters) {
      const clampedLimit = Math.min(Math.max(limit, 1), 500);
      const rows = await repo.listPurchases(businessId, clampedLimit, Math.max(offset, 0), filters);
      const ids = rows.map((r) => r.id);
      const lineMap = new Map<string, PurchaseLineRow[]>();
      if (ids.length > 0) {
        const allLines = await repo.listPurchaseLines(ids);
        for (const line of allLines) {
          if (!lineMap.has(line.trade_purchase_id)) lineMap.set(line.trade_purchase_id, []);
          lineMap.get(line.trade_purchase_id)!.push(line);
        }
      }
      return rows.map((r) => {
        const lines = lineMap.get(r.id) ?? [];
        return toPurchaseOut(r, lines);
      });
    },

    async getPurchase(businessId, purchaseId) {
      const result = await repo.getPurchaseWithLines(businessId, purchaseId);
      if (!result) throw new NotFoundError("Purchase not found");
      return toPurchaseOut(result.header, result.lines);
    },

    async createPurchase(businessId, userId, body) {
      const data = validateWithSchema(createPurchaseSchema, body);
      const errs = collectValidationErrors(data);
      if (errs.length > 0) throw new PurchaseValidationError(errs);

      const initialStatus = ["draft", "saved", "confirmed"].includes(data.status) ? data.status : "confirmed";
      if (initialStatus === "confirmed" && !data.supplier_id) {
        throw new PurchaseValidationError([{ loc: ["body", "supplier_id"], msg: "supplier is required for confirmed purchases" }]);
      }

      const [qtySum, amtSum] = computeTotals(data);
      const [landS, sellS, prof] = aggregateLandingSellingProfit(data.lines);

      // Duplicate check
      if (!data.force_duplicate) {
        const windowStart = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const candidates = await repo.findDuplicatePurchases(businessId, data.supplier_id, windowStart);
        const inFp = fingerprintLinesFromIn(data.lines);
        for (const cand of candidates) {
          if (Math.abs(d(cand.total_amount) - amtSum) > 1.0) continue;
          const candLines = await repo.getPurchaseLinesForCheck([cand.id]);
          if (inFp === fingerprintLinesFromDb(candLines) || fingerprintApproxMatch(data.lines, candLines)) {
            throw new PurchaseDuplicateError(cand.id, cand.human_id);
          }
        }
      }

      const humanId = (await this.nextHumanId(businessId)).human_id;
      const purchaseId = randomUUID();
      const now = new Date().toISOString();
      const due = dueDateFrom(data.purchase_date, data.payment_days ?? null);
      const inv = data.invoice_number?.trim() || null;

      const header: Record<string, unknown> = {
        id: purchaseId, business_id: businessId, user_id: userId,
        human_id: humanId, invoice_number: inv, purchase_date: data.purchase_date,
        supplier_id: data.supplier_id, broker_id: data.broker_id ?? null,
        payment_days: data.payment_days ?? null, due_date: due,
        paid_amount: 0, paid_at: null,
        discount: data.discount ?? null,
        commission_percent: data.commission_percent ?? null,
        commission_mode: data.commission_mode ?? "percent",
        commission_money: data.commission_money ?? null,
        delivered_rate: data.delivered_rate ?? null,
        billty_rate: data.billty_rate ?? null,
        freight_amount: data.freight_amount ?? null,
        freight_type: data.freight_type ?? null,
        total_qty: qtySum, total_amount: amtSum,
        total_landing_subtotal: landS, total_selling_subtotal: sellS, total_line_profit: prof,
        status: initialStatus, is_delivered: false, delivery_status: "pending",
        created_at: now, updated_at: now,
      };

      await repo.insertPurchase(header);

      // Insert lifecycle event
      await repo.insertLifecycleEvent({
        id: randomUUID(), purchase_id: purchaseId, business_id: businessId,
        from_status: null, to_status: normalizePurchaseStatus(initialStatus),
        actor_id: null, actor_name: null, notes: "Purchase created",
        metadata: "{}", created_at: now,
      });

      // Insert lines
      const lineRows: Record<string, unknown>[] = data.lines.map((li: PurchaseLineIn) => {
        const normalized = stripDisallowedFields(li);
        const lineTotal = lineMoney(normalized);
        const lineWeight = lineTotalWeight(normalized);
        const lineProf = lineProfit(normalized);
        return {
          id: randomUUID(), trade_purchase_id: purchaseId,
          catalog_item_id: normalized.catalog_item_id,
          item_name: normalized.item_name, qty: qty(d(normalized.qty)),
          unit: normalized.unit, qty_in_stock_unit: null, unit_type: null,
          purchase_rate: rate(normalized.purchase_rate ?? normalized.landing_cost),
          selling_rate: normalized.selling_rate ? rate(d(normalized.selling_rate)) : null,
          freight_type: normalized.freight_type,
          freight_value: normalized.freight_value ? money(d(normalized.freight_value)) : null,
          delivered_rate: normalized.delivered_rate ? money(d(normalized.delivered_rate)) : null,
          billty_rate: normalized.billty_rate ? money(d(normalized.billty_rate)) : null,
          weight_per_unit: normalized.weight_per_unit ? weight(d(normalized.weight_per_unit)) : null,
          total_weight: lineWeight > 0 ? weight(lineWeight) : null,
          line_total: lineTotal, profit: lineProf,
          box_mode: normalized.box_mode,
          items_per_box: normalized.items_per_box ? qty(d(normalized.items_per_box)) : null,
          weight_per_item: normalized.weight_per_item ? weight(d(normalized.weight_per_item)) : null,
          kg_per_box: normalized.kg_per_box ? weight(d(normalized.kg_per_box)) : null,
          weight_per_tin: normalized.weight_per_tin ? weight(d(normalized.weight_per_tin)) : null,
          landing_cost: rate(d(normalized.landing_cost)),
          kg_per_unit: normalized.kg_per_unit ? weight(d(normalized.kg_per_unit)) : null,
          landing_cost_per_kg: normalized.landing_cost_per_kg ? rate(d(normalized.landing_cost_per_kg)) : null,
          selling_cost: normalized.selling_cost ? rate(d(normalized.selling_cost)) : null,
          discount: normalized.discount ? percent(d(normalized.discount)) : null,
          tax_percent: normalized.tax_percent ? percent(d(normalized.tax_percent)) : null,
          tax_mode: normalized.tax_mode ?? "exclusive",
          payment_days: normalized.payment_days ?? null,
          hsn_code: normalized.hsn_code?.trim() || null,
          item_code: normalized.item_code?.trim() || null,
          description: normalized.description?.trim() || null,
        };
      });
      await repo.insertPurchaseLines(lineRows);

      return this.getPurchase(businessId, purchaseId);
    },

    async updatePurchase(businessId, purchaseId, body) {
      const existing = await repo.getPurchase(businessId, purchaseId);
      if (!existing) throw new NotFoundError("Purchase not found");

      const data = validateWithSchema(updatePurchaseSchema, body);
      const errs = collectValidationErrors(data);
      if (errs.length > 0) throw new PurchaseValidationError(errs);

      const st = (existing.status ?? "").toLowerCase();
      if (st === "deleted") throw new PurchaseStateConflictError("PURCHASE_DELETED", "Cannot edit a deleted purchase");
      if (st === "cancelled") throw new PurchaseStateConflictError("PURCHASE_CANCELLED", "Cannot edit a cancelled purchase");
      if ((existing.delivery_status ?? "").toLowerCase() === "stock_committed") {
        throw new PurchaseStateConflictError("PURCHASE_ALREADY_COMMITTED", "This purchase has already been committed to stock. Revert delivery first.");
      }

      const [qtySum, amtSum] = computeTotals(data);
      const [landS, sellS, prof] = aggregateLandingSellingProfit(data.lines);

      const due = dueDateFrom(data.purchase_date, data.payment_days ?? null);
      const now = new Date().toISOString();

      const fields: Record<string, unknown> = {
        purchase_date: data.purchase_date,
        invoice_number: data.invoice_number?.trim() || null,
        supplier_id: data.supplier_id,
        broker_id: data.broker_id ?? null,
        payment_days: data.payment_days ?? null,
        due_date: due,
        discount: data.discount ?? null,
        commission_percent: data.commission_percent ?? null,
        commission_mode: data.commission_mode ?? "percent",
        commission_money: data.commission_money ?? null,
        delivered_rate: data.delivered_rate ?? null,
        billty_rate: data.billty_rate ?? null,
        freight_amount: data.freight_amount ?? null,
        freight_type: data.freight_type ?? null,
        total_qty: qtySum,
        total_amount: amtSum,
        total_landing_subtotal: landS,
        total_selling_subtotal: sellS,
        total_line_profit: prof,
        updated_at: now,
      };

      if (["draft", "saved", "confirmed"].includes(data.status)) {
        fields.status = data.status;
      }

      await repo.deletePurchaseLines(purchaseId);
      const lineRows: Record<string, unknown>[] = data.lines.map((li: PurchaseLineIn) => {
        const normalized = stripDisallowedFields(li);
        const lineTotal = lineMoney(normalized);
        const lineWeight = lineTotalWeight(normalized);
        const lineProf = lineProfit(normalized);
        return {
          id: randomUUID(), trade_purchase_id: purchaseId,
          catalog_item_id: normalized.catalog_item_id,
          item_name: normalized.item_name, qty: qty(d(normalized.qty)),
          unit: normalized.unit, qty_in_stock_unit: null, unit_type: null,
          purchase_rate: rate(normalized.purchase_rate ?? normalized.landing_cost),
          selling_rate: normalized.selling_rate ? rate(d(normalized.selling_rate)) : null,
          freight_type: normalized.freight_type,
          freight_value: normalized.freight_value ? money(d(normalized.freight_value)) : null,
          delivered_rate: normalized.delivered_rate ? money(d(normalized.delivered_rate)) : null,
          billty_rate: normalized.billty_rate ? money(d(normalized.billty_rate)) : null,
          weight_per_unit: normalized.weight_per_unit ? weight(d(normalized.weight_per_unit)) : null,
          total_weight: lineWeight > 0 ? weight(lineWeight) : null,
          line_total: lineTotal, profit: lineProf,
          box_mode: normalized.box_mode,
          items_per_box: normalized.items_per_box ? qty(d(normalized.items_per_box)) : null,
          weight_per_item: normalized.weight_per_item ? weight(d(normalized.weight_per_item)) : null,
          kg_per_box: normalized.kg_per_box ? weight(d(normalized.kg_per_box)) : null,
          weight_per_tin: normalized.weight_per_tin ? weight(d(normalized.weight_per_tin)) : null,
          landing_cost: rate(d(normalized.landing_cost)),
          kg_per_unit: normalized.kg_per_unit ? weight(d(normalized.kg_per_unit)) : null,
          landing_cost_per_kg: normalized.landing_cost_per_kg ? rate(d(normalized.landing_cost_per_kg)) : null,
          selling_cost: normalized.selling_cost ? rate(d(normalized.selling_cost)) : null,
          discount: normalized.discount ? percent(d(normalized.discount)) : null,
          tax_percent: normalized.tax_percent ? percent(d(normalized.tax_percent)) : null,
          tax_mode: normalized.tax_mode ?? "exclusive",
          payment_days: normalized.payment_days ?? null,
          hsn_code: normalized.hsn_code?.trim() || null,
          item_code: normalized.item_code?.trim() || null,
          description: normalized.description?.trim() || null,
        };
      });
      await repo.insertPurchaseLines(lineRows);

      // Clamp paid_amount
      const totalDec = d(amtSum);
      const paidDec = d(existing.paid_amount);
      if (paidDec > totalDec) {
        fields.paid_amount = money(totalDec);
      }

      await repo.updatePurchase(businessId, purchaseId, fields);
      return this.getPurchase(businessId, purchaseId);
    },

    async deletePurchase(businessId, purchaseId) {
      const existing = await repo.getPurchase(businessId, purchaseId);
      if (!existing) throw new NotFoundError("Purchase not found");
      const st = (existing.status ?? "").toLowerCase();
      if (st === "deleted") return;
      const now = new Date().toISOString();
      await repo.softDeletePurchase(businessId, purchaseId);
      await repo.insertLifecycleEvent({
        id: randomUUID(), purchase_id: purchaseId, business_id: businessId,
        from_status: normalizePurchaseStatus(existing.status),
        to_status: "cancelled", actor_id: null, actor_name: null,
        notes: "Purchase soft-deleted", metadata: JSON.stringify({ soft_deleted: true }),
        created_at: now,
      });
    },

    async patchPayment(businessId, purchaseId, body) {
      const data = validateWithSchema(paymentPatchSchema, body);
      const existing = await repo.getPurchase(businessId, purchaseId);
      if (!existing) throw new NotFoundError("Purchase not found");
      const st = (existing.status ?? "").toLowerCase();
      if (st === "deleted") throw new NotFoundError("Purchase not found");
      if (st === "cancelled" || st === "draft") throw new PurchaseStateConflictError("PAYMENT_NOT_ALLOWED", "Payment not allowed for this purchase state");
      const totalVal = d(existing.total_amount);
      const paid = Math.min(Math.max(d(data.paid_amount), 0), totalVal);
      const paidAt = data.paid_at ?? new Date().toISOString();
      await repo.updatePurchasePayment(businessId, purchaseId, money(paid), paidAt);
      const derived = computePaymentStatus(existing.status, totalVal, paid, existing.due_date);
      if (!["draft", "cancelled"].includes(st)) {
        await repo.updatePurchase(businessId, purchaseId, { status: derived, updated_at: paidAt });
      }
      return this.getPurchase(businessId, purchaseId);
    },

    async markPaid(businessId, purchaseId, body) {
      const data = validateWithSchema(markPaidSchema, body);
      const existing = await repo.getPurchase(businessId, purchaseId);
      if (!existing) throw new NotFoundError("Purchase not found");
      const st = (existing.status ?? "").toLowerCase();
      if (st === "deleted") throw new NotFoundError("Purchase not found");
      if (st === "cancelled" || st === "draft") throw new PurchaseStateConflictError("PAYMENT_NOT_ALLOWED", "Payment not allowed for this purchase state");
      const totalVal = d(existing.total_amount);
      const newPaid = data.paid_amount !== null && data.paid_amount !== undefined
        ? Math.min(Math.max(d(data.paid_amount), 0), totalVal) : totalVal;
      const paidAt = data.paid_at ?? new Date().toISOString();
      await repo.updatePurchasePayment(businessId, purchaseId, money(newPaid), paidAt);
      const derived = computePaymentStatus(existing.status, totalVal, newPaid, existing.due_date);
      await repo.updatePurchase(businessId, purchaseId, { status: derived, updated_at: paidAt });
      return this.getPurchase(businessId, purchaseId);
    },

    async cancelPurchase(businessId, purchaseId) {
      const existing = await repo.getPurchase(businessId, purchaseId);
      if (!existing) throw new NotFoundError("Purchase not found");
      const st = (existing.status ?? "").toLowerCase();
      if (st === "deleted") throw new NotFoundError("Purchase not found");
      const now = new Date().toISOString();
      await repo.cancelPurchase(businessId, purchaseId);
      await repo.insertLifecycleEvent({
        id: randomUUID(), purchase_id: purchaseId, business_id: businessId,
        from_status: normalizePurchaseStatus(existing.status),
        to_status: "cancelled", actor_id: null, actor_name: null,
        notes: "Purchase cancelled", metadata: "{}", created_at: now,
      });
      return this.getPurchase(businessId, purchaseId);
    },

    async listLifecycleEvents(businessId, purchaseId) {
      const existing = await repo.getPurchase(businessId, purchaseId);
      if (!existing) throw new NotFoundError("Purchase not found");
      const rows = await repo.listLifecycleEventsByPurchase(purchaseId);
      return rows.map((r) => ({
        id: r.id, purchase_id: r.purchase_id, business_id: r.business_id,
        from_status: r.from_status, to_status: r.to_status,
        actor_id: r.actor_id, actor_name: r.actor_name,
        notes: r.notes, metadata: JSON.parse(r.metadata || "{}"),
        created_at: r.created_at,
      }));
    },

    async transitionLifecycle(businessId, purchaseId, body) {
      const data = validateWithSchema(lifecycleTransitionSchema, body);
      const existing = await repo.getPurchase(businessId, purchaseId);
      if (!existing) throw new NotFoundError("Purchase not found");
      await repo.insertLifecycleEvent({
        id: randomUUID(), purchase_id: purchaseId, business_id: businessId,
        from_status: normalizePurchaseStatus(existing.status),
        to_status: data.to_status, actor_id: null, actor_name: null,
        notes: data.notes ?? null,
        metadata: JSON.stringify(data.metadata || {}),
        created_at: new Date().toISOString(),
      });
    },

    // --- Delivery pipeline ---
    async getDeliveryPipeline(businessId) {
      const rows = await repo.getDeliveryPipeline(businessId);
      const out: DeliveryPipelineOut = { pending: 0, dispatched: 0, in_transit: 0, arrived: 0, staff_verifying: 0, staff_verified: 0, partial: 0, stock_committed: 0, cancelled: 0, total_pending_amount: 0 };
      for (const r of rows) {
        const k = (r.delivery_status || "pending").toLowerCase();
        if (k in out) (out as Record<string, number>)[k] = r.cnt;
      }
      out.total_pending_amount = await repo.getDeliveryPendingAmount(businessId);
      return out;
    },

    async purchaseDispatch(businessId, purchaseId, body) {
      const data: DispatchIn = validateWithSchema(dispatchSchema, body);
      const existing = await repo.getPurchase(businessId, purchaseId);
      if (!existing) throw new NotFoundError("Purchase not found");
      const st = (existing.status || "").toLowerCase();
      if (st === "deleted" || st === "cancelled") throw new Error("Cannot dispatch a cancelled purchase");
      const cur = (existing.delivery_status || "pending").toLowerCase();
      if (cur === "stock_committed" || cur === "cancelled") throw new Error(`Delivery is already ${cur.replace("_", " ")}`);
      if (cur !== "pending") throw new Error(`Cannot dispatch while delivery status is ${cur.replace("_", " ")}`);
      const now = new Date().toISOString();
      const fields: Record<string, unknown> = {
        delivery_status: data.mark_in_transit ? "in_transit" : "dispatched",
        dispatched_at: now, updated_at: now,
      };
      if (data.truck_number) fields.truck_number = data.truck_number.trim();
      if (data.driver_contact) fields.driver_contact = data.driver_contact.trim();
      if (data.dispatch_note) fields.dispatch_note = data.dispatch_note.trim();
      await repo.updatePurchaseFields(businessId, purchaseId, fields);
      return this.getPurchase(businessId, purchaseId);
    },

    async purchaseArrive(businessId, purchaseId, body) {
      const data: ArriveIn = validateWithSchema(arriveSchema, body);
      const existing = await repo.getPurchase(businessId, purchaseId);
      if (!existing) throw new NotFoundError("Purchase not found");
      const st = (existing.status || "").toLowerCase();
      if (st === "deleted" || st === "cancelled") throw new Error("Cannot mark arrival for a cancelled purchase");
      const cur = (existing.delivery_status || "pending").toLowerCase();
      if (cur === "stock_committed" || cur === "cancelled") throw new Error(`Delivery is already ${cur.replace("_", " ")}`);
      if (!["pending", "dispatched", "in_transit"].includes(cur)) throw new Error(`Cannot mark arrival while delivery status is ${cur.replace("_", " ")}`);
      const now = new Date().toISOString();
      const fields: Record<string, unknown> = {
        delivery_status: "arrived", arrived_at: now, updated_at: now,
      };
      if (data.truck_number) fields.truck_number = data.truck_number.trim();
      if (data.driver_contact) fields.driver_contact = data.driver_contact.trim();
      const arrivalLines: string[] = [];
      if (data.notes) arrivalLines.push(data.notes.trim());
      if (data.damage_qty && data.damage_qty > 0) arrivalLines.push(`Damage qty: ${data.damage_qty}`);
      if (data.missing_qty && data.missing_qty > 0) arrivalLines.push(`Missing qty: ${data.missing_qty}`);
      if (data.broker_confirmed === true) arrivalLines.push("Broker confirmed: yes");
      if (arrivalLines.length > 0) {
        const existingNotes = existing.delivery_notes || "";
        fields.delivery_notes = existingNotes ? `${existingNotes}\n${arrivalLines.join("\n")}` : arrivalLines.join("\n");
      }
      await repo.updatePurchaseFields(businessId, purchaseId, fields);
      return this.getPurchase(businessId, purchaseId);
    },

    async purchaseVerify(businessId, purchaseId, body) {
      const data: VerifyIn = validateWithSchema(verifySchema, body);
      const existing = await repo.getPurchase(businessId, purchaseId);
      if (!existing) throw new NotFoundError("Purchase not found");
      const st = (existing.status || "").toLowerCase();
      if (st === "deleted" || st === "cancelled") throw new Error("Cannot verify a cancelled purchase");
      const cur = (existing.delivery_status || "pending").toLowerCase();
      if (cur === "stock_committed" || cur === "cancelled") throw new Error(`Delivery is already ${cur.replace("_", " ")}`);
      if (!["arrived", "staff_verifying"].includes(cur)) throw new Error(`Cannot verify while delivery status is ${cur.replace("_", " ")}`);
      const now = new Date().toISOString();
      let totalReceived = 0;
      let totalDamaged = 0;
      let totalReturn = 0;
      let totalOrdered = 0;
      let short = false;
      for (const line of data.lines) {
        if (line.received_qty < line.damaged_qty + line.return_qty) {
          throw new Error("received_qty must be >= damaged_qty + return_qty");
        }
        await repo.updateLineVerification(line.line_id, line.received_qty, line.damaged_qty, line.return_qty);
        totalReceived += line.received_qty;
        totalDamaged += line.damaged_qty;
        totalReturn += line.return_qty;
        totalOrdered += line.received_qty + line.damaged_qty + line.return_qty;
        if (line.received_qty < (line.received_qty + line.damaged_qty + line.return_qty)) {
          short = true;
        }
      }
      const vnote = `Verified by staff | received=${totalReceived} damaged=${totalDamaged} return=${totalReturn}`;
      const finalNote = data.notes ? `${vnote} | notes=${data.notes.trim()}` : vnote;
      const existingNotes = existing.delivery_notes || "";
      const deliveryNotes = existingNotes ? `${existingNotes}\n${finalNote}` : finalNote;
      const fields: Record<string, unknown> = {
        delivery_status: short ? "partial" : "staff_verified",
        staff_verified_at: now,
        staff_verified_by: null,
        staff_verified_by_name: null,
        staff_verified_qty: totalReceived,
        delivery_notes: deliveryNotes,
        updated_at: now,
      };
      await repo.updatePurchaseFields(businessId, purchaseId, fields);
      return this.getPurchase(businessId, purchaseId);
    },

    async patchDelivery(businessId, purchaseId, body) {
      const data: DeliveryPatchIn = validateWithSchema(deliveryPatchSchema, body);
      const existing = await repo.getPurchase(businessId, purchaseId);
      if (!existing) throw new NotFoundError("Purchase not found");
      const st = (existing.status || "").toLowerCase();
      if (st === "deleted") throw new NotFoundError("Purchase not found");
      if (st === "cancelled") throw new Error("Delivery changes are not allowed for cancelled purchases");
      if (data.is_delivered) throw new Error("Use commit-stock after staff verification to add stock");
      const wasDelivered = existing.is_delivered || (existing.delivery_status || "").toLowerCase() === "stock_committed";
      if (wasDelivered && (existing.delivery_status || "").toLowerCase() !== "stock_committed") throw new Error("Only committed deliveries can be reverted to pending");
      const now = new Date().toISOString();
      const fields: Record<string, unknown> = {
        is_delivered: false, delivered_at: null,
        delivery_status: "pending", stock_committed_at: null,
        delivered_qty_committed: null, arrived_at: null,
        staff_verified_at: null, staff_verified_by: null,
        staff_verified_by_name: null, staff_verified_qty: null,
        updated_at: now,
      };
      if (data.delivery_notes !== undefined) {
        fields.delivery_notes = data.delivery_notes?.trim() || null;
      }
      await repo.updatePurchaseFields(businessId, purchaseId, fields);
      return this.getPurchase(businessId, purchaseId);
    },

    async commitStock(businessId, purchaseId) {
      const existing = await repo.getPurchase(businessId, purchaseId);
      if (!existing) throw new NotFoundError("Purchase not found");
      throw new Error("Stock commit not yet implemented — depends on Stock module");
    },

    async autoCommitStock(businessId, purchaseId) {
      try {
        return await this.commitStock(businessId, purchaseId);
      } catch {
        return null;
      }
    },
  };
}
