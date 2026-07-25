/**
 * Catalog new category `/catalog/new-category` — FIELDS (Step 3).
 * Formula source: catalog_add_category_page.dart
 * Name input + touched empty → `Enter a name`. Forbidden: submit/API (BUTTONS/WIRE).
 */
import { useState } from "react";
import {
  ADD_CATEGORY_CANCEL,
  ADD_CATEGORY_CREATE,
  ADD_CATEGORY_NAME_HINT,
  ADD_CATEGORY_NAME_LABEL,
  ADD_CATEGORY_TITLE,
  ADD_CATEGORY_TOOLTIP_CLOSE,
} from "./catalogAddCategoryCopy";
import { addCategoryNameError } from "./catalogAddCategoryFields";
import "./CatalogAddCategoryPage.css";

export function CatalogAddCategoryPage() {
  const [name, setName] = useState("");
  const [touched, setTouched] = useState(false);
  const nameError = addCategoryNameError({ touched, name });
  const showError = nameError != null;

  return (
    <div
      className="add-category-page"
      data-page="catalog-new-category"
      data-step="FIELDS"
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
        <label
          className={
            showError
              ? "add-category-page__field add-category-page__field--active add-category-page__field--error"
              : "add-category-page__field add-category-page__field--active"
          }
          data-slot="nameField"
          data-chrome="name-outline"
          data-error={showError ? "true" : "false"}
        >
          <span className="add-category-page__field-label">
            {ADD_CATEGORY_NAME_LABEL}
          </span>
          <input
            className="add-category-page__field-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder={ADD_CATEGORY_NAME_HINT}
            aria-label={ADD_CATEGORY_NAME_LABEL}
            aria-invalid={showError}
            autoComplete="off"
            autoCapitalize="words"
            autoFocus
            data-testid="add-category-name"
          />
          {showError ? (
            <span
              className="add-category-page__field-error add-category-page__field-error--visible"
              data-chrome="name-error"
              data-testid="add-category-name-error"
            >
              {nameError}
            </span>
          ) : null}
        </label>

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
