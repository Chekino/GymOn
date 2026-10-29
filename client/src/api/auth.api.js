import apiClient from "./apiClient.js";

/**
 * Appels API REST pour le domaine Authentification.
 * Communique avec les endpoints /api/v1/auth.
 */

export async function signup(userData) {
  const response = await apiClient.post("/auth/signup", userData);
  return response.data;
}

export async function login(credentials) {
  const response = await apiClient.post("/auth/login", credentials);
  return response.data;
}

export async function logout() {
  const response = await apiClient.post("/auth/logout");
  return response.data;
}
