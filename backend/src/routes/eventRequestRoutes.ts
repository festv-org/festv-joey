/**
 * Event Request Routes
 *
 * All routes require authentication. Static segments are registered before
 * the /:id wildcard to prevent Express from swallowing them.
 *
 * Public route matrix:
 *   POST   /               → createEventRequest       (CLIENT)
 *   GET    /me/client      → getMyRequestsAsClient    (CLIENT)
 *   GET    /me/vendor      → getMyRequestsAsVendor    (PROVIDER)
 *   GET    /incoming       → getIncomingRequests      (PROVIDER)
 *   GET    /:id            → getEventRequestById      (CLIENT or VENDOR who owns it)
 *   PATCH  /:id/status     → updateEventRequestStatus (CLIENT cancels / VENDOR declines)
 */

import { Router } from 'express';
import { authenticate, requireClient, requireProvider } from '../middleware/auth.js';
import {
  createEventRequest,
  getMyRequestsAsClient,
  getMyRequestsAsVendor,
  getIncomingRequests,
  getEventRequestById,
  updateEventRequestStatus,
} from '../controllers/eventRequestController.js';

const router = Router();

// ── Static segments (must precede /:id) ──────────────────────────────────────
router.get('/me/client',  authenticate, requireClient,   getMyRequestsAsClient);
router.get('/me/vendor',  authenticate, requireProvider, getMyRequestsAsVendor);
router.get('/incoming',   authenticate, requireProvider, getIncomingRequests);

// ── Collection ────────────────────────────────────────────────────────────────
router.post('/',          authenticate, requireClient,   createEventRequest);

// ── Single resource ───────────────────────────────────────────────────────────
router.get('/:id',             authenticate,             getEventRequestById);
router.patch('/:id/status',    authenticate,             updateEventRequestStatus);

export default router;
