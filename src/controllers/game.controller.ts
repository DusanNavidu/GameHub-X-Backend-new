import { Request, Response } from "express";
import mongoose from "mongoose";
import Game from "../models/Game"; 
import Tag from "../models/Tag"; 
import { Status } from "../models/User"; 
import { uploadToCloudinary } from "../utils/cloudinaryHelper";
import { AUthRequest } from "../middleware/auth";

// 🟢 අලුත් Tags හදන සහ IDs වෙන් කරන Function එක
const processTags = async (tagsRaw: any) => {
  let finalIds: mongoose.Types.ObjectId[] = [];
  if (!tagsRaw) return finalIds;

  let parsed: string[] = [];
  try { 
    parsed = JSON.parse(tagsRaw); 
  } catch (e) { 
    parsed = typeof tagsRaw === 'string' ? tagsRaw.split(',') : tagsRaw; 
  }

  for (const item of parsed) {
    if (mongoose.Types.ObjectId.isValid(item)) {
      finalIds.push(new mongoose.Types.ObjectId(item)); // දැනටමත් තියෙන Tag එකක ID එකක් නම්
    } else if (typeof item === 'string' && item.trim() !== '') {
      // 🟢 අලුත් Tag එකක් නමකින් ආවොත්, ඒක Simple කරලා DB එකේ තියෙනවද බලනවා
      const cleanName = item.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!cleanName) continue;
      const formattedName = `#${cleanName}`;

      let existingTag = await Tag.findOne({ name: formattedName });
      // නැත්නම් අලුතෙන් හදනවා
      if (!existingTag) {
        existingTag = await Tag.create({ name: formattedName, status: Status.ACTIVE });
      }
      finalIds.push(existingTag._id as mongoose.Types.ObjectId);
    }
  }
  return finalIds;
};

// 1. CREATE GAME
export const createGame = async (req: AUthRequest, res: Response) => {
  try {
    const { title, description, categoryId, gameTypeId, gameUrl, tags } = req.body;
    const uploadedByUserId = req.user.sub; 

    if (!title || !description || !categoryId) {
      return res.status(400).json({ message: "Missing required text fields" });
    }

    // 🟢 අර උඩ හදපු Function එකට යවලා අවසාන ID ලිස්ට් එක ගන්නවා
    const finalTagIds = await processTags(tags);

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const thumbnailFile = files?.thumbnail?.[0];
    const gameFile = files?.gameFile?.[0]; 

    if (!thumbnailFile) return res.status(400).json({ message: "Thumbnail image is required" });
    if (!gameUrl && !gameFile) return res.status(400).json({ message: "Please provide Game URL or File" });

    const thumbnailUrl = await uploadToCloudinary(thumbnailFile.buffer, "gamehub/thumbnails", "image");
    let finalGameUrl = gameUrl; 
    if (gameFile) finalGameUrl = await uploadToCloudinary(gameFile.buffer, "gamehub/games", "raw");

    const game = await Game.create({
      title, 
      description, 
      categoryId,
      gameTypeId,
      tags: finalTagIds, // 🟢 Process කරපු IDs ටික
      thumbnailUrl, 
      gameUrl: finalGameUrl, 
      uploadedByUserId, 
      status: Status.ACTIVE
    });

    res.status(201).json({ message: "Game added successfully", data: game });
  } catch (err) {
    console.error("createGame Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 2. GET ALL GAMES (With Pagination, Search, and Populates)
export const getGames = async (req: Request, res: Response) => {
  try {
    const { search, category, status, page, limit } = req.query;
    let query: any = {};

    if (search) query.title = { $regex: search, $options: "i" };
    if (category) query.categoryId = category;
    if (status) query.status = status;

    // 🟢 Pagination Logic
    const pageNumber = parseInt(page as string) || 1;
    const limitNumber = parseInt(limit as string) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const total = await Game.countDocuments(query);

    const games = await Game.find(query)
      .populate("categoryId", "name")
      .populate("tags", "name status") // 🟢 Tags වල නම ගන්නවා
      .populate("uploadedByUserId", "fullname email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    res.status(200).json({ 
      message: "Games fetched successfully", 
      data: games,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      }
    });
  } catch (err) {
    console.error("getGames Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 3. UPDATE GAME
export const updateGame = async (req: AUthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, categoryId, gameTypeId, gameUrl, tags } = req.body;

    const game = await Game.findById(id);
    if (!game) return res.status(404).json({ message: "Game not found" });

    // 🟢 Update කරද්දිත් අර Function එකම පාවිච්චි කරනවා
    const finalTagIds = tags ? await processTags(tags) : game.tags;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const thumbnailFile = files?.thumbnail?.[0];
    const gameFile = files?.gameFile?.[0];

    let newThumbnailUrl = game.thumbnailUrl;
    if (thumbnailFile) {
      newThumbnailUrl = await uploadToCloudinary(thumbnailFile.buffer, "gamehub/thumbnails", "image");
    }

    let newGameUrl = game.gameUrl;
    if (gameFile) {
      newGameUrl = await uploadToCloudinary(gameFile.buffer, "gamehub/games", "raw");
    } else if (gameUrl) {
      newGameUrl = gameUrl;
    }

    const updatedGame = await Game.findByIdAndUpdate(
      id,
      { 
        $set: { 
          title, 
          description, 
          categoryId, 
          gameTypeId,
          tags: finalTagIds, // 🟢 Process කරපු IDs ටික Update කිරීම
          thumbnailUrl: newThumbnailUrl, 
          gameUrl: newGameUrl 
        } 
      },
      { new: true }
    );

    res.status(200).json({ message: "Game updated successfully", data: updatedGame });
  } catch (err) {
    console.error("updateGame Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 4. TOGGLE STATUS (Active/Inactive)
export const toggleGameStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const game = await Game.findById(id);

    if (!game) return res.status(404).json({ message: "Game not found" });

    const newStatus = game.status === Status.ACTIVE ? Status.INACTIVE : Status.ACTIVE;

    await Game.updateOne({ _id: id }, { $set: { status: newStatus } });

    res.status(200).json({ message: `Game status changed to ${newStatus}`, data: { _id: id, status: newStatus } });
  } catch (err) {
    console.error("toggleGameStatus Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 5. GET PUBLIC GAMES (For Player Dashboard - Active Only, Limit 30)
export const getPublicGames = async (req: Request, res: Response) => {
  try {
    const { search, category, page } = req.query;
    
    // 🟢 Public පැත්තේ අනිවාර්යයෙන්ම Active ඒවා විතරයි පෙන්නන්නේ
    let query: any = { status: Status.ACTIVE };

    if (search) query.title = { $regex: search, $options: "i" };
    if (category && category !== "ALL") query.categoryId = category;

    // 🟢 Pagination (Default Limit 30)
    const pageNumber = parseInt(page as string) || 1;
    const limitNumber = 30; 
    const skip = (pageNumber - 1) * limitNumber;

    const total = await Game.countDocuments(query);

    const games = await Game.find(query)
      .populate("categoryId", "name")
      .populate("gameTypeId", "name")
      .populate("tags", "name status")
      .populate("uploadedByUserId", "fullname profilePic") 
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    res.status(200).json({ 
      message: "Public games fetched successfully", 
      data: games,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      }
    });
  } catch (err) {
    console.error("getPublicGames Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};