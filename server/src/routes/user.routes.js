import { Router } from "express";
import { getMe } from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

/**
 * Couche Routes pour les utilisateurs.
 * La route /me est protegee par le middleware authenticate.
 */
const router = Router();

router.get("/me", authenticate, getMe);

export default router;
