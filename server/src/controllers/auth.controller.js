import { z } from "zod";
import { registerUser, loginUser } from "../services/auth.service.js";

/**
 * Schema de validation Zod pour l'inscription.
 * Valide les entrees des la frontiere HTTP pour proteger l'application.
 */
const signupSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email({ error: "Invalid email address" })),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  firstName: z.string().trim().min(1, "First name is required").max(50),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  sports: z.array(z.string().trim()).optional(),
  bio: z.string().trim().max(500).optional(),
});

/**
 * Schema de validation Zod pour la connexion.
 */
const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email({ error: "Invalid email address" })),
  password: z.string().min(1, "Password is required"),
});

/**
 * Couche Controller pour l'inscription.
 * Responsabilite exclusive : HTTP (lecture de req, validation, choix du statut et reponse).
 */
export async function signup(req, res, next) {
  try {
    const result = signupSchema.safeParse(req.body);

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

    const user = await registerUser(result.data);

    return res.status(201).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Couche Controller pour la connexion.
 */
export async function login(req, res, next) {
  try {
    const result = loginSchema.safeParse(req.body);

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

    const { token, user } = await loginUser(result.data);

    return res.status(200).json({
      success: true,
      data: {
        token,
        user,
      },
    });
  } catch (error) {
    next(error);
  }
}
