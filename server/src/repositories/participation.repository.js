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

export async function findParticipationById(id) {
  return prisma.participation.findUnique({
    where: { id },
    include: {
      session: true,
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

export async function acceptParticipationInTransaction({
  participationId,
  sessionId,
  maxParticipants,
}) {
  return prisma.$transaction(async (tx) => {
    // Verrouillage FOR UPDATE sur la seance pour eviter toute concurrence simultanee
    await tx.$queryRaw`SELECT id FROM sessions WHERE id = ${sessionId}::uuid FOR UPDATE`;

    const acceptedCount = await tx.participation.count({
      where: {
        sessionId,
        status: "ACCEPTED",
      },
    });

    if (acceptedCount >= maxParticipants) {
      const error = new Error("Session is already full");
      error.statusCode = 409;
      error.code = "SESSION_IS_FULL";
      throw error;
    }

    const updatedParticipation = await tx.participation.update({
      where: { id: participationId },
      data: { status: "ACCEPTED" },
      include: {
        user: {
          select: participantPublicSelect,
        },
      },
    });

    // Si le quota de participants est atteint, bascule automatique de la seance a FULL
    if (acceptedCount + 1 >= maxParticipants) {
      await tx.session.update({
        where: { id: sessionId },
        data: { status: "FULL" },
      });
    }

    return updatedParticipation;
  });
}

export async function cancelParticipationInTransaction({
  participationId,
  sessionId,
  wasAccepted,
}) {
  return prisma.$transaction(async (tx) => {
    // Verrouillage FOR UPDATE sur la seance
    await tx.$queryRaw`SELECT id FROM sessions WHERE id = ${sessionId}::uuid FOR UPDATE`;

    const updatedParticipation = await tx.participation.update({
      where: { id: participationId },
      data: { status: "CANCELLED" },
      include: {
        user: {
          select: participantPublicSelect,
        },
      },
    });

    // Si le participant etait accepte, la liberation de place peut rouvrir la seance
    if (wasAccepted) {
      const currentSession = await tx.session.findUnique({
        where: { id: sessionId },
        select: { status: true },
      });

      if (currentSession && currentSession.status === "FULL") {
        await tx.session.update({
          where: { id: sessionId },
          data: { status: "OPEN" },
        });
      }
    }

    return updatedParticipation;
  });
}
