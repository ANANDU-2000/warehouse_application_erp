/**
 * Staff item gallery `/staff/items` — BUTTONS (Step 4).
 * Source: staff_item_gallery_page.dart — category expand / sub tabs / row tap / PopupMenu
 * Deferred: listStock API (WIRE); QuickStockActionSheet (WIRE); load error (STATES).
 */
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { formatStockQtyNumber } from "../staffPendingDeliveries";
import {
  STAFF_GALLERY_BACK_FALLBACK,
  STAFF_GALLERY_DEBOUNCE_MS,
  STAFF_GALLERY_DEFAULT_ITEM_NAME,
  STAFF_GALLERY_DEFAULT_UNIT,
  STAFF_GALLERY_EMPTY,
  STAFF_GALLERY_HINT,
  STAFF_GALLERY_MENU_ITEM,
  STAFF_GALLERY_MENU_REORDER,
  STAFF_GALLERY_MENU_STOCK,
  STAFF_GALLERY_NO_BARCODE,
  STAFF_GALLERY_NO_CODE,
  STAFF_GALLERY_SUB_TAB_ALL,
  STAFF_GALLERY_SUGGESTIONS_MAX,
  STAFF_GALLERY_TITLE,
} from "./staffItemGalleryCopy";
import {
  STAFF_GALLERY_FILTER_LABELS,
  STAFF_GALLERY_FILTER_ORDER,
  type StaffGalleryFilter,
  staffGalleryFilterFromQuery,
} from "./staffItemGalleryFilters";
import {
  coerceToDouble,
  filterGalleryItems,
  formatGalleryStockLine,
  formatGallerySummary,
  gallerySuggestions,
  groupGalleryItems,
  itemLowOrOut,
  STAFF_GALLERY_SUB_DASH,
  type StaffGalleryItem,
} from "./staffItemGalleryLogic";
import "./StaffItemGalleryPage.css";

/** Flutter navigation_ext.popOrGo — pop when stack allows, else go fallback. */
function popOrGo(
  navigate: ReturnType<typeof useNavigate>,
  fallback: string,
): void {
  if (window.history.length > 1) {
    navigate(-1);
    return;
  }
  navigate(fallback, { replace: true });
}

function itemId(item: StaffGalleryItem): string {
  return String(item.id ?? "");
}

function itemDisplayName(item: StaffGalleryItem): string {
  const n = String(item.name ?? "").trim();
  return n.length > 0 ? n : STAFF_GALLERY_DEFAULT_ITEM_NAME;
}

function itemSubLabel(item: StaffGalleryItem): string {
  const sub = String(item.subcategory_name ?? "").trim();
  if (sub) return sub;
  return String(item.type_name ?? "").trim();
}

function itemUnit(item: StaffGalleryItem): string {
  const u =
    String(item.stock_unit ?? "").trim() ||
    String(item.default_unit ?? "").trim();
  return u.length > 0 ? u : STAFF_GALLERY_DEFAULT_UNIT;
}

