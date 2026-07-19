/**
 * Catalog items write orchestration — Slice 2
 * Formula source: catalog.py create_catalog_item / update_catalog_item / delete_catalog_item
 */
import { randomUUID } from "node:crypto";
import type { ConnectionPool } from "mssql";
import { withTransaction } from "../db/withTransaction";
import { HttpError } from "../errors/httpError";
import type {
  CatalogItemEnriched,
  CatalogItemsRepository,
} from "../repositories/catalogItems.repository";
import { createCatalogItemsRepository } from "../repositories/catalogItems.repository";
import type { SqlClient } from "../repositories/sql";
import {
  catalogItemCreateSchema,
  catalogItemUpdateSchema,
  coerceBoxItemsPerBox,
  dedupePreserveOrder,
  normalizePackageType,
  type CatalogItemCreateIn,
  type CatalogItemUpdateIn,
} from "../validation/catalogItems.schemas";
import { validateWithSchema } from "../validation/validate";
import {
  maybeRedactCatalogOut,
  toCatalogItemOut,
  type CatalogItemOut,
} from "./catalogItems.service";
import {
  mergeUnitResolutionIntoCatalogRow,
  resolveForCatalogItem,
  type CatalogItemUnitFields,
} from "./unitResolution.service";

export type CatalogItemsWriteDeps = {
  /** Factory pool — createCatalogItemsRepository(pool) for reads outside tx */
  catalogItems: CatalogItemsRepository;
  pool?: ConnectionPool;
  /** Test seam */
  runInTransaction?: <T>(fn: (tx: SqlClient) => Promise<T>) => Promise<T>;
  /** Test seam — inject repo bound to tx */
  repoForClient?: (client: SqlClient) => CatalogItemsRepository;
};

function repoOn(
  deps: CatalogItemsWriteDeps,
  client: SqlClient,
): CatalogItemsRepository {
  if (deps.repoForClient) return deps.repoForClient(client);
  return createCatalogItemsRepository(client);
}

/** Formula source: catalog.py:_apply_canonical_unit_profile */
export function applyCanonicalUnitProfile(
  item: CatalogItemUnitFields & {
    default_kg_per_bag?: number | null;
    validation_status?: string | null;
  },
  unit: string,
): void {
  const u = (unit || "").trim().toLowerCase();
  if (u === "bag") {
    item.package_type = item.package_type || "SACK";
    item.stock_unit = "BAG";
    item.display_unit = "BAG";
    item.selling_unit = "BAG";
    if (item.default_kg_per_bag != null) {
      item.package_size = item.default_kg_per_bag;
      item.package_measurement = "KG";
    }
    item.validation_status = "unit_profile_verified";
  } else if (u === "kg") {
    item.package_type = item.package_type || "LOOSE";
    item.stock_unit = "KG";
    item.display_unit = "KG";
    item.selling_unit = "KG";
  } else if (u === "box") {
    item.package_type = item.package_type || "BOX";
    item.stock_unit = "BOX";
    item.display_unit = "BOX";
  } else if (u === "tin") {
    item.package_type = item.package_type || "TIN";
    item.stock_unit = "TIN";
    item.display_unit = "TIN";
  } else if (u === "piece") {
    item.package_type = item.package_type || "PIECE";
    item.stock_unit = "PIECE";
    item.display_unit = "PC";
    item.selling_unit = "PCS";
    if (item.default_kg_per_bag != null) {
      item.package_size = item.default_kg_per_bag;
      item.package_measurement = "KG";
    }
  }
}

function brandGuess(name: string): boolean {
  const parts = name.split(/\s+/);
  return parts.length >= 2 && /^[A-Za-z]{2,}$/.test(parts[0] ?? "");
}

function stripOpt(v: string | null | undefined): string | null {
  if (v == null) return null;
  const t = v.trim();
  return t ? t : null;
}

