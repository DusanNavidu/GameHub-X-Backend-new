"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleGameStatus = exports.updateGame = exports.getGames = exports.createGame = void 0;
const Game_1 = __importDefault(require("../models/Game")); // IGame සහ GameSchema තියෙන තැන
const User_1 = require("../models/User");
const cloudinaryHelper_1 = require("../utils/cloudinaryHelper");
// 1. CREATE GAME (File or Link)
const createGame = async (req, res) => {
    try {
        const { title, description, categoryId, gameUrl } = req.body;
        const uploadedByUserId = req.user.sub; // Token එකෙන් ගන්නවා
        if (!title || !description || !categoryId) {
            return res.status(400).json({ message: "Missing required text fields" });
        }
        // Multer වලින් එන Files ටික ගන්නවා
        const files = req.files;
        const thumbnailFile = files?.thumbnail?.[0];
        const gameFile = files?.gameFile?.[0]; // HTML/ZIP ෆයිල් එකක් දුන්නොත්
        if (!thumbnailFile) {
            return res.status(400).json({ message: "Thumbnail image is required" });
        }
        // Game එකට ෆයිල් එකකුත් නෑ, ලින්ක් එකකුත් නෑ නම් Error දෙනවා
        if (!gameUrl && !gameFile) {
            return res.status(400).json({ message: "Please provide either a Game URL or upload a Game File (HTML/ZIP)" });
        }
        // 1. Thumbnail එක Cloudinary එකට යවනවා
        const thumbnailUrl = await (0, cloudinaryHelper_1.uploadToCloudinary)(thumbnailFile.buffer, "gamehub/thumbnails", "image");
        // 2. Game එක ෆයිල් එකක් විදිහට ඇවිත් නම් ඒකත් යවනවා ("raw" විදිහට යවන්නේ HTML/ZIP නිසා)
        let finalGameUrl = gameUrl;
        if (gameFile) {
            finalGameUrl = await (0, cloudinaryHelper_1.uploadToCloudinary)(gameFile.buffer, "gamehub/games", "raw");
        }
        // 3. Database එකේ Save කරනවා
        const game = await Game_1.default.create({
            title,
            description,
            categoryId,
            thumbnailUrl,
            gameUrl: finalGameUrl, // ලින්ක් එකක් දුන්නොත් ලින්ක් එක, ෆයිල් එකක් දුන්නොත් Cloudinary ලින්ක් එක සේව් වෙනවා
            uploadedByUserId,
            status: User_1.Status.ACTIVE
        });
        res.status(201).json({ message: "Game added successfully", data: game });
    }
    catch (err) {
        console.error("createGame Error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.createGame = createGame;
// 2. GET ALL GAMES (With search and category filter)
const getGames = async (req, res) => {
    try {
        const { search, category, status } = req.query;
        let query = {};
        if (search)
            query.title = { $regex: search, $options: "i" };
        if (category)
            query.categoryId = category;
        if (status)
            query.status = status;
        // Category එකයි, Upload කරපු User ගේ විස්තරයි (Name) populate කරනවා
        const games = await Game_1.default.find(query)
            .populate("categoryId", "name")
            .populate("uploadedByUserId", "fullname email")
            .sort({ createdAt: -1 });
        res.status(200).json({ message: "Games fetched successfully", data: games });
    }
    catch (err) {
        console.error("getGames Error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.getGames = getGames;
// 3. UPDATE GAME
const updateGame = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, categoryId, gameUrl } = req.body;
        const game = await Game_1.default.findById(id);
        if (!game)
            return res.status(404).json({ message: "Game not found" });
        const files = req.files;
        const thumbnailFile = files?.thumbnail?.[0];
        const gameFile = files?.gameFile?.[0];
        // අලුත් Thumbnail එකක් ඇවිත් නම් ඒක Update කරනවා
        let newThumbnailUrl = game.thumbnailUrl;
        if (thumbnailFile) {
            newThumbnailUrl = await (0, cloudinaryHelper_1.uploadToCloudinary)(thumbnailFile.buffer, "gamehub/thumbnails", "image");
        }
        // අලුත් Game File එකක් හෝ URL එකක් ඇවිත් නම් ඒක Update කරනවා
        let newGameUrl = game.gameUrl;
        if (gameFile) {
            newGameUrl = await (0, cloudinaryHelper_1.uploadToCloudinary)(gameFile.buffer, "gamehub/games", "raw");
        }
        else if (gameUrl) {
            newGameUrl = gameUrl;
        }
        const updatedGame = await Game_1.default.findByIdAndUpdate(id, {
            $set: { title, description, categoryId, thumbnailUrl: newThumbnailUrl, gameUrl: newGameUrl },
        }, { new: true });
        res.status(200).json({ message: "Game updated successfully", data: updatedGame });
    }
    catch (err) {
        console.error("updateGame Error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.updateGame = updateGame;
// 4. TOGGLE STATUS (Active/Inactive)
const toggleGameStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const game = await Game_1.default.findById(id);
        if (!game)
            return res.status(404).json({ message: "Game not found" });
        const newStatus = game.status === User_1.Status.ACTIVE ? User_1.Status.INACTIVE : User_1.Status.ACTIVE;
        await Game_1.default.updateOne({ _id: id }, { $set: { status: newStatus } });
        res.status(200).json({ message: `Game status changed to ${newStatus}`, data: { _id: id, status: newStatus } });
    }
    catch (err) {
        console.error("toggleGameStatus Error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.toggleGameStatus = toggleGameStatus;
