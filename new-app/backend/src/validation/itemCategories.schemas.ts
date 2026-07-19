/**
 * Item category Zod schemas — catalog.py ItemCategoryCreate
 */
import { z } from "zod";

function collapseName(v: string): string {
  return v.trim().split(/\s+/).join(" ");
}

export const itemCategoryCreateSchema = z.object({
  name: z.string().min(1).max(255).transform(collapseName),
});

export type ItemCategoryCreateIn = z.infer<typeof itemCategoryCreateSchema>;
