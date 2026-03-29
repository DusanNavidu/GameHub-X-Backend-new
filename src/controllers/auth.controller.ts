import { Request, Response } from "express";
import { IUSER, Role, User } from "../models/User";
import bcrypt from "bcryptjs";
import { signAccessToken, signRefreshToken } from "../utils/tokens";
import { AUthRequest } from "../middleware/auth";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { sendEmailOTP } from "../utils/mailer";

dotenv.config();

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;

// 1. REGISTER
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { fullname, email } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const user = await User.create({
      fullname,
      email,
      role: Role.PLAYER, // 🟢 roles වෙනුවට role භාවිතා කර ඇත
    });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    res.status(201).json({
      message: "User registered successfully",
      accessToken,
      refreshToken,
      data: { email: user.email, role: user.role, fullname: user.fullname }, // 🟢 roles වෙනුවට role භාවිතා කර ඇත
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 2. SEND OTP
export const sendOTP = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found with this email" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const otpExpiryTime = new Date(Date.now() + 5 * 60 * 1000); 
    
    await User.updateOne(
      { _id: user._id }, 
      { 
        $set: { 
          otp: hashedOtp, 
          otpExpiryTime: otpExpiryTime 
        } 
      }
    );

    await sendEmailOTP(user.email, otp);

    res.status(200).json({ message: "OTP sent to your email successfully" });
  } catch (err) {
    console.error("sendOTP Error:", err);
    res.status(500).json({ message: "Error sending OTP" });
  }
};

// 3. VERIFY OTP
export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.otp || !user.otpExpiryTime) {
      return res.status(400).json({ message: "Invalid request or OTP not requested" });
    }

    if (new Date() > user.otpExpiryTime) {
      await User.updateOne(
        { _id: user._id },
        { $set: { otp: null, otpExpiryTime: null } }
      );
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    const isOtpValid = await bcrypt.compare(otp, user.otp);
    if (!isOtpValid) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    await User.updateOne(
      { _id: user._id },
      { $set: { otp: null, otpExpiryTime: null } }
    );

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      data: { email: user.email, role: user.role, fullname: user.fullname }, // 🟢 roles වෙනුවට role භාවිතා කර ඇත
    });
  } catch (err) {
    console.error("verifyOTP Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 4. REFRESH TOKEN
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Token required" });

    const payload: any = jwt.verify(token, JWT_REFRESH_SECRET);
    const user = await User.findById(payload.sub);
    if (!user) return res.status(403).json({ message: "Invalid refresh token" });
    
    const accessToken = signAccessToken(user);
    res.status(200).json({ accessToken });
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};

// 5. GET MY PROFILE
export const getMyProfile = async (req: AUthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  const user = await User.findById(req.user.sub).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });

  const { fullname, email, role, _id } = user as IUSER;
  res.status(200).json({ message: "ok", data: { id: _id, email, role, fullname } });
};

// 6. GET ROLE
export const getRole = async (req: AUthRequest, res: Response) => {
  try {
    if (!req.user || !req.user.sub) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.sub;
    const user = await User.findById(userId).select("role");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User role retrieved successfully",
      data: { role: user.role },
    });
  } catch (err) {
    console.error("getRole Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};