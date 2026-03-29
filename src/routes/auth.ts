import { Router } from "express";
import {
  getMyProfile,
  refreshToken,
  registerUser,
  sendOTP,
  verifyOTP,
  getRole
} from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/register", registerUser);

router.post("/send-otp", sendOTP);

router.post("/verify-otp", verifyOTP);

router.post("/refresh", refreshToken);

router.get("/me", authenticate, getMyProfile);

router.get("/role", authenticate, getRole);

export default router;