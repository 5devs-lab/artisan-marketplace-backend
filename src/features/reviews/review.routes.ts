import express from 'express';
import { ReviewController } from './review.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Artisan-specific routes (must come before /:id)
router.get('/artisan/:id/reviews', protect, ReviewController.getReviewsByArtisan);
router.get('/artisan/:id/average-rating', protect, ReviewController.getAverageRating);

// Generic review routes
router.post('/', protect, ReviewController.createReview);
router.get('/:id', protect, ReviewController.getReviewById);
router.patch('/:id', protect, ReviewController.updateReview);
router.delete('/:id', protect, ReviewController.deleteReview);

export default router;
