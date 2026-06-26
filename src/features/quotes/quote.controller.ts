import { Request, Response } from 'express';
import { QuoteService } from './quote.service.js';

export class QuoteController {
  static async createQuote(req: any, res: Response) {
    try {
      const { jobId, artisanId, price, description, estimatedDuration, materials } = req.body;

      // Validation
      if (!jobId || !artisanId || !price || !description || !estimatedDuration) {
        return res.status(400).json({ message: 'All required fields must be provided' });
      }

      if (price <= 0) {
        return res.status(400).json({ message: 'Price must be greater than 0' });
      }

      // Business rule: Only artisans can submit quotes
      // This should be verified by the auth middleware
      // For now, we'll check if the user role is artisan
      if (req.user.role !== 'artisan') {
        return res.status(403).json({ message: 'Only artisans can submit quotes' });
      }

      const quoteData = {
        jobId,
        artisanId,
        price,
        description,
        estimatedDuration,
        materials,
        status: 'PENDING',
      };

      const quote = await QuoteService.createQuote(quoteData);
      
      // TODO: Trigger notification - New Quote to Customer
      
      res.status(201).json({
        message: 'Quote created successfully',
        quote,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async getQuotesByJob(req: any, res: Response) {
    try {
      const { id } = req.params;
      const quotes = await QuoteService.getQuotesByJob(id);
      res.status(200).json({ quotes });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async getQuoteById(req: any, res: Response) {
    try {
      const { id } = req.params;
      const quote = await QuoteService.getQuoteById(id);
      res.status(200).json({ quote });
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }

  static async updateQuote(req: any, res: Response) {
    try {
      const { id } = req.params;
      const { price, description, estimatedDuration, materials } = req.body;

      const updateData: any = {};
      if (price !== undefined) {
        if (price <= 0) {
          return res.status(400).json({ message: 'Price must be greater than 0' });
        }
        updateData.price = price;
      }
      if (description !== undefined) updateData.description = description;
      if (estimatedDuration !== undefined) updateData.estimatedDuration = estimatedDuration;
      if (materials !== undefined) updateData.materials = materials;

      const quote = await QuoteService.updateQuote(id, updateData);
      res.status(200).json({
        message: 'Quote updated successfully',
        quote,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async deleteQuote(req: any, res: Response) {
    try {
      const { id } = req.params;
      const quote = await QuoteService.deleteQuote(id);
      res.status(200).json({
        message: 'Quote deleted successfully',
        quote,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async acceptQuote(req: any, res: Response) {
    try {
      const { id } = req.params;

      // Business rule: Customer owns acceptance
      // This should be verified by checking if the user owns the job
      // For now, we'll proceed with the service logic
      
      const quote = await QuoteService.acceptQuote(id);
      
      // TODO: Trigger notification - Quote Accepted to Artisan
      
      res.status(200).json({
        message: 'Quote accepted successfully',
        quote,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async rejectQuote(req: any, res: Response) {
    try {
      const { id } = req.params;
      const quote = await QuoteService.rejectQuote(id);
      
      // TODO: Trigger notification - Quote Rejected to Artisan
      
      res.status(200).json({
        message: 'Quote rejected successfully',
        quote,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async counterQuote(req: any, res: Response) {
    try {
      const { id } = req.params;
      const { counterPrice } = req.body;

      if (!counterPrice || counterPrice <= 0) {
        return res.status(400).json({ message: 'Counter price must be greater than 0' });
      }

      const quote = await QuoteService.counterQuote(id, counterPrice);
      
      // TODO: Trigger notification - Counter Offer to Artisan
      
      res.status(200).json({
        message: 'Counter offer submitted successfully',
        quote,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
