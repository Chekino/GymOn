import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore.js";
import ProtectedRoute from "./ProtectedRoute.jsx";
import AppLayout from "../components/layout/AppLayout.jsx";
import LoginPage from "../pages/auth/LoginPage.jsx";
import SignupPage from "../pages/auth/SignupPage.jsx";
import ExplorePage from "../pages/sessions/ExplorePage.jsx";
import CreateSessionPage from "../pages/sessions/CreateSessionPage.jsx";
import SessionDetailPage from "../pages/sessions/SessionDetailPage.jsx";
import ProfilePage from "../pages/user/ProfilePage.jsx";
import MySessionsPage from "../pages/user/MySessionsPage.jsx";
import MyParticipationsPage from "../pages/user/MyParticipationsPage.jsx";

/**
 * Table de navigation principale avec gestion des layouts imbriques.
 */
export default function AppRoutes() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Routes>
      {/* Routes publiques */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/signup"
        element={isAuthenticated ? <Navigate to="/" replace /> : <SignupPage />}
      />

      {/* Routes membres protegees enveloppees dans le layout partage */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<ExplorePage />} />
          <Route path="/sessions/new" element={<CreateSessionPage />} />
          <Route path="/sessions/:id" element={<SessionDetailPage />} />
          <Route path="/my-sessions" element={<MySessionsPage />} />
          <Route path="/my-participations" element={<MyParticipationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Redirection par defaut */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
