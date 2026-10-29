import { Router } from "express";
import { create, getById, list, update } from "../controllers/session.controller.js";
import {
  createParticipation,
  getSessionParticipations,
} from "../controllers/participation.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

/**
 * Couche Routes pour les seances.
 * Toutes les routes necessitant d'etre connecte utilisent le middleware authenticate.
 */
const router = Router();

router.get("/", authenticate, list);
router.get("/:id", authenticate, getById);
router.post("/", authenticate, create);
router.patch("/:id", authenticate, update);

router.post("/:id/participations", authenticate, createParticipation);
router.get("/:id/participations", authenticate, getSessionParticipations);

export default router;
