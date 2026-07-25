/**
 * Catalog new category `/catalog/new-category` — LAYOUT (Step 2).
 * Formula source: catalog_add_category_page.dart · HexaColors · Outline 12
 * Staff: allowed. Forbidden: fields, CTAs, API.
 */
import {
  ADD_CATEGORY_CANCEL,
  ADD_CATEGORY_CREATE,
  ADD_CATEGORY_NAME_ERROR,
  ADD_CATEGORY_NAME_HINT,
  ADD_CATEGORY_NAME_LABEL,
  ADD_CATEGORY_TITLE,
  ADD_CATEGORY_TOOLTIP_CLOSE,
} from "./catalogAddCategoryCopy";
import "./CatalogAddCategoryPage.css";

export function CatalogAddCategoryPage() {
  return (
    <div
      className="add-category-page"
      data-page="catalog-new-category"
      data-step="LAYOUT"
    >
      <header className="add-category-page__appbar" data-slot="appBar">
        <span
          className="add-category-page__icon-btn"
          data-deferred="close"
          title={ADD_CATEGORY_TOOLTIP_CLOSE}
          aria-hidden
        >
          ×
        </span>
        <h1 className="add-category-page__title">{ADD_CATEGORY_TITLE}</h1>
      </header>

      <div className="add-category-page__body">
        <div
          className="add-category-page__field"
          data-slot="nameField"
          data-deferred="name-field"
          data-label={ADD_CATEGORY_NAME_LABEL}
          data-hint={ADD_CATEGORY_NAME_HINT}
          data-chrome="name-outline"
        >
          <span className="add-category-page__field-label">
            {ADD_CATEGORY_NAME_LABEL}
          </span>
          <span className="add-category-page__field-hint">
            {ADD_CATEGORY_NAME_HINT}
          </span>
          <span
            className="add-category-page__field-error"
            data-chrome="name-error"
            data-error={ADD_CATEGORY_NAME_ERROR}
          >
            {ADD_CATEGORY_NAME_ERROR}
          </span>
        </div>

        <div className="add-category-page__footer" data-slot="footer">
          <span
            className="add-category-page__btn add-category-page__btn--cancel"
            data-deferred="cancel"
            data-label={ADD_CATEGORY_CANCEL}
          >
            {ADD_CATEGORY_CANCEL}
          </span>
          <span
            className="add-category-page__btn add-category-page__btn--create"
            data-deferred="create"
            data-label={ADD_CATEGORY_CREATE}
          >
            {ADD_CATEGORY_CREATE}
          </span>
        </div>
      </div>
    </div>
  );
}
