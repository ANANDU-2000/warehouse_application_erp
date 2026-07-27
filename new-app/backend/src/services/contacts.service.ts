import { randomUUID } from "crypto";
import type { ContactsRepository } from "../repositories/contacts.repository";
import type { SupplierRow, BrokerRow } from "../repositories/types";
import { validateWithSchema } from "../validation/validate";
import {
  createSupplierSchema,
  updateSupplierSchema,
  createBrokerSchema,
  updateBrokerSchema,
} from "../validation/contacts.schemas";

export class DuplicateNameError extends Error {
  readonly code = "DUPLICATE_NAME";
  readonly status = 409;
}

export class NotFoundError extends Error {
  readonly code = "NOT_FOUND";
  readonly status = 404;
}

export class DeleteBlockedError extends Error {
  readonly code = "DELETE_BLOCKED";
  readonly status = 400;
}

export class FreightTypeError extends Error {
  readonly code = "INVALID_FREIGHT_TYPE";
  readonly status = 400;
}

export class BrokerNotInBusinessError extends Error {
  readonly code = "BROKER_NOT_IN_BUSINESS";
  readonly status = 400;
}

export class SupplierNotInBusinessError extends Error {
  readonly code = "SUPPLIER_NOT_IN_BUSINESS";
  readonly status = 400;
}

export type SupplierOut = {
  id: string; name: string; phone: string | null; location: string | null;
  broker_id: string | null; broker_ids: string[]; gst_number: string | null;
  address: string | null; notes: string | null;
  default_payment_days: number | null; default_discount: number | null;
  default_delivered_rate: number | null; default_billty_rate: number | null;
  freight_type: string | null; ai_memory_enabled: boolean;
  preferences_json: string | null; last_purchase_date: string | null;
};

export type BrokerOut = {
  id: string; name: string; phone: string | null; location: string | null;
  notes: string | null; commission_type: string; commission_value: number | null;
  default_payment_days: number | null; default_discount: number | null;
  default_delivered_rate: number | null; default_billty_rate: number | null;
  freight_type: string | null; image_url: string | null;
  supplier_ids: string[]; preferences_json: string | null;
  last_purchase_date: string | null;
};

export type SupplierMetricsOut = {
  deals: number; total_qty: number; avg_landing: number;
  total_profit: number; purchase_amount: number; profit_margin_pct: number;
};

export type BrokerMetricsOut = {
  deals: number; total_commission: number; total_profit: number;
};

export type LinkedSupplierOut = {
  id: string; name: string; phone: string | null;
};

export type ContactsService = {
  listSuppliers(businessId: string, compact: boolean, limit?: number): Promise<SupplierOut[]>;
  createSupplier(businessId: string, body: unknown): Promise<SupplierOut>;
  getSupplier(businessId: string, supplierId: string): Promise<SupplierOut>;
  updateSupplier(businessId: string, supplierId: string, body: unknown): Promise<SupplierOut>;
  deleteSupplier(businessId: string, supplierId: string): Promise<void>;
  getSupplierMetrics(businessId: string, supplierId: string, from: string, to: string): Promise<SupplierMetricsOut>;
  listBrokers(businessId: string): Promise<BrokerOut[]>;
  createBroker(businessId: string, body: unknown): Promise<BrokerOut>;
  getBroker(businessId: string, brokerId: string): Promise<BrokerOut>;
  updateBroker(businessId: string, brokerId: string, body: unknown): Promise<BrokerOut>;
  deleteBroker(businessId: string, brokerId: string): Promise<void>;
  getBrokerMetrics(businessId: string, brokerId: string, from: string, to: string): Promise<BrokerMetricsOut>;
  getLinkedSuppliers(businessId: string, brokerId: string): Promise<LinkedSupplierOut[]>;
};

