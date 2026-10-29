import React from "react";
import { Dumbbell, Sparkles } from "lucide-react";

export default function App() {
  return (
    <main className="min-h-[100dvh] flex flex-col items-center justify-center p-6 bg-zinc-950 text-zinc-100">
      <div className="max-w-md w-full bg-zinc-900/80 border border-zinc-800 rounded-2xl p-8 backdrop-blur-md shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <Dumbbell className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            GymOn <Sparkles className="w-5 h-5 text-emerald-400" />
          </h1>
          <p className="text-sm text-zinc-400">
            Trouvez votre partenaire de musculation selon vos disponibilites et
            vos salles.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            className="w-full py-3 px-4 rounded-xl font-medium bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-transform duration-120 active:scale-[0.97] select-none"
          >
            Socle Frontend Initialise
          </button>
        </div>
      </div>
    </main>
  );
}
