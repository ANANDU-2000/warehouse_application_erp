import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { readPrimaryBusiness } from "../../shared/auth/sessionStore";
import { apiGet, apiPatch } from "../../shared/api/apiClient";
import "./CatalogItemEditPage.css";

type CatalogItem = {
  id: string;
  name: string;
  item_code: string | null;
  barcode: string | null;
  category_name: string | null;
  subcategory_name: string | null;
  unit: string;
  reorder_level: number;
  selling_price: number | null;
  tax_percent: number | null;
  hsn_code: string | null;
};

export function CatalogItemEditPage() {
  const navigate = useNavigate();
  const { itemId } = useParams<{ itemId: string }>();
  const session = readPrimaryBusiness();
  const biz = session?.id ?? "";
  const [item, setItem] = useState<CatalogItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [itemCode, setItemCode] = useState("");
  const [barcode, setBarcode] = useState("");
  const [reorderLevel, setReorderLevel] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [taxPercent, setTaxPercent] = useState("");
  const [hsnCode, setHsnCode] = useState("");

  useEffect(() => {
    if (!biz || !itemId) { setLoading(false); return; }
    apiGet<CatalogItem>(`/v1/businesses/${biz}/catalog-items/${itemId}`)
      .then((data) => {
        setItem(data);
        setName(data.name);
        setItemCode(data.item_code ?? "");
        setBarcode(data.barcode ?? "");
        setReorderLevel(String(data.reorder_level ?? ""));
        setSellingPrice(String(data.selling_price ?? ""));
        setTaxPercent(String(data.tax_percent ?? ""));
        setHsnCode(data.hsn_code ?? "");
        setLoading(false);
      })
      .catch(() => { setLoading(false); });
  }, [biz, itemId]);

  async function handleSave() {
    if (!biz || !itemId) return;
    setSaving(true);
    try {
      await apiPatch(`/v1/businesses/${biz}/catalog-items/${itemId}`, {
        name,
        item_code: itemCode || null,
        barcode: barcode || null,
        reorder_level: parseFloat(reorderLevel) || 0,
        selling_price: sellingPrice ? parseFloat(sellingPrice) : null,
        tax_percent: taxPercent ? parseFloat(taxPercent) : null,
        hsn_code: hsnCode || null,
      });
      navigate(-1);
    } catch {
      alert("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="cie-page"><div className="cie-loading">Loading...</div></div>;
  if (!item) return <div className="cie-page"><div className="cie-loading">Item not found</div></div>;

  return (
    <div className="cie-page">
      <header className="cie-hdr">
        <button type="button" className="cie-back" onClick={() => navigate(-1)}>Cancel</button>
        <h1 className="cie-title">Edit Item</h1>
        <button type="button" className="cie-save" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
      </header>
      <div className="cie-body">
        <div className="cie-field"><label className="cie-label">Name</label><input className="cie-input" type="text" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="cie-field"><label className="cie-label">Item Code</label><input className="cie-input" type="text" value={itemCode} onChange={(e) => setItemCode(e.target.value)} placeholder="Optional" /></div>
        <div className="cie-field"><label className="cie-label">Barcode</label><input className="cie-input" type="text" value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="Optional" /></div>
        <div className="cie-field"><label className="cie-label">Reorder Level ({item.unit})</label><input className="cie-input" type="number" value={reorderLevel} onChange={(e) => setReorderLevel(e.target.value)} min="0" step="0.01" /></div>
        <div className="cie-field"><label className="cie-label">Selling Price (per {item.unit})</label><input className="cie-input" type="number" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} min="0" step="0.01" /></div>
        <div className="cie-field"><label className="cie-label">Tax %</label><input className="cie-input" type="number" value={taxPercent} onChange={(e) => setTaxPercent(e.target.value)} min="0" max="100" step="0.01" /></div>
        <div className="cie-field"><label className="cie-label">HSN Code</label><input className="cie-input" type="text" value={hsnCode} onChange={(e) => setHsnCode(e.target.value)} placeholder="Optional" /></div>
      </div>
    </div>
  );
}
