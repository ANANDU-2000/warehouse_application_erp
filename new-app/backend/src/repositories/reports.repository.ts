import { sql } from "../config/database";
import { queryMany, queryOne, type SqlClient, type SqlParam } from "./sql";

type CountRow = { c: number };
type CategorySpendRow = {
  category_id: string;
  category_name: string;
  total_amount: number | null;
  total_qty: number | null;
};
type SupplierRow = {
  supplier_id: string;
  supplier_name: string | null;
  deals: number | null;
  total_amount: number | null;
  total_qty: number | null;
};

export class ReportsRepository {
  constructor(private readonly client: SqlClient) {}

  async tradeSummary(
    businessId: string,
    dateFrom: string,
    dateTo: string,
    supplierId?: string,
  ): Promise<{
    deals: number;
    total_purchase: number;
    total_qty: number;
    avg_cost: number;
    total_bags: number;
    total_boxes: number;
    total_tins: number;
    total_kg: number;
  }> {
    const where = ["tp.[business_id] = @businessId", "tp.[purchase_date] >= @dateFrom", "tp.[purchase_date] <= @dateTo", "tp.[status] NOT IN (N'draft', N'cancelled', N'deleted')"];
    const params: SqlParam[] = [
      { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
      { name: "dateFrom", type: sql.Date, value: dateFrom },
      { name: "dateTo", type: sql.Date, value: dateTo },
    ];
    if (supplierId) {
      where.push("tp.[supplier_id] = @supplierId");
      params.push({ name: "supplierId", type: sql.UniqueIdentifier, value: supplierId });
    }
    const row = await queryOne<{
      deals: number | null;
      total_purchase: number | null;
      total_qty: number | null;
      bags: number | null;
      boxes: number | null;
      tins: number | null;
      kg: number | null;
    }>(
      this.client,
      `SELECT
         COUNT(DISTINCT tp.[id]) AS deals,
         COALESCE(SUM(tpl.[amount]), 0) AS total_purchase,
         COALESCE(SUM(tpl.[qty]), 0) AS total_qty,
         COALESCE(SUM(CASE WHEN COALESCE(tpl.[unit], N'') IN (N'bag', N'bags', N'sack', N'sacks') THEN tpl.[qty] ELSE 0 END), 0) AS bags,
         COALESCE(SUM(CASE WHEN COALESCE(tpl.[unit], N'') = N'box' THEN tpl.[qty] ELSE 0 END), 0) AS boxes,
         COALESCE(SUM(CASE WHEN COALESCE(tpl.[unit], N'') = N'tin' THEN tpl.[qty] ELSE 0 END), 0) AS tins,
         COALESCE(SUM(CASE WHEN COALESCE(tpl.[unit], N'') NOT IN (N'bag', N'bags', N'sack', N'sacks', N'box', N'tin') THEN tpl.[qty] ELSE 0 END), 0) AS kg
       FROM trade_purchase_lines tpl
       INNER JOIN trade_purchases tp ON tp.[id] = tpl.[trade_purchase_id]
       WHERE ${where.join(" AND ")}`,
      params,
    );
    const totalPurchase = Number(row?.total_purchase ?? 0);
    const deals = Number(row?.deals ?? 0);
    return {
      deals,
      total_purchase: totalPurchase,
      total_qty: Number(row?.total_qty ?? 0),
      avg_cost: deals > 0 ? totalPurchase / deals : 0,
      total_bags: Number(row?.bags ?? 0),
      total_boxes: Number(row?.boxes ?? 0),
      total_tins: Number(row?.tins ?? 0),
      total_kg: Number(row?.kg ?? 0),
    };
  }

  async tradeDailyProfit(
    businessId: string,
    dateFrom: string,
    dateTo: string,
  ): Promise<Array<{ date: string; purchase: number; selling: number; profit: number }>> {
    const rows = await queryMany<{
      d: Date | null;
      purchase: number | null;
      selling: number | null;
    }>(
      this.client,
      `SELECT CAST(tp.[purchase_date] AS date) AS d,
              COALESCE(SUM(tpl.[amount]), 0) AS purchase,
              COALESCE(SUM(tpl.[selling]), 0) AS selling
       FROM trade_purchase_lines tpl
       INNER JOIN trade_purchases tp ON tp.[id] = tpl.[trade_purchase_id]
       WHERE tp.[business_id] = @businessId
         AND tp.[purchase_date] >= @dateFrom
         AND tp.[purchase_date] <= @dateTo
         AND tp.[status] NOT IN (N'draft', N'cancelled', N'deleted')
       GROUP BY CAST(tp.[purchase_date] AS date)
       ORDER BY d ASC`,
      [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "dateFrom", type: sql.Date, value: dateFrom },
        { name: "dateTo", type: sql.Date, value: dateTo },
      ],
    );
    return rows.map((r) => {
      const p = Number(r.purchase ?? 0);
      const s = Number(r.selling ?? 0);
      return {
        date: r.d ? r.d.toISOString().slice(0, 10) : "",
        purchase: p,
        selling: s,
        profit: s - p,
      };
    });
  }

