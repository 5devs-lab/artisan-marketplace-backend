import { Job, IJob } from './job.model.js';

export class JobService {
  static async createJob(jobData: Partial<IJob>) {
    const job = new Job(jobData);
    await job.save();
    return job;
  }

  static async getJobs(filters: any = {}) {
    const query: any = {};
    
    if (filters.customerId) {
      query.customerId = filters.customerId;
    }
    
    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.serviceId) {
      query.serviceId = filters.serviceId;
    }

    const jobs = await Job.find(query).sort({ createdAt: -1 });
    return jobs;
  }

  static async getJobById(jobId: string) {
    const job = await Job.findById(jobId);
    if (!job) {
      throw new Error('Job not found');
    }
    return job;
  }

  static async updateJob(jobId: string, updateData: Partial<IJob>) {
    const job = await Job.findByIdAndUpdate(
      jobId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!job) {
      throw new Error('Job not found');
    }

    return job;
  }

  static async deleteJob(jobId: string) {
    const job = await Job.findByIdAndDelete(jobId);
    if (!job) {
      throw new Error('Job not found');
    }
    return job;
  }

  static async updateJobStatus(jobId: string, status: IJob['status']) {
    const job = await Job.findByIdAndUpdate(
      jobId,
      { $set: { status } },
      { new: true, runValidators: true }
    );

    if (!job) {
      throw new Error('Job not found');
    }

    return job;
  }

  static async setAcceptedQuote(jobId: string, quoteId: string) {
    const job = await Job.findByIdAndUpdate(
      jobId,
      { $set: { acceptedQuoteId: quoteId, status: 'ACCEPTED' } },
      { new: true, runValidators: true }
    );

    if (!job) {
      throw new Error('Job not found');
    }

    return job;
  }
}
