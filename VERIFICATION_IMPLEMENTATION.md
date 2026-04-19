# Email & SMS Verification Implementation Plan

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install resend twilio
```

### 2. Environment Variables (.env)
```
RESEND_API_KEY=re_xxxxx
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+1xxxxx
```

### 3. Database Schema (already exists)
- User.emailVerified (Boolean)
- User.phoneVerified (Boolean)
- Need to add: VerificationCode table

### 4. Add VerificationCode Model to schema.prisma
```prisma
model VerificationCode {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  type      String   // 'email' or 'phone'
  code      String   // 6-digit code
  target    String   // email address or phone number
  
  expiresAt DateTime
  createdAt DateTime @default(now())
  
  @@index([userId, type])
  @@index([code, expiresAt])
}
```

### 5. Create Verification Service (backend/src/services/verification.ts)
```typescript
import { Resend } from 'resend';
import twilio from 'twilio';

const resend = new Resend(process.env.RESEND_API_KEY);
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendEmailCode(email: string, code: string) {
  await resend.emails.send({
    from: 'Fêtes <verify@fetes.com>',
    to: email,
    subject: 'Verify your email - Fêtes',
    html: `
      <h2>Email Verification</h2>
      <p>Your verification code is: <strong>${code}</strong></p>
      <p>This code expires in 15 minutes.</p>
    `,
  });
}

export async function sendSMSCode(phoneNumber: string, code: string) {
  await twilioClient.messages.create({
    body: `Your Fêtes verification code is: ${code}. Expires in 15 minutes.`,
    to: phoneNumber,
    from: process.env.TWILIO_PHONE_NUMBER,
  });
}

export function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
```

### 6. Create Verification Routes (backend/src/routes/verificationRoutes.ts)
```typescript
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as verificationController from '../controllers/verificationController';

const router = Router();

router.post('/send-email-code', authenticate, verificationController.sendEmailCode);
router.post('/verify-email', authenticate, verificationController.verifyEmail);
router.post('/send-phone-code', authenticate, verificationController.sendPhoneCode);
router.post('/verify-phone', authenticate, verificationController.verifyPhone);

export default router;
```

### 7. Create Verification Controller (backend/src/controllers/verificationController.ts)
```typescript
import { Response } from 'express';
import prisma from '../config/database';
import { AuthenticatedRequest } from '../types';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { sendEmailCode, sendSMSCode, generateCode } from '../services/verification';

export const sendEmailCode = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  if (!user) throw new AppError('User not found', 404);
  if (user.emailVerified) throw new AppError('Email already verified', 400);
  
  // Delete old codes
  await prisma.verificationCode.deleteMany({
    where: { userId, type: 'email' },
  });
  
  // Generate new code
  const code = generateCode();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  
  await prisma.verificationCode.create({
    data: {
      userId,
      type: 'email',
      code,
      target: user.email,
      expiresAt,
    },
  });
  
  await sendEmailCode(user.email, code);
  
  res.json({ success: true, message: 'Verification code sent' });
});

export const verifyEmail = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { code } = req.body;
  
  if (!code || code.length !== 6) {
    throw new AppError('Invalid code format', 400);
  }
  
  const verification = await prisma.verificationCode.findFirst({
    where: {
      userId,
      type: 'email',
      code,
      expiresAt: { gte: new Date() },
    },
  });
  
  if (!verification) {
    throw new AppError('Invalid or expired code', 400);
  }
  
  // Mark as verified
  await prisma.user.update({
    where: { id: userId },
    data: { emailVerified: true },
  });
  
  // Delete used code
  await prisma.verificationCode.delete({ where: { id: verification.id } });
  
  res.json({ success: true, message: 'Email verified successfully' });
});

// Similar for phone verification...
```

## Frontend Updates

### 1. Update API calls in AccountVerify.tsx
```typescript
const handleSendEmailCode = async () => {
  setSendingEmail(true);
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/verification/send-email-code`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await res.json();
    if (data.success) {
      setEmailSent(true);
    } else {
      alert(data.error || 'Failed to send code');
    }
  } catch (err: any) {
    alert(err.message || 'Error sending code');
  } finally {
    setSendingEmail(false);
  }
};

const handleVerifyEmail = async () => {
  setVerifyingEmail(true);
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/verification/verify-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code: emailCode }),
    });
    const data = await res.json();
    if (data.success) {
      alert('Email verified successfully!');
      window.location.reload(); // Refresh to update verification status
    } else {
      alert(data.error || 'Verification failed');
    }
  } catch (err: any) {
    alert(err.message || 'Verification error');
  } finally {
    setVerifyingEmail(false);
  }
};
```

## Security Considerations

1. **Rate Limiting:** Max 3 codes per hour per user
2. **Code Expiration:** 15 minutes
3. **One-time Use:** Delete code after verification
4. **Brute Force Protection:** Lock after 5 failed attempts
5. **HTTPS Only:** Never send codes over HTTP

## Cost Estimate

- **Resend:** Free tier = 3,000 emails/month
- **Twilio:** ~$0.0075 per SMS (75¢ per 100 messages)

## Implementation Priority

1. ✅ Add VerificationCode model to schema
2. ✅ Install resend + twilio packages
3. ✅ Create verification service
4. ✅ Create verification controller
5. ✅ Add routes to main router
6. ✅ Update frontend API calls
7. ⏳ Test email flow
8. ⏳ Test SMS flow
9. ⏳ Add rate limiting
10. ⏳ Deploy

Want me to implement this now?