  async tradeItems(
    businessId: string,
    dateFrom: string,
    dateTo: string,
    opts: {
      categoryIds?: string[];
      subcategoryIds?: string[];
      supplierIds?: string[];
      sort?: string;
      order?: string;
      limit: number;
      offset: number;
    },
  ): Promise<{
    items: Array<{
      catalog_item_id: string;
      item_name: string;
      total_purchase: number;
      qty: number;
      profit: number;
      bags: number;
      boxes: number;
      tins: number;
      kg: number;
    }>;
    total: number;
  }> {
    const where = ["tp.[business_id] = @businessId", "tp.[purchase_date] >= @dateFrom", "tp.[purchase_date] <= @dateTo", "tp.[status] NOT IN (N'draft', N'cancelled', N'deleted')"];
    const params: SqlParam[] = [
      { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
      { name: "dateFrom", type: sql.Date, value: dateFrom },
      { name: "dateTo", type: sql.Date, value: dateTo },
    ];
    if (opts.categoryIds?.length) {
      where.push(`ci.[category_id] IN (${opts.categoryIds.map((_, i) => `@cat${i}`).join(",")})`);
      opts.categoryIds.forEach((id, i) => params.push({ name: `cat${i}`, type: sql.UniqueIdentifier, value: id }));
    }
    if (opts.supplierIds?.length) {
      where.push(`tp.[supplier_id] IN (${opts.supplierIds.map((_, i) => `@sup${i}`).join(",")})`);
      opts.supplierIds.forEach((id, i) => params.push({ name: `sup${i}`, type: sql.UniqueIdentifier, value: id }));
    }
    const lim = Math.min(2000, Math.max(1, opts.limit));
    const offset = Math.max(0, opts.offset);
    let orderBy = "total_purchase DESC";
    if (opts.sort === "name") orderBy = "item_name " + (opts.order === "desc" ? "DESC" : "ASC");
    else if (opts.sort === "qty") orderBy = "qty " + (opts.order === "desc" ? "DESC" : "ASC");
    else if (opts.sort === "profit") orderBy = "profit " + (opts.order === "desc" ? "DESC" : "ASC");

    const totalRow = await queryOne<CountRow>(
      this.client,
      `SELECT COUNT(DISTINCT tpl.[catalog_item_id]) AS c
       FROM trade_purchase_lines tpl
       INNER JOIN trade_purchases tp ON tp.[id] = tpl.[trade_purchase_id]
       LEFT JOIN catalog_items ci ON ci.[id] = tpl.[catalog_item_id]
       WHERE ${where.join(" AND ")}`,
      params,
    );

    const rows = await queryMany<{
      catalog_item_id: string;
      item_name: string;
      total_purchase: number | null;
      qty: number | null;
      profit: number | null;
      bags: number | null;
      boxes: number | null;
      tins: number | null;
      kg: number | null;
    }>(
      this.client,
      `SELECT
         tpl.[catalog_item_id] AS catalog_item_id,
         MAX(tpl.[item_name]) AS item_name,
         COALESCE(SUM(tpl.[amount]), 0) AS total_purchase,
         COALESCE(SUM(tpl.[qty]), 0) AS qty,
         COALESCE(SUM(tpl.[selling]), 0) - COALESCE(SUM(tpl.[amount]), 0) AS profit,
         COALESCE(SUM(CASE WHEN COALESCE(tpl.[unit], N'') IN (N'bag', N'bags', N'sack', N'sacks') THEN tpl.[qty] ELSE 0 END), 0) AS bags,
         COALESCE(SUM(CASE WHEN COALESCE(tpl.[unit], N'') = N'box' THEN tpl.[qty] ELSE 0 END), 0) AS boxes,
         COALESCE(SUM(CASE WHEN COALESCE(tpl.[unit], N'') = N'tin' THEN tpl.[qty] ELSE 0 END), 0) AS tins,
         COALESCE(SUM(CASE WHEN COALESCE(tpl.[unit], N'') NOT IN (N'bag', N'bags', N'sack', N'sacks', N'box', N'tin') THEN tpl.[qty] ELSE 0 END), 0) AS kg
       FROM trade_purchase_lines tpl
       INNER JOIN trade_purchases tp ON tp.[id] = tpl.[trade_purchase_id]
       LEFT JOIN catalog_items ci ON ci.[id] = tpl.[catalog_item_id]
       WHERE ${where.join(" AND ")}
       GROUP BY tpl.[catalog_item_id]
       ORDER BY ${orderBy}
       OFFSET @offset ROWS FETCH NEXT @lim ROWS ONLY`,
      [
        ...params,
        { name: "offset", type: sql.Int, value: offset },
        { name: "lim", type: sql.Int, value: lim },
      ],
    );
    return {
      items: rows.map((r) => ({
        catalog_item_id: r.catalog_item_id,
        item_name: r.item_name,
        total_purchase: Number(r.total_purchase ?? 0),
        qty: Number(r.qty ?? 0),
        profit: Number(r.profit ?? 0),
        bags: Number(r.bags ?? 0),
        boxes: Number(r.boxes ?? 0),
        tins: Number(r.tins ?? 0),
        kg: Number(r.kg ?? 0),
      })),
      total: Number(totalRow?.c ?? 0),
    };
  }

  async tradeSuppliers(businessId: string, dateFrom: string, dateTo: string, limit: number): Promise<SupplierRow[]> {
    const lim = Math.min(500, Math.max(1, limit));
    return queryMany<SupplierRow>(
      this.client,
      `SELECT
         tp.[supplier_id] AS supplier_id,
         MAX(tp.[supplier_name]) AS supplier_name,
         COUNT(DISTINCT tp.[id]) AS deals,
         COALESCE(SUM(tp.[total_amount]), 0) AS total_amount,
         COALESCE(SUM(tpl.[qty]), 0) AS total_qty
       FROM trade_purchases tp
       INNER JOIN trade_purchase_lines tpl ON tpl.[trade_purchase_id] = tp.[id]
       WHERE tp.[business_id] = @businessId
         AND tp.[purchase_date] >= @dateFrom
         AND tp.[purchase_date] <= @dateTo
         AND tp.[status] NOT IN (N'draft', N'cancelled', N'deleted')
       GROUP BY tp.[supplier_id]
       ORDER BY total_amount DESC
       OFFSET 0 ROWS FETCH NEXT @lim ROWS ONLY`,
      [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "dateFrom", type: sql.Date, value: dateFrom },
        { name: "dateTo", type: sql.Date, value: dateTo },
        { name: "lim", type: sql.Int, value: lim },
      ],
    );
  }

