import { Router } from "express";
import { 
  createCategory, 
  getCategories, 
  updateCategory, 
  toggleCategoryStatus, 
  getPublicCategories
} from "../controllers/category.controller";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/role"; // ඔයා කලින් හදපු role check කරන middleware එක
import { Role } from "../models/User";

const router = Router();

router.get("/public/getall", getPublicCategories);

// Admin Get All (Pagination සමග)
router.get("/", authenticate, requireRole([Role.ADMIN]), getCategories);
router.post(
  "/", 
  authenticate, 
  requireRole([Role.ADMIN]), 
  createCategory
);

router.put(
  "/:id", 
  authenticate, 
  requireRole([Role.ADMIN]), 
  updateCategory
);

router.patch(
  "/:id/status", 
  authenticate, 
  requireRole([Role.ADMIN]), 
  toggleCategoryStatus
);

export default router;