import bcrypt from "bcrypt";
import {
  findUserByEmail,
  createUser,
} from "../repositories/user.repository.js";

const SALT_ROUNDS = 10;

/**
 * Couche Service pour l'authentification.
 * Contient l'ensemble des regles metier (verification, hachage, permissions).
 * N'a aucune connaissance d'Express ni de HTTP (pas de req, res).
 */

export async function registerUser({
  email,
  password,
  firstName,
  level,
  sports,
  bio,
}) {
  // Regle metier : un email doit etre unique
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    const error = new Error("Email already registered");
    error.statusCode = 409;
    error.code = "EMAIL_ALREADY_EXISTS";
    throw error;
  }

  // Regle de securite : hachage a sens unique du mot de passe avec sel
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Persistance via la couche repository
  const createdUser = await createUser({
    email,
    passwordHash,
    firstName,
    level: level || "BEGINNER",
    sports: sports || [],
    bio: bio || null,
  });

  // Regle de vie privee : ne jamais exposer le hash du mot de passe
  const { passwordHash: _, ...safeUser } = createdUser;
  return safeUser;
}
