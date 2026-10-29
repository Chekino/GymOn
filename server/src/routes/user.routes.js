import { Router } from "express";
import { getMe, updateMe, deleteMe } from "../controllers/user.controller.js";
import { getMyHostedSessions } from "../controllers/session.controller.js";
import { getMyParticipations } from "../controllers/participation.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

/**
 * Couche Routes pour les utilisateurs.
 * Toutes les routes /me sont protegees par le middleware authenticate.
 */
const router = Router();

router.get("/me", authenticate, getMe);
router.patch("/me", authenticate, updateMe);
router.delete("/me", authenticate, deleteMe);
router.get("/me/sessions", authenticate, getMyHostedSessions);
router.get("/me/participations", authenticate, getMyParticipations);

export default router;
