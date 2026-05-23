import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

function ToastItem({ toast, onClose }) {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
    confirm: '?',
  };

  const colors = {
    success: { bg: '#1f8a4f', border: '#166538' },
    error:   { bg: '#dc2626', border: '#991b1b' },
    warning: { bg: '#d97706', border: '#92400e' },
    info:    { bg: '#2563eb', border: '#1e40af' },
    confirm: { bg: '#374151', border: '#111827' },
  };

  const c = colors[toast.type] || colors.info;

  return (
    <div style={{
      background: c.bg,
      border: `1px solid ${c.border}`,
      color: '#fff',
      borderRadius: 12,
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
      boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
      width: '100%',
      animation: 'slideIn 0.25s ease',
    }}>
      <span style={{
        width: 24, height: 24, borderRadius: '50%',
        background: 'rgba(255,255,255,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 700, flexShrink: 0,
      }}>
        {icons[toast.type] || 'ℹ'}
      </span>

      <div style={{ flex: 1, minWidth: 0 }}>
        {toast.title && (
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{toast.title}</div>
        )}
        <div style={{ fontSize: 13, lineHeight: 1.5, opacity: 0.95 }}>{toast.message}</div>

        {toast.type === 'confirm' && (
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button
              onClick={() => { toast.onConfirm?.(); onClose(toast.id); }}
              style={{
                background: '#fff', color: c.bg, border: 'none',
                borderRadius: 6, padding: '6px 14px', fontSize: 13,
                fontWeight: 600, cursor: 'pointer',
              }}>
              {toast.confirmLabel || 'Confirm'}
            </button>
            <button
              onClick={() => { toast.onCancel?.(); onClose(toast.id); }}
              style={{
                background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none',
                borderRadius: 6, padding: '6px 14px', fontSize: 13,
                cursor: 'pointer',
              }}>
              Cancel
            </button>
          </div>
        )}
      </div>

      {toast.type !== 'confirm' && (
        <button onClick={() => onClose(toast.id)} style={{
          background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)',
          cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 0,
          flexShrink: 0, marginTop: -2,
        }}>×</button>
      )}
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((options) => {
    const id = Date.now() + Math.random();
    const toast = { id, type: 'info', duration: 4000, ...options };
    setToasts((prev) => [...prev.slice(-4), toast]);

    if (toast.type !== 'confirm' && toast.duration > 0) {
      setTimeout(() => removeToast(id), toast.duration);
    }
    return id;
  }, [removeToast]);

  const toast = {
    success: (message, title) => addToast({ type: 'success', message, title }),
    error:   (message, title) => addToast({ type: 'error', message, title, duration: 6000 }),
    warning: (message, title) => addToast({ type: 'warning', message, title, duration: 5000 }),
    info:    (message, title) => addToast({ type: 'info', message, title }),
    confirm: (message, onConfirm, onCancel, confirmLabel) =>
      addToast({ type: 'confirm', message, onConfirm, onCancel, confirmLabel, duration: 0 }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100%); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .toast-wrap {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 99999;
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: min(380px, calc(100vw - 24px));
        }
        @media (max-width: 480px) {
          .toast-wrap {
            bottom: 12px;
            right: 12px;
            left: 12px;
            width: auto;
          }
        }
      `}</style>

      <div className="toast-wrap" role="alert" aria-live="polite">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
