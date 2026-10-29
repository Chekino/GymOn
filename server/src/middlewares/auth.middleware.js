import { verifyToken } from "../utils/token.js";

/**
 * Middleware d'authentification par jeton Bearer JWT.
 * Intercepte la requete pour verifier l'en-tete Authorization et extraire l'utilisateur.
 */
export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  // L'en-tete Authorization doit exister et commencer par Bearer
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Missing or malformed authorization header",
      },
    });
  }

  const token = authHeader.slice(7).trim();

  try {
    // Verification cryptographique de la signature et de la validite temporelle
    const decoded = verifyToken(token);
    req.user = { id: decoded.userId };
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        code: "INVALID_OR_EXPIRED_TOKEN",
        message: "Provided token is invalid or has expired",
      },
    });
  }
}
