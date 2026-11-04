import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore.js";
import ProtectedRoute from "./ProtectedRoute.jsx";
import AppLayout from "../components/layout/AppLayout.jsx";
import PageTransition from "../components/common/PageTransition.jsx";
import LoginPage from "../pages/auth/LoginPage.jsx";
import SignupPage from "../pages/auth/SignupPage.jsx";
import ExplorePage from "../pages/sessions/ExplorePage.jsx";
import CreateSessionPage from "../pages/sessions/CreateSessionPage.jsx";
import SessionDetailPage from "../pages/sessions/SessionDetailPage.jsx";
import ProfilePage from "../pages/user/ProfilePage.jsx";
import MySessionsPage from "../pages/user/MySessionsPage.jsx";
import MyParticipationsPage from "../pages/user/MyParticipationsPage.jsx";
import NotFoundPage from "../pages/common/NotFoundPage.jsx";

/**
 * Table de navigation principale avec gestion des layouts imbriques.
 * Chaque page protegee est enveloppee dans une micro-transition physique.
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

      {/* Layout principal contenant les pages publiques et protegees */}
      <Route element={<AppLayout />}>
        {/* Pages publiques accessibles a tous les visiteurs */}
        <Route
          path="/"
          element={
            <PageTransition>
              <ExplorePage />
            </PageTransition>
          }
        />
        <Route
          path="/sessions/:id"
          element={
            <PageTransition>
              <SessionDetailPage />
            </PageTransition>
          }
        />

        {/* Pages protegees necessitant d'etre connecte */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/sessions/new"
            element={
              <PageTransition>
                <CreateSessionPage />
              </PageTransition>
            }
          />
          <Route
            path="/my-sessions"
            element={
              <PageTransition>
                <MySessionsPage />
              </PageTransition>
            }
          />
          <Route
            path="/my-participations"
            element={
              <PageTransition>
                <MyParticipationsPage />
              </PageTransition>
            }
          />
          <Route
            path="/profile"
            element={
              <PageTransition>
                <ProfilePage />
              </PageTransition>
            }
          />
        </Route>
      </Route>

      {/* Page 404 pour toute route inconnue */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
