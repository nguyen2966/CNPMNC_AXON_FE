import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.ts';

import { AppLayout } from '../components/layout/AppLayout.tsx';
import { PrivateRoute } from '../components/layout/PrivateRoute.tsx';
import { LoginPage } from '../features/auth/LoginPage.tsx';
import { DashboardPage } from '../features/dashboard/DashboardPage.tsx';
import { AssetListPage } from '../features/assets/AssetListPage.tsx';
import { AssetDetailPage } from '../features/assets/AssetDetailPage.tsx';
import { UsersPage } from '../features/users/UserPage.tsx';
import { DepartmentsPage } from '../features/departments/DepartmentsPage.tsx';
import { ValidationPage } from '../features/validation/ValidationPage.tsx';
import { AuditLogsPage } from '../features/auditLogs/auditLogPage.tsx';

export const AppRouter: React.FC = () => {
  const { initAuth, isInitializing } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  if (isInitializing) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#0a0f1c]">
        <div className="relative flex items-center justify-center">
          <div className="absolute h-20 w-20 rounded-full border-4 border-blue-900/20"></div>

          <div className="h-20 w-20 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-400 animate-spin shadow-[0_0_15px_rgba(59,130,246,0.3)]"></div>
          
          <div className="absolute h-8 w-8 rounded-full bg-blue-500/20 animate-pulse"></div>
        </div>
        
        <div className="mt-8 text-blue-400 text-lg font-medium tracking-wider drop-shadow-[0_0_8px_rgba(59,130,246,0.4)] animate-pulse">
        </div>
      </div>
    );
  }
  return (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/assets" element={<AssetListPage />} />
        <Route path="/assets/:id" element={<AssetDetailPage />} />
        <Route path="/users" element={
          <PrivateRoute roles={['admin']}><UsersPage /></PrivateRoute>
        } />
        <Route path="/departments" element={
          <PrivateRoute roles={['admin']}><DepartmentsPage /></PrivateRoute>
        } />
        <Route path="/validation" element={
          <PrivateRoute roles={['admin', 'auditor', 'department_staff']}><ValidationPage /></PrivateRoute>
        } />
        <Route path="/audit-logs" element={
          <PrivateRoute roles={['admin', 'auditor']}><AuditLogsPage /></PrivateRoute>
        } />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </BrowserRouter>
  );
};