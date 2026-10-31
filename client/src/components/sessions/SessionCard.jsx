import React from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, MapPin, Users, ArrowRight, Award } from "lucide-react";

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
 * Formate une date ISO en chaine lisible francaise (ex: "Sam. 2 nov. à 18h30").
 */
function formatSessionDate(dateString) {
  const date = new Date(dateString);
  const formatter = new Intl.DateTimeFormat("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  return formatter.format(date);
}

/**
 * Carte athletique d'une seance d'entrainement (SessionCard).
 * Presente les informations cles : salle, activite, horaire, niveau et hote.
 */
export default function SessionCard({ session }) {
  const levelBadge = LEVEL_CONFIG[session.level] || LEVEL_CONFIG.BEGINNER;
  const isFull = session.status === "FULL";
  const isCancelled = session.status === "CANCELLED";

  return (
    <Link
      to={`/sessions/${session.id}`}
      className="group block bg-white border border-slate-200/80 hover:border-blue-300 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all duration-150 select-none active:scale-[0.99]"
    >
      <div className="flex flex-col gap-4">
        {/* En-tete : Salle et badge de statut */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                {session.gym?.name || "Salle de sport"}
              </h3>
              <p className="text-xs text-slate-500 truncate">
                {session.gym?.city || "Localisation non précisée"}
              </p>
            </div>
          </div>

          <div>
            {isCancelled ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200/60">
                Annulée
              </span>
            ) : isFull ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
                Complet
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <Users className="w-3 h-3" />
                <span>{session.capacity} pers. max</span>
              </span>
            )}
          </div>
        </div>

        {/* Titre : Discipline et type d'activite */}
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight group-hover:text-blue-700 transition-colors">
            {session.activityType}
          </h2>
        </div>

        {/* Criteres sportifs : Date, duree et niveau */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-700 font-medium">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>{formatSessionDate(session.startAt)}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-700 font-medium">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>{session.durationMinutes} min</span>
          </div>

          <div
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-bold ${levelBadge.className}`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>{levelBadge.label}</span>
          </div>
        </div>

        {/* Pied de carte : Hote et bouton d'action */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {(session.host?.firstName || "H")[0].toUpperCase()}
            </div>
            <span className="text-xs font-medium text-slate-600">
              Proposé par{" "}
              <strong className="text-slate-900 font-semibold">
                {session.host?.firstName || "Hôte"}
              </strong>
            </span>
          </div>

          <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform">
            <span>Détails</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
