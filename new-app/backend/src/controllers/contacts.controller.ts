import type { Request, Response, NextFunction } from "express";
import { sendDetail } from "../http/sendDetail";
import type { ContactsService } from "../services/contacts.service";
import {
  DuplicateNameError, NotFoundError, DeleteBlockedError,
  FreightTypeError, BrokerNotInBusinessError, SupplierNotInBusinessError,
} from "../services/contacts.service";

function bid(req: Request): string { const v = req.params.businessId; return Array.isArray(v) ? v[0] : v; }
function sid(req: Request): string { const v = req.params.supplierId; return Array.isArray(v) ? v[0] : v; }
function bid2(req: Request): string { const v = req.params.brokerId; return Array.isArray(v) ? v[0] : v; }
function qs(req: Request, key: string): string { const v = req.query[key]; if (Array.isArray(v)) return String(v[0] ?? ""); return v != null ? String(v) : ""; }

export type ContactsController = {
  listSuppliers(req: Request, res: Response, next: NextFunction): Promise<void>;
  createSupplier(req: Request, res: Response, next: NextFunction): Promise<void>;
  getSupplier(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateSupplier(req: Request, res: Response, next: NextFunction): Promise<void>;
  deleteSupplier(req: Request, res: Response, next: NextFunction): Promise<void>;
  getSupplierMetrics(req: Request, res: Response, next: NextFunction): Promise<void>;
  listBrokers(req: Request, res: Response, next: NextFunction): Promise<void>;
  createBroker(req: Request, res: Response, next: NextFunction): Promise<void>;
  getBroker(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateBroker(req: Request, res: Response, next: NextFunction): Promise<void>;
  deleteBroker(req: Request, res: Response, next: NextFunction): Promise<void>;
  getBrokerMetrics(req: Request, res: Response, next: NextFunction): Promise<void>;
  getLinkedSuppliers(req: Request, res: Response, next: NextFunction): Promise<void>;
};

function handleServiceError(err: unknown, res: Response, next: NextFunction): void {
  if (err instanceof DuplicateNameError || err instanceof NotFoundError ||
      err instanceof DeleteBlockedError || err instanceof FreightTypeError ||
      err instanceof BrokerNotInBusinessError || err instanceof SupplierNotInBusinessError) {
    sendDetail(res, (err as any).status, (err as Error).message);
    return;
  }
  next(err);
}

export function createContactsController(svc: ContactsService): ContactsController {
  return {
    async listSuppliers(req, res, next) {
      try {
        const businessId = bid(req);
        const compact = req.query.compact === "true";
        const limitStr = qs(req, "limit"); const limit = limitStr ? parseInt(limitStr, 10) : undefined;
        const out = await svc.listSuppliers(businessId, compact, limit);
        res.json(out);
      } catch (e) { handleServiceError(e, res, next); }
    },

    async createSupplier(req, res, next) {
      try {
        const businessId = bid(req);
        const out = await svc.createSupplier(businessId, req.body);
        res.status(201).json(out);
      } catch (e) { handleServiceError(e, res, next); }
    },

    async getSupplier(req, res, next) {
      try {
        const out = await svc.getSupplier(bid(req), sid(req));
        res.json(out);
      } catch (e) { handleServiceError(e, res, next); }
    },

    async updateSupplier(req, res, next) {
      try {
        const out = await svc.updateSupplier(bid(req), sid(req), req.body);
        res.json(out);
      } catch (e) { handleServiceError(e, res, next); }
    },

    async deleteSupplier(req, res, next) {
      try {
        await svc.deleteSupplier(bid(req), sid(req));
        res.status(204).end();
      } catch (e) { handleServiceError(e, res, next); }
    },

    async getSupplierMetrics(req, res, next) {
      try {
        const out = await svc.getSupplierMetrics(bid(req), sid(req), qs(req, "from"), qs(req, "to"));
        res.json(out);
      } catch (e) { handleServiceError(e, res, next); }
    },

    async listBrokers(req, res, next) {
      try {
        const out = await svc.listBrokers(bid(req));
        res.json(out);
      } catch (e) { handleServiceError(e, res, next); }
    },

    async createBroker(req, res, next) {
      try {
        const out = await svc.createBroker(bid(req), req.body);
        res.status(201).json(out);
      } catch (e) { handleServiceError(e, res, next); }
    },

    async getBroker(req, res, next) {
      try {
        const out = await svc.getBroker(bid(req), bid2(req));
        res.json(out);
      } catch (e) { handleServiceError(e, res, next); }
    },

    async updateBroker(req, res, next) {
      try {
        const out = await svc.updateBroker(bid(req), bid2(req), req.body);
        res.json(out);
      } catch (e) { handleServiceError(e, res, next); }
    },

    async deleteBroker(req, res, next) {
      try {
        await svc.deleteBroker(bid(req), bid2(req));
        res.status(204).end();
      } catch (e) { handleServiceError(e, res, next); }
    },

    async getBrokerMetrics(req, res, next) {
      try {
        const out = await svc.getBrokerMetrics(bid(req), bid2(req), qs(req, "from"), qs(req, "to"));
        res.json(out);
      } catch (e) { handleServiceError(e, res, next); }
    },

    async getLinkedSuppliers(req, res, next) {
      try {
        const out = await svc.getLinkedSuppliers(bid(req), bid2(req));
        res.json(out);
      } catch (e) { handleServiceError(e, res, next); }
    },
  };
}
