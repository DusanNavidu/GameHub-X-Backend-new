import mongoose, { Schema, Document } from 'mongoose';
import { Status } from './User';

export interface IGame extends Document {
    title: string;
    description: string;
    categoryId: mongoose.Types.ObjectId;
    gameTypeId: mongoose.Types.ObjectId;
    tags: mongoose.Types.ObjectId[];
    thumbnailUrl: string;
    gameUrl: string;
    uploadedByUserId: mongoose.Types.ObjectId;
    status: Status;
    createdAt: Date;
    updatedAt: Date;
    // Virtuals 
    reviews?: any[]; 
    ratings?: any[];
    favoritesCount?: number;
}

const GameSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    gameTypeId: { type: Schema.Types.ObjectId, ref: 'GameType', required: true },
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    thumbnailUrl: { type: String, required: true },
    gameUrl: { type: String, required: true },
    uploadedByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: Object.values(Status), default: Status.ACTIVE },
}, { 
    timestamps: true,
    toJSON: { virtuals: true }, // 🟢 Virtuals JSON වලට එන්න නම් මේක අනිවාර්යයි
    toObject: { virtuals: true }
});

// 🟢 Virtual Relation: මේ Game එකට අදාළ Reviews
GameSchema.virtual('reviews', {
    ref: 'Review',        // සම්බන්ධ වෙන Model එක
    localField: '_id',    // Game එකේ ID එක
    foreignField: 'gameId' // Review Model එකේ තියෙන Game ID Field එක
});

// 🟢 Virtual Relation: මේ Game එකට අදාළ Ratings
GameSchema.virtual('ratings', {
    ref: 'Rating',
    localField: '_id',
    foreignField: 'gameId'
});

// 🟢 Virtual Relation: මේ Game එකට අදාළ Favorites ගණන
GameSchema.virtual('favoritesCount', {
    ref: 'Favorite',
    localField: '_id',
    foreignField: 'gameId',
    count: true // 🟢 Array එකක් වෙනුවට ගණන (Count) විතරක් එවනවා
});

export default mongoose.model<IGame>('Game', GameSchema);