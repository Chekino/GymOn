import { z } from "zod";
import {
  suggestGym,
  getGymDetails,
  searchGyms,
} from "../services/gym.service.js";

/**
 * Schemas de validation Zod pour les salles de sport.
 */
const createGymSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  address: z.string().trim().min(1, "Address is required").max(200),
  city: z.string().trim().min(1, "City is required").max(100),
  latitude: z.number().min(-90, "Latitude must be between -90 and 90").max(90),
  longitude: z.number().min(-180, "Longitude must be between -180 and 180").max(180),
});

const listGymsQuerySchema = z.object({
  near: z
    .string()
    .regex(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/, "Invalid near format. Expected 'lat,lng'")
    .optional(),
  radius: z.coerce.number().positive("Radius must be a positive number").optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

/**
 * Couche Controller pour les salles de sport.
 */

export async function create(req, res, next) {
  try {
    const result = createGymSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid gym data",
          details: result.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        },
      });
    }

    const gym = await suggestGym(result.data);

    return res.status(201).json({
      success: true,
      data: { gym },
    });
  } catch (error) {
    next(error);
  }
}

export async function getById(req, res, next) {
  try {
    const gym = await getGymDetails(req.params.id);

    return res.status(200).json({
      success: true,
      data: { gym },
    });
  } catch (error) {
    next(error);
  }
}

export async function list(req, res, next) {
  try {
    const result = listGymsQuerySchema.safeParse(req.query);

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

    const gyms = await searchGyms(result.data);

    return res.status(200).json({
      success: true,
      data: { gyms },
    });
  } catch (error) {
    next(error);
  }
}
