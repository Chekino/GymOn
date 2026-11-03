import React from "react";
import { Link } from "react-router-dom";
import { Dumbbell, ArrowLeft } from "lucide-react";
import PageTransition from "../../components/common/PageTransition.jsx";

/**
 * Page 404 athletique pour les routes inexistantes.
 */
export default function NotFoundPage() {
  return (
    <PageTransition>
      <div className="min-h-[60dvh] flex flex-col items-center justify-center text-center px-6 py-12">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-6 shadow-xs">
          <Dumbbell className="w-8 h-8" />
        </div>

        <h1 className="text-6xl font-black text-slate-900 tracking-tighter">
          404
        </h1>
        <p className="text-lg font-bold text-slate-700 mt-2">
          Page introuvable
        </p>
        <p className="text-sm text-slate-500 mt-1 max-w-xs">
          Cette page n'existe pas ou a été déplacée. Revenez sur le terrain !
        </p>

        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 py-3 px-6 rounded-2xl font-bold text-sm bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white transition-all shadow-sm shadow-blue-500/20 select-none"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux séances</span>
        </Link>
      </div>
    </PageTransition>
  );
}
