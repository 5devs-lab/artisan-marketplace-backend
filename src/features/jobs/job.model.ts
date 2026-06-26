import mongoose, { Schema, Document } from "mongoose";

export interface IJob extends Document {
  customerId: string;
  serviceId: string;
  title: string;
  description: string;
  location: string;
  budget: number;
  status: 'OPEN' | 'NEGOTIATING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'ESCROW_LOCKED' | 'CLOSED';
  acceptedQuoteId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema: Schema = new Schema(
  {
    customerId: { type: String, required: true },
    serviceId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    budget: { type: Number, required: true },
    status: { 
      type: String, 
      required: true, 
      enum: ['OPEN', 'NEGOTIATING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ESCROW_LOCKED', 'CLOSED'],
      default: 'OPEN'
    },
    acceptedQuoteId: { type: String },
  },
  {
    timestamps: true,
  }
);

export const Job = mongoose.models.Job || mongoose.model<IJob>("Job", JobSchema);
