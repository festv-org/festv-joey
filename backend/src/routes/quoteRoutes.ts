import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate, requireClient, requireProvider } from '../middleware/auth';
import * as quoteController from '../controllers/quoteController';

const router = Router();

// Provider routes
router.post('/', authenticate, requireProvider, asyncHandler(quoteController.createQuote));
router.post('/:id/send', authenticate, requireProvider, asyncHandler(quoteController.sendQuote));
router.post('/:id/withdraw', authenticate, requireProvider, asyncHandler(quoteController.withdrawQuote));
router.put('/:id', authenticate, requireProvider, asyncHandler(quoteController.updateQuote));

// Client routes
router.post('/:id/accept', authenticate, requireClient, asyncHandler(quoteController.acceptQuote));
router.post('/:id/reject', authenticate, requireClient, asyncHandler(quoteController.rejectQuote));

// Shared routes
router.get('/my-quotes', authenticate, asyncHandler(quoteController.getMyQuotes));
router.get('/:id', authenticate, asyncHandler(quoteController.getQuote));
router.get('/event/:eventRequestId', authenticate, asyncHandler(quoteController.getQuotesForEvent));

export default router;
