import { Request, Response } from 'express';
import { UserService } from './user.service.js';

export class UserController {
  static async getMe(req: any, res: Response) {
    res.status(200).json({ user: req.user });
  }

  // Future profile methods (updateProfile, deleteAccount, etc.)
}
