import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

export const AppRouter: React.FC = () => (
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