import mongoose, { Schema, Document } from 'mongoose';

export interface IFavorite extends Document {
    userId: mongoose.Types.ObjectId;
    gameId: mongoose.Types.ObjectId;
    createdAt: Date;
}

const FavoriteSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    gameId: { type: Schema.Types.ObjectId, ref: 'Game', required: true },
}, { timestamps: true });

// එක User කෙනෙක්ට එක Game එකක් Favorite කරන්න පුළුවන් එක පාරයි
FavoriteSchema.index({ userId: 1, gameId: 1 }, { unique: true });

export default mongoose.model<IFavorite>('Favorite', FavoriteSchema);