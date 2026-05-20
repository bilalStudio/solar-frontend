import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import { analyticsAPI, customerAPI } from '../services/api';
import { isDemoMode } from '../services/demoMode';

export default function DashboardPage() {
  const [kpis, setKpis] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      analyticsAPI.getDashboardKPIs(),
      customerAPI.getAll(),
    ])
      .then(([k, c]) => {
        setKpis(k.data?.data || {});
        setCustomers(c.data?.data || []);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <ProtectedRoute title="Dashboard" subtitle="Solar performance overview">
        <p>Loading...</p>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute title="Dashboard" subtitle="Solar performance overview">
      <div style={{ maxWidth: 1200 }}>
        {isDemoMode() && (
          <div style={{
            background: 'linear-gradient(135deg, #25A1AB, #345EA6)',
            color: 'white', padding: '12px 18px', borderRadius: 8, marginBottom: 18,
            display: 'flex', alignItems: 'center', gap: 10, fontSize: 13,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span><b>Demo Mode</b> — You're viewing sample data. No backend required. Data changes are not saved.</span>
          </div>
        )}
        {error && <div className="alert-wv error">{error}</div>}

        {/* KPI tiles - exactly 5, balanced grid */}
        <div className="dashboard-kpi-grid">
          <KpiCard label="Total Customers" value={kpis?.totalCustomers ?? 0} color="#25A1AB" />
          <KpiCard label="Active Customers" value={kpis?.activeCustomers ?? 0} color="#54A877" />
          <KpiCard label="Pending Customers" value={kpis?.pendingCustomers ?? 0} color="#f59e0b" />
          <KpiCard label="Total Uploads" value={kpis?.totalUploads ?? 0} color="#345EA6" />
          <KpiCard label="Reports Sent" value={kpis?.reportsSent ?? 0} color="#7c3aed" />
        </div>

        {/* Quick Actions - grouped & balanced */}
        <div className="kpi-card" style={{ padding: 24, marginTop: 24 }}>
          <h3 style={{ marginTop: 0, marginBottom: 18, color: 'var(--wv-dark)' }}>Quick Actions</h3>

          <div style={{ marginBottom: 18 }}>
            <div className="qa-group-label">Operations</div>
            <div className="qa-grid">
              <QuickAction to="/upload" label="Upload Data" desc="Add solar or utility data" color="#25A1AB"
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                </svg>} />
              <QuickAction to="/comparison" label="Comparison" desc="All performance analyses" color="#345EA6"
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
                </svg>} />
              <QuickAction to="/analytics" label="Analytics" desc="ROI and variance trends" color="#7c3aed"
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
                </svg>} />
            </div>
          </div>

          <div>
            <div className="qa-group-label">Reporting &amp; CRM</div>
            <div className="qa-grid">
              <QuickAction to="/reports" label="Reports" desc="Generate &amp; send" color="#54A877"
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                </svg>} />
              <QuickAction to="/customers" label="Customers" desc="Manage profiles" color="#f59e0b"
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>} />
              <QuickAction to="/customers" label="Add Customer" desc="Onboard a new client" color="#25A1AB"
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
                </svg>} />
            </div>
          </div>
        </div>

        {/* Recent customers */}
        <div className="kpi-card" style={{ padding: 24, marginTop: 20 }}>
          <h3 style={{ marginTop: 0, color: 'var(--wv-dark)' }}>Recent Customers</h3>
          {customers.length === 0 ? (
            <p style={{ color: 'var(--wv-gray)', fontSize: 13 }}>
              No customers yet. <Link to="/customers">Add one</Link>.
            </p>
          ) : (
            <table className="wv-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Name</th><th>Email</th><th>City</th><th>System Size</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {customers.slice(0, 8).map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link to={`/customers/${c.id}`} style={{ color: 'var(--wv-primary)', textDecoration: 'none', fontWeight: 600 }}>
                        {c.name}
                      </Link>
                    </td>
                    <td style={{ fontSize: 12 }}>{c.email}</td>
                    <td>{c.city || '—'}</td>
                    <td>{c.systemSizeKw ? `${c.systemSizeKw} kW` : '—'}</td>
                    <td>
                      <span className={c.status === 'active' ? 'badge-success' : 'badge-warning'} style={{ fontSize: 11 }}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

function KpiCard({ label, value, color }) {
  return (
    <div className="kpi-card kpi-tile" style={{ borderLeft: `3px solid ${color}` }}>
      <div style={{ fontSize: 12, color: 'var(--wv-gray)', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--wv-dark)' }}>{value}</div>
    </div>
  );
}

function QuickAction({ to, label, desc, color, icon }) {
  return (
    <Link to={to} className="qa-card">
      <div className="qa-icon" style={{ background: color + '20', color }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="qa-label">{label}</div>
        <div className="qa-desc">{desc}</div>
      </div>
      <svg className="qa-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </Link>
  );
}
