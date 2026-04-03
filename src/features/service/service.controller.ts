import { Request, Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware.js';
import { serviceService } from './service.service.js';

export class ServiceController {
  async createService(req: AuthRequest, res: Response) {
    try {
      const service = await serviceService.createService(req.user._id, req.body);
      res.status(201).json(service);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async getServices(req: Request, res: Response) {
    try {
      const { category, city, state, search, page, limit } = req.query;
      const result = await serviceService.getServices(
        { 
          category: category as string, 
          city: city as string, 
          state: state as string, 
          search: search as string 
        },
        Number(page) || 1,
        Number(limit) || 10
      );
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async getServiceById(req: Request, res: Response) {
    try {
      const service = await serviceService.getServiceById(req.params.id as string);
      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }
      res.json(service);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async updateService(req: AuthRequest, res: Response) {
    try {
      const service = await serviceService.updateService(req.params.id as string, req.user._id, req.body);
      res.json(service);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async deleteService(req: AuthRequest, res: Response) {
    try {
      await serviceService.deleteService(req.params.id as string, req.user._id);
      res.status(204).send();
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}

export const serviceController = new ServiceController();
