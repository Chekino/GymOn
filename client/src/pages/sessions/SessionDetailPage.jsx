import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Award,
  UserCheck,
  User,
  CheckCircle,
  AlertCircle,
  Loader2,
  CalendarDays,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { getSessionById } from "../../api/session.api.js";
import {
  requestToJoinSession,
  getMyParticipations,
} from "../../api/participation.api.js";
import { useAuthStore } from "../../store/authStore.js";

const LEVEL_CONFIG = {
  BEGINNER: {
    label: "Débutant",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  },
  INTERMEDIATE: {
    label: "Intermédiaire",
    className: "bg-blue-50 text-blue-700 border-blue-200/60",
  },
  ADVANCED: {
    label: "Avancé",
    className: "bg-purple-50 text-purple-700 border-purple-200/60",
  },
};

/**
 * Formate une date ISO en chaine lisible francaise (ex: "Samedi 2 novembre à 18h30").
 */
function formatFullDate(dateString) {
  const date = new Date(dateString);
  const formatter = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
  return formatter.format(date);
}

/**
 * Page de fiche detaillee d'une seance (SessionDetailPage).
 * Affiche la salle, l'hote, la jauge des places et le bouton d'action contextuel.
 */
export default function SessionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);

  // Recuperation des donnees de la seance
  const {
    data: sessionData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["session", id],
    queryFn: () => getSessionById(id),
  });

  // Recuperation des participations de l'utilisateur pour connaitre son statut
  const { data: myParticipationsData } = useQuery({
    queryKey: ["my-participations"],
    queryFn: getMyParticipations,
    enabled: !!currentUser,
  });

  const session = sessionData?.data?.session;
  const myParticipations = myParticipationsData?.data?.participations || [];
  const myParticipation = myParticipations.find((p) => p.sessionId === id);

  // Mutation pour postuler a la seance
  const joinMutation = useMutation({
    mutationFn: () => requestToJoinSession(id),
    onSuccess: () => {
      toast.success("Demande envoyée avec succès !", {
        description: "L'hôte a été notifié de votre candidature.",
      });
      queryClient.invalidateQueries({ queryKey: ["session", id] });
      queryClient.invalidateQueries({ queryKey: ["my-participations"] });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
    onError: (err) => {
      const message =
        err.response?.data?.error?.message ||
        "Impossible de rejoindre cette séance pour le moment.";
      toast.error("Erreur", { description: message });
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-600" />
        <p className="text-sm text-slate-500 font-medium">
          Chargement des détails de la séance...
        </p>
      </div>
    );
  }

  if (isError || !session) {
    return (
      <div className="max-w-md mx-auto py-12 text-center bg-white border border-red-200/80 rounded-3xl p-8 space-y-4 shadow-sm">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Séance introuvable</h2>
        <p className="text-xs text-slate-500">
          {error?.response?.data?.error?.message ||
            "Cette séance n'existe pas ou a été supprimée."}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.98] transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à l'exploration</span>
        </Link>
      </div>
    );
  }

  const isHost = session.hostId === currentUser?.id;
  const isFull = session.status === "FULL";
  const isCancelled = session.status === "CANCELLED";
  const levelBadge = LEVEL_CONFIG[session.level] || LEVEL_CONFIG.BEGINNER;

  // Calcul des places : hote + participants acceptes + places libres
  const acceptedParticipants = session.participations || [];
  const totalCapacity = session.capacity;
  const remainingParticipantSpots = Math.max(
    0,
    totalCapacity - 1 - acceptedParticipants.length
  );

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-10">
      {/* Bouton retour vers l'exploration */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors py-1 select-none active:scale-[0.98]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux séances</span>
        </Link>
      </div>

      {/* Carte principale de la seance */}
      <section className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Séance GymOn</span>
          </div>

          <div>
            {isCancelled ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200/60">
                Annulée
              </span>
            ) : isFull ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
                Séance complète
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <Users className="w-3.5 h-3.5" />
                <span>
                  {remainingParticipantSpots} place
                  {remainingParticipantSpots > 1 ? "s" : ""} restante
                  {remainingParticipantSpots > 1 ? "s" : ""}
                </span>
              </span>
            )}
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {session.activityType}
          </h1>
          <p className="text-sm text-slate-600 capitalize mt-1.5 flex items-center gap-1.5 font-medium">
            <CalendarDays className="w-4 h-4 text-blue-600" />
            <span>{formatFullDate(session.startAt)}</span>
          </p>
        </div>

        {/* Criteres cles : Duree et Niveau */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-700 text-xs font-semibold">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Durée : {session.durationMinutes} minutes</span>
          </div>

          <div
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold ${levelBadge.className}`}
          >
            <Award className="w-4 h-4" />
            <span>Niveau conseillé : {levelBadge.label}</span>
          </div>
        </div>
      </section>

      {/* Salle de sport partenaire */}
      <section className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span>Lieu de rendez-vous</span>
        </h2>

        <div className="space-y-1">
          <h3 className="text-base font-extrabold text-slate-900">
            {session.gym?.name}
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            {session.gym?.address}, {session.gym?.city}
          </p>
        </div>
      </section>

      {/* Jauge des places et participants */}
      <section className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span>Participants ({1 + acceptedParticipants.length} / {totalCapacity})</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Emplacement Hote */}
          <div className="p-4 rounded-2xl border border-blue-200/80 bg-blue-50/40 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
              {(session.host?.firstName || "H")[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-slate-900 truncate">
                  {session.host?.firstName}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                  Hôte
                </span>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Niveau : {session.host?.level}
              </span>
            </div>
          </div>

          {/* Emplacements Participants acceptes */}
          {acceptedParticipants.map((part) => (
            <div
              key={part.id}
              className="p-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/40 flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                {(part.user?.firstName || "P")[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-slate-900 truncate">
                    {part.user?.firstName}
                  </span>
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  Confirmé • {part.user?.level}
                </span>
              </div>
            </div>
          ))}

          {/* Emplacements libres restants */}
          {Array.from({ length: remainingParticipantSpots }).map((_, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 flex items-center gap-3 text-slate-400"
            >
              <div className="w-9 h-9 rounded-full border border-dashed border-slate-300 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-600 block">
                  Place disponible
                </span>
                <span className="text-[11px] text-slate-400">
                  En attente d'un partenaire
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Profil de l'hote detaille */}
      <section className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>À propos de l'hôte</span>
        </h2>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-extrabold text-base">
              {(session.host?.firstName || "H")[0].toUpperCase()}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {session.host?.firstName}
              </h3>
              <p className="text-xs text-slate-500">
                Pratique : {session.host?.sports?.join(", ") || "Musculation"}
              </p>
            </div>
          </div>

          {session.host?.bio && (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 italic leading-relaxed">
              « {session.host.bio} »
            </div>
          )}
        </div>
      </section>

      {/* Barre d'action contextuelle (Bouton Rejoindre / Statuts) */}
      <section className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
        {isHost ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block">
                Votre entraînement
              </span>
              <p className="text-sm font-semibold text-slate-900 mt-0.5">
                Vous êtes l'organisateur de cette séance.
              </p>
            </div>
            <Link
              to="/my-sessions"
              className="py-3 px-5 rounded-2xl font-semibold bg-slate-900 hover:bg-slate-800 text-white text-xs select-none active:scale-[0.98] transition-all shadow-sm"
            >
              Gérer mes séances
            </Link>
          </div>
        ) : isCancelled ? (
          <div className="text-center py-2 text-sm font-semibold text-red-600">
            Cette séance a été annulée par son organisateur.
          </div>
        ) : myParticipation?.status === "ACCEPTED" ? (
          <div className="flex items-center justify-center gap-2 py-2 text-sm font-bold text-emerald-700 bg-emerald-50 rounded-2xl border border-emerald-200/60 p-4">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span>Votre participation est confirmée ! Préparez votre entraînement.</span>
          </div>
        ) : myParticipation?.status === "PENDING" ? (
          <div className="flex items-center justify-center gap-2 py-2 text-sm font-semibold text-blue-700 bg-blue-50 rounded-2xl border border-blue-200/60 p-4">
            <Clock className="w-5 h-5 text-blue-600" />
            <span>Votre demande a été envoyée et attend la confirmation de l'hôte.</span>
          </div>
        ) : myParticipation?.status === "DECLINED" ? (
          <div className="text-center py-2 text-sm font-medium text-slate-500 bg-slate-50 rounded-2xl p-4">
            Votre demande pour cette séance n'a pas été retenue par l'hôte.
          </div>
        ) : isFull ? (
          <button
            type="button"
            disabled
            className="w-full py-4 px-6 rounded-2xl font-semibold bg-slate-100 text-slate-400 cursor-not-allowed select-none text-sm border border-slate-200/60"
          >
            Séance complète
          </button>
        ) : !currentUser ? (
          <button
            type="button"
            onClick={() => navigate("/login", { state: { from: `/sessions/${id}` } })}
            className="w-full py-4 px-6 rounded-2xl font-semibold bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white transition-all duration-120 flex items-center justify-center gap-2 select-none shadow-sm shadow-blue-500/20 text-sm"
          >
            <span>Se connecter pour rejoindre cette séance</span>
            <Sparkles className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => joinMutation.mutate()}
            disabled={joinMutation.isPending}
            className="w-full py-4 px-6 rounded-2xl font-semibold bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white transition-all duration-120 flex items-center justify-center gap-2 select-none shadow-sm shadow-blue-500/20 text-sm disabled:opacity-60"
          >
            {joinMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Envoi de votre demande...</span>
              </>
            ) : (
              <>
                <span>Demander à rejoindre cette séance</span>
                <Sparkles className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </section>
    </div>
  );
}
