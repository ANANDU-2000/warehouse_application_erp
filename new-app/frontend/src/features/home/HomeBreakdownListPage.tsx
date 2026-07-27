/**
 * Owner `/home/breakdown-more` — Step 6 STATES.
 * Source: home_breakdown_list_page.dart — Center CircularProgressIndicator cold load;
 * silent empty ranked list (no HexaEmptyState / FriendlyLoadError on this route).
 * API: GET …/reports/home-overview only (never /dashboard).
 */
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  HOME_BREAKDOWN_SEARCH_HINT,
  HOME_BREAKDOWN_TOTAL_LABEL,
} from "./homeBreakdownCopy";
import { breakdownRowMatchesQuery } from "./homeBreakdownSearch";
import {
  homeBreakdownAppBarTitle,
  homeBreakdownTabFromQuery,
  type HomeBreakdownTab,
} from "./homeBreakdownTab";
import {
  BREAKDOWN_DOT_COLORS,
  categoryQtyLabel,
  dashboardUnitsLineFromOverview,
  itemUpperQtyLine,
} from "./homeBreakdownUnits";
import { formatRupee } from "./homeFormatters";
import {
  fetchHomeOverview,
  type HomeOverviewCategory,
  type HomeOverviewPayload,
} from "./homeOverviewApi";
import { homePeriodApiDates } from "./homePeriod";
import { readPrimaryBusiness } from "../../shared/auth/sessionStore";
import "./HomeBreakdownListPage.css";

/** Flutter empty seed when fetch fails / no session — Total ₹0 + 0 KG. */
function emptyOverviewSeed(): HomeOverviewPayload {
  return {
    from: "",
    to: "",
    summary: {
      deals: 0,
      total_purchase: 0,
      total_landing: 0,
      total_selling: 0,
      total_profit: 0,
      profit_percent: null,
      total_qty: 0,
      pending_delivery_count: 0,
      supplier_count: 0,
      broker_count: 0,
      received_delivery_count: 0,
      negative_stock_count: 0,
    },
    unit_totals: {
      total_kg: 0,
      total_bags: 0,
      total_boxes: 0,
      total_tins: 0,
    },
    categories: [],
    home_shell: { subcategories: [], suppliers: [], items: [] },
  };
}

/** Flutter navigation_ext.popOrGo — pop when stack allows, else go fallback. */
function popOrGo(navigate: ReturnType<typeof useNavigate>, fallback: string) {
  const idx =
    typeof window !== "undefined" &&
    window.history.state &&
    typeof (window.history.state as { idx?: unknown }).idx === "number"
      ? (window.history.state as { idx: number }).idx
      : 0;
  if (idx > 0) {
    navigate(-1);
    return;
  }
  navigate(fallback, { replace: true });
}

function resolveTab(raw: string | null): HomeBreakdownTab {
  return homeBreakdownTabFromQuery(raw) ?? "category";
}

