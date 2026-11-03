import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  Clock,
  MapPin,
  Dumbbell,
  Users,
  Check,
  X,
  AlertCircle,
  Loader2,
  Plus,
  ChevronRight,
  ShieldAlert,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { getMyHostedSessions, updateSession } from "../../api/session.api.js";
import {
  getSessionParticipations,
  updateParticipationStatus,
} from "../../api/participation.api.js";

/**
 * Composant de gestion des candidatures d'une seance donnee.
 */
function SessionCandidatures({
  sessionId,
  sessionStatus,
  sessionCapacity,
  acceptedCount,
}) {
  const queryClient = useQueryClient();
  const [loadingActionId, setLoadingActionId] = useState(null);

  const {
    data: participationsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["session-participations", sessionId],
    queryFn: () => getSessionParticipations(sessionId),
  });

  const participations = participationsData?.data?.participations || [];

  const updateStatusMutation = useMutation({
    mutationFn: ({ participationId, status }) =>
      updateParticipationStatus(participationId, status),
    onSuccess: (_, variables) => {
      // Invalidation coordonnee des caches impactes
      queryClient.invalidateQueries({
        queryKey: ["session-participations", sessionId],
      });
      queryClient.invalidateQueries({ queryKey: ["my-hosted-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["session", sessionId] });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });

      if (variables.status === "ACCEPTED") {
        toast.success("Candidat accepté dans la séance !");
      } else {
        toast.info("Candidature refusée.");
      }
    },
    onError: (err) => {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        "Impossible de mettre à jour la candidature.";
      toast.error(msg);
    },
    onSettled: () => {
      setLoadingActionId(null);
    },
  });

  const handleAction = (participationId, status) => {
    setLoadingActionId(participationId);
    updateStatusMutation.mutate({ participationId, status });
  };

  const isFull = acceptedCount >= sessionCapacity - 1;

  if (isLoading) {
    return (
      <div className="py-4 flex items-center justify-center gap-2 text-xs text-slate-400">
        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
        <span>Chargement des candidatures...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-3 text-xs text-red-600 bg-red-50 rounded-2xl border border-red-100">
        Erreur lors du chargement des candidatures.
      </div>
    );
  }

  if (participations.length === 0) {
    return (
      <div className="py-4 px-3 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 text-center">
        <p className="text-xs text-slate-500">
          Aucune candidature reçue pour le moment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
        <span>Candidatures reçues ({participations.length})</span>
        {isFull && sessionStatus !== "CANCELLED" && (
          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            Séance complète
          </span>
        )}
      </div>

      <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200/80 bg-slate-50/50 overflow-hidden">
        {participations.map((part) => {
          const candidate = part.user;
          const isPending = part.status === "PENDING";
          const isAccepted = part.status === "ACCEPTED";
          const isDeclined = part.status === "DECLINED";
          const isCancelled = part.status === "CANCELLED";
          const isMutating = loadingActionId === part.id;

          return (
            <div
              key={part.id}
              className="p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white hover:bg-slate-50/50 transition-colors"
            >
              {/* Infos Candidat */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100/70 text-blue-700 font-extrabold text-sm flex items-center justify-center shrink-0">
                  {candidate.firstName
                    ? candidate.firstName[0].toUpperCase()
                    : "S"}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-slate-900">
                      {candidate.firstName}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {candidate.level}
                    </span>

                    {/* Badge statut */}
                    {isPending && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        En attente
                      </span>
                    )}
                    {isAccepted && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Partenaire confirmé
                      </span>
                    )}
                    {isDeclined && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                        Refusé
                      </span>
                    )}
                    {isCancelled && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                        Annulé par le candidat
                      </span>
                    )}
                  </div>

                  {candidate.bio && (
                    <p className="text-xs text-slate-500 line-clamp-1">
                      « {candidate.bio} »
                    </p>
                  )}

                  {candidate.sports && candidate.sports.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {candidate.sports.map((sp, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md"
                        >
                          {sp}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions de l'hote (uniquement si PENDING et seance active) */}
              {isPending && sessionStatus !== "CANCELLED" && (
                <div className="flex items-center gap-2 sm:self-center shrink-0">
                  <button
                    type="button"
                    disabled={isMutating || isFull}
                    onClick={() => handleAction(part.id, "ACCEPTED")}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 active:scale-[0.97] text-white transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed select-none"
                    title={
                      isFull
                        ? "La séance a atteint sa capacité maximale"
                        : "Accepter ce partenaire"
                    }
                  >
                    {isMutating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    <span>Accepter</span>
                  </button>

                  <button
                    type="button"
                    disabled={isMutating}
                    onClick={() => handleAction(part.id, "DECLINED")}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold bg-white hover:bg-rose-50 active:scale-[0.97] text-rose-600 border border-rose-200 transition-all shadow-xs disabled:opacity-50 select-none"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Refuser</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Page Dashboard de l'hote : gestion de ses seances organisees et des candidatures.
 */
export default function MySessionsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["my-hosted-sessions"],
    queryFn: getMyHostedSessions,
  });

  const sessions = data?.data?.sessions || [];

  // Mutation d'annulation d'une seance par l'hote
  const cancelSessionMutation = useMutation({
    mutationFn: (sessionId) =>
      updateSession(sessionId, { status: "CANCELLED" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-hosted-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("La séance a été annulée.");
    },
    onError: (err) => {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        "Impossible d'annuler la séance.";
      toast.error(msg);
    },
  });

  const handleCancelSession = (sessionId) => {
    if (
      window.confirm(
        "Êtes-vous sûr de vouloir annuler cette séance ? Toutes les candidatures seront également annulées.",
      )
    ) {
      cancelSessionMutation.mutate(sessionId);
    }
  };

  const formatDate = (dateStr) => {
    try {
      return new Intl.DateTimeFormat("fr-FR", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tete */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Mes Séances Organisées
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Gérez vos créneaux d'entraînement, validez vos partenaires et suivez
            votre groupe.
          </p>
        </div>

        <Link
          to="/sessions/new"
          className="inline-flex items-center justify-center gap-2 py-3 px-5 rounded-2xl font-semibold bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white transition-all shadow-sm shadow-blue-500/20 text-sm shrink-0 select-none"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle séance</span>
        </Link>
      </div>

      {/* Etat de chargement */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 animate-pulse space-y-4 shadow-xs"
            >
              <div className="h-5 bg-slate-200 rounded-lg w-1/3" />
              <div className="h-4 bg-slate-100 rounded-lg w-1/2" />
              <div className="h-20 bg-slate-50 rounded-2xl w-full" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="p-6 rounded-3xl bg-red-50 border border-red-200 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
          <p className="text-sm font-semibold text-red-700">
            Impossible de charger vos séances organisées.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="py-2 px-4 rounded-xl text-xs font-bold bg-white text-red-700 border border-red-200 shadow-xs"
          >
            Réessayer
          </button>
        </div>
      ) : sessions.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 text-center space-y-4 shadow-xs max-w-lg mx-auto">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Calendar className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">
              Aucune séance organisée
            </h2>
            <p className="text-xs text-slate-500">
              Vous n'avez pas encore programmé d'entraînement. Proposez votre
              premier créneau pour trouver un binôme !
            </p>
          </div>
          <Link
            to="/sessions/new"
            className="inline-flex items-center gap-2 py-2.5 px-5 rounded-2xl font-bold bg-blue-600 text-white text-xs hover:bg-blue-700 active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Créer ma première séance</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {sessions.map((session) => {
            const allParticipants = session.participations || [];
            const acceptedParticipants = allParticipants.filter((p) => p.status === "ACCEPTED");
            const pendingCount = allParticipants.filter((p) => p.status === "PENDING").length;
            const currentTotal = 1 + acceptedParticipants.length; // Hote + participants acceptes
            const isFull = currentTotal >= session.capacity;
            const isCancelled = session.status === "CANCELLED";

            return (
              <div
                key={session.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5"
              >
                {/* En-tete de la seance */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base font-extrabold text-slate-900">
                        {session.activityType}
                      </span>

                      {/* Badge de nouvelles demandes PENDING */}
                      {pendingCount > 0 && !isCancelled && (
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-600 text-white shadow-xs animate-pulse">
                          {pendingCount} demande{pendingCount > 1 ? "s" : ""} à valider
                        </span>
                      )}

                      {/* Badge de statut de la seance */}
                      {isCancelled ? (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                          Séance annulée
                        </span>
                      ) : isFull ? (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          Complet
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Ouverte
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1.5 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {session.gym?.name} ({session.gym?.city})
                      </span>
                      <span className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {formatDate(session.startAt)}
                      </span>
                      <span className="flex items-center gap-1.5 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {session.durationMinutes} min
                      </span>
                    </div>
                  </div>

                  {/* Boutons d'actions seance */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      to={`/sessions/${session.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50/70 hover:bg-blue-50 px-3 py-2 rounded-xl transition-all select-none"
                    >
                      <span>Voir la fiche</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>

                    {!isCancelled && (
                      <button
                        type="button"
                        onClick={() => handleCancelSession(session.id)}
                        disabled={cancelSessionMutation.isPending}
                        className="text-xs font-semibold text-slate-500 hover:text-rose-600 px-3 py-2 rounded-xl hover:bg-rose-50 transition-all select-none"
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                </div>

                {/* Jauge des places */}
                <div className="flex items-center justify-between text-xs py-2 px-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-blue-600" />
                    Groupe ({currentTotal} / {session.capacity} personnes)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Vous + {acceptedParticipants.length} partenaire(s)
                    confirmé(s)
                  </span>
                </div>

                {/* Section Candidatures recues */}
                <SessionCandidatures
                  sessionId={session.id}
                  sessionStatus={session.status}
                  sessionCapacity={session.capacity}
                  acceptedCount={acceptedParticipants.length}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
