// src/routes/tag.ts
import { Router } from "express";
import { createTag, getTags, updateTag, toggleTagStatus, getTagsForAdminGameAdd } from "../controllers/tag.controller";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { Role } from "../models/User";

const router = Router();

router.get("/all-active", authenticate, requireRole([Role.ADMIN]), getTagsForAdminGameAdd);

// Public route to view tags
router.get("/", getTags);

// Admin only routes
router.post("/", authenticate, requireRole([Role.ADMIN]), createTag);
router.put("/:id", authenticate, requireRole([Role.ADMIN]), updateTag);
router.patch("/:id/status", authenticate, requireRole([Role.ADMIN]), toggleTagStatus);

export default router;