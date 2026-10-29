import React from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import AppRoutes from "./routes/AppRoutes.jsx";

/**
 * Client TanStack Query pour la gestion du cache et des etats asynchrones distants.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Composant racine de l'application GymOn.
 * Monte les contextes globaux (Routing, React Query, Toaster).
 */
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster position="top-center" richColors />
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
