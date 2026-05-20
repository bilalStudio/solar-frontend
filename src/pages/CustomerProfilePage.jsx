import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ComposedChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import ProtectedRoute from '../components/ProtectedRoute';
import { customerAPI, analyticsAPI, reportAPI } from '../services/api';
import { DEMO_CUSTOMERS } from '../data/demoData';

/* ── demo data shared with AnalyticsPage ─────────────────────────────────── */
const DEMO_ROI = {
  hasData: true, totalActualKwh: 624.14, totalEstimatedKwh: 1910.99,
  totalVarianceKwh: -1286.85, variancePct: -66.9, performancePct: 32.7, dataPoints: 30,
};
const DEMO_DAILY = [
  { month:'1-Nov',  actual:24.96, estimated:78.90  },
  { month:'5-Nov',  actual:21.39, estimated:82.73  },
  { month:'10-Nov', actual:21.35, estimated:41.69  },
  { month:'15-Nov', actual:24.63, estimated:81.81  },
  { month:'20-Nov', actual:15.96, estimated:78.29  },
  { month:'25-Nov', actual:22.41, estimated:63.24  },
  { month:'30-Nov', actual:23.26, estimated:62.57  },
];

const DEMO_REPORTS = [
  { id: 1, title: 'November 2025 — Solar Performance Report', period: 'Nov 2025', generatedAt: '2025-12-01T10:30:00Z', status: 'emailed',    fileSize: '1.2 MB' },
  { id: 2, title: 'October 2025 — Solar Performance Report',  period: 'Oct 2025', generatedAt: '2025-11-02T09:15:00Z', status: 'downloaded', fileSize: '1.1 MB' },
];

const fmt1 = (v) => (v ?? 0).toFixed(1);
const fmt2 = (v) => (v ?? 0).toFixed(2);
const clr  = (v) => (v ?? 0) >= 0 ? '#54A877' : '#E65428';
const sign = (v) => (v ?? 0) >= 0 ? '+' : '';

function KPICard({ label, value, sub, subColor, icon, accent }) {
  return (
    <div className="kpi-card">
      <div className="kpi-icon" style={{ background: accent + '22', width: 36, height: 36, borderRadius: 9, marginBottom: 10 }}>
        <span style={{ fontSize: 17 }}>{icon}</span>
      </div>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value" style={{ fontSize: 20, marginBottom: 3 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: subColor || 'var(--wv-gray)', fontWeight: 500 }}>{sub}</div>}
    </div>
  );
}

