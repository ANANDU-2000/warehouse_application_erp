import PDFDocument from "pdfkit";
import * as https from "https";
import * as http from "http";
import type { BusinessRow } from "../repositories/types";
import type { PurchaseOut, PurchaseLineOut } from "../validation/purchases.schemas";

// ─── Constants ───────────────────────────────────────────
const BORDER_COLOR = "#CBD5E1";
const MUTED_COLOR = "#64748B";
const PDF_EMPTY = "-";
const PDF_INLINE_SEP = " | ";

// ─── Safe text helpers ───────────────────────────────────
function safePdfText(s: string): string {
  let r = s;
  r = r.replaceAll("₹", "Rs.");
  r = r.replaceAll("—", "-");
  r = r.replaceAll("–", "-");
  r = r.replaceAll("\u2013", "-");
  r = r.replaceAll("\u2014", "-");
  r = r.replaceAll("→", " to ");
  r = r.replaceAll("←", "<-");
  r = r.replaceAll("↔", "<->");
  r = r.replaceAll("·", PDF_INLINE_SEP);
  r = r.replaceAll("•", "-");
  r = r.replaceAll("…", "...");
  r = r.replaceAll("'", "'");
  r = r.replaceAll("'", "'");
  r = r.replaceAll('"', '"');
  r = r.replaceAll('"', '"');
  r = r.replaceAll("\uFFFD", "");
  r = r.replaceAll("\u0000", "");
  r = r.replaceAll(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "");
  r = r.replaceAll(/[ \t]+/g, " ").trim();
  return r;
}

function safePdfCell(s: string | null | undefined): string {
  const t = safePdfText(s ?? "");
  return t || PDF_EMPTY;
}

function emptyVal(s: string | null | undefined): string {
  const t = s?.trim();
  if (!t) return PDF_EMPTY;
  return safePdfText(t);
}

// ─── Number formatting ───────────────────────────────────
function inrPdf(n: number): string {
  const parts = n.toFixed(2).split(".");
  const intPart = parts[0];
  const lastThree = intPart.slice(-3);
  const rest = intPart.slice(0, -3);
  const formatted =
    rest
      ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree
      : lastThree;
  return `Rs. ${formatted}.${parts[1]}`;
}

function num0(n: number): string {
  if (n === Math.round(n)) return String(Math.round(n));
  return n.toFixed(2);
}

// ─── Amount in words (Indian numbering: lakh/crore) ──────
const units = [
  "", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
  "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
  "seventeen", "eighteen", "nineteen",
];
const tens = [
  "", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety",
];

function twoDigits(n: number): string {
  if (n < 20) return units[n];
  const t = Math.floor(n / 10);
  const u = n % 10;
  return u === 0 ? tens[t] : `${tens[t]} ${units[u]}`;
}

function belowThousand(n: number): string {
  if (n < 100) return twoDigits(n);
  const h = Math.floor(n / 100);
  const rest = n % 100;
  const hs = `${twoDigits(h)} hundred`;
  if (rest === 0) return hs;
  return `${hs} ${twoDigits(rest)}`;
}

function cap(s: string): string {
  if (!s) return s;
  return s[0].toUpperCase() + s.slice(1);
}

export function amountInWordsInr(amount: number): string {
  let n = Math.floor(amount);
  const paise = Math.round((amount - n) * 100);
  if (n === 0 && paise === 0) return "Zero rupees only";

  const parts: string[] = [];
  if (n >= 10000000) {
    parts.push(`${belowThousand(Math.floor(n / 10000000))} crore`);
    n %= 10000000;
  }
  if (n >= 100000) {
    parts.push(`${belowThousand(Math.floor(n / 100000))} lakh`);
    n %= 100000;
  }
  if (n >= 1000) {
    parts.push(`${belowThousand(Math.floor(n / 1000))} thousand`);
    n %= 1000;
  }
  if (n > 0) {
    parts.push(belowThousand(n));
  }
  let rupees = parts.join(" ").trim();
  if (!rupees) rupees = "zero";
  rupees = `${cap(rupees)} rupees`;
  if (paise > 0) {
    return `${rupees} and ${cap(twoDigits(paise))} paise only`;
  }
  return `${rupees} only`;
}

