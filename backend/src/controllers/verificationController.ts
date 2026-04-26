import { Response } from 'express';
import prisma from '../config/database.js';
import { AuthenticatedRequest } from '../types/index.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { sendEmailCode, sendSMSCode, generateCode } from '../services/verification.js';

export const sendEmailVerificationCode = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  if (!user) throw new AppError('User not found', 404);
  if (user.emailVerified) throw new AppError('Email already verified', 400);
  
  // Rate limiting check - max 3 codes per hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentCodes = await prisma.verificationCode.count({
    where: {
      userId,
      type: 'email',
      createdAt: { gte: oneHourAgo },
    },
  });
  
  if (recentCodes >= 3) {
    throw new AppError('Too many verification attempts. Please try again later.', 429);
  }
  
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
  
  await sendEmailCode(user.email, code, user.firstName);
  
  res.json({ success: true, message: 'Verification code sent to your email' });
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
      code: code.toString(),
      expiresAt: { gte: new Date() },
    },
  });
  
  if (!verification) {
    throw new AppError('Invalid or expired code', 400);
  }
  
  // Mark as verified and activate the account
  await prisma.user.update({
    where: { id: userId },
    data: { emailVerified: true, status: 'ACTIVE' },
  });

  // Delete used code
  await prisma.verificationCode.delete({ where: { id: verification.id } });

  res.json({ success: true, message: 'Email verified successfully' });
});

export const sendPhoneVerificationCode = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  if (!user) throw new AppError('User not found', 404);
  if (!user.phoneNumber) throw new AppError('No phone number on file', 400);
  if (user.phoneVerified) throw new AppError('Phone already verified', 400);
  
  // Rate limiting check - max 3 codes per hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentCodes = await prisma.verificationCode.count({
    where: {
      userId,
      type: 'phone',
      createdAt: { gte: oneHourAgo },
    },
  });
  
  if (recentCodes >= 3) {
    throw new AppError('Too many verification attempts. Please try again later.', 429);
  }
  
  // Delete old codes
  await prisma.verificationCode.deleteMany({
    where: { userId, type: 'phone' },
  });
  
  // Generate new code
  const code = generateCode();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  
  await prisma.verificationCode.create({
    data: {
      userId,
      type: 'phone',
      code,
      target: user.phoneNumber,
      expiresAt,
    },
  });
  
  await sendSMSCode(user.phoneNumber, code);
  
  res.json({ success: true, message: 'Verification code sent to your phone' });
});

export const verifyPhone = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { code } = req.body;
  
  if (!code || code.length !== 6) {
    throw new AppError('Invalid code format', 400);
  }
  
  const verification = await prisma.verificationCode.findFirst({
    where: {
      userId,
      type: 'phone',
      code: code.toString(),
      expiresAt: { gte: new Date() },
    },
  });
  
  if (!verification) {
    throw new AppError('Invalid or expired code', 400);
  }
  
  // Mark as verified
  await prisma.user.update({
    where: { id: userId },
    data: { phoneVerified: true },
  });
  
  // Delete used code
  await prisma.verificationCode.delete({ where: { id: verification.id } });
  
  res.json({ success: true, message: 'Phone verified successfully' });
});
