import type { Request, Response } from "express";
import { queryOne, queryMany } from "../repositories/sql";
import { sql } from "../config/database";

type PublicItemRow = {
  id: string;
  name: string;
  item_code: string | null;
  barcode: string | null;
  current_stock: number | null;
  reorder_level: number | null;
  stock_unit: string | null;
  default_unit: string | null;
  selling_unit: string | null;
  rack_location: string | null;
  opening_stock_qty: number | null;
  category_name: string | null;
  last_stock_updated_at: Date | null;
  last_purchase_at: Date | null;
  last_purchase_price: number | null;
  last_line_qty: number | null;
  last_line_unit: string | null;
  last_supplier_id: string | null;
  business_id: string;
};

type BusinessRow = { id: string };

type PhysicalCountRow = { counted_qty: number | null; counted_at: Date | null };

type SupplierRow = { name: string };

type DeliveredQtyRow = { catalog_item_id: string; qty: number | null };

export class PublicController {
  async getItemByToken(req: Request, res: Response) {
    const { token } = req.params;
    if (!token || token.length > 64) {
      res.status(404).json({ error: "Item not found" });
      return;
    }
    const item = await queryOne<PublicItemRow>(
      null!,
      `SELECT ci.[id], ci.[name], ci.[item_code], ci.[barcode],
              ci.[current_stock], ci.[reorder_level],
              ISNULL(ci.[stock_unit], ISNULL(ci.[default_unit], ci.[selling_unit])) AS stock_unit,
              ci.[default_unit], ci.[selling_unit], ci.[rack_location],
              ci.[opening_stock_qty], ic.[name] AS category_name,
              ci.[last_stock_updated_at], ci.[last_purchase_at],
              ci.[last_purchase_price], ci.[last_line_qty], ci.[last_line_unit],
              ci.[last_supplier_id], ci.[business_id]
       FROM catalog_items ci
       LEFT JOIN item_categories ic ON ic.[id] = ci.[category_id]
       WHERE ci.[public_token] = @token AND ci.[deleted_at] IS NULL`,
      [{ name: "token", type: sql.NVarChar(64), value: token }],
    );
    if (!item) {
      res.status(404).json({ error: "Item not found" });
      return;
    }

    const [physCount, deliveredRows, supplier] = await Promise.all([
      queryOne<PhysicalCountRow>(
        null!,
        `SELECT TOP 1 [counted_qty], [counted_at]
         FROM stock_physical_counts
         WHERE [business_id] = @businessId AND [item_id] = @itemId
         ORDER BY [counted_at] DESC`,
        [
          { name: "businessId", type: sql.UniqueIdentifier, value: item.business_id },
          { name: "itemId", type: sql.UniqueIdentifier, value: item.id },
        ],
      ),
      queryMany<DeliveredQtyRow>(
        null!,
        `SELECT tpl.[catalog_item_id],
                CAST(COALESCE(SUM(COALESCE(tpl.[qty_in_stock_unit], tpl.[qty], 0)), 0) AS FLOAT) AS qty
         FROM trade_purchase_lines tpl
         INNER JOIN trade_purchases tp ON tp.[id] = tpl.[trade_purchase_id]
         WHERE tp.[business_id] = @businessId
           AND tp.[status] NOT IN (N'cancelled', N'deleted')
           AND tp.[is_delivered] = 1
           AND tpl.[catalog_item_id] = @itemId
         GROUP BY tpl.[catalog_item_id]`,
        [
          { name: "businessId", type: sql.UniqueIdentifier, value: item.business_id },
          { name: "itemId", type: sql.UniqueIdentifier, value: item.id },
        ],
      ),
      item.last_supplier_id
        ? queryOne<SupplierRow>(
            null!,
            `SELECT [name] FROM suppliers WHERE [id] = @supplierId`,
            [{ name: "supplierId", type: sql.UniqueIdentifier, value: item.last_supplier_id }],
          )
        : Promise.resolve(null),
    ]);

    const currentStock = Number(item.current_stock ?? 0);
    const reorder = Number(item.reorder_level ?? 0);
    const unit = item.stock_unit ?? item.default_unit ?? item.selling_unit ?? "unit";
    const status =
      currentStock <= 0 ? "out_of_stock"
      : currentStock <= reorder ? "low_stock"
      : "in_stock";
    const deliveredQty = deliveredRows.length > 0 ? Number(deliveredRows[0].qty ?? 0) : 0;

    const payload = {
      name: item.name,
      category: item.category_name,
      item_code: item.item_code,
      barcode: item.barcode,
      current_stock: currentStock,
      opening_stock_qty: Number(item.opening_stock_qty ?? 0),
      total_delivered_qty: deliveredQty,
      stock_unit: unit,
      status,
      rack_location: item.rack_location,
      last_stock_updated_at: item.last_stock_updated_at?.toISOString() ?? null,
      physical_stock_qty: physCount ? Number(physCount.counted_qty ?? 0) : null,
      physical_stock_counted_at: physCount?.counted_at?.toISOString() ?? null,
      last_purchase_date: item.last_purchase_at?.toISOString() ?? null,
      last_purchase_rate: item.last_purchase_price ? Number(item.last_purchase_price) : null,
      last_purchase_qty: item.last_line_qty ? Number(item.last_line_qty) : null,
      last_purchase_unit: item.last_line_unit ?? unit,
      supplier_name: supplier?.name ?? null,
    };

    res.set("Cache-Control", "public, max-age=60");
    res.json(payload);
  }

