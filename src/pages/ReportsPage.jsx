import { useState, useEffect } from 'react';
import { useToast } from '../components/ToastContext';
import ProtectedRoute from '../components/ProtectedRoute';
import { reportAPI, customerAPI } from '../services/api';

export default function ReportsPage() {
  const toast = useToast();
  const [reports, setReports] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailModal, setEmailModal] = useState(null);
  const [emailForm, setEmailForm] = useState({ toEmail: '', cc: '', subject: '', body: '' });
  const [sending, setSending] = useState(false);
  const [generating, setGenerating] = useState(false);


  useEffect(() => {
    customerAPI.getAll().then((r) => setCustomers(r.data?.data || [])).catch(() => {});
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await reportAPI.getAll();
      setReports(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const triggerDownload = (blobData, filename, mimeType = 'application/pdf') => {
    const url = window.URL.createObjectURL(new Blob([blobData], { type: mimeType }));
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleGenerate = async () => {
    if (!selectedCustomer) {
      showToast('Please select a customer first.', 'error');
      return;
    }
    setGenerating(true);
    try {
      const genRes = await reportAPI.generate(selectedCustomer);
      const reportId = genRes.data?.data?.id;
      if (reportId) {
        const dlRes = await reportAPI.download(reportId);
        const title = genRes.data?.data?.reportTitle || 'report';
        triggerDownload(dlRes.data, `${title}.pdf`);
        toast.success('Report downloaded!');
      }
      await loadReports();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message, 'Failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (report) => {
    try {
      const res = await reportAPI.download(report.id);
      triggerDownload(res.data, (report.reportTitle || 'report') + '.pdf');
      toast.success('Report downloaded!');
    } catch (err) {
      showToast('Download failed: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const handleDownloadExcel = async (customerId) => {
    try {
      const res = await reportAPI.exportExcel(customerId);
      triggerDownload(res.data, `performance-${customerId}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      toast.success('Excel exported successfully!');
    } catch (err) {
      showToast('Export failed: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const handleDelete = async (report) => {
    
    try {
      await reportAPI.delete(report.id);
      setReports(reports.filter((r) => r.id !== report.id));
      
    } catch (err) {
      showToast('Delete failed: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const openEmailModal = (report) => {
    setEmailModal(report);
    setEmailForm({
      toEmail: report.customer?.email || '',
      cc: '',
      subject: report.reportTitle || 'Your WattVue Solar Report',
      body: `Dear ${report.customer?.name || 'Customer'},\n\nPlease find attached your solar performance report.\n\nBest regards,\nWattVue Team`,
    });
  };

  const handleSendEmail = async () => {
    if (!emailForm.toEmail || !emailForm.subject || !emailForm.body) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }
    setSending(true);
    try {
      await reportAPI.email(emailModal.id, emailForm);
      
      setEmailModal(null);
      await loadReports();
    } catch (err) {
      showToast('Send failed: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <ProtectedRoute title="Reports" subtitle="Generate, download, and email customer reports">
      <div style={{ maxWidth: 1200 }}>
        <div className="kpi-card" style={{ padding: 20 }}>
          <h3 style={{ marginTop: 0, color: 'var(--wv-dark)' }}>Generate Performance Report</h3>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <label className="wv-label">Customer</label>
              <select className="wv-input" value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)}>
                <option value="">— Select customer —</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <button className="btn-wv-primary" onClick={handleGenerate} disabled={generating}>
              {generating ? 'Generating...' : '⬇ Generate & Download PDF'}
            </button>
            <button className="btn-wv-outline"
              onClick={() => selectedCustomer && handleDownloadExcel(selectedCustomer)}
              disabled={!selectedCustomer}>
              Export Excel
            </button>
          </div>
        </div>

        <div className="kpi-card" style={{ padding: 20, marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: 'var(--wv-dark)' }}>All Reports</h3>
            <button className="btn-wv-outline" onClick={loadReports}>Refresh</button>
          </div>

          {error && <div className="alert-wv error" style={{ marginTop: 14 }}>{error}</div>}

          {loading ? (
            <p style={{ marginTop: 14 }}>Loading...</p>
          ) : reports.length === 0 ? (
            <p style={{ marginTop: 14, color: 'var(--wv-gray)', fontSize: 13 }}>No reports generated yet.</p>
          ) : (
            <table className="wv-table" style={{ width: '100%', marginTop: 14 }}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Email Status</th>
                  <th>Generated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontSize: 13, fontWeight: 600 }}>{r.reportTitle}</td>
                    <td style={{ fontSize: 13 }}>{r.customer?.name || '—'}</td>
                    <td><span className="badge-success" style={{ fontSize: 11 }}>{r.reportType}</span></td>
                    <td>
                      <span className={r.emailStatus === 'SENT' ? 'badge-success' : 'badge-warning'} style={{ fontSize: 11 }}>
                        {r.emailStatus}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--wv-gray)' }}>
                      {r.generatedAt ? new Date(r.generatedAt).toLocaleString() : '—'}
                    </td>
                    <td style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button onClick={() => handleDownload(r)} className="btn-wv-outline" style={{ padding: '4px 10px', fontSize: 12 }}>
                        Download
                      </button>
                      <button onClick={() => openEmailModal(r)} className="btn-wv-outline" style={{ padding: '4px 10px', fontSize: 12 }}>
                        Email
                      </button>
                      <button onClick={() => handleDelete(r)} className="btn-wv-outline"
                        style={{ padding: '4px 10px', fontSize: 12, color: '#dc2626', borderColor: '#dc2626' }}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {emailModal && (
          <div onClick={() => setEmailModal(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div onClick={(e) => e.stopPropagation()}
              style={{ background: '#fff', borderRadius: 12, padding: 28, width: '90%', maxWidth: 560, maxHeight: '90vh', overflow: 'auto' }}>
              <h3 style={{ marginTop: 0, color: 'var(--wv-dark)' }}>Send Report by Email</h3>
              <p style={{ fontSize: 13, color: 'var(--wv-gray)', marginBottom: 18 }}>Report: {emailModal.reportTitle}</p>
              <div style={{ marginBottom: 12 }}>
                <label className="wv-label">To *</label>
                <input className="wv-input" type="email" value={emailForm.toEmail} onChange={(e) => setEmailForm({ ...emailForm, toEmail: e.target.value })} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label className="wv-label">CC (comma-separated)</label>
                <input className="wv-input" type="text" value={emailForm.cc} onChange={(e) => setEmailForm({ ...emailForm, cc: e.target.value })} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label className="wv-label">Subject *</label>
                <input className="wv-input" type="text" value={emailForm.subject} onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })} />
              </div>
              <div style={{ marginBottom: 18 }}>
                <label className="wv-label">Message *</label>
                <textarea className="wv-input" rows="6" value={emailForm.body} onChange={(e) => setEmailForm({ ...emailForm, body: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button className="btn-wv-outline" onClick={() => setEmailModal(null)} disabled={sending}>Cancel</button>
                <button className="btn-wv-primary" onClick={handleSendEmail} disabled={sending}>
                  {sending ? 'Sending...' : 'Send Email'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </ProtectedRoute>
  );
}
