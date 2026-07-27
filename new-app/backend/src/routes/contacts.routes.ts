import { Router } from "express";
import type { AuthzMiddleware } from "../middleware/authz";
import type { ContactsController } from "../controllers/contacts.controller";

export function createContactsRoutes(
  ctrl: ContactsController,
  authz: AuthzMiddleware,
): Router {
  const r = Router({ mergeParams: true });

  r.get("/suppliers", authz.requireAuth, authz.requireMembership, (req, res, next) => void ctrl.listSuppliers(req, res, next));
  r.post("/suppliers", authz.requireAuth, authz.requireMembership, (req, res, next) => void ctrl.createSupplier(req, res, next));
  r.get("/suppliers/:supplierId", authz.requireAuth, authz.requireMembership, (req, res, next) => void ctrl.getSupplier(req, res, next));
  r.patch("/suppliers/:supplierId", authz.requireAuth, authz.requireMembership, (req, res, next) => void ctrl.updateSupplier(req, res, next));
  r.delete("/suppliers/:supplierId", authz.requireAuth, authz.requireMembership, authz.requireOwnerMembership, (req, res, next) => void ctrl.deleteSupplier(req, res, next));
  r.get("/suppliers/:supplierId/metrics", authz.requireAuth, authz.requireMembership, (req, res, next) => void ctrl.getSupplierMetrics(req, res, next));

  r.get("/brokers", authz.requireAuth, authz.requireMembership, (req, res, next) => void ctrl.listBrokers(req, res, next));
  r.post("/brokers", authz.requireAuth, authz.requireMembership, (req, res, next) => void ctrl.createBroker(req, res, next));
  r.get("/brokers/:brokerId", authz.requireAuth, authz.requireMembership, (req, res, next) => void ctrl.getBroker(req, res, next));
  r.patch("/brokers/:brokerId", authz.requireAuth, authz.requireMembership, (req, res, next) => void ctrl.updateBroker(req, res, next));
  r.delete("/brokers/:brokerId", authz.requireAuth, authz.requireMembership, authz.requireOwnerMembership, (req, res, next) => void ctrl.deleteBroker(req, res, next));
  r.get("/brokers/:brokerId/metrics", authz.requireAuth, authz.requireMembership, (req, res, next) => void ctrl.getBrokerMetrics(req, res, next));
  r.get("/brokers/:brokerId/linked-suppliers", authz.requireAuth, authz.requireMembership, (req, res, next) => void ctrl.getLinkedSuppliers(req, res, next));

  return r;
}
