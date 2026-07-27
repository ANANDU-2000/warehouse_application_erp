/**
 * Catalog variants write/read — Formula source: catalog.py variant endpoints
 */
import { randomUUID } from "node:crypto";
import type { ConnectionPool } from "mssql";
import { withTransaction } from "../db/withTransaction";
import { HttpError } from "../errors/httpError";
import type { CatalogVariantsRepository } from "../repositories/catalogVariants.repository";
import { createCatalogVariantsRepository } from "../repositories/catalogVariants.repository";
import type { SqlClient } from "../repositories/sql";
import {
  catalogVariantCreateSchema,
  catalogVariantUpdateSchema,
  type CatalogVariantCreateIn,
  type CatalogVariantUpdateIn,
} from "../validation/catalogVariants.schemas";
import { validateWithSchema } from "../validation/validate";

export type CatalogVariantOut = {
  id: string;
  catalog_item_id: string;
  name: string;
  default_kg_per_bag: number | null;
};

export type CatalogVariantsServiceDeps = {
  variants: CatalogVariantsRepository;
  pool?: ConnectionPool;
  runInTransaction?: <T>(fn: (tx: SqlClient) => Promise<T>) => Promise<T>;
  repoForClient?: (client: SqlClient) => CatalogVariantsRepository;
};

function toOut(row: {
  id: string;
  catalog_item_id: string;
  name: string;
  default_kg_per_bag: number | null;
}): CatalogVariantOut {
  return {
    id: row.id,
    catalog_item_id: row.catalog_item_id,
    name: row.name,
    default_kg_per_bag: row.default_kg_per_bag,
  };
}

function repoOn(
  deps: CatalogVariantsServiceDeps,
  client: SqlClient,
): CatalogVariantsRepository {
  if (deps.repoForClient) return deps.repoForClient(client);
  return createCatalogVariantsRepository(client);
}

export function createCatalogVariantsService(deps: CatalogVariantsServiceDeps) {
  async function runTx<T>(fn: (client: SqlClient) => Promise<T>): Promise<T> {
    if (deps.runInTransaction) return deps.runInTransaction(fn);
    if (!deps.pool) {
      throw new Error("Database pool not connected for catalog variants");
    }
    return withTransaction(deps.pool, (tx) => fn(tx));
  }

  return {
    async list(businessId: string, itemId: string): Promise<CatalogVariantOut[]> {
      const rows = await deps.variants.listByItem(businessId, itemId);
      return rows.map(toOut);
    },

    async create(
      businessId: string,
      itemId: string,
      body: unknown,
    ): Promise<CatalogVariantOut> {
      const data = validateWithSchema(
        catalogVariantCreateSchema,
        body,
        "Invalid catalog variant",
      ) as CatalogVariantCreateIn;

      return runTx(async (tx) => {
        const repo = repoOn(deps, tx);
        if (!(await repo.catalogItemExists(businessId, itemId))) {
          throw new HttpError(404, "Catalog item not found");
        }
        const dup = await repo.findDupVariantId(
          businessId,
          itemId,
          data.name,
        );
        if (dup) {
          throw new HttpError(
            409,
            "A variant with this name already exists for this item",
          );
        }
        const id = randomUUID();
        await repo.insert({
          id,
          businessId,
          catalogItemId: itemId,
          name: data.name,
          defaultKgPerBag: data.default_kg_per_bag ?? null,
        });
        const row = await repo.getById(businessId, id);
        if (!row) throw new HttpError(500, "Created variant not found");
        return toOut(row);
      });
    },

    async update(
      businessId: string,
      variantId: string,
      body: unknown,
    ): Promise<CatalogVariantOut> {
      const data = validateWithSchema(
        catalogVariantUpdateSchema,
        body,
        "Invalid catalog variant patch",
      ) as CatalogVariantUpdateIn;

      return runTx(async (tx) => {
        const repo = repoOn(deps, tx);
        const existing = await repo.getById(businessId, variantId);
        if (!existing) throw new HttpError(404, "Variant not found");

        if (data.name != null) {
          const dup = await repo.findDupVariantId(
            businessId,
            existing.catalog_item_id,
            data.name,
            variantId,
          );
          if (dup) {
            throw new HttpError(
              409,
              "A variant with this name already exists for this item",
            );
          }
        }

        const patch: {
          businessId: string;
          variantId: string;
          name?: string;
          defaultKgPerBag?: number | null;
        } = { businessId, variantId };
        if (data.name != null) patch.name = data.name;
        if ("default_kg_per_bag" in data) {
          patch.defaultKgPerBag = data.default_kg_per_bag ?? null;
        }
        await repo.patch(patch);
        const row = await repo.getById(businessId, variantId);
        if (!row) throw new HttpError(404, "Variant not found");
        return toOut(row);
      });
    },

    async remove(businessId: string, variantId: string): Promise<void> {
      return runTx(async (tx) => {
        const repo = repoOn(deps, tx);
        const existing = await repo.getById(businessId, variantId);
        if (!existing) throw new HttpError(404, "Variant not found");
        const archived = await repo.countArchivedEntryLines(variantId);
        if (archived > 0) {
          throw new HttpError(
            400,
            "Cannot delete a variant that is linked to purchase entry lines",
          );
        }
        await repo.delete(businessId, variantId);
      });
    },
  };
}

export type CatalogVariantsService = ReturnType<
  typeof createCatalogVariantsService
>;
