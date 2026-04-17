import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../../api/users.api';
import { PageHeader } from '../../components/common/PageHeader';
import { Table, type Column } from '../../components/common/Table';
import { Pagination } from '../../components/common/Pagination';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Select } from '../../components/common/Input';
import { RoleBadge, Badge } from '../../components/common/Badge';
import { useToast } from '../../components/common/Toast';
import { formatDateTime, getErrorMessage } from '../../utils/formatters';
import { type UserRes } from '../../types/user.types';
import { type UserRole, ROLE_LABELS } from '../../types/enums';

export const UsersPage: React.FC = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [page, setPage] = useState(0);
  const [filterRole, setFilterRole] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserRes | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRole, setNewRole] = useState<UserRole>('department_staff');

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, filterRole, filterActive],
    queryFn: () => usersApi.getAll({ page, size: 12, role: filterRole as UserRole || undefined, isActive: filterActive === '' ? undefined : filterActive === 'true' }),
  });

  const roleMutation = useMutation({
    mutationFn: () => usersApi.assignRole(selectedUser!.id, { role: newRole }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast('success', 'Role updated'); setShowRoleModal(false); },
    onError: err => toast('error', getErrorMessage(err)),
  });

  const statusMutation = useMutation({
    mutationFn: (user: UserRes) => usersApi.updateStatus(user.id, { isActive: !user.isActive }),
    onSuccess: (_, user) => { qc.invalidateQueries({ queryKey: ['users'] }); toast('success', user.isActive ? 'Account deactivated' : 'Account activated'); },
    onError: err => toast('error', getErrorMessage(err)),
  });

  const columns: Column<UserRes>[] = [
    { key: 'fullName', title: 'Name', render: r => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-glow)', border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: 'var(--accent)', flexShrink: 0 }}>
          {r.fullName?.charAt(0) ?? '?'}
        </div>
        <div>
          <div style={{ fontWeight: 500 }}>{r.fullName}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.email}</div>
        </div>
      </div>
    )},
    { key: 'role', title: 'Role', render: r => <RoleBadge role={r.role} />, width: 140 },
    { key: 'departmentName', title: 'Department', render: r => r.departmentName ?? <span style={{ color: 'var(--text-muted)' }}>—</span>, width: 160 },
    { key: 'isActive', title: 'Status', render: r => r.isActive ? <Badge variant="green">Active</Badge> : <Badge variant="red">Locked</Badge>, width: 90 },
    { key: 'createdAt', title: 'Joined', render: r => formatDateTime(r.createdAt), width: 140 },
    { key: 'actions', title: '', render: r => (
      <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
        <Button size="sm" variant="secondary" onClick={() => { setSelectedUser(r); setNewRole(r.role ?? 'department_staff'); setShowRoleModal(true); }}>Role</Button>
        <Button size="sm" variant={r.isActive ? 'danger' : 'secondary'} loading={statusMutation.isPending} onClick={() => statusMutation.mutate(r)}>
          {r.isActive ? 'Lock' : 'Unlock'}
        </Button>
      </div>
    ), width: 130 },
  ];

  const roleOptions = Object.entries(ROLE_LABELS).map(([v, l]) => ({ value: v, label: l }));

  return (
    <div className="fade-in">
      <PageHeader title="Users" subtitle={`${data?.totalElements ?? 0} accounts`} />

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <select value={filterRole} onChange={e => { setFilterRole(e.target.value); setPage(0); }}
          style={{ padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: 14, cursor: 'pointer' }}>
          <option value="">All Roles</option>
          {roleOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={filterActive} onChange={e => { setFilterActive(e.target.value); setPage(0); }}
          style={{ padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: 14, cursor: 'pointer' }}>
          <option value="">All Statuses</option>
          <option value="true">Active</option>
          <option value="false">Locked</option>
        </select>
      </div>

      <Table columns={columns} data={data?.content ?? []} loading={isLoading} rowKey={r => r.id} />
      <Pagination page={page} totalPages={data?.totalPages ?? 0} totalElements={data?.totalElements ?? 0} pageSize={12} onChange={setPage} />

      <Modal open={showRoleModal} onClose={() => setShowRoleModal(false)} title={`Assign Role — ${selectedUser?.fullName}`}
        footer={<>
          <Button variant="secondary" onClick={() => setShowRoleModal(false)}>Cancel</Button>
          <Button loading={roleMutation.isPending} onClick={() => roleMutation.mutate()}>Save Role</Button>
        </>}
      >
        <Select label="Role" value={newRole} onChange={e => setNewRole(e.target.value as UserRole)} options={roleOptions} />
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 12 }}>
          Current role: <RoleBadge role={selectedUser?.role ?? null} />
        </p>
      </Modal>
    </div>
  );
};