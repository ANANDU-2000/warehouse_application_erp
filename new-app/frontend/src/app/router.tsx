import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "../features/auth/LoginPage";
import { ForgotPasswordStubPage } from "../features/auth/ForgotPasswordStubPage";
import { SplashPage } from "../features/splash/SplashPage";
import { HomePage } from "../features/home/HomePage";
import { DashboardRouteStubPage } from "../features/home/DashboardRouteStubPage";
import { StaffHomePage } from "../features/staff/StaffHomePage";

/**
 * Splash + Login + owner /home + staff /staff/home SCAFFOLD + stub destinations.
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
