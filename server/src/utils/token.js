import jwt from "jsonwebtoken";
import crypto from "node:crypto";

function getJwtSecret() {
  return process.env.JWT_SECRET || "default_dev_secret_change_in_production";
}

function getJwtExpiresIn() {
  return process.env.JWT_EXPIRES_IN || "7d";
}

/**
 * Genere un jeton JWT signe avec l'identifiant de l'utilisateur.
 * @param {object} payload - Donnees a inclure dans le jeton (ex: { userId: user.id })
 * @returns {string} Le jeton JWT signe
 */
export function generateToken(payload) {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: getJwtExpiresIn(),
  });
}

/**
 * Verifie et decode un jeton JWT.
 * @param {string} token - Le jeton a verifier
 * @returns {object} Le contenu decode du jeton
 * @throws {JsonWebTokenError|TokenExpiredError} Si le jeton est invalide ou expire
 */
export function verifyToken(token) {
  return jwt.verify(token, getJwtSecret());
}

/**
 * Calcule l'empreinte cryptographique SHA-256 d'un jeton.
 * Permet d'indexer et stocker le jeton revoque sans conserver sa valeur brute en base.
 * @param {string} token - Le jeton JWT brut
 * @returns {string} Empreinte hexadecimale SHA-256
 */
export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
