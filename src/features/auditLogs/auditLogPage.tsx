import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditLogsApi } from '../../api/auditLogs.api';
import { PageHeader } from '../../components/common/PageHeader';
import { Table, type Column } from '../../components/common/Table';
import { Pagination } from '../../components/common/Pagination';
import { formatDateTime } from '../../utils/formatters';
import type { AuditLogRes } from '../../types/auditlog.types';
import type { AuditAction } from '../../types/enums';

const ACTION_COLORS: Partial<Record<AuditAction, string>> = {
  asset_created: 'var(--green)', asset_archived: 'var(--amber)', asset_transferred: 'var(--accent)',
  role_assigned: 'var(--purple)', user_deactivated: 'var(--red)', validation_initiated: 'var(--teal)',
};

export const AuditLogsPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [filterAction, setFilterAction] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page, filterAction],
    queryFn: () => auditLogsApi.getAll({ page, size: 15, action: filterAction as AuditAction || undefined }),
  });

  const columns: Column<AuditLogRes>[] = [
    { key: 'action', title: 'Action', render: r => (
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: ACTION_COLORS[r.action] ?? 'var(--text-secondary)', fontWeight: 500 }}>
        {r.action}
      </span>
    ), width: 200 },
    { key: 'performedByName', title: 'Performed By', render: r => (
      <div>
        <div style={{ fontSize: 13 }}>{r.performedByName ?? '—'}</div>
      </div>
    ), width: 160 },
    { key: 'assetCode', title: 'Asset', render: r => r.assetCode
      ? <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)' }}>{r.assetCode}</span>
      : <span style={{ color: 'var(--text-muted)' }}>—</span>, width: 120 },
    { key: 'targetUserName', title: 'Target User', render: r => r.targetUserName ?? <span style={{ color: 'var(--text-muted)' }}>—</span>, width: 130 },
    { key: 'change', title: 'Change', render: r => {
      if (!r.beforeState && !r.afterState) return <span style={{ color: 'var(--text-muted)' }}>—</span>;
      const before = r.beforeState ? JSON.stringify(r.beforeState) : '';
      const after = r.afterState ? JSON.stringify(r.afterState) : '';
      return (
        <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)' }}>
          {before && <span style={{ color: 'var(--red)', textDecoration: 'line-through', marginRight: 6 }}>{before}</span>}
          {after && <span style={{ color: 'var(--green)' }}>{after}</span>}
        </div>
      );
    }},
    { key: 'createdAt', title: 'Time', render: r => <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{formatDateTime(r.createdAt)}</span>, width: 150 },
  ];

  const actions: AuditAction[] = [
    'asset_created', 'asset_updated', 'asset_archived', 'asset_transferred',
    'role_assigned', 'role_revoked', 'user_created', 'user_deactivated',
    'validation_initiated', 'validation_record_updated',
  ];

  return (
    <div className="fade-in">
      <PageHeader title="Audit Logs" subtitle="System activity trail" />

      <div style={{ marginBottom: 20 }}>
        <select value={filterAction} onChange={e => { setFilterAction(e.target.value); setPage(0); }}
          style={{ padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>
          <option value="">All Actions</option>
          {actions.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      <Table columns={columns} data={data?.content ?? []} loading={isLoading} rowKey={r => r.id} />
      <Pagination page={page} totalPages={data?.totalPages ?? 0} totalElements={data?.totalElements ?? 0} pageSize={15} onChange={setPage} />
    </div>
  );
};