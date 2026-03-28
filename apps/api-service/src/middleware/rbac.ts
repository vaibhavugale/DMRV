import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { UserRole } from '../shared/constants';

/**
 * Role-based access control middleware
 * @param allowedRoles - Array of roles permitted to access the route
 */
export function rbacMiddleware(...allowedRoles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      res.status(403).json({
        error: 'Insufficient permissions.',
        required: allowedRoles,
        current: req.user.role,
      });
      return;
    }

    next();
  };
}

/**
 * Auditor access - read-only enforcement
 * Blocks POST, PUT, DELETE for auditor role
 */
export function auditorReadOnly(req: AuthRequest, res: Response, next: NextFunction): void {
  if (req.user?.role === UserRole.AUDITOR && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    res.status(403).json({ error: 'Auditors have read-only access.' });
    return;
  }
  next();
}
