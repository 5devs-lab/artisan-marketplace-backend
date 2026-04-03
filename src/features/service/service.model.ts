import mongoose, { Schema, Document, Types } from "mongoose";

export interface IService extends Document {
  artisanId: Types.ObjectId;
  title: string;
  description: string;
  category: string;
  basePrice: number;
  location: {
    address: string;
    city: string;
    state: string;
  };
  images: string[];
  isAvailable: boolean;
  createdAt: Date;
}

const ServiceSchema: Schema = new Schema(
  {
    artisanId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    basePrice: { type: Number, required: true },
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
    },
    images: [{ type: String }],
    isAvailable: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// Index for search optimization
ServiceSchema.index({ title: 'text', description: 'text', category: 'text' });
ServiceSchema.index({ 'location.city': 1, 'location.state': 1 });

export const Service = mongoose.models.Service || mongoose.model<IService>("Service", ServiceSchema);
