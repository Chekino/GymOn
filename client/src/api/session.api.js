import apiClient from "./apiClient.js";

/**
 * Appels API REST pour le domaine Seances (/api/v1/sessions).
 */

export async function listSessions(filters = {}) {
  const response = await apiClient.get("/sessions", { params: filters });
  return response.data;
}

export async function getSessionById(id) {
  const response = await apiClient.get(`/sessions/${id}`);
  return response.data;
}

export async function createSession(sessionData) {
  const response = await apiClient.post("/sessions", sessionData);
  return response.data;
}

export async function updateSession(id, updateData) {
  const response = await apiClient.patch(`/sessions/${id}`, updateData);
  return response.data;
}

export async function getMyHostedSessions() {
  const response = await apiClient.get("/users/me/sessions");
  return response.data;
}
