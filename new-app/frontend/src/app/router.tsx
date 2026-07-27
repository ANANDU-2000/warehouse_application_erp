import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "../features/auth/LoginPage";
import { ForgotPasswordStubPage } from "../features/auth/ForgotPasswordStubPage";
import { SplashPage } from "../features/splash/SplashPage";
import { HomePage } from "../features/home/HomePage";
import { HomeWarehouseActivityPage } from "../features/home/HomeWarehouseActivityPage";
import { HomeBreakdownListPage } from "../features/home/HomeBreakdownListPage";
import { StaffHomePage } from "../features/staff/StaffHomePage";
import { UserManagementPage } from "../features/users/UserManagementPage";
import { UserProfilePage } from "../features/users/UserProfilePage";
import { NotificationsPage } from "../features/notifications/NotificationsPage";
import { StaffSearchPage } from "../features/staff/search/StaffSearchPage";
import { StaffItemGalleryPage } from "../features/staff/items/StaffItemGalleryPage";
import { StaffStockPage } from "../features/staff/stock/StaffStockPage";
import { StaffPurchaseHistoryPage } from "../features/staff/purchaseHistory/StaffPurchaseHistoryPage";
import { StaffLowStockPage } from "../features/staff/lowStock/StaffLowStockPage";
import { StaffActivityPage } from "../features/staff/activity/StaffActivityPage";
import { StaffDeliveriesPage } from "../features/staff/deliveries/StaffDeliveriesPage";
import { CatalogPage } from "../features/catalog/CatalogPage";
import { CatalogAddCategoryPage } from "../features/catalog/CatalogAddCategoryPage";
import { CatalogAddSubcategoryPage } from "../features/catalog/CatalogAddSubcategoryPage";
import { CatalogTaxonomyHubPage } from "../features/catalog/CatalogTaxonomyHubPage";
import { OwnerShell } from "../features/shell/OwnerShell";
import { PurchaseHomePage } from "../features/purchase/PurchaseHomePage";
import { PurchaseEntryPage } from "../features/purchase/PurchaseEntryPage";
import { PurchaseDetailPage } from "../features/purchase/PurchaseDetailPage";
import { StockPage } from "../features/stock/StockPage";
import { StockReorderPage } from "../features/stock/StockReorderPage";
import { StockOpeningSetupPage } from "../features/stock/StockOpeningSetupPage";
import { MissingBarcodesPage } from "../features/stock/MissingBarcodesPage";
import { SearchPage } from "../features/search/SearchPage";
import { SettingsPage } from "../features/settings/SettingsPage";
import { ReportsPage } from "../features/reports/ReportsPage";
import { ContactsPage } from "../features/contacts/ContactsPage";
import { BarcodeScanPage } from "../features/barcode/BarcodeScanPage";
import { BulkPrintLabelsPage } from "../features/barcode/BulkPrintLabelsPage";
import { CatalogItemDetailPage } from "../features/catalog/CatalogItemDetailPage";
import { CatalogItemEditPage } from "../features/catalog/CatalogItemEditPage";
import { CatalogCategoryDetailPage } from "../features/catalog/CatalogCategoryDetailPage";
import { StaffSettingsPage } from "../features/staff/StaffSettingsPage";
import { StaffScanPage } from "../features/staff/scan/StaffScanPage";
import { StaffReceivePage } from "../features/staff/receive/StaffReceivePage";
import { StaffPurchaseDetailPage } from "../features/staff/purchaseHistory/StaffPurchaseDetailPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/splash" element={<SplashPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordStubPage />} />

        <Route path="/home" element={<OwnerShell><HomePage /></OwnerShell>} />
        <Route path="/home/activity" element={<OwnerShell><HomeWarehouseActivityPage /></OwnerShell>} />
        <Route path="/home/breakdown-more" element={<OwnerShell><HomeBreakdownListPage /></OwnerShell>} />

        <Route path="/stock" element={<OwnerShell><StockPage /></OwnerShell>} />
        <Route path="/stock/low-stock" element={<OwnerShell><StockPage /></OwnerShell>} />
        <Route path="/stock/reorder" element={<OwnerShell><StockReorderPage /></OwnerShell>} />
        <Route path="/stock/opening-setup" element={<OwnerShell><StockOpeningSetupPage /></OwnerShell>} />
        <Route path="/stock/missing-barcodes" element={<OwnerShell><MissingBarcodesPage /></OwnerShell>} />

        <Route path="/reports" element={<OwnerShell><ReportsPage /></OwnerShell>} />

        <Route path="/purchase" element={<OwnerShell><PurchaseHomePage /></OwnerShell>} />
        <Route path="/purchase/new" element={<OwnerShell><PurchaseEntryPage /></OwnerShell>} />
        <Route path="/purchase/:purchaseId" element={<OwnerShell><PurchaseDetailPage /></OwnerShell>} />
        <Route path="/purchase/:purchaseId/edit" element={<OwnerShell><PurchaseEntryPage /></OwnerShell>} />

        <Route path="/search" element={<OwnerShell><SearchPage /></OwnerShell>} />

        <Route path="/settings" element={<OwnerShell><SettingsPage /></OwnerShell>} />
        <Route path="/settings/users" element={<OwnerShell><UserManagementPage /></OwnerShell>} />
        <Route path="/settings/users/:userId" element={<OwnerShell><UserProfilePage /></OwnerShell>} />

        <Route path="/notifications" element={<OwnerShell><NotificationsPage /></OwnerShell>} />

        <Route path="/catalog" element={<OwnerShell><CatalogPage /></OwnerShell>} />
        <Route path="/catalog/taxonomy" element={<OwnerShell><CatalogTaxonomyHubPage /></OwnerShell>} />
        <Route path="/catalog/new-category" element={<OwnerShell><CatalogAddCategoryPage /></OwnerShell>} />
        <Route path="/catalog/category/:categoryId" element={<OwnerShell><CatalogCategoryDetailPage /></OwnerShell>} />
        <Route path="/catalog/category/:categoryId/new-subcategory" element={<OwnerShell><CatalogAddSubcategoryPage /></OwnerShell>} />
        <Route path="/catalog/item/:itemId" element={<OwnerShell><CatalogItemDetailPage /></OwnerShell>} />
        <Route path="/catalog/item/:itemId/edit" element={<OwnerShell><CatalogItemEditPage /></OwnerShell>} />

        <Route path="/barcode/scan" element={<OwnerShell><BarcodeScanPage /></OwnerShell>} />
        <Route path="/barcode/bulk-print" element={<OwnerShell><BulkPrintLabelsPage /></OwnerShell>} />
        <Route path="/contacts" element={<OwnerShell><ContactsPage /></OwnerShell>} />

        <Route path="/staff/home" element={<StaffHomePage />} />
        <Route path="/staff/settings" element={<StaffSettingsPage />} />
        <Route path="/staff/search" element={<StaffSearchPage />} />
        <Route path="/staff/items" element={<StaffItemGalleryPage />} />
        <Route path="/staff/stock" element={<StaffStockPage />} />
        <Route path="/staff/stock/changes" element={<Navigate to="/staff/stock?tab=changes" replace />} />
        <Route path="/staff/purchase-history" element={<StaffPurchaseHistoryPage />} />
        <Route path="/staff/purchase-history/:purchaseId" element={<StaffPurchaseDetailPage />} />
        <Route path="/staff/low-stock" element={<StaffLowStockPage />} />
        <Route path="/staff/activity" element={<StaffActivityPage />} />
        <Route path="/staff/deliveries" element={<StaffDeliveriesPage />} />
        <Route path="/staff/receive" element={<StaffReceivePage />} />
        <Route path="/staff/receive/:purchaseId" element={<StaffReceivePage />} />
        <Route path="/staff/scan" element={<StaffScanPage />} />

        <Route path="/" element={<Navigate to="/splash" replace />} />
        <Route path="*" element={<Navigate to="/splash" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
