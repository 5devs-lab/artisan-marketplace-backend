import { Request, Response } from 'express';
import { UserService } from './user.service.js';

export class UserController {
  static async getMe(req: any, res: Response) {
    res.status(200).json({ user: req.user });
  }

  static async updateProfile(req: any, res: Response) {
    try {
      const updatedUser = await UserService.updateProfile(req.user.id, req.body);
      res.status(200).json({
        message: 'Profile updated successfully',
        user: updatedUser,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
