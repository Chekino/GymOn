import { findUserById } from "../repositories/user.repository.js";

/**
 * Couche Service pour la gestion des utilisateurs.
 * Contient la logique metier liee au profil.
 */

export async function getUserProfile(userId) {
  // Recuperation de l'utilisateur par son identifiant unique
  const user = await findUserById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    error.code = "USER_NOT_FOUND";
    throw error;
  }

  // Ne jamais divulguer le hash du mot de passe
  const { passwordHash: _, ...safeUser } = user;
  return safeUser;
}
