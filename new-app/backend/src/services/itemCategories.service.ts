/**
 * Item categories service — Formula source: catalog.py item-categories / category-types
 */
import { randomUUID } from "node:crypto";
import type { ConnectionPool } from "mssql";
import { withTransaction } from "../db/withTransaction";
import { HttpError } from "../errors/httpError";
import type {
  CategoryTypeIndexRow,
  CategoryTypeRow,
  ItemCategoriesRepository,
  ItemCategoryRow,
} from "../repositories/itemCategories.repository";
import {
  GENERAL_TYPE_NAME,
  createItemCategoriesRepository,
} from "../repositories/itemCategories.repository";
import type { SqlClient } from "../repositories/sql";
import {
  categoryTypeCreateSchema,
  categoryTypeUpdateSchema,
  itemCategoryCreateSchema,
  itemCategoryUpdateSchema,
} from "../validation/itemCategories.schemas";
import { validateWithSchema } from "../validation/validate";

export type ItemCategoriesServiceDeps = {
  categories: ItemCategoriesRepository;
  pool?: ConnectionPool;
  runInTransaction?: <T>(fn: (tx: SqlClient) => Promise<T>) => Promise<T>;
  repoForClient?: (client: SqlClient) => ItemCategoriesRepository;
};

function repoOn(
  deps: ItemCategoriesServiceDeps,
  client: SqlClient,
): ItemCategoriesRepository {
  if (deps.repoForClient) return deps.repoForClient(client);
  return createItemCategoriesRepository(client);
}

