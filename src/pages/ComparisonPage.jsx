import { useState, useEffect } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import { customerAPI, analyticsAPI, reportAPI } from '../services/api';
import { useToast } from '../components/ToastContext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

const COMPARISON_TYPES = [
  { id: 'estimated_vs_actual',   label: 'Estimated vs Actual' },
  { id: 'utility_vs_system',     label: 'Utility vs System' },
  { id: 'before_after_cleaning', label: 'Before vs After Cleaning' },
  { id: 'loss_calculation',      label: 'Loss Calculation' },
];

const triggerDownload = (blobData, filename) => {
  const url = window.URL.createObjectURL(new Blob([blobData], { type: 'application/pdf' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

export default function ComparisonPage() {
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [type, setType] = useState('estimated_vs_actual');
  const toast = useToast();
  const showToast = (message, t = 'success') => t === 'success' ? toast.success(message) : toast.error(message);

  useEffect(() => {
    customerAPI.getAll().then((r) => setCustomers(r.data?.data || [])).catch(() => {});
  }, []);

  return (
    <ProtectedRoute title="Comparison" subtitle="Unified production analysis & performance evaluation">
      <div style={{ maxWidth: 1200 }}>
        <div className="kpi-card" style={{ padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
            <div>
              <label className="wv-label">Customer</label>
              <select className="wv-input" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                <option value="">— Select customer —</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="wv-label">Comparison Type</label>
              <div className="cmp-type-tabs">
                {COMPARISON_TYPES.map((t) => (
                  <button key={t.id} type="button" className={`cmp-type-tab ${type === t.id ? 'active' : ''}`} onClick={() => setType(t.id)}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          {!customerId ? (
            <div className="kpi-card" style={{ padding: 40, textAlign: 'center' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p style={{ color: 'var(--wv-gray)', marginTop: 12, fontSize: 14 }}>Select a customer to begin analysis</p>
            </div>
          ) : (
            <>
              {type === 'estimated_vs_actual'   && <EstimatedVsActualPanel customerId={customerId} />}
              {type === 'utility_vs_system'     && <UtilityVsSystemPanel customerId={customerId} showToast={showToast} />}
              {type === 'before_after_cleaning' && <CleaningPanel customerId={customerId} showToast={showToast} />}
              {type === 'loss_calculation'      && <LossPanel customerId={customerId} showToast={showToast} />}
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

function EstimatedVsActualPanel({ customerId }) {
  const [data, setData] = useState([]);
  const [roi, setRoi] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    setLoading(true); setError('');
    Promise.all([analyticsAPI.getVariance(customerId), analyticsAPI.getROI(customerId)])
      .then(([v, r]) => { setData(v.data?.data || []); setRoi(r.data?.data || null); })
      .catch((e) => setError(e.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [customerId]);
  if (loading) return <div className="kpi-card" style={{ padding: 24 }}>Loading...</div>;
  if (error) return <div className="alert-wv error">{error}</div>;
  return (
    <>
      {roi && (
        <div className="analytics-kpi-grid">
          <StatCard label="Total Actual" value={`${roi.totalActualKwh} kWh`} color="#25A1AB" />
          <StatCard label="Total Estimated" value={`${roi.totalEstimatedKwh} kWh`} color="#345EA6" />
          <StatCard label="Variance" value={`${roi.totalVarianceKwh} kWh`} color="#7c3aed" />
          <StatCard label="Performance" value={`${roi.performancePct}%`} color="#54A877" />
          <StatCard label="Actual Savings" value={`PKR ${roi.actualSavingsPKR}`} color="#54A877" />
        </div>
      )}
      <div className="kpi-card" style={{ padding: 24, marginTop: 20 }}>
        <h3 style={{ marginTop: 0, color: 'var(--wv-dark)' }}>Monthly Production: Actual vs Estimated</h3>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8edf3" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip /><Legend />
              <Bar dataKey="estimatedKwh" fill="#345EA6" name="Estimated kWh" />
              <Bar dataKey="actualKwh" fill="#25A1AB" name="Actual kWh" />
            </BarChart>
          </ResponsiveContainer>
        ) : <p style={{ color: 'var(--wv-gray)' }}>No data yet. Upload solar data for this customer.</p>}
      </div>
    </>
  );
}

function UtilityVsSystemPanel({ customerId, showToast }) {
  const [comparison, setComparison] = useState(null);
  const [validation, setValidation] = useState(null);
  const [chart, setChart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  useEffect(() => {
    setLoading(true); setError('');
    Promise.all([analyticsAPI.compareUtilityVsSystem(customerId), analyticsAPI.validateUtility(customerId), analyticsAPI.getUtilityChart(customerId)])
      .then(([c, v, ch]) => { setComparison(c.data?.data || null); setValidation(v.data?.data || null); setChart(ch.data?.data || []); })
      .catch((e) => setError(e.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [customerId]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const genRes = await reportAPI.generateUtility(customerId);
      const reportId = genRes.data?.data?.id;
      if (reportId) {
        const dlRes = await reportAPI.download(reportId);
        triggerDownload(dlRes.data, `utility-report-${customerId}.pdf`);
        showToast('Report downloaded successfully!');
      }
    } catch (e) { showToast('Failed: ' + (e.response?.data?.message || e.message), 'error'); }
    finally { setGenerating(false); }
  };

  if (loading) return <div className="kpi-card" style={{ padding: 24 }}>Loading...</div>;
  if (error) return <div className="alert-wv error">{error}</div>;
  return (
    <>
      {validation && (
        <div className="kpi-card" style={{ padding: 24 }}>
          <div style={{ padding: 14, borderRadius: 8, background: validation.isExporting ? 'rgba(84,168,119,0.1)' : 'rgba(245,158,11,0.1)', color: validation.isExporting ? '#1f8a4f' : '#a45a08', fontWeight: 600, fontSize: 14 }}>
            {validation.isExporting ? '✓ Export Confirmed' : '⚠ No Export Detected'} — {validation.message}
          </div>
          <div className="analytics-kpi-grid" style={{ marginTop: 16 }}>
            <StatCard label="Total Readings" value={validation.totalReadings} />
            <StatCard label="Export Readings" value={validation.exportReadings} color="#54A877" />
            <StatCard label="Export Rate" value={`${validation.exportPercentage}%`} />
          </div>
        </div>
      )}
      {comparison && (
        <div className="kpi-card" style={{ padding: 24, marginTop: 20 }}>
          <h3 style={{ marginTop: 0, color: 'var(--wv-dark)' }}>Utility vs System Comparison</h3>
          <div className="analytics-kpi-grid">
            <StatCard label="System Production" value={`${comparison.systemProductionKwh} kWh`} color="#25A1AB" />
            <StatCard label="Utility Export" value={`${comparison.utilityExportKwh} kWh`} color="#54A877" />
            <StatCard label="Utility Import" value={`${comparison.utilityImportKwh} kWh`} />
            <StatCard label="Alignment" value={`${comparison.alignmentPct}%`} />
          </div>
          <button className="btn-wv-primary" onClick={handleGenerate} style={{ marginTop: 18 }} disabled={generating}>
            {generating ? 'Generating...' : '⬇ Generate & Download Report'}
          </button>
        </div>
      )}
      {chart.length > 0 && (
        <div className="kpi-card" style={{ padding: 24, marginTop: 20 }}>
          <h3 style={{ marginTop: 0, color: 'var(--wv-dark)' }}>Utility Readings Timeline</h3>
          <p style={{ color: 'var(--wv-gray)', fontSize: 13 }}>Negative values = solar export to grid.</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chart.slice(0, 200)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8edf3" />
              <XAxis dataKey="timestamp" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip /><Legend />
              <Line type="monotone" dataKey="kwh" stroke="#25A1AB" strokeWidth={2} dot={false} name="kWh" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </>
  );
}

function CleaningPanel({ customerId, showToast }) {
  const [form, setForm] = useState({ cleaningDate: '', windowDays: 14, notes: '' });
  const [history, setHistory] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  useEffect(() => {
    analyticsAPI.getCleaningHistory(customerId).then((r) => setHistory(r.data?.data || [])).catch(() => setHistory([]));
  }, [customerId, result]);

  const handleAnalyze = async (e) => {
    e.preventDefault(); setError(''); setResult(null);
    if (!form.cleaningDate) { setError('Please pick a cleaning date.'); return; }
    setLoading(true);
    try {
      const res = await analyticsAPI.analyzeCleaning({ customerId: parseInt(customerId), cleaningDate: form.cleaningDate, windowDays: parseInt(form.windowDays), notes: form.notes });
      setResult(res.data?.data);
    } catch (err) { setError(err.response?.data?.message || 'Analysis failed'); }
    finally { setLoading(false); }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const genRes = await reportAPI.generateCleaning({ customerId: parseInt(customerId), cleaningDate: form.cleaningDate, windowDays: parseInt(form.windowDays), notes: form.notes });
      const reportId = genRes.data?.data?.id;
      if (reportId) {
        const dlRes = await reportAPI.download(reportId);
        triggerDownload(dlRes.data, `cleaning-report-${form.cleaningDate}.pdf`);
        showToast('Report downloaded successfully!');
      }
    } catch (e) { showToast('Failed: ' + (e.response?.data?.message || e.message), 'error'); }
    finally { setGenerating(false); }
  };

  return (
    <>
      <div className="kpi-card" style={{ padding: 24 }}>
        <h3 style={{ marginTop: 0, color: 'var(--wv-dark)' }}>Analyze Cleaning Impact</h3>
        <p style={{ color: 'var(--wv-gray)', fontSize: 13, marginBottom: 18 }}>Compare production averages before and after a cleaning event.</p>
        {error && <div className="alert-wv error">{error}</div>}
        <form onSubmit={handleAnalyze}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            <div>
              <label className="wv-label">Cleaning date *</label>
              <input type="date" className="wv-input" value={form.cleaningDate} onChange={(e) => setForm({ ...form, cleaningDate: e.target.value })} />
            </div>
            <div>
              <label className="wv-label">Window (days)</label>
              <input type="number" min="3" max="60" className="wv-input" value={form.windowDays} onChange={(e) => setForm({ ...form, windowDays: e.target.value })} />
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <label className="wv-label">Notes (optional)</label>
            <textarea rows="2" className="wv-input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <button type="submit" className="btn-wv-primary" style={{ marginTop: 16 }} disabled={loading}>
            {loading ? 'Analyzing...' : 'Run Analysis'}
          </button>
        </form>
      </div>
      {result && (
        <div className="kpi-card" style={{ padding: 24, marginTop: 20 }}>
          <div style={{ padding: 14, borderRadius: 8, background: result.wasValuable ? 'rgba(84,168,119,0.1)' : 'rgba(245,158,11,0.1)', color: result.wasValuable ? '#1f8a4f' : '#a45a08', fontWeight: 600, fontSize: 14, marginBottom: 16 }}>
            {result.wasValuable ? `✓ Cleaning provided clear value (+${result.improvementPct}% improvement)` : `⚠ Cleaning showed minimal impact (${result.improvementPct}%)`}
          </div>
          <div className="analytics-kpi-grid">
            <StatCard label="Pre-Cleaning Avg" value={`${result.preAvgKwh} kWh/day`} />
            <StatCard label="Post-Cleaning Avg" value={`${result.postAvgKwh} kWh/day`} />
            <StatCard label="Daily Gain" value={`${result.dailyKwhGain} kWh`} color="#54A877" />
            <StatCard label="Improvement" value={`${result.improvementPct}%`} color="#54A877" />
            <StatCard label="Total Gain" value={`${result.totalKwhGain} kWh`} />
          </div>
          <div style={{ marginTop: 20 }}>
            <h4 style={{ fontSize: 14, color: 'var(--wv-dark)' }}>Customer Letter</h4>
            <pre style={{ whiteSpace: 'pre-wrap', background: '#f8fafc', padding: 14, borderRadius: 8, fontSize: 12, fontFamily: 'inherit', color: 'var(--wv-dark)' }}>{result.customerLetter}</pre>
          </div>
          <button className="btn-wv-primary" style={{ marginTop: 14 }} onClick={handleGenerate} disabled={generating}>
            {generating ? 'Generating...' : '⬇ Generate & Download PDF'}
          </button>
        </div>
      )}
      {history.length > 0 && (
        <div className="kpi-card" style={{ padding: 24, marginTop: 20 }}>
          <h3 style={{ marginTop: 0, color: 'var(--wv-dark)' }}>Cleaning History</h3>
          <table className="wv-table" style={{ width: '100%' }}>
            <thead><tr><th>Date</th><th>Pre Avg</th><th>Post Avg</th><th>Gain</th><th>Improvement</th><th>Notes</th></tr></thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id}>
                  <td>{h.cleaningDate}</td><td>{h.preAvgKwh} kWh</td><td>{h.postAvgKwh} kWh</td>
                  <td>{h.kwhGain} kWh</td><td>{h.improvementPct}%</td>
                  <td style={{ fontSize: 12, color: 'var(--wv-gray)' }}>{h.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function LossPanel({ customerId, showToast }) {
  const [form, setForm] = useState({ startDate: '', endDate: '', electricityRate: 40 });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);

  const handleCalculate = async (e) => {
    e.preventDefault(); setError(''); setResult(null);
    if (!form.startDate || !form.endDate) { setError('Please set both dates.'); return; }
    setLoading(true);
    try {
      const res = await analyticsAPI.calculateLoss({ customerId: parseInt(customerId), startDate: form.startDate, endDate: form.endDate, electricityRate: parseFloat(form.electricityRate) });
      setResult(res.data?.data);
    } catch (err) { setError(err.response?.data?.message || 'Calculation failed'); }
    finally { setLoading(false); }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const genRes = await reportAPI.generateLoss({ customerId: parseInt(customerId), startDate: form.startDate, endDate: form.endDate, electricityRate: parseFloat(form.electricityRate) });
      const reportId = genRes.data?.data?.id;
      if (reportId) {
        const dlRes = await reportAPI.download(reportId);
        triggerDownload(dlRes.data, `loss-report-${form.startDate}.pdf`);
        showToast('Report downloaded successfully!');
      }
    } catch (e) { showToast('Failed: ' + (e.response?.data?.message || e.message), 'error'); }
    finally { setGenerating(false); }
  };

  return (
    <>
      <div className="kpi-card" style={{ padding: 24 }}>
        <h3 style={{ marginTop: 0, color: 'var(--wv-dark)' }}>Calculate System Loss</h3>
        <p style={{ color: 'var(--wv-gray)', fontSize: 13, marginBottom: 18 }}>Enter a downtime period to compare estimated vs actual production.</p>
        {error && <div className="alert-wv error">{error}</div>}
        <form onSubmit={handleCalculate}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            <div>
              <label className="wv-label">Start date *</label>
              <input type="date" className="wv-input" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div>
              <label className="wv-label">End date *</label>
              <input type="date" className="wv-input" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </div>
            <div>
              <label className="wv-label">Electricity rate (PKR/kWh)</label>
              <input type="number" step="0.1" className="wv-input" value={form.electricityRate} onChange={(e) => setForm({ ...form, electricityRate: e.target.value })} />
            </div>
          </div>
          <button type="submit" className="btn-wv-primary" style={{ marginTop: 16 }} disabled={loading}>
            {loading ? 'Calculating...' : 'Calculate Loss'}
          </button>
        </form>
      </div>
      {result && (
        <div className="kpi-card" style={{ padding: 24, marginTop: 20 }}>
          <h3 style={{ marginTop: 0, color: 'var(--wv-dark)' }}>Loss Analysis Result</h3>
          <div className="analytics-kpi-grid">
            <StatCard label="Estimated Production" value={`${result.estimatedProductionKwh} kWh`} />
            <StatCard label="Actual Production" value={`${result.actualProductionKwh} kWh`} />
            <StatCard label="kWh Loss" value={`${result.kwhLoss} kWh`} color="#dc2626" />
            <StatCard label="Cost Impact" value={`PKR ${result.estimatedCostImpactPKR}`} color="#dc2626" />
            <StatCard label="Performance" value={`${result.performancePct}%`} />
          </div>
          <div style={{ marginTop: 20 }}>
            <h4 style={{ fontSize: 14, color: 'var(--wv-dark)' }}>Customer Summary</h4>
            <pre style={{ whiteSpace: 'pre-wrap', background: '#f8fafc', padding: 14, borderRadius: 8, fontSize: 12, fontFamily: 'inherit', color: 'var(--wv-dark)' }}>{result.customerSummary}</pre>
          </div>
          <button className="btn-wv-primary" style={{ marginTop: 14 }} onClick={handleGenerate} disabled={generating}>
            {generating ? 'Generating...' : '⬇ Generate & Download PDF'}
          </button>
        </div>
      )}
    </>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ background: '#f8fafc', padding: 14, borderRadius: 8, borderLeft: `3px solid ${color || 'var(--wv-primary)'}`, minHeight: 78, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ fontSize: 11, color: 'var(--wv-gray)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 17, fontWeight: 700, color: color || 'var(--wv-dark)' }}>{value}</div>
    </div>
  );
}
