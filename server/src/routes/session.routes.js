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

// Routes de consultation publiques (catalogue ouvert)
router.get("/", list);
router.get("/:id", getById);

// Routes securisees necessitant une authentification JWT
router.post("/", authenticate, create);
router.patch("/:id", authenticate, update);

router.post("/:id/participations", authenticate, createParticipation);
router.get("/:id/participations", authenticate, getSessionParticipations);

export default router;
