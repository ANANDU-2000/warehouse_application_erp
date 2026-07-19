import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "../features/auth/LoginPage";
import { ForgotPasswordStubPage } from "../features/auth/ForgotPasswordStubPage";
import { SplashPage } from "../features/splash/SplashPage";
import { HomePage } from "../features/home/HomePage";
import { HomeWarehouseActivityPage } from "../features/home/HomeWarehouseActivityPage";
import { HomeBreakdownListPage } from "../features/home/HomeBreakdownListPage";
import { DashboardRouteStubPage } from "../features/home/DashboardRouteStubPage";
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

/**
 * Splash + Login + owner /home + activity + breakdown-more + staff /staff/home +
 * users + notifications + staff search + staff items + staff stock +
 * staff purchase-history + staff low-stock + staff activity COMPARE +
 * staff deliveries SCAFFOLD + stubs.
 * Source: docs/05_Navigation_Map.md; dashboard.md
 */
export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/splash" element={<SplashPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordStubPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/home/activity" element={<HomeWarehouseActivityPage />} />
        <Route
          path="/home/breakdown-more"
          element={<HomeBreakdownListPage />}
        />
        <Route path="/staff/home" element={<StaffHomePage />} />
        <Route
          path="/staff/settings"
          element={<DashboardRouteStubPage title="Staff settings" />}
        />
        <Route path="/staff/search" element={<StaffSearchPage />} />
        <Route path="/staff/items" element={<StaffItemGalleryPage />} />
        <Route path="/staff/stock" element={<StaffStockPage />} />
        <Route
          path="/staff/stock/changes"
          element={<Navigate to="/staff/stock?tab=changes" replace />}
        />
        <Route
          path="/staff/purchase-history"
          element={<StaffPurchaseHistoryPage />}
        />
        <Route
          path="/staff/purchase-history/:purchaseId"
          element={<DashboardRouteStubPage title="Purchase order detail" />}
        />
        <Route path="/staff/low-stock" element={<StaffLowStockPage />} />
        <Route path="/staff/activity" element={<StaffActivityPage />} />
        <Route path="/staff/deliveries" element={<StaffDeliveriesPage />} />
        <Route
          path="/staff/receive"
          element={<DashboardRouteStubPage title="Receive shipment" />}
        />
        <Route
          path="/staff/receive/:purchaseId"
          element={<DashboardRouteStubPage title="Receive shipment" />}
        />
        <Route
          path="/staff/scan"
          element={<DashboardRouteStubPage title="Staff scan" />}
        />
        <Route
          path="/catalog/taxonomy"
          element={<DashboardRouteStubPage title="Categories" />}
        />
        <Route
          path="/barcode/bulk-print"
          element={<DashboardRouteStubPage title="Bulk print labels" />}
        />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route
          path="/settings"
          element={<DashboardRouteStubPage title="Settings" />}
        />
        <Route path="/settings/users" element={<UserManagementPage />} />
        <Route path="/settings/users/:userId" element={<UserProfilePage />} />
        <Route
          path="/purchase"
          element={<DashboardRouteStubPage title="Purchases" />}
        />
        <Route
          path="/purchase/new"
          element={<DashboardRouteStubPage title="New purchase" />}
        />
        <Route
          path="/stock"
          element={<DashboardRouteStubPage title="Stock" />}
        />
        <Route
          path="/stock/low-stock"
          element={<DashboardRouteStubPage title="Low stock" />}
        />
        <Route
          path="/stock/reorder"
          element={<DashboardRouteStubPage title="Reorder" />}
        />
        <Route
          path="/stock/opening-setup"
          element={<DashboardRouteStubPage title="Opening stock setup" />}
        />
        <Route
          path="/stock/missing-barcodes"
          element={<DashboardRouteStubPage title="Missing barcodes" />}
        />
        <Route
          path="/reports"
          element={<DashboardRouteStubPage title="Reports" />}
        />
        <Route
          path="/barcode/scan"
          element={<DashboardRouteStubPage title="Barcode scan" />}
        />
        <Route
          path="/catalog/item/:itemId"
          element={<DashboardRouteStubPage title="Catalog item" />}
        />
        <Route
          path="/catalog/item/:itemId/edit"
          element={<DashboardRouteStubPage title="Edit catalog item" />}
        />
        <Route path="/" element={<Navigate to="/splash" replace />} />
        <Route path="*" element={<Navigate to="/splash" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
