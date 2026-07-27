/**
 * Staff deliveries FIELDS helpers —
 * staff_pending_deliveries_page.dart (list page; no editable inputs).
 * Client title/count/empty gates only; data fill → WIRE.
 */
import {
  STAFF_DEL_SECTION_ARRIVED,
  STAFF_DEL_SECTION_DISPATCHED,
  STAFF_DEL_SECTION_PENDING_VERIFY,
  STAFF_DEL_TITLE,
  STAFF_DEL_TITLE_COUNTED,
} from "./staffDeliveriesCopy";

export type StaffDelSectionKey = "dispatched" | "arrived" | "pendingVerify";

/** Fixed section catalog — Flutter _DeliverySection order */
export const STAFF_DEL_SECTION_ORDER: StaffDelSectionKey[] = [
  "dispatched",
  "arrived",
  "pendingVerify",
];

export const STAFF_DEL_SECTION_TITLE: Record<StaffDelSectionKey, string> = {
  dispatched: STAFF_DEL_SECTION_DISPATCHED,
  arrived: STAFF_DEL_SECTION_ARRIVED,
  pendingVerify: STAFF_DEL_SECTION_PENDING_VERIFY,
};

export type StaffDelSectionCounts = Record<StaffDelSectionKey, number>;

/** Empty client catalog until WIRE fills from trade-purchases */
export const STAFF_DEL_EMPTY_COUNTS: StaffDelSectionCounts = {
  dispatched: 0,
  arrived: 0,
  pendingVerify: 0,
};

/** Flutter: sections?.total ?? 0 */
export function staffDelTotal(counts: StaffDelSectionCounts): number {
  return counts.dispatched + counts.arrived + counts.pendingVerify;
}

/** Flutter AppBar: total > 0 ? 'Pending deliveries ($total)' : 'Pending deliveries' */
export function staffDelAppBarTitle(total: number): string {
  return total > 0 ? STAFF_DEL_TITLE_COUNTED(total) : STAFF_DEL_TITLE;
}

/** Flutter: '$title ($count)' */
export function staffDelSectionHeading(title: string, count: number): string {
  return `${title} (${count})`;
}

/** Flutter: if (data.total == 0) show global empty */
export function staffDelShowEmptyAll(total: number): boolean {
  return total === 0;
}

/** Flutter: highlight && count > 0 → orange title */
export function staffDelSectionTitleHot(
  highlight: boolean,
  count: number,
): boolean {
  return highlight && count > 0;
}
