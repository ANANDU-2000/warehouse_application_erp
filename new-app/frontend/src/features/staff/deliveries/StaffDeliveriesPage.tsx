/**
 * Staff deliveries `/staff/deliveries` — WIRE (Step 5).
 * Source: staffTradePurchasesForAlertsProvider → tradePurchasesRecentSnapshot
 * (listTradePurchases limit 50); groupStaffDeliverySections.
 * Deferred: ListSkeleton / FriendlyLoadError polish → STATES.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { readPrimaryBusiness } from "../../../shared/auth/sessionStore";
import { fetchTradePurchasesRecent } from "../staffHomeApi";
import {
  staffDeliverySectionsFromRows,
  type StaffDeliverySections,
  type StaffPendingPurchase,
  type TradePurchaseListRow,
} from "../staffPendingDeliveries";
import {
  STAFF_DEL_BACK_FALLBACK,
  STAFF_DEL_EMPTY_ALL,
  STAFF_DEL_EMPTY_ARRIVED,
  STAFF_DEL_EMPTY_DISPATCHED,
  STAFF_DEL_EMPTY_PENDING_VERIFY,
  STAFF_DEL_LOAD_FAILED,
  STAFF_DEL_SCAN_PATH,
  STAFF_DEL_SCAN_TOOLTIP,
  staffDelReceivePath,
} from "./staffDeliveriesCopy";
import {
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
import {
  staffDelQtyLabel,
  staffDelRowSubtitle,
  staffDelSupplierTitle,
} from "./staffDeliveriesFormat";
import "./StaffDeliveriesPage.css";

const SECTION_EMPTY: Record<StaffDelSectionKey, string> = {
  dispatched: STAFF_DEL_EMPTY_DISPATCHED,
  arrived: STAFF_DEL_EMPTY_ARRIVED,
  pendingVerify: STAFF_DEL_EMPTY_PENDING_VERIFY,
};

const SECTION_HIGHLIGHT: Partial<Record<StaffDelSectionKey, boolean>> = {
  arrived: true,
};

const EMPTY_SECTIONS: StaffDeliverySections = {
  dispatched: [],
  arrived: [],
  pendingVerification: [],
};

function popOrGo(
  navigate: ReturnType<typeof useNavigate>,
  fallback: string,
): void {
  if (window.history.length > 1) {
    navigate(-1);
    return;
  }
  navigate(fallback);
}

function countsFromSections(s: StaffDeliverySections): StaffDelSectionCounts {
  return {
    dispatched: s.dispatched.length,
    arrived: s.arrived.length,
    pendingVerify: s.pendingVerification.length,
  };
}

function purchasesForKey(
  s: StaffDeliverySections,
  key: StaffDelSectionKey,
): StaffPendingPurchase[] {
  if (key === "dispatched") return s.dispatched;
  if (key === "arrived") return s.arrived;
  return s.pendingVerification;
}

export function StaffDeliveriesPage() {
  const navigate = useNavigate();
  const session = readPrimaryBusiness();
  const businessId = session?.id ?? "";
  const [sections, setSections] = useState<StaffDeliverySections>(EMPTY_SECTIONS);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<unknown | null>(null);
  const [retryTick, setRetryTick] = useState(0);

  useEffect(() => {
    if (!businessId) {
      setLoading(false);
      setSections(EMPTY_SECTIONS);
      setLoadError("Not signed in");
      return;
    }
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    void fetchTradePurchasesRecent(businessId)
      .then((rows) => {
        if (cancelled) return;
        const mapped = rows.map((r) => r as TradePurchaseListRow);
        setSections(staffDeliverySectionsFromRows(mapped));
        setLoadError(null);
        setLoading(false);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setSections(EMPTY_SECTIONS);
        setLoadError(e);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [businessId, retryTick]);

  const sectionCounts = countsFromSections(sections);
  const total = staffDelTotal(sectionCounts);
  const title = staffDelAppBarTitle(total);
  const showEmptyAll = !loading && loadError == null && staffDelShowEmptyAll(total);
  const showLoading = loading;
  const showError = !loading && loadError != null;

  function onBack(): void {
    popOrGo(navigate, STAFF_DEL_BACK_FALLBACK);
  }

  function onScan(): void {
    navigate(STAFF_DEL_SCAN_PATH);
  }

  function onOpenReceive(purchaseId: string): void {
    navigate(staffDelReceivePath(purchaseId));
  }

  function retryLoad(): void {
    setRetryTick((n) => n + 1);
  }

  return (
    <div
      className="staff-del-page"
      data-page="staff-deliveries"
      data-step="wire"
      data-total={total}
      data-back-fallback={STAFF_DEL_BACK_FALLBACK}
    >
      <header className="staff-del-appbar" data-slot="appBar">
        <button
          type="button"
          className="staff-del-appbar__back staff-del-appbar__back--active"
          aria-label="Back"
          data-testid="staff-del-back"
          data-action="back"
          onClick={onBack}
        >
          ←
        </button>
        <h1 className="staff-del-appbar__title" data-slot="title">
          {title}
        </h1>
        <button
          type="button"
          className="staff-del-appbar__scan staff-del-appbar__scan--active"
          aria-label={STAFF_DEL_SCAN_TOOLTIP}
          title={STAFF_DEL_SCAN_TOOLTIP}
          data-testid="staff-del-scan"
          data-action="scan-barcode"
          onClick={onScan}
        >
          ⌕
        </button>
      </header>

      <main className="staff-del-body" data-slot="body">
        {showLoading ? (
          <div className="staff-del-loading" data-slot="loading" role="status">
            Loading…
          </div>
        ) : null}

        {showError ? (
          <div className="staff-del-error" data-slot="error" role="alert">
            <p className="staff-del-error__title">{STAFF_DEL_LOAD_FAILED}</p>
            <button
              type="button"
              className="staff-del-error__retry"
              data-action="retry"
              data-testid="staff-del-retry"
              onClick={retryLoad}
            >
              Retry
            </button>
          </div>
        ) : null}

        {!showLoading && !showError
          ? STAFF_DEL_SECTION_ORDER.map((key) => {
              const purchases = purchasesForKey(sections, key);
              const count = purchases.length;
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
                  ) : (
                    <ul className="staff-del-list" data-slot="list">
                      {purchases.map((p, i) => (
                        <li
                          key={p.id}
                          className="staff-del-row staff-del-row--interactive"
                        >
                          <button
                            type="button"
                            className="staff-del-row__hit"
                            data-slot="row"
                            data-action="open-receive"
                            data-purchase-id={p.id}
                            onClick={() => onOpenReceive(p.id)}
                          >
                            <span
                              className="staff-del-row__avatar"
                              aria-hidden="true"
                            >
                              {i + 1}
                            </span>
                            <div className="staff-del-row__body">
                              <div className="staff-del-row__title">
                                {staffDelSupplierTitle(p)}
                              </div>
                              <div className="staff-del-row__sub">
                                {staffDelRowSubtitle(p)}
                              </div>
                              <div className="staff-del-row__bags">
                                {p.bagsLine}
                              </div>
                            </div>
                            <div className="staff-del-row__meta">
                              <span className="staff-del-row__index">
                                {i + 1}/{count}
                              </span>
                              <span className="staff-del-row__qty">
                                {staffDelQtyLabel(p.qty)}
                              </span>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              );
            })
          : null}

        {showEmptyAll ? (
          <div className="staff-del-empty-all" data-slot="emptyAll">
            <p className="staff-del-empty-all__text">{STAFF_DEL_EMPTY_ALL}</p>
          </div>
        ) : null}
      </main>
    </div>
  );
}
