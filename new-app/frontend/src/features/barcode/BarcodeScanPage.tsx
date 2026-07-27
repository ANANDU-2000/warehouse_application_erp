import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./BarcodeScanPage.css";

export function BarcodeScanPage() {
  const navigate = useNavigate();
  const [scanResult, setScanResult] = useState("");
  const [manualCode, setManualCode] = useState("");

  function handleManualSubmit() {
    if (manualCode.trim()) {
      setScanResult(manualCode.trim());
    }
  }

  return (
    <div className="barcode-page">
      <header className="barcode-page__header">
        <button type="button" className="barcode-page__back" onClick={() => navigate(-1)}>←</button>
        <h1 className="barcode-page__title">Scan Barcode</h1>
      </header>

      <main className="barcode-page__body">
        <div className="barcode-page__scanner">
          <div className="barcode-page__scanner-frame">
            <div className="barcode-page__scanner-corner barcode-page__scanner-corner--tl" />
            <div className="barcode-page__scanner-corner barcode-page__scanner-corner--tr" />
            <div className="barcode-page__scanner-corner barcode-page__scanner-corner--bl" />
            <div className="barcode-page__scanner-corner barcode-page__scanner-corner--br" />
            <div className="barcode-page__scanner-line" />
            <svg width="64" height="64" viewBox="0 0 24 24" fill="#0E7C6B" opacity="0.3">
              <path d="M4 7V4h3M17 4h3v3M20 17v3h-3M7 20H4v-3" />
              <rect x="7" y="7" width="10" height="10" rx="1" />
            </svg>
            <p className="barcode-page__scanner-text">Camera not available</p>
            <p className="barcode-page__scanner-hint">Use manual entry below</p>
          </div>
        </div>

        <div className="barcode-page__manual">
          <h3>Manual Entry</h3>
          <div className="barcode-page__input-row">
            <input
              type="text"
              placeholder="Enter barcode or item code"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className="barcode-page__input"
              onKeyDown={(e) => e.key === "Enter" && handleManualSubmit()}
            />
            <button
              type="button"
              className="barcode-page__submit"
              onClick={handleManualSubmit}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
                <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
            </button>
          </div>
        </div>

        {scanResult && (
          <div className="barcode-page__result">
            <h3>Scan Result</h3>
            <div className="barcode-page__result-card">
              <div className="barcode-page__result-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="#0E7C6B">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              </div>
              <div className="barcode-page__result-info">
                <span className="barcode-page__result-code">{scanResult}</span>
                <span className="barcode-page__result-hint">Looking up item...</span>
              </div>
            </div>
          </div>
        )}

        <div className="barcode-page__actions">
          <button type="button" className="barcode-page__action-btn" onClick={() => navigate("/barcode/bulk-print")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#6B7280">
              <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z" />
            </svg>
            Print Labels
          </button>
          <button type="button" className="barcode-page__action-btn" onClick={() => navigate("/stock")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#6B7280">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H4V4h16v16z" />
            </svg>
            View Stock
          </button>
        </div>
      </main>
    </div>
  );
}
