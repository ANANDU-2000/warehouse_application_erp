/**
 * Item categories — Formula source: catalog.py item-categories endpoints
 */
import { sql } from "../config/database";
import { queryMany, queryOne, type SqlClient, type SqlParam } from "./sql";
import { normName } from "../validation/catalogItems.schemas";

export const GENERAL_TYPE_NAME = "General";

export type ItemCategoryRow = {
  id: string;
  name: string;
};

export type CategoryTypeIndexRow = {
  id: string;
  category_id: string;
  category_name: string;
  name: string;
};

export type ItemCategoriesRepository = {
  list(businessId: string): Promise<ItemCategoryRow[]>;
  getById(
    businessId: string,
    categoryId: string,
  ): Promise<ItemCategoryRow | null>;
  findDupCategoryId(
    businessId: string,
    name: string,
    excludeId?: string,
  ): Promise<string | null>;
  insertCategory(row: {
    id: string;
    businessId: string;
    name: string;
  }): Promise<void>;
  insertType(row: {
    id: string;
    categoryId: string;
    name: string;
  }): Promise<void>;
  listTypesIndex(businessId: string): Promise<CategoryTypeIndexRow[]>;
};

export function createItemCategoriesRepository(
  db: SqlClient,
): ItemCategoriesRepository {
  return {
    async list(businessId) {
      const rows = await queryMany<Record<string, unknown>>(
        db,
        `SELECT [id], [name] FROM item_categories
         WHERE [business_id] = @businessId
         ORDER BY LOWER([name])`,
        [{ name: "businessId", type: sql.UniqueIdentifier, value: businessId }],
      );
      return rows.map((r) => ({
        id: String(r.id),
        name: String(r.name),
      }));
    },

    async getById(businessId, categoryId) {
      const row = await queryOne<Record<string, unknown>>(
        db,
        `SELECT [id], [name] FROM item_categories
         WHERE [id] = @categoryId AND [business_id] = @businessId`,
        [
          { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
          { name: "categoryId", type: sql.UniqueIdentifier, value: categoryId },
        ],
      );
      if (!row) return null;
      return { id: String(row.id), name: String(row.name) };
    },

    async findDupCategoryId(businessId, name, excludeId) {
      const params: SqlParam[] = [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "name", type: sql.NVarChar(255), value: normName(name) },
      ];
      let sqlText = `SELECT TOP 1 [id] FROM item_categories
        WHERE [business_id] = @businessId
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

    async insertCategory(row) {
      await queryOne(
        db,
        `INSERT INTO item_categories ([id], [business_id], [name], [created_at])
         VALUES (@id, @businessId, @name, SYSUTCDATETIME())`,
        [
          { name: "id", type: sql.UniqueIdentifier, value: row.id },
          { name: "businessId", type: sql.UniqueIdentifier, value: row.businessId },
          { name: "name", type: sql.NVarChar(255), value: row.name },
        ],
      );
    },

    async insertType(row) {
      await queryOne(
        db,
        `INSERT INTO category_types ([id], [category_id], [name], [created_at])
         VALUES (@id, @categoryId, @name, SYSUTCDATETIME())`,
        [
          { name: "id", type: sql.UniqueIdentifier, value: row.id },
          { name: "categoryId", type: sql.UniqueIdentifier, value: row.categoryId },
          { name: "name", type: sql.NVarChar(255), value: row.name },
        ],
      );
    },

    async listTypesIndex(businessId) {
      const rows = await queryMany<Record<string, unknown>>(
        db,
        `SELECT ct.[id], ct.[category_id], ic.[name] AS [category_name], ct.[name]
         FROM category_types ct
         INNER JOIN item_categories ic ON ic.[id] = ct.[category_id]
         WHERE ic.[business_id] = @businessId
         ORDER BY LOWER(ic.[name]), LOWER(ct.[name])`,
        [{ name: "businessId", type: sql.UniqueIdentifier, value: businessId }],
      );
      return rows.map((r) => ({
        id: String(r.id),
        category_id: String(r.category_id),
        category_name: String(r.category_name),
        name: String(r.name),
      }));
    },
  };
}
