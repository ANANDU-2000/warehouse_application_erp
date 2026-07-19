/**
 * Staff deliveries `/staff/deliveries` — FIELDS (Step 3).
 * Source: staff_pending_deliveries_page.dart — **no** search/filter inputs;
 * client title/count/empty gates only (`staffDelAppBarTitle` / section counts).
 * Deferred: back/scan/row → BUTTONS; trade-purchases → WIRE.
 */
import { useState } from "react";
import {
  STAFF_DEL_BACK_FALLBACK,
  STAFF_DEL_EMPTY_ALL,
  STAFF_DEL_EMPTY_ARRIVED,
  STAFF_DEL_EMPTY_DISPATCHED,
  STAFF_DEL_EMPTY_PENDING_VERIFY,
  STAFF_DEL_SCAN_TOOLTIP,
  STAFF_DEL_SUPPLIER_FALLBACK,
} from "./staffDeliveriesCopy";
import {
  STAFF_DEL_EMPTY_COUNTS,
  STAFF_DEL_SECTION_ORDER,
  STAFF_DEL_SECTION_TITLE,
  staffDelAppBarTitle,
  staffDelSectionHeading,
  staffDelSectionTitleHot,
  staffDelShowEmptyAll,
  staffDelTotal,
  type StaffDelSectionCounts,
  type StaffDelSectionKey,
} from "./staffDeliveriesFields";
import "./StaffDeliveriesPage.css";

const SECTION_EMPTY: Record<StaffDelSectionKey, string> = {
  dispatched: STAFF_DEL_EMPTY_DISPATCHED,
  arrived: STAFF_DEL_EMPTY_ARRIVED,
  pendingVerify: STAFF_DEL_EMPTY_PENDING_VERIFY,
};

const SECTION_HIGHLIGHT: Partial<Record<StaffDelSectionKey, boolean>> = {
  arrived: true,
};

export function StaffDeliveriesPage() {
  /* FIELDS: client section counts (empty catalog); WIRE replaces values */
  const [sectionCounts] = useState<StaffDelSectionCounts>(STAFF_DEL_EMPTY_COUNTS);
  const total = staffDelTotal(sectionCounts);
  const title = staffDelAppBarTitle(total);
  const showEmptyAll = staffDelShowEmptyAll(total);

  return (
    <div
      className="staff-del-page"
      data-page="staff-deliveries"
      data-step="fields"
      data-total={total}
      data-back-fallback={STAFF_DEL_BACK_FALLBACK}
    >
      <header className="staff-del-appbar" data-slot="appBar">
        <button
          type="button"
          className="staff-del-appbar__back"
          aria-label="Back"
          data-testid="staff-del-back"
          data-deferred="back"
          disabled
        >
          ←
        </button>
        <h1 className="staff-del-appbar__title" data-slot="title">
          {title}
        </h1>
        <button
          type="button"
          className="staff-del-appbar__scan"
          aria-label={STAFF_DEL_SCAN_TOOLTIP}
          title={STAFF_DEL_SCAN_TOOLTIP}
          data-testid="staff-del-scan"
          data-deferred="scan-barcode"
          disabled
        >
          ⌕
        </button>
      </header>

      <main className="staff-del-body" data-slot="body">
        {STAFF_DEL_SECTION_ORDER.map((key) => {
          const count = sectionCounts[key];
          const highlight = Boolean(SECTION_HIGHLIGHT[key]);
          const titleHot = staffDelSectionTitleHot(highlight, count);
          return (
            <section
              key={key}
              className={
                highlight
                  ? "staff-del-section staff-del-section--highlight"
                  : "staff-del-section"
              }
              data-slot="section"
              data-section={key}
              data-count={count}
              data-title-hot={titleHot ? "true" : "false"}
            >
              <h2
                className={
                  titleHot
                    ? "staff-del-section__title staff-del-section__title--hot"
                    : "staff-del-section__title"
                }
                data-slot="sectionTitle"
              >
                {staffDelSectionHeading(STAFF_DEL_SECTION_TITLE[key], count)}
              </h2>
              {count === 0 ? (
                <div
                  className="staff-del-section__empty"
                  data-slot="sectionEmpty"
                >
                  {SECTION_EMPTY[key]}
                </div>
              ) : null}
              <ul
                className="staff-del-list"
                data-slot="list"
                data-deferred="delivery-rows"
                aria-hidden={count === 0 ? "true" : undefined}
                hidden={count === 0}
              >
                <li
                  className="staff-del-row"
                  data-slot="row"
                  data-deferred="receive-nav"
                >
                  <span className="staff-del-row__avatar" aria-hidden="true">
                    1
                  </span>
                  <div className="staff-del-row__body">
                    <div className="staff-del-row__title">
                      {STAFF_DEL_SUPPLIER_FALLBACK}
                    </div>
                    <div className="staff-del-row__sub">PO · date</div>
                    <div className="staff-del-row__bags">—</div>
                  </div>
                  <div className="staff-del-row__meta">
                    <span className="staff-del-row__index">1/1</span>
                    <span className="staff-del-row__qty">0 qty</span>
                  </div>
                </li>
              </ul>
            </section>
          );
        })}

        {showEmptyAll ? (
          <div className="staff-del-empty-all" data-slot="emptyAll">
            <p className="staff-del-empty-all__text">{STAFF_DEL_EMPTY_ALL}</p>
          </div>
        ) : null}
      </main>
    </div>
  );
}
