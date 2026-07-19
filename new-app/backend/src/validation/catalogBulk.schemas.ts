/**
 * Catalog bulk ops schemas — catalog.py BulkItemIdsIn / BulkReorderIn
 */
import { z } from "zod";

export const bulkItemIdsSchema = z.object({
  item_ids: z.array(z.string().uuid()).min(1).max(200),
});

export type BulkItemIdsIn = z.infer<typeof bulkItemIdsSchema>;

export const bulkReorderSchema = z.object({
  item_ids: z.array(z.string().uuid()).min(1).max(200),
  reorder_level: z.number().min(0),
});

export type BulkReorderIn = z.infer<typeof bulkReorderSchema>;
