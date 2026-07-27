import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { readPrimaryBusiness } from "../../shared/auth/sessionStore";
import { apiGet } from "../../shared/api/apiClient";
import "./CatalogCategoryDetailPage.css";

type CategoryType = { id: string; name: string };
type Category = {
  id: string;
  name: string;
  description: string | null;
  item_count?: number;
  types?: CategoryType[];
};

export function CatalogCategoryDetailPage() {
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId: string }>();
  const session = readPrimaryBusiness();
  const biz = session?.id ?? "";
  const [cat, setCat] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!biz || !categoryId) { setLoading(false); return; }
    apiGet<Category>(`/v1/businesses/${biz}/item-categories/${categoryId}`)
      .then((data) => { setCat(data); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, [biz, categoryId]);

  if (loading) return <div className="ccd-page"><div className="ccd-loading">Loading...</div></div>;
  if (!cat) return <div className="ccd-page"><div className="ccd-loading">Not found</div></div>;

  return (
    <div className="ccd-page">
      <header className="ccd-hdr">
        <button type="button" className="ccd-back" onClick={() => navigate(-1)}>←</button>
        <h1 className="ccd-title">{cat.name}</h1>
      </header>
      <div className="ccd-body">
        {cat.description && <p className="ccd-desc">{cat.description}</p>}
        {cat.item_count != null && <p className="ccd-count">{cat.item_count} items</p>}
        {cat.types && cat.types.length > 0 && (
          <div className="ccd-card">
            <h3 className="ccd-section-title">Subcategories</h3>
            <div className="ccd-type-list">
              {cat.types.map((t) => (
                <div key={t.id} className="ccd-type-item">{t.name}</div>
              ))}
            </div>
          </div>
        )}
        <button type="button" className="ccd-btn" onClick={() => navigate(`/catalog/category/${categoryId}/new-subcategory`)}>Add Subcategory</button>
      </div>
    </div>
  );
}
