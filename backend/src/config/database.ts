import { PrismaClient } from '@prisma/client';
import { attachEventCapture } from '../middleware/dbEventCapture.js';

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// Attach event capture middleware for admin dashboard + notifications
attachEventCapture(prisma);

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;
