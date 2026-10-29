import {
  findUserById,
  updateUser,
  softDeleteUser,
} from "../repositories/user.repository.js";
import { logoutUser } from "./auth.service.js";

/**
 * Couche Service pour la gestion des utilisateurs.
 * Contient la logique metier liee au profil.
 */

export async function getUserProfile(userId) {
  const user = await findUserById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    error.code = "USER_NOT_FOUND";
    throw error;
  }

  const { passwordHash: _, ...safeUser } = user;
  return safeUser;
}

export async function updateUserProfile(userId, updateData) {
  // Verification de l'existence de l'utilisateur actif
  const existingUser = await findUserById(userId);
  if (!existingUser) {
    const error = new Error("User not found");
    error.statusCode = 404;
    error.code = "USER_NOT_FOUND";
    throw error;
  }

  // Mise a jour en base via le repository
  const updatedUser = await updateUser(userId, updateData);

  const { passwordHash: _, ...safeUser } = updatedUser;
  return safeUser;
}

export async function deleteUserAccount(userId, token, tokenPayload) {
  const existingUser = await findUserById(userId);
  if (!existingUser) {
    const error = new Error("User not found");
    error.statusCode = 404;
    error.code = "USER_NOT_FOUND";
    throw error;
  }

  // Soft delete : marquage avec date de suppression sans perte immediate
  await softDeleteUser(userId);

  // Revocation du token actif pour couper immediatement la session
  if (token && tokenPayload) {
    await logoutUser(token, tokenPayload);
  }
}
