import { z } from "zod";
import {
  createSession,
  getSessionById,
  listSessions,
  updateSessionByHost,
  getUserHostedSessions,
} from "../services/session.service.js";

/**
 * Schemas de validation Zod pour les seances.
 */
const createSessionSchema = z.object({
  gymId: z.uuid({ error: "Invalid gym ID format" }),
  startAt: z.iso.datetime({ error: "startAt must be a valid ISO 8601 date string" }),
  durationMinutes: z
    .number()
    .int()
    .min(15, "Duration must be at least 15 minutes")
    .max(360, "Duration cannot exceed 6 hours"),
  activityType: z.string().trim().min(1, "Activity type is required").max(100),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  capacity: z.union([z.literal(2), z.literal(3)], {
    error: "Capacity must be strictly 2 or 3 persons (host included)",
  }),
});

const listSessionsQuerySchema = z.object({
  gymId: z.uuid().optional(),
  from: z.iso.datetime().optional(),
  to: z.iso.datetime().optional(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  status: z.enum(["OPEN", "FULL", "CANCELLED", "DONE"]).optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

const updateSessionSchema = z.object({
  startAt: z.iso.datetime({ error: "startAt must be a valid ISO 8601 date string" }).optional(),
  durationMinutes: z
    .number()
    .int()
    .min(15, "Duration must be at least 15 minutes")
    .max(360, "Duration cannot exceed 6 hours")
    .optional(),
  activityType: z.string().trim().min(1).max(100).optional(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  capacity: z.union([z.literal(2), z.literal(3)], {
    error: "Capacity must be strictly 2 or 3 persons (host included)",
  }),
  status: z.enum(["OPEN", "CANCELLED"]).optional(),
}).partial();

/**
 * Couche Controller pour les seances.
 */

export async function create(req, res, next) {
  try {
    const result = createSessionSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid session data",
          details: result.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        },
      });
    }

    // req.user.id est garanti par le middleware authenticate
    const session = await createSession({
      ...result.data,
      hostId: req.user.id,
    });

    return res.status(201).json({
      success: true,
      data: { session },
    });
  } catch (error) {
    next(error);
  }
}

export async function getById(req, res, next) {
  try {
    const session = await getSessionById(req.params.id);

    return res.status(200).json({
      success: true,
      data: { session },
    });
  } catch (error) {
    next(error);
  }
}

export async function list(req, res, next) {
  try {
    const result = listSessionsQuerySchema.safeParse(req.query);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid query parameters",
          details: result.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        },
      });
    }

    const sessions = await listSessions(result.data);

    return res.status(200).json({
      success: true,
      data: { sessions },
    });
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    const result = updateSessionSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid session update data",
          details: result.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        },
      });
    }

    const session = await updateSessionByHost({
      sessionId: req.params.id,
      userId: req.user.id,
      updateData: result.data,
    });

    return res.status(200).json({
      success: true,
      data: { session },
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyHostedSessions(req, res, next) {
  try {
    const sessions = await getUserHostedSessions(req.user.id);

    return res.status(200).json({
      success: true,
      data: { sessions },
    });
  } catch (error) {
    next(error);
  }
}
