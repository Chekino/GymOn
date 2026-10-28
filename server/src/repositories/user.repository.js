import prisma from "../config/db.js";

/**
 * Couche Repository pour l'entite User.
 * Seul endroit autorise a communiquer avec Prisma pour les utilisateurs.
 */

export async function findUserByEmail(email) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function findUserById(id) {
  return prisma.user.findUnique({
    where: { id },
  });
}

export async function createUser(data) {
  return prisma.user.create({
    data,
  });
}
