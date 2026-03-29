import { Router } from "express";
import { 
  createCategory, 
  getCategories, 
  updateCategory, 
  toggleCategoryStatus 
} from "../controllers/category.controller";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/role"; // ඔයා කලින් හදපු role check කරන middleware එක
import { Role } from "../models/User";

const router = Router();

// 🟢 GET - සාමාන්‍යයෙන් Categories බලන්න හැමෝටම පුළුවන් නිසා මේක Public තියමු 
// (නැත්නම් Admin ට විතරක් ඕනේ නම් authenticate, requireRole([Role.ADMIN]) දාන්න)
router.get("/", getCategories);

// 🟢 අනිත් සියලුම දේවල් කළ හැක්කේ ADMIN ට පමණි
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