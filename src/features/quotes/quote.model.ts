import mongoose, { Schema, Document } from "mongoose";

export interface IQuote extends Document {
  jobId: string;
  artisanId: string;
  price: number;
  description: string;
  estimatedDuration: string;
  materials?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COUNTERED';
  counterOffer?: number;
  createdAt: Date;
  updatedAt: Date;
}

const QuoteSchema: Schema = new Schema(
  {
    jobId: { type: String, required: true },
    artisanId: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    estimatedDuration: { type: String, required: true },
    materials: { type: String },
    status: { 
      type: String, 
      required: true, 
      enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'COUNTERED'],
      default: 'PENDING'
    },
    counterOffer: { type: Number },
  },
  {
    timestamps: true,
  }
);

export const Quote = mongoose.models.Quote || mongoose.model<IQuote>("Quote", QuoteSchema);
