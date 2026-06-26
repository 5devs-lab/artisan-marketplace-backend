import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  jobId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema = new Schema(
  {
    jobId: { type: String, required: true },
    reviewerId: { type: String, required: true },
    revieweeId: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// Create compound index to ensure one review per participant per job
ReviewSchema.index({ jobId: 1, reviewerId: 1 }, { unique: true });

export const Review = mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);
