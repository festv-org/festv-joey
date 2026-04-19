import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.js';
import prisma from '../config/database.js';
import { z } from 'zod';

const router = Router();

// Validation schema
const menuItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string(),
  price: z.number().positive(),
  imageUrl: z.string().optional(),
  allergens: z.array(z.string()).optional().default([]),
  dietaryInfo: z.array(z.string()).optional().default([]),
  isAvailable: z.boolean().optional().default(true),
  displayOrder: z.number().optional().default(0),
});

// Get menu items for a provider profile
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    // Get provider profile
    const profile = await prisma.providerProfile.findFirst({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Provider profile not found',
      });
    }

    // Get menu items
    const menuItems = await prisma.menuItem.findMany({
      where: { providerId: profile.id },
      orderBy: { displayOrder: 'asc' },
    });

    res.json({
      success: true,
      data: menuItems,
    });
  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch menu items',
    });
  }
});

// Create menu item
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const data = menuItemSchema.parse(req.body);

    // Get provider profile
    const profile = await prisma.providerProfile.findFirst({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Provider profile not found',
      });
    }

    // Create menu item
    const menuItem = await prisma.menuItem.create({
      data: {
        providerId: profile.id,
        ...data,
      },
    });

    res.status(201).json({
      success: true,
      data: menuItem,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors,
      });
    }
    console.error('Create menu item error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create menu item',
    });
  }
});

// Update menu item
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const data = menuItemSchema.partial().parse(req.body);

    // Get provider profile
    const profile = await prisma.providerProfile.findFirst({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Provider profile not found',
      });
    }

    // Verify ownership
    const existing = await prisma.menuItem.findUnique({
      where: { id },
    });

    if (!existing || existing.providerId !== profile.id) {
      return res.status(404).json({
        success: false,
        error: 'Menu item not found',
      });
    }

    // Update menu item
    const menuItem = await prisma.menuItem.update({
      where: { id },
      data,
    });

    res.json({
      success: true,
      data: menuItem,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors,
      });
    }
    console.error('Update menu item error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update menu item',
    });
  }
});

// Delete menu item
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    // Get provider profile
    const profile = await prisma.providerProfile.findFirst({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Provider profile not found',
      });
    }

    // Verify ownership
    const existing = await prisma.menuItem.findUnique({
      where: { id },
    });

    if (!existing || existing.providerId !== profile.id) {
      return res.status(404).json({
        success: false,
        error: 'Menu item not found',
      });
    }

    // Delete menu item
    await prisma.menuItem.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Menu item deleted',
    });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete menu item',
    });
  }
});

// Bulk update display order
router.put('/reorder', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { items } = req.body as { items: Array<{ id: string; displayOrder: number }> };

    // Get provider profile
    const profile = await prisma.providerProfile.findFirst({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Provider profile not found',
      });
    }

    // Update each item
    await Promise.all(
      items.map(item =>
        prisma.menuItem.updateMany({
          where: {
            id: item.id,
            providerId: profile.id, // Ensure ownership
          },
          data: { displayOrder: item.displayOrder },
        })
      )
    );

    res.json({
      success: true,
      message: 'Menu items reordered',
    });
  } catch (error) {
    console.error('Reorder menu items error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reorder menu items',
    });
  }
});

export default router;
