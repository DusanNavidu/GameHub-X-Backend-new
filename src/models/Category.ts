import mongoose, { Schema, Document } from 'mongoose';

export enum CategoryStatus { ACTIVE = 'ACTIVE', INACTIVE = 'INACTIVE' }

export interface ICategory extends Document {
    name: string;
    description: string;
    status: CategoryStatus;
    createdAt: Date;
    updatedAt: Date;
}

const CategorySchema: Schema = new Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String, required: false },
    status: { 
        type: String, 
        enum: Object.values(CategoryStatus), 
        default: CategoryStatus.ACTIVE 
    },
}, { timestamps: true });

export default mongoose.model<ICategory>('Category', CategorySchema);