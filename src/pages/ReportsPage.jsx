import { useState, useEffect } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import { reportAPI, customerAPI } from '../services/api';
import { useToast } from '../components/ToastContext';
import DataTable from '../components/DataTable';

export default function ReportsPage() {
  const toast = useToast();
  const [reports, setReports] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [loading, setLoading] = useState(false);
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
      toast.error(err.response?.data?.message || 'Failed to load reports', 'Load Error');
    } finally { setLoading(false); }
  };

  const triggerDownload = (blobData, filename, mimeType = 'application/pdf') => {
    const url = window.URL.createObjectURL(new Blob([blobData], { type: mimeType }));
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleGenerate = async () => {
    if (!selectedCustomer) { toast.warning('Please select a customer first.'); return; }
    setGenerating(true);
    try {
      const genRes = await reportAPI.generate(selectedCustomer);
      const reportId = genRes.data?.data?.id;
      if (reportId) {
        const dlRes = await reportAPI.download(reportId);
        triggerDownload(dlRes.data, `${genRes.data?.data?.reportTitle || 'report'}.pdf`);
        toast.success('Report generated and downloaded successfully!', 'Report Ready');
      }
      await loadReports();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message, 'Generation Failed');
    } finally { setGenerating(false); }
  };

  const handleDownload = async (report) => {
    try {
      const res = await reportAPI.download(report.id);
      triggerDownload(res.data, `${report.reportTitle || 'report'}.pdf`);
      toast.success(`"${report.reportTitle}" downloaded!`, 'Download Complete');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message, 'Download Failed');
    }
  };

  const handleDownloadExcel = async (customerId) => {
    try {
      const res = await reportAPI.exportExcel(customerId);
      triggerDownload(res.data, `performance-${customerId}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      toast.success('Excel file exported successfully!', 'Export Complete');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message, 'Export Failed');
    }
  };

  const handleDelete = (report) => {
    toast.confirm(
      `Delete "${report.reportTitle}"? This cannot be undone.`,
      async () => {
        try {
          await reportAPI.delete(report.id);
          setReports((prev) => prev.filter((r) => r.id !== report.id));
          toast.success('Report deleted successfully.');
        } catch (err) {
          toast.error(err.response?.data?.message || err.message, 'Delete Failed');
        }
      },
      null,
      'Delete'
    );
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
    if (!emailForm.toEmail) { toast.warning('Please enter recipient email.'); return; }
    if (!emailForm.subject) { toast.warning('Please enter email subject.'); return; }
    if (!emailForm.body) { toast.warning('Please enter email message.'); return; }
    setSending(true);
    try {
      await reportAPI.email(emailModal.id, emailForm);
      toast.success(`Report sent to ${emailForm.toEmail} successfully!`, 'Email Sent');
      setEmailModal(null);
      await loadReports();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message, 'Email Failed');
    } finally { setSending(false); }
  };

  const REPORT_COLUMNS = [
    { key: 'reportTitle', label: 'Title', mobileLabel: 'Title',
      render: (r) => <span style={{ fontWeight: 600, fontSize: 13 }}>{r.reportTitle}</span> },
    { key: 'customerName', label: 'Customer', mobileLabel: 'Customer',
      render: (r) => r.customer?.name || '—' },
    { key: 'reportType', label: 'Type', sortable: false,
      render: (r) => <span className="badge-success" style={{ fontSize: 11 }}>{r.reportType}</span> },
    { key: 'emailStatus', label: 'Email', sortable: false,
      render: (r) => <span className={r.emailStatus === 'SENT' ? 'badge-success' : 'badge-warning'} style={{ fontSize: 11 }}>{r.emailStatus}</span> },
    { key: 'generatedAt', label: 'Generated',
      render: (r) => <span style={{ fontSize: 12, color: 'var(--wv-gray)' }}>{r.generatedAt ? new Date(r.generatedAt).toLocaleString() : '—'}</span> },
    { key: 'actions', label: 'Actions', sortable: false,
      render: (r) => (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button onClick={() => handleDownload(r)} className="btn-wv-outline" style={{ padding: '4px 10px', fontSize: 12 }}>Download</button>
          <button onClick={() => openEmailModal(r)} className="btn-wv-outline" style={{ padding: '4px 10px', fontSize: 12 }}>Email</button>
          <button onClick={() => handleDelete(r)} className="btn-wv-outline" style={{ padding: '4px 10px', fontSize: 12, color: '#dc2626', borderColor: '#dc2626' }}>Delete</button>
        </div>
      )},
  ];

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
            <button className="btn-wv-outline" onClick={() => selectedCustomer && handleDownloadExcel(selectedCustomer)} disabled={!selectedCustomer}>
              Export Excel
            </button>
          </div>
        </div>

        <div className="kpi-card" style={{ padding: 20, marginTop: 20 }}>
          <DataTable
            title="All Reports"
            columns={REPORT_COLUMNS}
            data={reports}
            pageSize={10}
            searchKeys={['reportTitle', 'reportType']}
            emptyMessage={loading ? 'Loading...' : 'No reports generated yet.'}
            actions={<button className="btn-wv-outline" onClick={loadReports} style={{ fontSize: 13, padding: '6px 14px' }}>Refresh</button>}
          />
        </div>

        {emailModal && (
          <div onClick={() => setEmailModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 12, padding: 28, width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'auto' }}>
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
                <button className="btn-wv-primary" onClick={handleSendEmail} disabled={sending}>{sending ? 'Sending...' : 'Send Email'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
