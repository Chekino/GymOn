import axios from "axios";

/**
 * Client HTTP centralise base sur Axios.
 * Configure avec l'URL de base de l'API et intercepteurs d'authentification.
 */
const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Intercepteur pour injecter automatiquement le token JWT dans chaque requete sortante
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("gymon_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gerer les reponses d'erreur globales (notamment token expire ou revoque 401)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Purge du stockage local en cas de session invalide
      localStorage.removeItem("gymon_token");
      localStorage.removeItem("gymon_user");

      // Redirection vers la page de connexion si on n'y est pas deja
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
