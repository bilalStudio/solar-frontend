import { useEffect } from 'react';

/**
 * DELETE CONFIRM MODAL
 *
 * Shows a clear warning before permanently deleting a customer.
 * Closes on Escape key or clicking the backdrop.
 */
export default function DeleteConfirmModal({ customer, onConfirm, onClose, saving }) {

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!customer) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 1040,
          background: 'rgba(0,0,0,0.4)',
          animation: 'fadeIn 0.15s ease',
        }}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Confirm Delete"
        style={{
          position: 'fixed', top: '50%', left: '50%', zIndex: 1050,
          transform: 'translate(-50%, -50%)',
          width: '100%', maxWidth: 420,
          background: '#fff',
          borderRadius: 14,
          boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
          padding: '28px 28px 24px',
          animation: 'modalIn 0.2s ease',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Warning icon */}
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: '#fde8e4', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          marginBottom: 18,
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E65428" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </div>

        <h3 style={{
          fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 800,
          color: 'var(--wv-dark)', margin: '0 0 8px',
        }}>
          Delete Customer?
        </h3>

        <p style={{ fontSize: 14, color: 'var(--wv-gray)', lineHeight: 1.6, margin: '0 0 6px' }}>
          You are about to permanently delete:
        </p>

        {/* Customer preview card */}
        <div style={{
          background: '#f8fafb', border: '1px solid #e8edf3',
          borderRadius: 10, padding: '12px 14px', marginBottom: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--wv-primary), var(--wv-green))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0,
            }}>
              {customer.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--wv-dark)' }}>
                {customer.name}
              </div>
              <div style={{ fontSize: 12, color: 'var(--wv-gray)' }}>
                {customer.email} {customer.city ? `· ${customer.city}` : ''}
              </div>
            </div>
          </div>
        </div>

        <p style={{ fontSize: 13, color: '#b33a1c', margin: '0 0 24px' }}>
          ⚠️ This action cannot be undone. All associated uploads and reports will also be removed.
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            disabled={saving}
            style={{
              padding: '9px 20px', borderRadius: 8,
              border: '1.5px solid #e8edf3', background: '#fff',
              fontSize: 14, fontWeight: 500, cursor: 'pointer',
              color: 'var(--wv-gray)', fontFamily: 'var(--font-body)',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={saving}
            style={{
              padding: '9px 22px', borderRadius: 8,
              border: 'none', background: '#E65428',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              color: '#fff', fontFamily: 'var(--font-body)',
              display: 'flex', alignItems: 'center', gap: 8,
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm" style={{ width: 14, height: 14 }} />
                Deleting...
              </>
            ) : 'Yes, Delete'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalIn {
          from { opacity: 0; transform: translate(-50%, -48%); }
          to   { opacity: 1; transform: translate(-50%, -50%); }
        }
      `}</style>
    </>
  );
}
