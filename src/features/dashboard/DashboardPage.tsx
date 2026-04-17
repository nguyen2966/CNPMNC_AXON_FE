import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Package, CheckCircle, XCircle, Clock} from 'lucide-react';
import { dashboardApi } from '../../api/dashboard.api';
import { PageHeader } from '../../components/common/PageHeader';
import { formatCurrency } from '../../utils/formatters';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const KpiCard: React.FC<{ icon: React.ReactNode; label: string; value: number | string; color: string; sub?: string }> = ({ icon, label, value, color, sub }) => (
  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>{icon}</div>
    </div>
    <div>
      <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -1, color: 'var(--text-primary)' }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
    </div>
  </div>
);

export const DashboardPage: React.FC = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({ queryKey: ['dashboard-stats'], queryFn: dashboardApi.getStats });
  const { data: byDept } = useQuery({ queryKey: ['dashboard-dept'], queryFn: dashboardApi.getByDepartment });
  const { data: progress } = useQuery({ queryKey: ['dashboard-progress'], queryFn: dashboardApi.getValidationProgress });

  const validationData = stats ? [
    { name: 'Valid',   value: stats.validationValid,   color: 'var(--green)' },
    { name: 'Invalid', value: stats.validationInvalid, color: 'var(--red)' },
    { name: 'Missing', value: stats.validationMissing, color: 'var(--amber)' },
    { name: 'Pending', value: stats.validationPending, color: 'var(--text-muted)' },
  ] : [];

  return (
    <div className="fade-in">
      <PageHeader title="Dashboard" subtitle="System overview and asset statistics" />

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <KpiCard icon={<Package size={18} />}      label="Total Assets"  value={statsLoading ? '…' : stats?.totalAssets ?? 0}   color="var(--accent)" />
        <KpiCard icon={<CheckCircle size={18} />}  label="Active"        value={statsLoading ? '…' : stats?.activeAssets ?? 0}  color="var(--green)"  sub="Currently in use" />
        <KpiCard icon={<XCircle size={18} />}      label="Inactive"      value={statsLoading ? '…' : stats?.inactiveAssets ?? 0} color="var(--amber)" />
        <KpiCard icon={<Clock size={18} />}        label="Archived"      value={statsLoading ? '…' : stats?.archivedAssets ?? 0} color="var(--text-muted)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Validation progress */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Validation Progress</h3>
          {progress ? (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>Year {progress.year} — {progress.status.replace('_', ' ')}</p>
          ) : (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>No active session</p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {validationData.map(d => (
              <div key={d.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 13 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{d.name}</span>
                  <span style={{ color: d.color, fontWeight: 600 }}>{d.value}</span>
                </div>
                <div style={{ height: 6, background: 'var(--bg-hover)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${stats && stats.totalAssets > 0 ? (d.value / stats.totalAssets) * 100 : 0}%`, background: d.color, borderRadius: 3, transition: 'width 0.8s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assets by department */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Assets by Department</h3>
          {byDept && byDept.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={byDept} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="departmentName" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }}
                  formatter={(v: number, n: string) => [n === 'assetCount' ? v : formatCurrency(v), n === 'assetCount' ? 'Assets' : 'Value']}
                />
                <Bar dataKey="assetCount" radius={[4, 4, 0, 0]}>
                  {byDept.map((_, i) => <Cell key={i} fill="var(--accent)" fillOpacity={0.7 + (i % 3) * 0.1} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--border)' }} />
                  <div style={{ height: 12, background: 'var(--border)', borderRadius: 4, flex: 1, animation: 'pulse 1.5s ease-in-out infinite' }} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};