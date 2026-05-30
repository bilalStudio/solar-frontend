import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { fieldDocAPI } from '../services/fieldApi';
import { useFieldAuth } from '../context/FieldAuthContext';
import { useToast } from '../components/ToastContext';
import { customerAPI } from '../services/api';

// Default field templates per document type
const FIELD_TEMPLATES = {
  HEALTH_CHECKLIST: [
    { fieldKey: 'site_address',      fieldLabel: 'Site Address',           fieldType: 'TEXT',     sortOrder: 1 },
    { fieldKey: 'inspection_date',   fieldLabel: 'Inspection Date',        fieldType: 'DATE',     sortOrder: 2 },
    { fieldKey: 'system_size',       fieldLabel: 'System Size (kW)',        fieldType: 'NUMBER',   sortOrder: 3 },
    { fieldKey: 'panel_condition',   fieldLabel: 'Panel Condition',         fieldType: 'TEXT',     sortOrder: 4 },
    { fieldKey: 'inverter_status',   fieldLabel: 'Inverter Status',         fieldType: 'TEXT',     sortOrder: 5 },
    { fieldKey: 'wiring_check',      fieldLabel: 'Wiring Check',            fieldType: 'CHECKBOX', sortOrder: 6 },
    { fieldKey: 'mounting_check',    fieldLabel: 'Mounting Check',          fieldType: 'CHECKBOX', sortOrder: 7 },
    { fieldKey: 'panel_photo',       fieldLabel: 'Panel Photo',             fieldType: 'PHOTO',    sortOrder: 8 },
    { fieldKey: 'inverter_photo',    fieldLabel: 'Inverter Photo',          fieldType: 'PHOTO',    sortOrder: 9 },
    { fieldKey: 'issues_found',      fieldLabel: 'Issues Found',            fieldType: 'TEXT',     sortOrder: 10 },
    { fieldKey: 'recommendations',   fieldLabel: 'Recommendations',         fieldType: 'TEXT',     sortOrder: 11 },
    { fieldKey: 'tech_signature',    fieldLabel: 'Technician Signature',    fieldType: 'TEXT',     sortOrder: 12 },
  ],
  SITE_SURVEY: [
    { fieldKey: 'site_address',      fieldLabel: 'Site Address',            fieldType: 'TEXT',     sortOrder: 1 },
    { fieldKey: 'survey_date',       fieldLabel: 'Survey Date',             fieldType: 'DATE',     sortOrder: 2 },
    { fieldKey: 'roof_type',         fieldLabel: 'Roof Type',               fieldType: 'TEXT',     sortOrder: 3 },
    { fieldKey: 'roof_condition',    fieldLabel: 'Roof Condition',          fieldType: 'TEXT',     sortOrder: 4 },
    { fieldKey: 'roof_age',          fieldLabel: 'Roof Age (years)',        fieldType: 'NUMBER',   sortOrder: 5 },
    { fieldKey: 'roof_pitch',        fieldLabel: 'Roof Pitch',              fieldType: 'TEXT',     sortOrder: 6 },
    { fieldKey: 'shading_issues',    fieldLabel: 'Shading Issues',          fieldType: 'CHECKBOX', sortOrder: 7 },
    { fieldKey: 'utility_meter',     fieldLabel: 'Utility Meter Location',  fieldType: 'TEXT',     sortOrder: 8 },
    { fieldKey: 'main_panel_amps',   fieldLabel: 'Main Panel Amps',         fieldType: 'NUMBER',   sortOrder: 9 },
    { fieldKey: 'roof_photo',        fieldLabel: 'Roof Photo',              fieldType: 'PHOTO',    sortOrder: 10 },
    { fieldKey: 'meter_photo',       fieldLabel: 'Meter Photo',             fieldType: 'PHOTO',    sortOrder: 11 },
    { fieldKey: 'attic_photo',       fieldLabel: 'Attic Photo',             fieldType: 'PHOTO',    sortOrder: 12 },
    { fieldKey: 'special_notes',     fieldLabel: 'Special Notes',           fieldType: 'TEXT',     sortOrder: 13 },
  ],
  INSTALL_SERVICE: [
    { fieldKey: 'job_date',          fieldLabel: 'Job Date',                fieldType: 'DATE',     sortOrder: 1 },
    { fieldKey: 'job_type',          fieldLabel: 'Job Type (Install/Service)', fieldType: 'TEXT',  sortOrder: 2 },
    { fieldKey: 'panels_installed',  fieldLabel: 'Panels Installed',        fieldType: 'NUMBER',   sortOrder: 3 },
    { fieldKey: 'inverter_model',    fieldLabel: 'Inverter Model',          fieldType: 'TEXT',     sortOrder: 4 },
    { fieldKey: 'system_size_kw',    fieldLabel: 'System Size (kW)',        fieldType: 'NUMBER',   sortOrder: 5 },
    { fieldKey: 'permit_number',     fieldLabel: 'Permit Number',           fieldType: 'TEXT',     sortOrder: 6 },
    { fieldKey: 'inspection_passed', fieldLabel: 'Inspection Passed',       fieldType: 'CHECKBOX', sortOrder: 7 },
    { fieldKey: 'before_photo',      fieldLabel: 'Before Photo',            fieldType: 'PHOTO',    sortOrder: 8 },
    { fieldKey: 'after_photo',       fieldLabel: 'After Photo',             fieldType: 'PHOTO',    sortOrder: 9 },
    { fieldKey: 'install_photo',     fieldLabel: 'Installation Photo',      fieldType: 'PHOTO',    sortOrder: 10 },
    { fieldKey: 'work_performed',    fieldLabel: 'Work Performed',          fieldType: 'TEXT',     sortOrder: 11 },
    { fieldKey: 'materials_used',    fieldLabel: 'Materials Used',          fieldType: 'TEXT',     sortOrder: 12 },
    { fieldKey: 'tech_signature',    fieldLabel: 'Technician Signature',    fieldType: 'TEXT',     sortOrder: 13 },
  ],
  CREW_UPDATE: [
    { fieldKey: 'update_date',       fieldLabel: 'Date',                    fieldType: 'DATE',     sortOrder: 1 },
    { fieldKey: 'crew_lead',         fieldLabel: 'Crew Lead',               fieldType: 'TEXT',     sortOrder: 2 },
    { fieldKey: 'crew_members',      fieldLabel: 'Crew Members',            fieldType: 'TEXT',     sortOrder: 3 },
    { fieldKey: 'job_location',      fieldLabel: 'Job Location',            fieldType: 'TEXT',     sortOrder: 4 },
    { fieldKey: 'start_time',        fieldLabel: 'Start Time',              fieldType: 'TEXT',     sortOrder: 5 },
    { fieldKey: 'end_time',          fieldLabel: 'End Time',                fieldType: 'TEXT',     sortOrder: 6 },
    { fieldKey: 'tasks_completed',   fieldLabel: 'Tasks Completed',         fieldType: 'TEXT',     sortOrder: 7 },
    { fieldKey: 'tasks_pending',     fieldLabel: 'Tasks Pending',           fieldType: 'TEXT',     sortOrder: 8 },
    { fieldKey: 'site_photo',        fieldLabel: 'Site Photo',              fieldType: 'PHOTO',    sortOrder: 9 },
    { fieldKey: 'progress_photo',    fieldLabel: 'Progress Photo',          fieldType: 'PHOTO',    sortOrder: 10 },
    { fieldKey: 'issues',            fieldLabel: 'Issues / Concerns',       fieldType: 'TEXT',     sortOrder: 11 },
    { fieldKey: 'next_steps',        fieldLabel: 'Next Steps',              fieldType: 'TEXT',     sortOrder: 12 },
  ],
};

