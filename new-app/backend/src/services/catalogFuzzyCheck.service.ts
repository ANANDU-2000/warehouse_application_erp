/**
 * Catalog fuzzy-check — Formula source: catalog.py:catalog_fuzzy_check
 */
import type { CatalogItemsRepository } from "../repositories/catalogItems.repository";
import { rankIdsByTokenSort } from "./fuzzyCatalog.service";

export type CatalogFuzzyCheckHit = {
  id: string;
  name: string;
  /** RapidFuzz token_sort_ratio / 100 */
  score: number;
};

export type CatalogFuzzyCheckOut = {
  hits: CatalogFuzzyCheckHit[];
};

export async function runCatalogFuzzyCheck(
  catalogItems: CatalogItemsRepository,
  opts: {
    businessId: string;
    name: string;
    categoryId?: string | null;
    typeId?: string | null;
    supplierId?: string | null;
  },
): Promise<CatalogFuzzyCheckOut> {
  const pairs = await catalogItems.listFuzzyNamePairs({
    businessId: opts.businessId,
    categoryId: opts.categoryId,
    typeId: opts.typeId,
    supplierId: opts.supplierId,
  });
  const ranked = rankIdsByTokenSort(opts.name.trim(), pairs, {
    limit: 12,
    scoreCutoff: 55,
  });
  const idToName = new Map(pairs.map((p) => [p.id, p.name]));
  const hits: CatalogFuzzyCheckHit[] = [];
  for (const { id, score } of ranked) {
    const name = idToName.get(id);
    if (name == null) continue;
    hits.push({
      id,
      name,
      score: Math.round((score / 100) * 10000) / 10000,
    });
  }
  return { hits };
}
