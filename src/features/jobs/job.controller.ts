import { Request, Response } from 'express';
import { JobService } from './job.service.js';

export class JobController {
  static async createJob(req: any, res: Response) {
    try {
      const { customerId, serviceId, title, description, location, budget } = req.body;

      if (!customerId || !serviceId || !title || !description || !location || !budget) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      if (budget <= 0) {
        return res.status(400).json({ message: 'Budget must be greater than 0' });
      }

      const jobData = {
        customerId,
        serviceId,
        title,
        description,
        location,
        budget,
        status: 'OPEN',
      };

      const job = await JobService.createJob(jobData);
      res.status(201).json({
        message: 'Job created successfully',
        job,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async getJobs(req: any, res: Response) {
    try {
      const { customerId, status, serviceId } = req.query;
      const filters: any = {};

      if (customerId) filters.customerId = customerId;
      if (status) filters.status = status;
      if (serviceId) filters.serviceId = serviceId;

      const jobs = await JobService.getJobs(filters);
      res.status(200).json({ jobs });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async getJobById(req: any, res: Response) {
    try {
      const { id } = req.params;
      const job = await JobService.getJobById(id);
      res.status(200).json({ job });
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }

  static async updateJob(req: any, res: Response) {
    try {
      const { id } = req.params;
      const { title, description, location, budget } = req.body;

      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (location !== undefined) updateData.location = location;
      if (budget !== undefined) {
        if (budget <= 0) {
          return res.status(400).json({ message: 'Budget must be greater than 0' });
        }
        updateData.budget = budget;
      }

      const job = await JobService.updateJob(id, updateData);
      res.status(200).json({
        message: 'Job updated successfully',
        job,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async deleteJob(req: any, res: Response) {
    try {
      const { id } = req.params;
      const job = await JobService.deleteJob(id);
      res.status(200).json({
        message: 'Job deleted successfully',
        job,
      });
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }

  static async startJob(req: any, res: Response) {
    try {
      const { id } = req.params;
      
      // TODO: Integrate with Wallet Service to lock escrow funds
      // For now, we'll implement the status transition
      // In production, this should call the wallet service first
      
      const job = await JobService.updateJobStatus(id, 'IN_PROGRESS');
      
      // TODO: Trigger notification - Job Started
      
      res.status(200).json({
        message: 'Job started successfully',
        job,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async completeJob(req: any, res: Response) {
    try {
      const { id } = req.params;
      const job = await JobService.updateJobStatus(id, 'COMPLETED');
      
      // TODO: Trigger notification - Job Completed
      
      res.status(200).json({
        message: 'Job marked as completed',
        job,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async confirmJob(req: any, res: Response) {
    try {
      const { id } = req.params;
      const job = await JobService.updateJobStatus(id, 'CLOSED');
      
      // TODO: Trigger notification - Payment Released
      // TODO: Integrate with Wallet Service to release funds
      
      res.status(200).json({
        message: 'Job confirmed and closed',
        job,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
