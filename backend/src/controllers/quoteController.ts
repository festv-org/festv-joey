// TODO: rewire to new schema — Quote engine being rebuilt for Package/AddOn pricing model
import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const createQuote = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  return res.json({ success: true, data: null, message: 'Quote engine being rebuilt' });
});

export const sendQuote = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  return res.json({ success: true, data: null, message: 'Quote engine being rebuilt' });
});

export const getMyQuotes = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  return res.json({ success: true, data: null, message: 'Quote engine being rebuilt' });
});

export const getQuote = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  return res.json({ success: true, data: null, message: 'Quote engine being rebuilt' });
});

export const acceptQuote = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  return res.json({ success: true, data: null, message: 'Quote engine being rebuilt' });
});

export const rejectQuote = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  return res.json({ success: true, data: null, message: 'Quote engine being rebuilt' });
});

export const withdrawQuote = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  return res.json({ success: true, data: null, message: 'Quote engine being rebuilt' });
});

export const updateQuote = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  return res.json({ success: true, data: null, message: 'Quote engine being rebuilt' });
});

export const getQuotesForEvent = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  return res.json({ success: true, data: null, message: 'Quote engine being rebuilt' });
});
