import React, { useMemo } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { Dumbbell, Compass, Calendar, Users, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../../store/authStore.js";
import { getMyHostedSessions } from "../../api/session.api.js";
import { getMyParticipations } from "../../api/participation.api.js";

const NAV_ITEMS = [
  {
    to: "/",
    label: "Explorer",
    icon: Compass,
    end: true,
  },
  {
    to: "/my-sessions",
    label: "Mes Séances",
    icon: Calendar,
  },
  {
    to: "/my-participations",
    label: "Participations",
    icon: Users,
  },
  {
    to: "/profile",
    label: "Profil",
    icon: User,
  },
];

/**
 * Mise en page principale de l'application (AppLayout).
 * Combine une barre superieure sur Desktop et une barre de navigation basse sur Mobile.
 * Integre des badges de notifications dynamiques pour l'hote (demandes recues) et le participant (seances acceptees).
 */
export default function AppLayout() {
  const user = useAuthStore((state) => state.user);

  // Requetes en arriere-plan pour les compteurs de notifications
  const { data: hostedData } = useQuery({
    queryKey: ["my-hosted-sessions"],
    queryFn: getMyHostedSessions,
    enabled: !!user,
  });

  const { data: participationsData } = useQuery({
    queryKey: ["my-participations"],
    queryFn: getMyParticipations,
    enabled: !!user,
  });

  // Nombre de demandes PENDING recues sur les seances de l'hote
  const pendingRequestsCount = useMemo(() => {
    const sessions = hostedData?.data?.sessions || [];
    return sessions.reduce((total, session) => {
      if (session.status === "CANCELLED") return total;
      const pending = (session.participations || []).filter(
        (p) => p.status === "PENDING"
      ).length;
      return total + pending;
    }, 0);
  }, [hostedData]);

  // Nombre de participations ACCEPTED a venir pour le sportif
  const acceptedParticipationsCount = useMemo(() => {
    const participations = participationsData?.data?.participations || [];
    const now = new Date();
    return participations.filter((p) => {
      return (
        p.status === "ACCEPTED" &&
        p.session?.status !== "CANCELLED" &&
        new Date(p.session?.startAt) > now
      );
    }).length;
  }, [participationsData]);

  // Helper de badge selon l'onglet
  const getBadge = (to) => {
    if (to === "/my-sessions" && pendingRequestsCount > 0) {
      return {
        count: pendingRequestsCount,
        color: "bg-blue-600 text-white",
      };
    }
    if (to === "/my-participations" && acceptedParticipationsCount > 0) {
      return {
        count: acceptedParticipationsCount,
        color: "bg-emerald-600 text-white",
      };
    }
    return null;
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col pb-20 md:pb-6 text-slate-900 font-sans">
      {/* Barre de navigation superieure (Desktop) */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2.5 font-extrabold text-xl text-slate-900 tracking-tight select-none active:scale-[0.98] transition-transform"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
              <Dumbbell className="w-5 h-5" />
            </div>
            <span>GymOn</span>
          </Link>

          {/* Liens de navigation Desktop */}
          <nav className="hidden md:flex items-center gap-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const badge = getBadge(item.to);

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all select-none active:scale-[0.97] ${
                      isActive
                        ? "bg-blue-50 text-blue-700 shadow-xs border border-blue-200/50"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-transparent"
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {badge && (
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none shadow-xs ${badge.color}`}
                    >
                      {badge.count}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Raccourci Profil Desktop */}
          <div className="hidden md:flex items-center">
            <Link
              to="/profile"
              className="flex items-center gap-2.5 p-1.5 pl-3 rounded-full bg-slate-100/80 hover:bg-slate-200/60 border border-slate-200/60 transition-all select-none active:scale-[0.98]"
            >
              <span className="text-xs font-semibold text-slate-700">
                {user?.firstName || "Athlète"}
              </span>
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {(user?.firstName || "U")[0].toUpperCase()}
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Contenu dynamique de la page */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* Barre de navigation basse (Mobile - Bottom Navigation Bar) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/80 pb-[env(safe-area-inset-bottom)] shadow-lg">
        <div className="grid grid-cols-4 h-16">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const badge = getBadge(item.to);

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 transition-transform duration-100 active:scale-[0.92] select-none relative ${
                    isActive
                      ? "text-blue-600 font-bold"
                      : "text-slate-400 hover:text-slate-600 font-medium"
                  }`
                }
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {badge && (
                    <span
                      className={`absolute -top-1.5 -right-2.5 min-w-[15px] h-3.5 px-1 rounded-full text-[9px] font-black flex items-center justify-center leading-none shadow-xs ${badge.color}`}
                    >
                      {badge.count}
                    </span>
                  )}
                </div>
                <span className="text-[11px] tracking-tight">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
