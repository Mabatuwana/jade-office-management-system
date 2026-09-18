import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prisma.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
    department: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'jade_enterprise_secure_jwt_secret_key_2026';

export const authenticateJWT = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Authorization token required' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
      name: string;
      department: string;
    };

    // Verify user still exists in DB
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, name: true, department: true },
    });

    if (!user) {
      res.status(401).json({ message: 'User account not found' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid or expired session token' });
    return;
  }
};

/**
 * Role-Based Access Control (RBAC) Guard Middleware
 * MD (MANAGING_DIRECTOR) can be allowed globally for read operations, or exact roles matched.
 */
export const requireRoles = (allowedRoles: string[], allowMDOverride = true) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const userRole = req.user.role;

    if (allowedRoles.includes(userRole) || (allowMDOverride && userRole === 'MANAGING_DIRECTOR')) {
      next();
      return;
    }

    res.status(403).json({
      message: `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]`,
    });
  };
};
