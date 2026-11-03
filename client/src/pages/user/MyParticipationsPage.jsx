import React from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Calendar,
  Clock,
  MapPin,
  Dumbbell,
  AlertCircle,
  Loader2,
  CheckCircle2,
  XCircle,
  Ban,
  Hourglass,
  ChevronRight,
  Compass,
} from "lucide-react";
import { toast } from "sonner";
import {
  getMyParticipations,
  updateParticipationStatus,
} from "../../api/participation.api.js";

/**
 * Page de suivi des candidatures de l'athlete (MyParticipationsPage).
 * Affiche l'etat de chaque demande avec possibilite d'annulation.
 */
export default function MyParticipationsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["my-participations"],
    queryFn: getMyParticipations,
  });

  const participations = data?.data?.participations || [];

  // Mutation d'annulation par le candidat
  const cancelMutation = useMutation({
    mutationFn: (participationId) =>
      updateParticipationStatus(participationId, "CANCELLED"),
    onSuccess: (_, participationId) => {
      queryClient.invalidateQueries({ queryKey: ["my-participations"] });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["session"] });
      toast.success("Votre participation a été annulée.");
    },
    onError: (err) => {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        "Impossible d'annuler votre candidature.";
      toast.error(msg);
    },
  });

  const handleCancel = (part) => {
    const isAccepted = part.status === "ACCEPTED";
    const confirmMsg = isAccepted
      ? "Êtes-vous sûr d'annuler votre venue ? Votre place sera libérée pour un autre sportif."
      : "Êtes-vous sûr de vouloir retirer votre candidature ?";

    if (window.confirm(confirmMsg)) {
      cancelMutation.mutate(part.id);
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
            Mes Candidatures
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Suivez l'état de vos demandes pour rejoindre des séances
            d'entraînement.
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 py-3 px-5 rounded-2xl font-semibold bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white transition-all text-sm shrink-0 select-none shadow-xs"
        >
          <Compass className="w-4 h-4" />
          <span>Explorer les séances</span>
        </Link>
      </div>

      {/* Etat de chargement */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 animate-pulse space-y-4 shadow-xs"
            >
              <div className="h-5 bg-slate-200 rounded-lg w-1/3" />
              <div className="h-4 bg-slate-100 rounded-lg w-1/2" />
              <div className="h-10 bg-slate-50 rounded-2xl w-full" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="p-6 rounded-3xl bg-red-50 border border-red-200 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
          <p className="text-sm font-semibold text-red-700">
            Impossible de charger vos candidatures.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="py-2 px-4 rounded-xl text-xs font-bold bg-white text-red-700 border border-red-200 shadow-xs"
          >
            Réessayer
          </button>
        </div>
      ) : participations.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 text-center space-y-4 shadow-xs max-w-lg mx-auto">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Users className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">
              Aucune candidature en cours
            </h2>
            <p className="text-xs text-slate-500">
              Vous n'avez pas encore postulé à une séance. Explorez les créneaux
              disponibles et proposez votre binôme !
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 py-2.5 px-5 rounded-2xl font-bold bg-blue-600 text-white text-xs hover:bg-blue-700 active:scale-[0.98] transition-all"
          >
            <Compass className="w-4 h-4" />
            <span>Trouver une séance</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {participations.map((part) => {
            const session = part.session;
            const isPending = part.status === "PENDING";
            const isAccepted = part.status === "ACCEPTED";
            const isDeclined = part.status === "DECLINED";
            const isCancelled = part.status === "CANCELLED";
            const canCancel = isPending || isAccepted;
            const isCancelling = cancelMutation.isPending;

            return (
              <div
                key={part.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base font-extrabold text-slate-900">
                        {session?.activityType || "Entraînement"}
                      </span>

                      {/* Badge de statut */}
                      {isPending && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          <Hourglass className="w-3.5 h-3.5" />
                          <span>En attente de validation</span>
                        </span>
                      )}
                      {isAccepted && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Accepté ( Séance confirmée ! )</span>
                        </span>
                      )}
                      {isDeclined && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Candidature refusée</span>
                        </span>
                      )}
                      {isCancelled && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                          <Ban className="w-3.5 h-3.5" />
                          <span>Candidature annulée</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1.5 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {session?.gym?.name} ({session?.gym?.city})
                      </span>
                      <span className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {formatDate(session?.startAt)}
                      </span>
                      <span className="flex items-center gap-1.5 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {session?.durationMinutes} min
                      </span>
                    </div>
                  </div>

                  {/* Organisateur */}
                  <div className="text-xs text-slate-500 flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-2xl border border-slate-100 self-start sm:self-auto">
                    <span>Organisé par :</span>
                    <span className="font-bold text-slate-900">
                      {session?.host?.firstName}
                    </span>
                    <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-slate-200 font-semibold">
                      {session?.host?.level}
                    </span>
                  </div>
                </div>

                {/* Pied de carte : Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
                  <Link
                    to={`/sessions/${session?.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 select-none py-1.5"
                  >
                    <span>Voir le détail de la séance</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>

                  {canCancel && (
                    <button
                      type="button"
                      disabled={isCancelling}
                      onClick={() => handleCancel(part)}
                      className="py-1.5 px-3.5 rounded-xl text-xs font-bold text-rose-600 bg-white hover:bg-rose-50 border border-rose-200 active:scale-[0.97] transition-all disabled:opacity-50 select-none"
                    >
                      {isAccepted ? "Annuler ma venue" : "Annuler ma demande"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
