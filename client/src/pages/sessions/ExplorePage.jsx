import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Plus, Dumbbell, AlertCircle, RefreshCw } from "lucide-react";
import { listSessions } from "../../api/session.api.js";
import SessionCard from "../../components/sessions/SessionCard.jsx";

const LEVEL_FILTERS = [
  { value: "ALL", label: "Tous les niveaux" },
  { value: "BEGINNER", label: "Débutant" },
  { value: "INTERMEDIATE", label: "Intermédiaire" },
  { value: "ADVANCED", label: "Avancé" },
];

/**
 * Page d'exploration et decouverte des seances (ExplorePage).
 * Filtres par niveau, chargement par squelette sans saut d'ecran, et mise en cache TanStack Query.
 */
export default function ExplorePage() {
  const [selectedLevel, setSelectedLevel] = useState("ALL");

  const queryFilters = {
    status: "OPEN",
    ...(selectedLevel !== "ALL" ? { level: selectedLevel } : {}),
  };

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["sessions", selectedLevel],
    queryFn: () => listSessions(queryFilters),
  });

  const sessions = data?.data?.sessions || [];

  return (
    <div className="space-y-6">
      {/* En-tete : Titre, description et bouton de creation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Explorer les séances
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Trouvez un partenaire d'entraînement disponible et motivé près de chez vous.
          </p>
        </div>

        <Link
          to="/sessions/new"
          className="inline-flex items-center justify-center gap-2 py-3 px-5 rounded-2xl font-semibold bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white transition-all duration-120 shadow-sm shadow-blue-500/20 select-none text-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Créer une séance</span>
        </Link>
      </div>

      {/* Barre de filtrage par niveau sportif */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none select-none">
        {LEVEL_FILTERS.map((filter) => {
          const isSelected = selectedLevel === filter.value;
          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => setSelectedLevel(filter.value)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all duration-120 whitespace-nowrap active:scale-[0.96] ${
                isSelected
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-100/70 hover:border-slate-300"
              }`}
            >
              {filter.label}
            </button>
          );
        })}

        {isFetching && !isLoading && (
          <span className="text-xs text-slate-400 font-medium animate-pulse ml-2">
            Actualisation...
          </span>
        )}
      </div>

      {/* Etat de chargement : Squelettes animes sans saut d'ecran (Skeleton Shimmer) */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((skeletonId) => (
            <div
              key={skeletonId}
              className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs animate-pulse space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-200" />
                  <div className="space-y-1.5">
                    <div className="w-28 h-3.5 bg-slate-200 rounded-md" />
                    <div className="w-16 h-2.5 bg-slate-100 rounded-md" />
                  </div>
                </div>
                <div className="w-20 h-6 bg-slate-200 rounded-full" />
              </div>

              <div className="w-40 h-5 bg-slate-200 rounded-md" />

              <div className="flex gap-2">
                <div className="w-24 h-7 bg-slate-100 rounded-xl" />
                <div className="w-16 h-7 bg-slate-100 rounded-xl" />
                <div className="w-20 h-7 bg-slate-100 rounded-xl" />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-200" />
                  <div className="w-24 h-3 bg-slate-200 rounded-md" />
                </div>
                <div className="w-14 h-3 bg-slate-200 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Etat d'erreur */}
      {isError && (
        <div className="bg-white border border-red-200/80 rounded-3xl p-8 text-center space-y-4 max-w-md mx-auto shadow-sm">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">
              Impossible de charger les séances
            </h3>
            <p className="text-xs text-slate-500">
              {error?.response?.data?.error?.message ||
                "Une erreur est survenue lors de la communication avec l'API."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.98] transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Réessayer</span>
          </button>
        </div>
      )}

      {/* Etat vide : Aucune seance disponible */}
      {!isLoading && !isError && sessions.length === 0 && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-10 text-center space-y-4 max-w-lg mx-auto shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Dumbbell className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Aucune séance disponible pour ce filtre
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Soyez le premier à proposer un entraînement sur ce créneau ou essayez de
              sélectionner un autre niveau.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/sessions/new"
              className="inline-flex items-center gap-2 py-3 px-5 rounded-2xl font-semibold bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white transition-all text-xs shadow-sm shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Créer une séance</span>
            </Link>
          </div>
        </div>
      )}

      {/* Grille des seances d'entrainement */}
      {!isLoading && !isError && sessions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {sessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </div>
  );
}
