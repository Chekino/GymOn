import apiClient from "./apiClient.js";

/**
 * Appels API REST pour le profil utilisateur (/api/v1/users).
 */

export async function getMe() {
  const response = await apiClient.get("/users/me");
  return response.data;
}

export async function updateMe(userData) {
  const response = await apiClient.patch("/users/me", userData);
  return response.data;
}

export async function deleteMe() {
  const response = await apiClient.delete("/users/me");
  return response.data;
}
