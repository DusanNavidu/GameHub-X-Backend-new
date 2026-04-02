import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
    toggleFavorite, getMyFavorites, checkIsFavorite,
    addReview, getGameReviews,
    addOrUpdateRating, getGameAverageRating,
    reportGame
} from "../controllers/interaction.controller";

const router = Router();

// Favorites
router.post("/favorite", authenticate, toggleFavorite);
router.get("/favorite/my-list", authenticate, getMyFavorites);
router.get("/favorite/check/:gameId", authenticate, checkIsFavorite);

// Reviews
router.post("/review", authenticate, addReview);
router.get("/review/:gameId", getGameReviews); // මේක හැමෝටම බලන්න පුළුවන් (Public)

// Ratings
router.post("/rating", authenticate, addOrUpdateRating);
router.get("/rating/:gameId", getGameAverageRating); // Public

// Reports
router.post("/report", authenticate, reportGame);

export default router;