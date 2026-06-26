import express from 'express';
import { QuoteController } from './quote.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', protect, QuoteController.createQuote);
router.get('/:id', protect, QuoteController.getQuoteById);
router.patch('/:id', protect, QuoteController.updateQuote);
router.delete('/:id', protect, QuoteController.deleteQuote);
router.post('/:id/accept', protect, QuoteController.acceptQuote);
router.post('/:id/reject', protect, QuoteController.rejectQuote);
router.post('/:id/counter', protect, QuoteController.counterQuote);

export default router;
