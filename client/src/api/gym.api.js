import apiClient from "./apiClient.js";

/**
 * Appels API REST pour le domaine Salles de sport (/api/v1/gyms).
 */

export async function listGyms(params = {}) {
  const response = await apiClient.get("/gyms", { params });
  return response.data;
}

export async function getGymById(id) {
  const response = await apiClient.get(`/gyms/${id}`);
  return response.data;
}
