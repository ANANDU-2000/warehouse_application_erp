import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { readPrimaryBusiness } from "../../shared/auth/sessionStore";
import "./SearchPage.css";

export function SearchPage() {
  const navigate = useNavigate();
  const session = readPrimaryBusiness();
  const businessId = session?.id ?? "";

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Array<{ type: string; id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);

  async function doSearch(q: string) {
    if (!q.trim() || !businessId) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("hexa_access_token_bk") ?? localStorage.getItem("access_token") ?? "";
      const res = await fetch(`/v1/businesses/${businessId}/search?q=${encodeURIComponent(q)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setResults(Array.isArray(data) ? data : data.results ?? []);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="search-page">
      <header className="search-page__header">
        <button type="button" className="search-page__back" onClick={() => navigate("/home")}>←</button>
        <div className="search-page__search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#9CA3AF">
            <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
          <input
            type="search"
            placeholder="Search items, purchases, contacts..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              doSearch(e.target.value);
            }}
            className="search-page__input"
            autoFocus
          />
          {query && (
            <button type="button" className="search-page__clear" onClick={() => { setQuery(""); setResults([]); }}>
              ×
            </button>
          )}
        </div>
      </header>

      <main className="search-page__body">
        {loading && (
          <div className="search-page__loading">Searching...</div>
        )}

        {!loading && query && results.length === 0 && (
          <div className="search-page__empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="#D1D5DB">
              <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
            <p>No results for "{query}"</p>
          </div>
        )}

        {!loading && !query && (
          <div className="search-page__suggestions">
            <h3>Quick Search</h3>
            <div className="search-page__chips">
              <button type="button" className="search-page__chip" onClick={() => { setQuery("stock"); doSearch("stock"); }}>Stock Items</button>
              <button type="button" className="search-page__chip" onClick={() => { setQuery("purchase"); doSearch("purchase"); }}>Purchases</button>
              <button type="button" className="search-page__chip" onClick={() => { setQuery("supplier"); doSearch("supplier"); }}>Suppliers</button>
              <button type="button" className="search-page__chip" onClick={() => { setQuery("broker"); doSearch("broker"); }}>Brokers</button>
            </div>
          </div>
        )}

        {results.map((r) => (
          <button
            key={`${r.type}-${r.id}`}
            type="button"
            className="search-page__result"
            onClick={() => {
              if (r.type === "item") navigate(`/catalog/item/${r.id}`);
              else if (r.type === "purchase") navigate(`/purchase/${r.id}`);
              else if (r.type === "supplier") navigate(`/contacts/${r.id}`);
            }}
          >
            <div className="search-page__result-icon">
              {r.type === "item" ? "📦" : r.type === "purchase" ? "🧾" : "👤"}
            </div>
            <div className="search-page__result-info">
              <span className="search-page__result-name">{r.name}</span>
              <span className="search-page__result-type">{r.type}</span>
            </div>
            <span className="search-page__result-arrow">›</span>
          </button>
        ))}
      </main>
    </div>
  );
}
