import { Review, IReview } from './review.model.js';
import { Job } from '../jobs/job.model.js';

export class ReviewService {
  static async createReview(reviewData: Partial<IReview>) {
    // Business rule: Only completed jobs can be reviewed
    const job = await Job.findById(reviewData.jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    if (job.status !== 'CLOSED') {
      throw new Error('Only completed jobs can be reviewed');
    }

    const review = new Review(reviewData);
    await review.save();
    return review;
  }

  static async getReviewById(reviewId: string) {
    const review = await Review.findById(reviewId);
    if (!review) {
      throw new Error('Review not found');
    }
    return review;
  }

  static async getReviewsByArtisan(artisanId: string) {
    const reviews = await Review.find({ revieweeId: artisanId }).sort({ createdAt: -1 });
    return reviews;
  }

  static async getReviewsByJob(jobId: string) {
    const reviews = await Review.find({ jobId }).sort({ createdAt: -1 });
    return reviews;
  }

  static async updateReview(reviewId: string, updateData: Partial<IReview>) {
    const review = await Review.findByIdAndUpdate(
      reviewId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!review) {
      throw new Error('Review not found');
    }

    return review;
  }

  static async deleteReview(reviewId: string) {
    const review = await Review.findByIdAndDelete(reviewId);
    if (!review) {
      throw new Error('Review not found');
    }
    return review;
  }

  static async getAverageRating(artisanId: string) {
    const reviews = await Review.find({ revieweeId: artisanId });
    
    if (reviews.length === 0) {
      return 0;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    
    return Math.round(averageRating * 10) / 10; // Round to 1 decimal place
  }
}
