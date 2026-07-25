/**
 * Catalog new subcategory `/catalog/category/:categoryId/new-subcategory` —
 * LAYOUT (Step 2).
 * Formula source: catalog_add_subcategory_page.dart · HexaColors · Outline 12
 * Staff: allowed. Forbidden: fields, CTAs, API.
 */
import { useParams } from "react-router-dom";
import {
  ADD_SUBCATEGORY_CANCEL,
  ADD_SUBCATEGORY_CREATE,
  ADD_SUBCATEGORY_NAME_ERROR,
  ADD_SUBCATEGORY_NAME_HINT,
  ADD_SUBCATEGORY_NAME_LABEL,
  ADD_SUBCATEGORY_TITLE,
  ADD_SUBCATEGORY_TOOLTIP_CLOSE,
} from "./catalogAddSubcategoryCopy";
import "./CatalogAddSubcategoryPage.css";

export function CatalogAddSubcategoryPage() {
  const { categoryId = "" } = useParams<{ categoryId: string }>();

  return (
    <div
      className="add-subcategory-page"
      data-page="catalog-new-subcategory"
      data-step="LAYOUT"
      data-category-id={categoryId}
    >
      <header className="add-subcategory-page__appbar" data-slot="appBar">
        <span
          className="add-subcategory-page__icon-btn"
          data-deferred="close"
          title={ADD_SUBCATEGORY_TOOLTIP_CLOSE}
          aria-hidden
        >
          ×
        </span>
        <h1 className="add-subcategory-page__title">{ADD_SUBCATEGORY_TITLE}</h1>
      </header>

      <div className="add-subcategory-page__body">
        <div
          className="add-subcategory-page__field"
          data-slot="nameField"
          data-deferred="name-field"
          data-label={ADD_SUBCATEGORY_NAME_LABEL}
          data-hint={ADD_SUBCATEGORY_NAME_HINT}
          data-chrome="name-outline"
        >
          <span className="add-subcategory-page__field-label">
            {ADD_SUBCATEGORY_NAME_LABEL}
          </span>
          <span className="add-subcategory-page__field-hint">
            {ADD_SUBCATEGORY_NAME_HINT}
          </span>
          <span
            className="add-subcategory-page__field-error"
            data-chrome="name-error"
            data-error={ADD_SUBCATEGORY_NAME_ERROR}
          >
            {ADD_SUBCATEGORY_NAME_ERROR}
          </span>
        </div>

        <div className="add-subcategory-page__footer" data-slot="footer">
          <span
            className="add-subcategory-page__btn add-subcategory-page__btn--cancel"
            data-deferred="cancel"
            data-label={ADD_SUBCATEGORY_CANCEL}
          >
            {ADD_SUBCATEGORY_CANCEL}
          </span>
          <span
            className="add-subcategory-page__btn add-subcategory-page__btn--create"
            data-deferred="create"
            data-label={ADD_SUBCATEGORY_CREATE}
          >
            {ADD_SUBCATEGORY_CREATE}
          </span>
        </div>
      </div>
    </div>
  );
}
