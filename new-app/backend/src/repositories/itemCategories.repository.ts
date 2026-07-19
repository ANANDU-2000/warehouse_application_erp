/**
 * Item categories — Formula source: catalog.py item-categories / category-types
 */
import { sql } from "../config/database";
import { queryMany, queryOne, type SqlClient, type SqlParam } from "./sql";
import { normName } from "../validation/catalogItems.schemas";

export const GENERAL_TYPE_NAME = "General";

export type ItemCategoryRow = {
  id: string;
  name: string;
};

export type CategoryTypeRow = {
  id: string;
  category_id: string;
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
  updateCategoryName(
    businessId: string,
    categoryId: string,
    name: string,
  ): Promise<void>;
  countCatalogItemsByCategory(categoryId: string): Promise<number>;
  deleteCategory(businessId: string, categoryId: string): Promise<void>;
  insertType(row: {
    id: string;
    categoryId: string;
    name: string;
  }): Promise<void>;
  listTypes(categoryId: string): Promise<CategoryTypeRow[]>;
  getTypeById(
    businessId: string,
    categoryId: string,
    typeId: string,
  ): Promise<CategoryTypeRow | null>;
  findDupTypeId(
    categoryId: string,
    name: string,
    excludeId?: string,
  ): Promise<string | null>;
  updateTypeName(
    categoryId: string,
    typeId: string,
    name: string,
  ): Promise<void>;
  countCatalogItemsByType(typeId: string): Promise<number>;
  deleteType(categoryId: string, typeId: string): Promise<void>;
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
          {
            name: "businessId",
            type: sql.UniqueIdentifier,
            value: row.businessId,
          },
          { name: "name", type: sql.NVarChar(255), value: row.name },
        ],
      );
    },

    async updateCategoryName(businessId, categoryId, name) {
      await queryOne(
        db,
        `UPDATE item_categories SET [name] = @name
         WHERE [id] = @categoryId AND [business_id] = @businessId`,
        [
          { name: "name", type: sql.NVarChar(255), value: name },
          { name: "categoryId", type: sql.UniqueIdentifier, value: categoryId },
          { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        ],
      );
    },

    async countCatalogItemsByCategory(categoryId) {
      const row = await queryOne<Record<string, unknown>>(
        db,
        `SELECT COUNT(*) AS [cnt] FROM catalog_items
         WHERE [category_id] = @categoryId`,
        [
          { name: "categoryId", type: sql.UniqueIdentifier, value: categoryId },
        ],
      );
      return Number(row?.cnt ?? 0);
    },

    async deleteCategory(businessId, categoryId) {
      await queryOne(
        db,
        `DELETE FROM item_categories
         WHERE [id] = @categoryId AND [business_id] = @businessId`,
        [
          { name: "categoryId", type: sql.UniqueIdentifier, value: categoryId },
          { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
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
          {
            name: "categoryId",
            type: sql.UniqueIdentifier,
            value: row.categoryId,
          },
          { name: "name", type: sql.NVarChar(255), value: row.name },
        ],
      );
    },

    async listTypes(categoryId) {
      const rows = await queryMany<Record<string, unknown>>(
        db,
        `SELECT [id], [category_id], [name] FROM category_types
         WHERE [category_id] = @categoryId
         ORDER BY LOWER([name])`,
        [
          { name: "categoryId", type: sql.UniqueIdentifier, value: categoryId },
        ],
      );
      return rows.map((r) => ({
        id: String(r.id),
        category_id: String(r.category_id),
        name: String(r.name),
      }));
    },

    async getTypeById(businessId, categoryId, typeId) {
      const row = await queryOne<Record<string, unknown>>(
        db,
        `SELECT ct.[id], ct.[category_id], ct.[name]
         FROM category_types ct
         INNER JOIN item_categories ic ON ic.[id] = ct.[category_id]
         WHERE ct.[id] = @typeId
           AND ct.[category_id] = @categoryId
           AND ic.[business_id] = @businessId`,
        [
          { name: "typeId", type: sql.UniqueIdentifier, value: typeId },
          { name: "categoryId", type: sql.UniqueIdentifier, value: categoryId },
          { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        ],
      );
      if (!row) return null;
      return {
        id: String(row.id),
        category_id: String(row.category_id),
        name: String(row.name),
      };
    },

    async findDupTypeId(categoryId, name, excludeId) {
      const params: SqlParam[] = [
        { name: "categoryId", type: sql.UniqueIdentifier, value: categoryId },
        { name: "name", type: sql.NVarChar(255), value: normName(name) },
      ];
      let sqlText = `SELECT TOP 1 [id] FROM category_types
        WHERE [category_id] = @categoryId
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

    async updateTypeName(categoryId, typeId, name) {
      await queryOne(
        db,
        `UPDATE category_types SET [name] = @name
         WHERE [id] = @typeId AND [category_id] = @categoryId`,
        [
          { name: "name", type: sql.NVarChar(255), value: name },
          { name: "typeId", type: sql.UniqueIdentifier, value: typeId },
          { name: "categoryId", type: sql.UniqueIdentifier, value: categoryId },
        ],
      );
    },

    async countCatalogItemsByType(typeId) {
      const row = await queryOne<Record<string, unknown>>(
        db,
        `SELECT COUNT(*) AS [cnt] FROM catalog_items
         WHERE [type_id] = @typeId`,
        [{ name: "typeId", type: sql.UniqueIdentifier, value: typeId }],
      );
      return Number(row?.cnt ?? 0);
    },

    async deleteType(categoryId, typeId) {
      await queryOne(
        db,
        `DELETE FROM category_types
         WHERE [id] = @typeId AND [category_id] = @categoryId`,
        [
          { name: "typeId", type: sql.UniqueIdentifier, value: typeId },
          { name: "categoryId", type: sql.UniqueIdentifier, value: categoryId },
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
