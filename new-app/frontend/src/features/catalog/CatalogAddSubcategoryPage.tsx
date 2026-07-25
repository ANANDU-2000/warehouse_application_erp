/**
 * Catalog new subcategory `/catalog/category/:categoryId/new-subcategory` —
 * BUTTONS (Step 4).
 * Formula source: catalog_add_subcategory_page.dart
 * Close/Cancel → pop(false); Create → touch empty validation only.
 * Forbidden: POST create / similar dialog (WIRE).
 */
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { readPrimaryBusiness } from "../../shared/auth/sessionStore";
import {
  ADD_SUBCATEGORY_BACK_FALLBACK_OWNER,
  ADD_SUBCATEGORY_BACK_FALLBACK_STAFF,
  ADD_SUBCATEGORY_CANCEL,
  ADD_SUBCATEGORY_CREATE,
  ADD_SUBCATEGORY_NAME_HINT,
  ADD_SUBCATEGORY_NAME_LABEL,
  ADD_SUBCATEGORY_TITLE,
  ADD_SUBCATEGORY_TOOLTIP_CLOSE,
} from "./catalogAddSubcategoryCopy";
import {
  addSubcategoryNameError,
  addSubcategoryNameIsEmpty,
} from "./catalogAddSubcategoryFields";
import "./CatalogAddSubcategoryPage.css";

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

export function CatalogAddSubcategoryPage() {
  const navigate = useNavigate();
  const { categoryId = "" } = useParams<{ categoryId: string }>();
  const session = readPrimaryBusiness();
  const role = (session?.role ?? "").toLowerCase();
  const isStaff = role === "staff";
  const backFallback = isStaff
    ? ADD_SUBCATEGORY_BACK_FALLBACK_STAFF
    : ADD_SUBCATEGORY_BACK_FALLBACK_OWNER;

  const [name, setName] = useState("");
  const [touched, setTouched] = useState(false);
  const nameError = addSubcategoryNameError({ touched, name });
  const showError = nameError != null;

  const onClose = () => popOrGo(navigate, backFallback);
  const onCancel = () => popOrGo(navigate, backFallback);
  /** Flutter `_create`: empty → set touched; non-empty → API (WIRE). */
  const onCreate = () => {
    if (addSubcategoryNameIsEmpty(name)) {
      setTouched(true);
      return;
    }
    /* Valid name — POST + similar dialog deferred to WIRE */
  };

  return (
    <div
      className="add-subcategory-page"
      data-page="catalog-new-subcategory"
      data-step="BUTTONS"
      data-category-id={categoryId}
    >
      <header className="add-subcategory-page__appbar" data-slot="appBar">
        <button
          type="button"
          className="add-subcategory-page__icon-btn add-subcategory-page__icon-btn--active"
          data-action="close"
          title={ADD_SUBCATEGORY_TOOLTIP_CLOSE}
          aria-label={ADD_SUBCATEGORY_TOOLTIP_CLOSE}
          onClick={onClose}
        >
          ×
        </button>
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
          <button
            type="button"
            className="add-subcategory-page__btn add-subcategory-page__btn--cancel add-subcategory-page__btn--active"
            data-action="cancel"
            data-label={ADD_SUBCATEGORY_CANCEL}
            onClick={onCancel}
          >
            {ADD_SUBCATEGORY_CANCEL}
          </button>
          <button
            type="button"
            className="add-subcategory-page__btn add-subcategory-page__btn--create add-subcategory-page__btn--active"
            data-action="create"
            data-label={ADD_SUBCATEGORY_CREATE}
            onClick={onCreate}
          >
            {ADD_SUBCATEGORY_CREATE}
          </button>
        </div>
      </div>
    </div>
  );
}
