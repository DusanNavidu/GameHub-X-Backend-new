import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
    userId: mongoose.Types.ObjectId;
    gameId: mongoose.Types.ObjectId;
    text: string;
    createdAt: Date;
}

const ReviewSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    gameId: { type: Schema.Types.ObjectId, ref: 'Game', required: true },
    text: { type: String, required: true, maxlength: 500 }, // අකුරු 500යි උපරිම
}, { timestamps: true });

export default mongoose.model<IReview>('Review', ReviewSchema);