import { useState, useEffect, useRef } from 'react';

export default function CustomerSearchInput({ customers, value, onChange, placeholder }) {
  const [query, setQuery]   = useState('');
  const [open,  setOpen]    = useState(false);
  const ref = useRef(null);

  const selected = customers.find(c => String(c.id) === String(value));

  const results = (query.trim()
    ? customers.filter(c =>
        c.name?.toLowerCase().includes(query.toLowerCase()) ||
        c.email?.toLowerCase().includes(query.toLowerCase()) ||
        c.city?.toLowerCase().includes(query.toLowerCase()) ||
        c.phone?.toLowerCase().includes(query.toLowerCase())
      )
    : customers
  ).slice(0, 10);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (customer) => {
    onChange(String(customer.id));
    setQuery('');
    setOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setQuery('');
  };

  const initials = (name) => name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  const statusStyle = (s) => ({
    active:   { bg: '#e6f4ec', color: '#1a7a3c' },
    pending:  { bg: '#fef3cd', color: '#92400e' },
    inactive: { bg: '#f3f4f6', color: '#6b7280' },
  }[s] ?? { bg: '#f3f4f6', color: '#6b7280' });

  return (
    <div ref={ref} style={{ position: 'relative', maxWidth: 360 }}>
      {selected ? (
        <div
          onClick={() => setOpen(o => !o)}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 12px', border: '1.5px solid var(--wv-primary)',
            borderRadius: 8, background: '#fff', cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <div style={{
            width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, var(--wv-primary), var(--wv-green))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color: '#fff',
          }}>
            {initials(selected.name)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--wv-dark)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {selected.name}
            </div>
            {(selected.city || selected.email) && (
              <div style={{ fontSize: 11, color: 'var(--wv-gray)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {[selected.city, selected.email].filter(Boolean).join(' · ')}
              </div>
            )}
          </div>
          <button onClick={handleClear} title="Clear selection" style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#9ca3af', padding: '2px 4px', lineHeight: 1, fontSize: 16,
          }}>×</button>
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"
            style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
          >
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder={placeholder || 'Search by name, city, email, phone…'}
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            className="wv-input"
            style={{ paddingLeft: 32, paddingRight: 32, width: '100%', fontSize: 13 }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{
              position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 2,
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
      )}

      {open && !selected && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 1000,
          background: '#fff', border: '1.5px solid #e8edf3', borderRadius: 10,
          boxShadow: '0 8px 28px rgba(0,0,0,0.12)',
          maxHeight: 300, overflowY: 'auto',
        }}>
          {results.length === 0 ? (
            <div style={{ padding: '16px', fontSize: 13, color: 'var(--wv-gray)', textAlign: 'center' }}>
              No customers found
            </div>
          ) : (
            results.map((c, i) => {
              const ss = statusStyle(c.status);
              return (
                <button
                  key={c.id}
                  onMouseDown={() => handleSelect(c)}
                  style={{
                    width: '100%', textAlign: 'left', padding: '10px 14px',
                    border: 'none', background: 'transparent', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 10,
                    borderBottom: i < results.length - 1 ? '1px solid #f0f3f8' : 'none',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafb'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, var(--wv-primary), var(--wv-green))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, color: '#fff',
                  }}>
                    {initials(c.name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--wv-dark)' }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--wv-gray)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {[c.city, c.email, c.systemSizeKw && `${c.systemSizeKw} kW`].filter(Boolean).join(' · ')}
                    </div>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
                    background: ss.bg, color: ss.color, flexShrink: 0,
                  }}>
                    {c.status ?? 'unknown'}
                  </span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
