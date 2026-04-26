import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import prisma from '../config/database.js';
import { AuthenticatedRequest, TokenPayload } from '../types/index.js';
import { UserRole } from '@prisma/client';

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access token required',
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as TokenPayload;
      
      // Verify user still exists and is active
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          role: true,
          roles: true,
          firstName: true,
          lastName: true,
          status: true,
        },
      });
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not found',
        });
      }
      
      if (user.status === 'SUSPENDED') {
        return res.status(403).json({
          success: false,
          error: 'Account suspended. Please contact support.',
        });
      }

      if (user.status === 'INACTIVE') {
        return res.status(403).json({
          success: false,
          error: 'Account is inactive.',
        });
      }

      if (user.status === 'PENDING_VERIFICATION') {
        const PENDING_ALLOWED = [
          '/api/v1/verification/send-email-code',
          '/api/v1/verification/verify-email',
          '/api/v1/auth/me',
          '/api/v1/auth/refresh-token',
        ];
        const reqPath = req.originalUrl.split('?')[0];
        if (!PENDING_ALLOWED.includes(reqPath)) {
          return res.status(403).json({
            success: false,
            error: 'Please verify your email address to continue.',
          });
        }
      }
      
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        roles: user.roles,
        firstName: user.firstName,
        lastName: user.lastName,
      };
      
      next();
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed',
    });
  }
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as TokenPayload;
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          role: true,
          roles: true,
          firstName: true,
          lastName: true,
          status: true,
        },
      });
      
      if (user && user.status === 'ACTIVE') {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          roles: user.roles,
          firstName: user.firstName,
          lastName: user.lastName,
        };
      }
    } catch {
      // Token invalid, continue without auth
    }
    
    next();
  } catch (error) {
    next();
  }
};

// Role-based access control - checks both role and roles array
export const requireRole = (...roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }
    
    // Check if user's current role OR any of their roles match required roles
    const hasRole = roles.includes(req.user.role) || 
      (req.user.roles && req.user.roles.some(r => roles.includes(r)));
    
    if (!hasRole) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
      });
    }
    
    next();
  };
};

// Require provider role
export const requireProvider = requireRole('PROVIDER', 'ADMIN');

// Require client role
export const requireClient = requireRole('CLIENT', 'ADMIN');

// Require admin role
export const requireAdmin = requireRole('ADMIN');
