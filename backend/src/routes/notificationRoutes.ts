import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import * as notificationController from '../controllers/notificationController';

const router = Router();

router.get('/', authenticate, asyncHandler(notificationController.getMyNotifications));
router.get('/unread-count', authenticate, asyncHandler(notificationController.getUnreadCount));
// Specific paths before parameterized ones
router.put('/mark-all-read', authenticate, asyncHandler(notificationController.markAllAsRead));
router.get('/:notificationId', authenticate, asyncHandler(notificationController.getNotification));
router.put('/:notificationId/read', authenticate, asyncHandler(notificationController.markAsRead));
router.delete('/:notificationId', authenticate, asyncHandler(notificationController.deleteNotification));
router.delete('/', authenticate, asyncHandler(notificationController.deleteAllRead));

export default router;
