// Prisma middleware to capture database events and dispatch notifications
import { eventNotifier } from '../services/eventNotifier.js';

/**
 * Attaches event capture middleware to a PrismaClient instance.
 * Intercepts create/update/delete operations and sends them to the EventNotifier.
 */
export function attachEventCapture(prisma: any): void {
  prisma.$use(async (params: any, next: any) => {
    // Execute the actual DB operation first
    const result = await next(params);

    // Only track mutating operations
    if (!['create', 'update', 'delete'].includes(params.action)) {
      return result;
    }

    // Map Prisma actions to our simpler action names
    const action = params.action as 'create' | 'update' | 'delete';
    const model = params.model;

    if (!model) return result;

    try {
      // Fire-and-forget — never block DB operations
      eventNotifier.capture(model, action, result).catch(() => {});
    } catch {
      // Silently ignore notification failures
    }

    return result;
  });

  console.log('🔌 Prisma event capture middleware attached');
}
