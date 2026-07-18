/**
 * Breakdown search match — port of `_breakdownRowMatchesQuery`.
 * Source: home_breakdown_list_page.dart
 */
export function breakdownRowMatchesQuery(args: {
  title: string;
  qtyLine: string;
  query: string;
}): boolean {
  const q = args.query.trim().toLowerCase();
  if (q === "") return true;
  return (
    args.title.toLowerCase().includes(q) ||
    args.qtyLine.toLowerCase().includes(q)
  );
}
