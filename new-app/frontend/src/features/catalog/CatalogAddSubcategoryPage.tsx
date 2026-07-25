/**
 * Catalog new subcategory `/catalog/category/:categoryId/new-subcategory` —
 * SCAFFOLD (Step 1).
 * Formula source: catalog_add_subcategory_page.dart
 * Staff: allowed (`_isStaffAllowedRoute` endsWith /new-subcategory).
 * Forbidden: fields, CTAs, API.
 */
import { useParams } from "react-router-dom";
import {
  ADD_SUBCATEGORY_CANCEL,
  ADD_SUBCATEGORY_CREATE,
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
      data-step="SCAFFOLD"
      data-category-id={categoryId}
    >
      <header className="add-subcategory-page__appbar" data-slot="appBar">
        <span data-deferred="close" title={ADD_SUBCATEGORY_TOOLTIP_CLOSE}>
          ×
        </span>
        <h1 className="add-subcategory-page__title">{ADD_SUBCATEGORY_TITLE}</h1>
      </header>

      <div className="add-subcategory-page__body">
        <div
          className="add-subcategory-page__slot"
          data-slot="nameField"
          data-deferred="name-field"
          data-label={ADD_SUBCATEGORY_NAME_LABEL}
          data-hint={ADD_SUBCATEGORY_NAME_HINT}
        >
          {ADD_SUBCATEGORY_NAME_LABEL} — {ADD_SUBCATEGORY_NAME_HINT}
        </div>

        <div className="add-subcategory-page__footer" data-slot="footer">
          <span data-deferred="cancel" data-label={ADD_SUBCATEGORY_CANCEL}>
            {ADD_SUBCATEGORY_CANCEL}
          </span>
          <span data-deferred="create" data-label={ADD_SUBCATEGORY_CREATE}>
            {ADD_SUBCATEGORY_CREATE}
          </span>
        </div>
      </div>
    </div>
  );
}
