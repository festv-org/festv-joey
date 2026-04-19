import { Router } from 'express';
import { activityLogger, ActivityType } from '../services/activityLogger.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Get recent activities (admin only)
router.get('/recent', authenticate, requireAdmin, (req, res) => {
  const limit = parseInt(req.query.limit as string) || 50;
  const activities = activityLogger.getRecent(limit);
  
  res.json({
    success: true,
    data: activities,
  });
});

// Get activities by type
router.get('/type/:type', authenticate, requireAdmin, (req, res) => {
  const type = req.params.type as ActivityType;
  const activities = activityLogger.getByType(type);
  
  res.json({
    success: true,
    data: activities,
  });
});

// Get activities by user
router.get('/user/:userId', authenticate, requireAdmin, (req, res) => {
  const { userId } = req.params;
  const activities = activityLogger.getByUser(userId);
  
  res.json({
    success: true,
    data: activities,
  });
});

// Get statistics
router.get('/stats', authenticate, requireAdmin, (req, res) => {
  const stats = activityLogger.getStats();
  
  res.json({
    success: true,
    data: stats,
  });
});

// Get activities by time range
router.get('/range', authenticate, requireAdmin, (req, res) => {
  const start = new Date(req.query.start as string);
  const end = new Date(req.query.end as string);
  
  const activities = activityLogger.getByTimeRange(start, end);
  
  res.json({
    success: true,
    data: activities,
  });
});

export default router;
