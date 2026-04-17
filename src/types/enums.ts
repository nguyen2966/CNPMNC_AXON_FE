export type UserRole = 'admin' | 'asset_manager' | 'department_staff' | 'auditor';
export type AssetStatus = 'active' | 'inactive' | 'archived' | 'disposed';
export type AssetCategory = 'electronics' | 'furniture' | 'vehicle' | 'equipment' | 'software' | 'other';
export type ValidationSessionStatus = 'pending' | 'in_progress' | 'closed';
export type ValidationRecordStatus = 'valid' | 'invalid' | 'missing' | 'pending';
export type AuditAction =
  | 'asset_created' | 'asset_updated' | 'asset_archived' | 'asset_deleted'
  | 'asset_assigned' | 'asset_transferred'
  | 'validation_initiated' | 'validation_record_updated'
  | 'role_assigned' | 'role_revoked'
  | 'user_created' | 'user_deactivated';

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  asset_manager: 'Asset Manager',
  department_staff: 'Department Staff',
  auditor: 'Auditor',
};

export const STATUS_LABELS: Record<AssetStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  archived: 'Archived',
  disposed: 'Disposed',
};

export const CATEGORY_LABELS: Record<AssetCategory, string> = {
  electronics: 'Electronics',
  furniture: 'Furniture',
  vehicle: 'Vehicle',
  equipment: 'Equipment',
  software: 'Software',
  other: 'Other',
};

export const VALIDATION_STATUS_LABELS: Record<ValidationRecordStatus, string> = {
  valid: 'Valid',
  invalid: 'Invalid',
  missing: 'Missing',
  pending: 'Pending',
};