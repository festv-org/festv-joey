import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate, requireClient, requireProvider } from '../middleware/auth';
import * as bookingController from '../controllers/bookingController';

const router = Router();

// Client routes
router.get('/client', authenticate, requireClient, asyncHandler(bookingController.getClientBookings));
router.post('/:id/pay-deposit', authenticate, requireClient, asyncHandler(bookingController.payDeposit));
router.post('/:id/pay-balance', authenticate, requireClient, asyncHandler(bookingController.payBalance));

// Provider routes
router.get('/provider', authenticate, requireProvider, asyncHandler(bookingController.getProviderBookings));
router.post('/:id/confirm', authenticate, requireProvider, asyncHandler(bookingController.confirmBooking));
router.post('/:id/start', authenticate, requireProvider, asyncHandler(bookingController.startBooking));
router.post('/:id/complete', authenticate, requireProvider, asyncHandler(bookingController.completeBooking));

// Shared routes
router.get('/upcoming', authenticate, asyncHandler(bookingController.getUpcomingBookings));
router.get('/:id', authenticate, asyncHandler(bookingController.getBooking));
router.post('/:id/cancel', authenticate, asyncHandler(bookingController.cancelBooking));

export default router;
