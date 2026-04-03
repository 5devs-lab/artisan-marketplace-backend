import { Router } from 'express';
import { serviceController } from './service.controller.js';
import { protect, restrictTo } from '../../middlewares/auth.middleware.js';

const router = Router();

// Public routes
router.get('/', serviceController.getServices);
router.get('/:id', serviceController.getServiceById);

// Protected routes (Artisan only for creation)
router.post('/', protect, restrictTo('artisan'), serviceController.createService);

// Protected routes (Owner only - handled inside controller/service)
router.patch('/:id', protect, serviceController.updateService);
router.delete('/:id', protect, serviceController.deleteService);

export default router;
