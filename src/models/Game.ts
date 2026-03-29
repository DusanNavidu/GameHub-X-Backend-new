import mongoose, { Schema, Document } from 'mongoose';
import { Status } from './User'; // Status enum එක User.ts එකෙන් ගන්නවා

export interface IGame extends Document {
    title: string;
    description: string;
    categoryId: mongoose.Types.ObjectId;
    thumbnailUrl: string;
    gameUrl: string;
    uploadedByUserId: mongoose.Types.ObjectId;
    status: Status;
    createdAt: Date;
    updatedAt: Date;
}

const GameSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    thumbnailUrl: { type: String, required: true },
    gameUrl: { type: String, required: true },
    uploadedByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: Object.values(Status), default: Status.ACTIVE },
}, { timestamps: true });

export default mongoose.model<IGame>('Game', GameSchema);