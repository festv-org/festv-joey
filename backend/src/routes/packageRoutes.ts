/**
 * Package, AddOn, and Availability routes
 *
 * Mounted in routes/index.ts as:
 *   router.use('/packages',    packageRoutes)
 *   router.use('/addons',      addonRoutes)        — re-exported from this file
 *   router.use('/availability', availabilityRoutes) — re-exported from this file
 *
 * Auth matrix:
 *   Public   — GET /packages/:id, POST /packages/estimate, GET /availability/check
 *   Provider — everything else
 */

import { Router } from 'express';
import { authenticate, requireProvider } from '../middleware/auth.js';
import {
  // Package CRUD
  createPackage,
  getMyPackages,
  getPackageById,
  updatePackage,
  deletePackage,
  togglePackageActive,
  reorderPackages,
  // Seasonal rules
  addSeasonalRule,
  updateSeasonalRule,
  deleteSeasonalRule,
  // Day-of-week rules
  addDayOfWeekRule,
  updateDayOfWeekRule,
  deleteDayOfWeekRule,
  // Add-ons
  createAddOn,
  getMyAddOns,
  updateAddOn,
  deleteAddOn,
  // Estimate
  getEstimate,
  // Availability
  blockDate,
  getMyBlocks,
  deleteBlock,
  checkAvailability,
} from '../controllers/packageController.js';

// ─── Package router ───────────────────────────────────────────────────────────
const packageRouter = Router();

// Static segments must be declared before /:id to avoid Express swallowing them
// Public routes (no auth)
packageRouter.post('/estimate',  getEstimate);

// Provider-only static-segment routes (before /:id)
packageRouter.get('/me',         authenticate, requireProvider, getMyPackages);
packageRouter.patch('/reorder',  authenticate, requireProvider, reorderPackages);

// Provider-only routes
packageRouter.post('/',          authenticate, requireProvider, createPackage);
packageRouter.get('/:id',        getPackageById);                                  // public
packageRouter.put('/:id',        authenticate, requireProvider, updatePackage);
packageRouter.delete('/:id',     authenticate, requireProvider, deletePackage);
packageRouter.patch('/:id/toggle', authenticate, requireProvider, togglePackageActive);

// Seasonal rules
packageRouter.post('/:id/seasonal-rules',              authenticate, requireProvider, addSeasonalRule);
packageRouter.put('/:id/seasonal-rules/:ruleId',       authenticate, requireProvider, updateSeasonalRule);
packageRouter.delete('/:id/seasonal-rules/:ruleId',    authenticate, requireProvider, deleteSeasonalRule);

// Day-of-week rules
packageRouter.post('/:id/dow-rules',               authenticate, requireProvider, addDayOfWeekRule);
packageRouter.put('/:id/dow-rules/:ruleId',        authenticate, requireProvider, updateDayOfWeekRule);
packageRouter.delete('/:id/dow-rules/:ruleId',     authenticate, requireProvider, deleteDayOfWeekRule);

// ─── AddOn router ─────────────────────────────────────────────────────────────
const addonRouter = Router();

addonRouter.post('/',       authenticate, requireProvider, createAddOn);
addonRouter.get('/me',      authenticate, requireProvider, getMyAddOns);   // static before /:id
addonRouter.put('/:id',     authenticate, requireProvider, updateAddOn);
addonRouter.delete('/:id',  authenticate, requireProvider, deleteAddOn);

// ─── Availability router ──────────────────────────────────────────────────────
const availabilityRouter = Router();

// Static segments before /:id
availabilityRouter.get('/check',  checkAvailability);                              // public
availabilityRouter.get('/me',     authenticate, requireProvider, getMyBlocks);

// Other routes
availabilityRouter.post('/',      authenticate, requireProvider, blockDate);
availabilityRouter.delete('/:id', authenticate, requireProvider, deleteBlock);

export default packageRouter;
export { addonRouter, availabilityRouter };
