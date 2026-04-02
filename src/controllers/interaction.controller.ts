import { Request, Response } from "express";
import mongoose from "mongoose";
import { AUthRequest } from "../middleware/auth";
import Favorite from "../models/Favorite";
import Review from "../models/Review";
import Rating from "../models/Rating";
import Report from "../models/Report";
import Game from "../models/Game";

// ================= FAVORITES =================

export const toggleFavorite = async (req: AUthRequest, res: Response) => {
  try {
    const { gameId } = req.body;
    const userId = req.user.sub;

    const existing = await Favorite.findOne({ userId, gameId });
    if (existing) {
      await Favorite.deleteOne({ _id: existing._id });
      return res
        .status(200)
        .json({ message: "Removed from favorites", isFavorite: false });
    } else {
      await Favorite.create({ userId, gameId });
      return res
        .status(200)
        .json({ message: "Added to favorites", isFavorite: true });
    }
  } catch (err) {
    res.status(500).json({ message: "Error toggling favorite" });
  }
};

export const getMyFavorites = async (req: AUthRequest, res: Response) => {
  try {
    const userId = req.user.sub;
    const favorites = await Favorite.find({ userId }).populate("gameId");
    // Game object එක විතරක් map කරලා යවනවා
    const games = favorites.map((f) => f.gameId).filter((g) => g != null);
    res.status(200).json({ data: games });
  } catch (err) {
    res.status(500).json({ message: "Error fetching favorites" });
  }
};

export const checkIsFavorite = async (req: AUthRequest, res: Response) => {
  try {
    const { gameId } = req.params;
    const userId = req.user.sub;
    const existing = await Favorite.findOne({ userId, gameId });
    res.status(200).json({ isFavorite: !!existing });
  } catch (err) {
    res.status(500).json({ message: "Error checking favorite status" });
  }
};

// ================= REVIEWS =================

export const addReview = async (req: AUthRequest, res: Response) => {
  try {
    const { gameId, text } = req.body;
    const userId = req.user.sub;

    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Review text is required" });
    }
    if (text.length > 500) {
      return res
        .status(400)
        .json({ message: "Review cannot exceed 500 characters" });
    }

    const review = await Review.create({ userId, gameId, text });
    // User ගේ නම පෙන්නන්න ඕනේ නිසා Populate කරලා ගන්නවා
    const populatedReview = await Review.findById(review._id).populate(
      "userId",
      "fullname profilePic",
    );

    res.status(201).json({ message: "Review added", data: populatedReview });
  } catch (err) {
    res.status(500).json({ message: "Error adding review" });
  }
};

export const getGameReviews = async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    const reviews = await Review.find({ gameId })
      .populate("userId", "fullname profilePic")
      .sort({ createdAt: -1 }); // අලුත්ම ඒවා උඩින්
    res.status(200).json({ data: reviews });
  } catch (err) {
    res.status(500).json({ message: "Error fetching reviews" });
  }
};

// ================= RATINGS =================

export const addOrUpdateRating = async (req: AUthRequest, res: Response) => {
  try {
    const { gameId, score } = req.body;
    const userId = req.user.sub;

    if (score < 1 || score > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    // දැනටමත් Rating එකක් තියෙනවද බලනවා. තියෙනවා නම් Update කරනවා, නැත්නම් අලුතෙන් හදනවා.
    const rating = await Rating.findOneAndUpdate(
      { userId, gameId },
      { $set: { score } },
      { new: true, upsert: true },
    );

    res.status(200).json({ message: "Rating saved", data: rating });
  } catch (err) {
    res.status(500).json({ message: "Error saving rating" });
  }
};

export const getGameAverageRating = async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;

    // MongoDB Aggregation පාවිච්චි කරලා සාමාන්‍ය (Average) එක හොයනවා
    const stats = await Rating.aggregate([
      { $match: { gameId: new mongoose.Types.ObjectId(gameId as string) } },
      {
        $group: {
          _id: "$gameId",
          averageScore: { $avg: "$score" },
          totalRatings: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      res
        .status(200)
        .json({
          average: stats[0].averageScore.toFixed(1),
          total: stats[0].totalRatings,
        });
    } else {
      res.status(200).json({ average: 0, total: 0 });
    }
  } catch (err) {
    res.status(500).json({ message: "Error fetching rating" });
  }
};

// ================= REPORTS =================

export const reportGame = async (req: AUthRequest, res: Response) => {
  try {
    const { gameId, reason, description } = req.body;
    const userId = req.user.sub;

    if (!reason) {
      return res.status(400).json({ message: "Report reason is required" });
    }

    await Report.create({ userId, gameId, reason, description });
    res
      .status(201)
      .json({
        message: "Report submitted successfully. Our team will investigate.",
      });
  } catch (err) {
    res.status(500).json({ message: "Error submitting report" });
  }
};