function coerceNum(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

type DisplayRow = {
  title: string;
  amount: number;
  qtyLine: string;
  rest1?: string;
  rest2?: string;
};

function categoryRows(cats: HomeOverviewCategory[]): DisplayRow[] {
  return [...cats]
    .filter((c) => coerceNum(c.total_purchase) > 0)
    .sort(
      (a, b) => coerceNum(b.total_purchase) - coerceNum(a.total_purchase),
    )
    .map((c) => {
      const units = c.units ?? { bags: 0, boxes: 0, tins: 0 };
      const firstUnit =
        Array.isArray(c.items) &&
        c.items[0] &&
        typeof c.items[0] === "object" &&
        "unit" in (c.items[0] as object)
          ? String((c.items[0] as { unit?: string }).unit ?? "")
          : undefined;
      return {
        title: c.category_name?.trim() || "Uncategorised",
        amount: coerceNum(c.total_purchase),
        qtyLine: categoryQtyLabel(
          {
            bags: coerceNum(units.bags),
            boxes: coerceNum(units.boxes),
            tins: coerceNum(units.tins),
          },
          coerceNum(c.total_qty),
          firstUnit,
        ),
        rest1: c.subtitle_supplier?.trim() || "—",
        rest2: c.subtitle_broker?.trim() || "—",
      };
    });
}

function shellRows(
  tab: HomeBreakdownTab,
  overview: HomeOverviewPayload,
  query: string,
): DisplayRow[] {
  const shell = overview.home_shell;
  if (!shell) return [];
  if (tab === "subcategory") {
    const rows = [...(shell.subcategories ?? [])].sort(
      (a, b) =>
        coerceNum(b.total_purchase) - coerceNum(a.total_purchase),
    );
    return rows
      .map((a) => {
        const typ = String(a.type_name ?? "").trim();
        const title = typ
          ? typ
          : String(a.category_name ?? "—");
        const qtyLine = itemUpperQtyLine(a);
        return {
          title,
          amount: coerceNum(a.total_purchase),
          qtyLine,
        };
      })
      .filter((r) =>
        breakdownRowMatchesQuery({
          title: r.title,
          qtyLine: r.qtyLine,
          query,
        }),
      );
  }
  if (tab === "supplier") {
    const rows = [...(shell.suppliers ?? [])].sort(
      (a, b) =>
        coerceNum(b.total_purchase) - coerceNum(a.total_purchase),
    );
    return rows
      .map((a) => {
        const title = String(a.supplier_name ?? "—");
        const qtyLine = itemUpperQtyLine(a);
        return {
          title,
          amount: coerceNum(a.total_purchase),
          qtyLine,
        };
      })
      .filter((r) =>
        breakdownRowMatchesQuery({
          title: r.title,
          qtyLine: r.qtyLine,
          query,
        }),
      );
  }
  if (tab === "items") {
    const rows = [...(shell.items ?? [])].sort(
      (a, b) =>
        coerceNum(b.total_purchase) - coerceNum(a.total_purchase),
    );
    return rows
      .map((a) => {
        const title = String(a.item_name ?? "—");
        const qtyLine = itemUpperQtyLine(a, title);
        return {
          title,
          amount: coerceNum(a.total_purchase),
          qtyLine,
        };
      })
      .filter((r) =>
        breakdownRowMatchesQuery({
          title: r.title,
          qtyLine: r.qtyLine,
          query,
        }),
      );
  }
  return [];
}

export function HomeBreakdownListPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const tab = resolveTab(params.get("tab"));
  const title = homeBreakdownAppBarTitle(tab);
  const showSearch = tab !== "category";

  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const searchActive =
    showSearch && (searchFocused || searchQuery.trim() !== "");

  const [overview, setOverview] = useState<HomeOverviewPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = readPrimaryBusiness();
    if (!session?.id) {
      setLoading(false);
      setOverview(emptyOverviewSeed());
      return;
    }
    const { from, to } = homePeriodApiDates("month");
    const ac = new AbortController();
    setLoading(true);
    void fetchHomeOverview({ businessId: session.id, from, to })
      .then((data) => {
        if (ac.signal.aborted) return;
        setOverview(data);
        setLoading(false);
      })
      .catch(() => {
        /* Flutter: failed fetch → empty seed; no FriendlyLoadError on this page */
        if (ac.signal.aborted) return;
        setOverview(emptyOverviewSeed());
        setLoading(false);
      });
    return () => ac.abort();
  }, []);

  function clearSearch() {
    setSearchQuery("");
  }

  function handleBack() {
    popOrGo(navigate, "/home");
  }

  /** Cold load: Flutter body = Center(CircularProgressIndicator) only. */
  const showColdSpinner = loading && overview == null;

  const rows: DisplayRow[] =
    overview == null
      ? []
      : tab === "category"
        ? categoryRows(overview.categories ?? [])
        : shellRows(tab, overview, searchQuery);

  const totalAmount = overview?.summary.total_purchase ?? 0;
  const unitsLine = overview
    ? dashboardUnitsLineFromOverview(overview.unit_totals)
    : "0 KG";

  return (
    <div
      className="home-breakdown-page"
      data-testid="home-breakdown-list-page"
    >
      <header
        className="home-breakdown-page__appbar"
        data-slot="appbar"
        data-testid="home-breakdown-slot-appbar"
      >
        <button
          type="button"
          className="home-breakdown-page__back"
          data-slot="appbar-leading"
          aria-label="Back"
          onClick={handleBack}
        >
          <BackIcon />
        </button>
        <h1 className="home-breakdown-page__title">{title}</h1>
      </header>

      <div
        className="home-breakdown-page__body"
        aria-busy={showColdSpinner}
      >
        {showColdSpinner ? (
          <div
            className="home-breakdown-page__cold-load"
            role="status"
            aria-label="Loading"
            data-testid="home-breakdown-cold-spinner"
          >
            <span
              className="home-breakdown-page__spinner-ring"
              aria-hidden="true"
            />
          </div>
        ) : (
          <>
            {showSearch ? (
              <section
                className="home-breakdown-page__search"
                data-slot="search"
                data-testid="home-breakdown-slot-search"
                aria-label="Search"
              >
                <div className="home-breakdown-page__search-chrome">
                  <SearchIcon />
                  <input
                    type="search"
                    className="home-breakdown-page__search-input"
                    placeholder={HOME_BREAKDOWN_SEARCH_HINT}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    aria-label={HOME_BREAKDOWN_SEARCH_HINT}
                    data-testid="home-breakdown-search-input"
                  />
                  {searchQuery.trim() !== "" ? (
                    <button
                      type="button"
                      className="home-breakdown-page__search-clear"
                      aria-label="Clear"
                      onClick={clearSearch}
                      data-testid="home-breakdown-search-clear"
                    >
                      <ClearIcon />
                    </button>
                  ) : null}
                </div>
              </section>
            ) : (
              <section
                className="home-breakdown-page__search"
                data-slot="search"
                data-testid="home-breakdown-slot-search"
                aria-label="Search"
                hidden
              />
            )}

            <section
              className="home-breakdown-page__total-header"
              data-slot="total-header"
              data-testid="home-breakdown-slot-total-header"
              aria-label="Total header"
              hidden={searchActive}
            >
              {!searchActive ? (
                <div className="home-breakdown-page__total-card">
                  <span className="home-breakdown-page__total-label">
                    {HOME_BREAKDOWN_TOTAL_LABEL}
                  </span>
                  <span className="home-breakdown-page__total-amount">
                    {formatRupee(totalAmount)}
                  </span>
                  <span className="home-breakdown-page__total-units">
                    {unitsLine}
                  </span>
                </div>
              ) : null}
            </section>

            <section
              className="home-breakdown-page__ranked-list"
              data-slot="ranked-list"
              data-testid="home-breakdown-slot-ranked-list"
              aria-label="Ranked list"
            >
              {rows.map((row, i) => (
                <BreakdownTile
                  key={`${row.title}-${i}`}
                  row={row}
                  dot={BREAKDOWN_DOT_COLORS[i % BREAKDOWN_DOT_COLORS.length]}
                />
              ))}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function BreakdownTile({
  row,
  dot,
}: {
  row: DisplayRow;
  dot: string;
}) {
  const tail = [row.rest1, row.rest2]
    .filter((s) => s && s.trim() !== "" && s.trim() !== "—")
    .join(" · ");
  return (
    <div className="home-breakdown-page__tile" role="listitem">
      <div className="home-breakdown-page__tile-top">
        <span
          className="home-breakdown-page__dot"
          style={{ background: dot }}
          aria-hidden="true"
        />
        <span className="home-breakdown-page__tile-title">{row.title}</span>
        <span className="home-breakdown-page__tile-amount">
          {formatRupee(row.amount)}
        </span>
      </div>
      <div className="home-breakdown-page__tile-sub">
        <span className="home-breakdown-page__tile-qty">{row.qtyLine}</span>
        {tail ? (
          <span className="home-breakdown-page__tile-tail"> · {tail}</span>
        ) : null}
      </div>
    </div>
  );
}

function BackIcon() {
  return (
    <svg
      className="home-breakdown-page__back-icon"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M19 11H7.83l4.58-4.59L11 5l-7 7 7 7 1.41-1.41L7.83 13H19v-2z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      className="home-breakdown-page__search-icon"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg
      className="home-breakdown-page__clear-icon"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  );
}
