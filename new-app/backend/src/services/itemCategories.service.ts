/**
 * Item categories service — Formula source: catalog.py list/create/get + types-index
 */
import { randomUUID } from "node:crypto";
import type { ConnectionPool } from "mssql";
import { withTransaction } from "../db/withTransaction";
import { HttpError } from "../errors/httpError";
import type {
  CategoryTypeIndexRow,
  ItemCategoriesRepository,
  ItemCategoryRow,
} from "../repositories/itemCategories.repository";
import {
  GENERAL_TYPE_NAME,
  createItemCategoriesRepository,
} from "../repositories/itemCategories.repository";
import type { SqlClient } from "../repositories/sql";
import { itemCategoryCreateSchema } from "../validation/itemCategories.schemas";
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

    async listTypesIndex(
      businessId: string,
    ): Promise<CategoryTypeIndexRow[]> {
      return deps.categories.listTypesIndex(businessId);
    },
  };
}

export type ItemCategoriesService = ReturnType<
  typeof createItemCategoriesService
>;