function toSupplierOut(s: SupplierRow, brokerIds: string[], lastPurchaseDate: Date | null): SupplierOut {
  return {
    id: s.id, name: s.name, phone: s.phone, location: s.location,
    broker_id: s.broker_id, broker_ids: brokerIds,
    gst_number: s.gst_number, address: s.address, notes: s.notes,
    default_payment_days: s.default_payment_days,
    default_discount: s.default_discount != null ? Number(s.default_discount) : null,
    default_delivered_rate: s.default_delivered_rate != null ? Number(s.default_delivered_rate) : null,
    default_billty_rate: s.default_billty_rate != null ? Number(s.default_billty_rate) : null,
    freight_type: s.freight_type, ai_memory_enabled: s.ai_memory_enabled,
    preferences_json: s.preferences_json,
    last_purchase_date: lastPurchaseDate ? lastPurchaseDate.toISOString().split("T")[0] : null,
  };
}

function toBrokerOut(b: BrokerRow, supplierIds: string[], lastPurchaseDate: Date | null): BrokerOut {
  return {
    id: b.id, name: b.name, phone: b.phone, location: b.location,
    notes: b.notes, commission_type: b.commission_type,
    commission_value: b.commission_value != null ? Number(b.commission_value) : null,
    default_payment_days: b.default_payment_days,
    default_discount: b.default_discount != null ? Number(b.default_discount) : null,
    default_delivered_rate: b.default_delivered_rate != null ? Number(b.default_delivered_rate) : null,
    default_billty_rate: b.default_billty_rate != null ? Number(b.default_billty_rate) : null,
    freight_type: b.freight_type, image_url: b.image_url,
    supplier_ids: supplierIds, preferences_json: b.preferences_json,
    last_purchase_date: lastPurchaseDate ? lastPurchaseDate.toISOString().split("T")[0] : null,
  };
}

function mergeBrokerIds(
  brokerId: string | null | undefined,
  brokerIds: string[] | null | undefined,
): string[] {
  const merged: string[] = [];
  if (brokerIds) merged.push(...brokerIds);
  if (brokerId && !merged.includes(brokerId)) merged.unshift(brokerId);
  const dedup: string[] = [];
  for (const id of merged) {
    if (!dedup.includes(id)) dedup.push(id);
  }
  return dedup;
}

