import mongoose, { Schema, Document } from 'mongoose';
import { Status } from './User'; // Status enum එක (ACTIVE, INACTIVE) ගන්නවා

export interface ITag extends Document {
    name: string;
    status: Status;
    createdAt: Date;
    updatedAt: Date;
}

const TagSchema: Schema = new Schema({
    name: { type: String, required: true, unique: true },
    status: { type: String, enum: Object.values(Status), default: Status.ACTIVE },
}, { timestamps: true });

export default mongoose.model<ITag>('Tag', TagSchema);