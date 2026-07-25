/**
 * Catalog new category `/catalog/new-category` — SCAFFOLD (Step 1).
 * Formula source: catalog_add_category_page.dart
 * Staff: allowed (`_isStaffAllowedRoute`). Forbidden: fields, CTAs, API.
 */
import {
  ADD_CATEGORY_CANCEL,
  ADD_CATEGORY_CREATE,
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
      data-step="SCAFFOLD"
    >
      <header className="add-category-page__appbar" data-slot="appBar">
        <span data-deferred="close" title={ADD_CATEGORY_TOOLTIP_CLOSE}>
          ×
        </span>
        <h1 className="add-category-page__title">{ADD_CATEGORY_TITLE}</h1>
      </header>

      <div className="add-category-page__body">
        <div
          className="add-category-page__slot"
          data-slot="nameField"
          data-deferred="name-field"
          data-label={ADD_CATEGORY_NAME_LABEL}
          data-hint={ADD_CATEGORY_NAME_HINT}
        >
          {ADD_CATEGORY_NAME_LABEL} — {ADD_CATEGORY_NAME_HINT}
        </div>

        <div className="add-category-page__footer" data-slot="footer">
          <span data-deferred="cancel" data-label={ADD_CATEGORY_CANCEL}>
            {ADD_CATEGORY_CANCEL}
          </span>
          <span data-deferred="create" data-label={ADD_CATEGORY_CREATE}>
            {ADD_CATEGORY_CREATE}
          </span>
        </div>
      </div>
    </div>
  );
}
