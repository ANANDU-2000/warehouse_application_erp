import type { ExportsRepository } from "../repositories/exports.repository";
import type { BusinessesRepository } from "../repositories/businesses.repository";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import archiver from "archiver";
const arcFn = archiver as unknown as (format: string, opts?: Record<string, unknown>) => archiver.Archiver;
import { Readable } from "node:stream";

type ExportLineRow = {
  trade_purchase_id: string;
  catalog_item_id: string | null;
  item_name: string;
  qty: number | null;
  unit: string | null;
  unit_type: string | null;
  amount: number | null;
  selling: number | null;
};

export type ExportsServiceDeps = {
  exportsRepo: ExportsRepository;
  businessesRepo: BusinessesRepository;
};

export function createExportsService(deps: ExportsServiceDeps) {
  async function getBusinessName(businessId: string): Promise<string> {
    const name = await deps.businessesRepo.findById(businessId);
    return name?.name ?? "Business";
  }

  return {
    async exportJson(
      businessId: string,
      rangeDays: number,
    ): Promise<{
      filename: string;
      data: Record<string, unknown>;
    }> {
      const name = await getBusinessName(businessId);
      const dateTo = new Date().toISOString().slice(0, 10);
      const dateFrom = new Date(
        Date.now() - rangeDays * 86400000,
      )
        .toISOString()
        .slice(0, 10);
      const [purchases, catalog, suppliers, stockMovements] =
        await Promise.all([
          deps.exportsRepo.listPurchasesInRange(
            businessId,
            dateFrom,
            dateTo,
            2000,
          ),
          deps.exportsRepo.listCatalogForExport(businessId),
          deps.exportsRepo.listSuppliersForExport(businessId),
          deps.exportsRepo.listStockMovementsForExport(businessId, 500),
        ]);
      const purchaseIds = purchases
        .map((p) => p.id)
        .filter(Boolean) as string[];
      const lines =
        purchaseIds.length > 0
          ? await deps.exportsRepo.listLinesByPurchaseIds(purchaseIds)
          : [];
      const linesByPurchase: Record<string, unknown[]> = {};
      for (const l of lines) {
        if (!linesByPurchase[l.trade_purchase_id]) {
          linesByPurchase[l.trade_purchase_id] = [];
        }
        linesByPurchase[l.trade_purchase_id].push(l);
      }
      const purchasesWithLines = purchases.map((p) => ({
        ...p,
        lines: linesByPurchase[p.id] ?? [],
      }));
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      return {
        filename: `${name.replace(/\s+/g, "_").toLowerCase()}_backup_${today}.json`,
        data: {
          exported_at: new Date().toISOString(),
          business_id: businessId,
          range_days: rangeDays,
          catalog_items: catalog,
          suppliers,
          purchases: purchasesWithLines,
          stock_movements: stockMovements,
        },
      };
    },

    async exportStockXlsx(
      businessId: string,
    ): Promise<{ buffer: Buffer; filename: string }> {
      const name = await getBusinessName(businessId);
      const items = await deps.exportsRepo.listCatalogForExport(businessId);
      if (items.length === 0) {
        throw Object.assign(new Error("No catalog items found"), {
          status: 404,
        });
      }
      const wb = new ExcelJS.Workbook();
      wb.creator = "HEXA Purchase Assistant";
      const ws = wb.addWorksheet("Stock Inventory");
      ws.columns = [
        { header: "Item Code", key: "item_code", width: 18 },
        { header: "Item Name", key: "name", width: 35 },
        { header: "Category", key: "category_name", width: 18 },
        { header: "Subcategory", key: "subcategory_name", width: 18 },
        { header: "Supplier", key: "supplier_name", width: 22 },
        { header: "Unit", key: "stock_unit", width: 10 },
        { header: "Current Qty", key: "current_stock", width: 14 },
        { header: "Opening Qty", key: "opening_stock_qty", width: 14 },
        { header: "Reorder Level", key: "reorder_level", width: 14 },
        { header: "Barcode", key: "barcode", width: 20 },
      ];
      for (const item of items) {
        ws.addRow({
          item_code: item.item_code ?? "",
          name: item.name,
          category_name: item.category_name ?? "",
          subcategory_name: item.subcategory_name ?? "",
          supplier_name: item.supplier_name ?? "",
          stock_unit: item.stock_unit ?? "",
          current_stock: item.current_stock ?? 0,
          opening_stock_qty: item.opening_stock_qty ?? 0,
          reorder_level: item.reorder_level ?? 0,
          barcode: item.barcode ?? "",
        });
      }
      ws.getRow(1).font = { bold: true };
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const buf = (await wb.xlsx.writeBuffer()) as unknown as Buffer;
      return {
        buffer: buf,
        filename: `${name.replace(/\s+/g, "_").toLowerCase()}_stock_${today}.xlsx`,
      };
    },

    async exportPurchasesPdf(
      businessId: string,
    ): Promise<{ buffer: Buffer; filename: string }> {
      const name = await getBusinessName(businessId);
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const monthName = now.toLocaleString("en-US", { month: "long" });
      const totals = await deps.exportsRepo.getMonthPurchaseTotal(
        businessId,
        year,
        month,
      );
      const monthStart = `${year}-${String(month).padStart(2, "0")}-01`;
      const monthEnd = now.toISOString().slice(0, 10);
      const purchases = await deps.exportsRepo.listPurchasesInRange(
        businessId,
        monthStart,
        monthEnd,
        5000,
      );
      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 40, bottom: 40, left: 40, right: 40 },
      });
      const chunks: Buffer[] = [];
      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      const pdfPromise = new Promise<Buffer>((resolve) => {
        doc.on("end", () => resolve(Buffer.concat(chunks)));
      });
      const san = name.replace(/\s+/g, "_").toLowerCase();

      doc.fontSize(16).text(name, { align: "center" });
      doc.fontSize(12).text(`Purchase Summary — ${monthName} ${year}`, {
        align: "center",
      });
      doc.moveDown(0.5);
      doc.fontSize(10).text(`Generated: ${now.toISOString().slice(0, 10)}`, {
        align: "center",
      });
      doc.moveDown(1);

      doc.fontSize(11).text(`Total Purchases: ₹${Number(totals?.total_amount ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`);
      doc.text(`Total Deals: ${totals?.deals ?? 0}`);
      doc.moveDown(1);

      if (purchases.length > 0) {
        let y = doc.y;
        doc.fontSize(10).font("Helvetica-Bold");
        doc.text("Date", 40, y, { width: 70 });
        doc.text("Human ID", 115, y, { width: 80 });
        doc.text("Supplier", 200, y, { width: 120 });
        doc.text("Amount", 330, y, { width: 80, align: "right" });
        doc.text("Paid", 420, y, { width: 80, align: "right" });
        doc.moveDown(0.3);
        doc.font("Helvetica");
        for (const p of purchases) {
          const pd = p.purchase_date
            ? new Date(p.purchase_date).toISOString().slice(0, 10)
            : "";
          if (doc.y > 720) {
            doc.addPage();
          }
          doc.fontSize(8);
          doc.text(pd, 40, doc.y, { width: 70 });
          doc.text(p.human_id ?? "", 115, doc.y - 11.5, { width: 80 });
          doc.text(p.supplier_name ?? "", 200, doc.y - 11.5, { width: 120 });
          doc.text(
            `₹${Number(p.total_amount ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
            330,
            doc.y - 11.5,
            { width: 80, align: "right" },
          );
          doc.text(
            `₹${Number(p.paid_amount ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
            420,
            doc.y - 11.5,
            { width: 80, align: "right" },
          );
        }
      } else {
        doc.fontSize(10).text("No trade purchases found for this month.");
      }

      doc.end();
      const buffer = await pdfPromise;
      return {
        buffer,
        filename: `${san}_purchases_${year}-${String(month).padStart(2, "0")}.pdf`,
      };
    },

    async exportZip(
      businessId: string,
      rangePreset: string,
    ): Promise<{ stream: Readable; filename: string }> {
      const name = await getBusinessName(businessId);
      const now = new Date();
      const dateTo = now.toISOString().slice(0, 10);
      let dateFrom: string | null;
      if (rangePreset === "quarter") {
        dateFrom = new Date(now.getTime() - 89 * 86400000)
          .toISOString()
          .slice(0, 10);
      } else if (rangePreset === "all") {
        dateFrom = null;
      } else {
        dateFrom = new Date(now.getFullYear(), now.getMonth(), 1)
          .toISOString()
          .slice(0, 10);
      }

      const count = await deps.exportsRepo.countPurchasesInRange(
        businessId,
        dateFrom,
        dateTo,
      );
      if (count === 0) {
        throw Object.assign(
          new Error("No trade purchases found in the selected range"),
          { status: 404 },
        );
      }

      const [purchases, lines, stockXlsx] = await Promise.all([
        deps.exportsRepo.listPurchasesInRange(
          businessId,
          dateFrom,
          dateTo,
          5000,
        ),
        (async () => {
          const p = await deps.exportsRepo.listPurchasesInRange(
            businessId,
            dateFrom,
            dateTo,
            5000,
          );
          const ids = p.map((x) => x.id);
          return ids.length > 0
            ? deps.exportsRepo.listLinesByPurchaseIds(ids)
            : [];
        })(),
        this.exportStockXlsx(businessId),
      ]);

      const totalAmount = purchases.reduce(
        (s, p) => s + Number(p.total_amount ?? 0),
        0,
      );
      const totalPaid = purchases.reduce(
        (s, p) => s + Number(p.paid_amount ?? 0),
        0,
      );
      const san = name.replace(/\s+/g, "_").toLowerCase();
      const dTo = dateTo.replace(/-/g, "");

      const arc = arcFn("zip", { zlib: { level: 9 } });
      const stream = new Readable().wrap(arc);

      arc.append(
        `Backup Summary — ${name}\n` +
          `Exported: ${now.toISOString()}\n` +
          `Range: ${dateFrom ?? "beginning"} to ${dateTo}\n` +
          `Total Purchases: ₹${totalAmount.toFixed(2)}\n` +
          `Total Paid: ₹${totalPaid.toFixed(2)}\n` +
          `Balance: ₹${(totalAmount - totalPaid).toFixed(2)}\n` +
          `Deals: ${purchases.length}\n`,
        { name: "Summary.txt" },
      );
      arc.append(
        "HEXA Purchase Assistant — Backup Export\n" +
          `Business: ${name}\n` +
          `Exported: ${now.toISOString()}\n` +
          "This ZIP contains: purchases_summary.txt, purchase PDFs, stock XLSX, ledgers\n",
        { name: "README.txt" },
      );

      arc.append(stockXlsx.buffer, {
        name: `stock/${san}_stock_${dTo}.xlsx`,
      });

      const linesByPurchase: Record<string, ExportLineRow[]> = {};
      for (const l of lines) {
        if (!linesByPurchase[l.trade_purchase_id]) {
          linesByPurchase[l.trade_purchase_id] = [];
        }
        linesByPurchase[l.trade_purchase_id].push(l);
      }

      for (const p of purchases) {
        const plines = linesByPurchase[p.id] ?? [];
        const doc = new PDFDocument({ size: "A4" });
        const docChunks: Buffer[] = [];
        doc.on("data", (chunk: Buffer) => docChunks.push(chunk));
        const pdfDone = new Promise<void>((resolve) =>
          doc.on("end", () => resolve()),
        );
        doc.fontSize(14).text(name, { align: "center" });
        doc.moveDown(0.5);
        doc
          .fontSize(12)
          .text(`Purchase Order: ${p.human_id ?? p.id}`, {
            align: "center",
          });
        doc.moveDown(0.5);
        doc.fontSize(10).text(`Supplier: ${p.supplier_name ?? "N/A"}`);
        doc.text(
          `Date: ${p.purchase_date ? new Date(p.purchase_date).toISOString().slice(0, 10) : "N/A"}`,
        );
        doc.text(
          `Amount: ₹${Number(p.total_amount ?? 0).toFixed(2)}`,
        );
        doc.moveDown(0.5);
        doc.text("Items:", { underline: true });
        for (const l of plines) {
          doc.fontSize(9).text(
            `  ${l.item_name} — ${l.qty ?? 0} ${l.unit ?? ""} @ ₹${Number(l.amount ?? 0).toFixed(2)}`,
          );
        }
        doc.end();
        await pdfDone;
        arc.append(Buffer.concat(docChunks), {
          name: `orders/${p.human_id ?? p.id}.pdf`,
        });
      }

      arc.finalize();
      return {
        stream,
        filename: `${san}_backup_${dTo}.zip`,
      };
    },
  };
}

export type ExportsService = ReturnType<typeof createExportsService>;
