import { getUserProfile } from "../services/user.service.js";

/**
 * Couche Controller pour les utilisateurs.
 * Responsabilite exclusive : HTTP.
 */

export async function getMe(req, res, next) {
  try {
    // req.user est injecte en amont par le middleware authenticate
    const user = await getUserProfile(req.user.id);

    return res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}
