/**
 * Staff item gallery `/staff/items` — FIELDS (Step 3).
 * Source: staff_item_gallery_page.dart — Autocomplete debounce 200ms + filter chips + local filter/search
 * Deferred: listStock API / category expand / row menus (BUTTONS/WIRE); load error (STATES).
 */
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  STAFF_GALLERY_BACK_FALLBACK,
  STAFF_GALLERY_DEBOUNCE_MS,
  STAFF_GALLERY_EMPTY,
  STAFF_GALLERY_HINT,
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
  filterGalleryItems,
  formatGallerySummary,
  gallerySuggestions,
  groupGalleryItems,
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

export function StaffItemGalleryPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [filter, setFilter] = useState<StaffGalleryFilter>(() =>
    staffGalleryFilterFromQuery(searchParams.get("filter")),
  );
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  /** WIRE fills via listStock; FIELDS runs filter/group on empty catalog. */
  const [allItems] = useState<StaffGalleryItem[]>([]);
  const [suggestOpen, setSuggestOpen] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setDebounced(query.trim());
    }, STAFF_GALLERY_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [query]);

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
            {/* Category expand + item rows — BUTTONS/WIRE (empty catalog until listStock) */}
            {filtered.length === 0 ? (
              <p
                className="staff-gallery-page__empty"
                data-slot="empty"
                data-testid="staff-gallery-empty"
              >
                {STAFF_GALLERY_EMPTY}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
