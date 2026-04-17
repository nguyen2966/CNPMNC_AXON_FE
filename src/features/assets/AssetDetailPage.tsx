import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Archive, ArrowRightLeft, Edit2, RotateCcw } from 'lucide-react';
import { assetsApi } from '../../api/assets.api';
import { departmentsApi } from '../../api/departments.api';
import { auditLogsApi } from '../../api/auditLogs.api';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button.tsx';
import { Table, type Column } from '../../components/common/Table.tsx';
import { Modal } from '../../components/common/Modal.tsx';
import { Select } from '../../components/common/Input.tsx';
import { AssetStatusBadge } from '../../components/common/Badge.tsx';
import { AssetFormModal } from './AssetFormModal';
import { usePermission } from '../../hooks/usePermission';
import { useToast } from '../../components/common/Toast';
import { formatDate, formatDateTime, formatCurrency, getErrorMessage } from '../../utils/formatters';
import type { AssignmentRes } from '../../types/asset.types';
import type { AuditLogRes } from '../../types/auditlog.types';
import { CATEGORY_LABELS } from '../../types/enums';

const Field: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div>
    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
    <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{value ?? '—'}</div>
  </div>
);

export const AssetDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { canManageAssets } = usePermission();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showEdit, setShowEdit] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferDeptId, setTransferDeptId] = useState('');
  const [activeTab, setActiveTab] = useState<'history' | 'logs'>('history');

  const { data: asset, isLoading } = useQuery({ queryKey: ['asset', id], queryFn: () => assetsApi.getById(id!) });
  const { data: history } = useQuery({ queryKey: ['asset-history', id], queryFn: () => assetsApi.getHistory(id!) });
  const { data: logs } = useQuery({ queryKey: ['audit-logs-asset', id], queryFn: () => auditLogsApi.getByAsset(id!) });
  const { data: depts } = useQuery({ queryKey: ['departments'], queryFn: departmentsApi.getAll });

  const archiveMutation = useMutation({
    mutationFn: () => assetsApi.archive(id!),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['asset', id] }); toast('success', 'Asset archived'); },
    onError: err => toast('error', getErrorMessage(err)),
  });

  const returnMutation = useMutation({
    mutationFn: () => assetsApi.returnAsset(id!),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['asset', id] }); qc.invalidateQueries({ queryKey: ['asset-history', id] }); toast('success', 'Assignment closed'); },
    onError: err => toast('error', getErrorMessage(err)),
  });

  const transferMutation = useMutation({
    mutationFn: () => assetsApi.transfer(id!, { newDepartmentId: transferDeptId }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['asset', id] }); qc.invalidateQueries({ queryKey: ['asset-history', id] }); toast('success', 'Asset transferred'); setShowTransfer(false); },
    onError: err => toast('error', getErrorMessage(err)),
  });

  const historyColumns: Column<AssignmentRes>[] = [
    { key: 'departmentName', title: 'Department', width: 180 },
    { key: 'assignedByName', title: 'Assigned By', render: r => r.assignedByName ?? '—' },
    { key: 'assignedAt', title: 'From', render: r => formatDateTime(r.assignedAt), width: 150 },
    { key: 'returnedAt', title: 'To', render: r => r.returnedAt ? formatDateTime(r.returnedAt) : <span style={{ color: 'var(--green)', fontWeight: 500 }}>Active</span>, width: 150 },
    { key: 'notes', title: 'Notes', render: r => r.notes ?? '—' },
  ];

  const logColumns: Column<AuditLogRes>[] = [
    { key: 'action', title: 'Action', render: r => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)' }}>{r.action}</span>, width: 180 },
    { key: 'performedByName', title: 'By', render: r => r.performedByName ?? '—', width: 150 },
    { key: 'createdAt', title: 'Time', render: r => formatDateTime(r.createdAt), width: 150 },
    { key: 'afterState', title: 'Change', render: r => r.afterState ? <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{JSON.stringify(r.afterState)}</span> : '—' },
  ];

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '8px 18px', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-sans)',
    background: active ? 'var(--accent-glow)' : 'transparent', color: active ? 'var(--accent)' : 'var(--text-secondary)',
  });

  if (isLoading) return <div style={{ padding: 32, color: 'var(--text-muted)' }}>Loading…</div>;
  if (!asset) return <div style={{ padding: 32, color: 'var(--red)' }}>Asset not found</div>;

  const hasOpenAssignment = history?.some(h => !h.returnedAt);

  return (
    <div className="fade-in">
      <PageHeader
        title={asset.name}
        subtitle={<><span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{asset.assetCode}</span> · <AssetStatusBadge status={asset.status} /></> as unknown as string}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary" icon={<ArrowLeft size={14} />} onClick={() => navigate('/assets')}>Back</Button>
            {canManageAssets && <>
              <Button variant="secondary" icon={<Edit2 size={14} />} onClick={() => setShowEdit(true)}>Edit</Button>
              {hasOpenAssignment && <Button variant="secondary" icon={<RotateCcw size={14} />} loading={returnMutation.isPending} onClick={() => returnMutation.mutate()}>Return</Button>}
              <Button variant="secondary" icon={<ArrowRightLeft size={14} />} onClick={() => setShowTransfer(true)}>Transfer</Button>
              {asset.status !== 'archived' && <Button variant="danger" icon={<Archive size={14} />} loading={archiveMutation.isPending} onClick={() => archiveMutation.mutate()}>Archive</Button>}
            </>}
          </div>
        }
      />

      {/* Detail card */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 24, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 28, marginBottom: 24 }}>
        <Field label="Category" value={CATEGORY_LABELS[asset.category]} />
        <Field label="Department" value={asset.departmentName} />
        <Field label="Purchase Price" value={formatCurrency(asset.purchasePrice)} />
        <Field label="Purchase Date" value={formatDate(asset.purchaseDate)} />
        <Field label="Created By" value={asset.createdByName} />
        <Field label="Created At" value={formatDateTime(asset.createdAt)} />
        {asset.archivedAt && <Field label="Archived At" value={formatDateTime(asset.archivedAt)} />}
        {asset.description && <div style={{ gridColumn: '1 / -1' }}><Field label="Description" value={asset.description} /></div>}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        <button style={tabStyle(activeTab === 'history')} onClick={() => setActiveTab('history')}>Assignment History ({history?.length ?? 0})</button>
        <button style={tabStyle(activeTab === 'logs')} onClick={() => setActiveTab('logs')}>Audit Logs ({logs?.length ?? 0})</button>
      </div>

      {activeTab === 'history'
        ? <Table columns={historyColumns} data={history ?? []} rowKey={r => r.id} emptyText="No assignment history" />
        : <Table columns={logColumns} data={logs ?? []} rowKey={r => r.id} emptyText="No audit logs" />
      }

      {/* Edit modal */}
      <AssetFormModal open={showEdit} onClose={() => setShowEdit(false)} departments={depts ?? []} asset={asset} />

      {/* Transfer modal */}
      <Modal open={showTransfer} onClose={() => setShowTransfer(false)} title="Transfer Asset"
        footer={<>
          <Button variant="secondary" onClick={() => setShowTransfer(false)}>Cancel</Button>
          <Button loading={transferMutation.isPending} onClick={() => transferMutation.mutate()} disabled={!transferDeptId}>Transfer</Button>
        </>}
      >
        <Select
          label="Target Department"
          value={transferDeptId}
          onChange={e => setTransferDeptId(e.target.value)}
          options={(depts ?? []).filter(d => d.id !== asset.departmentId).map(d => ({ value: d.id, label: `${d.name} (${d.code})` }))}
          placeholder="— Select department —"
        />
        {asset.departmentName && (
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 12 }}>
            Currently in: <strong>{asset.departmentName}</strong>
          </p>
        )}
      </Modal>
    </div>
  );
};