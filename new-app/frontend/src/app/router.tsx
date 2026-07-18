import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "../features/auth/LoginPage";
import { ForgotPasswordStubPage } from "../features/auth/ForgotPasswordStubPage";
import { SplashPage } from "../features/splash/SplashPage";
import { HomePage } from "../features/home/HomePage";
import { DashboardRouteStubPage } from "../features/home/DashboardRouteStubPage";
import { StaffHomePage } from "../features/staff/StaffHomePage";

/**
 * Splash + Login + owner /home + staff /staff/home + stub destinations.
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
        <Route
          path="/home/activity"
          element={<DashboardRouteStubPage title="Warehouse activity" />}
        />
        <Route path="/staff/home" element={<StaffHomePage />} />
        <Route
          path="/staff/settings"
          element={<DashboardRouteStubPage title="Staff settings" />}
        />
        <Route
          path="/staff/search"
          element={<DashboardRouteStubPage title="Staff search" />}
        />
        <Route
          path="/staff/items"
          element={<DashboardRouteStubPage title="Staff gallery" />}
        />
        <Route
          path="/staff/stock"
          element={<DashboardRouteStubPage title="Staff stock" />}
        />
        <Route
          path="/staff/purchase-history"
          element={<DashboardRouteStubPage title="Purchase history" />}
        />
        <Route
          path="/staff/low-stock"
          element={<DashboardRouteStubPage title="Staff low stock" />}
        />
        <Route
          path="/staff/activity"
          element={<DashboardRouteStubPage title="Staff activity" />}
        />
        <Route
          path="/staff/deliveries"
          element={<DashboardRouteStubPage title="Staff deliveries" />}
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
        <Route
          path="/notifications"
          element={<DashboardRouteStubPage title="Notifications" />}
        />
        <Route
          path="/settings"
          element={<DashboardRouteStubPage title="Settings" />}
        />
        <Route
          path="/settings/users"
          element={<DashboardRouteStubPage title="Users" />}
        />
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
        <Route path="/" element={<Navigate to="/splash" replace />} />
        <Route path="*" element={<Navigate to="/splash" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
