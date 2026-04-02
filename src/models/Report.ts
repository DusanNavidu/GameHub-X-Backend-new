import mongoose, { Schema, Document } from 'mongoose';

export enum ReportReason {
    NOT_WORKING = 'NOT_WORKING',
    INAPPROPRIATE_CONTENT = 'INAPPROPRIATE_CONTENT',
    SPAM = 'SPAM',
    OTHER = 'OTHER'
}

export interface IReport extends Document {
    userId: mongoose.Types.ObjectId;
    gameId: mongoose.Types.ObjectId;
    reason: ReportReason;
    description?: string;
    isResolved: boolean;
    createdAt: Date;
}

const ReportSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    gameId: { type: Schema.Types.ObjectId, ref: 'Game', required: true },
    reason: { type: String, enum: Object.values(ReportReason), required: true },
    description: { type: String, maxlength: 500 },
    isResolved: { type: Boolean, default: false }, // Admin ට විසඳන්න පුළුවන්
}, { timestamps: true });

export default mongoose.model<IReport>('Report', ReportSchema);