# Activity Monitoring & Alerts Guide

## Overview
This system tracks all important business events in your marketplace and can send alerts for critical actions.

## 1. Visual Database Browser

### Quick Start - Prisma Studio (Free, Built-in)
```bash
# View your database visually
cd backend
npx prisma studio
```
Opens at `http://localhost:5555` - you can browse, edit, and search all your data.

### For Production Database (Render)
```bash
# Get your DATABASE_URL from Render, then:
$env:DATABASE_URL="your-render-postgres-url-here"
npx prisma studio
```

### Better Tools (Recommended)
- **TablePlus** (https://tableplus.com) - Beautiful, fast, free tier
- **DBeaver** (https://dbeaver.io) - Free, open-source
- **pgAdmin** (https://www.pgadmin.org) - Most powerful

---

## 2. Activity Logging System

### What It Tracks
✅ User registrations & logins
✅ Provider profile creation
✅ Pricing level changes
✅ Event requests & quotes
✅ Bookings & payments
✅ Reviews & messages
✅ All critical marketplace events

### How to Use in Your Controllers

**Example 1: Log user registration**
```typescript
import { logActivity, ActivityType } from '../services/activityLogger.js';

export const register = async (req, res) => {
  // ... create user ...
  
  // Log the activity
  await logActivity({
    type: ActivityType.USER_REGISTERED,
    userId: user.id,
    metadata: {
      email: user.email,
      role: user.role,
    },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });
  
  res.json({ success: true, data: user });
};
```

**Example 2: Log booking created**
```typescript
await logActivity({
  type: ActivityType.BOOKING_CREATED,
  userId: req.user.id,
  metadata: {
    bookingId: booking.id,
    amount: booking.totalAmount,
    eventDate: booking.eventDate,
    providerId: booking.providerId,
  },
});
```

**Example 3: Log payment received**
```typescript
await logActivity({
  type: ActivityType.DEPOSIT_PAID,
  userId: req.user.id,
  metadata: {
    bookingId: payment.bookingId,
    amount: payment.amount,
    paymentId: payment.id,
  },
});
```

### Available Activity Types
```typescript
// User activities
USER_REGISTERED
USER_LOGIN
USER_LOGOUT
PASSWORD_RESET

// Provider activities
PROVIDER_PROFILE_CREATED
PROVIDER_PROFILE_UPDATED
PRICING_LEVEL_ADDED

// Booking activities
EVENT_REQUEST_CREATED
QUOTE_SENT
QUOTE_ACCEPTED
BOOKING_CREATED
BOOKING_COMPLETED
BOOKING_CANCELLED

// Payment activities
DEPOSIT_PAID
BALANCE_PAID
REFUND_ISSUED

// Review activities
REVIEW_POSTED
REVIEW_RESPONDED

// Message activities
MESSAGE_SENT
```

---

## 3. View Activity Logs

### API Endpoints (Admin Only)

**Get recent activities:**
```
GET /api/v1/activities/recent?limit=100
```

**Get activities by type:**
```
GET /api/v1/activities/type/BOOKING_CREATED
```

**Get activities by user:**
```
GET /api/v1/activities/user/:userId
```

**Get statistics:**
```
GET /api/v1/activities/stats
```

**Get activities by time range:**
```
GET /api/v1/activities/range?start=2026-01-01&end=2026-01-31
```

### View in Console Logs
All activities are automatically logged to console. On Render, view them:
1. Go to your backend service
2. Click "Logs" tab
3. See real-time activity:
   ```
   📊 ACTIVITY: {
     type: 'BOOKING_CREATED',
     userId: 'abc123',
     time: '2026-01-06T12:34:56.789Z',
     metadata: { amount: 500, eventDate: '2026-02-14' }
   }
   ```

---

## 4. Set Up Alerts

### Current Setup
Critical events automatically trigger alerts in console:
- 🚨 Booking created
- 🚨 Payments received
- 🚨 Bookings cancelled
- 🚨 Refunds issued

### Add Real Alerts

**Option A: Email Notifications**
Use a service like SendGrid or Resend:
```typescript
// In activityLogger.ts, update sendAlert():
private async sendAlert(activity: ActivityLogData & { timestamp: Date }): Promise<void> {
  await sendEmail({
    to: 'your-email@example.com',
    subject: `Alert: ${activity.type}`,
    body: `
      Event: ${activity.type}
      User: ${activity.userId}
      Time: ${activity.timestamp}
      Details: ${JSON.stringify(activity.metadata, null, 2)}
    `,
  });
}
```

**Option B: Slack Notifications**
```typescript
private async sendAlert(activity: ActivityLogData & { timestamp: Date }): Promise<void> {
  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `🚨 ${activity.type}`,
      blocks: [
        {
          type: 'section',
          text: { type: 'mrkdwn', text: `*${activity.type}*\nUser: ${activity.userId}` }
        }
      ]
    })
  });
}
```

**Option C: SMS via Twilio**
```typescript
import twilio from 'twilio';

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

private async sendAlert(activity: ActivityLogData & { timestamp: Date}): Promise<void> {
  await client.messages.create({
    body: `Alert: ${activity.type} - ${activity.metadata}`,
    to: '+1234567890',
    from: process.env.TWILIO_PHONE,
  });
}
```

---

## 5. Advanced Monitoring Services

### For Production (Paid but Worth It)

**Sentry** (https://sentry.io)
- Tracks errors AND custom events
- $26/month for startups
- Shows user journey before errors
```typescript
import * as Sentry from '@sentry/node';
Sentry.captureMessage('Booking Created', {
  level: 'info',
  extra: activity.metadata,
});
```

**LogRocket** (https://logrocket.com)
- Session replay + monitoring
- See exactly what users did
- $99/month

**Datadog** (https://datadoghq.com)
- Full infrastructure monitoring
- Custom dashboards
- Expensive but enterprise-grade

---

## 6. Quick Implementation Checklist

✅ **Done** - Activity logger service created
✅ **Done** - API endpoints for viewing activities

**To Do:**
□ Add activity logging to your controllers
□ Test locally with Prisma Studio
□ Set up production database viewer (TablePlus)
□ Choose and implement alert method (email/Slack/SMS)
□ (Optional) Add database ActivityLog table for persistence
□ (Optional) Connect to Sentry for advanced monitoring

---

## Example: Complete Implementation

Here's how to add logging to your authController.ts:

```typescript
import { logActivity, ActivityType } from '../services/activityLogger.js';

export const register = asyncHandler(async (req: Request, res: Response) => {
  // ... existing registration code ...
  
  // Add this at the end
  await logActivity({
    type: ActivityType.USER_REGISTERED,
    userId: user.id,
    metadata: {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });
  
  res.status(201).json({ success: true, data: { user, token } });
});
```

That's it! The system will now log every registration, and you can view them at `/api/v1/activities/recent`.

---

## Quick Demo

1. Start your backend locally
2. Open Prisma Studio: `npx prisma studio`
3. In another terminal, register a new user
4. Check the console - you'll see: 📊 ACTIVITY: USER_REGISTERED
5. Check Prisma Studio - refresh to see new user
6. Call `/api/v1/activities/recent` - see the logged activity

---

## Questions?
- Database viewing: Use Prisma Studio or TablePlus
- Activity logs: Check console or API endpoints
- Alerts: Implement sendAlert() method with your preferred service
- Production: Consider Sentry for comprehensive monitoring
