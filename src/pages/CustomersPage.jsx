import { useState, useEffect, useCallback } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import CustomerModal from '../components/CustomerModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { customerAPI } from '../services/api';
import { DEMO_CUSTOMERS } from '../data/demoData';
import { useNavigate } from 'react-router-dom';
// ─── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  active:   { label: 'Active',   className: 'badge-success', dot: '#54A877' },
  pending:  { label: 'Pending',  className: 'badge-warning', dot: '#f59e0b' },
  inactive: { label: 'Inactive', className: 'badge-danger',  dot: '#9ca3af' },
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, color, bg, isActive, onClick }) {
  return (
    <div
      className="kpi-card"
      onClick={onClick}
      style={{
        padding: '16px 18px', cursor: 'pointer',
        border: `2px solid ${isActive ? color : 'transparent'}`,
        boxShadow: isActive ? `0 0 0 4px ${color}18` : undefined,
        transition: 'border-color 0.15s, box-shadow 0.15s',
        userSelect: 'none',
      }}
    >
      <div className="kpi-icon" style={{ background: isActive ? color + '22' : bg, width: 36, height: 36, borderRadius: 8, marginBottom: 10 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
      </div>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value" style={{ fontSize: 22, color: isActive ? color : undefined }}>{value}</div>
      {isActive && (
        <div style={{ fontSize: 11, color, marginTop: 4, fontWeight: 600 }}>Filtered ✓</div>
      )}
    </div>
  );
}

// ─── Customer Row ─────────────────────────────────────────────────────────────
function CustomerRow({ customer, onEdit, onDelete, onView }) {
  const status = STATUS_CONFIG[customer.status] || STATUS_CONFIG.inactive;
  const initials = customer.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <tr>
      {/* Name + avatar */}
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--wv-primary), var(--wv-green))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>
            {initials}
          </div>
          <div>
            <a
              href={`/customers/${customer.id}`}
              style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--wv-dark)', textDecoration: 'none', display: 'block' }}
              onMouseEnter={e => { e.target.style.color = 'var(--wv-primary)'; e.target.style.textDecoration = 'underline'; }}
              onMouseLeave={e => { e.target.style.color = 'var(--wv-dark)'; e.target.style.textDecoration = 'none'; }}
            >
              {customer.name}
            </a>
            <div style={{ fontSize: 12, color: 'var(--wv-gray)' }}>{customer.email}</div>
          </div>
        </div>
      </td>

      {/* Phone */}
      <td style={{ fontSize: 13, color: 'var(--wv-gray)' }}>{customer.phone || '—'}</td>

      {/* City */}
      <td style={{ fontSize: 13, color: 'var(--wv-dark)' }}>{customer.city || '—'}</td>

      {/* System size */}
      <td style={{ fontSize: 13, fontWeight: 500, color: 'var(--wv-dark)' }}>
        {customer.systemSizeKw ? `${customer.systemSizeKw} kW` : '—'}
      </td>

      {/* Installation date */}
      <td style={{ fontSize: 12, color: 'var(--wv-gray)' }}>
        {customer.installationDate
          ? new Date(customer.installationDate).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })
          : '—'}
      </td>

      {/* Status */}
      <td>
        <span className={status.className} style={{ fontSize: 11 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: status.dot, display: 'inline-block', marginRight: 5, verticalAlign: 1 }} />
          {status.label}
        </span>
      </td>

      {/* Actions */}
      <td>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => onView(customer)}
            title="View analytics"
            style={{
              width: 30, height: 30, borderRadius: 6, border: '1px solid #e8edf3',
              background: '#fff', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--wv-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
          <button
            onClick={() => onEdit(customer)}
            title="Edit customer"
            style={{
              width: 30, height: 30, borderRadius: 6, border: '1px solid #e8edf3',
              background: '#fff', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#525252" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button
            onClick={() => onDelete(customer)}
            title="Delete customer"
            style={{
              width: 30, height: 30, borderRadius: 6, border: '1px solid #fde8e4',
              background: '#fef9f8', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E65428" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────
function EmptyState({ hasFilters, onAdd }) {
  return (
    <tr>
      <td colSpan={7}>
        <div style={{ textAlign: 'center', padding: '52px 24px' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>
            {hasFilters ? '🔍' : '👥'}
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700, marginBottom: 6, color: 'var(--wv-dark)' }}>
            {hasFilters ? 'No customers match your search' : 'No customers yet'}
          </div>
          <p style={{ fontSize: 13, color: 'var(--wv-gray)', marginBottom: 20 }}>
            {hasFilters
              ? 'Try a different search term or clear the filters.'
              : 'Add your first solar customer to get started.'}
          </p>
          {!hasFilters && (
            <button className="btn-wv-primary" onClick={onAdd}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add First Customer
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function CustomersPage() {
  const navigate = useNavigate();
  const [customers, setCustomers]         = useState([]);
  const [filtered, setFiltered]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [searchQuery, setSearchQuery]     = useState('');
  const [activeTab, setActiveTab]         = useState('all');
  const [showAddModal, setShowAddModal]   = useState(false);
  const [editCustomer, setEditCustomer]   = useState(null);
  const [deleteCustomer, setDeleteCustomer] = useState(null);
  const [saving, setSaving]               = useState(false);
  const [toast, setToast]                 = useState(null);
  const [isDemoMode, setIsDemoMode]       = useState(false);

  // ── Load customers from API ──────────────────────────────────────────────────
  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await customerAPI.getAll();
      // Handle both { data: { data: [...] } } and { data: [...] } shapes
      const list = res.data?.data ?? res.data ?? [];
      if (!Array.isArray(list)) throw new Error('unexpected response format');
      setCustomers(list);
      setIsDemoMode(false);
    } catch (err) {
      // Backend not running — fall back to demo data silently
      console.warn('Backend unavailable, using demo data');
      setCustomers(DEMO_CUSTOMERS);
      setIsDemoMode(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCustomers(); }, [loadCustomers]);

  // ── Filter customers whenever list / search / tab changes ───────────────────
  useEffect(() => {
    let result = [...customers];

    // Tab filter
    if (activeTab !== 'all') {
      result = result.filter(c => c.status === activeTab);
    }

    // Search filter (name or email or city)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.city?.toLowerCase().includes(q)
      );
    }

    setFiltered(result);
  }, [customers, searchQuery, activeTab]);

  // ── Toast helper ─────────────────────────────────────────────────────────────
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── CRUD handlers ─────────────────────────────────────────────────────────────
  const handleSave = async (formData, isEdit) => {
    setSaving(true);
    try {
      if (isDemoMode) {
        // Demo mode: update local state only
        if (isEdit) {
          setCustomers(prev => prev.map(c =>
            c.id === editCustomer.id ? { ...c, ...formData } : c
          ));
          showToast('Customer updated (demo mode)');
        } else {
          const newCustomer = { id: Date.now(), ...formData, status: formData.status || 'active' };
          setCustomers(prev => [newCustomer, ...prev]);
          showToast('Customer added (demo mode)');
        }
      } else {
        // Real API mode
        if (isEdit) {
          await customerAPI.update(editCustomer.id, formData);
          showToast('Customer updated successfully');
        } else {
          await customerAPI.create(formData);
          showToast('Customer created successfully');
        }
        await loadCustomers();
      }
      setShowAddModal(false);
      setEditCustomer(null);
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteCustomer) return;
    setSaving(true);
    try {
      if (isDemoMode) {
        setCustomers(prev => prev.filter(c => c.id !== deleteCustomer.id));
        showToast('Customer deleted (demo mode)');
      } else {
        await customerAPI.delete(deleteCustomer.id);
        showToast('Customer deleted');
        await loadCustomers();
      }
      setDeleteCustomer(null);
    } catch (err) {
      showToast('Failed to delete customer', 'error');
    } finally {
      setSaving(false);
    }
  };

const handleView = (customer) => {
  navigate(`/analytics?customerId=${customer.id}`);
};

  // ── Computed stats ───────────────────────────────────────────────────────────
  const stats = {
    total:    customers.length,
    active:   customers.filter(c => c.status === 'active').length,
    pending:  customers.filter(c => c.status === 'pending').length,
    inactive: customers.filter(c => c.status === 'inactive').length,
  };

  const tabs = [
    { key: 'all',      label: 'All',      count: stats.total },
    { key: 'active',   label: 'Active',   count: stats.active },
    { key: 'pending',  label: 'Pending',  count: stats.pending },
    { key: 'inactive', label: 'Inactive', count: stats.inactive },
  ];

  const hasFilters = searchQuery.trim() !== '' || activeTab !== 'all';

  return (
    <ProtectedRoute
      title="Customers"
      subtitle="Manage your solar customer CRM"
      actions={
        <button className="btn-wv-primary" onClick={() => setShowAddModal(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Customer
        </button>
      }
    >

      {/* Demo mode banner */}
      {isDemoMode && (
        <div style={{
          background: '#FAEEDA', border: '1px solid #FAC775',
          borderRadius: 10, padding: '10px 16px', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#633806',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span><strong>Demo Mode:</strong> Backend not connected. Showing sample data. Changes are local only.</span>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="alert-wv error" style={{ marginBottom: 20 }}>{error}</div>
      )}

      {/* Stats row — click a card to filter the table */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-sm-3">
          <StatCard label="Total Customers" value={stats.total}    color="#25A1AB" bg="#e1f5f6"
            isActive={activeTab === 'all'}      onClick={() => setActiveTab(activeTab === 'all'      ? 'all' : 'all')} />
        </div>
        <div className="col-6 col-sm-3">
          <StatCard label="Active"          value={stats.active}   color="#54A877" bg="#eaf4ef"
            isActive={activeTab === 'active'}   onClick={() => setActiveTab(activeTab === 'active'   ? 'all' : 'active')} />
        </div>
        <div className="col-6 col-sm-3">
          <StatCard label="Pending"         value={stats.pending}  color="#f59e0b" bg="#fef3cd"
            isActive={activeTab === 'pending'}  onClick={() => setActiveTab(activeTab === 'pending'  ? 'all' : 'pending')} />
        </div>
        <div className="col-6 col-sm-3">
          <StatCard label="Inactive"        value={stats.inactive} color="#9ca3af" bg="#f3f4f6"
            isActive={activeTab === 'inactive'} onClick={() => setActiveTab(activeTab === 'inactive' ? 'all' : 'inactive')} />
        </div>
      </div>

      {/* Table card */}
      <div className="wv-card">

        {/* Card header: active filter indicator + search */}
        <div style={{
          padding: '14px 22px',
          borderBottom: '1px solid #f0f3f8',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {activeTab !== 'all' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, color: 'var(--wv-gray)' }}>Showing:</span>
                <span style={{
                  background: activeTab === 'active' ? '#e6f4ec' : activeTab === 'pending' ? '#fef3cd' : '#f3f4f6',
                  color: activeTab === 'active' ? '#1a7a3c' : activeTab === 'pending' ? '#92400e' : '#6b7280',
                  fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 99,
                }}>
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} customers
                </span>
                <button
                  onClick={() => setActiveTab('all')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--wv-primary)', textDecoration: 'underline', padding: 0 }}
                >
                  Clear filter
                </button>
              </div>
            ) : (
              <span style={{ fontSize: 13, color: 'var(--wv-gray)' }}>
                All customers &nbsp;·&nbsp; Click a card above to filter
              </span>
            )}
          </div>

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"
              style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            >
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search by name, email, city..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                paddingLeft: 32, paddingRight: 12,
                height: 34, width: 260, fontSize: 13,
                border: '1.5px solid #e8edf3', borderRadius: 8,
                outline: 'none', fontFamily: 'var(--font-body)',
                color: 'var(--wv-dark)', background: '#f8fafb',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--wv-primary)'}
              onBlur={e => e.target.style.borderColor = '#e8edf3'}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 2,
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="wv-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>City</th>
                <th>System Size</th>
                <th>Install Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Loading skeleton rows
                [1,2,3,4].map(i => (
                  <tr key={i}>
                    {[1,2,3,4,5,6,7].map(j => (
                      <td key={j}>
                        <div style={{
                          height: 14, borderRadius: 4,
                          background: 'linear-gradient(90deg, #f0f3f8 25%, #e8edf3 50%, #f0f3f8 75%)',
                          backgroundSize: '200% 100%',
                          animation: 'shimmer 1.4s infinite',
                          width: j === 1 ? '80%' : j === 7 ? '60%' : '70%',
                        }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <EmptyState hasFilters={hasFilters} onAdd={() => setShowAddModal(true)} />
              ) : (
                filtered.map(customer => (
                  <CustomerRow
                    key={customer.id}
                    customer={customer}
                    onEdit={c => setEditCustomer(c)}
                    onDelete={c => setDeleteCustomer(c)}
                    onView={handleView}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!loading && filtered.length > 0 && (
          <div style={{
            padding: '12px 22px',
            borderTop: '1px solid #f0f3f8',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 12, color: 'var(--wv-gray)' }}>
              Showing <strong>{filtered.length}</strong> of <strong>{customers.length}</strong> customers
            </span>
            {hasFilters && (
              <button
                onClick={() => { setSearchQuery(''); setActiveTab('all'); }}
                style={{
                  fontSize: 12, color: 'var(--wv-primary)', background: 'none',
                  border: 'none', cursor: 'pointer', textDecoration: 'underline',
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {(showAddModal || editCustomer) && (
        <CustomerModal
          customer={editCustomer}
          onSave={handleSave}
          onClose={() => { setShowAddModal(false); setEditCustomer(null); }}
          saving={saving}
        />
      )}

      {deleteCustomer && (
        <DeleteConfirmModal
          customer={deleteCustomer}
          onConfirm={handleDelete}
          onClose={() => setDeleteCustomer(null)}
          saving={saving}
        />
      )}

      {/* ── Toast notification ── */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
          background: toast.type === 'error' ? '#b33a1c'
                    : toast.type === 'info'  ? 'var(--wv-blue)'
                    : '#1a7a3c',
          color: '#fff',
          padding: '12px 20px', borderRadius: 10,
          fontSize: 13.5, fontWeight: 500,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', gap: 10,
          animation: 'slideUp 0.25s ease',
          maxWidth: 360,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {toast.type === 'error'
              ? <><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></>
              : <><polyline points="20 6 9 17 4 12"/></>
            }
          </svg>
          {toast.message}
        </div>
      )}

      {/* Keyframe styles for shimmer + toast slide */}
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

    </ProtectedRoute>
  );
}
