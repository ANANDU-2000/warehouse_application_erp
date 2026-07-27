const _exportInFlight = new Set<string>();

export type PdfActionResult = { ok: boolean; message: string };

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("hexa_access_token_bk") ?? localStorage.getItem("access_token") ?? "";
  return { Authorization: `Bearer ${token}` };
}

function filenameFromHeaders(headers: Headers, fallback: string): string {
  const disp = headers.get("Content-Disposition");
  if (disp) {
    const match = disp.match(/filename\*?=(?:UTF-8'')?["']?(.+?)["']?(?:;|$)/i);
    if (match) return match[1].trim();
  }
  return fallback;
}

async function runGuarded<T>(key: string, action: () => Promise<T>): Promise<T> {
  if (_exportInFlight.has(key)) {
    throw new Error("Export already in progress for this purchase.");
  }
  _exportInFlight.add(key);
  try {
    return await action();
  } finally {
    _exportInFlight.delete(key);
  }
}

export async function buildPurchasePdfBlob(
  businessId: string,
  purchaseId: string,
): Promise<{ blob: Blob; filename: string }> {
  const res = await fetch(
    `/v1/businesses/${businessId}/trade-purchases/${purchaseId}/pdf`,
    { headers: authHeaders() },
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as Record<string, unknown>).error as string ?? "Failed to generate PDF");
  }
  const blob = await res.blob();
  const filename = filenameFromHeaders(res.headers, `purchase-${purchaseId}.pdf`);
  return { blob, filename };
}

export async function downloadPurchasePdf(
  businessId: string,
  purchaseId: string,
): Promise<PdfActionResult> {
  return runGuarded(`${businessId}_${purchaseId}`, async () => {
    const { blob, filename } = await buildPurchasePdfBlob(businessId, purchaseId);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return { ok: true, message: "PDF downloaded" };
  }).catch((e: unknown) => ({
    ok: false,
    message: e instanceof Error ? e.message : "Download failed",
  }));
}

export async function sharePurchasePdf(
  businessId: string,
  purchaseId: string,
): Promise<PdfActionResult> {
  return runGuarded(`${businessId}_${purchaseId}`, async () => {
    const { blob, filename } = await buildPurchasePdfBlob(businessId, purchaseId);
    const file = new File([blob], filename, { type: "application/pdf" });
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: `Purchase - ${purchaseId}`,
      });
      return { ok: true, message: "PDF shared" };
    }
    // Fallback: download with note
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    return {
      ok: true,
      message: "Downloaded — attach this file to share it",
    };
  }).catch((e: unknown) => ({
    ok: false,
    message: e instanceof Error ? e.message : "Share failed",
  }));
}

export async function printPurchasePdf(
  businessId: string,
  purchaseId: string,
): Promise<PdfActionResult> {
  return runGuarded(`${businessId}_${purchaseId}`, async () => {
    const { blob } = await buildPurchasePdfBlob(businessId, purchaseId);
    const url = URL.createObjectURL(blob);
    const win = window.open(url);
    if (!win) {
      URL.revokeObjectURL(url);
      return { ok: false, message: "Popup blocked. Enable popups to print." };
    }
    win.onload = () => {
      win.print();
    };
    return { ok: true, message: "Print dialog opened" };
  }).catch((e: unknown) => ({
    ok: false,
    message: e instanceof Error ? e.message : "Print failed",
  }));
}

export function emailPurchasePdf(
  purchaseId: string,
  supplierName: string,
): void {
  const subject = encodeURIComponent(`${supplierName || "Purchase"} - ${purchaseId}`);
  const body = encodeURIComponent(
    `Purchase ${purchaseId} from ${supplierName}\n\nPlease download the PDF from your account and attach it to this email.`,
  );
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
}
