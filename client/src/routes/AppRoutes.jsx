import React from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore.js";
import ProtectedRoute from "./ProtectedRoute.jsx";
import AppLayout from "../components/layout/AppLayout.jsx";
import LoginPage from "../pages/auth/LoginPage.jsx";
import SignupPage from "../pages/auth/SignupPage.jsx";
import ProfilePage from "../pages/user/ProfilePage.jsx";
import { Compass, Calendar, Users, PlusCircle } from "lucide-react";

/**
 * Vue temporaire pour l'exploration en attendant l'Etape 4 (TanStack Query + Seances).
 */
function ExplorePlaceholder() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
          Bienvenue {user?.firstName} 👋
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Trouvez votre binôme d'entraînement
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Le socle de navigation et la gestion de profil sont maintenant
          opérationnels. La prochaine étape connectera l'exploration dynamique des
          séances et les filtres par salle de sport.
        </p>

        <div className="pt-2 flex flex-wrap gap-3">
          <Link
            to="/profile"
            className="py-3 px-4 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white active:scale-[0.98] transition-all text-xs flex items-center gap-2 select-none shadow-sm shadow-blue-500/20"
          >
            <span>Compléter mon profil</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Vue temporaire pour les seances de l'hote en attendant l'Etape 6.
 */
function MySessionsPlaceholder() {
  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 text-center space-y-3 max-w-xl mx-auto">
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
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 text-center space-y-3 max-w-xl mx-auto">
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
          <Route path="/" element={<ExplorePlaceholder />} />
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
