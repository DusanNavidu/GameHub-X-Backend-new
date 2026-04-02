import mongoose, { Schema, Document } from 'mongoose';

export interface IRating extends Document {
    userId: mongoose.Types.ObjectId;
    gameId: mongoose.Types.ObjectId;
    score: number;
}

const RatingSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    gameId: { type: Schema.Types.ObjectId, ref: 'Game', required: true },
    score: { type: Number, required: true, min: 1, max: 5 }, // 1 ත් 5 ත් අතර
}, { timestamps: true });

// එක User කෙනෙක්ට එක Game එකකට Rating එකයි දාන්න පුළුවන්
RatingSchema.index({ userId: 1, gameId: 1 }, { unique: true });

export default mongoose.model<IRating>('Rating', RatingSchema);