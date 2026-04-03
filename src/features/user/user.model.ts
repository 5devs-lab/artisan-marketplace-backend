import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  role: string;
  gender?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true, default: "user" },
    gender: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    phone: { type: String },
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
