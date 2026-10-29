import { verifyToken, hashToken } from "../utils/token.js";
import { isTokenRevoked } from "../repositories/token.repository.js";

/**
 * Middleware d'authentification par jeton Bearer JWT.
 * Intercepte la requete pour verifier l'en-tete Authorization, s'assurer que le token n'est pas revoque et extraire l'utilisateur.
 */
export async function authenticate(req, res, next) {
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
  let decoded;

  try {
    // Verification cryptographique de la signature et de la validite temporelle
    decoded = verifyToken(token);
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        code: "INVALID_OR_EXPIRED_TOKEN",
        message: "Provided token is invalid or has expired",
      },
    });
  }

  try {
    // Verification contre la liste de revocation (blacklist)
    const tokenHash = hashToken(token);
    const isRevoked = await isTokenRevoked(tokenHash);

    if (isRevoked) {
      return res.status(401).json({
        success: false,
        error: {
          code: "TOKEN_REVOKED",
          message: "This token has been revoked",
        },
      });
    }

    req.user = { id: decoded.userId };
    req.token = token;
    req.tokenPayload = decoded;
    return next();
  } catch (error) {
    next(error);
  }
}