  async tradeCategories(businessId: string, dateFrom: string, dateTo: string, limit: number): Promise<CategorySpendRow[]> {
    const lim = Math.min(500, Math.max(1, limit));
    return queryMany<CategorySpendRow>(
      this.client,
      `SELECT
         ic.[id] AS category_id,
         ic.[name] AS category_name,
         COALESCE(SUM(tpl.[amount]), 0) AS total_amount,
         COALESCE(SUM(tpl.[qty]), 0) AS total_qty
       FROM trade_purchase_lines tpl
       INNER JOIN trade_purchases tp ON tp.[id] = tpl.[trade_purchase_id]
       LEFT JOIN catalog_items ci ON ci.[id] = tpl.[catalog_item_id]
       LEFT JOIN item_categories ic ON ic.[id] = ci.[category_id]
       WHERE tp.[business_id] = @businessId
         AND tp.[purchase_date] >= @dateFrom
         AND tp.[purchase_date] <= @dateTo
         AND tp.[status] NOT IN (N'draft', N'cancelled', N'deleted')
       GROUP BY ic.[id], ic.[name]
       ORDER BY total_amount DESC
       OFFSET 0 ROWS FETCH NEXT @lim ROWS ONLY`,
      [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "dateFrom", type: sql.Date, value: dateFrom },
        { name: "dateTo", type: sql.Date, value: dateTo },
        { name: "lim", type: sql.Int, value: lim },
      ],
    );
  }

  async tradeTypes(businessId: string, dateFrom: string, dateTo: string, limit: number): Promise<{ type_id: string; type_name: string | null; category_name: string | null; total_amount: number; total_qty: number }[]> {
    const lim = Math.min(500, Math.max(1, limit));
    return queryMany<any>(
      this.client,
      `SELECT
         ct.[id] AS type_id,
         ct.[name] AS type_name,
         ic.[name] AS category_name,
         COALESCE(SUM(tpl.[amount]), 0) AS total_amount,
         COALESCE(SUM(tpl.[qty]), 0) AS total_qty
       FROM trade_purchase_lines tpl
       INNER JOIN trade_purchases tp ON tp.[id] = tpl.[trade_purchase_id]
       LEFT JOIN catalog_items ci ON ci.[id] = tpl.[catalog_item_id]
       LEFT JOIN category_types ct ON ct.[id] = ci.[type_id]
       LEFT JOIN item_categories ic ON ic.[id] = ct.[category_id]
       WHERE tp.[business_id] = @businessId
         AND tp.[purchase_date] >= @dateFrom
         AND tp.[purchase_date] <= @dateTo
         AND tp.[status] NOT IN (N'draft', N'cancelled', N'deleted')
       GROUP BY ct.[id], ct.[name], ic.[name]
       ORDER BY total_amount DESC
       OFFSET 0 ROWS FETCH NEXT @lim ROWS ONLY`,
      [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "dateFrom", type: sql.Date, value: dateFrom },
        { name: "dateTo", type: sql.Date, value: dateTo },
        { name: "lim", type: sql.Int, value: lim },
      ],
    );
  }

  async periodComparison(businessId: string, dateFrom: string, dateTo: string): Promise<{ total_purchase: number; total_qty: number; deals: number }> {
    const row = await queryOne<{ total_purchase: number | null; total_qty: number | null; deals: number | null }>(
      this.client,
      `SELECT COALESCE(SUM(tp.[total_amount]), 0) AS total_purchase,
              COALESCE(SUM(tpl.[qty]), 0) AS total_qty,
              COUNT(DISTINCT tp.[id]) AS deals
       FROM trade_purchases tp
       INNER JOIN trade_purchase_lines tpl ON tpl.[trade_purchase_id] = tp.[id]
       WHERE tp.[business_id] = @businessId
         AND tp.[purchase_date] >= @dateFrom
         AND tp.[purchase_date] <= @dateTo
         AND tp.[status] NOT IN (N'draft', N'cancelled', N'deleted')`,
      [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "dateFrom", type: sql.Date, value: dateFrom },
        { name: "dateTo", type: sql.Date, value: dateTo },
      ],
    );
    return { total_purchase: Number(row?.total_purchase ?? 0), total_qty: Number(row?.total_qty ?? 0), deals: Number(row?.deals ?? 0) };
  }

  async itemDrill(
    businessId: string,
    itemId: string,
    dateFrom: string,
    dateTo: string,
    limit: number,
    offset: number,
  ): Promise<{
    item: { id: string; name: string; item_code: string | null; current_stock: number; unit: string | null; category_name: string | null } | null;
    purchases: any[];
    total: number;
  }> {
    const itemRow = await queryOne<any>(
      this.client,
      `SELECT ci.[id], ci.[name], ci.[item_code], ci.[current_stock],
              COALESCE(ci.[stock_unit], ci.[default_unit]) AS unit,
              ic.[name] AS category_name
       FROM catalog_items ci
       LEFT JOIN item_categories ic ON ic.[id] = ci.[category_id]
       WHERE ci.[id] = @itemId AND ci.[business_id] = @businessId AND ci.[deleted_at] IS NULL`,
      [
        { name: "itemId", type: sql.UniqueIdentifier, value: itemId },
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
      ],
    );
    if (!itemRow) return { item: null, purchases: [], total: 0 };

    const lim = Math.min(200, Math.max(1, limit));
    const off = Math.max(0, offset);
    const totalRow = await queryOne<CountRow>(
      this.client,
      `SELECT COUNT(tp.[id]) AS c
       FROM trade_purchases tp
       INNER JOIN trade_purchase_lines tpl ON tpl.[trade_purchase_id] = tp.[id]
       WHERE tp.[business_id] = @businessId
         AND tpl.[catalog_item_id] = @itemId
         AND tp.[purchase_date] >= @dateFrom
         AND tp.[purchase_date] <= @dateTo
         AND tp.[status] NOT IN (N'draft', N'cancelled', N'deleted')`,
      [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "itemId", type: sql.UniqueIdentifier, value: itemId },
        { name: "dateFrom", type: sql.Date, value: dateFrom },
        { name: "dateTo", type: sql.Date, value: dateTo },
      ],
    );

    const purchases = await queryMany<any>(
      this.client,
      `SELECT tp.[id], tp.[human_id], tp.[supplier_name], tp.[purchase_date],
              tpl.[qty], tpl.[unit], tpl.[amount], tpl.[selling],
              tpl.[unit_type]
       FROM trade_purchases tp
       INNER JOIN trade_purchase_lines tpl ON tpl.[trade_purchase_id] = tp.[id]
       WHERE tp.[business_id] = @businessId
         AND tpl.[catalog_item_id] = @itemId
         AND tp.[purchase_date] >= @dateFrom
         AND tp.[purchase_date] <= @dateTo
         AND tp.[status] NOT IN (N'draft', N'cancelled', N'deleted')
       ORDER BY tp.[purchase_date] DESC
       OFFSET @off ROWS FETCH NEXT @lim ROWS ONLY`,
      [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "itemId", type: sql.UniqueIdentifier, value: itemId },
        { name: "dateFrom", type: sql.Date, value: dateFrom },
        { name: "dateTo", type: sql.Date, value: dateTo },
        { name: "off", type: sql.Int, value: off },
        { name: "lim", type: sql.Int, value: lim },
      ],
    );

    return {
      item: {
        id: itemRow.id,
        name: itemRow.name,
        item_code: itemRow.item_code,
        current_stock: Number(itemRow.current_stock ?? 0),
        unit: itemRow.unit,
        category_name: itemRow.category_name,
      },
      purchases,
      total: Number(totalRow?.c ?? 0),
    };
  }

  async reportViews(businessId: string, userId: string): Promise<any[]> {
    return queryMany<any>(
      this.client,
      `SELECT [id], [name], [tab], [filters_json], [is_default], [created_at]
       FROM report_saved_views
       WHERE [business_id] = @businessId AND [user_id] = @userId
       ORDER BY [created_at] DESC`,
      [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "userId", type: sql.UniqueIdentifier, value: userId },
      ],
    );
  }

  async createReportView(businessId: string, userId: string, name: string, tab: string, filtersJson: string | null, isDefault: boolean): Promise<string> {
    const id = require("node:crypto").randomUUID();
    if (isDefault) {
      await this.client.request()
        .input("businessId", sql.UniqueIdentifier, businessId)
        .input("userId", sql.UniqueIdentifier, userId)
        .input("tab", sql.NVarChar(32), tab)
        .query(`UPDATE report_saved_views SET [is_default] = 0 WHERE [business_id] = @businessId AND [user_id] = @userId AND [tab] = @tab`);
    }
    await this.client.request()
      .input("id", sql.UniqueIdentifier, id)
      .input("businessId", sql.UniqueIdentifier, businessId)
      .input("userId", sql.UniqueIdentifier, userId)
      .input("name", sql.NVarChar(120), name)
      .input("tab", sql.NVarChar(32), tab)
      .input("filtersJson", sql.NVarChar(sql.MAX), filtersJson)
      .input("isDefault", sql.Bit, isDefault)
      .query(`INSERT INTO report_saved_views ([id], [business_id], [user_id], [name], [tab], [filters_json], [is_default], [created_at])
              VALUES (@id, @businessId, @userId, @name, @tab, @filtersJson, @isDefault, SYSUTCDATETIME())`);
    return id;
  }

  async deleteReportView(viewId: string, businessId: string, userId: string): Promise<boolean> {
    const result = await this.client.request()
      .input("viewId", sql.UniqueIdentifier, viewId)
      .input("businessId", sql.UniqueIdentifier, businessId)
      .input("userId", sql.UniqueIdentifier, userId)
      .query(`DELETE FROM report_saved_views WHERE [id] = @viewId AND [business_id] = @businessId AND [user_id] = @userId`);
    return (result.rowsAffected?.[0] ?? 0) > 0;
  }
}

export function createReportsRepository(client: SqlClient): ReportsRepository {
  return new ReportsRepository(client);
}