const STATUS_MAP = {
  active:   { label: 'Active',   bg: '#e6f4ec', color: '#1a7a3c', border: '#b7dfc7' },
  pending:  { label: 'Pending',  bg: '#fef3cd', color: '#92400e', border: '#fcd34d' },
  inactive: { label: 'Inactive', bg: '#f3f4f6', color: '#6b7280', border: '#d1d5db' },
};
const REPORT_STATUS = {
  generated:     { label: 'Generated',   bg: '#e6eef8', color: '#0C447C' },
  downloaded:    { label: 'Downloaded',  bg: '#e6f4ec', color: '#1a7a3c' },
  emailed:       { label: 'Emailed',     bg: '#f0fdf4', color: '#166534' },
  'post-cleaning': { label: 'Post-Cleaning', bg: '#ecfdf5', color: '#065f46' },
};

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function CustomerProfilePage() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [customer, setCustomer]   = useState(null);
  const [roi, setROI]             = useState(null);
  const [reports, setReports]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res  = await customerAPI.getAll();
        const list = res.data?.data ?? res.data ?? [];
        const found = list.find(c => String(c.id) === String(id));
        if (found) {
          setCustomer(found);
        } else throw new Error('not found');
      } catch {
        const found = DEMO_CUSTOMERS.find(c => String(c.id) === String(id));
        setCustomer(found ?? DEMO_CUSTOMERS[0]);
        setIsDemoMode(true);
      }

      try {
        const roiRes = await analyticsAPI.getROI(id);
        setROI(roiRes.data?.data ?? roiRes.data);
      } catch {
        setROI(DEMO_ROI);
      }

      try {
        const repRes = await reportAPI.getHistory(id);
        const list   = repRes.data?.data ?? repRes.data ?? [];
        setReports(Array.isArray(list) ? list : DEMO_REPORTS);
      } catch {
        setReports(DEMO_REPORTS);
      }

      setLoading(false);
    };
    load();
  }, [id]);

  const tabs = [
    { key: 'overview',  label: '👤 Overview' },
    { key: 'analytics', label: '📈 Analytics' },
    { key: 'reports',   label: '📄 Reports' },
    { key: 'uploads',   label: '📂 Upload History' },
  ];

  if (loading) {
    return (
      <ProtectedRoute title="Customer Profile" subtitle="Loading…">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[200, 140, 300].map((h, i) => (
            <div key={i} style={{
              height: h, borderRadius: 12,
              background: 'linear-gradient(90deg,#f0f3f8 25%,#e8edf3 50%,#f0f3f8 75%)',
              backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite',
            }} />
          ))}
        </div>
        <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      </ProtectedRoute>
    );
  }

  if (!customer) return null;

  const statusStyle = STATUS_MAP[customer.status] ?? STATUS_MAP.inactive;
  const initials    = customer.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <ProtectedRoute
      title="Customer Profile"
      subtitle="Centralized account hub"
      actions={
        <button
          onClick={() => navigate(-1)}
          className="btn-wv-outline"
          style={{ padding: '6px 14px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
        >
          ← Back
        </button>
      }
    >
      {isDemoMode && (
        <div style={{
          background: '#FAEEDA', border: '1px solid #FAC775', borderRadius: 10,
          padding: '10px 16px', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#633806',
        }}>
          ⚠️ <span><strong>Demo Mode:</strong> Showing sample data for this customer profile.</span>
        </div>
      )}

      {/* ── Profile header ── */}
      <div className="wv-card" style={{ marginBottom: 20 }}>
        <div className="wv-card-body" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, var(--wv-primary), var(--wv-green))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 800, color: '#fff',
            }}>
              {initials}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, margin: 0, color: 'var(--wv-dark)' }}>
                  {customer.name}
                </h2>
                <span style={{
                  background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}`,
                  borderRadius: 99, padding: '3px 12px', fontSize: 12, fontWeight: 600,
                }}>
                  {statusStyle.label}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 13, color: 'var(--wv-gray)' }}>
                {customer.email && <span>✉️ {customer.email}</span>}
                {customer.phone && <span>📞 {customer.phone}</span>}
                {customer.city  && <span>📍 {customer.city}</span>}
                {customer.systemSizeKw && <span>⚡ {customer.systemSizeKw} kW system</span>}
                {customer.installationDate && <span>📅 Installed {fmtDate(customer.installationDate)}</span>}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <a href={`/analytics?customer=${customer.id}`} className="btn-wv-outline" style={{ fontSize: 12, padding: '7px 14px', textDecoration: 'none' }}>
                📈 View Analytics
              </a>
              <a href={`/reports?customer=${customer.id}`} className="btn-wv-outline" style={{ fontSize: 12, padding: '7px 14px', textDecoration: 'none' }}>
                📄 Reports
              </a>
              <a href={`/upload?customer=${customer.id}`} className="btn-wv-primary" style={{ fontSize: 12, padding: '7px 14px', textDecoration: 'none' }}>
                📂 Upload Data
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tab navigation ── */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 16,
        borderBottom: '1px solid #e8edf3',
      }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '9px 18px', border: 'none', background: 'transparent',
              borderBottom: activeTab === tab.key ? '2px solid var(--wv-primary)' : '2px solid transparent',
              color: activeTab === tab.key ? 'var(--wv-primary)' : 'var(--wv-gray)',
              fontWeight: activeTab === tab.key ? 600 : 400,
              fontSize: 13.5, cursor: 'pointer', transition: 'all 0.15s', marginBottom: -1,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB: Overview ── */}
      {activeTab === 'overview' && (
        <div className="row g-3">
          <div className="col-md-6">
            <div className="wv-card h-100">
              <div className="wv-card-header"><h3 className="wv-card-title">Customer Details</h3></div>
              <div className="wv-card-body">
                {[
                  { label: 'Full Name',       value: customer.name },
                  { label: 'Email',           value: customer.email || '—' },
                  { label: 'Phone',           value: customer.phone || '—' },
                  { label: 'City',            value: customer.city  || '—' },
                  { label: 'System Size',     value: customer.systemSizeKw ? `${customer.systemSizeKw} kW` : '—' },
                  { label: 'Install Date',    value: fmtDate(customer.installationDate) },
                  { label: 'Account Status',  value: statusStyle.label },
                ].map((row, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 0', borderBottom: '1px solid #f0f3f8', fontSize: 13,
                  }}>
                    <span style={{ color: 'var(--wv-gray)', fontWeight: 500 }}>{row.label}</span>
                    <span style={{ color: 'var(--wv-dark)', fontWeight: 600, textAlign: 'right' }}>{row.value}</span>
                  </div>
                ))}
                {customer.notes && (
                  <div style={{ marginTop: 14, padding: '10px 12px', background: '#f8fafb', borderRadius: 8, fontSize: 13, color: 'var(--wv-gray)' }}>
                    <span style={{ fontWeight: 600, color: 'var(--wv-dark)' }}>Notes: </span>{customer.notes}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="wv-card">
              <div className="wv-card-header"><h3 className="wv-card-title">Performance Snapshot</h3></div>
              <div className="wv-card-body">
                <div className="row g-2">
                  <div className="col-6">
                    <KPICard label="Actual Production" value={fmt2(roi?.totalActualKwh ?? DEMO_ROI.totalActualKwh) + ' kWh'} sub="Total measured" icon="⚡" accent="#25A1AB" />
                  </div>
                  <div className="col-6">
                    <KPICard label="PVWatts Estimate" value={fmt2(roi?.totalEstimatedKwh ?? DEMO_ROI.totalEstimatedKwh) + ' kWh'} sub="Expected" icon="☀️" accent="#345EA6" />
                  </div>
                  <div className="col-6">
                    <KPICard
                      label="Variance"
                      value={sign(roi?.totalVarianceKwh ?? DEMO_ROI.totalVarianceKwh) + fmt2(roi?.totalVarianceKwh ?? DEMO_ROI.totalVarianceKwh) + ' kWh'}
                      sub={sign(roi?.variancePct ?? DEMO_ROI.variancePct) + fmt1(roi?.variancePct ?? DEMO_ROI.variancePct) + '%'}
                      subColor={clr(roi?.variancePct ?? DEMO_ROI.variancePct)}
                      icon="📉" accent="#E65428"
                    />
                  </div>
                  <div className="col-6">
                    <KPICard
                      label="Performance"
                      value={fmt1(roi?.performancePct ?? DEMO_ROI.performancePct) + '%'}
                      sub="of estimate achieved"
                      subColor={clr((roi?.performancePct ?? DEMO_ROI.performancePct) - 100)}
                      icon="🎯" accent="#54A877"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: Analytics ── */}
      {activeTab === 'analytics' && (
        <div>
          <div className="row g-3 mb-4">
            <div className="col-6 col-md-3">
              <KPICard label="Actual Production" value={fmt2(roi?.totalActualKwh ?? DEMO_ROI.totalActualKwh) + ' kWh'} sub="Measured" icon="⚡" accent="#25A1AB" />
            </div>
            <div className="col-6 col-md-3">
              <KPICard label="PVWatts Estimate" value={fmt2(roi?.totalEstimatedKwh ?? DEMO_ROI.totalEstimatedKwh) + ' kWh'} sub="Expected" icon="☀️" accent="#345EA6" />
            </div>
            <div className="col-6 col-md-3">
              <KPICard
                label="Variance"
                value={sign(roi?.totalVarianceKwh ?? DEMO_ROI.totalVarianceKwh) + fmt2(roi?.totalVarianceKwh ?? DEMO_ROI.totalVarianceKwh) + ' kWh'}
                sub={sign(roi?.variancePct ?? DEMO_ROI.variancePct) + fmt1(roi?.variancePct ?? DEMO_ROI.variancePct) + '%'}
                subColor={clr(roi?.variancePct ?? DEMO_ROI.variancePct)}
                icon="📉" accent="#E65428"
              />
            </div>
            <div className="col-6 col-md-3">
              <KPICard
                label="Performance"
                value={fmt1(roi?.performancePct ?? DEMO_ROI.performancePct) + '%'}
                sub="of estimate achieved"
                subColor={clr((roi?.performancePct ?? DEMO_ROI.performancePct) - 100)}
                icon="🎯" accent="#54A877"
              />
            </div>
          </div>

          <div className="wv-card mb-3">
            <div className="wv-card-header">
              <h3 className="wv-card-title">Actual vs Estimated Production</h3>
              <span className="badge-info" style={{ fontSize: 11 }}>Sample data</span>
            </div>
            <div className="wv-card-body">
              <ResponsiveContainer width="100%" height={260}>
                <ComposedChart data={DEMO_DAILY} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="profActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#25A1AB" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#25A1AB" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="profEst" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#345EA6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#345EA6" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f3f8" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#525252' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#525252' }} unit=" kWh" width={68} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e8edf3', fontSize: 12 }}
                    formatter={(v, n) => [`${v} kWh`, n === 'estimated' ? 'PVWatts Estimated' : 'Actual']}
                  />
                  <Legend formatter={v => v === 'estimated' ? 'PVWatts Estimated' : 'Actual Produced'} />
                  <Area type="monotone" dataKey="estimated" stroke="#345EA6" strokeWidth={2} strokeDasharray="5 3" fill="url(#profEst)" />
                  <Area type="monotone" dataKey="actual"    stroke="#25A1AB" strokeWidth={2.5} fill="url(#profActual)" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <a href={`/analytics`} className="btn-wv-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              📈 Open Full Analytics
            </a>
          </div>
        </div>
      )}

      {/* ── TAB: Reports ── */}
      {activeTab === 'reports' && (
        <div className="wv-card">
          <div className="wv-card-header">
            <h3 className="wv-card-title">Report History</h3>
            <a href="/reports" className="btn-wv-outline" style={{ fontSize: 12, padding: '6px 14px', textDecoration: 'none' }}>
              + Generate Report
            </a>
          </div>
          {reports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--wv-gray)', fontSize: 13 }}>
              No reports yet. Generate the first report from the Reports page.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="wv-table">
                <thead>
                  <tr><th>Report</th><th>Period</th><th>Generated</th><th>Size</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {reports.map(r => {
                    const s = REPORT_STATUS[r.status] ?? REPORT_STATUS.generated;
                    return (
                      <tr key={r.id}>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{r.title}</div>
                          {r.reportType === 'post-cleaning' && (
                            <span style={{ fontSize: 11, background: '#ecfdf5', color: '#065f46', borderRadius: 99, padding: '1px 8px', marginTop: 3, display: 'inline-block' }}>
                              🧹 Post-Cleaning
                            </span>
                          )}
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--wv-gray)' }}>{r.period}</td>
                        <td style={{ fontSize: 12, color: 'var(--wv-gray)' }}>{fmtDate(r.generatedAt)}</td>
                        <td style={{ fontSize: 12, color: 'var(--wv-gray)' }}>{r.fileSize ?? '—'}</td>
                        <td>
                          <span style={{ background: s.bg, color: s.color, borderRadius: 99, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>
                            {s.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: Upload History ── */}
      {activeTab === 'uploads' && (
        <div className="wv-card">
          <div className="wv-card-header">
            <h3 className="wv-card-title">Upload History</h3>
            <a href="/upload" className="btn-wv-primary" style={{ fontSize: 12, padding: '6px 14px', textDecoration: 'none' }}>
              + Upload File
            </a>
          </div>
          <div style={{ textAlign: 'center', padding: '52px 24px' }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>📂</div>
            <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: 8 }}>No Upload History</h3>
            <p style={{ color: 'var(--wv-gray)', maxWidth: 360, margin: '0 auto 20px', fontSize: 13, lineHeight: 1.6 }}>
              Upload history will appear here once files have been processed for this customer.
            </p>
            <a href="/upload" className="btn-wv-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              📂 Upload Data File
            </a>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

    </ProtectedRoute>
  );
}