  async getItemByBarcode(req: Request, res: Response) {
    const { barcode, business } = req.query as Record<string, string>;
    if (!barcode || !business) {
      res.status(400).json({ error: "barcode and business are required" });
      return;
    }
    const businessId = await this._resolveBusinessId(business);
    if (!businessId) {
      res.status(404).json({ error: "Business not found" });
      return;
    }
    const item = await queryOne<PublicItemRow>(
      null!,
      `SELECT ci.[id], ci.[name], ci.[item_code], ci.[barcode],
              ci.[current_stock], ci.[reorder_level],
              ISNULL(ci.[stock_unit], ISNULL(ci.[default_unit], ci.[selling_unit])) AS stock_unit,
              ci.[default_unit], ci.[selling_unit], ci.[rack_location],
              ci.[opening_stock_qty], ic.[name] AS category_name,
              ci.[last_stock_updated_at], ci.[last_purchase_at],
              ci.[last_purchase_price], ci.[last_line_qty], ci.[last_line_unit],
              ci.[last_supplier_id], ci.[business_id]
       FROM catalog_items ci
       LEFT JOIN item_categories ic ON ic.[id] = ci.[category_id]
       WHERE ci.[barcode] = @barcode AND ci.[business_id] = @businessId AND ci.[deleted_at] IS NULL`,
      [
        { name: "barcode", type: sql.NVarChar(255), value: barcode },
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
      ],
    );
    if (!item) {
      res.status(404).json({ error: "Item not found" });
      return;
    }
    const physCount = await queryOne<PhysicalCountRow>(
      null!,
      `SELECT TOP 1 [counted_qty], [counted_at]
       FROM stock_physical_counts
       WHERE [business_id] = @businessId AND [item_id] = @itemId
       ORDER BY [counted_at] DESC`,
      [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "itemId", type: sql.UniqueIdentifier, value: item.id },
      ],
    );
    const deliveredRows = await queryMany<DeliveredQtyRow>(
      null!,
      `SELECT tpl.[catalog_item_id],
              CAST(COALESCE(SUM(COALESCE(tpl.[qty_in_stock_unit], tpl.[qty], 0)), 0) AS FLOAT) AS qty
       FROM trade_purchase_lines tpl
       INNER JOIN trade_purchases tp ON tp.[id] = tpl.[trade_purchase_id]
       WHERE tp.[business_id] = @businessId
         AND tp.[status] NOT IN (N'cancelled', N'deleted')
         AND tp.[is_delivered] = 1
         AND tpl.[catalog_item_id] = @itemId
       GROUP BY tpl.[catalog_item_id]`,
      [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "itemId", type: sql.UniqueIdentifier, value: item.id },
      ],
    );
    const supplier = item.last_supplier_id
      ? await queryOne<SupplierRow>(
          null!,
          `SELECT [name] FROM suppliers WHERE [id] = @supplierId`,
          [{ name: "supplierId", type: sql.UniqueIdentifier, value: item.last_supplier_id }],
        )
      : null;
    const currentStock = Number(item.current_stock ?? 0);
    const reorder = Number(item.reorder_level ?? 0);
    const unit = item.stock_unit ?? item.default_unit ?? item.selling_unit ?? "unit";
    const status =
      currentStock <= 0 ? "out_of_stock"
      : currentStock <= reorder ? "low_stock"
      : "in_stock";
    res.json({
      name: item.name,
      category: item.category_name,
      item_code: item.item_code,
      barcode: item.barcode,
      current_stock: currentStock,
      opening_stock_qty: Number(item.opening_stock_qty ?? 0),
      total_delivered_qty: deliveredRows.length > 0 ? Number(deliveredRows[0].qty ?? 0) : 0,
      stock_unit: unit,
      status,
      rack_location: item.rack_location,
      last_stock_updated_at: item.last_stock_updated_at?.toISOString() ?? null,
      physical_stock_qty: physCount ? Number(physCount.counted_qty ?? 0) : null,
      physical_stock_counted_at: physCount?.counted_at?.toISOString() ?? null,
      last_purchase_date: item.last_purchase_at?.toISOString() ?? null,
      last_purchase_rate: item.last_purchase_price ? Number(item.last_purchase_price) : null,
      last_purchase_qty: item.last_line_qty ? Number(item.last_line_qty) : null,
      last_purchase_unit: item.last_line_unit ?? unit,
      supplier_name: supplier?.name ?? null,
    });
  }

  private async _resolveBusinessId(business: string): Promise<string | null> {
    const byId = await queryOne<BusinessRow>(
      null!,
      `SELECT [id] FROM businesses WHERE [id] = @id OR LOWER([name]) = @slug`,
      [
        { name: "id", type: sql.UniqueIdentifier, value: business },
        { name: "slug", type: sql.NVarChar(255), value: business.toLowerCase() },
      ],
    );
    return byId?.id ?? null;
  }
}
