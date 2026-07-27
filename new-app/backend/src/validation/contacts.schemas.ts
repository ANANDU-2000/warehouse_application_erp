import { z } from "zod";

const phoneRegex = /^\+?\d{10,15}$/;
const gstRegex = /^[0-9A-Z]{15}$/;

export const supplierPrefsSchema = z.object({
  category_ids: z.array(z.string().uuid()).default([]),
  type_ids: z.array(z.string().uuid()).default([]),
  item_ids: z.array(z.string().uuid()).default([]),
});

export const createSupplierSchema = z.object({
  name: z.string().min(1).max(255).transform((v) => v.trim()),
  phone: z.string().regex(phoneRegex, "must be 10-15 digits, optional + prefix").nullable().optional(),
  location: z.string().nullable().optional(),
  broker_id: z.string().uuid().nullable().optional(),
  broker_ids: z.array(z.string().uuid()).nullable().optional(),
  gst_number: z.string().regex(gstRegex, "gst_number must be 15 character GSTIN").nullable().optional(),
  address: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  default_payment_days: z.number().int().min(0).max(3650).nullable().optional(),
  default_discount: z.number().min(0).nullable().optional(),
  default_delivered_rate: z.number().min(0).nullable().optional(),
  default_billty_rate: z.number().min(0).nullable().optional(),
  freight_type: z.enum(["included", "separate"]).nullable().optional(),
  ai_memory_enabled: z.boolean().default(false),
  preferences: supplierPrefsSchema.nullable().optional(),
});

export const updateSupplierSchema = z.object({
  name: z.string().min(1).max(255).transform((v) => v.trim()).nullable().optional(),
  phone: z.string().regex(phoneRegex, "must be 10-15 digits, optional + prefix").nullable().optional(),
  location: z.string().nullable().optional(),
  broker_id: z.string().uuid().nullable().optional(),
  broker_ids: z.array(z.string().uuid()).nullable().optional(),
  gst_number: z.string().regex(gstRegex, "gst_number must be 15 character GSTIN").nullable().optional(),
  address: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  default_payment_days: z.number().int().min(0).max(3650).nullable().optional(),
  default_discount: z.number().min(0).nullable().optional(),
  default_delivered_rate: z.number().min(0).nullable().optional(),
  default_billty_rate: z.number().min(0).nullable().optional(),
  freight_type: z.enum(["included", "separate"]).nullable().optional(),
  ai_memory_enabled: z.boolean().nullable().optional(),
  preferences: supplierPrefsSchema.nullable().optional(),
});

export const createBrokerSchema = z.object({
  name: z.string().min(1).max(255).transform((v) => v.trim()),
  phone: z.string().max(15).nullable().optional(),
  location: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  commission_type: z.enum(["percent", "flat"]).default("percent"),
  commission_value: z.number().min(0).nullable().optional(),
  default_payment_days: z.number().int().min(0).nullable().optional(),
  default_discount: z.number().min(0).nullable().optional(),
  default_delivered_rate: z.number().min(0).nullable().optional(),
  default_billty_rate: z.number().min(0).nullable().optional(),
  freight_type: z.enum(["included", "separate"]).nullable().optional(),
  image_url: z.string().max(1024).nullable().optional(),
  supplier_ids: z.array(z.string().uuid()).nullable().optional(),
  preferences: supplierPrefsSchema.nullable().optional(),
});

export const updateBrokerSchema = z.object({
  name: z.string().min(1).max(255).transform((v) => v.trim()).nullable().optional(),
  phone: z.string().max(15).nullable().optional(),
  location: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  commission_type: z.enum(["percent", "flat"]).nullable().optional(),
  commission_value: z.number().min(0).nullable().optional(),
  default_payment_days: z.number().int().min(0).nullable().optional(),
  default_discount: z.number().min(0).nullable().optional(),
  default_delivered_rate: z.number().min(0).nullable().optional(),
  default_billty_rate: z.number().min(0).nullable().optional(),
  freight_type: z.enum(["included", "separate"]).nullable().optional(),
  image_url: z.string().max(1024).nullable().optional(),
  supplier_ids: z.array(z.string().uuid()).nullable().optional(),
  preferences: supplierPrefsSchema.nullable().optional(),
});