export function createContactsService(repo: ContactsRepository): ContactsService {
  async function enrichSupplier(supplier: SupplierRow): Promise<SupplierOut> {
    const links = await repo.listBrokerSupplierLinksBySupplier(supplier.id);
    const brokerIds = links.map((l) => l.broker_id);
    const lastDate = await repo.getLastPurchaseDateForSupplier(supplier.business_id, supplier.id);
    return toSupplierOut(supplier, brokerIds, lastDate);
  }

  async function enrichBroker(broker: BrokerRow): Promise<BrokerOut> {
    const links = await repo.listBrokerSupplierLinksByBroker(broker.id);
    const supplierIds = links.map((l) => l.supplier_id);
    const lastDate = await repo.getLastPurchaseDateForBroker(broker.business_id, broker.id);
    return toBrokerOut(broker, supplierIds, lastDate);
  }

  return {
    async listSuppliers(businessId, compact, limit) {
      if (compact) {
        const rows = await repo.listSuppliersCompact(businessId, limit);
        const out: SupplierOut[] = [];
        for (const r of rows) {
          const links = await repo.listBrokerSupplierLinksBySupplier(r.id);
          out.push(toSupplierOut(
            { ...r, business_id: businessId, address: null, notes: null, created_at: new Date() } as SupplierRow,
            links.map((l) => l.broker_id),
            null,
          ));
        }
        return out;
      }
      const rows = await repo.listSuppliers(businessId);
      return Promise.all(rows.map(enrichSupplier));
    },

    async createSupplier(businessId, body) {
      try {
      const data = validateWithSchema(createSupplierSchema, body);
      const dupId = await repo.findDupSupplierId(businessId, data.name);
      if (dupId) throw new DuplicateNameError("A supplier with this name already exists");
      if (data.freight_type != null && !["included", "separate"].includes(data.freight_type)) {
        throw new FreightTypeError("freight_type must be 'included' or 'separate'");
      }
      const dedupBrokers = mergeBrokerIds(data.broker_id, data.broker_ids ?? null);
      for (const bid of dedupBrokers) {
        const ok = await repo.verifyBrokerInBusiness(bid, businessId);
        if (!ok) throw new BrokerNotInBusinessError(`Broker not in this business: ${bid}`);
      }
      const prefsJson = data.preferences ? JSON.stringify(data.preferences) : null;
      const supplierId = randomUUID();
      await repo.insertSupplier({
        id: supplierId, businessId, name: data.name,
        phone: data.phone ?? null, location: data.location ?? null,
        brokerId: dedupBrokers[0] ?? data.broker_id ?? null,
        gstNumber: data.gst_number ?? null, address: data.address ?? null,
        notes: data.notes ?? null, defaultPaymentDays: data.default_payment_days ?? null,
        defaultDiscount: data.default_discount ?? null,
        defaultDeliveredRate: data.default_delivered_rate ?? null,
        defaultBilltyRate: data.default_billty_rate ?? null,
        freightType: data.freight_type ?? null,
        aiMemoryEnabled: data.ai_memory_enabled, preferencesJson: prefsJson,
      });
      for (const bid of dedupBrokers) {
        await repo.insertBrokerSupplierLink({ id: randomUUID(), brokerId: bid, supplierId });
      }
      const supplier = await repo.getSupplier(businessId, supplierId);
      return enrichSupplier(supplier!);
      } catch (e) { console.error("CREATE_SUPPLIER_ERR:", e); throw e; }
    },

    async getSupplier(businessId, supplierId) {
      const s = await repo.getSupplier(businessId, supplierId);
      if (!s) throw new NotFoundError("Supplier not found");
      return enrichSupplier(s);
    },

    async updateSupplier(businessId, supplierId, body) {
      const existing = await repo.getSupplier(businessId, supplierId);
      if (!existing) throw new NotFoundError("Supplier not found");
      const data = validateWithSchema(updateSupplierSchema, body, "Invalid update data");
      const fields: Record<string, unknown> = {};

      if (data.name !== undefined) {
        if (data.name !== null) {
          const dupId = await repo.findDupSupplierId(businessId, data.name, supplierId);
          if (dupId) throw new DuplicateNameError("A supplier with this name already exists");
          fields.name = data.name.trim();
        }
      }
      if (data.phone !== undefined) fields.phone = data.phone;
      if (data.location !== undefined) fields.location = data.location;
      if (data.address !== undefined) fields.address = data.address;
      if (data.notes !== undefined) fields.notes = data.notes;
      if (data.gst_number !== undefined) fields.gstNumber = data.gst_number;
      if (data.default_payment_days !== undefined) fields.defaultPaymentDays = data.default_payment_days;
      if (data.default_discount !== undefined) fields.defaultDiscount = data.default_discount;
      if (data.default_delivered_rate !== undefined) fields.defaultDeliveredRate = data.default_delivered_rate;
      if (data.default_billty_rate !== undefined) fields.defaultBilltyRate = data.default_billty_rate;
      if (data.ai_memory_enabled !== undefined) fields.aiMemoryEnabled = Boolean(data.ai_memory_enabled);
      if (data.preferences !== undefined && data.preferences !== null) {
        fields.preferencesJson = JSON.stringify(data.preferences);
      }
      if (data.freight_type !== undefined) {
        if (data.freight_type != null && !["included", "separate"].includes(data.freight_type)) {
          throw new FreightTypeError("freight_type must be 'included' or 'separate'");
        }
        fields.freightType = data.freight_type;
      }
      if (data.broker_ids !== undefined || data.broker_id !== undefined) {
        const dedupBrokers = data.broker_id === null && data.broker_ids === undefined
          ? [] : mergeBrokerIds(data.broker_id, data.broker_ids ?? null);
        for (const bid of dedupBrokers) {
          const ok = await repo.verifyBrokerInBusiness(bid, businessId);
          if (!ok) throw new BrokerNotInBusinessError(`Broker not in this business: ${bid}`);
        }
        await repo.deleteBrokerLinksBySupplier(supplierId);
        for (const bid of dedupBrokers) {
          await repo.insertBrokerSupplierLink({ id: randomUUID(), brokerId: bid, supplierId });
        }
        fields.brokerId = dedupBrokers[0] ?? null;
      }
      if (Object.keys(fields).length > 0) {
        await repo.updateSupplier(businessId, supplierId, fields);
      }
      const updated = await repo.getSupplier(businessId, supplierId);
      return enrichSupplier(updated!);
    },

    async deleteSupplier(businessId, supplierId) {
      const s = await repo.getSupplier(businessId, supplierId);
      if (!s) throw new NotFoundError("Supplier not found");
      const count = await repo.countActiveTradePurchasesForSupplier(businessId, supplierId);
      if (count > 0) throw new DeleteBlockedError("Cannot delete a supplier that has purchase entries");
      await repo.deleteBrokerLinksBySupplier(supplierId);
      await repo.deleteSupplier(businessId, supplierId);
    },

    async getSupplierMetrics(businessId, supplierId, from, to) {
      const s = await repo.getSupplier(businessId, supplierId);
      if (!s) throw new NotFoundError("Supplier not found");
      const row = await repo.getSupplierMetrics(businessId, supplierId, from, to);
      if (!row) return { deals: 0, total_qty: 0, avg_landing: 0, total_profit: 0, purchase_amount: 0, profit_margin_pct: 0 };
      const pam = Number(row.purchase_amount);
      return {
        deals: Number(row.deals), total_qty: Number(row.total_qty),
        avg_landing: Number(row.avg_landing), total_profit: Number(row.total_profit),
        purchase_amount: pam,
        profit_margin_pct: pam > 0 ? (Number(row.total_profit) / pam) * 100 : 0,
      };
    },

    async listBrokers(businessId) {
      const rows = await repo.listBrokers(businessId);
      return Promise.all(rows.map(enrichBroker));
    },

    async createBroker(businessId, body) {
      const data = validateWithSchema(createBrokerSchema, body);
      const dupId = await repo.findDupBrokerId(businessId, data.name);
      if (dupId) throw new DuplicateNameError("A broker with this name already exists");
      const prefsJson = data.preferences ? JSON.stringify(data.preferences) : null;
      const brokerId = randomUUID();
      await repo.insertBroker({
        id: brokerId, businessId, name: data.name, phone: data.phone ?? null,
        location: data.location ?? null, notes: data.notes ?? null,
        commissionType: data.commission_type, commissionValue: data.commission_value ?? null,
        defaultPaymentDays: data.default_payment_days ?? null,
        defaultDiscount: data.default_discount ?? null,
        defaultDeliveredRate: data.default_delivered_rate ?? null,
        defaultBilltyRate: data.default_billty_rate ?? null,
        freightType: data.freight_type ?? null,
        imageUrl: data.image_url?.trim() || null, preferencesJson: prefsJson,
      });
      const dedupSuppliers: string[] = [];
      for (const sid of data.supplier_ids ?? []) {
        if (!dedupSuppliers.includes(sid)) dedupSuppliers.push(sid);
      }
      for (const sid of dedupSuppliers) {
        const ok = await repo.verifySupplierInBusiness(sid, businessId);
        if (!ok) throw new SupplierNotInBusinessError(`Supplier not in this business: ${sid}`);
        await repo.insertBrokerSupplierLink({ id: randomUUID(), brokerId, supplierId: sid });
        await repo.updateSupplierBrokerId(sid, brokerId);
      }
      const broker = await repo.getBroker(businessId, brokerId);
      return enrichBroker(broker!);
    },

    async getBroker(businessId, brokerId) {
      const b = await repo.getBroker(businessId, brokerId);
      if (!b) throw new NotFoundError("Broker not found");
      return enrichBroker(b);
    },

    async updateBroker(businessId, brokerId, body) {
      const existing = await repo.getBroker(businessId, brokerId);
      if (!existing) throw new NotFoundError("Broker not found");
      const data = validateWithSchema(updateBrokerSchema, body, "Invalid update data");
      const fields: Record<string, unknown> = {};
      if (data.name !== undefined && data.name !== null) {
        const dupId = await repo.findDupBrokerId(businessId, data.name, brokerId);
        if (dupId) throw new DuplicateNameError("A broker with this name already exists");
        fields.name = data.name.trim();
      }
      if (data.phone !== undefined) fields.phone = data.phone;
      if (data.location !== undefined) fields.location = data.location;
      if (data.notes !== undefined) fields.notes = data.notes;
      if (data.commission_type !== undefined) fields.commissionType = data.commission_type;
      if (data.commission_value !== undefined) fields.commissionValue = data.commission_value;
      if (data.default_payment_days !== undefined) fields.defaultPaymentDays = data.default_payment_days;
      if (data.default_discount !== undefined) fields.defaultDiscount = data.default_discount;
      if (data.default_delivered_rate !== undefined) fields.defaultDeliveredRate = data.default_delivered_rate;
      if (data.default_billty_rate !== undefined) fields.defaultBilltyRate = data.default_billty_rate;
      if (data.freight_type !== undefined) fields.freightType = data.freight_type;
      if (data.image_url !== undefined) {
        const v = data.image_url;
        fields.imageUrl = typeof v === "string" && v.trim() ? v.trim() : v;
      }
      if (data.preferences !== undefined && data.preferences !== null) {
        fields.preferencesJson = JSON.stringify(data.preferences);
      }
      if (data.supplier_ids !== undefined) {
        const dedupSuppliers: string[] = [];
        for (const sid of data.supplier_ids ?? []) {
          if (!dedupSuppliers.includes(sid)) dedupSuppliers.push(sid);
        }
        for (const sid of dedupSuppliers) {
          const ok = await repo.verifySupplierInBusiness(sid, businessId);
          if (!ok) throw new SupplierNotInBusinessError(`Supplier not in this business: ${sid}`);
        }
        await repo.deleteBrokerLinksByBroker(brokerId);
        for (const sid of dedupSuppliers) {
          await repo.insertBrokerSupplierLink({ id: randomUUID(), brokerId, supplierId: sid });
          await repo.updateSupplierBrokerId(sid, brokerId);
        }
      }
      if (Object.keys(fields).length > 0) {
        await repo.updateBroker(businessId, brokerId, fields);
      }
      const updated = await repo.getBroker(businessId, brokerId);
      return enrichBroker(updated!);
    },

    async deleteBroker(businessId, brokerId) {
      const b = await repo.getBroker(businessId, brokerId);
      if (!b) throw new NotFoundError("Broker not found");
      const tpCount = await repo.countActiveTradePurchasesForBroker(businessId, brokerId);
      if (tpCount > 0) throw new DeleteBlockedError("Cannot delete a broker linked to purchase entries");
      const supCount = await repo.countSuppliersAssignedToBroker(businessId, brokerId);
      if (supCount > 0) throw new DeleteBlockedError("Cannot delete a broker assigned to suppliers — reassign suppliers first");
      await repo.deleteBrokerLinksByBroker(brokerId);
      await repo.deleteBroker(businessId, brokerId);
    },

    async getBrokerMetrics(businessId, brokerId, from, to) {
      const b = await repo.getBroker(businessId, brokerId);
      if (!b) throw new NotFoundError("Broker not found");
      const [deals, commission, profit] = await Promise.all([
        repo.getBrokerMetricsDeals(businessId, brokerId, from, to),
        repo.getBrokerMetricsCommission(businessId, brokerId, from, to),
        repo.getBrokerMetricsProfit(businessId, brokerId, from, to),
      ]);
      return { deals, total_commission: commission, total_profit: profit };
    },

    async getLinkedSuppliers(businessId, brokerId) {
      const b = await repo.getBroker(businessId, brokerId);
      if (!b) throw new NotFoundError("Broker not found");
      return repo.getLinkedSuppliers(businessId, brokerId);
    },
  };
}
