import { z } from "zod";
import {
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
} from "../services/user.service.js";

/**
 * Schema de validation Zod pour la modification du profil.
 * Seules les donnees de profil non sensibles sont modifiables ici.
 */
const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1, "First name cannot be empty").max(50).optional(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  sports: z.array(z.string().trim()).optional(),
  bio: z.string().trim().max(500).optional(),
});

/**
 * Couche Controller pour les utilisateurs.
 * Responsabilite exclusive : HTTP.
 */

export async function getMe(req, res, next) {
  try {
    const user = await getUserProfile(req.user.id);

    return res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateMe(req, res, next) {
  try {
    const result = updateProfileSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid input data",
          details: result.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        },
      });
    }

    const updatedUser = await updateUserProfile(req.user.id, result.data);

    return res.status(200).json({
      success: true,
      data: { user: updatedUser },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteMe(req, res, next) {
  try {
    await deleteUserAccount(req.user.id, req.token, req.tokenPayload);

    return res.status(200).json({
      success: true,
      data: {
        message: "Account deleted successfully",
      },
    });
  } catch (error) {
    next(error);
  }
}
