import { Response } from 'express';
import prisma from '../config/database.js';
import { AuthenticatedRequest } from '../types/index.js';
import { asyncHandler, AppError, NotFoundError } from '../middleware/errorHandler.js';
import { z } from 'zod';

// Validation schema for profile update
const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phoneNumber: z.string().max(20).optional().nullable(),
  address: z.string().max(200).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(50).optional().nullable(),
  zipCode: z.string().max(10).optional().nullable(),
  country: z.string().max(50).optional(),
  avatarUrl: z.string().url().optional().nullable().or(z.literal('')),
  bannerUrl: z.string().url().optional().nullable().or(z.literal('')),
});

// Get current user's full profile
export const getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      roles: true,
      status: true,
      phoneNumber: true,
      avatarUrl: true,
      address: true,
      city: true,
      state: true,
      zipCode: true,
      country: true,
      emailVerified: true,
      phoneVerified: true,
      createdAt: true,
      lastLoginAt: true,
      providerProfiles: {
        select: {
          id: true,
          businessName: true,
          verificationStatus: true,
          providerTypes: true,
          primaryType: true,
          averageRating: true,
          totalReviews: true,
        },
      },
    },
  });

  if (!user) {
    throw new NotFoundError('User');
  }

  res.json({
    success: true,
    data: user,
  });
});

// Update current user's profile
export const updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const data = updateProfileSchema.parse(req.body);

  // Remove undefined values
  const updateData: Record<string, any> = {};
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      updateData[key] = value === '' ? null : value;
    }
  });

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      roles: true,
      status: true,
      phoneNumber: true,
      avatarUrl: true,
      address: true,
      city: true,
      state: true,
      zipCode: true,
      country: true,
      emailVerified: true,
      phoneVerified: true,
      createdAt: true,
      lastLoginAt: true,
      providerProfiles: {
        select: {
          id: true,
          businessName: true,
          verificationStatus: true,
          providerTypes: true,
          primaryType: true,
          averageRating: true,
          totalReviews: true,
        },
      },
    },
  });

  res.json({
    success: true,
    data: user,
    message: 'Profile updated successfully',
  });
});

// Upload avatar (accepts base64 data URL for now, cloud upload later)
export const updateAvatar = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { avatarUrl } = req.body;

  if (!avatarUrl) {
    throw new AppError('Avatar URL is required', 400);
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl },
    select: {
      id: true,
      avatarUrl: true,
    },
  });

  res.json({
    success: true,
    data: user,
    message: 'Avatar updated successfully',
  });
});

// Upload banner
export const updateBanner = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { bannerUrl } = req.body;

  // Allow null to remove banner
  const user = await prisma.user.update({
    where: { id: userId },
    data: { bannerUrl: bannerUrl || null },
    select: {
      id: true,
      bannerUrl: true,
    },
  });

  res.json({
    success: true,
    data: user,
    message: 'Banner updated successfully',
  });
});
