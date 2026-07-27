/**
 * Fuzzy name ranking — port of fuzzy_catalog.py rank_ids_by_token_sort.
 * Source: rapidfuzz fuzz.token_sort_ratio + process.extract
 */
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const prev = new Array<number>(n + 1);
  const cur = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    cur[0] = i;
    const ca = a.charCodeAt(i - 1);
    for (let j = 1; j <= n; j++) {
      const cost = ca === b.charCodeAt(j - 1) ? 0 : 1;
      cur[j] = Math.min(cur[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= n; j++) prev[j] = cur[j]!;
  }
  return prev[n]!;
}

/** Approximate rapidfuzz ratio (0–100). */
export function ratio(a: string, b: string): number {
  if (!a && !b) return 100;
  if (!a || !b) return 0;
  const dist = levenshtein(a, b);
  const len = Math.max(a.length, b.length);
  return Math.round((1 - dist / len) * 100);
}

/** rapidfuzz fuzz.token_sort_ratio */
export function tokenSortRatio(a: string, b: string): number {
  const sa = a
    .toLowerCase()
    .trim()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .sort()
    .join(" ");
  const sb = b
    .toLowerCase()
    .trim()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .sort()
    .join(" ");
  return ratio(sa, sb);
}

/**
 * Return (id, score) for fuzzy name matches, best first.
 * Source: fuzzy_catalog.rank_ids_by_token_sort
 */
export function rankIdsByTokenSort(
  query: string,
  rows: ReadonlyArray<{ id: string; name: string }>,
  opts: { limit?: number; scoreCutoff?: number } = {},
): Array<{ id: string; score: number }> {
  const q = query.toLowerCase().trim();
  const limit = opts.limit ?? 12;
  const scoreCutoff = opts.scoreCutoff ?? 55;
  if (!q || rows.length === 0) return [];
  const scored: Array<{ id: string; score: number }> = [];
  const seen = new Set<string>();
  for (const row of rows) {
    if (!row.name) continue;
    const score = tokenSortRatio(q, row.name);
    if (score < scoreCutoff) continue;
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    scored.push({ id: row.id, score });
  }
  scored.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  return scored.slice(0, limit);
}
