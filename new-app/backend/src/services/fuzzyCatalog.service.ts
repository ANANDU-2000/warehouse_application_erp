/**
 * Fuzzy catalog ranking — Formula source: fuzzy_catalog.py (rapidfuzz token_sort_ratio)
 *
 * RapidFuzz Indel ratio: 100 * (1 - indel_distance / (len1 + len2))
 * indel_distance = len1 + len2 - 2 * LCS
 * token_sort: sort whitespace tokens then ratio.
 */
export function tokenSortRatio(a: string, b: string): number {
  const sa = sortTokens(a);
  const sb = sortTokens(b);
  return indelRatio(sa, sb);
}

function sortTokens(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .sort()
    .join(" ");
}

/** RapidFuzz-compatible Indel ratio (0..100). */
export function indelRatio(s1: string, s2: string): number {
  const len1 = s1.length;
  const len2 = s2.length;
  if (len1 === 0 && len2 === 0) return 100;
  const dist = indelDistance(s1, s2);
  return (1 - dist / (len1 + len2)) * 100;
}

function indelDistance(s1: string, s2: string): number {
  return s1.length + s2.length - 2 * longestCommonSubsequence(s1, s2);
}

function longestCommonSubsequence(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0 || n === 0) return 0;
  // rolling two rows for memory
  let prev = new Array<number>(n + 1).fill(0);
  let curr = new Array<number>(n + 1).fill(0);
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) curr[j] = prev[j - 1]! + 1;
      else curr[j] = Math.max(prev[j]!, curr[j - 1]!);
    }
    [prev, curr] = [curr, prev];
    curr.fill(0);
  }
  return prev[n]!;
}

export type FuzzyIdName = { id: string; name: string };

/**
 * Formula source: fuzzy_catalog.py:rank_ids_by_token_sort
 * Returns (id, score 0..100) best first.
 */
export function rankIdsByTokenSort(
  query: string,
  rows: FuzzyIdName[],
  opts?: { limit?: number; scoreCutoff?: number },
): Array<{ id: string; score: number }> {
  const limit = opts?.limit ?? 12;
  const scoreCutoff = opts?.scoreCutoff ?? 55;
  const q = query.toLowerCase().trim();
  if (!q || rows.length === 0) return [];

  const scored: Array<{ id: string; score: number; idx: number }> = [];
  for (let idx = 0; idx < rows.length; idx++) {
    const row = rows[idx]!;
    const score = tokenSortRatio(q, row.name.toLowerCase());
    if (score >= scoreCutoff) {
      scored.push({ id: row.id, score, idx });
    }
  }
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.idx - b.idx;
  });

  const out: Array<{ id: string; score: number }> = [];
  const seen = new Set<string>();
  for (const s of scored) {
    if (seen.has(s.id)) continue;
    seen.add(s.id);
    out.push({ id: s.id, score: Math.trunc(s.score) });
    if (out.length >= limit) break;
  }
  return out;
}
