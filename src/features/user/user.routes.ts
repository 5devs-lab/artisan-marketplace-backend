import express from 'express';
import { UserController } from './user.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/me', protect, UserController.getMe);
router.patch('/profile', protect, UserController.updateProfile);

export default router;
