import {
  createParticipation,
  findParticipationById,
  findParticipationBySessionAndUser,
  findParticipationsBySessionId,
  findParticipationsByUserId,
  updateParticipationStatus,
  acceptParticipationInTransaction,
  cancelParticipationInTransaction,
} from "../repositories/participation.repository.js";
import { findSessionById } from "../repositories/session.repository.js";

/**
 * Couche Service pour les participations.
 * Contient les regles metier (verification hote, unicite, disponibilite de la seance, concurrence).
 */

export async function requestToJoinSession({ sessionId, userId }) {
  const session = await findSessionById(sessionId);

  if (!session) {
    const error = new Error("Session not found");
    error.statusCode = 404;
    error.code = "SESSION_NOT_FOUND";
    throw error;
  }

  // Un hote ne peut pas postuler a sa propre seance
  if (session.hostId === userId) {
    const error = new Error("Host cannot join their own session");
    error.statusCode = 403;
    error.code = "HOST_CANNOT_PARTICIPATE";
    throw error;
  }

  // La seance doit etre au statut OPEN
  if (session.status !== "OPEN") {
    const error = new Error("Session is not open for participations");
    error.statusCode = 400;
    error.code = "SESSION_NOT_OPEN";
    throw error;
  }

  // La seance doit debuter dans le futur
  if (new Date(session.startAt) <= new Date()) {
    const error = new Error("Cannot join a session in the past or already started");
    error.statusCode = 400;
    error.code = "SESSION_ALREADY_STARTED";
    throw error;
  }

  // Verification des demandes prealables
  const existing = await findParticipationBySessionAndUser(sessionId, userId);
  if (existing) {
    if (existing.status === "PENDING") {
      const error = new Error("You have already requested to join this session");
      error.statusCode = 409;
      error.code = "ALREADY_REQUESTED";
      throw error;
    }

    if (existing.status === "ACCEPTED") {
      const error = new Error("You are already accepted in this session");
      error.statusCode = 409;
      error.code = "ALREADY_ACCEPTED";
      throw error;
    }

    if (existing.status === "DECLINED") {
      const error = new Error("Your participation request was declined by the host");
      error.statusCode = 409;
      error.code = "REQUEST_DECLINED";
      throw error;
    }

    if (existing.status === "CANCELLED") {
      // Reouverture d'une candidature precedemment annulee
      return updateParticipationStatus(existing.id, "PENDING");
    }
  }

  return createParticipation({
    sessionId,
    userId,
  });
}

export async function listSessionParticipations({ sessionId, userId }) {
  const session = await findSessionById(sessionId);

  if (!session) {
    const error = new Error("Session not found");
    error.statusCode = 404;
    error.code = "SESSION_NOT_FOUND";
    throw error;
  }

  // Seul l'hote de la seance a le droit de consulter l'ensemble des demandes recues
  if (session.hostId !== userId) {
    const error = new Error("Only the session host can view participation requests");
    error.statusCode = 403;
    error.code = "FORBIDDEN";
    throw error;
  }

  return findParticipationsBySessionId(sessionId);
}

export async function getUserParticipations(userId) {
  return findParticipationsByUserId(userId);
}

export async function updateParticipationStatusByParty({
  participationId,
  userId,
  newStatus,
}) {
  const participation = await findParticipationById(participationId);

  if (!participation) {
    const error = new Error("Participation not found");
    error.statusCode = 404;
    error.code = "PARTICIPATION_NOT_FOUND";
    throw error;
  }

  // Interdiction de modifier une participation sur une seance annulee
  if (participation.session.status === "CANCELLED") {
    const error = new Error("Session is cancelled");
    error.statusCode = 400;
    error.code = "SESSION_CANCELLED";
    throw error;
  }

  // Interdiction de modifier une participation sur une seance passee
  if (new Date(participation.session.startAt) <= new Date()) {
    const error = new Error("Cannot modify participation for a past session");
    error.statusCode = 400;
    error.code = "SESSION_ALREADY_STARTED";
    throw error;
  }

  const isHost = participation.session.hostId === userId;
  const isParticipant = participation.userId === userId;

  if (isHost) {
    if (!["ACCEPTED", "DECLINED"].includes(newStatus)) {
      const error = new Error("Host can only accept or decline participation requests");
      error.statusCode = 403;
      error.code = "FORBIDDEN";
      throw error;
    }

    if (participation.status !== "PENDING") {
      const error = new Error("Only pending participations can be accepted or declined");
      error.statusCode = 400;
      error.code = "INVALID_STATUS_TRANSITION";
      throw error;
    }

    if (newStatus === "ACCEPTED") {
      // Capacite maximale de participants = capacite totale moins 1 (l'hote)
      const maxParticipants = participation.session.capacity - 1;

      return acceptParticipationInTransaction({
        participationId,
        sessionId: participation.sessionId,
        maxParticipants,
      });
    }

    return updateParticipationStatus(participationId, "DECLINED");
  }

  if (isParticipant) {
    if (newStatus !== "CANCELLED") {
      const error = new Error("Participant can only cancel their own participation");
      error.statusCode = 403;
      error.code = "FORBIDDEN";
      throw error;
    }

    if (!["PENDING", "ACCEPTED"].includes(participation.status)) {
      const error = new Error("Participation is already finalized and cannot be cancelled");
      error.statusCode = 400;
      error.code = "INVALID_STATUS_TRANSITION";
      throw error;
    }

    return cancelParticipationInTransaction({
      participationId,
      sessionId: participation.sessionId,
      wasAccepted: participation.status === "ACCEPTED",
    });
  }

  const error = new Error("You are not authorized to update this participation");
  error.statusCode = 403;
  error.code = "FORBIDDEN";
  throw error;
}
