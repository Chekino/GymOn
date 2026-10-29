import prisma from "../config/db.js";

/**
 * Couche Repository pour les participations.
 * Seul endroit autorise a communiquer avec Prisma pour la table participations.
 */

const participantPublicSelect = {
  id: true,
  firstName: true,
  level: true,
  sports: true,
  bio: true,
};

export async function createParticipation({ sessionId, userId }) {
  return prisma.participation.create({
    data: {
      sessionId,
      userId,
      status: "PENDING",
    },
    include: {
      user: {
        select: participantPublicSelect,
      },
    },
  });
}

export async function findParticipationBySessionAndUser(sessionId, userId) {
  return prisma.participation.findUnique({
    where: {
      sessionId_userId: {
        sessionId,
        userId,
      },
    },
  });
}

export async function findParticipationsBySessionId(sessionId) {
  return prisma.participation.findMany({
    where: { sessionId },
    include: {
      user: {
        select: participantPublicSelect,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

export async function findParticipationsByUserId(userId) {
  return prisma.participation.findMany({
    where: { userId },
    include: {
      session: {
        select: {
          id: true,
          startAt: true,
          durationMinutes: true,
          activityType: true,
          level: true,
          capacity: true,
          status: true,
          gym: {
            select: {
              id: true,
              name: true,
              address: true,
              city: true,
            },
          },
          host: {
            select: {
              id: true,
              firstName: true,
              level: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function updateParticipationStatus(id, status) {
  return prisma.participation.update({
    where: { id },
    data: { status },
    include: {
      user: {
        select: participantPublicSelect,
      },
    },
  });
}
