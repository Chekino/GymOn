import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore.js";
import ProtectedRoute from "./ProtectedRoute.jsx";
import LoginPage from "../pages/auth/LoginPage.jsx";
import SignupPage from "../pages/auth/SignupPage.jsx";
import { Dumbbell, LogOut, Sparkles, User, Award } from "lucide-react";
import { toast } from "sonner";
import { logout as apiLogout } from "../api/auth.api.js";

/**
 * Vue temporaire du tableau de bord protege en attendant la page d'exploration (Etape 4).
 * Permet de verifier la persistance de l'utilisateur connecte et la deconnexion.
 */
function DashboardPlaceholder() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch {
      // Ignorer si le token etait deja revoque
    } finally {
      logout();
      toast.success("Déconnexion réussie", {
        description: "À bientôt pour votre prochaine séance !",
      });
    }
  };

  return (
    <main className="min-h-[100dvh] flex flex-col items-center justify-center p-6 bg-slate-50 text-slate-900">
      <div className="max-w-md w-full bg-white border border-slate-200/80 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Dumbbell className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                GymOn
              </h1>
              <span className="text-xs text-slate-500 font-medium">
                Espace Membre Authentifié
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title="Se déconnecter"
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50/50 transition-all active:scale-[0.96] select-none"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 space-y-3">
            <div className="flex items-center gap-2 text-slate-700">
              <User className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold">
                Sportif : {user?.firstName || "Utilisateur"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 text-xs">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Niveau : {user?.level || "BEGINNER"}</span>
            </div>
            {user?.sports && user.sports.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {user.sports.map((sport) => (
                  <span
                    key={sport}
                    className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200/50"
                  >
                    {sport}
                  </span>
                ))}
              </div>
            )}
            {user?.bio && (
              <p className="text-xs text-slate-500 italic pt-1 border-t border-slate-200/50">
                « {user.bio} »
              </p>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 flex items-start gap-3 text-xs text-sky-800">
            <Sparkles className="w-4 h-4 text-sky-600 mt-0.5 shrink-0" />
            <span>
              Authentification opérationnelle ! La prochaine étape construira la
              navigation principale et la gestion complète du profil.
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}

/**
 * Arbre de navigation declaratif de l'application GymOn.
 */
export default function AppRoutes() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Routes>
      {/* Routes Publiques : redirigent vers l'accueil si deja connecte */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/signup"
        element={isAuthenticated ? <Navigate to="/" replace /> : <SignupPage />}
      />

      {/* Routes Protegees : accessibles uniquement si connecte */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<DashboardPlaceholder />} />
      </Route>

      {/* Redirection des routes inconnues */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