export default function FieldDocumentFormPage() {
  const { id } = useParams();
  const { tech } = useFieldAuth();
  const toast = useToast();
  const autoSaveTimer = useRef(null);
  const cameraInputRef = useRef({});

  const [doc, setDoc] = useState(null);
  const [fields, setFields] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [emailForm, setEmailForm] = useState({ toEmail: '', subject: '', body: '' });
  const [uploadingPhoto, setUploadingPhoto] = useState({});
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    customerAPI.getAll().then(r => setCustomers(r.data?.data || [])).catch(() => {});
    loadDocument();
  }, [id]);

  const loadDocument = async () => {
    try {
      const res = await fieldDocAPI.getById(id);
      const d = res.data?.data;
      setDoc(d);
      setCustomerId(d.customerId ? String(d.customerId) : '');
      setNotes(d.notes || '');

      if (d.fieldValues && d.fieldValues.length > 0) {
        setFields(d.fieldValues);
      } else {
        // Load template fields
        const template = FIELD_TEMPLATES[d.docType] || [];
        setFields(template.map(t => ({ ...t, fieldValue: '', isVisible: true })));
      }
    } catch (err) {
      toast.error('Failed to load document', 'Error');
    } finally { setLoading(false); }
  };

  // Auto-save every 30 seconds
  const triggerAutoSave = useCallback(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => performAutoSave(), 30000);
  }, [fields, notes, customerId]);

  const performAutoSave = async () => {
    setSaving(true);
    try {
      await fieldDocAPI.autoSave(id, {
        customerId: customerId ? parseInt(customerId) : null,
        notes,
        fieldValues: fields,
      });
      setLastSaved(new Date());
    } catch (err) {
      // Silent fail on auto-save
    } finally { setSaving(false); }
  };

  const updateField = (fieldKey, value) => {
    setFields(prev => prev.map(f => f.fieldKey === fieldKey ? { ...f, fieldValue: value } : f));
    triggerAutoSave();
  };

  const toggleVisibility = async (fieldKey, currentVisible) => {
    const newVisible = !currentVisible;
    setFields(prev => prev.map(f => f.fieldKey === fieldKey ? { ...f, isVisible: newVisible } : f));
    try {
      await fieldDocAPI.toggleVisibility(id, fieldKey, newVisible);
    } catch (err) { /* revert on fail */ }
  };

  const handlePhotoCapture = async (fieldKey, file) => {
    if (!file) return;
    setUploadingPhoto(p => ({ ...p, [fieldKey]: true }));
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fieldKey', fieldKey);
      const res = await fieldDocAPI.uploadPhoto(id, formData);
      const photo = res.data?.data;
      setDoc(prev => ({
        ...prev,
        photos: [...(prev?.photos || []), photo],
      }));
      toast.success('Photo uploaded!');
    } catch (err) {
      toast.error('Photo upload failed. Try again.', 'Upload Failed');
    } finally { setUploadingPhoto(p => ({ ...p, [fieldKey]: false })); }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await performAutoSave();
      await fieldDocAPI.submit(id);
      toast.success('Document submitted successfully!', 'Submitted');
      setDoc(prev => ({ ...prev, status: 'SUBMITTED' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submit failed', 'Error');
    } finally { setSubmitting(false); }
  };

  const handleDownload = async () => {
    setGenerating(true);
    try {
      await performAutoSave();
      const res = await fieldDocAPI.downloadPdf(id);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${doc?.docTypeLabel || 'document'}.pdf`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded!', 'Download Complete');
    } catch (err) {
      toast.error('Download failed', 'Error');
    } finally { setGenerating(false); }
  };

  const handleSendEmail = async () => {
    if (!emailForm.toEmail) { toast.warning('Please enter recipient email.'); return; }
    try {
      await fieldDocAPI.emailDocument(id, emailForm);
      toast.success(`Document emailed to ${emailForm.toEmail}!`, 'Email Sent');
      setShowEmail(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Email failed', 'Email Failed');
    }
  };

  const photosForField = (fieldKey) =>
    (doc?.photos || []).filter(p => p.fieldKey === fieldKey);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <p style={{ color: '#94a3b8' }}>Loading document...</p>
    </div>
  );

  const isSubmitted = doc?.status === 'SUBMITTED' || doc?.status === 'EMAILED';

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '12px 16px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => window.location.href = '/field/documents'}
              style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748b' }}>←</button>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{doc?.docTypeLabel}</div>
              <div style={{ fontSize: 11, color: saving ? '#f59e0b' : '#94a3b8' }}>
                {saving ? '💾 Saving...' : lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : 'Auto-saves every 30s'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {!isSubmitted && (
              <button onClick={performAutoSave} disabled={saving}
                style={{ padding: '7px 14px', background: '#f1f5f9', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', color: '#374151' }}>
                Save
              </button>
            )}
            <button onClick={handleDownload} disabled={generating}
              style={{ padding: '7px 14px', background: '#25A1AB', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
              {generating ? '...' : '⬇ PDF'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '20px 16px 100px' }}>
        {/* Status badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{
            padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
            background: isSubmitted ? '#dcfce7' : '#fef9c3',
            color: isSubmitted ? '#166534' : '#854d0e',
          }}>{doc?.status}</span>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>
            {doc?.createdAt ? new Date(doc.createdAt).toLocaleDateString() : ''}
          </span>
        </div>

        {/* Customer selector */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, border: '1px solid #e2e8f0' }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Customer</label>
          <select
            value={customerId}
            onChange={(e) => { setCustomerId(e.target.value); triggerAutoSave(); }}
            disabled={isSubmitted}
            style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, background: '#fff' }}
          >
            <option value="">— Select customer —</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {fields.map((field) => (
            <div key={field.fieldKey} style={{
              background: '#fff', borderRadius: 12, padding: 16,
              border: `1px solid ${field.isVisible ? '#e2e8f0' : '#f1f5f9'}`,
              opacity: field.isVisible ? 1 : 0.5,
            }}>
              {/* Field header with hide toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: field.isVisible ? 10 : 0 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{field.fieldLabel}</label>
                {!isSubmitted && (
                  <button
                    onClick={() => toggleVisibility(field.fieldKey, field.isVisible)}
                    title={field.isVisible ? 'Hide this field' : 'Show this field'}
                    style={{
                      width: 24, height: 24, borderRadius: '50%', border: '1px solid #e2e8f0',
                      background: field.isVisible ? '#fff' : '#f1f5f9',
                      cursor: 'pointer', fontSize: 14, color: '#94a3b8',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                    {field.isVisible ? '−' : '+'}
                  </button>
                )}
              </div>

              {field.isVisible && (
                <>
                  {field.fieldType === 'PHOTO' ? (
                    <div>
                      {/* Show existing photos */}
                      {photosForField(field.fieldKey).map(photo => (
                        <div key={photo.id} style={{ marginBottom: 8 }}>
                          <img src={photo.s3Url} alt={photo.caption || field.fieldLabel}
                            style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8 }} />
                          {photo.caption && <p style={{ fontSize: 11, color: '#94a3b8', margin: '4px 0 0' }}>{photo.caption}</p>}
                        </div>
                      ))}
                      {/* Camera button */}
                      {!isSubmitted && (
                        <>
                          <input
                            ref={el => cameraInputRef.current[field.fieldKey] = el}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            style={{ display: 'none' }}
                            onChange={(e) => handlePhotoCapture(field.fieldKey, e.target.files[0])}
                          />
                          <button
                            onClick={() => cameraInputRef.current[field.fieldKey]?.click()}
                            disabled={uploadingPhoto[field.fieldKey]}
                            style={{
                              width: '100%', padding: '12px', borderRadius: 8,
                              border: '2px dashed #25A1AB', background: '#f0fdfe',
                              color: '#25A1AB', fontSize: 14, fontWeight: 600,
                              cursor: 'pointer', display: 'flex', alignItems: 'center',
                              justifyContent: 'center', gap: 8,
                            }}>
                            {uploadingPhoto[field.fieldKey] ? '⏳ Uploading...' : '📷 Take Photo / Upload'}
                          </button>
                        </>
                      )}
                    </div>
                  ) : field.fieldType === 'CHECKBOX' ? (
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={field.fieldValue === 'true' || field.fieldValue === true}
                        onChange={(e) => updateField(field.fieldKey, String(e.target.checked))}
                        disabled={isSubmitted}
                        style={{ width: 18, height: 18, cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: 13, color: '#374151' }}>
                        {field.fieldValue === 'true' ? '✓ Yes / Pass' : 'Mark as complete'}
                      </span>
                    </label>
                  ) : field.fieldType === 'DATE' ? (
                    <input
                      type="date"
                      value={field.fieldValue || ''}
                      onChange={(e) => updateField(field.fieldKey, e.target.value)}
                      disabled={isSubmitted}
                      style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }}
                    />
                  ) : field.fieldType === 'NUMBER' ? (
                    <input
                      type="number"
                      value={field.fieldValue || ''}
                      onChange={(e) => updateField(field.fieldKey, e.target.value)}
                      disabled={isSubmitted}
                      style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }}
                    />
                  ) : (
                    <textarea
                      rows={field.fieldKey.includes('notes') || field.fieldKey.includes('performed') || field.fieldKey.includes('members') ? 3 : 2}
                      value={field.fieldValue || ''}
                      onChange={(e) => updateField(field.fieldKey, e.target.value)}
                      disabled={isSubmitted}
                      placeholder={`Enter ${field.fieldLabel.toLowerCase()}...`}
                      style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
                    />
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        {/* Notes */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 16, marginTop: 16, border: '1px solid #e2e8f0' }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>Additional Notes</label>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => { setNotes(e.target.value); triggerAutoSave(); }}
            disabled={isSubmitted}
            placeholder="Add any additional notes here..."
            style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
          />
        </div>
      </div>

      {/* Bottom action bar */}
      {!isSubmitted && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: '#fff', borderTop: '1px solid #e2e8f0',
          padding: '12px 16px', display: 'flex', gap: 10, justifyContent: 'center',
        }}>
          <button onClick={() => setShowEmail(true)}
            style={{ flex: 1, maxWidth: 200, padding: '12px', background: '#f1f5f9', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>
            ✉ Email
          </button>
          <button onClick={handleSubmit} disabled={submitting}
            style={{ flex: 1, maxWidth: 200, padding: '12px', background: '#25A1AB', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            {submitting ? 'Submitting...' : '✓ Submit'}
          </button>
        </div>
      )}
      {isSubmitted && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: '#fff', borderTop: '1px solid #e2e8f0',
          padding: '12px 16px', display: 'flex', gap: 10, justifyContent: 'center',
        }}>
          <button onClick={handleDownload} disabled={generating}
            style={{ flex: 1, maxWidth: 220, padding: '12px', background: '#25A1AB', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            {generating ? 'Generating...' : '⬇ Download PDF'}
          </button>
          <button onClick={() => setShowEmail(true)}
            style={{ flex: 1, maxWidth: 220, padding: '12px', background: '#345EA6', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            ✉ Email to Customer
          </button>
        </div>
      )}

      {/* Email modal */}
      {showEmail && (
        <div onClick={() => setShowEmail(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '16px 16px 0 0', padding: 24, width: '100%', maxWidth: 500 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#1e293b' }}>Email Document</h3>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>To *</label>
              <input type="email" value={emailForm.toEmail} onChange={e => setEmailForm({ ...emailForm, toEmail: e.target.value })}
                placeholder="customer@email.com"
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Subject</label>
              <input type="text" value={emailForm.subject || (doc?.docTypeLabel || '')}
                onChange={e => setEmailForm({ ...emailForm, subject: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Message</label>
              <textarea rows={3} value={emailForm.body || 'Please find attached your document from WattVue.'}
                onChange={e => setEmailForm({ ...emailForm, body: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', fontFamily: 'inherit' }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowEmail(false)} style={{ flex: 1, padding: 12, background: '#f1f5f9', border: 'none', borderRadius: 8, fontSize: 14, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSendEmail} style={{ flex: 1, padding: 12, background: '#25A1AB', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
