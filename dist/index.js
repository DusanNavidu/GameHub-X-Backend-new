"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const auth_1 = __importDefault(require("./routes/auth"));
const category_1 = __importDefault(require("./routes/category"));
const game_1 = __importDefault(require("./routes/game"));
const createDefaultAdmin_1 = require("./utils/createDefaultAdmin");
dotenv_1.default.config();
const app = (0, express_1.default)();
const MONGO_URI = process.env.MONGO_URI;
app.use((0, cors_1.default)({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
    optionsSuccessStatus: 204
}));
app.use(express_1.default.json());
if (!MONGO_URI) {
    console.error("❌ MONGO_URI is not defined");
}
else {
    mongoose_1.default
        .connect(MONGO_URI)
        .then(async () => {
        console.log("✅ DB connected to MongoDB Atlas");
        try {
            await (0, createDefaultAdmin_1.createDefaultAdmin)();
        }
        catch (e) {
            console.log("Admin check skipped or failed:", e);
        }
    })
        .catch((err) => console.error("❌ DB Connection Error:", err));
}
// Routes
app.use("/api/v1/auth", auth_1.default);
app.use("/api/v1/categories", category_1.default);
app.use("/api/v1/games", game_1.default);
app.get("/", (req, res) => {
    res.send("Backend is running...");
});
// Vercel එකේදී app.listen අවශ්‍ය නැත. 
// local test කිරීමට පමණක් මෙය පාවිච්චි කරන්න:
if (process.env.NODE_ENV !== "production") {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
// මෙය අනිවාර්යයි!
exports.default = app;
