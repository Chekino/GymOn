import bcrypt from "bcrypt";
import {
  findUserByEmail,
  createUser,
} from "../repositories/user.repository.js";
import { generateToken, hashToken } from "../utils/token.js";
import { createRevokedToken } from "../repositories/token.repository.js";

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
  // L'adresse email doit etre unique
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    const error = new Error("Email already registered");
    error.statusCode = 409;
    error.code = "EMAIL_ALREADY_EXISTS";
    throw error;
  }

  // Hachage a sens unique du mot de passe avec sel
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

  // Ne jamais exposer le hash du mot de passe dans les reponses
  const { passwordHash: _, ...safeUser } = createdUser;
  return safeUser;
}

export async function loginUser({ email, password }) {
  // Recherche de l'utilisateur par son email
  const user = await findUserByEmail(email);
  if (!user) {
    // Protection anti-enumeration OWASP avec reponse generique
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    error.code = "INVALID_CREDENTIALS";
    throw error;
  }

  // Verification securisee du mot de passe avec le hash stocke
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    error.code = "INVALID_CREDENTIALS";
    throw error;
  }

  // Generation du jeton JWT signe avec l'identifiant utilisateur
  const token = generateToken({ userId: user.id });

  // Retrait du hash du mot de passe pour la reponse
  const { passwordHash: _, ...safeUser } = user;

  return {
    token,
    user: safeUser,
  };
}

export async function logoutUser(token, decoded) {
  // Calcul de l'empreinte SHA-256 du token
  const tokenHash = hashToken(token);

  // Date d'expiration extraite du payload JWT (exp en secondes vers millisecondes)
  const expiresAt = new Date(decoded.exp * 1000);

  // Enregistrement dans la table des tokens revoques
  await createRevokedToken({ tokenHash, expiresAt });
}
