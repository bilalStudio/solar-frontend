import { useState, useEffect } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import { customerAPI, analyticsAPI } from '../services/api';
import { useToast } from '../components/ToastContext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AnalyticsPage() {
  const toast = useToast();
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [roi, setRoi] = useState(null);
  const [variance, setVariance] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    customerAPI.getAll().then((r) => setCustomers(r.data?.data || [])).catch(() => {});
  }, []);

  const loadAnalytics = async () => {
    if (!customerId) { toast.warning('Please select a customer first.'); return; }
    setLoading(true);
    try {
      const [roiRes, varRes] = await Promise.all([analyticsAPI.getROI(customerId), analyticsAPI.getVariance(customerId)]);
      setRoi(roiRes.data?.data || null);
      setVariance(varRes.data?.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load analytics', 'Analytics Error');
    } finally { setLoading(false); }
  };

  return (
    <ProtectedRoute title="Analytics" subtitle="Performance, variance, and ROI breakdown">
      <div style={{ maxWidth: 1200 }}>
        <div className="kpi-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 240 }}>
              <label className="wv-label">Customer</label>
              <select className="wv-input" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                <option value="">— Select customer —</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <button className="btn-wv-primary" onClick={loadAnalytics} disabled={loading}>
              {loading ? 'Loading...' : 'Load Analytics'}
            </button>
          </div>
        </div>
        {roi && (
          <>
            <div className="analytics-kpi-grid" style={{ marginTop: 20 }}>
              <StatCard label="Total Actual" value={`${roi.totalActualKwh || 0} kWh`} color="#25A1AB" />
              <StatCard label="Total Estimated" value={`${roi.totalEstimatedKwh || 0} kWh`} color="#345EA6" />
              <StatCard label="Variance" value={`${roi.totalVarianceKwh || 0} kWh`} color="#7c3aed" />
              <StatCard label="Performance" value={`${roi.performancePct || 0}%`} color="#54A877" />
              <StatCard label="Actual Savings" value={`USD ${roi.actualSavingsPKR || 0}`} color="#54A877" />
            </div>
            {variance.length > 0 && (
              <>
                <div className="kpi-card" style={{ padding: 24, marginTop: 20 }}>
                  <h3 style={{ marginTop: 0, color: 'var(--wv-dark)' }}>Monthly Production: Actual vs Estimated</h3>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={variance}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e8edf3" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} />
                      <Tooltip /><Legend />
                      <Bar dataKey="estimatedKwh" fill="#345EA6" name="Estimated kWh" />
                      <Bar dataKey="actualKwh" fill="#25A1AB" name="Actual kWh" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="kpi-card" style={{ padding: 24, marginTop: 20 }}>
                  <h3 style={{ marginTop: 0, color: 'var(--wv-dark)' }}>Variance % Over Time</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={variance}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e8edf3" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} />
                      <Tooltip /><Legend />
                      <Line type="monotone" dataKey="variancePct" stroke="#7c3aed" strokeWidth={2} name="Variance %" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
            {(!variance.length || roi.message) && (
              <div className="kpi-card" style={{ padding: 24, marginTop: 20 }}>
                <p style={{ color: 'var(--wv-gray)' }}>{roi.message || 'No data available. Upload solar production data first.'}</p>
              </div>
            )}
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
function StatCard({ label, value, color }) {
  return <div className="kpi-card" style={{ padding: 16, borderLeft: `3px solid ${color}`, minHeight: 92, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}><div style={{ fontSize: 11, color: 'var(--wv-gray)', marginBottom: 4 }}>{label}</div><div style={{ fontSize: 18, fontWeight: 700, color: 'var(--wv-dark)' }}>{value}</div></div>;
}
