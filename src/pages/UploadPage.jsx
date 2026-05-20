import { useState, useEffect, useRef } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import { uploadAPI, customerAPI } from '../services/api';

const AUTO_SAVE_KEY = 'wv_upload_draft';

const DATA_TYPES = [
  { value: 'SOLAR_ACTUAL',    label: 'Solar Data – Actual Production' },
  { value: 'SOLAR_ESTIMATED', label: 'Solar Data – Estimated Production' },
  { value: 'UTILITY',         label: 'Utility Meter Data (15-min intervals)' },
  { value: 'CLEANING',        label: 'Cleaning Data Comparison (Before / After)' },
];

export default function UploadPage() {
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [dataType, setDataType] = useState('SYSTEM');
  const [cleaningTag, setCleaningTag] = useState('BEFORE'); // BEFORE | AFTER
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    customerAPI.getAll().then((r) => setCustomers(r.data?.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    try {
      const draft = JSON.parse(localStorage.getItem(AUTO_SAVE_KEY) || '{}');
      if (draft.customerId) setCustomerId(draft.customerId);
      if (draft.dataType) setDataType(draft.dataType);
      if (draft.cleaningTag) setCleaningTag(draft.cleaningTag);
    } catch (e) {}
  }, []);

  useEffect(() => {
    localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify({ customerId, dataType, cleaningTag }));
  }, [customerId, dataType, cleaningTag]);

  useEffect(() => {
    if (customerId) {
      uploadAPI.getUploads(customerId)
        .then((r) => setHistory(r.data?.data || []))
        .catch(() => setHistory([]));
    } else {
      setHistory([]);
    }
  }, [customerId, result]);

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;
    const name = selectedFile.name.toLowerCase();
    if (!name.endsWith('.xlsx') && !name.endsWith('.xlsm') && !name.endsWith('.csv')) {
      setError('Only .xlsx, .xlsm, and .csv files are supported.');
      return;
    }
    setFile(selectedFile);
    setError('');
    setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFileSelect(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!file || !customerId) {
      setError('Please select a customer and file.');
      return;
    }
    setUploading(true);
    setError('');
    setResult(null);
    setProgress(10);

    try {
      // Cleaning Data Comparison uses the SYSTEM upload endpoint
      // but is tagged via the filename so backend / display can identify it
      let uploadFn;
      let uploadFile = file;

      if (dataType === 'UTILITY') {
  uploadFn = uploadAPI.uploadUtility;
} else if (dataType === 'SOLAR_ACTUAL' || dataType === 'SOLAR_ESTIMATED') {
  uploadFn = (f, id) => uploadAPI.uploadExcel(f, id, dataType);
} else {
  uploadFn = uploadAPI.uploadExcel;
        if (dataType === 'CLEANING') {
          // Prefix filename with the cleaning tag so the upload history
          // and analytics can distinguish before/after datasets.
          const tag = cleaningTag === 'BEFORE' ? 'cleaning-before' : 'cleaning-after';
          const renamed = new File([file], `${tag}__${file.name}`, { type: file.type });
          uploadFile = renamed;
        }
      }

      const progressTimer = setInterval(() => {
        setProgress((p) => Math.min(85, p + 15));
      }, 300);

      const res = await uploadFn(uploadFile, customerId);
      clearInterval(progressTimer);
      setProgress(100);
      setResult({
        ...res.data?.data,
        cleaningTag: dataType === 'CLEANING' ? cleaningTag : null,
      });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const getColumnHint = () => {
  if (dataType === 'UTILITY') {
    return (
      <>
        <b>Expected columns:</b> Timestamp | kWh<br />
        Negative kWh values indicate energy exported to the grid (solar export).
      </>
    );
  }
  if (dataType === 'CLEANING') {
    return (
      <>
        <b>Expected columns:</b> Date | Actual kWh<br />
        Upload one dataset tagged <b>Before Cleaning</b> and another tagged <b>After Cleaning</b>.
        The platform will compare them automatically in the Comparison module.
      </>
    );
  }
  if (dataType === 'SOLAR_ACTUAL') {
    return (
      <>
        <b>Expected columns:</b> Date | Actual kWh<br />
        Upload your actual solar production data. First row is treated as headers.
      </>
    );
  }
  if (dataType === 'SOLAR_ESTIMATED') {
    return (
      <>
        <b>Expected columns:</b> Date | Estimated kWh<br />
        Upload your estimated/predicted solar production data. First row is treated as headers.
      </>
    );
  }
  return (
    <>
      <b>Expected columns:</b> Month/Date | Estimated kWh | Actual kWh<br />
      First row is treated as headers.
    </>
  );
};

  return (
    <ProtectedRoute title="Upload Data" subtitle="Upload solar, utility, or cleaning data files">
      <div style={{ maxWidth: 900 }}>
        <div className="kpi-card" style={{ padding: 24 }}>
          {/* Customer + data type */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label className="wv-label">Customer *</label>
              <select className="wv-input" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                <option value="">— Select customer —</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="wv-label">Data type *</label>
              <select className="wv-input" value={dataType} onChange={(e) => setDataType(e.target.value)}>
                {DATA_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          {/* Cleaning tag picker - only shown for CLEANING type */}
          {dataType === 'CLEANING' && (
            <div style={{ marginBottom: 14 }}>
              <label className="wv-label">Cleaning Tag *</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { value: 'BEFORE', label: 'Before Cleaning', color: '#f59e0b' },
                  { value: 'AFTER',  label: 'After Cleaning',  color: '#54A877' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setCleaningTag(opt.value)}
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      borderRadius: 8,
                      border: `2px solid ${cleaningTag === opt.value ? opt.color : '#e8edf3'}`,
                      background: cleaningTag === opt.value ? opt.color + '15' : '#fff',
                      color: cleaningTag === opt.value ? opt.color : 'var(--wv-dark)',
                      fontWeight: 600, fontSize: 14, cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{
            background: '#f8fafc', padding: 12, borderRadius: 8,
            fontSize: 12, color: 'var(--wv-gray)', marginBottom: 18
          }}>
            {getColumnHint()}
          </div>

          {error && <div className="alert-wv error">{error}</div>}

          {/* Drag-and-drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragging ? 'var(--wv-primary)' : '#cbd5e1'}`,
              background: dragging ? 'rgba(37,161,171,0.05)' : '#fafbfd',
              padding: 40, borderRadius: 12, textAlign: 'center',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            <input
              ref={fileInputRef} type="file" hidden
              accept=".xlsx,.xlsm,.csv"
              onChange={(e) => handleFileSelect(e.target.files[0])}
            />
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--wv-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 8 }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            {file ? (
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--wv-dark)' }}>{file.name}</div>
                <div style={{ fontSize: 12, color: 'var(--wv-gray)', marginTop: 4 }}>
                  {(file.size / 1024).toFixed(1)} KB · click to change
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--wv-dark)' }}>
                  Drop your file here or click to browse
                </div>
                <div style={{ fontSize: 12, color: 'var(--wv-gray)', marginTop: 4 }}>
                  Supports .xlsx, .xlsm, .csv
                </div>
              </div>
            )}
          </div>

          {uploading && (
            <div style={{ marginTop: 18 }}>
              <div style={{ background: '#e8edf3', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                <div style={{
                  background: 'var(--wv-primary)', height: '100%', width: `${progress}%`,
                  transition: 'width 0.3s'
                }} />
              </div>
              <div style={{ marginTop: 6, fontSize: 12, color: 'var(--wv-gray)' }}>
                Uploading... {progress}%
              </div>
            </div>
          )}

          {result && (
            <div style={{
              marginTop: 18, padding: 14, borderRadius: 8,
              background: 'rgba(84,168,119,0.1)', color: '#1f8a4f',
              fontSize: 13
            }}>
              ✓ Successfully processed {result.rowsProcessed} rows.
              {' '}Upload ID: {result.uploadId}
              {result.cleaningTag && (
                <> · Tagged as <b>{result.cleaningTag === 'BEFORE' ? 'Before Cleaning' : 'After Cleaning'}</b></>
              )}
            </div>
          )}

          <button
            className="btn-wv-primary" style={{ marginTop: 16 }}
            onClick={handleUpload}
            disabled={uploading || !file || !customerId}
          >
            {uploading ? 'Uploading...' : 'Upload File'}
          </button>
        </div>

        {history.length > 0 && (
          <div className="kpi-card" style={{ padding: 24, marginTop: 20 }}>
            <h3 style={{ marginTop: 0, color: 'var(--wv-dark)' }}>Upload History</h3>
            <table className="wv-table" style={{ width: '100%', marginTop: 10 }}>
              <thead>
                <tr>
                  <th>File</th><th>Type</th><th>Rows</th><th>Status</th><th>Uploaded</th>
                </tr>
              </thead>
              <tbody>
                {history.map((u) => {
                  // Decode the cleaning tag from the filename prefix
                  const fname = u.originalFilename || '';
                  let typeLabel = u.dataType || 'SYSTEM';
                  if (fname.startsWith('cleaning-before__')) typeLabel = 'CLEANING (Before)';
                  else if (fname.startsWith('cleaning-after__')) typeLabel = 'CLEANING (After)';
                  return (
                    <tr key={u.id}>
                      <td style={{ fontSize: 13 }}>{fname.replace(/^cleaning-(before|after)__/, '')}</td>
                      <td><span className="badge-success" style={{ fontSize: 11 }}>{typeLabel}</span></td>
                      <td>{u.rowsProcessed || 0}</td>
                      <td>
                        <span className={u.status === 'SUCCESS' ? 'badge-success' : u.status === 'FAILED' ? 'badge-danger' : 'badge-warning'}
                          style={{ fontSize: 11 }}>
                          {u.status}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--wv-gray)' }}>
                        {u.uploadedAt ? new Date(u.uploadedAt).toLocaleString() : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
