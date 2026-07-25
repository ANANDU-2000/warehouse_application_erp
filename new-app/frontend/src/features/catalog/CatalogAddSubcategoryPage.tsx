/**
 * Catalog new subcategory `/catalog/category/:categoryId/new-subcategory` —
 * FIELDS (Step 3).
 * Formula source: catalog_add_subcategory_page.dart
 * Name input + touched empty → `Enter a name`. Forbidden: submit/API (BUTTONS/WIRE).
 */
import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  ADD_SUBCATEGORY_CANCEL,
  ADD_SUBCATEGORY_CREATE,
  ADD_SUBCATEGORY_NAME_HINT,
  ADD_SUBCATEGORY_NAME_LABEL,
  ADD_SUBCATEGORY_TITLE,
  ADD_SUBCATEGORY_TOOLTIP_CLOSE,
} from "./catalogAddSubcategoryCopy";
import { addSubcategoryNameError } from "./catalogAddSubcategoryFields";
import "./CatalogAddSubcategoryPage.css";

export function CatalogAddSubcategoryPage() {
  const { categoryId = "" } = useParams<{ categoryId: string }>();
  const [name, setName] = useState("");
  const [touched, setTouched] = useState(false);
  const nameError = addSubcategoryNameError({ touched, name });
  const showError = nameError != null;

  return (
    <div
      className="add-subcategory-page"
      data-page="catalog-new-subcategory"
      data-step="FIELDS"
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
        <label
          className={
            showError
              ? "add-subcategory-page__field add-subcategory-page__field--active add-subcategory-page__field--error"
              : "add-subcategory-page__field add-subcategory-page__field--active"
          }
          data-slot="nameField"
          data-chrome="name-outline"
          data-error={showError ? "true" : "false"}
        >
          <span className="add-subcategory-page__field-label">
            {ADD_SUBCATEGORY_NAME_LABEL}
          </span>
          <input
            className="add-subcategory-page__field-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder={ADD_SUBCATEGORY_NAME_HINT}
            aria-label={ADD_SUBCATEGORY_NAME_LABEL}
            aria-invalid={showError}
            autoComplete="off"
            autoCapitalize="words"
            autoFocus
            data-testid="add-subcategory-name"
          />
          {showError ? (
            <span
              className="add-subcategory-page__field-error add-subcategory-page__field-error--visible"
              data-chrome="name-error"
              data-testid="add-subcategory-name-error"
            >
              {nameError}
            </span>
          ) : null}
        </label>

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
