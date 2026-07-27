/**
 * Catalog fuzzy — Formula source: catalog_fuzzy.dart
 */
export const K_CATALOG_FUZZY_SEARCH_MAX = 8;

export function normalizeCatalogSearch(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, " ");
}

function levenshtein(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const m = a.length;
  const n = b.length;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = new Array<number>(n + 1).fill(0);
    cur[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const ins = cur[j - 1] + 1;
      const del = prev[j] + 1;
      const sub = prev[j - 1] + cost;
      cur[j] = Math.min(ins, del, sub);
    }
    prev = cur;
  }
  return prev[n] ?? 0;
}

/** Higher is better. Empty query matches everything at score 100. */
export function catalogFuzzyScore(query: string, candidate: string): number {
  const q = normalizeCatalogSearch(query);
  const c = normalizeCatalogSearch(candidate);
  if (q.length === 0) return 100;
  if (c.length === 0) return 0;
  if (c.includes(q)) return 100;

  const qWords = q.split(" ").filter((e) => e.length > 0);
  const cWords = c.split(" ").filter((e) => e.length > 0);
  if (qWords.length > 0 && cWords.length > 0) {
    let prefixHits = 0;
    for (const qw of qWords) {
      for (const cw of cWords) {
        if (cw.startsWith(qw) || qw.startsWith(cw)) {
          prefixHits++;
          break;
        }
      }
    }
    if (prefixHits === qWords.length) return 82;
  }

  const maxLen = Math.max(q.length, c.length);
  if (maxLen > 48) return 0;
  const d = levenshtein(q, c);
  const sim = 70 - d * 4;
  return sim < 0 ? 0 : sim;
}

/** Rank items by labelOf; keep best limit with score ≥ minScore. */
export function catalogFuzzyRank<T>(
  query: string,
  items: T[],
  labelOf: (item: T) => string,
  opts?: { minScore?: number; limit?: number },
): T[] {
  const minScore = opts?.minScore ?? 42;
  const limit = opts?.limit ?? K_CATALOG_FUZZY_SEARCH_MAX;
  const q = normalizeCatalogSearch(query);
  if (q.length === 0) return [...items];
  const scored: { item: T; score: number }[] = [];
  for (const it of items) {
    const s = catalogFuzzyScore(q, labelOf(it));
    if (s >= minScore) scored.push({ item: it, score: s });
  }
  scored.sort((a, b) => {
    const byScore = b.score - a.score;
    if (byScore !== 0) return byScore;
    const aLabel = normalizeCatalogSearch(labelOf(a.item));
    const bLabel = normalizeCatalogSearch(labelOf(b.item));
    const aExact = aLabel === q;
    const bExact = bLabel === q;
    if (aExact !== bExact) return aExact ? -1 : 1;
    const aPrefix = aLabel.startsWith(q);
    const bPrefix = bLabel.startsWith(q);
    if (aPrefix !== bPrefix) return aPrefix ? -1 : 1;
    return aLabel.localeCompare(bLabel);
  });
  return scored.slice(0, limit).map((e) => e.item);
}
