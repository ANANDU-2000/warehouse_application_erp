/**
 * Staff deliveries `/staff/deliveries` — LAYOUT (Step 2).
 * Source: staff_pending_deliveries_page.dart · HexaColors.brandBackground /
 * brandPrimary / brandBorder; ListView padding 16/8/16/88; section gap 16;
 * Card radius 12 pad 14; CircleAvatar r18 · brandPrimary @10%;
 * Arrived highlight Color(0xFFE65100) when count > 0 (WIRE).
 * Forbidden: back/scan/row handlers, API, FIELDS.
 */
import {
  STAFF_DEL_BACK_FALLBACK,
  STAFF_DEL_EMPTY_ALL,
  STAFF_DEL_EMPTY_ARRIVED,
  STAFF_DEL_EMPTY_DISPATCHED,
  STAFF_DEL_EMPTY_PENDING_VERIFY,
  STAFF_DEL_SCAN_TOOLTIP,
  STAFF_DEL_SECTION_ARRIVED,
  STAFF_DEL_SECTION_DISPATCHED,
  STAFF_DEL_SECTION_PENDING_VERIFY,
  STAFF_DEL_SUPPLIER_FALLBACK,
  STAFF_DEL_TITLE,
} from "./staffDeliveriesCopy";
import "./StaffDeliveriesPage.css";

type SectionKey = "dispatched" | "arrived" | "pendingVerify";

const SECTIONS: Array<{
  key: SectionKey;
  title: string;
  empty: string;
  highlight?: boolean;
}> = [
  {
    key: "dispatched",
    title: STAFF_DEL_SECTION_DISPATCHED,
    empty: STAFF_DEL_EMPTY_DISPATCHED,
  },
  {
    key: "arrived",
    title: STAFF_DEL_SECTION_ARRIVED,
    empty: STAFF_DEL_EMPTY_ARRIVED,
    highlight: true,
  },
  {
    key: "pendingVerify",
    title: STAFF_DEL_SECTION_PENDING_VERIFY,
    empty: STAFF_DEL_EMPTY_PENDING_VERIFY,
  },
];

export function StaffDeliveriesPage() {
  /* LAYOUT: count title when WIRE; highlight orange only if count > 0 */
  const title = STAFF_DEL_TITLE;
  const sectionCounts: Record<SectionKey, number> = {
    dispatched: 0,
    arrived: 0,
    pendingVerify: 0,
  };

  return (
    <div
      className="staff-del-page"
      data-page="staff-deliveries"
      data-step="layout"
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
        <h1 className="staff-del-appbar__title">{title}</h1>
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
        {SECTIONS.map((sec) => {
          const count = sectionCounts[sec.key];
          const titleHot = Boolean(sec.highlight && count > 0);
          return (
            <section
              key={sec.key}
              className={
                sec.highlight
                  ? "staff-del-section staff-del-section--highlight"
                  : "staff-del-section"
              }
              data-slot="section"
              data-section={sec.key}
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
                {sec.title} ({count})
              </h2>
              <div
                className="staff-del-section__empty"
                data-slot="sectionEmpty"
              >
                {sec.empty}
              </div>
              <ul
                className="staff-del-list"
                data-slot="list"
                data-deferred="delivery-rows"
                aria-hidden="true"
                hidden
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

        <div className="staff-del-empty-all" data-slot="emptyAll">
          <p className="staff-del-empty-all__text">{STAFF_DEL_EMPTY_ALL}</p>
        </div>
      </main>
    </div>
  );
}
