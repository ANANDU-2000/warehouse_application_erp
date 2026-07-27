import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { readPrimaryBusiness } from "../../shared/auth/sessionStore";
import { apiGet, apiPost } from "../../shared/api/apiClient";
import "./CatalogItemDetailPage.css";

type CatalogItem = {
  id: string;
  name: string;
  item_code: string | null;
  barcode: string | null;
  category_name: string | null;
  subcategory_name: string | null;
  unit: string;
  current_stock: number;
  reorder_level: number;
  selling_price: number | null;
  tax_percent: number | null;
  hsn_code: string | null;
  created_at: string;
};

export function CatalogItemDetailPage() {
  const navigate = useNavigate();
  const { itemId } = useParams<{ itemId: string }>();
  const session = readPrimaryBusiness();
  const biz = session?.id ?? "";
  const [item, setItem] = useState<CatalogItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!biz || !itemId) { setLoading(false); return; }
    setLoading(true);
    apiGet<CatalogItem>(`/v1/businesses/${biz}/catalog-items/${itemId}`)
      .then((data) => { setItem(data); setLoading(false); setError(null); })
      .catch((e) => { setError(e instanceof Error ? e.message : "Load failed"); setLoading(false); });
  }, [biz, itemId]);

  if (loading) return <div className="cid-page"><div className="cid-loading">Loading...</div></div>;
  if (error) return <div className="cid-page"><div className="cid-error">{error} <button onClick={() => navigate(-1)}>Go back</button></div></div>;
  if (!item) return <div className="cid-page"><div className="cid-error">Item not found</div></div>;

  return (
    <div className="cid-page">
      <header className="cid-hdr">
        <button type="button" className="cid-back" onClick={() => navigate(-1)}>←</button>
        <h1 className="cid-title">{item.name}</h1>
        <button type="button" className="cid-edit" onClick={() => navigate(`/catalog/item/${itemId}/edit`)}>Edit</button>
      </header>

      <div className="cid-body">
        <div className="cid-card">
          <div className="cid-card-row"><span className="cid-lbl">Category</span><span className="cid-val">{item.category_name ?? "—"}</span></div>
          <div className="cid-card-row"><span className="cid-lbl">Subcategory</span><span className="cid-val">{item.subcategory_name ?? "—"}</span></div>
          <div className="cid-card-row"><span className="cid-lbl">Unit</span><span className="cid-val">{item.unit}</span></div>
          <div className="cid-card-row"><span className="cid-lbl">Item Code</span><span className="cid-val">{item.item_code ?? "—"}</span></div>
          <div className="cid-card-row"><span className="cid-lbl">Barcode</span><span className="cid-val">{item.barcode ?? "—"}</span></div>
          <div className="cid-card-row"><span className="cid-lbl">HSN</span><span className="cid-val">{item.hsn_code ?? "—"}</span></div>
        </div>

        <div className="cid-card">
          <h3 className="cid-section-title">Stock</h3>
          <div className="cid-stock-grid">
            <div className="cid-stock-cell"><span className="cid-stock-val">{item.current_stock}</span><span className="cid-stock-lbl">Current</span></div>
            <div className="cid-stock-cell"><span className="cid-stock-val">{item.reorder_level}</span><span className="cid-stock-lbl">Reorder</span></div>
          </div>
        </div>

        <div className="cid-card">
          <h3 className="cid-section-title">Pricing</h3>
          <div className="cid-card-row"><span className="cid-lbl">Selling Price</span><span className="cid-val">{item.selling_price != null ? `₹${item.selling_price}` : "—"}</span></div>
          <div className="cid-card-row"><span className="cid-lbl">Tax</span><span className="cid-val">{item.tax_percent != null ? `${item.tax_percent}%` : "—"}</span></div>
        </div>

        <div className="cid-actions">
          <button type="button" className="cid-btn cid-btn--pri" onClick={() => navigate(`/stock?highlight=${itemId}`)}>View in Stock</button>
          <button type="button" className="cid-btn cid-btn--sec" onClick={() => navigate(`/purchase/new?catalogItemId=${itemId}`)}>Create Purchase</button>
        </div>
      </div>
    </div>
  );
}