export function StaffItemGalleryPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [filter, setFilter] = useState<StaffGalleryFilter>(() =>
    staffGalleryFilterFromQuery(searchParams.get("filter")),
  );
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  /** WIRE fills via listStock; BUTTONS render expand/rows when nonempty. */
  const [allItems] = useState<StaffGalleryItem[]>([]);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [expandedCats, setExpandedCats] = useState<Set<string>>(() => new Set());
  const [subTabByCat, setSubTabByCat] = useState<Record<string, string | null>>(
    {},
  );
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setDebounced(query.trim());
    }, STAFF_GALLERY_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [query]);

  useEffect(() => {
    function onDocClick() {
      setOpenMenuId(null);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const q = debounced.toLowerCase();
  const filtered = filterGalleryItems(allItems, filter, q);
  const grouped = groupGalleryItems(filtered);
  const cats = [...grouped.keys()].sort();
  const summary = formatGallerySummary(filtered.length, cats.length);

  const needle = query.trim().toLowerCase();
  const suggestions = !needle
    ? []
    : gallerySuggestions(allItems)
        .filter((s) => s.toLowerCase().includes(needle))
        .slice(0, STAFF_GALLERY_SUGGESTIONS_MAX);

  function applySuggestion(v: string) {
    setQuery(v);
    setDebounced(v.trim());
    setSuggestOpen(false);
  }

  function toggleCat(cat: string) {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  function openItemProfile(id: string) {
    if (!id) return;
    navigate(`/catalog/item/${id}`);
  }

  function openItemEdit(id: string) {
    if (!id) return;
    navigate(`/catalog/item/${id}/edit`);
  }

  /** Flutter showQuickStockActionSheet — deferred until stock write WIRE. */
  function onUpdateStock(_item: StaffGalleryItem) {
    /* no-op: QuickStockActionSheet not ported yet */
  }

  return (
    <div
      className="staff-gallery-page"
      data-testid="staff-item-gallery-page"
      data-back-fallback={STAFF_GALLERY_BACK_FALLBACK}
      data-filter={filter}
      data-debounced={debounced}
    >
      <header className="staff-gallery-page__appbar" data-slot="appBar">
        <div
          className="staff-gallery-page__appbar-leading"
          data-slot="appBar.leading"
        >
          <button
            type="button"
            className="staff-gallery-page__icon-btn"
            title="Back"
            aria-label="Back"
            data-testid="staff-gallery-back"
            onClick={() => popOrGo(navigate, STAFF_GALLERY_BACK_FALLBACK)}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path
                fill="currentColor"
                d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
              />
            </svg>
          </button>
        </div>
        <h1 className="staff-gallery-page__title">{STAFF_GALLERY_TITLE}</h1>
        <div
          className="staff-gallery-page__appbar-actions"
          data-slot="appBar.actions"
        />
      </header>

      <div className="staff-gallery-page__body" data-slot="body">
        <div className="staff-gallery-page__search" data-slot="search">
          <label className="staff-gallery-page__search-field staff-gallery-page__search-field--active">
            <span className="staff-gallery-page__search-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path
                  fill="currentColor"
                  d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
                />
              </svg>
            </span>
            <input
              type="search"
              className="staff-gallery-page__search-input staff-gallery-page__search-input--active"
              placeholder={STAFF_GALLERY_HINT}
              data-testid="staff-gallery-search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSuggestOpen(true);
              }}
              onFocus={() => setSuggestOpen(true)}
              onBlur={() => {
                window.setTimeout(() => setSuggestOpen(false), 150);
              }}
              autoComplete="off"
            />
          </label>
          {suggestOpen && suggestions.length > 0 ? (
            <ul
              className="staff-gallery-page__suggest"
              data-slot="suggest"
              data-testid="staff-gallery-suggest"
              role="listbox"
            >
              {suggestions.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    className="staff-gallery-page__suggest-item"
                    role="option"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => applySuggestion(s)}
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="staff-gallery-page__filters" data-slot="filters">
          <div
            className="staff-gallery-page__filter-row staff-gallery-page__filter-row--active"
            role="listbox"
            aria-label="Gallery filters"
          >
            {STAFF_GALLERY_FILTER_ORDER.map((key) => {
              const selected = filter === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={
                    selected
                      ? "staff-gallery-page__chip staff-gallery-page__chip--selected staff-gallery-page__chip--active"
                      : "staff-gallery-page__chip staff-gallery-page__chip--active"
                  }
                  data-filter-key={key}
                  data-testid={`staff-gallery-filter-${key}`}
                  onClick={() => setFilter(key)}
                >
                  {STAFF_GALLERY_FILTER_LABELS[key]}
                </button>
              );
            })}
          </div>
        </div>

        <p
          className="staff-gallery-page__summary"
          data-slot="summary"
          data-testid="staff-gallery-summary"
        >
          {summary}
        </p>

        <div className="staff-gallery-page__results" data-slot="results">
          <div className="staff-gallery-page__list" data-slot="list">
            {filtered.length === 0 ? (
              <p
                className="staff-gallery-page__empty"
                data-slot="empty"
                data-testid="staff-gallery-empty"
              >
                {STAFF_GALLERY_EMPTY}
              </p>
            ) : (
              cats.map((cat) => {
                const subMap = grouped.get(cat)!;
                const expanded = expandedCats.has(cat);
                const subs = [...subMap.keys()].sort();
                const subTab = subTabByCat[cat] ?? null;
                return (
                  <div
                    key={cat}
                    className="staff-gallery-page__category-card"
                    data-slot="categoryCard"
                    data-category={cat}
                    data-expanded={expanded ? "true" : "false"}
                  >
                    <button
                      type="button"
                      className="staff-gallery-page__category-header"
                      data-testid={`staff-gallery-cat-${cat}`}
                      aria-expanded={expanded}
                      onClick={() => toggleCat(cat)}
                    >
                      <span className="staff-gallery-page__category-title">
                        {cat}
                      </span>
                      <span
                        className="staff-gallery-page__category-chevron"
                        aria-hidden="true"
                      >
                        <svg viewBox="0 0 24 24" width="20" height="20">
                          <path
                            fill="currentColor"
                            d={
                              expanded
                                ? "M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"
                                : "M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"
                            }
                          />
                        </svg>
                      </span>
                    </button>
                    {expanded ? (
                      <div
                        className="staff-gallery-page__category-body"
                        data-slot="categoryBody"
                      >
                        {subs.length > 1 ? (
                          <div
                            className="staff-gallery-page__sub-tabs"
                            data-slot="subTabs"
                          >
                            <button
                              type="button"
                              className={
                                subTab == null
                                  ? "staff-gallery-page__chip staff-gallery-page__chip--selected staff-gallery-page__chip--active"
                                  : "staff-gallery-page__chip staff-gallery-page__chip--active"
                              }
                              data-testid={`staff-gallery-subtab-all-${cat}`}
                              onClick={() =>
                                setSubTabByCat((prev) => {
                                  const next = { ...prev };
                                  delete next[cat];
                                  return next;
                                })
                              }
                            >
                              {STAFF_GALLERY_SUB_TAB_ALL}
                            </button>
                            {subs
                              .filter((s) => s !== STAFF_GALLERY_SUB_DASH)
                              .map((sub) => (
                                <button
                                  key={sub}
                                  type="button"
                                  className={
                                    subTab === sub
                                      ? "staff-gallery-page__chip staff-gallery-page__chip--selected staff-gallery-page__chip--active"
                                      : "staff-gallery-page__chip staff-gallery-page__chip--active"
                                  }
                                  data-testid={`staff-gallery-subtab-${cat}-${sub}`}
                                  onClick={() =>
                                    setSubTabByCat((prev) => ({
                                      ...prev,
                                      [cat]: sub,
                                    }))
                                  }
                                >
                                  {sub}
                                </button>
                              ))}
                          </div>
                        ) : null}
                        {[...subMap.entries()]
                          .filter(
                            ([subKey]) => subTab == null || subTab === subKey,
                          )
                          .flatMap(([subKey, items]) => {
                            const hideSub =
                              subTab != null || subKey === STAFF_GALLERY_SUB_DASH;
                            return items.map((item) => {
                              const id = itemId(item);
                              const name = itemDisplayName(item);
                              const sub = itemSubLabel(item);
                              const unit = itemUnit(item);
                              const stock = coerceToDouble(item.current_stock);
                              const code = String(item.item_code ?? "").trim();
                              const missingBc = item.missing_barcode === true;
                              const low = itemLowOrOut(item);
                              const stockLine = formatGalleryStockLine(
                                formatStockQtyNumber(stock),
                                unit,
                                code,
                                missingBc,
                                STAFF_GALLERY_NO_CODE,
                                STAFF_GALLERY_NO_BARCODE,
                              );
                              const menuOpen = openMenuId === id && id !== "";
                              return (
                                <div
                                  key={id || `${cat}-${subKey}-${name}`}
                                  className="staff-gallery-page__item-row"
                                  data-slot="itemRow"
                                  data-item-id={id || undefined}
                                >
                                  <button
                                    type="button"
                                    className="staff-gallery-page__item-main"
                                    data-testid={
                                      id
                                        ? `staff-gallery-item-${id}`
                                        : undefined
                                    }
                                    disabled={!id}
                                    onClick={() => openItemProfile(id)}
                                  >
                                    <p className="staff-gallery-page__item-name">
                                      {name}
                                    </p>
                                    {!hideSub && sub ? (
                                      <p className="staff-gallery-page__item-sub">
                                        {sub}
                                      </p>
                                    ) : null}
                                    <p
                                      className={
                                        low
                                          ? "staff-gallery-page__item-stock staff-gallery-page__item-stock--low"
                                          : "staff-gallery-page__item-stock"
                                      }
                                    >
                                      {stockLine}
                                    </p>
                                  </button>
                                  <div className="staff-gallery-page__item-menu-wrap">
                                    <button
                                      type="button"
                                      className="staff-gallery-page__item-menu-btn"
                                      aria-label="More"
                                      data-testid={
                                        id
                                          ? `staff-gallery-menu-${id}`
                                          : undefined
                                      }
                                      disabled={!id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (!id) return;
                                        setOpenMenuId((cur) =>
                                          cur === id ? null : id,
                                        );
                                      }}
                                    >
                                      <svg
                                        viewBox="0 0 24 24"
                                        width="20"
                                        height="20"
                                        aria-hidden="true"
                                      >
                                        <path
                                          fill="currentColor"
                                          d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
                                        />
                                      </svg>
                                    </button>
                                    {menuOpen ? (
                                      <div
                                        className="staff-gallery-page__item-menu"
                                        data-slot="itemMenu"
                                        role="menu"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <button
                                          type="button"
                                          role="menuitem"
                                          className="staff-gallery-page__item-menu-item"
                                          data-action="stock"
                                          data-deferred="quick-stock-sheet"
                                          onClick={() => {
                                            setOpenMenuId(null);
                                            onUpdateStock(item);
                                          }}
                                        >
                                          {STAFF_GALLERY_MENU_STOCK}
                                        </button>
                                        <button
                                          type="button"
                                          role="menuitem"
                                          className="staff-gallery-page__item-menu-item"
                                          data-action="reorder"
                                          onClick={() => {
                                            setOpenMenuId(null);
                                            openItemEdit(id);
                                          }}
                                        >
                                          {STAFF_GALLERY_MENU_REORDER}
                                        </button>
                                        <button
                                          type="button"
                                          role="menuitem"
                                          className="staff-gallery-page__item-menu-item"
                                          data-action="item"
                                          onClick={() => {
                                            setOpenMenuId(null);
                                            openItemProfile(id);
                                          }}
                                        >
                                          {STAFF_GALLERY_MENU_ITEM}
                                        </button>
                                      </div>
                                    ) : null}
                                  </div>
                                </div>
                              );
                            });
                          })}
                      </div>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
