import prisma from "../config/db.js";

/**
 * Couche Repository pour l'entite User.
 * Seul endroit autorise a communiquer avec Prisma pour les utilisateurs.
 */

export async function findUserByEmail(email) {
  return prisma.user.findFirst({
    where: {
      email,
      deletedAt: null,
    },
  });
}

export async function findUserById(id) {
  return prisma.user.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });
}

export async function createUser(data) {
  return prisma.user.create({
    data,
  });
}

export async function updateUser(id, data) {
  return prisma.user.update({
    where: { id },
    data,
  });
}

export async function softDeleteUser(id) {
  return prisma.user.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
}
