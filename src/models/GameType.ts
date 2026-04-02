import mongoose, { Schema, Document } from 'mongoose';
import { Status } from './User'; // Status enum එක User.ts එකෙන් ගන්නවා

export interface IGameType extends Document {
    name: string;
    description: string;
    status: Status;
    createdAt: Date;
    updatedAt: Date;
}

const GameTypeSchema: Schema = new Schema({
    // නම: උදාහරණයක් විදිහට "Mini Game", "Level-Based"
    name: { type: String, required: true, unique: true },
    
    // විස්තරය: මේ ගේම් වර්ගය ගැන පොඩි විස්තරයක්
    description: { type: String, required: true },
    
    status: { type: String, enum: Object.values(Status), default: Status.ACTIVE },
}, { timestamps: true });

export default mongoose.model<IGameType>('GameType', GameTypeSchema);