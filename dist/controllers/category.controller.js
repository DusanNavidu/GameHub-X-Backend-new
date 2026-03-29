"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleCategoryStatus = exports.updateCategory = exports.getCategories = exports.createCategory = void 0;
const Category_1 = __importStar(require("../models/Category")); // ඔයාගේ Category model එක තියෙන තැනට path එක හදන්න
// 1. CREATE - අලුත් Category එකක් සෑදීම
const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) {
            return res.status(400).json({ message: "Category name is required" });
        }
        // නම දැනටමත් තියෙනවද කියලා බලනවා (Case-insensitive)
        const existingCategory = await Category_1.default.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') }
        });
        if (existingCategory) {
            return res.status(400).json({ message: "Category name already exists" });
        }
        const category = await Category_1.default.create({ name, description });
        res.status(201).json({
            message: "Category created successfully",
            data: category,
        });
    }
    catch (err) {
        console.error("createCategory Error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.createCategory = createCategory;
// 2. GET ALL & SEARCH - සියලුම Categories ගැනීම සහ Search කිරීම
const getCategories = async (req, res) => {
    try {
        // Frontend එකෙන් ?search=action හෝ ?status=ACTIVE වගේ එව්වොත් ගන්නවා
        const { search, status } = req.query;
        let query = {};
        // Search keyword එකක් තියෙනවා නම් නමෙන් හොයනවා
        if (search) {
            query.name = { $regex: search, $options: "i" }; // "i" නිසා Simple/Capital ප්‍රශ්නයක් නෑ
        }
        // Status එකක් විශේෂයෙන් ඉල්ලලා නම් ඒක දානවා
        if (status) {
            query.status = status;
        }
        // අලුත්ම ඒවා උඩින් එන්න sort කරනවා (createdAt: -1)
        const categories = await Category_1.default.find(query).sort({ createdAt: -1 });
        res.status(200).json({
            message: "Categories fetched successfully",
            data: categories,
        });
    }
    catch (err) {
        console.error("getCategories Error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.getCategories = getCategories;
// 3. UPDATE - Category එකක් වෙනස් කිරීම (නම සහ විස්තරය)
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        // වෙනස් කරන නම වෙන Category එකකට දැනටමත් තියෙනවද බලනවා
        if (name) {
            const existingCategory = await Category_1.default.findOne({
                name: { $regex: new RegExp(`^${name}$`, 'i') },
                _id: { $ne: id } // තමන්ගේම ID එක ඇරෙන්න වෙන අයට මේ නම තියෙනවද බලනවා
            });
            if (existingCategory) {
                return res.status(400).json({ message: "Category name already exists" });
            }
        }
        // Update කරනවා
        const updatedCategory = await Category_1.default.findByIdAndUpdate(id, { $set: { name, description } }, { new: true } // Update වුණු අලුත් data එක return කරන්න
        );
        if (!updatedCategory) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.status(200).json({
            message: "Category updated successfully",
            data: updatedCategory,
        });
    }
    catch (err) {
        console.error("updateCategory Error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.updateCategory = updateCategory;
// 4. TOGGLE STATUS - Active හෝ Inactive කිරීම
const toggleCategoryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category_1.default.findById(id);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        // දැනට ACTIVE නම් INACTIVE කරනවා, INACTIVE නම් ACTIVE කරනවා
        const newStatus = category.status === Category_1.CategoryStatus.ACTIVE
            ? Category_1.CategoryStatus.INACTIVE
            : Category_1.CategoryStatus.ACTIVE;
        // Save කරනවා
        await Category_1.default.updateOne({ _id: id }, { $set: { status: newStatus } });
        res.status(200).json({
            message: `Category status updated to ${newStatus}`,
            data: { _id: id, status: newStatus }
        });
    }
    catch (err) {
        console.error("toggleCategoryStatus Error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.toggleCategoryStatus = toggleCategoryStatus;