export function createItemCategoriesService(deps: ItemCategoriesServiceDeps) {
  async function runTx<T>(fn: (client: SqlClient) => Promise<T>): Promise<T> {
    if (deps.runInTransaction) return deps.runInTransaction(fn);
    if (!deps.pool) {
      throw new Error("Database pool not connected for item categories");
    }
    return withTransaction(deps.pool, (tx) => fn(tx));
  }

  return {
    async list(businessId: string): Promise<ItemCategoryRow[]> {
      return deps.categories.list(businessId);
    },

    async getById(
      businessId: string,
      categoryId: string,
    ): Promise<ItemCategoryRow> {
      const row = await deps.categories.getById(businessId, categoryId);
      if (!row) throw new HttpError(404, "Category not found");
      return row;
    },

    async create(businessId: string, body: unknown): Promise<ItemCategoryRow> {
      const data = validateWithSchema(
        itemCategoryCreateSchema,
        body,
        "Invalid item category",
      );
      return runTx(async (tx) => {
        const repo = repoOn(deps, tx);
        const dup = await repo.findDupCategoryId(businessId, data.name);
        if (dup) {
          throw new HttpError(409, "A category with this name already exists");
        }
        const id = randomUUID();
        await repo.insertCategory({
          id,
          businessId,
          name: data.name,
        });
        await repo.insertType({
          id: randomUUID(),
          categoryId: id,
          name: GENERAL_TYPE_NAME,
        });
        const row = await repo.getById(businessId, id);
        if (!row) throw new HttpError(500, "Created category not found");
        return row;
      });
    },

    /** Source: catalog.py update_item_category */
    async update(
      businessId: string,
      categoryId: string,
      body: unknown,
    ): Promise<ItemCategoryRow> {
      const data = validateWithSchema(
        itemCategoryUpdateSchema,
        body,
        "Invalid item category update",
      );
      return runTx(async (tx) => {
        const repo = repoOn(deps, tx);
        const existing = await repo.getById(businessId, categoryId);
        if (!existing) throw new HttpError(404, "Category not found");
        if (data.name !== undefined) {
          const dup = await repo.findDupCategoryId(
            businessId,
            data.name,
            categoryId,
          );
          if (dup) {
            throw new HttpError(409, "A category with this name already exists");
          }
          await repo.updateCategoryName(businessId, categoryId, data.name);
        }
        const row = await repo.getById(businessId, categoryId);
        if (!row) throw new HttpError(404, "Category not found");
        return row;
      });
    },

    /** Source: catalog.py delete_item_category — owner gate at route */
    async remove(businessId: string, categoryId: string): Promise<void> {
      return runTx(async (tx) => {
        const repo = repoOn(deps, tx);
        const existing = await repo.getById(businessId, categoryId);
        if (!existing) throw new HttpError(404, "Category not found");
        const n = await repo.countCatalogItemsByCategory(categoryId);
        if (n > 0) {
          throw new HttpError(
            400,
            "Cannot delete a category that still has catalog items — delete or move items first",
          );
        }
        await repo.deleteCategory(businessId, categoryId);
      });
    },

    async listTypesIndex(
      businessId: string,
    ): Promise<CategoryTypeIndexRow[]> {
      return deps.categories.listTypesIndex(businessId);
    },

    /** Source: catalog.py list_category_types */
    async listTypes(
      businessId: string,
      categoryId: string,
    ): Promise<CategoryTypeRow[]> {
      const cat = await deps.categories.getById(businessId, categoryId);
      if (!cat) throw new HttpError(404, "Category not found");
      return deps.categories.listTypes(categoryId);
    },

    /** Source: catalog.py create_category_type */
    async createType(
      businessId: string,
      categoryId: string,
      body: unknown,
    ): Promise<CategoryTypeRow> {
      const data = validateWithSchema(
        categoryTypeCreateSchema,
        body,
        "Invalid category type",
      );
      return runTx(async (tx) => {
        const repo = repoOn(deps, tx);
        const cat = await repo.getById(businessId, categoryId);
        if (!cat) throw new HttpError(404, "Category not found");
        const dup = await repo.findDupTypeId(categoryId, data.name);
        if (dup) {
          throw new HttpError(
            409,
            "A type with this name already exists in this category",
          );
        }
        const id = randomUUID();
        await repo.insertType({
          id,
          categoryId,
          name: data.name,
        });
        const row = await repo.getTypeById(businessId, categoryId, id);
        if (!row) throw new HttpError(500, "Created type not found");
        return row;
      });
    },

    /** Source: catalog.py update_category_type */
    async updateType(
      businessId: string,
      categoryId: string,
      typeId: string,
      body: unknown,
    ): Promise<CategoryTypeRow> {
      const data = validateWithSchema(
        categoryTypeUpdateSchema,
        body,
        "Invalid category type update",
      );
      return runTx(async (tx) => {
        const repo = repoOn(deps, tx);
        const existing = await repo.getTypeById(
          businessId,
          categoryId,
          typeId,
        );
        if (!existing) throw new HttpError(404, "Type not found");
        if (data.name !== undefined) {
          const dup = await repo.findDupTypeId(
            categoryId,
            data.name,
            typeId,
          );
          if (dup) {
            throw new HttpError(
              409,
              "A type with this name already exists in this category",
            );
          }
          await repo.updateTypeName(categoryId, typeId, data.name);
        }
        const row = await repo.getTypeById(businessId, categoryId, typeId);
        if (!row) throw new HttpError(404, "Type not found");
        return row;
      });
    },

    /** Source: catalog.py delete_category_type — owner gate at route */
    async removeType(
      businessId: string,
      categoryId: string,
      typeId: string,
    ): Promise<void> {
      return runTx(async (tx) => {
        const repo = repoOn(deps, tx);
        const existing = await repo.getTypeById(
          businessId,
          categoryId,
          typeId,
        );
        if (!existing) throw new HttpError(404, "Type not found");
        const n = await repo.countCatalogItemsByType(typeId);
        if (n > 0) {
          throw new HttpError(
            400,
            "Cannot delete a type that still has catalog items — move or delete items first",
          );
        }
        await repo.deleteType(categoryId, typeId);
      });
    },
  };
}

export type ItemCategoriesService = ReturnType<
  typeof createItemCategoriesService
>;
