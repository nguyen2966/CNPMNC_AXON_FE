import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.ts';
import type { UserRole } from '../../types/enums';

interface Props { children: React.ReactNode; roles?: UserRole[]; }

export const PrivateRoute: React.FC<Props> = ({ children, roles }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};