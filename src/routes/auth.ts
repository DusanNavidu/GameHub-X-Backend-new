import { Router } from "express";
import {
  getMyProfile,
  refreshToken,
  registerUser,
  sendOTP,
  verifyOTP,
  getRole,
  updateProfilePic
} from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = Router();

router.post("/register", registerUser);

router.post("/send-otp", sendOTP);

router.post("/verify-otp", verifyOTP);

router.post("/refresh", refreshToken);

router.get("/me", authenticate, getMyProfile);

router.get("/role", authenticate, getRole);

router.put("/profile-pic", authenticate, upload.single("profilePic"), updateProfilePic);

export default router;