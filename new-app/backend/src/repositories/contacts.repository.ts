import { sql } from "../config/database";
import { queryMany, queryOne, type SqlClient, type SqlParam } from "./sql";
import type { SupplierRow, BrokerRow, BrokerSupplierLinkRow } from "./types";

export type CompactSupplierRow = {
  id: string;
  name: string;
  phone: string | null;
  gst_number: string | null;
  default_payment_days: number | null;
  default_discount: number | null;
  default_delivered_rate: number | null;
  default_billty_rate: number | null;
  location: string | null;
  freight_type: string | null;
  ai_memory_enabled: boolean;
  preferences_json: string | null;
  broker_id: string | null;
};

export type ContactsRepository = {
  listSuppliers(businessId: string): Promise<SupplierRow[]>;
  listSuppliersCompact(businessId: string, limit?: number): Promise<CompactSupplierRow[]>;
  getSupplier(businessId: string, supplierId: string): Promise<SupplierRow | null>;
  findDupSupplierId(businessId: string, name: string, excludeId?: string): Promise<string | null>;
  insertSupplier(row: {
    id: string; businessId: string; name: string; phone: string | null;
    location: string | null; brokerId: string | null; gstNumber: string | null;
    address: string | null; notes: string | null; defaultPaymentDays: number | null;
    defaultDiscount: number | null; defaultDeliveredRate: number | null;
    defaultBilltyRate: number | null; freightType: string | null;
    aiMemoryEnabled: boolean; preferencesJson: string | null;
  }): Promise<void>;
  updateSupplier(businessId: string, supplierId: string, fields: Record<string, unknown>): Promise<void>;
  deleteSupplier(businessId: string, supplierId: string): Promise<void>;
  countActiveTradePurchasesForSupplier(businessId: string, supplierId: string): Promise<number>;

  listBrokers(businessId: string): Promise<BrokerRow[]>;
  getBroker(businessId: string, brokerId: string): Promise<BrokerRow | null>;
  findDupBrokerId(businessId: string, name: string, excludeId?: string): Promise<string | null>;
  insertBroker(row: {
    id: string; businessId: string; name: string; phone: string | null;
    location: string | null; notes: string | null; commissionType: string;
    commissionValue: number | null; defaultPaymentDays: number | null;
    defaultDiscount: number | null; defaultDeliveredRate: number | null;
    defaultBilltyRate: number | null; freightType: string | null;
    imageUrl: string | null; preferencesJson: string | null;
  }): Promise<void>;
  updateBroker(businessId: string, brokerId: string, fields: Record<string, unknown>): Promise<void>;
  deleteBroker(businessId: string, brokerId: string): Promise<void>;
  countActiveTradePurchasesForBroker(businessId: string, brokerId: string): Promise<number>;
  countSuppliersAssignedToBroker(businessId: string, brokerId: string): Promise<number>;

  listBrokerSupplierLinksBySupplier(supplierId: string): Promise<BrokerSupplierLinkRow[]>;
  listBrokerSupplierLinksByBroker(brokerId: string): Promise<BrokerSupplierLinkRow[]>;
  deleteBrokerLinksBySupplier(supplierId: string): Promise<void>;
  deleteBrokerLinksByBroker(brokerId: string): Promise<void>;
  insertBrokerSupplierLink(link: { id: string; brokerId: string; supplierId: string }): Promise<void>;
  verifyBrokerInBusiness(brokerId: string, businessId: string): Promise<boolean>;
  verifySupplierInBusiness(supplierId: string, businessId: string): Promise<boolean>;
  updateSupplierBrokerId(supplierId: string, brokerId: string | null): Promise<void>;
  getLastPurchaseDateForSupplier(businessId: string, supplierId: string): Promise<Date | null>;
  getLastPurchaseDateForBroker(businessId: string, brokerId: string): Promise<Date | null>;
  getSupplierMetrics(businessId: string, supplierId: string, fromDate: string, toDate: string): Promise<{
    deals: number; total_qty: number; avg_landing: number;
    total_profit: number; purchase_amount: number;
  } | null>;
  getBrokerMetricsDeals(businessId: string, brokerId: string, fromDate: string, toDate: string): Promise<number>;
  getBrokerMetricsCommission(businessId: string, brokerId: string, fromDate: string, toDate: string): Promise<number>;
  getBrokerMetricsProfit(businessId: string, brokerId: string, fromDate: string, toDate: string): Promise<number>;
  getLinkedSuppliers(businessId: string, brokerId: string): Promise<{ id: string; name: string; phone: string | null }[]>;
};

