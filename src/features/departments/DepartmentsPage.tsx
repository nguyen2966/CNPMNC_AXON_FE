import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Building2, Edit2 } from 'lucide-react';
import { departmentsApi } from '../../api/departments.api';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button.tsx';
import { Modal } from '../../components/common/Modal.tsx';
import { Input } from '../../components/common/Input.tsx';
import { useToast } from '../../components/common/Toast';
import { getErrorMessage } from '../../utils/formatters';
import type { DepartmentRes } from '../../types/department.types';

export const DepartmentsPage: React.FC = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<DepartmentRes | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  const { data, isLoading } = useQuery({ queryKey: ['departments'], queryFn: departmentsApi.getAll });

  const openCreate = () => { setEditing(null); setName(''); setCode(''); setShowModal(true); };
  const openEdit = (d: DepartmentRes) => { setEditing(d); setName(d.name); setCode(d.code); setShowModal(true); };

  const mutation = useMutation({
    mutationFn: () => editing ? departmentsApi.update(editing.id, { name, code: code.toUpperCase() }) : departmentsApi.create({ name, code: code.toUpperCase() }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['departments'] }); toast('success', editing ? 'Department updated' : 'Department created'); setShowModal(false); },
    onError: err => toast('error', getErrorMessage(err)),
  });

  return (
    <div className="fade-in">
      <PageHeader title="Departments" subtitle={`${data?.length ?? 0} departments`}
        actions={<Button icon={<Plus size={15} />} onClick={openCreate}>New Department</Button>}
      />

      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ height: 90, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {data?.map(dept => (
            <div key={dept.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--accent-glow)', border: '1px solid var(--border-focus)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Building2 size={18} color="var(--accent)" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dept.name}</div>
                <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--accent)', marginTop: 3 }}>{dept.code}</div>
              </div>
              <button onClick={() => openEdit(dept)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: 6, borderRadius: 6 }}>
                <Edit2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Department' : 'New Department'}
        footer={<>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button loading={mutation.isPending} onClick={() => mutation.mutate()} disabled={!name || !code}>{editing ? 'Save' : 'Create'}</Button>
        </>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input label="Department Name *" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Information Technology" />
          <Input label="Code *" value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="e.g. IT" maxLength={20} />
        </div>
      </Modal>
    </div>
  );
};