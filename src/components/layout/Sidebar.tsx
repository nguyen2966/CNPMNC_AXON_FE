import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Package, Building2, Users,
  ClipboardCheck, ScrollText, LogOut
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore.ts';
import { usePermission } from '../../hooks/usePermission';
import { authApi } from '../../api/auth.api';

interface NavItem { to: string; icon: React.ReactNode; label: string; }

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const perm = usePermission();

  const navItems: NavItem[] = [
    { to: '/dashboard', icon: <LayoutDashboard size={17} />, label: 'Dashboard' },
    { to: '/assets', icon: <Package size={17} />, label: 'Assets' },
    ...(perm.isAdmin ? [{ to: '/departments', icon: <Building2 size={17} />, label: 'Departments' }] : []),
    ...(perm.isAdmin ? [{ to: '/users', icon: <Users size={17} />, label: 'Users' }] : []),
    ...(perm.hasRole('admin', 'auditor', 'department_staff') ? [{ to: '/validation', icon: <ClipboardCheck size={17} />, label: 'Validation' }] : []),
    ...(perm.canViewAuditLogs ? [{ to: '/audit-logs', icon: <ScrollText size={17} />, label: 'Audit Logs' }] : []),
  ];

  const handleLogout = async () => {
    try { await authApi.logout(); } finally { logout(); }
  };

  return (
    <aside style={{
      width: 'var(--sidebar-w)', height: '100vh', position: 'fixed', left: 0, top: 0,
      background: 'var(--bg-card)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--accent), #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>A</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: -0.3 }}>AMS</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Asset Management</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
              borderRadius: 'var(--radius-sm)',
              color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
              background: isActive ? 'var(--accent-glow)' : 'transparent',
              fontWeight: isActive ? 500 : 400, fontSize: 14,
              transition: 'all 0.15s', textDecoration: 'none',
            })}
            onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; if (!el.className.includes('active')) el.style.background = 'var(--bg-hover)'; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; if (!el.style.color.includes('accent')) el.style.background = 'transparent'; }}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div style={{ padding: 12, borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 10px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-hover)', marginBottom: 6 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--accent-glow)', border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: 'var(--accent)', flexShrink: 0 }}>
            {user?.fullName?.charAt(0) ?? '?'}
          </div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.fullName}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role?.replace(/_/g, ' ')}</div>
          </div>
        </div>
        <button onClick={handleLogout} style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
          borderRadius: 'var(--radius-sm)', background: 'none', border: 'none',
          color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer',
          transition: 'all 0.15s',
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(240,82,82,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--red)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}
        >
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </aside>
  );
};