import prisma from "../config/db.js";

/**
 * Couche Repository pour les seances (Sessions).
 * Seul endroit autorise a communiquer avec Prisma pour la table sessions.
 */

const hostPublicSelect = {
  id: true,
  firstName: true,
  level: true,
  sports: true,
  bio: true,
};

export async function createSession(data) {
  return prisma.session.create({
    data,
    include: {
      gym: true,
      host: {
        select: hostPublicSelect,
      },
    },
  });
}

export async function findSessionById(id) {
  return prisma.session.findUnique({
    where: { id },
    include: {
      gym: true,
      host: {
        select: hostPublicSelect,
      },
      participations: {
        where: {
          status: "ACCEPTED",
        },
        include: {
          user: {
            select: hostPublicSelect,
          },
        },
      },
    },
  });
}

export async function findSessions({
  gymId,
  from,
  to,
  level,
  status = "OPEN",
  limit = 20,
}) {
  const where = {
    status,
  };

  if (gymId) {
    where.gymId = gymId;
  }

  if (level) {
    where.level = level;
  }

  // Filtrage par date de debut
  if (from && to) {
    where.startAt = {
      gte: new Date(from),
      lte: new Date(to),
    };
  } else if (from) {
    where.startAt = {
      gte: new Date(from),
    };
  } else if (to) {
    where.startAt = {
      lte: new Date(to),
    };
  } else {
    // Par defaut, n'afficher que les seances a venir
    where.startAt = {
      gte: new Date(),
    };
  }

  return prisma.session.findMany({
    where,
    include: {
      gym: true,
      host: {
        select: hostPublicSelect,
      },
    },
    orderBy: {
      startAt: "asc",
    },
    take: limit,
  });
}
