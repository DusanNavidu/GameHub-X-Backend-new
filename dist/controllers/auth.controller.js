"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfilePic = exports.getRole = exports.getMyProfile = exports.refreshToken = exports.verifyOTP = exports.sendOTP = exports.registerUser = void 0;
const User_1 = require("../models/User");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const tokens_1 = require("../utils/tokens");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const mailer_1 = require("../utils/mailer");
const cloudinaryHelper_1 = require("../utils/cloudinaryHelper");
dotenv_1.default.config();
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
// 1. REGISTER
const registerUser = async (req, res) => {
    try {
        const { fullname, email } = req.body;
        const existingUser = await User_1.User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }
        const user = await User_1.User.create({
            fullname,
            email,
            role: User_1.Role.PLAYER, // 🟢 roles වෙනුවට role භාවිතා කර ඇත
        });
        const accessToken = (0, tokens_1.signAccessToken)(user);
        const refreshToken = (0, tokens_1.signRefreshToken)(user);
        res.status(201).json({
            message: "User registered successfully",
            accessToken,
            refreshToken,
            data: { email: user.email, role: user.role, fullname: user.fullname }, // 🟢 roles වෙනුවට role භාවිතා කර ඇත
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.registerUser = registerUser;
// 2. SEND OTP
const sendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User_1.User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found with this email" });
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = await bcryptjs_1.default.hash(otp, 10);
        const otpExpiryTime = new Date(Date.now() + 5 * 60 * 1000);
        await User_1.User.updateOne({ _id: user._id }, {
            $set: {
                otp: hashedOtp,
                otpExpiryTime: otpExpiryTime
            }
        });
        await (0, mailer_1.sendEmailOTP)(user.email, otp);
        res.status(200).json({ message: "OTP sent to your email successfully" });
    }
    catch (err) {
        console.error("sendOTP Error:", err);
        res.status(500).json({ message: "Error sending OTP" });
    }
};
exports.sendOTP = sendOTP;
// 3. VERIFY OTP
const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User_1.User.findOne({ email });
        if (!user || !user.otp || !user.otpExpiryTime) {
            return res.status(400).json({ message: "Invalid request or OTP not requested" });
        }
        if (new Date() > user.otpExpiryTime) {
            await User_1.User.updateOne({ _id: user._id }, { $set: { otp: null, otpExpiryTime: null } });
            return res.status(400).json({ message: "OTP has expired. Please request a new one." });
        }
        const isOtpValid = await bcryptjs_1.default.compare(otp, user.otp);
        if (!isOtpValid) {
            return res.status(400).json({ message: "Invalid OTP" });
        }
        await User_1.User.updateOne({ _id: user._id }, { $set: { otp: null, otpExpiryTime: null } });
        const accessToken = (0, tokens_1.signAccessToken)(user);
        const refreshToken = (0, tokens_1.signRefreshToken)(user);
        res.status(200).json({
            message: "Login successful",
            accessToken,
            refreshToken,
            data: { email: user.email, role: user.role, fullname: user.fullname }, // 🟢 roles වෙනුවට role භාවිතා කර ඇත
        });
    }
    catch (err) {
        console.error("verifyOTP Error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.verifyOTP = verifyOTP;
// 4. REFRESH TOKEN
const refreshToken = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token)
            return res.status(400).json({ message: "Token required" });
        const payload = jsonwebtoken_1.default.verify(token, JWT_REFRESH_SECRET);
        const user = await User_1.User.findById(payload.sub);
        if (!user)
            return res.status(403).json({ message: "Invalid refresh token" });
        const accessToken = (0, tokens_1.signAccessToken)(user);
        res.status(200).json({ accessToken });
    }
    catch (err) {
        res.status(403).json({ message: "Invalid or expired token" });
    }
};
exports.refreshToken = refreshToken;
// 5. GET MY PROFILE
const getMyProfile = async (req, res) => {
    if (!req.user)
        return res.status(401).json({ message: "Unauthorized" });
    const user = await User_1.User.findById(req.user.sub).select("-password");
    if (!user)
        return res.status(404).json({ message: "User not found" });
    const { fullname, email, role, _id } = user;
    res.status(200).json({ message: "ok", data: { id: _id, email, role, fullname } });
};
exports.getMyProfile = getMyProfile;
// 6. GET ROLE
const getRole = async (req, res) => {
    try {
        if (!req.user || !req.user.sub) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const userId = req.user.sub;
        const user = await User_1.User.findById(userId).select("role");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({
            message: "User role retrieved successfully",
            data: { role: user.role },
        });
    }
    catch (err) {
        console.error("getRole Error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.getRole = getRole;
const updateProfilePic = async (req, res) => {
    try {
        if (!req.user || !req.user.sub) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const file = req.file;
        if (!file) {
            return res.status(400).json({ message: "No image file provided" });
        }
        const profilePicUrl = await (0, cloudinaryHelper_1.uploadToCloudinary)(file.buffer, "gamehub/profiles", "image");
        const updatedUser = await User_1.User.findByIdAndUpdate(req.user.sub, { $set: { profilePic: profilePicUrl } }, { new: true }).select("-password -otp -otpExpiryTime");
        res.status(200).json({
            message: "Profile picture updated successfully",
            data: updatedUser,
        });
    }
    catch (err) {
        console.error("updateProfilePic Error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.updateProfilePic = updateProfilePic;