// ─── Logo fetch ──────────────────────────────────────────
export function tryFetchPdfLogo(
  url: string | null | undefined,
): Promise<Buffer | null> {
  const u = url?.trim();
  if (!u) return Promise.resolve(null);
  const lib = u.startsWith("https") ? https : http;
  return new Promise((resolve) => {
    const req = lib.get(
      u,
      { timeout: 4000 },
      (res) => {
        if (!res.statusCode || res.statusCode >= 400) {
          resolve(null);
          return;
        }
        const chunks: Buffer[] = [];
        let total = 0;
        res.on("data", (chunk: Buffer) => {
          total += chunk.length;
          if (total > 2 * 1024 * 1024) {
            req.destroy();
            resolve(null);
            return;
          }
          chunks.push(chunk);
        });
        res.on("end", () => {
          if (chunks.length === 0) resolve(null);
          else resolve(Buffer.concat(chunks));
        });
        res.on("error", () => resolve(null));
      },
    );
    req.on("error", () => resolve(null));
    req.on("timeout", () => {
      req.destroy();
      resolve(null);
    });
  });
}

// ─── Commission helpers ──────────────────────────────────
function commissionLabel(p: PurchaseOut): string {
  const mode = (p.commission_mode ?? "").trim().toLowerCase();
  if (mode === "percent" && p.commission_percent != null) {
    return `Broker commission (${num0(p.commission_percent)}%)`;
  }
  switch (mode) {
    case "flat_invoice":
      return "Broker commission (fixed, bill)";
    case "flat_kg":
      return "Broker commission (per kg × total kg)";
    case "flat_bag":
      return "Broker commission (per bag × qty)";
    case "flat_box":
      return "Broker commission (per box × qty)";
    case "flat_tin":
      return "Broker commission (per tin × qty)";
    default:
      return "Broker commission";
  }
}

function commissionInr(p: PurchaseOut): number {
  const mode = (p.commission_mode ?? "").trim().toLowerCase();
  let amt = p.commission_money ?? 0;
  if (mode === "percent" && p.commission_percent != null) {
    amt = (p.total_amount * p.commission_percent) / 100;
  }
  return amt;
}

function brokerCommissionBrokerBlockLine(p: PurchaseOut): string | null {
  if (commissionInr(p) <= 1e-9) return null;
  const mode = (p.commission_mode ?? "").trim().toLowerCase();
  if (mode === "percent" && p.commission_percent != null) {
    const c = p.commission_percent;
    return `Commission: ${c === Math.round(c) ? String(Math.round(c)) : c.toFixed(1)}%`;
  }
  const cm = p.commission_money;
  if (cm == null) return "Commission: (see totals)";
  switch (mode) {
    case "flat_invoice":
      return `Commission: ${inrPdf(cm)} (once on bill)`;
    case "flat_kg":
      return `Commission: ${inrPdf(cm)} / kg`;
    case "flat_bag":
      return `Commission: ${inrPdf(cm)} / bag`;
    case "flat_box":
      return `Commission: ${inrPdf(cm)} / box`;
    case "flat_tin":
      return `Commission: ${inrPdf(cm)} / tin`;
    default:
      return "Commission: (see totals)";
  }
}

// ─── Rate display ────────────────────────────────────────
function purchaseRateDim(l: PurchaseLineOut): string {
  return l.kg_per_unit && l.kg_per_unit > 0 ? "kg" : "unit";
}

function sellingRateDim(l: PurchaseLineOut): string {
  return l.kg_per_unit && l.kg_per_unit > 0 ? "kg" : "unit";
}

function pdfPurchaseRateStr(l: PurchaseLineOut): string {
  const r = l.purchase_rate ?? l.landing_cost;
  return `${inrPdf(r)}/${purchaseRateDim(l)}`;
}

