import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore.js";
import ProtectedRoute from "./ProtectedRoute.jsx";
import AppLayout from "../components/layout/AppLayout.jsx";
import LoginPage from "../pages/auth/LoginPage.jsx";
import SignupPage from "../pages/auth/SignupPage.jsx";
import ExplorePage from "../pages/sessions/ExplorePage.jsx";
import ProfilePage from "../pages/user/ProfilePage.jsx";
import { Calendar, Users } from "lucide-react";

/**
 * Vue temporaire pour les seances de l'hote en attendant l'Etape 6.
 */
function MySessionsPlaceholder() {
  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 text-center space-y-3 max-w-xl mx-auto shadow-sm">
      <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
        <Calendar className="w-6 h-6" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 tracking-tight">
        Mes Séances Organisées
      </h2>
      <p className="text-xs text-slate-500">
        Cet espace permettra de gérer vos séances créées et les candidatures reçues.
      </p>
    </div>
  );
}

/**
 * Vue temporaire pour les participations du sportif en attendant l'Etape 6.
 */
function MyParticipationsPlaceholder() {
  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 text-center space-y-3 max-w-xl mx-auto shadow-sm">
      <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
        <Users className="w-6 h-6" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 tracking-tight">
        Mes Candidatures
      </h2>
      <p className="text-xs text-slate-500">
        Cet espace permettra de suivre vos demandes de participation et leur statut.
      </p>
    </div>
  );
}

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
          <Route path="/my-sessions" element={<MySessionsPlaceholder />} />
          <Route path="/my-participations" element={<MyParticipationsPlaceholder />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Redirection par defaut */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
