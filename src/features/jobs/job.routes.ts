import express from 'express';
import { JobController } from './job.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';
import { QuoteController } from '../quotes/quote.controller.js';

const router = express.Router();

router.post('/', protect, JobController.createJob);
router.get('/', protect, JobController.getJobs);
router.get('/:id', protect, JobController.getJobById);
router.get('/:id/quotes', protect, QuoteController.getQuotesByJob);
router.patch('/:id', protect, JobController.updateJob);
router.delete('/:id', protect, JobController.deleteJob);
router.patch('/:id/start', protect, JobController.startJob);
router.patch('/:id/complete', protect, JobController.completeJob);
router.patch('/:id/confirm', protect, JobController.confirmJob);

export default router;
