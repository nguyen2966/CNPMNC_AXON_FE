import { useAuthStore } from '../store/authStore';
import type { UserRole } from '../types/enums';

export const usePermission = () => {
  const { user } = useAuthStore();
  return {
    hasRole: (...roles: UserRole[]) => !!user && roles.includes(user.role),
    isAdmin: user?.role === 'admin',
    isAssetManager: user?.role === 'asset_manager',
    isStaff: user?.role === 'department_staff',
    isAuditor: user?.role === 'auditor',
    canManageAssets: ['admin', 'asset_manager'].includes(user?.role ?? ''),
    canViewAuditLogs: ['admin', 'auditor'].includes(user?.role ?? ''),
    canManageValidation: ['admin', 'auditor'].includes(user?.role ?? ''),
    canSubmitValidation: ['admin', 'department_staff'].includes(user?.role ?? ''),
  };
};