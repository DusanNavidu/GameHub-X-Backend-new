"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/game.ts
const express_1 = require("express");
const game_controller_1 = require("../controllers/game.controller");
const auth_1 = require("../middleware/auth");
const role_1 = require("../middleware/role");
const User_1 = require("../models/User");
const upload_1 = require("../middleware/upload"); // ඔයාගේ multer ෆයිල් එක
const router = (0, express_1.Router)();
// GET - Public හෝ Auth (හැමෝටම ගේම්ස් බලන්න පුළුවන්)
router.get("/", game_controller_1.getGames);
// POST - අලුත් ගේම් එකක් දැමීම (Admin ට පමණි)
router.post("/", auth_1.authenticate, (0, role_1.requireRole)([User_1.Role.ADMIN]), upload_1.upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'gameFile', maxCount: 1 }
]), game_controller_1.createGame);
// PUT - Game එකක් Edit කිරීම (Admin ට පමණි)
router.put("/:id", auth_1.authenticate, (0, role_1.requireRole)([User_1.Role.ADMIN]), upload_1.upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'gameFile', maxCount: 1 }
]), game_controller_1.updateGame);
// PATCH - Active/Inactive කිරීම (Admin ට පමණි)
router.patch("/:id/status", auth_1.authenticate, (0, role_1.requireRole)([User_1.Role.ADMIN]), game_controller_1.toggleGameStatus);
exports.default = router;
