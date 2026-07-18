import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "../features/auth/LoginPage";
import { ForgotPasswordStubPage } from "../features/auth/ForgotPasswordStubPage";

/**
 * Auth routes: /login (BUTTONS) + /forgot-password stub.
 * Splash later. Source: docs/05_Navigation_Map.md
 */
export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordStubPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
