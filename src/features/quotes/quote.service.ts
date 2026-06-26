import { Quote, IQuote } from './quote.model.js';
import { Job } from '../jobs/job.model.js';

export class QuoteService {
  static async createQuote(quoteData: Partial<IQuote>) {
    // Check if job exists and is open for quoting
    const job = await Job.findById(quoteData.jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    // Business rule: Prevent quoting on closed jobs
    if (job.status !== 'OPEN' && job.status !== 'NEGOTIATING') {
      throw new Error('Cannot quote on a closed or completed job');
    }

    const quote = new Quote(quoteData);
    await quote.save();
    
    // Update job status to NEGOTIATING if it was OPEN
    if (job.status === 'OPEN') {
      await Job.findByIdAndUpdate(job._id, { status: 'NEGOTIATING' });
    }
    
    return quote;
  }

  static async getQuotesByJob(jobId: string) {
    const quotes = await Quote.find({ jobId }).sort({ createdAt: -1 });
    return quotes;
  }

  static async getQuoteById(quoteId: string) {
    const quote = await Quote.findById(quoteId);
    if (!quote) {
      throw new Error('Quote not found');
    }
    return quote;
  }

  static async updateQuote(quoteId: string, updateData: Partial<IQuote>) {
    const quote = await Quote.findById(quoteId);
    if (!quote) {
      throw new Error('Quote not found');
    }

    // Business rule: Prevent editing accepted quotes
    if (quote.status === 'ACCEPTED') {
      throw new Error('Cannot edit an accepted quote');
    }

    const updatedQuote = await Quote.findByIdAndUpdate(
      quoteId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return updatedQuote;
  }

  static async deleteQuote(quoteId: string) {
    const quote = await Quote.findById(quoteId);
    if (!quote) {
      throw new Error('Quote not found');
    }

    // Business rule: Prevent deleting accepted quotes
    if (quote.status === 'ACCEPTED') {
      throw new Error('Cannot delete an accepted quote');
    }

    await Quote.findByIdAndDelete(quoteId);
    return quote;
  }

  static async acceptQuote(quoteId: string) {
    const quote = await Quote.findById(quoteId);
    if (!quote) {
      throw new Error('Quote not found');
    }

    if (quote.status !== 'PENDING' && quote.status !== 'COUNTERED') {
      throw new Error('Quote cannot be accepted in its current state');
    }

    // Update quote status
    quote.status = 'ACCEPTED';
    await quote.save();

    // Update job status and set accepted quote
    await Job.findByIdAndUpdate(quote.jobId, { 
      status: 'ACCEPTED',
      acceptedQuoteId: quoteId 
    });

    // Business rule: Reject remaining quotes automatically
    await Quote.updateMany(
      { jobId: quote.jobId, _id: { $ne: quoteId } },
      { status: 'REJECTED' }
    );

    return quote;
  }

  static async rejectQuote(quoteId: string) {
    const quote = await Quote.findById(quoteId);
    if (!quote) {
      throw new Error('Quote not found');
    }

    if (quote.status === 'ACCEPTED') {
      throw new Error('Cannot reject an accepted quote');
    }

    quote.status = 'REJECTED';
    await quote.save();

    return quote;
  }

  static async counterQuote(quoteId: string, counterPrice: number) {
    const quote = await Quote.findById(quoteId);
    if (!quote) {
      throw new Error('Quote not found');
    }

    if (quote.status === 'ACCEPTED') {
      throw new Error('Cannot counter an accepted quote');
    }

    quote.counterOffer = counterPrice;
    quote.status = 'COUNTERED';
    await quote.save();

    return quote;
  }
}
