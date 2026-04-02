import { Request, Response } from "express";
import GameType from "../models/GameType";
import { Status } from "../models/User";

// 1. CREATE GAME TYPE
export const createGameType = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res
        .status(400)
        .json({ message: "Name and description are required" });
    }

    // නම දැනටමත් තියෙනවද කියලා බලනවා (Case-insensitive)
    const existingType = await GameType.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (existingType) {
      return res.status(400).json({ message: "Game Type already exists" });
    }

    const gameType = await GameType.create({ name, description });

    res.status(201).json({
      message: "Game Type created successfully",
      data: gameType,
    });
  } catch (err) {
    console.error("createGameType Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 2. GET ALL GAME TYPES (With Search & Pagination)
export const getGameTypes = async (req: Request, res: Response) => {
  try {
    const { search, status, page, limit } = req.query;
    let query: any = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    if (status) {
      query.status = status;
    }

    // Pagination Logic
    const pageNumber = parseInt(page as string) || 1;
    const limitNumber = parseInt(limit as string) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const total = await GameType.countDocuments(query);

    const gameTypes = await GameType.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    res.status(200).json({
      message: "Game Types fetched successfully",
      data: gameTypes,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (err) {
    console.error("getGameTypes Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 3. GET ALL ACTIVE GAME TYPES (Without Pagination - For Dropdowns)
export const getActiveGameTypes = async (req: Request, res: Response) => {
  try {
    const gameTypes = await GameType.find({ status: Status.ACTIVE }).sort({
      name: 1,
    });

    res.status(200).json({
      message: "Active Game Types fetched successfully",
      data: gameTypes,
    });
  } catch (err) {
    console.error("getActiveGameTypes Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 4. UPDATE GAME TYPE
export const updateGameType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (name) {
      const existingType = await GameType.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
        _id: { $ne: id },
      });

      if (existingType) {
        return res
          .status(400)
          .json({ message: "Game Type name already exists" });
      }
    }

    const updatedType = await GameType.findByIdAndUpdate(
      id,
      { $set: { name, description } },
      { new: true },
    );

    if (!updatedType) {
      return res.status(404).json({ message: "Game Type not found" });
    }

    res.status(200).json({
      message: "Game Type updated successfully",
      data: updatedType,
    });
  } catch (err) {
    console.error("updateGameType Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 5. TOGGLE STATUS
export const toggleGameTypeStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const gameType = await GameType.findById(id);

    if (!gameType) {
      return res.status(404).json({ message: "Game Type not found" });
    }

    const newStatus =
      gameType.status === Status.ACTIVE ? Status.INACTIVE : Status.ACTIVE;

    await GameType.updateOne({ _id: id }, { $set: { status: newStatus } });

    res.status(200).json({
      message: `Game Type status updated to ${newStatus}`,
      data: { _id: id, status: newStatus },
    });
  } catch (err) {
    console.error("toggleGameTypeStatus Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
