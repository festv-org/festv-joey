import prisma from '../config/database.js';

// Activity types for your marketplace
export enum ActivityType {
  // User activities
  USER_REGISTERED = 'USER_REGISTERED',
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  PASSWORD_RESET = 'PASSWORD_RESET',
  
  // Provider activities
  PROVIDER_PROFILE_CREATED = 'PROVIDER_PROFILE_CREATED',
  PROVIDER_PROFILE_UPDATED = 'PROVIDER_PROFILE_UPDATED',
  PRICING_LEVEL_ADDED = 'PRICING_LEVEL_ADDED',
  
  // Booking activities
  EVENT_REQUEST_CREATED = 'EVENT_REQUEST_CREATED',
  QUOTE_SENT = 'QUOTE_SENT',
  QUOTE_ACCEPTED = 'QUOTE_ACCEPTED',
  BOOKING_CREATED = 'BOOKING_CREATED',
  BOOKING_COMPLETED = 'BOOKING_COMPLETED',
  BOOKING_CANCELLED = 'BOOKING_CANCELLED',
  
  // Payment activities
  DEPOSIT_PAID = 'DEPOSIT_PAID',
  BALANCE_PAID = 'BALANCE_PAID',
  REFUND_ISSUED = 'REFUND_ISSUED',
  
  // Review activities
  REVIEW_POSTED = 'REVIEW_POSTED',
  REVIEW_RESPONDED = 'REVIEW_RESPONDED',
  
  // Message activities
  MESSAGE_SENT = 'MESSAGE_SENT',
}

export interface ActivityLogData {
  type: ActivityType;
  userId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

// Simple in-memory activity log (replace with database table in production)
class ActivityLogger {
  private static instance: ActivityLogger;
  private activities: Array<ActivityLogData & { timestamp: Date }> = [];
  private maxSize = 1000; // Keep last 1000 activities in memory

  private constructor() {}

  static getInstance(): ActivityLogger {
    if (!ActivityLogger.instance) {
      ActivityLogger.instance = new ActivityLogger();
    }
    return ActivityLogger.instance;
  }

  // Log an activity
  async log(data: ActivityLogData): Promise<void> {
    const activity = {
      ...data,
      timestamp: new Date(),
    };

    // Add to in-memory log
    this.activities.push(activity);
    if (this.activities.length > this.maxSize) {
      this.activities.shift();
    }

    // Console log for now (you can send to external service later)
    console.log('📊 ACTIVITY:', {
      type: data.type,
      userId: data.userId,
      time: activity.timestamp.toISOString(),
      metadata: data.metadata,
    });

    // Here you could:
    // 1. Send to external monitoring service (Sentry, LogRocket, etc.)
    // 2. Store in database ActivityLog table
    // 3. Send webhooks
    // 4. Trigger email notifications
    // 5. Update analytics

    // Example: Send critical events to your email
    if (this.isCriticalEvent(data.type)) {
      await this.sendAlert(activity);
    }
  }

  // Get recent activities
  getRecent(limit: number = 50): Array<ActivityLogData & { timestamp: Date }> {
    return this.activities.slice(-limit).reverse();
  }

  // Get activities by type
  getByType(type: ActivityType): Array<ActivityLogData & { timestamp: Date }> {
    return this.activities.filter(a => a.type === type);
  }

  // Get activities by user
  getByUser(userId: string): Array<ActivityLogData & { timestamp: Date }> {
    return this.activities.filter(a => a.userId === userId);
  }

  // Get activities in time range
  getByTimeRange(start: Date, end: Date): Array<ActivityLogData & { timestamp: Date }> {
    return this.activities.filter(
      a => a.timestamp >= start && a.timestamp <= end
    );
  }

  // Check if event is critical
  private isCriticalEvent(type: ActivityType): boolean {
    return [
      ActivityType.BOOKING_CREATED,
      ActivityType.DEPOSIT_PAID,
      ActivityType.BALANCE_PAID,
      ActivityType.BOOKING_CANCELLED,
      ActivityType.REFUND_ISSUED,
    ].includes(type);
  }

  // Send alert (implement your notification logic)
  private async sendAlert(activity: ActivityLogData & { timestamp: Date }): Promise<void> {
    // Example: Send to Slack, email, SMS, etc.
    console.log('🚨 CRITICAL EVENT ALERT:', activity);
    
    // TODO: Implement actual notification
    // await sendSlackMessage(`New ${activity.type} event`);
    // await sendEmail({ subject: 'Critical Event', body: JSON.stringify(activity) });
  }

  // Get statistics
  getStats() {
    const typeCount: Record<string, number> = {};
    this.activities.forEach(a => {
      typeCount[a.type] = (typeCount[a.type] || 0) + 1;
    });

    return {
      totalActivities: this.activities.length,
      byType: typeCount,
      last24Hours: this.getByTimeRange(
        new Date(Date.now() - 24 * 60 * 60 * 1000),
        new Date()
      ).length,
    };
  }
}

export const activityLogger = ActivityLogger.getInstance();

// Helper function to use in controllers
export const logActivity = (data: ActivityLogData): Promise<void> => {
  return activityLogger.log(data);
};
