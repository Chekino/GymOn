import { Router } from "express";
import { create, getById, list } from "../controllers/gym.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

/**
 * Couche Routes pour les salles de sport.
 * Toutes les routes necessitant d'etre connecte utilisent le middleware authenticate.
 */
const router = Router();

router.get("/", authenticate, list);
router.get("/:id", authenticate, getById);
router.post("/", authenticate, create);

export default router;
