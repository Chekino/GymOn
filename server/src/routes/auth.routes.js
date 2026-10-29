import { Router } from "express";
import { signup, login } from "../controllers/auth.controller.js";

/**
 * Couche Routes pour l'authentification.
 * Associe verbe HTTP + chemin relatif au controleur dedie.
 */
const router = Router();

router.post("/signup", signup);
router.post("/login", login);

export default router;
