/**
 * Catalog new category `/catalog/new-category` — BUTTONS (Step 4).
 * Formula source: catalog_add_category_page.dart
 * Close/Cancel → pop(false); Create → touch empty validation only.
 * Forbidden: POST create / similar dialog (WIRE).
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { readPrimaryBusiness } from "../../shared/auth/sessionStore";
import {
  ADD_CATEGORY_BACK_FALLBACK_OWNER,
  ADD_CATEGORY_BACK_FALLBACK_STAFF,
  ADD_CATEGORY_CANCEL,
  ADD_CATEGORY_CREATE,
  ADD_CATEGORY_NAME_HINT,
  ADD_CATEGORY_NAME_LABEL,
  ADD_CATEGORY_TITLE,
  ADD_CATEGORY_TOOLTIP_CLOSE,
} from "./catalogAddCategoryCopy";
import {
  addCategoryNameError,
  addCategoryNameIsEmpty,
} from "./catalogAddCategoryFields";
import "./CatalogAddCategoryPage.css";

function popOrGo(
  navigate: ReturnType<typeof useNavigate>,
  fallback: string,
): void {
  if (window.history.length > 1) {
    navigate(-1);
    return;
  }
  navigate(fallback);
}

export function CatalogAddCategoryPage() {
  const navigate = useNavigate();
  const session = readPrimaryBusiness();
  const role = (session?.role ?? "").toLowerCase();
  const isStaff = role === "staff";
  const backFallback = isStaff
    ? ADD_CATEGORY_BACK_FALLBACK_STAFF
    : ADD_CATEGORY_BACK_FALLBACK_OWNER;

  const [name, setName] = useState("");
  const [touched, setTouched] = useState(false);
  const nameError = addCategoryNameError({ touched, name });
  const showError = nameError != null;

  const onClose = () => popOrGo(navigate, backFallback);
  const onCancel = () => popOrGo(navigate, backFallback);
  /** Flutter `_create`: empty → set touched; non-empty → API (WIRE). */
  const onCreate = () => {
    if (addCategoryNameIsEmpty(name)) {
      setTouched(true);
      return;
    }
    /* Valid name — POST + similar dialog deferred to WIRE */
  };

  return (
    <div
      className="add-category-page"
      data-page="catalog-new-category"
      data-step="BUTTONS"
    >
      <header className="add-category-page__appbar" data-slot="appBar">
        <button
          type="button"
          className="add-category-page__icon-btn add-category-page__icon-btn--active"
          data-action="close"
          title={ADD_CATEGORY_TOOLTIP_CLOSE}
          aria-label={ADD_CATEGORY_TOOLTIP_CLOSE}
          onClick={onClose}
        >
          ×
        </button>
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
          <button
            type="button"
            className="add-category-page__btn add-category-page__btn--cancel add-category-page__btn--active"
            data-action="cancel"
            data-label={ADD_CATEGORY_CANCEL}
            onClick={onCancel}
          >
            {ADD_CATEGORY_CANCEL}
          </button>
          <button
            type="button"
            className="add-category-page__btn add-category-page__btn--create add-category-page__btn--active"
            data-action="create"
            data-label={ADD_CATEGORY_CREATE}
            onClick={onCreate}
          >
            {ADD_CATEGORY_CREATE}
          </button>
        </div>
      </div>
    </div>
  );
}
