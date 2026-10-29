import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dumbbell, ArrowRight, Loader2, User, Mail, Lock, Check } from "lucide-react";
import { toast } from "sonner";
import { signup, login } from "../../api/auth.api.js";
import { useAuthStore } from "../../store/authStore.js";

const AVAILABLE_SPORTS = [
  "Musculation",
  "Powerlifting",
  "Haltérophilie",
  "Cross-training",
  "Street Workout",
  "Cardio",
];

const LEVELS = [
  { value: "BEGINNER", label: "Débutant", desc: "< 1 an de pratique" },
  { value: "INTERMEDIATE", label: "Intermédiaire", desc: "1 à 3 ans" },
  { value: "ADVANCED", label: "Avancé", desc: "> 3 ans réguliers" },
];

/**
 * Page d'inscription client (SignupPage).
 * Formulaire moderne avec selecteur de niveau athletique et puces de sports.
 */
export default function SignupPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [level, setLevel] = useState("BEGINNER");
  const [sports, setSports] = useState(["Musculation"]);
  const [bio, setBio] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const toggleSport = (sport) => {
    if (sports.includes(sport)) {
      setSports(sports.filter((s) => s !== sport));
    } else {
      setSports([...sports, sport]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signup({
        firstName,
        email,
        password,
        level,
        sports,
        bio: bio.trim() || undefined,
      });

      // Connexion automatique suite a l'inscription pour fluidifier l'experience
      const loginRes = await login({ email, password });
      setAuth({
        token: loginRes.data.token,
        user: loginRes.data.user,
      });

      toast.success("Bienvenue sur GymOn !", {
        description: "Votre compte a été créé avec succès.",
      });

      navigate("/", { replace: true });
    } catch (error) {
      const message =
        error.response?.data?.error?.message ||
        "Impossible de créer votre compte. Veuillez vérifier les informations saisies.";
      toast.error("Erreur d'inscription", {
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
          <Dumbbell className="w-7 h-7" />
        </div>
        <h2 className="mt-5 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          Rejoignez GymOn
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Trouvez votre binôme d'entraînement et progressez ensemble
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200/80 rounded-3xl sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="firstName"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
              >
                Prénom
              </label>
              <div className="mt-1 relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Alexandre"
                  className="block w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="signup-email"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
              >
                Adresse email
              </label>
              <div className="mt-1 relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@exemple.com"
                  className="block w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="signup-password"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
              >
                Mot de passe
              </label>
              <div className="mt-1 relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="signup-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8 caractères, 1 majuscule, 1 chiffre"
                  className="block w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                Niveau d'expérience
              </label>
              <div className="grid grid-cols-3 gap-2">
                {LEVELS.map((lvl) => {
                  const isSelected = level === lvl.value;
                  return (
                    <button
                      key={lvl.value}
                      type="button"
                      onClick={() => setLevel(lvl.value)}
                      className={`p-3 rounded-xl border text-center transition-all duration-120 active:scale-[0.98] select-none ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/70 text-blue-700 font-semibold shadow-xs"
                          : "border-slate-200 bg-slate-50/50 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <div className="text-xs font-bold">{lvl.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{lvl.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                Sports pratiqués
              </label>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_SPORTS.map((sport) => {
                  const isChecked = sports.includes(sport);
                  return (
                    <button
                      key={sport}
                      type="button"
                      onClick={() => toggleSport(sport)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all active:scale-[0.96] select-none ${
                        isChecked
                          ? "bg-blue-600 text-white font-medium shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200/70 border border-slate-200/60"
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5" />}
                      <span>{sport}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label
                htmlFor="bio"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
              >
                Bio (optionnel)
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Ex : Je m'entraîne 4 fois par semaine, focus force et volume..."
                className="mt-1 block w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-3 py-3.5 px-4 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white transition-all duration-120 flex items-center justify-center gap-2 select-none shadow-sm shadow-blue-500/20 disabled:opacity-60 disabled:pointer-events-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Création du profil...</span>
                </>
              ) : (
                <>
                  <span>Créer mon compte</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-600">
              Déjà un compte ?{" "}
              <Link
                to="/login"
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
