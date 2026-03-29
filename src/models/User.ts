import mongoose, { Schema, Document } from 'mongoose';

export enum Role { ADMIN = 'ADMIN', PLAYER = 'PLAYER' }
export enum Status { ACTIVE = 'ACTIVE', INACTIVE = 'INACTIVE' }

export interface IUSER extends Document {
  fullname: string;
  email: string;
  role: Role;
  status: Status;
  otp?: string | null;
  otpExpiryTime?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  fullname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: Object.values(Role), default: Role.PLAYER },
  status: { type: String, enum: Object.values(Status), default: Status.ACTIVE },
  otp: { type: String, default: null },
  otpExpiryTime: { type: Date, default: null },
}, { timestamps: true });

export const User = mongoose.model<IUSER>('User', UserSchema);