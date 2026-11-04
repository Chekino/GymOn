import { Router } from "express";
import { create, getById, list } from "../controllers/gym.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

/**
 * Couche Routes pour les salles de sport.
 * Toutes les routes necessitant d'etre connecte utilisent le middleware authenticate.
 */
const router = Router();

// Routes de consultation publiques (catalogue ouvert)
router.get("/", list);
router.get("/:id", getById);

// Routes securisees necessitant une authentification JWT
router.post("/", authenticate, create);

export default router;
