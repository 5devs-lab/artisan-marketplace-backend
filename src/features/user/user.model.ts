import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  role: 'artisan' | 'user' | 'admin';
  gender?: string;
  firstName?: string;
  lastName?: string;
  nin?: string;
  phone?: string;
  stateOfOrigin?: string;
  nationality?: string;
  address?: string;
  isVerified: boolean;
  otp?: string;
  otpExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true, enum: ['artisan', 'user', 'admin'], default: "user" },
    gender: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    nin: { type: String },
    phone: { type: String },
    stateOfOrigin: { type: String },
    nationality: { type: String },
    address: { type: String },
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete (ret as any).passwordHash;
        return ret;
      }
    }
  }
);

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
