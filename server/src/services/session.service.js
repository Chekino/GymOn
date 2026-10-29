import {
  createSession as createSessionInDb,
  findSessionById,
  findSessions,
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
