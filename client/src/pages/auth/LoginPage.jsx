import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dumbbell, ArrowRight, Loader2, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { login } from "../../api/auth.api.js";
import { useAuthStore } from "../../store/authStore.js";

/**
 * Page de connexion client (LoginPage).
 * Design epure blanc & bleu athletique, retours Sonner et validation native.
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await login({ email, password });
      setAuth({
        token: response.data.token,
        user: response.data.user,
      });

      toast.success("Connexion réussie", {
        description: `Ravi de vous revoir, ${response.data.user.firstName} !`,
      });

      navigate("/", { replace: true });
    } catch (error) {
      const message =
        error.response?.data?.error?.message ||
        "Identifiants invalides. Veuillez vérifier votre email et mot de passe.";
      toast.error("Erreur de connexion", {
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
          <Dumbbell className="w-7 h-7" />
        </div>
        <h2 className="mt-5 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          Connexion à GymOn
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Retrouvez vos partenaires et vos séances d'entraînement
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200/80 rounded-3xl sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
              >
                Adresse email
              </label>
              <div className="mt-1 relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="toi@gymon.com"
                  className="block w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
              >
                Mot de passe
              </label>
              <div className="mt-1 relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white transition-all duration-120 flex items-center justify-center gap-2 select-none shadow-sm shadow-blue-500/20 disabled:opacity-60 disabled:pointer-events-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Vérification...</span>
                </>
              ) : (
                <>
                  <span>Se connecter</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-600">
              Pas encore inscrit ?{" "}
              <Link
                to="/signup"
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Créer un compte
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
