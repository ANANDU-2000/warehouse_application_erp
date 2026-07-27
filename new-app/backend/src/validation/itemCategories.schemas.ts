/**
 * Item category / type Zod schemas — catalog.py ItemCategory* / CategoryType*
 */
import { z } from "zod";

function collapseName(v: string): string {
  return v.trim().split(/\s+/).join(" ");
}

export const itemCategoryCreateSchema = z.object({
  name: z.string().min(1).max(255).transform(collapseName),
});

export const itemCategoryUpdateSchema = z.object({
  name: z.string().min(1).max(255).transform(collapseName).optional(),
});

export const categoryTypeCreateSchema = z.object({
  name: z.string().min(1).max(255).transform(collapseName),
});

export const categoryTypeUpdateSchema = z.object({
  name: z.string().min(1).max(255).transform(collapseName).optional(),
});

export type ItemCategoryCreateIn = z.infer<typeof itemCategoryCreateSchema>;
export type ItemCategoryUpdateIn = z.infer<typeof itemCategoryUpdateSchema>;
export type CategoryTypeCreateIn = z.infer<typeof categoryTypeCreateSchema>;
export type CategoryTypeUpdateIn = z.infer<typeof categoryTypeUpdateSchema>;
