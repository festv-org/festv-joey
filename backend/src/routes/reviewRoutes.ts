import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate, requireClient, requireProvider, optionalAuth } from '../middleware/auth';
import * as reviewController from '../controllers/reviewController';

const router = Router();

// Public routes
router.get('/provider/:providerId', optionalAuth, asyncHandler(reviewController.getProviderReviews));
router.get('/:reviewId', optionalAuth, asyncHandler(reviewController.getReview));

// Client routes
router.post('/', authenticate, requireClient, asyncHandler(reviewController.createReview));
router.put('/:reviewId', authenticate, requireClient, asyncHandler(reviewController.updateReview));
router.delete('/:reviewId', authenticate, asyncHandler(reviewController.deleteReview));
router.get('/my/reviews', authenticate, requireClient, asyncHandler(reviewController.getMyReviews));
router.post('/:reviewId/toggle-visibility', authenticate, requireClient, asyncHandler(reviewController.toggleReviewVisibility));

// Provider routes
router.post('/:reviewId/respond', authenticate, requireProvider, asyncHandler(reviewController.respondToReview));

// Reporting
router.post('/:reviewId/report', authenticate, asyncHandler(reviewController.reportReview));

export default router;
