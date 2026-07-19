/**
 * Catalog variants — Formula source: catalog.py list/create/update/delete variants
 */
import { sql } from "../config/database";
import { queryMany, queryOne, type SqlClient, type SqlParam } from "./sql";

export type CatalogVariantRow = {
  id: string;
  catalog_item_id: string;
  name: string;
  default_kg_per_bag: number | null;
};

export type CatalogVariantsRepository = {
  listByItem(
    businessId: string,
    catalogItemId: string,
  ): Promise<CatalogVariantRow[]>;
  getById(
    businessId: string,
    variantId: string,
  ): Promise<CatalogVariantRow | null>;
  catalogItemExists(businessId: string, itemId: string): Promise<boolean>;
  findDupVariantId(
    businessId: string,
    catalogItemId: string,
    name: string,
    excludeId?: string,
  ): Promise<string | null>;
  insert(row: {
    id: string;
    businessId: string;
    catalogItemId: string;
    name: string;
    defaultKgPerBag: number | null;
  }): Promise<void>;
  patch(args: {
    businessId: string;
    variantId: string;
    name?: string;
    defaultKgPerBag?: number | null;
  }): Promise<void>;
  countArchivedEntryLines(variantId: string): Promise<number>;
  delete(businessId: string, variantId: string): Promise<void>;
};

function mapRow(r: Record<string, unknown>): CatalogVariantRow {
  return {
    id: String(r.id),
    catalog_item_id: String(r.catalog_item_id),
    name: String(r.name),
    default_kg_per_bag:
      r.default_kg_per_bag != null ? Number(r.default_kg_per_bag) : null,
  };
}

export function createCatalogVariantsRepository(
  db: SqlClient,
): CatalogVariantsRepository {
  return {
    async listByItem(businessId, catalogItemId) {
      const rows = await queryMany<Record<string, unknown>>(
        db,
        `SELECT [id], [catalog_item_id], [name], [default_kg_per_bag]
         FROM catalog_variants
         WHERE [business_id] = @businessId AND [catalog_item_id] = @itemId
         ORDER BY LOWER([name])`,
        [
          { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
          { name: "itemId", type: sql.UniqueIdentifier, value: catalogItemId },
        ],
      );
      return rows.map(mapRow);
    },

    async getById(businessId, variantId) {
      const row = await queryOne<Record<string, unknown>>(
        db,
        `SELECT [id], [catalog_item_id], [name], [default_kg_per_bag]
         FROM catalog_variants
         WHERE [id] = @variantId AND [business_id] = @businessId`,
        [
          { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
          { name: "variantId", type: sql.UniqueIdentifier, value: variantId },
        ],
      );
      return row ? mapRow(row) : null;
    },

    async catalogItemExists(businessId, itemId) {
      const row = await queryOne<Record<string, unknown>>(
        db,
        `SELECT [id] FROM catalog_items
         WHERE [id] = @itemId AND [business_id] = @businessId`,
        [
          { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
          { name: "itemId", type: sql.UniqueIdentifier, value: itemId },
        ],
      );
      return row != null;
    },

    async findDupVariantId(businessId, catalogItemId, name, excludeId) {
      const { normName } = await import("../validation/catalogItems.schemas");
      const params: SqlParam[] = [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "itemId", type: sql.UniqueIdentifier, value: catalogItemId },
        { name: "name", type: sql.NVarChar(512), value: normName(name) },
      ];
      let sqlText = `SELECT TOP 1 [id] FROM catalog_variants
        WHERE [business_id] = @businessId AND [catalog_item_id] = @itemId
          AND LOWER(LTRIM(RTRIM([name]))) = @name`;
      if (excludeId) {
        sqlText += ` AND [id] <> @excludeId`;
        params.push({
          name: "excludeId",
          type: sql.UniqueIdentifier,
          value: excludeId,
        });
      }
      const row = await queryOne<Record<string, unknown>>(db, sqlText, params);
      return row ? String(row.id) : null;
    },

    async insert(row) {
      await queryOne(
        db,
        `INSERT INTO catalog_variants
           ([id], [business_id], [catalog_item_id], [name], [default_kg_per_bag], [created_at])
         VALUES (@id, @businessId, @itemId, @name, @dkg, SYSUTCDATETIME())`,
        [
          { name: "id", type: sql.UniqueIdentifier, value: row.id },
          { name: "businessId", type: sql.UniqueIdentifier, value: row.businessId },
          { name: "itemId", type: sql.UniqueIdentifier, value: row.catalogItemId },
          { name: "name", type: sql.NVarChar(512), value: row.name },
          { name: "dkg", type: sql.Decimal(12, 3), value: row.defaultKgPerBag },
        ],
      );
    },

    async patch(args) {
      const sets: string[] = [];
      const params: SqlParam[] = [
        { name: "businessId", type: sql.UniqueIdentifier, value: args.businessId },
        { name: "variantId", type: sql.UniqueIdentifier, value: args.variantId },
      ];
      if (args.name != null) {
        sets.push("[name] = @name");
        params.push({ name: "name", type: sql.NVarChar(512), value: args.name });
      }
      if ("defaultKgPerBag" in args) {
        sets.push("[default_kg_per_bag] = @dkg");
        params.push({
          name: "dkg",
          type: sql.Decimal(12, 3),
          value: args.defaultKgPerBag ?? null,
        });
      }
      if (sets.length === 0) return;
      await queryOne(
        db,
        `UPDATE catalog_variants SET ${sets.join(", ")}
         WHERE [id] = @variantId AND [business_id] = @businessId`,
        params,
      );
    },

    async countArchivedEntryLines(variantId) {
      try {
        const row = await queryOne<Record<string, unknown>>(
          db,
          `SELECT COUNT(*) AS [c] FROM _archived_entry_line_items
           WHERE [catalog_variant_id] = @variantId`,
          [{ name: "variantId", type: sql.UniqueIdentifier, value: variantId }],
        );
        return Number(row?.c ?? 0);
      } catch {
        return 0;
      }
    },

    async delete(businessId, variantId) {
      await queryOne(
        db,
        `DELETE FROM catalog_variants
         WHERE [id] = @variantId AND [business_id] = @businessId`,
        [
          { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
          { name: "variantId", type: sql.UniqueIdentifier, value: variantId },
        ],
      );
    },
  };
}
