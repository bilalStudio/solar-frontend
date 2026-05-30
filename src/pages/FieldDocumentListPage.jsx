import { useState, useEffect } from 'react';
import { useFieldAuth } from '../context/FieldAuthContext';
import { fieldDocAPI } from '../services/fieldApi';
import { useToast } from '../components/ToastContext';

const DOC_TYPES = [
  { value: 'HEALTH_CHECKLIST', label: 'Health System Checklist', icon: '🏥', color: '#25A1AB' },
  { value: 'SITE_SURVEY',      label: 'Site Survey / Assessment', icon: '📋', color: '#345EA6' },
  { value: 'INSTALL_SERVICE',  label: 'Install / Service Document', icon: '🔧', color: '#7c3aed' },
  { value: 'CREW_UPDATE',      label: 'Crew Update', icon: '👷', color: '#f59e0b' },
];

const STATUS_COLORS = {
  DRAFT:         { bg: '#fef9c3', color: '#854d0e' },
  SUBMITTED:     { bg: '#dcfce7', color: '#166534' },
  PDF_GENERATED: { bg: '#dbeafe', color: '#1e40af' },
  EMAILED:       { bg: '#f3e8ff', color: '#6b21a8' },
};

export default function FieldDocumentListPage() {
  const { tech, logout } = useFieldAuth();
  const toast = useToast();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => { loadDocuments(); }, []);

  const loadDocuments = async () => {
    try {
      const res = await fieldDocAPI.getMyDocuments();
      setDocuments(res.data?.data || []);
    } catch (err) {
      toast.error('Failed to load documents', 'Error');
    } finally { setLoading(false); }
  };

  const handleCreate = async (docType) => {
    setCreating(true);
    try {
      const res = await fieldDocAPI.create({ docType, fieldValues: [] });
      const docId = res.data?.data?.id;
      window.location.href = `/field/documents/${docId}`;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create document', 'Error');
      setCreating(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#25A1AB' }}>WATT<span style={{ color: '#1e293b' }}>VUE</span></div>
          <div style={{ fontSize: 11, color: '#64748b' }}>Field Portal</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: '#374151' }}>👷 {tech?.name}</span>
          <button onClick={logout} style={{ fontSize: 12, color: '#ef4444', background: 'none', border: '1px solid #fca5a5', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px' }}>
        {/* New Document Section */}
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#1e293b', marginBottom: 12 }}>
          Start New Document
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 32 }}>
          {DOC_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => handleCreate(type.value)}
              disabled={creating}
              style={{
                background: '#fff', border: `2px solid ${type.color}20`,
                borderRadius: 12, padding: '16px 12px', cursor: 'pointer',
                textAlign: 'center', transition: 'all 0.15s',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = type.color}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = type.color + '20'}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>{type.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', lineHeight: 1.3 }}>{type.label}</div>
            </button>
          ))}
        </div>

        {/* Recent Documents */}
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#1e293b', marginBottom: 12 }}>
          My Documents
        </h2>

        {loading ? (
          <p style={{ color: '#94a3b8', fontSize: 13 }}>Loading...</p>
        ) : documents.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
            No documents yet. Start a new one above!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {documents.map((doc) => {
              const typeInfo = DOC_TYPES.find(t => t.value === doc.docType) || {};
              const statusStyle = STATUS_COLORS[doc.status] || STATUS_COLORS.DRAFT;
              return (
                <div
                  key={doc.id}
                  onClick={() => window.location.href = `/field/documents/${doc.id}`}
                  style={{
                    background: '#fff', borderRadius: 12, padding: '14px 16px',
                    cursor: 'pointer', border: '1px solid #e2e8f0',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <span style={{ fontSize: 24, flexShrink: 0 }}>{typeInfo.icon || '📄'}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {doc.docTypeLabel}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                        {doc.customerName || 'No customer'} · {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : ''}
                      </div>
                    </div>
                  </div>
                  <span style={{ ...statusStyle, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
                    {doc.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
