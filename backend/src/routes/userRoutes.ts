import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import * as userController from '../controllers/userController';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Profile routes
router.get('/profile', asyncHandler(userController.getProfile));
router.put('/profile', asyncHandler(userController.updateProfile));
router.put('/avatar', asyncHandler(userController.updateAvatar));
router.put('/banner', asyncHandler(userController.updateBanner));

export default router;
