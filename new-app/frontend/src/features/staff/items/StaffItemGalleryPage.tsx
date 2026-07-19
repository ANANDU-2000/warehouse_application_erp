/**
 * Staff item gallery `/staff/items` — LAYOUT (Step 2).
 * Source: staff_item_gallery_page.dart + app_theme chipTheme / HexaColors
 * Inert: typing, chip select, stock list API, expand, row menus (FIELDS/BUTTONS/WIRE).
 */
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  STAFF_GALLERY_BACK_FALLBACK,
  STAFF_GALLERY_EMPTY,
  STAFF_GALLERY_HINT,
  STAFF_GALLERY_SUMMARY_EMPTY,
  STAFF_GALLERY_TITLE,
} from "./staffItemGalleryCopy";
import {
  STAFF_GALLERY_FILTER_LABELS,
  STAFF_GALLERY_FILTER_ORDER,
  staffGalleryFilterFromQuery,
} from "./staffItemGalleryFilters";
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
  const filter = staffGalleryFilterFromQuery(searchParams.get("filter"));

  return (
    <div
      className="staff-gallery-page"
      data-testid="staff-item-gallery-page"
      data-back-fallback={STAFF_GALLERY_BACK_FALLBACK}
      data-filter={filter}
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
          <label className="staff-gallery-page__search-field">
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
              className="staff-gallery-page__search-input"
              placeholder={STAFF_GALLERY_HINT}
              readOnly
              aria-readonly="true"
              data-testid="staff-gallery-search"
              value=""
            />
          </label>
        </div>

        <div className="staff-gallery-page__filters" data-slot="filters">
          <div
            className="staff-gallery-page__filter-row"
            role="listbox"
            aria-label="Gallery filters"
          >
            {STAFF_GALLERY_FILTER_ORDER.map((key) => {
              const selected = filter === key;
              return (
                <span
                  key={key}
                  role="option"
                  aria-selected={selected}
                  className={
                    selected
                      ? "staff-gallery-page__chip staff-gallery-page__chip--selected"
                      : "staff-gallery-page__chip"
                  }
                  data-filter-key={key}
                >
                  {STAFF_GALLERY_FILTER_LABELS[key]}
                </span>
              );
            })}
          </div>
        </div>

        <p
          className="staff-gallery-page__summary"
          data-slot="summary"
          data-testid="staff-gallery-summary"
        >
          {STAFF_GALLERY_SUMMARY_EMPTY}
        </p>

        <div className="staff-gallery-page__results" data-slot="results">
          <div className="staff-gallery-page__list" data-slot="list">
            <p
              className="staff-gallery-page__empty"
              data-slot="empty"
              data-testid="staff-gallery-empty"
            >
              {STAFF_GALLERY_EMPTY}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
