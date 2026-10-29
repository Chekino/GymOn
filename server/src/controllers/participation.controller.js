import { z } from "zod";
import {
  requestToJoinSession,
  listSessionParticipations,
  getUserParticipations,
  updateParticipationStatusByParty,
} from "../services/participation.service.js";

/**
 * Schemas de validation Zod pour les participations.
 */
const idParamSchema = z.uuid({ error: "Invalid ID format" });

const updateStatusSchema = z.object({
  status: z.enum(["ACCEPTED", "DECLINED", "CANCELLED"], {
    error: "Status must be ACCEPTED, DECLINED, or CANCELLED",
  }),
});

/**
 * Couche Controller pour les participations.
 * Recoit les requetes HTTP, valide les parametres et delegue aux services.
 */

export async function createParticipation(req, res, next) {
  try {
    const result = idParamSchema.safeParse(req.params.id);

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
    const result = idParamSchema.safeParse(req.params.id);

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

export async function updateStatus(req, res, next) {
  try {
    const parsedId = idParamSchema.safeParse(req.params.id);

    if (!parsedId.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid participation ID parameter",
          details: parsedId.error.issues.map((issue) => ({
            field: "id",
            message: issue.message,
          })),
        },
      });
    }

    const parsedBody = updateStatusSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid participation status payload",
          details: parsedBody.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        },
      });
    }

    const participation = await updateParticipationStatusByParty({
      participationId: parsedId.data,
      userId: req.user.id,
      newStatus: parsedBody.data.status,
    });

    return res.status(200).json({
      success: true,
      data: { participation },
    });
  } catch (error) {
    next(error);
  }
}
