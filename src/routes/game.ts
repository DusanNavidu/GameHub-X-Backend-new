// src/routes/game.ts
import { Router } from "express";
import { 
  createGame, 
  getGames, 
  updateGame, 
  toggleGameStatus, 
  getPublicGames
} from "../controllers/game.controller";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { Role } from "../models/User";
import { upload } from "../middleware/upload"; // ඔයාගේ multer ෆයිල් එක

const router = Router();

router.get("/admin/getall", authenticate, requireRole([Role.ADMIN]), getGames);

router.get("/public/getall", getPublicGames); // මේක හැමෝටම බලන්න පුළුවන් (Public)

// POST - අලුත් ගේම් එකක් දැමීම (Admin ට පමණි)
router.post(
  "/", 
  authenticate, 
  requireRole([Role.ADMIN]), 
  upload.fields([
    { name: 'thumbnail', maxCount: 1 }, 
    { name: 'gameFile', maxCount: 1 }
  ]), 
  createGame
);

// PUT - Game එකක් Edit කිරීම (Admin ට පමණි)
router.put(
  "/:id", 
  authenticate, 
  requireRole([Role.ADMIN]), 
  upload.fields([
    { name: 'thumbnail', maxCount: 1 }, 
    { name: 'gameFile', maxCount: 1 }
  ]), 
  updateGame
);

// PATCH - Active/Inactive කිරීම (Admin ට පමණි)
router.patch(
  "/:id/status", 
  authenticate, 
  requireRole([Role.ADMIN]), 
  toggleGameStatus
);

export default router;