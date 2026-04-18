import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus } from 'lucide-react';
import { usersApi } from '../../api/users.api';
import { departmentsApi } from '../../api/departments.api';
import { PageHeader } from '../../components/common/PageHeader';
import { Table, type Column } from '../../components/common/Table';
import { Pagination } from '../../components/common/Pagination';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input, Select } from '../../components/common/Input';
import { RoleBadge, Badge } from '../../components/common/Badge';
import { useToast } from '../../components/common/Toast';
import { formatDateTime, getErrorMessage } from '../../utils/formatters';
import type { UserRes, CreateUserReq } from '../../types/user.types';
import { type UserRole, ROLE_LABELS } from '../../types/enums';

type ModalType = 'none' | 'create' | 'role' | 'department';

const emptyCreateForm = (): CreateUserReq => ({
  email: '', password: '', fullName: '', role: undefined, departmentId: undefined,
});

export const UsersPage: React.FC = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [page, setPage] = useState(0);
  const [filterRole, setFilterRole] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [activeModal, setActiveModal] = useState<ModalType>('none');
  const [selectedUser, setSelectedUser] = useState<UserRes | null>(null);
  const [createForm, setCreateForm] = useState<CreateUserReq>(emptyCreateForm());
  const [newRole, setNewRole] = useState<UserRole>('department_staff');
  const [newDeptId, setNewDeptId] = useState<string>('');

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, filterRole, filterActive],
    queryFn: () => usersApi.getAll({
      page, size: 12,
      role: filterRole as UserRole || undefined,
      isActive: filterActive === '' ? undefined : filterActive === 'true',
    }),
  });

  const { data: depts } = useQuery({ queryKey: ['departments'], queryFn: departmentsApi.getAll });

  // ── Modal helpers ────────────────────────────────────────────────────────────
  const openRole = (u: UserRes) => {
    setSelectedUser(u);
    setNewRole(u.role ?? 'department_staff');
    setActiveModal('role');
  };

  const openDepartment = (u: UserRes) => {
    setSelectedUser(u);
    setNewDeptId(u.departmentId ?? '');
    setActiveModal('department');
  };

  const openCreate = () => {
    setCreateForm(emptyCreateForm());
    setActiveModal('create');
  };

  const closeModal = () => {
    setActiveModal('none');
    setSelectedUser(null);
  };

  // ── Mutations ────────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: () => usersApi.createUser({
      ...createForm,
      role: createForm.role || undefined,
      departmentId: createForm.departmentId || undefined,
    }),
    onSuccess: (u) => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast('success', `Account created for ${u.fullName}`);
      closeModal();
    },
    onError: (err) => toast('error', getErrorMessage(err)),
  });

  const roleMutation = useMutation({
    mutationFn: () => usersApi.assignRole(selectedUser!.id, { role: newRole }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast('success', 'Role updated');
      closeModal();
    },
    onError: (err) => toast('error', getErrorMessage(err)),
  });

  const deptMutation = useMutation({
    mutationFn: () => usersApi.updateDepartment(selectedUser!.id, { departmentId: newDeptId || null }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast('success', 'Department updated');
      closeModal();
    },
    onError: (err) => toast('error', getErrorMessage(err)),
  });

  const statusMutation = useMutation({
    mutationFn: (u: UserRes) => usersApi.updateStatus(u.id, { isActive: !u.isActive }),
    onSuccess: (_, u) => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast('success', u.isActive ? 'Account deactivated' : 'Account activated');
    },
    onError: (err) => toast('error', getErrorMessage(err)),
  });

  // ── Table columns ────────────────────────────────────────────────────────────
  const roleOptions = Object.entries(ROLE_LABELS).map(([v, l]) => ({ value: v, label: l }));
  const deptOptions = (depts ?? []).map((d) => ({ value: d.id, label: `${d.name} (${d.code})` }));

  const columns: Column<UserRes>[] = [
    {
      key: 'fullName',
      title: 'Name',
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--accent-glow)', border: '1px solid var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 600, color: 'var(--accent)', flexShrink: 0,
          }}>
            {r.fullName?.charAt(0) ?? '?'}
          </div>
          <div>
            <div style={{ fontWeight: 500 }}>{r.fullName}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      title: 'Role',
      render: (r) => <RoleBadge role={r.role} />,
      width: 140,
    },
    {
      key: 'departmentName',
      title: 'Department',
      render: (r) => (
        <button
          onClick={(e) => { e.stopPropagation(); openDepartment(r); }}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 0, textAlign: 'left', fontFamily: 'var(--font-sans)', fontSize: 14,
          }}
        >
          {r.departmentName
            ? <span style={{ color: 'var(--text-primary)' }}>{r.departmentName}</span>
            : <span style={{ color: 'var(--accent)', fontSize: 13 }}>+ Assign dept</span>
          }
        </button>
      ),
      width: 170,
    },
    {
      key: 'isActive',
      title: 'Status',
      render: (r) => r.isActive
        ? <Badge variant="green">Active</Badge>
        : <Badge variant="red">Locked</Badge>,
      width: 90,
    },
    {
      key: 'createdAt',
      title: 'Joined',
      render: (r) => formatDateTime(r.createdAt),
      width: 150,
    },
    {
      key: 'actions',
      title: '',
      render: (r) => (
        <div style={{ display: 'flex', gap: 6 }} onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="secondary" onClick={() => openRole(r)}>
            Role
          </Button>
          <Button
            size="sm"
            variant={r.isActive ? 'danger' : 'secondary'}
            loading={statusMutation.isPending}
            onClick={() => statusMutation.mutate(r)}
          >
            {r.isActive ? 'Lock' : 'Unlock'}
          </Button>
        </div>
      ),
      width: 140,
    },
  ];

  const setCreate = (k: keyof CreateUserReq, v: string) =>
    setCreateForm((f) => ({ ...f, [k]: v || undefined }));

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="fade-in">
      <PageHeader
        title="Users"
        subtitle={`${data?.totalElements ?? 0} accounts`}
        actions={
          <Button icon={<UserPlus size={15} />} onClick={openCreate}>
            New Account
          </Button>
        }
      />

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <select
          value={filterRole}
          onChange={(e) => { setFilterRole(e.target.value); setPage(0); }}
          style={{ padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: 14, cursor: 'pointer' }}
        >
          <option value="">All Roles</option>
          {roleOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select
          value={filterActive}
          onChange={(e) => { setFilterActive(e.target.value); setPage(0); }}
          style={{ padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: 14, cursor: 'pointer' }}
        >
          <option value="">All Statuses</option>
          <option value="true">Active</option>
          <option value="false">Locked</option>
        </select>
      </div>

      <Table
        columns={columns}
        data={data?.content ?? []}
        loading={isLoading}
        rowKey={(r) => r.id}
      />
      <Pagination
        page={page}
        totalPages={data?.totalPages ?? 0}
        totalElements={data?.totalElements ?? 0}
        pageSize={12}
        onChange={setPage}
      />

      {/* ── Create Account Modal ──────────────────────────────────────────────── */}
      <Modal
        open={activeModal === 'create'}
        onClose={closeModal}
        title="Create New Account"
        footer={
          <>
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button
              loading={createMutation.isPending}
              onClick={() => createMutation.mutate()}
              disabled={!createForm.email || !createForm.password || !createForm.fullName}
            >
              Create Account
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input
            label="Full Name *"
            value={createForm.fullName}
            onChange={(e) => setCreate('fullName', e.target.value)}
            placeholder="Nguyen Van A"
            autoFocus
          />
          <Input
            label="Email *"
            type="email"
            value={createForm.email}
            onChange={(e) => setCreate('email', e.target.value)}
            placeholder="user@company.com"
          />
          <Input
            label="Password *"
            type="password"
            value={createForm.password}
            onChange={(e) => setCreate('password', e.target.value)}
            placeholder="Min. 6 characters"
          />
          <Select
            label="Role"
            value={createForm.role ?? ''}
            onChange={(e) => setCreate('role', e.target.value)}
            options={roleOptions}
            placeholder="— No role (assign later) —"
          />
          <Select
            label="Department"
            value={createForm.departmentId ?? ''}
            onChange={(e) => setCreate('departmentId', e.target.value)}
            options={deptOptions}
            placeholder="— No department —"
          />
        </div>
      </Modal>

      {/* ── Assign Role Modal ─────────────────────────────────────────────────── */}
      <Modal
        open={activeModal === 'role'}
        onClose={closeModal}
        title={`Assign Role — ${selectedUser?.fullName}`}
        footer={
          <>
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button loading={roleMutation.isPending} onClick={() => roleMutation.mutate()}>
              Save Role
            </Button>
          </>
        }
      >
        <Select
          label="Role"
          value={newRole}
          onChange={(e) => setNewRole(e.target.value as UserRole)}
          options={roleOptions}
        />
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 12 }}>
          Current: <RoleBadge role={selectedUser?.role ?? null} />
        </p>
      </Modal>

      {/* ── Update Department Modal ───────────────────────────────────────────── */}
      <Modal
        open={activeModal === 'department'}
        onClose={closeModal}
        title={`Update Department — ${selectedUser?.fullName}`}
        footer={
          <>
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button loading={deptMutation.isPending} onClick={() => deptMutation.mutate()}>
              Save Department
            </Button>
          </>
        }
      >
        <Select
          label="Department"
          value={newDeptId}
          onChange={(e) => setNewDeptId(e.target.value)}
          options={deptOptions}
          placeholder="— Remove from department —"
        />
        {selectedUser?.departmentName && (
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 12 }}>
            Current:{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{selectedUser.departmentName}</strong>
          </p>
        )}
      </Modal>
    </div>
  );
};