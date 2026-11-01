import apiClient from "./apiClient.js";

/**
 * Appels API REST pour le domaine Participations (/api/v1).
 */

export async function requestToJoinSession(sessionId) {
  const response = await apiClient.post(`/sessions/${sessionId}/participations`);
  return response.data;
}

export async function getSessionParticipations(sessionId) {
  const response = await apiClient.get(`/sessions/${sessionId}/participations`);
  return response.data;
}

export async function getMyParticipations() {
  const response = await apiClient.get("/users/me/participations");
  return response.data;
}

export async function updateParticipationStatus(participationId, status) {
  const response = await apiClient.patch(`/participations/${participationId}`, {
    status,
  });
  return response.data;
}
