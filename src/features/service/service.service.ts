import { Service, IService } from './service.model.js';
import { Types } from 'mongoose';

export class ServiceService {
  async createService(artisanId: string | Types.ObjectId, data: Partial<IService>) {
    const service = new Service({
      ...data,
      artisanId: new Types.ObjectId(artisanId),
    });
    return await service.save();
  }

  async getServices(filters: { category?: string; city?: string; state?: string; search?: string }, page = 1, limit = 10) {
    const query: any = {};

    if (filters.category) query.category = filters.category;
    if (filters.city) query['location.city'] = { $regex: filters.city, $options: 'i' };
    if (filters.state) query['location.state'] = { $regex: filters.state, $options: 'i' };
    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    const services = await Service.find(query)
      .populate('artisanId', 'firstName lastName email phone')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Service.countDocuments(query);

    return {
      services,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async getServiceById(id: string) {
    return await Service.findById(id).populate('artisanId', 'firstName lastName email phone');
  }

  async updateService(id: string, artisanId: string | Types.ObjectId, data: Partial<IService>) {
    const service = await Service.findOne({ _id: id, artisanId });
    if (!service) {
      throw new Error('Service not found or you are not the owner');
    }

    Object.assign(service, data);
    return await service.save();
  }

  async deleteService(id: string, artisanId: string | Types.ObjectId) {
    const service = await Service.findOneAndDelete({ _id: id, artisanId });
    if (!service) {
      throw new Error('Service not found or you are not the owner');
    }
    return service;
  }
}

export const serviceService = new ServiceService();
