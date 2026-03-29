import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRouter from "./routes/auth";
import categoryRouter from "./routes/category";
import gameRouter from "./routes/game";
import { createDefaultAdmin } from "./utils/createDefaultAdmin";

dotenv.config();

const app = express();
const MONGO_URI = process.env.MONGO_URI as string;

// 🟢 1. The Bulletproof CORS Fix (Manual Headers)
app.use((req, res, next) => {
  // ඔයාගේ Frontend ලින්ක් එකට කෙලින්ම අවසර දෙනවා
  res.setHeader("Access-Control-Allow-Origin", "https://game-hub-x-frontend.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Vercel එකේදී Preflight (OPTIONS) request එක ආවම කෙලින්ම OK (200) යවනවා
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

app.use(express.json());

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is not defined");
} else {
  mongoose
    .connect(MONGO_URI)
    .then(async () => {
      console.log("✅ DB connected to MongoDB Atlas");
      try {
         await createDefaultAdmin();
      } catch (e) {
         console.log("Admin check skipped or failed:", e);
      }
    })
    .catch((err) => console.error("❌ DB Connection Error:", err));
}

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/games", gameRouter);

app.get("/", (req, res) => {
  res.send("Backend is running securely...");
});

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;