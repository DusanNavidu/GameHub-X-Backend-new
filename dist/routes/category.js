"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const category_controller_1 = require("../controllers/category.controller");
const auth_1 = require("../middleware/auth");
const role_1 = require("../middleware/role"); // ඔයා කලින් හදපු role check කරන middleware එක
const User_1 = require("../models/User");
const router = (0, express_1.Router)();
// 🟢 GET - සාමාන්‍යයෙන් Categories බලන්න හැමෝටම පුළුවන් නිසා මේක Public තියමු 
// (නැත්නම් Admin ට විතරක් ඕනේ නම් authenticate, requireRole([Role.ADMIN]) දාන්න)
router.get("/", category_controller_1.getCategories);
// 🟢 අනිත් සියලුම දේවල් කළ හැක්කේ ADMIN ට පමණි
router.post("/", auth_1.authenticate, (0, role_1.requireRole)([User_1.Role.ADMIN]), category_controller_1.createCategory);
router.put("/:id", auth_1.authenticate, (0, role_1.requireRole)([User_1.Role.ADMIN]), category_controller_1.updateCategory);
router.patch("/:id/status", auth_1.authenticate, (0, role_1.requireRole)([User_1.Role.ADMIN]), category_controller_1.toggleCategoryStatus);
exports.default = router;
