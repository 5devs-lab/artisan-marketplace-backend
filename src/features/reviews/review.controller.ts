import { Request, Response } from 'express';
import { ReviewService } from './review.service.js';

export class ReviewController {
  static async createReview(req: any, res: Response) {
    try {
      const { jobId, reviewerId, revieweeId, rating, comment } = req.body;

      // Validation
      if (!jobId || !reviewerId || !revieweeId || !rating || !comment) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      // Business rule: Rating must be between 1 and 5
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }

      // Business rule: Customer reviews Artisan, Artisan reviews Customer
      // This should be verified by checking the job participants
      // For now, we'll proceed with the service logic

      const reviewData = {
        jobId,
        reviewerId,
        revieweeId,
        rating,
        comment,
      };

      const review = await ReviewService.createReview(reviewData);
      res.status(201).json({
        message: 'Review created successfully',
        review,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async getReviewById(req: any, res: Response) {
    try {
      const { id } = req.params;
      const review = await ReviewService.getReviewById(id);
      res.status(200).json({ review });
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }

  static async getReviewsByArtisan(req: any, res: Response) {
    try {
      const { id } = req.params;
      const reviews = await ReviewService.getReviewsByArtisan(id);
      res.status(200).json({ reviews });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async getAverageRating(req: any, res: Response) {
    try {
      const { id } = req.params;
      const averageRating = await ReviewService.getAverageRating(id);
      res.status(200).json({ averageRating });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async updateReview(req: any, res: Response) {
    try {
      const { id } = req.params;
      const { rating, comment } = req.body;

      const updateData: any = {};
      if (rating !== undefined) {
        if (rating < 1 || rating > 5) {
          return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }
        updateData.rating = rating;
      }
      if (comment !== undefined) updateData.comment = comment;

      const review = await ReviewService.updateReview(id, updateData);
      res.status(200).json({
        message: 'Review updated successfully',
        review,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async deleteReview(req: any, res: Response) {
    try {
      const { id } = req.params;
      const review = await ReviewService.deleteReview(id);
      res.status(200).json({
        message: 'Review deleted successfully',
        review,
      });
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }
}
