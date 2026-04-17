import type { AuditAction } from './enums.ts';

export interface AuditLogRes {
  id: string; action: AuditAction;
  performedById: string | null; performedByName: string | null;
  assetId: string | null; assetCode: string | null;
  targetUserId: string | null; targetUserName: string | null;
  beforeState: Record<string, unknown> | null; afterState: Record<string, unknown> | null;
  ipAddress: string | null; createdAt: string;
}
export interface AuditLogFilters {
  action?: AuditAction; assetId?: string; performedById?: string;
  from?: string; to?: string; page?: number; size?: number;
}