export function createContactsRepository(db: SqlClient): ContactsRepository {
  const SUPPLIER_COLS = `[id],[business_id],[name],[phone],[gst_number],[default_payment_days],[default_discount],[default_delivered_rate],[default_billty_rate],[location],[address],[notes],[freight_type],[ai_memory_enabled],[preferences_json],[broker_id],[created_at]`;
  const SUPPLIER_COMPACT_COLS = `[id],[name],[phone],[gst_number],[default_payment_days],[default_discount],[default_delivered_rate],[default_billty_rate],[location],[freight_type],[ai_memory_enabled],[preferences_json],[broker_id]`;
  const BROKER_COLS = `[id],[business_id],[name],[phone],[location],[notes],[preferences_json],[commission_type],[commission_value],[default_payment_days],[default_discount],[default_delivered_rate],[default_billty_rate],[freight_type],[image_url],[created_at]`;

  return {
    async listSuppliers(businessId) {
      return queryMany<SupplierRow>(
        db,
        `SELECT ${SUPPLIER_COLS} FROM suppliers WHERE [business_id] = @businessId ORDER BY LOWER([name])`,
        [{ name: "businessId", type: sql.UniqueIdentifier, value: businessId }],
      );
    },

    async listSuppliersCompact(businessId, limit) {
      let query = `SELECT ${SUPPLIER_COMPACT_COLS} FROM suppliers WHERE [business_id] = @businessId ORDER BY LOWER([name])`;
      const params: SqlParam[] = [{ name: "businessId", type: sql.UniqueIdentifier, value: businessId }];
      if (limit !== undefined) {
        query = `SELECT TOP (@limit) ${SUPPLIER_COMPACT_COLS} FROM suppliers WHERE [business_id] = @businessId ORDER BY LOWER([name])`;
        params.push({ name: "limit", type: sql.Int, value: limit });
      }
      return queryMany<CompactSupplierRow>(db, query, params);
    },

    async getSupplier(businessId, supplierId) {
      return queryOne<SupplierRow>(
        db,
        `SELECT ${SUPPLIER_COLS} FROM suppliers WHERE [id] = @id AND [business_id] = @businessId`,
        [
          { name: "id", type: sql.UniqueIdentifier, value: supplierId },
          { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        ],
      );
    },

    async findDupSupplierId(businessId, name, excludeId) {
      const params: SqlParam[] = [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "name", type: sql.NVarChar(255), value: name.trim().toLowerCase() },
      ];
      let query = `SELECT TOP 1 [id] FROM suppliers WHERE [business_id] = @businessId AND LOWER(LTRIM(RTRIM([name]))) = @name`;
      if (excludeId) {
        query += ` AND [id] <> @excludeId`;
        params.push({ name: "excludeId", type: sql.UniqueIdentifier, value: excludeId });
      }
      const row = await queryOne<{ id: string }>(db, query, params);
      return row ? row.id : null;
    },

    async insertSupplier(row) {
      await queryOne(
        db,
        `INSERT INTO suppliers ([id],[business_id],[name],[phone],[gst_number],[default_payment_days],[default_discount],[default_delivered_rate],[default_billty_rate],[location],[address],[notes],[freight_type],[ai_memory_enabled],[preferences_json],[broker_id],[created_at])
         VALUES (@id,@businessId,@name,@phone,@gstNumber,@defaultPaymentDays,@defaultDiscount,@defaultDeliveredRate,@defaultBilltyRate,@location,@address,@notes,@freightType,@aiMemoryEnabled,@preferencesJson,@brokerId,SYSUTCDATETIME())`,
        [
          { name: "id", type: sql.UniqueIdentifier, value: row.id },
          { name: "businessId", type: sql.UniqueIdentifier, value: row.businessId },
          { name: "name", type: sql.NVarChar(255), value: row.name.trim() },
          { name: "phone", type: sql.NVarChar(32), value: row.phone },
          { name: "gstNumber", type: sql.NVarChar(20), value: row.gstNumber },
          { name: "defaultPaymentDays", type: sql.Int, value: row.defaultPaymentDays },
          { name: "defaultDiscount", type: sql.Decimal(5, 2), value: row.defaultDiscount },
          { name: "defaultDeliveredRate", type: sql.Decimal(12, 2), value: row.defaultDeliveredRate },
          { name: "defaultBilltyRate", type: sql.Decimal(12, 2), value: row.defaultBilltyRate },
          { name: "location", type: sql.NVarChar(sql.MAX), value: row.location },
          { name: "address", type: sql.NVarChar(sql.MAX), value: row.address },
          { name: "notes", type: sql.NVarChar(sql.MAX), value: row.notes },
          { name: "freightType", type: sql.NVarChar(16), value: row.freightType },
          { name: "aiMemoryEnabled", type: sql.Bit, value: row.aiMemoryEnabled },
          { name: "preferencesJson", type: sql.NVarChar(sql.MAX), value: row.preferencesJson },
          { name: "brokerId", type: sql.UniqueIdentifier, value: row.brokerId },
        ],
      );
    },

    async updateSupplier(businessId, supplierId, fields) {
      const sets: string[] = [];
      const params: SqlParam[] = [
        { name: "id", type: sql.UniqueIdentifier, value: supplierId },
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
      ];
      const fieldMap: Record<string, { col: string; type: object }> = {
        name: { col: "[name]", type: sql.NVarChar(255) },
        phone: { col: "[phone]", type: sql.NVarChar(32) },
        gstNumber: { col: "[gst_number]", type: sql.NVarChar(20) },
        defaultPaymentDays: { col: "[default_payment_days]", type: sql.Int },
        defaultDiscount: { col: "[default_discount]", type: sql.Decimal(5, 2) },
        defaultDeliveredRate: { col: "[default_delivered_rate]", type: sql.Decimal(12, 2) },
        defaultBilltyRate: { col: "[default_billty_rate]", type: sql.Decimal(12, 2) },
        location: { col: "[location]", type: sql.NVarChar(sql.MAX) },
        address: { col: "[address]", type: sql.NVarChar(sql.MAX) },
        notes: { col: "[notes]", type: sql.NVarChar(sql.MAX) },
        freightType: { col: "[freight_type]", type: sql.NVarChar(16) },
        aiMemoryEnabled: { col: "[ai_memory_enabled]", type: sql.Bit },
        preferencesJson: { col: "[preferences_json]", type: sql.NVarChar(sql.MAX) },
        brokerId: { col: "[broker_id]", type: sql.UniqueIdentifier },
      };
      for (const [key, cfg] of Object.entries(fieldMap)) {
        if (fields[key] !== undefined) {
          sets.push(`${cfg.col} = @${key}`);
          params.push({ name: key, type: cfg.type, value: fields[key] });
        }
      }
      if (sets.length === 0) return;
      await queryOne(
        db,
        `UPDATE suppliers SET ${sets.join(", ")} WHERE [id] = @id AND [business_id] = @businessId`,
        params,
      );
    },

    async deleteSupplier(businessId, supplierId) {
      await queryOne(
        db,
        `DELETE FROM suppliers WHERE [id] = @id AND [business_id] = @businessId`,
        [
          { name: "id", type: sql.UniqueIdentifier, value: supplierId },
          { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        ],
      );
    },

    async countActiveTradePurchasesForSupplier(businessId, supplierId) {
      const row = await queryOne<{ cnt: number }>(
        db,
        `SELECT COUNT(*) AS [cnt] FROM trade_purchases
         WHERE [business_id] = @businessId AND [supplier_id] = @supplierId
           AND [status] NOT IN ('deleted','cancelled')`,
        [
          { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
          { name: "supplierId", type: sql.UniqueIdentifier, value: supplierId },
        ],
      );
      return Number(row?.cnt ?? 0);
    },

    async listBrokers(businessId) {
      return queryMany<BrokerRow>(
        db,
        `SELECT ${BROKER_COLS} FROM brokers WHERE [business_id] = @businessId ORDER BY LOWER([name])`,
        [{ name: "businessId", type: sql.UniqueIdentifier, value: businessId }],
      );
    },

    async getBroker(businessId, brokerId) {
      return queryOne<BrokerRow>(
        db,
        `SELECT ${BROKER_COLS} FROM brokers WHERE [id] = @id AND [business_id] = @businessId`,
        [
          { name: "id", type: sql.UniqueIdentifier, value: brokerId },
          { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        ],
      );
    },

    async findDupBrokerId(businessId, name, excludeId) {
      const params: SqlParam[] = [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "name", type: sql.NVarChar(255), value: name.trim().toLowerCase() },
      ];
      let query = `SELECT TOP 1 [id] FROM brokers WHERE [business_id] = @businessId AND LOWER(LTRIM(RTRIM([name]))) = @name`;
      if (excludeId) {
        query += ` AND [id] <> @excludeId`;
        params.push({ name: "excludeId", type: sql.UniqueIdentifier, value: excludeId });
      }
      const row = await queryOne<{ id: string }>(db, query, params);
      return row ? row.id : null;
    },

    async insertBroker(row) {
      await queryOne(
        db,
        `INSERT INTO brokers ([id],[business_id],[name],[phone],[location],[notes],[preferences_json],[commission_type],[commission_value],[default_payment_days],[default_discount],[default_delivered_rate],[default_billty_rate],[freight_type],[image_url],[created_at])
         VALUES (@id,@businessId,@name,@phone,@location,@notes,@preferencesJson,@commissionType,@commissionValue,@defaultPaymentDays,@defaultDiscount,@defaultDeliveredRate,@defaultBilltyRate,@freightType,@imageUrl,SYSUTCDATETIME())`,
        [
          { name: "id", type: sql.UniqueIdentifier, value: row.id },
          { name: "businessId", type: sql.UniqueIdentifier, value: row.businessId },
          { name: "name", type: sql.NVarChar(255), value: row.name.trim() },
          { name: "phone", type: sql.NVarChar(15), value: row.phone },
          { name: "location", type: sql.NVarChar(sql.MAX), value: row.location },
          { name: "notes", type: sql.NVarChar(sql.MAX), value: row.notes },
          { name: "preferencesJson", type: sql.NVarChar(sql.MAX), value: row.preferencesJson },
          { name: "commissionType", type: sql.NVarChar(32), value: row.commissionType },
          { name: "commissionValue", type: sql.Decimal(12, 2), value: row.commissionValue },
          { name: "defaultPaymentDays", type: sql.Int, value: row.defaultPaymentDays },
          { name: "defaultDiscount", type: sql.Decimal(5, 2), value: row.defaultDiscount },
          { name: "defaultDeliveredRate", type: sql.Decimal(12, 2), value: row.defaultDeliveredRate },
          { name: "defaultBilltyRate", type: sql.Decimal(12, 2), value: row.defaultBilltyRate },
          { name: "freightType", type: sql.NVarChar(16), value: row.freightType },
          { name: "imageUrl", type: sql.NVarChar(1024), value: row.imageUrl },
        ],
      );
    },

    async updateBroker(businessId, brokerId, fields) {
      const sets: string[] = [];
      const params: SqlParam[] = [
        { name: "id", type: sql.UniqueIdentifier, value: brokerId },
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
      ];
      const fieldMap: Record<string, { col: string; type: object }> = {
        name: { col: "[name]", type: sql.NVarChar(255) },
        phone: { col: "[phone]", type: sql.NVarChar(15) },
        location: { col: "[location]", type: sql.NVarChar(sql.MAX) },
        notes: { col: "[notes]", type: sql.NVarChar(sql.MAX) },
        preferencesJson: { col: "[preferences_json]", type: sql.NVarChar(sql.MAX) },
        commissionType: { col: "[commission_type]", type: sql.NVarChar(32) },
        commissionValue: { col: "[commission_value]", type: sql.Decimal(12, 2) },
        defaultPaymentDays: { col: "[default_payment_days]", type: sql.Int },
        defaultDiscount: { col: "[default_discount]", type: sql.Decimal(5, 2) },
        defaultDeliveredRate: { col: "[default_delivered_rate]", type: sql.Decimal(12, 2) },
        defaultBilltyRate: { col: "[default_billty_rate]", type: sql.Decimal(12, 2) },
        freightType: { col: "[freight_type]", type: sql.NVarChar(16) },
        imageUrl: { col: "[image_url]", type: sql.NVarChar(1024) },
      };
      for (const [key, cfg] of Object.entries(fieldMap)) {
        if (fields[key] !== undefined) {
          sets.push(`${cfg.col} = @${key}`);
          params.push({ name: key, type: cfg.type, value: fields[key] });
        }
      }
      if (sets.length === 0) return;
      await queryOne(
        db,
        `UPDATE brokers SET ${sets.join(", ")} WHERE [id] = @id AND [business_id] = @businessId`,
        params,
      );
    },

    async deleteBroker(businessId, brokerId) {
      await queryOne(
        db,
        `DELETE FROM brokers WHERE [id] = @id AND [business_id] = @businessId`,
        [
          { name: "id", type: sql.UniqueIdentifier, value: brokerId },
          { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        ],
      );
    },

    async countActiveTradePurchasesForBroker(businessId, brokerId) {
      const row = await queryOne<{ cnt: number }>(
        db,
        `SELECT COUNT(*) AS [cnt] FROM trade_purchases
         WHERE [business_id] = @businessId AND [broker_id] = @brokerId
           AND [status] NOT IN ('deleted','cancelled')`,
        [
          { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
          { name: "brokerId", type: sql.UniqueIdentifier, value: brokerId },
        ],
      );
      return Number(row?.cnt ?? 0);
    },

    async countSuppliersAssignedToBroker(businessId, brokerId) {
      const row = await queryOne<{ cnt: number }>(
        db,
        `SELECT COUNT(*) AS [cnt] FROM suppliers
         WHERE [business_id] = @businessId AND [broker_id] = @brokerId`,
        [
          { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
          { name: "brokerId", type: sql.UniqueIdentifier, value: brokerId },
        ],
      );
      return Number(row?.cnt ?? 0);
    },

    async listBrokerSupplierLinksBySupplier(supplierId) {
      return queryMany<BrokerSupplierLinkRow>(
        db,
        `SELECT [id],[broker_id],[supplier_id],[created_at] FROM broker_supplier_m2m WHERE [supplier_id] = @supplierId`,
        [{ name: "supplierId", type: sql.UniqueIdentifier, value: supplierId }],
      );
    },

    async listBrokerSupplierLinksByBroker(brokerId) {
      return queryMany<BrokerSupplierLinkRow>(
        db,
        `SELECT [id],[broker_id],[supplier_id],[created_at] FROM broker_supplier_m2m WHERE [broker_id] = @brokerId`,
        [{ name: "brokerId", type: sql.UniqueIdentifier, value: brokerId }],
      );
    },

    async deleteBrokerLinksBySupplier(supplierId) {
      await queryOne(
        db,
        `DELETE FROM broker_supplier_m2m WHERE [supplier_id] = @supplierId`,
        [{ name: "supplierId", type: sql.UniqueIdentifier, value: supplierId }],
      );
    },

    async deleteBrokerLinksByBroker(brokerId) {
      await queryOne(
        db,
        `DELETE FROM broker_supplier_m2m WHERE [broker_id] = @brokerId`,
        [{ name: "brokerId", type: sql.UniqueIdentifier, value: brokerId }],
      );
    },

    async insertBrokerSupplierLink(link) {
      await queryOne(
        db,
        `INSERT INTO broker_supplier_m2m ([id],[broker_id],[supplier_id],[created_at])
         VALUES (@id,@brokerId,@supplierId,SYSUTCDATETIME())`,
        [
          { name: "id", type: sql.UniqueIdentifier, value: link.id },
          { name: "brokerId", type: sql.UniqueIdentifier, value: link.brokerId },
          { name: "supplierId", type: sql.UniqueIdentifier, value: link.supplierId },
        ],
      );
    },

    async verifyBrokerInBusiness(brokerId, businessId) {
      const row = await queryOne<{ id: string }>(
        db,
        `SELECT TOP 1 [id] FROM brokers WHERE [id] = @id AND [business_id] = @businessId`,
        [
          { name: "id", type: sql.UniqueIdentifier, value: brokerId },
          { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        ],
      );
      return row != null;
    },

    async verifySupplierInBusiness(supplierId, businessId) {
      const row = await queryOne<{ id: string }>(
        db,
        `SELECT TOP 1 [id] FROM suppliers WHERE [id] = @id AND [business_id] = @businessId`,
        [
          { name: "id", type: sql.UniqueIdentifier, value: supplierId },
          { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        ],
      );
      return row != null;
    },

    async updateSupplierBrokerId(supplierId, brokerId) {
      await queryOne(
        db,
        `UPDATE suppliers SET [broker_id] = @brokerId WHERE [id] = @supplierId`,
        [
          { name: "brokerId", type: sql.UniqueIdentifier, value: brokerId },
          { name: "supplierId", type: sql.UniqueIdentifier, value: supplierId },
        ],
      );
    },

    async getLastPurchaseDateForSupplier(businessId, supplierId) {
      const row = await queryOne<{ d: Date | null }>(
        db,
        `SELECT MAX([purchase_date]) AS [d] FROM trade_purchases
         WHERE [business_id] = @businessId AND [supplier_id] = @supplierId
           AND [status] NOT IN ('deleted','cancelled')`,
        [
          { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
          { name: "supplierId", type: sql.UniqueIdentifier, value: supplierId },
        ],
      );
      return row?.d ?? null;
    },

    async getLastPurchaseDateForBroker(businessId, brokerId) {
      const row = await queryOne<{ d: Date | null }>(
        db,
        `SELECT MAX([purchase_date]) AS [d] FROM trade_purchases
         WHERE [business_id] = @businessId AND [broker_id] = @brokerId
           AND [status] NOT IN ('deleted','cancelled')`,
        [
          { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
          { name: "brokerId", type: sql.UniqueIdentifier, value: brokerId },
        ],
      );
      return row?.d ?? null;
    },

    async getSupplierMetrics(businessId: string, supplierId: string, fromDate: string, toDate: string): Promise<{
      deals: number; total_qty: number; avg_landing: number;
      total_profit: number; purchase_amount: number;
    } | null> {
      return queryOne(
        db,
        `SELECT
          COUNT(DISTINCT tp.[id]) AS [deals],
          COALESCE(SUM(tpl.[qty]), 0) AS [total_qty],
          COALESCE(AVG(tpl.[landing_cost]), 0) AS [avg_landing],
          COALESCE(SUM(tpl.[profit]), 0) AS [total_profit],
          COALESCE(SUM(tpl.[qty] * tpl.[landing_cost]), 0) AS [purchase_amount]
         FROM trade_purchase_lines tpl
         INNER JOIN trade_purchases tp ON tp.[id] = tpl.[trade_purchase_id]
         WHERE tp.[business_id] = @businessId
           AND tp.[supplier_id] = @supplierId
           AND tp.[purchase_date] >= @fromDate
           AND tp.[purchase_date] <= @toDate
           AND tp.[status] NOT IN ('deleted','cancelled')`,
        [
          { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
          { name: "supplierId", type: sql.UniqueIdentifier, value: supplierId },
          { name: "fromDate", type: sql.Date, value: fromDate },
          { name: "toDate", type: sql.Date, value: toDate },
        ],
      );
    },

    async getBrokerMetricsDeals(businessId: string, brokerId: string, fromDate: string, toDate: string): Promise<number> {
      const row = await queryOne<{ deals: number }>(
        db,
        `SELECT COUNT(DISTINCT [id]) AS [deals] FROM trade_purchases
         WHERE [business_id] = @businessId AND [broker_id] = @brokerId
           AND [purchase_date] >= @fromDate AND [purchase_date] <= @toDate
           AND [status] NOT IN ('deleted','cancelled')`,
        [
          { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
          { name: "brokerId", type: sql.UniqueIdentifier, value: brokerId },
          { name: "fromDate", type: sql.Date, value: fromDate },
          { name: "toDate", type: sql.Date, value: toDate },
        ],
      );
      return Number(row?.deals ?? 0);
    },

    async getBrokerMetricsCommission(businessId: string, brokerId: string, fromDate: string, toDate: string): Promise<number> {
      const row = await queryOne<{ tc: number }>(
        db,
        `SELECT COALESCE(SUM([commission_money]), 0) AS [tc] FROM trade_purchases
         WHERE [business_id] = @businessId AND [broker_id] = @brokerId
           AND [purchase_date] >= @fromDate AND [purchase_date] <= @toDate
           AND [status] NOT IN ('deleted','cancelled')`,
        [
          { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
          { name: "brokerId", type: sql.UniqueIdentifier, value: brokerId },
          { name: "fromDate", type: sql.Date, value: fromDate },
          { name: "toDate", type: sql.Date, value: toDate },
        ],
      );
      return Number(row?.tc ?? 0);
    },

    async getBrokerMetricsProfit(businessId: string, brokerId: string, fromDate: string, toDate: string): Promise<number> {
      const row = await queryOne<{ tp: number }>(
        db,
        `SELECT COALESCE(SUM(tpl.[profit]), 0) AS [tp]
         FROM trade_purchase_lines tpl
         INNER JOIN trade_purchases tp ON tp.[id] = tpl.[trade_purchase_id]
         WHERE tp.[business_id] = @businessId AND tp.[broker_id] = @brokerId
           AND tp.[purchase_date] >= @fromDate AND tp.[purchase_date] <= @toDate
           AND tp.[status] NOT IN ('deleted','cancelled')`,
        [
          { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
          { name: "brokerId", type: sql.UniqueIdentifier, value: brokerId },
          { name: "fromDate", type: sql.Date, value: fromDate },
          { name: "toDate", type: sql.Date, value: toDate },
        ],
      );
      return Number(row?.tp ?? 0);
    },

    async getLinkedSuppliers(businessId: string, brokerId: string): Promise<{ id: string; name: string; phone: string | null }[]> {
      return queryMany(
        db,
        `SELECT s.[id], s.[name], s.[phone]
         FROM suppliers s
         INNER JOIN trade_purchases tp ON tp.[supplier_id] = s.[id]
         WHERE tp.[business_id] = @businessId AND tp.[broker_id] = @brokerId
           AND tp.[status] NOT IN ('deleted','cancelled')
         GROUP BY s.[id], s.[name], s.[phone]
         ORDER BY LOWER(s.[name])`,
        [
          { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
          { name: "brokerId", type: sql.UniqueIdentifier, value: brokerId },
        ],
      );
    },
  };
}
