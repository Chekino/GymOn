import prisma from "../config/db.js";

/**
 * Couche Repository pour les jetons revoques.
 * Seul endroit autorise a interagir avec la table revoked_tokens.
 */

export async function createRevokedToken({ tokenHash, expiresAt }) {
  return prisma.revokedToken.create({
    data: {
      tokenHash,
      expiresAt,
    },
  });
}

export async function isTokenRevoked(tokenHash) {
  const record = await prisma.revokedToken.findUnique({
    where: { tokenHash },
  });

  return Boolean(record);
}
