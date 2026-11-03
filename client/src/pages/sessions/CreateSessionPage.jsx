import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Dumbbell,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  Users,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { listGyms } from "../../api/gym.api.js";
import { createSession } from "../../api/session.api.js";

const DURATION_PRESETS = [45, 60, 90, 120];

const ACTIVITY_SUGGESTIONS = [
  "Push / Pull / Legs",
  "Pectoraux & Triceps",
  "Dos & Biceps",
  "Legs / Bas du corps",
  "Upper Body / Haut du corps",
  "Full Body",
  "Force / Powerlifting",
];

const LEVEL_OPTIONS = [
  {
    value: "BEGINNER",
    label: "Débutant",
    desc: "Apprentissage des mouvements, charges adaptées",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  {
    value: "INTERMEDIATE",
    label: "Intermédiaire",
    desc: "Pratique régulière, bonne technique d'exécution",
    badge: "border-blue-200 bg-blue-50 text-blue-700",
  },
  {
    value: "ADVANCED",
    label: "Avancé",
    desc: "Charges lourdes, intensité soutenue, programmes ciblés",
    badge: "border-purple-200 bg-purple-50 text-purple-700",
  },
];

const CAPACITY_OPTIONS = [
  {
    value: 2,
    title: "2 personnes",
    subtitle: "Binôme d'entraînement",
    desc: "Vous + 1 partenaire. Idéal pour s'entraider sur les charges (spotter).",
  },
  {
    value: 3,
    title: "3 personnes",
    subtitle: "Trio de motivation",
    desc: "Vous + 2 partenaires. Ambiance dynamique avec un rythme fluide.",
  },
];

/**
 * Page de creation d'une nouvelle seance d'entrainement.
 * Formulaire mobile-first avec options rapides et validation stricte.
 */
export default function CreateSessionPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Date locale minimale autorisee (maintenant)
  const minDateTime = useMemo(() => {
    const now = new Date();
    const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return localNow.toISOString().slice(0, 16);
  }, []);

  // Heure par defaut suggeree : aujourd'hui dans 2h ou demain 18h
  const defaultDateTime = useMemo(() => {
    const defaultDate = new Date(Date.now() + 2 * 60 * 60 * 1000);
    const localDefault = new Date(
      defaultDate.getTime() - defaultDate.getTimezoneOffset() * 60000,
    );
    return localDefault.toISOString().slice(0, 16);
  }, []);

  const [gymId, setGymId] = useState("");
  const [startAt, setStartAt] = useState(defaultDateTime);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [activityType, setActivityType] = useState("Push / Pull / Legs");
  const [level, setLevel] = useState("INTERMEDIATE");
  const [capacity, setCapacity] = useState(2);
  const [formError, setFormError] = useState(null);

  // Recuperation des salles disponibles
  const {
    data: gymsData,
    isLoading: isLoadingGyms,
    isError: isGymsError,
  } = useQuery({
    queryKey: ["gyms"],
    queryFn: () => listGyms({ limit: 50 }),
  });

  const gyms = gymsData?.data?.gyms || [];

  // Pre-selectionne la premiere salle disponible si aucune n'est choisie
  useEffect(() => {
    if (!gymId && gyms.length > 0) {
      setGymId(gyms[0].id);
    }
  }, [gyms, gymId]);

  // Mutation de creation
  const createMutation = useMutation({
    mutationFn: createSession,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["my-hosted-sessions"] });
      toast.success("Séance organisée avec succès !");

      const createdSession = response?.data?.session;
      if (createdSession?.id) {
        navigate(`/sessions/${createdSession.id}`);
      } else {
        navigate("/");
      }
    },
    onError: (err) => {
      const errorMsg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        "Impossible de créer la séance. Veuillez vérifier les informations saisies.";
      setFormError(errorMsg);
      toast.error(errorMsg);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(null);

    if (!gymId) {
      setFormError("Veuillez sélectionner une salle de sport disponible.");
      return;
    }

    if (!startAt) {
      setFormError("Veuillez indiquer la date et l'heure de début.");
      return;
    }

    const selectedDate = new Date(startAt);
    if (selectedDate <= new Date()) {
      setFormError("La date de début doit être dans le futur.");
      return;
    }

    if (!activityType.trim()) {
      setFormError(
        "Veuillez préciser le type d'entraînement ou les groupes musculaires visés.",
      );
      return;
    }

    createMutation.mutate({
      gymId,
      startAt: selectedDate.toISOString(),
      durationMinutes: Number(durationMinutes),
      activityType: activityType.trim(),
      level,
      capacity: Number(capacity),
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Navigation retour */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 active:scale-[0.98] transition-all select-none"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux séances</span>
        </Link>
      </div>

      {/* En-tete */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Organiser un entraînement</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Créer une séance
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Définissez votre créneau, votre programme et trouvez le bon partenaire
          pour vous motiver.
        </p>
      </div>

      {/* Banniere d'erreur globale */}
      {formError && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3 animate-in fade-in duration-200"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Vérification requise</p>
            <p className="text-xs text-red-600">{formError}</p>
          </div>
        </div>
      )}

      {/* Formulaire principal */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1 : Salle de sport */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <label
                htmlFor="gym-select"
                className="text-sm font-bold text-slate-900 block"
              >
                Salle de sport
              </label>
              <p className="text-xs text-slate-500">
                Où se déroulera la séance d'entraînement ?
              </p>
            </div>
          </div>

          {isLoadingGyms ? (
            <div className="flex items-center gap-2 py-3 px-4 text-xs text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span>Chargement des salles disponibles...</span>
            </div>
          ) : isGymsError ? (
            <div className="p-3 text-xs text-red-600 bg-red-50 rounded-2xl border border-red-100">
              Impossible de charger les salles de sport.
            </div>
          ) : gyms.length === 0 ? (
            <div className="p-3 text-xs text-amber-700 bg-amber-50 rounded-2xl border border-amber-200">
              Aucune salle répertoriée pour le moment.
            </div>
          ) : (
            <select
              id="gym-select"
              value={gymId}
              onChange={(e) => setGymId(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all cursor-pointer font-medium"
              required
            >
              {gyms.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ( {g.address}, {g.city})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Section 2 : Date, Heure & Duree */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <label
                htmlFor="start-at"
                className="text-sm font-bold text-slate-900 block"
              >
                Date & Heure de début
              </label>
              <p className="text-xs text-slate-500">
                Fixez le rendez-vous à la salle
              </p>
            </div>
          </div>

          <div>
            <input
              id="start-at"
              type="datetime-local"
              min={minDateTime}
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
              required
            />
          </div>

          {/* Duree de la seance */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Durée prévue
              </span>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                {durationMinutes} minutes
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {DURATION_PRESETS.map((minutes) => {
                const isSelected = durationMinutes === minutes;
                return (
                  <button
                    type="button"
                    key={minutes}
                    onClick={() => setDurationMinutes(minutes)}
                    className={`py-2.5 text-xs font-semibold rounded-2xl border transition-all active:scale-[0.97] select-none ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs shadow-blue-500/20"
                        : "bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100"
                    }`}
                  >
                    {minutes} min
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 3 : Activite & Programme */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div>
              <label
                htmlFor="activity-type"
                className="text-sm font-bold text-slate-900 block"
              >
                Type d'entraînement
              </label>
              <p className="text-xs text-slate-500">
                Précisez les groupes musculaires ou le type de séance
              </p>
            </div>
          </div>

          <input
            id="activity-type"
            type="text"
            value={activityType}
            onChange={(e) => setActivityType(e.target.value)}
            placeholder="Ex : Push (Pectoraux, Épaules, Triceps)"
            maxLength={100}
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
            required
          />

          {/* Suggestions de programmes rapides */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Suggestions rapides :
            </span>
            <div className="flex flex-wrap gap-1.5">
              {ACTIVITY_SUGGESTIONS.map((suggestion) => (
                <button
                  type="button"
                  key={suggestion}
                  onClick={() => setActivityType(suggestion)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all active:scale-[0.97] select-none ${
                    activityType === suggestion
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 4 : Niveau d'intensite */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
          <div>
            <label className="text-sm font-bold text-slate-900 block">
              Niveau ciblé
            </label>
            <p className="text-xs text-slate-500">
              Choisissez le niveau attendu pour harmoniser le rythme de travail
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {LEVEL_OPTIONS.map((lvl) => {
              const isSelected = level === lvl.value;
              return (
                <button
                  type="button"
                  key={lvl.value}
                  onClick={() => setLevel(lvl.value)}
                  className={`p-4 rounded-2xl border text-left transition-all active:scale-[0.98] select-none relative ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20"
                      : "border-slate-200/80 bg-slate-50/50 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${lvl.badge}`}
                    >
                      {lvl.label}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    {lvl.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 5 : Capacite (Strictement 2 ou 3 personnes) */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-900 block">
                Taille du groupe (Hôte inclus)
              </label>
              <p className="text-xs text-slate-500">
                GymOn favorise des entraînements qualitatifs en petit comité
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CAPACITY_OPTIONS.map((cap) => {
              const isSelected = capacity === cap.value;
              return (
                <button
                  type="button"
                  key={cap.value}
                  onClick={() => setCapacity(cap.value)}
                  className={`p-4 rounded-2xl border text-left transition-all active:scale-[0.98] select-none ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20"
                      : "border-slate-200/80 bg-slate-50/50 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-extrabold text-slate-900">
                      {cap.title}
                    </span>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      {cap.subtitle}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {cap.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bouton d'action principal */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={createMutation.isPending || isLoadingGyms}
            className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white transition-all shadow-sm shadow-blue-500/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 select-none"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Publication de la séance en cours...</span>
              </>
            ) : (
              <>
                <Dumbbell className="w-4 h-4" />
                <span>Publier et trouver un partenaire</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
