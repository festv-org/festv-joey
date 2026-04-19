import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import prisma from '../config/database';
import { NotFoundError, ForbiddenError } from '../middleware/errorHandler';

// Get all notifications for current user
export const getMyNotifications = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { page = 1, limit = 20, unreadOnly = false, type } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  const where: any = { userId };
  
  if (unreadOnly === 'true') {
    where.isRead = false;
  }

  if (type) {
    where.type = type;
  }

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit)
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId, isRead: false } })
  ]);

  res.json({
    success: true,
    data: {
      notifications,
      unreadCount,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }
  });
};

// Get a single notification
export const getNotification = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { notificationId } = req.params;

  const notification = await prisma.notification.findUnique({
    where: { id: notificationId }
  });

  if (!notification) {
    throw new NotFoundError('Notification');
  }

  if (notification.userId !== userId) {
    throw new ForbiddenError('This notification does not belong to you');
  }

  // Mark as read when viewed
  if (!notification.isRead) {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true }
    });
  }

  res.json({
    success: true,
    data: { ...notification, isRead: true }
  });
};

// Mark notification as read
export const markAsRead = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { notificationId } = req.params;

  const notification = await prisma.notification.findUnique({
    where: { id: notificationId }
  });

  if (!notification) {
    throw new NotFoundError('Notification');
  }

  if (notification.userId !== userId) {
    throw new ForbiddenError('This notification does not belong to you');
  }

  const updatedNotification = await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true }
  });

  res.json({
    success: true,
    data: updatedNotification
  });
};

// Mark all notifications as read
export const markAllAsRead = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { type } = req.body;

  const where: any = { userId, isRead: false };
  
  if (type) {
    where.type = type;
  }

  const result = await prisma.notification.updateMany({
    where,
    data: { isRead: true }
  });

  res.json({
    success: true,
    message: `${result.count} notifications marked as read`
  });
};

// Delete a notification
export const deleteNotification = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { notificationId } = req.params;

  const notification = await prisma.notification.findUnique({
    where: { id: notificationId }
  });

  if (!notification) {
    throw new NotFoundError('Notification');
  }

  if (notification.userId !== userId) {
    throw new ForbiddenError('This notification does not belong to you');
  }

  await prisma.notification.delete({
    where: { id: notificationId }
  });

  res.json({
    success: true,
    message: 'Notification deleted'
  });
};

// Delete all read notifications
export const deleteAllRead = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  const result = await prisma.notification.deleteMany({
    where: {
      userId,
      isRead: true
    }
  });

  res.json({
    success: true,
    message: `${result.count} notifications deleted`
  });
};

// Get unread count
export const getUnreadCount = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  const unreadCount = await prisma.notification.count({
    where: { userId, isRead: false }
  });

  // Group by type
  const groupedCounts = await prisma.notification.groupBy({
    by: ['type'],
    where: { userId, isRead: false },
    _count: true
  });

  res.json({
    success: true,
    data: {
      total: unreadCount,
      byType: groupedCounts.reduce((acc, curr) => {
        acc[curr.type] = curr._count;
        return acc;
      }, {} as Record<string, number>)
    }
  });
};

// Update notification preferences (if we add a preferences table)
export const updateNotificationPreferences = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { emailNotifications, pushNotifications, types } = req.body;

  // For now, store preferences in user's metadata or create a separate preferences table
  // This is a placeholder for future implementation
  
  await prisma.user.update({
    where: { id: userId },
    data: {
      // Add notification preferences field to User model if needed
    }
  });

  res.json({
    success: true,
    message: 'Notification preferences updated'
  });
};

// Helper function to create notifications (used by other controllers)
export const createNotification = async (
  userId: string,
  type: string,
  title: string,
  message: string,
  data?: Record<string, any>
) => {
  const notification = await prisma.notification.create({
    data: {
      userId,
      type: type as any,
      title,
      message,
      data: data || {}
    }
  });

  // TODO: Emit socket event for real-time notification
  // io.to(userId).emit('notification', notification);

  return notification;
};

// Get notifications by type
export const getNotificationsByType = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { type } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId, type: type as any },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit)
    }),
    prisma.notification.count({ where: { userId, type: type as any } })
  ]);

  res.json({
    success: true,
    data: {
      notifications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }
  });
};

// Clear notifications older than a certain date
export const clearOldNotifications = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { olderThan } = req.body; // Date string

  if (!olderThan) {
    // Default to 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const result = await prisma.notification.deleteMany({
      where: {
        userId,
        createdAt: { lt: thirtyDaysAgo },
        isRead: true
      }
    });

    res.json({
      success: true,
      message: `${result.count} old notifications cleared`
    });
    return;
  }

  const result = await prisma.notification.deleteMany({
    where: {
      userId,
      createdAt: { lt: new Date(olderThan) },
      isRead: true
    }
  });

  res.json({
    success: true,
    message: `${result.count} notifications cleared`
  });
};
