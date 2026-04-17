import type { ValidationRecordStatus, ValidationSessionStatus } from './enums.ts';

export interface ValidationSessionRes {
  id: string; year: number; status: ValidationSessionStatus;
  initiatedById: string | null; initiatedByName: string | null;
  startedAt: string; closedAt: string | null; notes: string | null;
  totalRecords: number; validCount: number; invalidCount: number;
  missingCount: number; pendingCount: number;
}
export interface ValidationRecordRes {
  id: string; sessionId: string; assetId: string; assetCode: string; assetName: string;
  departmentName: string | null; status: ValidationRecordStatus;
  validatedById: string | null; validatedByName: string | null;
  validatedAt: string | null; notes: string | null;
}
export interface OpenSessionReq { year: number; notes?: string; }
export interface ValidationStatusReq { status: ValidationRecordStatus; notes?: string; }