function pdfSellingRateStr(l: PurchaseLineOut): string {
  const r = l.selling_rate ?? l.selling_cost;
  if (r == null || r === 0) return PDF_EMPTY;
  return `${inrPdf(r)}/${sellingRateDim(l)}`;
}

// ─── Line money (rollup) ─────────────────────────────────
function lineRollupMoney(l: PurchaseLineOut): number {
  return l.line_total ?? (l.qty * (l.landing_cost ?? 0));
}

function linesHaveItemLevelCharges(p: PurchaseOut): boolean {
  for (const l of p.lines ?? []) {
    if (
      (l.freight_value ?? 0) > 0 ||
      (l.delivered_rate ?? 0) > 0 ||
      (l.billty_rate ?? 0) > 0
    ) {
      return true;
    }
  }
  return false;
}

// ─── Weight total footer line ────────────────────────────
function purchasePdfTotalsWeightFooterLine(p: PurchaseOut): string | null {
  let kg = 0;
  let bags = 0;
  let boxes = 0;
  let tins = 0;
  for (const l of p.lines ?? []) {
    const u = (l.unit ?? "").trim().toLowerCase();
    if (u === "kg") {
      kg += l.qty * (l.kg_per_unit ?? 1);
    } else if (u === "bag" || u === "sack") {
      bags += l.qty;
      kg += l.qty * (l.kg_per_unit ?? 0);
    } else if (u === "box") {
      boxes += l.qty;
      kg += l.qty * (l.kg_per_unit ?? 0);
    } else if (u === "tin") {
      tins += l.qty;
      kg += l.qty * (l.kg_per_unit ?? 0);
    } else {
      kg += l.qty * (l.kg_per_unit ?? 0);
    }
  }
  const parts: string[] = [];
  if (bags > 1e-6) {
    parts.push(`${bags === Math.round(bags) ? Math.round(bags) : bags} ${bags === 1 ? "bag" : "bags"}`);
  }
  if (boxes > 1e-6) {
    parts.push(`${boxes === Math.round(boxes) ? Math.round(boxes) : boxes} ${boxes === 1 ? "box" : "boxes"}`);
  }
  if (tins > 1e-6) {
    parts.push(`${tins === Math.round(tins) ? Math.round(tins) : tins} ${tins === 1 ? "tin" : "tins"}`);
  }
  if (kg > 1e-6) {
    parts.push(`${num0(kg)} kg`);
  }
  if (!parts.length) return null;
  return `Total: ${parts.join(PDF_INLINE_SEP)}`;
}

