import { Router } from "express";
import { 
    createGameType, 
    getGameTypes, 
    getActiveGameTypes, 
    updateGameType, 
    toggleGameTypeStatus 
} from "../controllers/gameType.controller";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { Role } from "../models/User";

const router = Router();

router.get("/active", authenticate, requireRole([Role.ADMIN]), getActiveGameTypes);

router.get("/public/getall", getActiveGameTypes);

router.get("/", authenticate, requireRole([Role.ADMIN]), getGameTypes);

router.post("/", authenticate, requireRole([Role.ADMIN]), createGameType);

router.put("/:id", authenticate, requireRole([Role.ADMIN]), updateGameType);

router.patch("/:id/status", authenticate, requireRole([Role.ADMIN]), toggleGameTypeStatus);

export default router;