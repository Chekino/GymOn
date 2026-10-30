import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Award,
  Check,
  Save,
  Loader2,
  LogOut,
  Trash2,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { getMe, updateMe, deleteMe } from "../../api/user.api.js";
import { logout as apiLogout } from "../../api/auth.api.js";
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
 * Page de gestion du profil de l'athlete (ProfilePage).
 * Permet la consultation et la mise a jour des informations sportives,
 * ainsi que la deconnexion et la suppression de compte.
 */
export default function ProfilePage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const logout = useAuthStore((state) => state.logout);

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [level, setLevel] = useState(user?.level || "BEGINNER");
  const [sports, setSports] = useState(user?.sports || ["Musculation"]);
  const [bio, setBio] = useState(user?.bio || "");

  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Synchronise les donnees les plus fraiches de l'API au chargement
  useEffect(() => {
    async function loadFreshProfile() {
      try {
        const response = await getMe();
        if (response.data?.user) {
          const freshUser = response.data.user;
          updateUser(freshUser);
          setFirstName(freshUser.firstName || "");
          setLevel(freshUser.level || "BEGINNER");
          setSports(freshUser.sports || ["Musculation"]);
          setBio(freshUser.bio || "");
        }
      } catch {
        // En cas d'erreur reseau, les donnees du store local restent affichees
      }
    }

    loadFreshProfile();
  }, [updateUser]);

  const toggleSport = (sport) => {
    if (sports.includes(sport)) {
      setSports(sports.filter((s) => s !== sport));
    } else {
      setSports([...sports, sport]);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await updateMe({
        firstName: firstName.trim(),
        level,
        sports,
        bio: bio.trim() || undefined,
      });

      updateUser(response.data.user);

      toast.success("Profil mis à jour", {
        description: "Vos préférences sportives ont été enregistrées.",
      });
    } catch (error) {
      const message =
        error.response?.data?.error?.message ||
        "Impossible de mettre à jour votre profil.";
      toast.error("Erreur", { description: message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await apiLogout();
    } catch {
      // Ignorer si le jeton etait deja revoque
    } finally {
      logout();
      toast.success("Déconnexion réussie", {
        description: "À bientôt pour votre prochaine séance !",
      });
      navigate("/login", { replace: true });
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Êtes-vous certain de vouloir supprimer votre compte GymOn ? Cette action désactivera immédiatement votre accès."
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteMe();
      logout();
      toast.success("Compte supprimé", {
        description: "Votre compte a été désactivé conformément au RGPD.",
      });
      navigate("/login", { replace: true });
    } catch (error) {
      const message =
        error.response?.data?.error?.message ||
        "Impossible de supprimer le compte pour le moment.";
      toast.error("Erreur", { description: message });
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-8">
      {/* Carte d'identite de l'athlete */}
      <section className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white font-black text-2xl flex items-center justify-center shadow-sm shadow-blue-500/20 shrink-0">
            {(firstName || user?.firstName || "A")[0].toUpperCase()}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {firstName || user?.firstName}
              </h1>
              <span className="inline-flex items-center justify-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/60 self-center sm:self-auto">
                <Award className="w-3.5 h-3.5" />
                <span>{level}</span>
              </span>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-500">
              <Mail className="w-3.5 h-3.5" />
              <span>{user?.email}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Formulaire de modification */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        <section className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            <span>Informations sportives</span>
          </h2>

          <div>
            <label
              htmlFor="profile-firstName"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
            >
              Prénom
            </label>
            <input
              id="profile-firstName"
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1 block w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
              Niveau d'expérience
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {LEVELS.map((lvl) => {
                const isSelected = level === lvl.value;
                return (
                  <button
                    key={lvl.value}
                    type="button"
                    onClick={() => setLevel(lvl.value)}
                    className={`p-3.5 rounded-2xl border text-center transition-all duration-120 active:scale-[0.98] select-none ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/70 text-blue-700 font-bold shadow-xs"
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
              Disciplines & Sports favoris
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_SPORTS.map((sport) => {
                const isChecked = sports.includes(sport);
                return (
                  <button
                    key={sport}
                    type="button"
                    onClick={() => toggleSport(sport)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs transition-all active:scale-[0.96] select-none ${
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
              htmlFor="profile-bio"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
            >
              Présentation / Objectifs
            </label>
            <textarea
              id="profile-bio"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Décrivez vos créneaux types, vos objectifs (force, hypertrophie, endurance)..."
              className="mt-1 block w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3.5 px-4 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white transition-all duration-120 flex items-center justify-center gap-2 select-none shadow-sm shadow-blue-500/20 disabled:opacity-60"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Enregistrement...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Enregistrer les modifications</span>
              </>
            )}
          </button>
        </section>
      </form>

      {/* Zone Parametres de Compte & Securite */}
      <section className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-slate-500" />
          <span>Gestion du compte</span>
        </h2>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex-1 py-3 px-4 rounded-xl font-semibold border border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 select-none disabled:opacity-60"
          >
            {isLoggingOut ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
            <span>Se déconnecter</span>
          </button>

          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className="py-3 px-4 rounded-xl font-semibold border border-red-200/80 text-red-600 hover:bg-red-50/70 active:scale-[0.98] transition-all flex items-center justify-center gap-2 select-none disabled:opacity-60"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            <span>Supprimer mon compte</span>
          </button>
        </div>
      </section>
    </div>
  );
}
