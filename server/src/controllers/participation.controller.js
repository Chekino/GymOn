import { z } from "zod";
import {
  requestToJoinSession,
  listSessionParticipations,
  getUserParticipations,
} from "../services/participation.service.js";

/**
 * Schemas de validation Zod pour les parametres d'URL des participations.
 */
const sessionIdParamSchema = z.uuid({ error: "Invalid session ID format" });

/**
 * Couche Controller pour les participations.
 * Recoit les requetes HTTP, valide les parametres et delegue aux services.
 */

export async function createParticipation(req, res, next) {
  try {
    const result = sessionIdParamSchema.safeParse(req.params.id);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid session ID parameter",
          details: result.error.issues.map((issue) => ({
            field: "id",
            message: issue.message,
          })),
        },
      });
    }

    const participation = await requestToJoinSession({
      sessionId: result.data,
      userId: req.user.id,
    });

    return res.status(201).json({
      success: true,
      data: { participation },
    });
  } catch (error) {
    next(error);
  }
}

export async function getSessionParticipations(req, res, next) {
  try {
    const result = sessionIdParamSchema.safeParse(req.params.id);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid session ID parameter",
          details: result.error.issues.map((issue) => ({
            field: "id",
            message: issue.message,
          })),
        },
      });
    }

    const participations = await listSessionParticipations({
      sessionId: result.data,
      userId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      data: { participations },
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyParticipations(req, res, next) {
  try {
    const participations = await getUserParticipations(req.user.id);

    return res.status(200).json({
      success: true,
      data: { participations },
    });
  } catch (error) {
    next(error);
  }
}