// ─── Date formatting ─────────────────────────────────────
function fmtDate(d: string): string {
  const dt = new Date(d);
  return dt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function fmtDateTime(d: Date): string {
  return d.toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

// ─── Filename builder (§4) ───────────────────────────────
export function buildPurchasePdfFileName(
  p: PurchaseOut,
  fullInvoice = false,
): string {
  const d = new Date(p.purchase_date);
  const months = [
    "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
  ];
  const supplierName = p.supplier_name ?? "";
  const raw = supplierName.trim().toUpperCase();
  const cleaned = raw
    .replaceAll(/[^A-Z0-9]+/g, "_")
    .replaceAll(/_+/g, "_")
    .replace(/^_|_$/g, "");
  const slug = cleaned.length > 40 ? cleaned.slice(0, 40) : cleaned;

  if (!slug || slug === "PURCHASE") {
    const hid = (p.human_id ?? p.id).replaceAll(/[^\w\-]+/g, "_");
    const ymd = `${d.getFullYear()}_${String(d.getMonth() + 1).padStart(2, "0")}_${String(d.getDate()).padStart(2, "0")}`;
    return `PO_${hid}_${ymd}${fullInvoice ? "_full" : ""}.pdf`;
  }

  const datePart = `${String(d.getDate()).padStart(2, "0")}_${months[d.getMonth()]}_${d.getFullYear()}`;
  return `PO_${slug}_${datePart}${fullInvoice ? "_full" : ""}.pdf`;
}

// ─── Summary breakdown ───────────────────────────────────
type SummaryNumbers = {
  sumLineMoney: number;
  headerDiscountAmount: number;
  afterHeader: number;
  freight: number;
  commission: number;
};

function computeSummaryBreakdown(p: PurchaseOut): SummaryNumbers {
  let sumLineMoney = 0;
  const lineCharges = linesHaveItemLevelCharges(p);
  for (const l of p.lines ?? []) {
    sumLineMoney += lineRollupMoney(l);
  }
  const hd = p.discount ?? 0;
  const hdf = hd > 100 ? 100 : hd;
  const afterHeader = sumLineMoney * (1 - hdf / 100);
  const headerDiscountAmount = sumLineMoney - afterHeader;
  let freight = lineCharges ? 0 : (p.freight_amount ?? 0);
  if ((p.freight_type ?? "").toLowerCase() === "included") freight = 0;
  const commission = commissionInr(p);
  return {
    sumLineMoney,
    headerDiscountAmount,
    afterHeader,
    freight,
    commission,
  };
}

// ─── Main PDF builder ────────────────────────────────────
export async function buildPurchasePdfBuffer(
  purchase: PurchaseOut,
  business: BusinessRow,
  logo?: Buffer | null,
): Promise<Buffer> {
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 28, bottom: 28, left: 28, right: 28 },
    info: {
      Title: `Purchase Order - ${purchase.human_id}`,
      Author: business.name,
    },
  });

  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const pdfDone = new Promise<void>((resolve) => doc.on("end", () => resolve()));

  const summary = computeSummaryBreakdown(purchase);
  const lineCharges = linesHaveItemLevelCharges(purchase);
  const billAmt = lineCharges ? 0 : (purchase.billty_rate ?? 0);
  const delAmt = lineCharges ? 0 : (purchase.delivered_rate ?? 0);

  let cursorY = 28;

  function rulerLine(y: number, width = 535): void {
    doc
      .moveTo(28, y)
      .lineTo(28 + width, y)
      .strokeColor(BORDER_COLOR)
      .lineWidth(0.5)
      .stroke();
  }

  // ═══════════ HEADER (§2.1) ═══════════
  cursorY = 28;

  if (logo) {
    doc.image(logo, 28, cursorY, { width: 40, height: 40 });
  }

  // Left column
  const leftX = logo ? 76 : 28;
  const rightX = 320;

  // Title
  doc.font("Helvetica-Bold").fontSize(14).fillColor("#000000");
  doc.text("PURCHASE ORDER", leftX, logo ? cursorY + 2 : cursorY);

  if (logo) cursorY += 44;
  else cursorY += 18;

  // Business name
  const bizTitle = (business.branding_title ?? business.name ?? "Business").trim();
  if (bizTitle) {
    doc.font("Helvetica-Bold").fontSize(12).fillColor("#000000");
    doc.text(safePdfText(bizTitle), leftX, cursorY);
    cursorY += 16;
  }

  // Address
  if (business.address?.trim()) {
    doc.font("Helvetica").fontSize(9).fillColor(MUTED_COLOR);
    doc.text(safePdfText(business.address.trim()), leftX, cursorY, {
      lineGap: 1,
    });
    cursorY = doc.y + 2;
  }

  // Phone
  doc.font("Helvetica").fontSize(9).fillColor("#000000");
  doc.text(`Phone: ${emptyVal(business.phone)}`, leftX, cursorY);
  cursorY += 12;

  // GST
  if (business.gst_number?.trim()) {
    doc.text(`GSTIN: ${business.gst_number}`, leftX, cursorY);
    cursorY += 12;
  }

  // Email
  if (business.contact_email?.trim()) {
    doc.text(`Email: ${business.contact_email}`, leftX, cursorY);
    cursorY += 12;
  }

  // Right column (order details)
  let rY = logo ? 28 : 28;

  function rightLine(text: string, opts?: { fontSize?: number; muted?: boolean; bold?: boolean }): void {
    const fs = opts?.fontSize ?? 9;
    doc.font(opts?.bold ? "Helvetica-Bold" : "Helvetica");
    doc.fontSize(fs).fillColor(opts?.muted ? MUTED_COLOR : "#000000");
    doc.text(text, rightX, rY, { align: "right", width: 240 });
    rY = doc.y + 2;
  }

  rightLine("Order", { bold: true, fontSize: 11 });
  rightLine(`No. ${safePdfCell(purchase.human_id)}`, { fontSize: 9.5 });
  if (purchase.invoice_number?.trim()) {
    rightLine(`Bill / ref: ${purchase.invoice_number}`, { fontSize: 8.5, muted: true });
  }
  rightLine(`Date: ${fmtDate(purchase.purchase_date)}`, { fontSize: 9 });
  if (purchase.payment_days != null) {
    rightLine(`Payment days: ${purchase.payment_days}`, { fontSize: 9 });
  }
  if (purchase.due_date) {
    rightLine(`Due: ${fmtDate(purchase.due_date)}`, { fontSize: 9 });
  }
  rightLine(`Status: ${((purchase.status ?? "").replace(/_/g, " ") || "confirmed").toUpperCase()}`, { fontSize: 8, muted: true });

  cursorY = Math.max(cursorY, rY) + 4;

  // Header bottom border
  rulerLine(cursorY);
  cursorY += 10;

  // ═══════════ SUPPLIER / BROKER BLOCK (§2.2) ═══════════
  const commLine = brokerCommissionBrokerBlockLine(purchase);

  function cell(text: string, x: number, y: number, w: number, opts?: { fs?: number; bold?: boolean }): void {
    doc.font(opts?.bold ? "Helvetica-Bold" : "Helvetica");
    doc.fontSize(opts?.fs ?? 8).fillColor("#000000");
    doc.text(text, x + 4, y + 4, { width: w - 8 });
  }

  const blockTop = cursorY;
  const cellH = 80;
  const colW = 258;

  // Table outer border
  doc.rect(28, blockTop, colW + 1, cellH).strokeColor(BORDER_COLOR).lineWidth(0.5).stroke();
  doc.rect(28 + colW + 1, blockTop, colW + 1, cellH).strokeColor(BORDER_COLOR).lineWidth(0.5).stroke();

  // Header row
  doc.rect(28, blockTop, colW + 1, 16).strokeColor(BORDER_COLOR).lineWidth(0.5).stroke();
  doc.rect(28 + colW + 1, blockTop, colW + 1, 16).strokeColor(BORDER_COLOR).lineWidth(0.5).stroke();
  cell("Supplier", 28, blockTop, colW, { bold: true, fs: 8.5 });
  cell("Broker", 28 + colW + 1, blockTop, colW, { bold: true, fs: 8.5 });

  // Supplier data
  let sY = blockTop + 18;
  doc.font("Helvetica-Bold").fontSize(9).fillColor("#000000");
  doc.text(safePdfCell(purchase.supplier_name), 32, sY);
  sY += 12;
  doc.font("Helvetica").fontSize(8);
  doc.text(`Phone: ${emptyVal(purchase.supplier_phone)}`, 32, sY);
  sY += 10;
  if (purchase.supplier_address?.trim()) {
    doc.fontSize(8).fillColor(MUTED_COLOR);
    doc.text(safePdfText(purchase.supplier_address.trim()), 32, sY, {
      width: colW - 8,
    });
    sY = doc.y + 2;
  }
  doc.fillColor("#000000").fontSize(8);
  doc.text(`GSTIN: ${emptyVal(purchase.supplier_gst)}`, 32, sY);

  // Broker data
  let bY = blockTop + 18;
  doc.font("Helvetica-Bold").fontSize(9).fillColor("#000000");
  doc.text(safePdfCell(purchase.broker_name), 32 + colW + 1, bY);
  bY += 12;
  doc.font("Helvetica").fontSize(8);
  doc.text(`Phone: ${emptyVal(purchase.broker_phone)}`, 32 + colW + 1, bY);
  bY += 10;
  if (commLine) {
    doc.text(commLine, 32 + colW + 1, bY);
    bY += 10;
  }
  if (purchase.broker_location?.trim()) {
    doc.fontSize(8).fillColor(MUTED_COLOR);
    doc.text(safePdfText(purchase.broker_location.trim()), 32 + colW + 1, bY, {
      lineGap: 1.2,
      width: colW - 8,
    });
  }

  cursorY = blockTop + cellH + 8;

  // ═══════════ LINE ITEMS TABLE (§2.3) ═══════════
  const tableLeft = 28;
  const colDefs = [
    { width: 150, align: "left" as const },   // Item
    { width: 34, align: "right" as const },    // Qty
    { width: 28, align: "center" as const },   // Unit
    { width: 54, align: "right" as const },    // P Rate
    { width: 54, align: "right" as const },    // S Rate
    { width: 46, align: "right" as const },    // Total
  ];

  function drawTableRow(
    cells: string[],
    y: number,
    opts?: { header?: boolean; maxLines?: number },
  ): number {
    const rowH = opts?.header ? 14 : 18;
    let x = tableLeft;
    doc.font(opts?.header ? "Helvetica-Bold" : "Helvetica");
    for (let i = 0; i < cells.length; i++) {
      const col = colDefs[i];
      const fs = opts?.header ? 6.4 : i === 3 || i === 4 ? 5.9 : i === 5 ? 6.1 : 6.2;
      doc.fontSize(fs).fillColor("#000000");
      doc.rect(x, y, col.width, rowH).strokeColor(BORDER_COLOR).lineWidth(0.4).stroke();
      const pad = 3;
      if (i === 0) {
        doc.text(cells[i], x + pad, y + pad, {
          width: col.width - pad * 2,
          align: col.align,
          lineGap: 1.1,
        });
      } else {
        doc.text(cells[i], x + pad, y + pad, {
          width: col.width - pad * 2,
          align: col.align,
        });
      }
      x += col.width;
    }
    return y + rowH;
  }

  const lines = purchase.lines ?? [];
  cursorY = drawTableRow(
    ["Item", "Qty", "Unit", "P Rate", "S Rate", "Total"],
    cursorY,
    { header: true },
  );

  for (const l of lines) {
    cursorY = drawTableRow(
      [
        safePdfText(l.item_name),
        String(l.qty),
        safePdfText(l.unit.trim()),
        pdfPurchaseRateStr(l),
        pdfSellingRateStr(l),
        inrPdf(lineRollupMoney(l)),
      ],
      cursorY,
    );
  }

  cursorY += 8;

  // ═══════════ SUMMARY BLOCK (§2.4) ═══════════
  function summaryRow(label: string, value: string, opts?: { bold?: boolean }): void {
    const lfs = opts?.bold ? 10 : 8.5;
    const vfs = opts?.bold ? 11 : 8.5;
    doc.font(opts?.bold ? "Helvetica-Bold" : "Helvetica");
    doc.fontSize(lfs).fillColor("#000000");
    doc.text(label, 300, cursorY, { width: 200, align: "right" });
    doc.font(opts?.bold ? "Helvetica-Bold" : "Helvetica");
    doc.fontSize(vfs).fillColor("#000000");
    doc.text(value, 435, cursorY, { width: 100, align: "right" });
    cursorY += 14;
  }

  summaryRow("Subtotal (incl. line tax)", inrPdf(summary.sumLineMoney));
  if (summary.headerDiscountAmount > 0.001) {
    summaryRow("Header discount", `- ${inrPdf(summary.headerDiscountAmount)}`);
  }
  summaryRow("Net after discount", inrPdf(summary.afterHeader));
  if (summary.freight > 0) {
    summaryRow("Freight", inrPdf(summary.freight));
  }
  if (summary.commission > 0) {
    summaryRow(commissionLabel(purchase), inrPdf(summary.commission));
  }
  if (delAmt > 0) {
    summaryRow("Delivered / other", inrPdf(delAmt));
  }
  if (billAmt > 0) {
    summaryRow("Billty / charges", inrPdf(billAmt));
  }

  cursorY += 4;

  // FINAL TOTAL
  doc.font("Helvetica-Bold").fontSize(10).fillColor("#000000");
  doc.text("FINAL TOTAL", 300, cursorY, { width: 200, align: "right" });
  doc.font("Helvetica-Bold").fontSize(11).fillColor("#000000");
  doc.text(inrPdf(purchase.total_amount), 435, cursorY, { width: 100, align: "right" });
  cursorY += 16;

  // Mismatch note
  const recomputedTotal =
    summary.afterHeader +
    summary.freight +
    summary.commission +
    delAmt +
    billAmt;
  const diff = Math.abs(recomputedTotal - purchase.total_amount);
  if (diff > 0.02) {
    doc.font("Helvetica").fontSize(6.5).fillColor(MUTED_COLOR);
    doc.text(
      "Note: Recomputed total does not match stored total; FINAL TOTAL is the server value.",
      200,
      cursorY,
      { width: 335, align: "right" },
    );
    cursorY += 10;
  }

  cursorY += 4;

  // ═══════════ FOOTER (§2.5) ═══════════
  rulerLine(cursorY);
  cursorY += 6;

  // Generated timestamp
  doc.font("Helvetica").fontSize(7.5).fillColor(MUTED_COLOR);
  doc.text(`Generated: ${fmtDateTime(new Date())}`, 28, cursorY);
  cursorY += 10;

  if (purchase.created_by_name?.trim()) {
    doc.text(`Created by: ${safePdfText(purchase.created_by_name.trim())}`, 28, cursorY);
    cursorY += 10;
  }

  // Amount in words
  doc.font("Helvetica").fontSize(8.5).fillColor("#000000");
  doc.text(`Amount in words: ${amountInWordsInr(purchase.total_amount)}`, 28, cursorY, {
    lineGap: 1.25,
  });
  cursorY = doc.y + 4;

  // Weight total
  const wLine = purchasePdfTotalsWeightFooterLine(purchase);
  if (wLine) {
    doc.fontSize(8.5).fillColor("#000000");
    doc.text(wLine, 28, cursorY, { lineGap: 1.2 });
    cursorY = doc.y + 4;
  }

  // Reference
  if (purchase.invoice_number?.trim()) {
    doc.fontSize(8).fillColor(MUTED_COLOR);
    doc.text(`Reference: ${purchase.invoice_number}`, 28, cursorY);
    cursorY += 10;
  }

  cursorY += 4;

  // Signature block
  const sigTop = cursorY;

  // Left: Received / verified
  doc.font("Helvetica").fontSize(8).fillColor(MUTED_COLOR);
  doc.text("Received / verified", 28, sigTop);
  doc
    .moveTo(28, sigTop + 20)
    .lineTo(148, sigTop + 20)
    .strokeColor(BORDER_COLOR)
    .lineWidth(0.5)
    .stroke();

  // Right: For business
  const bizDisplay = (business.branding_title ?? business.name ?? "Business").trim() || "Business";
  doc.font("Helvetica-Bold").fontSize(8.5).fillColor("#000000");
  doc.text(`For ${safePdfText(bizDisplay)}`, 28 + 260, sigTop, { align: "right", width: 275 });
  doc.font("Helvetica").fontSize(8).fillColor(MUTED_COLOR);
  doc.text("Authorised signatory", 28 + 260, sigTop + 20, { align: "right", width: 275 });
  doc.fontSize(7.5);
  doc.text("(stamp)", 28 + 260, sigTop + 32, { align: "right", width: 275 });

  doc.end();
  await pdfDone;
  return Buffer.concat(chunks);
}
