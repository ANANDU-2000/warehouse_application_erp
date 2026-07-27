/**
 * Catalog variant Zod schemas — catalog.py CatalogVariantCreate/Update
 */
import { z } from "zod";

function collapseName(v: string): string {
  return v.trim().split(/\s+/).join(" ");
}

export const catalogVariantCreateSchema = z.object({
  name: z.string().min(1).max(512).transform(collapseName),
  default_kg_per_bag: z.number().gt(0).nullable().optional(),
});

export type CatalogVariantCreateIn = z.infer<typeof catalogVariantCreateSchema>;

export const catalogVariantUpdateSchema = z.object({
  name: z.string().min(1).max(512).transform(collapseName).optional(),
  default_kg_per_bag: z.number().gt(0).nullable().optional(),
});

export type CatalogVariantUpdateIn = z.infer<typeof catalogVariantUpdateSchema>;
