import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRouter from "./routes/auth";
import categoryRouter from "./routes/category";
import gameRouter from "./routes/game";
import { createDefaultAdmin } from "./utils/createDefaultAdmin";

dotenv.config();

const app = express();
const MONGO_URI = process.env.MONGO_URI as string;

app.use(
  cors({
    origin: ["https://game-hub-x-frontend.vercel.app", "http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(express.json());

if (!MONGO_URI) {
  console.error("❌ MONGO_URL is not defined");
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

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/games", gameRouter);

app.get("/", (req, res) => {
  res.send("Backend is running...");
});

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;