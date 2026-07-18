import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "../features/auth/LoginPage";
import { ForgotPasswordStubPage } from "../features/auth/ForgotPasswordStubPage";
import {
  HomeStubPage,
  StaffHomeStubPage,
} from "../features/auth/PostAuthStub";
import { SplashPage } from "../features/splash/SplashPage";

/**
 * Splash SCAFFOLD entry + Login + stubs.
 * Source: docs/05_Navigation_Map.md; splash_page.dart
 */
export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/splash" element={<SplashPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordStubPage />} />
        <Route path="/home" element={<HomeStubPage />} />
        <Route path="/staff/home" element={<StaffHomeStubPage />} />
        <Route path="/" element={<Navigate to="/splash" replace />} />
        <Route path="*" element={<Navigate to="/splash" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
