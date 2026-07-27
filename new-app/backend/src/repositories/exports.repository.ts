import { sql } from "../config/database";
import { queryMany, queryOne, type SqlClient } from "./sql";

type ExportPurchaseRow = {
  id: string;
  human_id: string | null;
  supplier_name: string | null;
  purchase_date: Date | null;
  total_amount: number | null;
  paid_amount: number | null;
  delivery_status: string | null;
  notes: string | null;
};

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

type ExportCatalogRow = {
  id: string;
  name: string;
  item_code: string | null;
  barcode: string | null;
  category_name: string | null;
  subcategory_name: string | null;
  current_stock: number | null;
  reorder_level: number | null;
  stock_unit: string | null;
  opening_stock_qty: number | null;
  supplier_name: string | null;
};

type ExportSupplierRow = {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  contact_person: string | null;
};

type ExportMovementRow = {
  movement_kind: string;
  delta_qty: number | null;
  qty_before: number | null;
  qty_after: number | null;
  stock_unit: string | null;
  reason: string | null;
  created_at: Date;
};

type CountRow = { c: number };

export class ExportsRepository {
  constructor(private readonly client: SqlClient) {}

  async countPurchasesInRange(
    businessId: string,
    dateFrom: string | null,
    dateTo: string,
  ): Promise<number> {
    const where = this._purchaseWhere(businessId, dateFrom, dateTo);
    const row = await queryOne<CountRow>(
      this.client,
      `SELECT COUNT([id]) AS c FROM trade_purchases WHERE ${where}`,
      this._purchaseParams(businessId, dateFrom, dateTo),
    );
    return Number(row?.c ?? 0);
  }

  async listPurchasesInRange(
    businessId: string,
    dateFrom: string | null,
    dateTo: string,
    limit: number,
  ): Promise<ExportPurchaseRow[]> {
    return queryMany<ExportPurchaseRow>(
      this.client,
      `SELECT [id], [human_id], [supplier_name], [purchase_date],
              [total_amount], [paid_amount], [delivery_status], [notes]
       FROM trade_purchases
       WHERE ${this._purchaseWhere(businessId, dateFrom, dateTo)}
       ORDER BY [purchase_date] DESC
       OFFSET 0 ROWS FETCH NEXT @lim ROWS ONLY`,
      [
        ...this._purchaseParams(businessId, dateFrom, dateTo),
        { name: "lim", type: sql.Int, value: limit },
      ],
    );
  }

  async listLinesByPurchaseIds(
    ids: string[],
  ): Promise<ExportLineRow[]> {
    if (ids.length === 0) return [];
    return queryMany<ExportLineRow>(
      this.client,
      `SELECT [trade_purchase_id], [catalog_item_id], [item_name],
              [qty], [unit], [unit_type], [amount], [selling]
       FROM trade_purchase_lines
       WHERE [trade_purchase_id] IN (${ids.map((_, i) => `@id${i}`).join(",")})`,
      ids.map((id, i) => ({
        name: `id${i}`,
        type: sql.UniqueIdentifier,
        value: id,
      })),
    );
  }

  async listCatalogForExport(
    businessId: string,
  ): Promise<ExportCatalogRow[]> {
    return queryMany<ExportCatalogRow>(
      this.client,
      `SELECT ci.[id], ci.[name], ci.[item_code], ci.[barcode],
              ic.[name] AS category_name,
              ct.[name] AS subcategory_name,
              ci.[current_stock], ci.[reorder_level],
              COALESCE(ci.[stock_unit], ci.[default_unit]) AS stock_unit,
              ci.[opening_stock_qty],
              s.[name] AS supplier_name
       FROM catalog_items ci
       LEFT JOIN item_categories ic ON ic.[id] = ci.[category_id]
       LEFT JOIN category_types ct ON ct.[id] = ci.[type_id]
       LEFT JOIN suppliers s ON s.[id] = ci.[last_supplier_id]
       WHERE ci.[business_id] = @businessId AND ci.[deleted_at] IS NULL
       ORDER BY ci.[name] ASC`,
      [{ name: "businessId", type: sql.UniqueIdentifier, value: businessId }],
    );
  }

  async listSuppliersForExport(
    businessId: string,
  ): Promise<ExportSupplierRow[]> {
    return queryMany<ExportSupplierRow>(
      this.client,
      `SELECT [id], [name], [phone], [address], [contact_person]
       FROM suppliers
       WHERE [business_id] = @businessId AND [deleted_at] IS NULL
       ORDER BY [name] ASC`,
      [{ name: "businessId", type: sql.UniqueIdentifier, value: businessId }],
    );
  }

  async listStockMovementsForExport(
    businessId: string,
    limit: number,
  ): Promise<ExportMovementRow[]> {
    return queryMany<ExportMovementRow>(
      this.client,
      `SELECT [movement_kind], [delta_qty], [qty_before], [qty_after],
              [stock_unit], [reason], [created_at]
       FROM stock_movements
       WHERE [business_id] = @businessId
       ORDER BY [created_at] DESC
       OFFSET 0 ROWS FETCH NEXT @lim ROWS ONLY`,
      [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "lim", type: sql.Int, value: limit },
      ],
    );
  }

  async getMonthPurchaseTotal(
    businessId: string,
    year: number,
    month: number,
  ): Promise<{ total_amount: number; deals: number } | null> {
    const row = await queryOne<{
      total_amount: number | null;
      deals: number | null;
    }>(
      this.client,
      `SELECT COALESCE(SUM([total_amount]), 0) AS total_amount,
              COUNT([id]) AS deals
       FROM trade_purchases
       WHERE [business_id] = @businessId
         AND [status] NOT IN (N'draft', N'cancelled', N'deleted')
         AND YEAR([purchase_date]) = @yr
         AND MONTH([purchase_date]) = @mo`,
      [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "yr", type: sql.Int, value: year },
        { name: "mo", type: sql.Int, value: month },
      ],
    );
    if (!row) return null;
    return {
      total_amount: Number(row.total_amount ?? 0),
      deals: Number(row.deals ?? 0),
    };
  }

  async getBusinessName(id: string): Promise<string | null> {
    const row = await queryOne<{ name: string }>(
      this.client,
      `SELECT [name] FROM businesses WHERE [id] = @id`,
      [{ name: "id", type: sql.UniqueIdentifier, value: id }],
    );
    return row?.name ?? null;
  }

  private _purchaseWhere(
    _businessId: string,
    dateFrom: string | null,
    _dateTo: string,
  ): string {
    const clauses = [
      "[business_id] = @businessId",
      "[status] NOT IN (N'draft', N'cancelled', N'deleted')",
    ];
    if (dateFrom) {
      clauses.push("[purchase_date] >= @dateFrom");
    }
    clauses.push("[purchase_date] <= @dateTo");
    return clauses.join(" AND ");
  }

  private _purchaseParams(
    businessId: string,
    dateFrom: string | null,
    dateTo: string,
  ): import("./sql").SqlParam[] {
    const params: import("./sql").SqlParam[] = [
      { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
      { name: "dateTo", type: sql.Date, value: dateTo },
    ];
    if (dateFrom) {
      params.push({ name: "dateFrom", type: sql.Date, value: dateFrom });
    }
    return params;
  }
}

export function createExportsRepository(
  client: SqlClient,
): ExportsRepository {
  return new ExportsRepository(client);
}
