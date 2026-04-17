import React, { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning';
interface ToastItem { id: number; type: ToastType; message: string; }
interface ToastCtx { toast: (type: ToastType, message: string) => void; }

const ToastContext = createContext<ToastCtx>({ toast: () => {} });
export const useToast = () => useContext(ToastContext);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((type: ToastType, message: string) => {
    const id = Date.now();
    setToasts(p => [...p, { id, type, message }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  }, []);

  const icons = { success: <CheckCircle size={16} />, error: <XCircle size={16} />, warning: <AlertCircle size={16} /> };
  const colors = { success: 'var(--green)', error: 'var(--red)', warning: 'var(--amber)' };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {toasts.map(t => (
          <div key={t.id} className="fade-in" style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
            background: 'var(--bg-card)', border: `1px solid var(--border)`,
            borderLeft: `3px solid ${colors[t.type]}`,
            borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)',
            minWidth: 280, maxWidth: 400,
          }}>
            <span style={{ color: colors[t.type], flexShrink: 0 }}>{icons[t.type]}</span>
            <span style={{ flex: 1, fontSize: 14, color: 'var(--text-primary)' }}>{t.message}</span>
            <button onClick={() => setToasts(p => p.filter(x => x.id !== t.id))} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: 2 }}>
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};