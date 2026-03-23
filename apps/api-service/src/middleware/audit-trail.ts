import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export interface AuditEntry {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  timestamp: Date;
  previousValue?: any;
  newValue?: any;
  ipAddress?: string;
}

// In-memory audit log for development (swap for DB in production)
const auditLog: AuditEntry[] = [];

export function auditTrailMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const entry: AuditEntry = {
      userId: req.user?.userId || 'anonymous',
      action: req.method,
      resource: req.baseUrl + req.path,
      resourceId: req.params.id as string | undefined,
      timestamp: new Date(),
      ipAddress: req.ip,
    };

    // Capture request body for audit
    if (req.body) {
      entry.newValue = { ...req.body };
      // Redact sensitive fields
      if (entry.newValue.password) entry.newValue.password = '[REDACTED]';
      if (entry.newValue.passwordHash) entry.newValue.passwordHash = '[REDACTED]';
    }

    auditLog.push(entry);
    console.log(`📝 AUDIT: ${entry.action} ${entry.resource} by ${entry.userId}`);
  }

  next();
}

export function getAuditLog(): AuditEntry[] {
  return auditLog;
}
