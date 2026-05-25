import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import { customerAPI, analyticsAPI } from '../services/api';
import { useToast } from '../components/ToastContext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AnalyticsPage() {
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [roi, setRoi] = useState(null);
  const [variance, setVariance] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    customerAPI.getAll().then((r) => {
      setCustomers(r.data?.data || []);
    }).catch(() => {});
  }, []);

  // Auto-load if customerId is passed in URL e.g. /analytics?customerId=3
  useEffect(() => {
    const urlCustomerId = searchParams.get('customerId');
    if (urlCustomerId) {
      setCustomerId(urlCustomerId);
    }
  }, [searchParams]);

  // Auto-run analytics when customerId is set from URL
  useEffect(() => {
    if (customerId) {
      runAnalytics(customerId);
    }
  }, [customerId]);

  const runAnalytics = async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const [roiRes, varRes] = await Promise.all([
        analyticsAPI.getROI(id),
        analyticsAPI.getVariance(id),
      ]);
      setRoi(roiRes.data?.data || null);
      setVariance(varRes.data?.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load analytics', 'Analytics Error');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerChange = (e) => {
    setCustomerId(e.target.value);
    setRoi(null);
    setVariance([]);
  };

  const handleLoad = () => {
    if (!customerId) { toast.warning('Please select a customer first.'); return; }
    runAnalytics(customerId);
  };

  const selectedCustomer = customers.find((c) => String(c.id) === String(customerId));

  return (
    <ProtectedRoute title="Analytics" subtitle="Performance, variance, and ROI breakdown">
      <div style={{ maxWidth: 1200 }}>
        <div className="kpi-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 240 }}>
              <label className="wv-label">Customer</label>
              <select className="wv-input" value={customerId} onChange={handleCustomerChange}>
                <option value="">— Select customer —</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <button className="btn-wv-primary" onClick={handleLoad} disabled={loading || !customerId}>
              {loading ? 'Loading...' : 'Load Analytics'}
            </button>
          </div>
          {selectedCustomer && (
            <div style={{ marginTop: 12, padding: '8px 12px', background: '#f8fafc', borderRadius: 8, fontSize: 12, color: 'var(--wv-gray)' }}>
              Showing analytics for <strong style={{ color: 'var(--wv-dark)' }}>{selectedCustomer.name}</strong>
              {selectedCustomer.systemSizeKw && ` · ${selectedCustomer.systemSizeKw} kW system`}
              {selectedCustomer.city && ` · ${selectedCustomer.city}`}
            </div>
          )}
        </div>

        {loading && (
          <div className="kpi-card" style={{ padding: 40, textAlign: 'center', marginTop: 20 }}>
            <p style={{ color: 'var(--wv-gray)' }}>Loading analytics...</p>
          </div>
        )}

        {!loading && roi && (
          <>
            <div className="analytics-kpi-grid" style={{ marginTop: 20 }}>
              <StatCard label="Total Actual"     value={`${roi.totalActualKwh || 0} kWh`}     color="#25A1AB" />
              <StatCard label="Total Estimated"  value={`${roi.totalEstimatedKwh || 0} kWh`}  color="#345EA6" />
              <StatCard label="Variance"         value={`${roi.totalVarianceKwh || 0} kWh`}   color="#7c3aed" />
              <StatCard label="Performance"      value={`${roi.performancePct || 0}%`}         color="#54A877" />
              <StatCard label="Actual Savings"   value={`$${roi.actualSavingsPKR || roi.actualSavingsUSD || 0}`} color="#54A877" />
            </div>

            {variance.length > 0 ? (
              <>
                <div className="kpi-card" style={{ padding: 24, marginTop: 20 }}>
                  <h3 style={{ marginTop: 0, color: 'var(--wv-dark)' }}>Monthly Production: Actual vs Estimated</h3>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={variance}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e8edf3" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip /><Legend />
                      <Bar dataKey="estimatedKwh" fill="#345EA6" name="Estimated kWh" />
                      <Bar dataKey="actualKwh"    fill="#25A1AB" name="Actual kWh" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="kpi-card" style={{ padding: 24, marginTop: 20 }}>
                  <h3 style={{ marginTop: 0, color: 'var(--wv-dark)' }}>Variance % Over Time</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={variance}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e8edf3" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip /><Legend />
                      <Line type="monotone" dataKey="variancePct" stroke="#7c3aed" strokeWidth={2} name="Variance %" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : (
              <div className="kpi-card" style={{ padding: 24, marginTop: 20 }}>
                <p style={{ color: 'var(--wv-gray)', fontSize: 13 }}>
                  {roi.message || 'No monthly data available. Upload solar production data for this customer first.'}
                </p>
              </div>
            )}
          </>
        )}

        {!loading && !roi && customerId && (
          <div className="kpi-card" style={{ padding: 40, textAlign: 'center', marginTop: 20 }}>
            <p style={{ color: 'var(--wv-gray)', fontSize: 13 }}>No analytics data yet. Upload solar data for this customer first.</p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ background: 'var(--wv-card, #fff)', padding: 16, borderRadius: 10, borderLeft: `3px solid ${color}`, minHeight: 92, display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div style={{ fontSize: 11, color: 'var(--wv-gray)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--wv-dark)' }}>{value}</div>
    </div>
  );
}
