import {
  createSession as createSessionInDb,
  findSessionById,
  findSessions,
  updateSession as updateSessionInDb,
  cancelSessionWithParticipations,
  findSessionsByHost,
} from "../repositories/session.repository.js";
import { findGymById } from "../repositories/gym.repository.js";

/**
 * Couche Service pour les seances.
 * Contient l'ensemble des regles metier (capacite, date future, verification de salle).
 */

export async function createSession({
  hostId,
  gymId,
  startAt,
  durationMinutes,
  activityType,
  level,
  capacity,
}) {
  // Verification de l'existence de la salle cible
  const gym = await findGymById(gymId);
  if (!gym) {
    const error = new Error("Gym not found");
    error.statusCode = 404;
    error.code = "GYM_NOT_FOUND";
    throw error;
  }

  // La seance doit obligatoirement debuter dans le futur
  const startDate = new Date(startAt);
  if (startDate <= new Date()) {
    const error = new Error("Session start date must be in the future");
    error.statusCode = 400;
    error.code = "START_DATE_MUST_BE_FUTURE";
    throw error;
  }

  // Regle metier : capacite strictement limitee a 2 ou 3 personnes au total
  if (![2, 3].includes(capacity)) {
    const error = new Error("Capacity must be strictly 2 or 3 persons (host included)");
    error.statusCode = 400;
    error.code = "INVALID_CAPACITY";
    throw error;
  }

  return createSessionInDb({
    hostId,
    gymId,
    startAt: startDate,
    durationMinutes,
    activityType: activityType.trim(),
    level,
    capacity,
  });
}

export async function getSessionById(id) {
  const session = await findSessionById(id);

  if (!session) {
    const error = new Error("Session not found");
    error.statusCode = 404;
    error.code = "SESSION_NOT_FOUND";
    throw error;
  }

  return session;
}

export async function listSessions(filters) {
  const limit = filters.limit
    ? Math.min(Math.max(Number(filters.limit), 1), 100)
    : 20;

  return findSessions({
    ...filters,
    limit,
  });
}

export async function updateSessionByHost({ sessionId, userId, updateData }) {
  const session = await findSessionById(sessionId);

  if (!session) {
    const error = new Error("Session not found");
    error.statusCode = 404;
    error.code = "SESSION_NOT_FOUND";
    throw error;
  }

  // Controle des droits : seul l'hote peut modifier ou annuler sa seance
  if (session.hostId !== userId) {
    const error = new Error("Forbidden: only the host can modify this session");
    error.statusCode = 403;
    error.code = "FORBIDDEN_NOT_HOST";
    throw error;
  }

  // Une seance terminee ou deja annulee ne peut plus etre modifiee
  if (session.status === "CANCELLED" || session.status === "DONE") {
    const error = new Error("Cannot modify a cancelled or completed session");
    error.statusCode = 400;
    error.code = "CANNOT_MODIFY_FINISHED_OR_CANCELLED_SESSION";
    throw error;
  }

  // Traitement specifique de l'annulation
  if (updateData.status === "CANCELLED") {
    return cancelSessionWithParticipations(sessionId);
  }

  const cleanData = {};

  if (updateData.startAt) {
    const startDate = new Date(updateData.startAt);
    if (startDate <= new Date()) {
      const error = new Error("Session start date must be in the future");
      error.statusCode = 400;
      error.code = "START_DATE_MUST_BE_FUTURE";
      throw error;
    }
    cleanData.startAt = startDate;
  }

  if (updateData.durationMinutes) {
    cleanData.durationMinutes = updateData.durationMinutes;
  }

  if (updateData.activityType) {
    cleanData.activityType = updateData.activityType.trim();
  }

  if (updateData.level) {
    cleanData.level = updateData.level;
  }

  if (updateData.capacity) {
    // La capacite ne peut pas etre reduite en dessous des participants deja acceptes
    const acceptedCount = session.participations.length;
    const requiredTotalCapacity = acceptedCount + 1;

    if (updateData.capacity < requiredTotalCapacity) {
      const error = new Error(
        `Cannot reduce capacity to ${updateData.capacity}: ${acceptedCount} participants are already accepted`
      );
      error.statusCode = 409;
      error.code = "CANNOT_REDUCE_CAPACITY_BELOW_ACCEPTED";
      throw error;
    }

    cleanData.capacity = updateData.capacity;
  }

  return updateSessionInDb(sessionId, cleanData);
}

export async function getUserHostedSessions(userId) {
  return findSessionsByHost(userId);
}
