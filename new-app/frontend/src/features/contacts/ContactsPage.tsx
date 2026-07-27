import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { readPrimaryBusiness } from "../../shared/auth/sessionStore";
import "./ContactsPage.css";

type Contact = {
  id: string;
  name: string;
  type: "supplier" | "broker";
  phone?: string;
  email?: string;
};

export function ContactsPage() {
  const navigate = useNavigate();
  const session = readPrimaryBusiness();
  const businessId = session?.id ?? "";

  const [tab, setTab] = useState<"suppliers" | "brokers">("suppliers");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!businessId) return;
    const token = localStorage.getItem("hexa_access_token_bk") ?? localStorage.getItem("access_token") ?? "";
    const endpoint = tab === "suppliers"
      ? `/v1/businesses/${businessId}/suppliers`
      : `/v1/businesses/${businessId}/brokers`;

    fetch(endpoint, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : [])
      .then((data) => {
        setContacts(
          (Array.isArray(data) ? data : []).map((c: Record<string, unknown>) => ({
            id: String(c.id ?? ""),
            name: String(c.name ?? c.display_name ?? ""),
            type: tab as "supplier" | "broker",
            phone: String(c.phone ?? ""),
            email: String(c.email ?? ""),
          })),
        );
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [businessId, tab]);

  return (
    <div className="contacts-page">
      <header className="contacts-page__header">
        <button type="button" className="contacts-page__back" onClick={() => navigate("/home")}>←</button>
        <h1 className="contacts-page__title">Contacts</h1>
      </header>

      <div className="contacts-page__tabs">
        <button
          type="button"
          className={`contacts-page__tab${tab === "suppliers" ? " contacts-page__tab--selected" : ""}`}
          onClick={() => { setTab("suppliers"); setLoading(true); }}
        >
          Suppliers
        </button>
        <button
          type="button"
          className={`contacts-page__tab${tab === "brokers" ? " contacts-page__tab--selected" : ""}`}
          onClick={() => { setTab("brokers"); setLoading(true); }}
        >
          Brokers
        </button>
      </div>

      <main className="contacts-page__list">
        {loading && (
          <div className="contacts-page__skeleton">
            {[1, 2, 3].map((i) => <div key={i} className="contacts-page__skeleton-row" />)}
          </div>
        )}

        {!loading && contacts.length === 0 && (
          <div className="contacts-page__empty">
            <p>No {tab} found</p>
          </div>
        )}

        {!loading && contacts.map((c) => (
          <div key={c.id} className="contacts-page__card">
            <div className="contacts-page__card-avatar">
              {c.name.charAt(0).toUpperCase()}
            </div>
            <div className="contacts-page__card-info">
              <p className="contacts-page__card-name">{c.name}</p>
              {c.phone && <p className="contacts-page__card-meta">{c.phone}</p>}
            </div>
            <span className="contacts-page__card-type">{c.type}</span>
          </div>
        ))}
      </main>
    </div>
  );
}
