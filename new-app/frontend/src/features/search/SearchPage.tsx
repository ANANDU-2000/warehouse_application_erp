/**
 * Owner search `/search` — STAGE 1 SCAFFOLD: route + empty page shell/layout.
 * Source: search_page.dart embeddedInShell chrome; section chips; recents; quick filters.
 * Embedded in OwnerShell — no AppBar/back button (bottom tab bar provides nav).
 * Deferred: search field, section chips, recents, quick filters, results, API wire.
 */
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { readPrimaryBusiness } from "../../shared/auth/sessionStore";
import {
  SEARCH_BACK_FALLBACK,
  SEARCH_HINT,
  SEARCH_TITLE,
} from "./searchCopy";
import { searchSectionFromQuery, type SearchSection } from "./searchSections";
import "./SearchPage.css";

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const session = readPrimaryBusiness();
  const businessId = session?.id ?? "";

  const [section, setSection] = useState<SearchSection>(() =>
    searchSectionFromQuery(searchParams.get("section")),
  );

  return (
    <div
      className="owner-search-page"
      data-page="owner-search"
      data-business-id={businessId || undefined}
      data-section={section}
    >
      <div className="owner-search-page__body" data-slot="body">
        {/* Search field placeholder */}
        <div
          className="owner-search-page__search"
          data-slot="search"
        >
          <div className="owner-search-page__search-placeholder" />
        </div>

        {/* Section chips placeholder */}
        <div
          className="owner-search-page__sections"
          data-slot="sections"
          role="tablist"
          aria-label="Search sections"
        />

        {/* Results area placeholder */}
        <section
          className="owner-search-page__results"
          data-slot="results"
          aria-label="Search results"
        >
          <div
            className="owner-search-scaffold-placeholder"
            data-slot="scaffold"
          >
            STAGE 1 — layout shell rendered. Next stages add content.
          </div>
        </section>
      </div>
    </div>
  );
}
