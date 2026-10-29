import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

/**
 * Genere un jeton JWT signe avec l'identifiant de l'utilisateur.
 * @param {object} payload - Donnees a inclure dans le jeton (ex: { userId: user.id })
 * @returns {string} Le jeton JWT signe
 */
export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Verifie et decode un jeton JWT.
 * @param {string} token - Le jeton a verifier
 * @returns {object} Le contenu decode du jeton
 * @throws {JsonWebTokenError|TokenExpiredError} Si le jeton est invalide ou expire
 */
export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}