export function createCatalogItemsWriteService(deps: CatalogItemsWriteDeps) {
  async function runTx<T>(fn: (client: SqlClient) => Promise<T>): Promise<T> {
    if (deps.runInTransaction) return deps.runInTransaction(fn);
    if (!deps.pool) {
      throw new Error("Database pool not connected for catalog writes");
    }
    return withTransaction(deps.pool, (tx) => fn(tx));
  }

  return {
    async create(
      businessId: string,
      body: unknown,
      role: string | null,
    ): Promise<CatalogItemOut> {
      const data = validateWithSchema(
        catalogItemCreateSchema,
        body,
        "Invalid catalog item",
      ) as CatalogItemCreateIn;

      return runTx(async (tx) => {
        const repo = repoOn(deps, tx);

        if (!(await repo.categoryExists(businessId, data.category_id))) {
          throw new HttpError(400, "category_id not found in this business");
        }

        let resolvedType: string;
        if (data.type_id) {
          await repo.verifyTypeInCategory(
            businessId,
            data.category_id,
            data.type_id,
          );
          resolvedType = data.type_id;
        } else {
          resolvedType = await repo.getOrCreateGeneralTypeId(
            businessId,
            data.category_id,
          );
        }

        const dupId = await repo.findDupItemId(
          businessId,
          data.category_id,
          resolvedType,
          data.name,
        );
        if (dupId) {
          throw new HttpError(409, {
            message:
              "An item with this name already exists for this category and type",
            existing_item_id: dupId,
          });
        }

        const u = data.default_unit;
        const dkg = u === "bag" || u === "piece" ? data.default_kg_per_bag ?? null : null;
        const dbox =
          u === "box"
            ? coerceBoxItemsPerBox(data.default_items_per_box ?? null)
            : null;
        const dwt = u === "tin" ? data.default_weight_per_tin ?? null : null;
        const purchaseU = data.default_purchase_unit || data.default_unit;
        const supplierIds = dedupePreserveOrder(data.default_supplier_ids ?? []);
        const brokerIds = dedupePreserveOrder(data.default_broker_ids ?? []);
        await repo.assertSupplierIdsInBusiness(businessId, supplierIds);
        await repo.assertBrokerIdsInBusiness(businessId, brokerIds);

        let finalItemCode = stripOpt(data.item_code ?? null);
        if (!finalItemCode) {
          finalItemCode = await repo.nextItemCode(businessId);
        }
        let finalBarcode = data.barcode ? data.barcode.trim() : null;
        if (!finalBarcode && finalItemCode) finalBarcode = finalItemCode;

        const draft: CatalogItemUnitFields & {
          name: string;
          default_kg_per_bag: number | null;
          validation_status: string | null;
        } = {
          name: data.name,
          default_kg_per_bag: dkg,
          package_type: normalizePackageType(data.package_type ?? null),
          selling_unit: null,
          stock_unit: null,
          display_unit: null,
          package_size: null,
          package_measurement: null,
          conversion_factor: null,
          unit_confidence: null,
          validation_status: null,
          smart_classification: null,
        };
        applyCanonicalUnitProfile(draft, u);

        const id = randomUUID();
        const publicToken = randomUUID().replace(/-/g, "");
        await repo.insertItem({
          id,
          businessId,
          categoryId: data.category_id,
          typeId: resolvedType,
          name: data.name,
          defaultUnit: u,
          defaultKgPerBag: dkg,
          defaultItemsPerBox: dbox,
          defaultWeightPerTin: dwt,
          defaultPurchaseUnit: purchaseU,
          defaultSaleUnit: data.default_sale_unit ?? null,
          hsnCode: stripOpt(data.hsn_code ?? null),
          itemCode: finalItemCode,
          barcode: finalBarcode,
          publicToken,
          taxPercent: data.tax_percent ?? null,
          defaultLandingCost: data.default_landing_cost ?? null,
          defaultSellingCost: data.default_selling_cost ?? null,
          packageType: draft.package_type ?? null,
          sellingUnit: draft.selling_unit ?? null,
          stockUnit: draft.stock_unit ?? null,
          displayUnit: draft.display_unit ?? null,
          packageSize: draft.package_size ?? null,
          packageMeasurement: draft.package_measurement ?? null,
          validationStatus: draft.validation_status ?? null,
        });

        const catName = await repo.getCategoryName(businessId, data.category_id);
        const ur = resolveForCatalogItem(draft, {
          itemName: data.name,
          categoryName: catName,
          brandDetected: brandGuess(data.name),
        });
        mergeUnitResolutionIntoCatalogRow(draft, ur);
        await repo.updateSmartFields(id, {
          normalizedName: data.name.trim().toUpperCase().slice(0, 512) || null,
          sellingUnit: draft.selling_unit ?? null,
          stockUnit: draft.stock_unit ?? null,
          displayUnit: draft.display_unit ?? null,
          packageType: draft.package_type ?? null,
          packageSize: draft.package_size ?? null,
          packageMeasurement: draft.package_measurement ?? null,
          conversionFactor: draft.conversion_factor ?? null,
          unitConfidence: draft.unit_confidence ?? null,
          smartClassification: draft.smart_classification ?? null,
          defaultKgPerBag: draft.default_kg_per_bag ?? null,
          validationStatus: draft.validation_status ?? null,
        });

        await repo.replaceDefaultSuppliers(businessId, id, supplierIds);
        await repo.replaceDefaultBrokers(businessId, id, brokerIds);
        await repo.seedSupplierItemDefaults(businessId, id, supplierIds);

        const row = await repo.getById(businessId, id);
        if (!row) throw new HttpError(500, "Created item not found");
        return maybeRedactCatalogOut(toCatalogItemOut(row), role);
      });
    },

    async update(
      businessId: string,
      itemId: string,
      body: unknown,
      role: string | null,
    ): Promise<CatalogItemOut> {
      const data = validateWithSchema(
        catalogItemUpdateSchema,
        body,
        "Invalid catalog item patch",
      ) as CatalogItemUpdateIn;
      const keys = Object.keys(data);
      if (keys.length === 0) {
        const row = await deps.catalogItems.getById(businessId, itemId);
        if (!row) throw new HttpError(404, "Item not found");
        return maybeRedactCatalogOut(toCatalogItemOut(row), role);
      }

      return runTx(async (tx) => {
        const repo = repoOn(deps, tx);

        const existing = await repo.getById(businessId, itemId);
        if (!existing) throw new HttpError(404, "Item not found");

        let cid = existing.category_id;
        let tid = existing.type_id;

        if (data.category_id != null) {
          if (!(await repo.categoryExists(businessId, data.category_id))) {
            throw new HttpError(400, "category_id not found");
          }
          cid = data.category_id;
          if (!("type_id" in data)) {
            tid = await repo.getOrCreateGeneralTypeId(businessId, cid);
          }
        }
        if ("type_id" in data) {
          if (data.type_id == null) {
            tid = await repo.getOrCreateGeneralTypeId(businessId, cid);
          } else {
            await repo.verifyTypeInCategory(businessId, cid, data.type_id);
            tid = data.type_id;
          }
        }

        if (data.name != null) {
          const dupId = await repo.findDupItemId(
            businessId,
            cid,
            tid,
            data.name,
            itemId,
          );
          if (dupId) {
            throw new HttpError(409, {
              message:
                "An item with this name already exists for this category and type",
              existing_item_id: dupId,
            });
          }
        }

        if ("default_supplier_ids" in data) {
          const ids = dedupePreserveOrder(data.default_supplier_ids ?? []);
          if (ids.length === 0) {
            throw new HttpError(
              400,
              "At least one default_supplier_ids entry is required when updating defaults",
            );
          }
          await repo.assertSupplierIdsInBusiness(businessId, ids);
        }
        if ("default_broker_ids" in data) {
          const ids = dedupePreserveOrder(data.default_broker_ids ?? []);
          await repo.assertBrokerIdsInBusiness(businessId, ids);
        }

        await repo.patchItem({
          businessId,
          itemId,
          patch: data,
          categoryId: cid,
          typeId: tid,
        });

        const after = await repo.getById(businessId, itemId);
        if (!after) throw new HttpError(404, "Item not found");

        const profileTouched = [
          "name",
          "category_id",
          "default_unit",
          "default_kg_per_bag",
          "default_items_per_box",
          "default_weight_per_tin",
        ].some((k) => k in data);
        if (profileTouched) {
          const draft: CatalogItemUnitFields & {
            name: string;
            default_kg_per_bag: number | null;
          } = {
            name: after.name,
            selling_unit: after.selling_unit,
            stock_unit: after.stock_unit,
            display_unit: after.display_unit,
            package_type: after.package_type,
            package_size: after.package_size,
            package_measurement: after.package_measurement,
            conversion_factor: after.conversion_factor,
            unit_confidence: after.unit_confidence,
            validation_status: after.validation_status,
            smart_classification: after.smart_classification,
            default_kg_per_bag: after.default_kg_per_bag,
          };
          if (data.default_unit) {
            applyCanonicalUnitProfile(draft, data.default_unit);
          }
          const ur = resolveForCatalogItem(draft, {
            itemName: after.name,
            categoryName: after.category_name,
            brandDetected: brandGuess(after.name),
          });
          mergeUnitResolutionIntoCatalogRow(draft, ur);
          await repo.updateSmartFields(itemId, {
            normalizedName: after.name.trim().toUpperCase().slice(0, 512) || null,
            sellingUnit: draft.selling_unit ?? null,
            stockUnit: draft.stock_unit ?? null,
            displayUnit: draft.display_unit ?? null,
            packageType: draft.package_type ?? null,
            packageSize: draft.package_size ?? null,
            packageMeasurement: draft.package_measurement ?? null,
            conversionFactor: draft.conversion_factor ?? null,
            unitConfidence: draft.unit_confidence ?? null,
            smartClassification: draft.smart_classification ?? null,
            defaultKgPerBag: draft.default_kg_per_bag ?? null,
            validationStatus: draft.validation_status ?? null,
          });
        }

        if ("default_supplier_ids" in data) {
          const ids = dedupePreserveOrder(data.default_supplier_ids ?? []);
          await repo.replaceDefaultSuppliers(businessId, itemId, ids);
          await repo.seedSupplierItemDefaults(businessId, itemId, ids);
        }
        if ("default_broker_ids" in data) {
          const ids = dedupePreserveOrder(data.default_broker_ids ?? []);
          await repo.replaceDefaultBrokers(businessId, itemId, ids);
        }

        const row = await repo.getById(businessId, itemId);
        if (!row) throw new HttpError(404, "Item not found");
        return maybeRedactCatalogOut(toCatalogItemOut(row), role);
      });
    },

    async remove(businessId: string, itemId: string): Promise<void> {
      return runTx(async (tx) => {
        const repo = repoOn(deps, tx);
        const existing = await repo.getById(businessId, itemId);
        if (!existing) throw new HttpError(404, "Item not found");

        const lines = await repo.countTradeLines(itemId);
        if (lines > 0) {
          throw new HttpError(
            400,
            "Cannot delete a catalog item that is linked to wholesale purchase lines",
          );
        }
        const vids = await repo.listVariantIds(businessId, itemId);
        const archived = await repo.countArchivedEntryLinesForVariants(vids);
        if (archived > 0) {
          throw new HttpError(
            400,
            "Cannot delete a catalog item whose variants are linked to legacy purchase entry lines",
          );
        }
        await repo.deleteItem(businessId, itemId);
      });
    },
  };
}

export type CatalogItemsWriteService = ReturnType<
  typeof createCatalogItemsWriteService
>;

/** Test helper — enrich row shape unused */
export type _Enriched = CatalogItemEnriched;
