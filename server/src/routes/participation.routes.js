import { Router } from "express";
import { updateStatus } from "../controllers/participation.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

/**
 * Couche Routes pour les participations directes (/api/v1/participations).
 * Route protegee par le middleware authenticate.
 */
const router = Router();

router.patch("/:id", authenticate, updateStatus);

export default router;
