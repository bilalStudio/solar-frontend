import { useState, useEffect, useRef } from 'react';

/**
 * CUSTOMER MODAL
 *
 * Used for both Add and Edit.
 * If `customer` prop is passed → Edit mode (pre-fills fields)
 * If `customer` is null       → Add mode (blank form)
 *
 * Traps focus inside modal for accessibility.
 * Closes on Escape key or clicking the backdrop.
 */

const EMPTY_FORM = {
  name:             '',
  email:            '',
  phone:            '',
  address:          '',
  city:             '',
  systemSizeKw:     '',
  installationDate: '',
  status:           'active',
  notes:            '',
};

// Single field component for consistent styling
function Field({ label, required, error, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: 'block', fontSize: 13, fontWeight: 600,
        color: 'var(--wv-dark)', marginBottom: 6,
      }}>
        {label}
        {required && <span style={{ color: '#E65428', marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {error && (
        <div style={{ fontSize: 12, color: '#E65428', marginTop: 4 }}>{error}</div>
      )}
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '9px 12px',
  border: '1.5px solid #dce3ec', borderRadius: 8,
  fontSize: 14, fontFamily: 'var(--font-body)',
  color: 'var(--wv-dark)', background: '#fff',
  outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
};

const inputFocusStyle = {
  borderColor: 'var(--wv-primary)',
  boxShadow: '0 0 0 3px rgba(37,161,171,0.12)',
};

function StyledInput({ type = 'text', value, onChange, placeholder, style = {} }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{ ...inputStyle, ...(focused ? inputFocusStyle : {}), ...style }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

function StyledSelect({ value, onChange, children }) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      value={value}
      onChange={onChange}
      style={{ ...inputStyle, ...(focused ? inputFocusStyle : {}), cursor: 'pointer' }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      {children}
    </select>
  );
}

function StyledTextarea({ value, onChange, placeholder, rows = 3 }) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      style={{ ...inputStyle, ...(focused ? inputFocusStyle : {}), resize: 'vertical', lineHeight: 1.5 }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

export default function CustomerModal({ customer, onSave, onClose, saving }) {
  const isEdit = !!customer;
  const [form, setForm]     = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const firstInputRef       = useRef(null);

  // Pre-fill form for edit mode
  useEffect(() => {
    if (customer) {
      setForm({
        name:             customer.name             || '',
        email:            customer.email            || '',
        phone:            customer.phone            || '',
        address:          customer.address          || '',
        city:             customer.city             || '',
        systemSizeKw:     customer.systemSizeKw     || '',
        installationDate: customer.installationDate || '',
        status:           customer.status           || 'active',
        notes:            customer.notes            || '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [customer]);

  // Focus first input when modal opens
  useEffect(() => {
    setTimeout(() => firstInputRef.current?.focus(), 50);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.name.trim())  errs.name  = 'Customer name is required';
    if (!form.email.trim()) errs.email = 'Email address is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email format';
    if (form.systemSizeKw && isNaN(Number(form.systemSizeKw))) {
      errs.systemSizeKw = 'Must be a number (e.g. 5.5)';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...form,
      systemSizeKw: form.systemSizeKw ? parseFloat(form.systemSizeKw) : null,
    };
    onSave(payload, isEdit);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 1040,
          background: 'rgba(0,0,0,0.35)',
          animation: 'fadeIn 0.15s ease',
        }}
      />

      {/* Modal panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? 'Edit Customer' : 'Add Customer'}
        className="wv-modal-panel"
        style={{
          position: 'fixed', top: '50%', left: '50%', zIndex: 1050,
          transform: 'translate(-50%, -50%)',
          width: 'calc(100% - 32px)', maxWidth: 560,
          maxHeight: '92vh',
          background: '#fff',
          borderRadius: 14,
          boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
          display: 'flex', flexDirection: 'column',
          animation: 'modalIn 0.2s ease',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >

        {/* Header */}
        <div style={{
          padding: '18px 24px 16px',
          borderBottom: '1px solid #f0f3f8',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <h3 style={{
              fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 800,
              color: 'var(--wv-dark)', margin: 0,
            }}>
              {isEdit ? 'Edit Customer' : 'Add New Customer'}
            </h3>
            <p style={{ fontSize: 12, color: 'var(--wv-gray)', margin: '3px 0 0' }}>
              {isEdit ? `Editing: ${customer.name}` : 'Fill in the customer details below'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              border: '1px solid #e8edf3', background: '#fff',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#525252" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Scrollable form body */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '20px 24px', flex: 1 }}>

          {/* Row 1: Name + Email */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            <Field label="Full Name" required error={errors.name}>
              <StyledInput
                ref={firstInputRef}
                value={form.name}
                onChange={set('name')}
                placeholder="Enter full name"
                style={errors.name ? { borderColor: '#E65428' } : {}}
              />
            </Field>
            <Field label="Email Address" required error={errors.email}>
              <StyledInput
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="Enter email address"
                style={errors.email ? { borderColor: '#E65428' } : {}}
              />
            </Field>
          </div>

          {/* Row 2: Phone + City */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            <Field label="Phone Number">
              <StyledInput
                type="tel"
                value={form.phone}
                onChange={set('phone')}
                placeholder="Enter phone number"
              />
            </Field>
            <Field label="City">
              <StyledInput
                value={form.city}
                onChange={set('city')}
                placeholder="Enter city"
              />
            </Field>
          </div>

          {/* Address */}
          <Field label="Address">
            <StyledInput
              value={form.address}
              onChange={set('address')}
              placeholder="Enter street address"
            />
          </Field>

          {/* Row 3: System size + Install date + Status */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
            <Field label="System Size (kW)" error={errors.systemSizeKw}>
              <StyledInput
                type="number"
                value={form.systemSizeKw}
                onChange={set('systemSizeKw')}
                placeholder="Enter system size (kW)"
                style={errors.systemSizeKw ? { borderColor: '#E65428' } : {}}
              />
            </Field>
            <Field label="Installation Date">
              <StyledInput
                type="date"
                value={form.installationDate}
                onChange={set('installationDate')}
              />
            </Field>
            <Field label="Status">
              <StyledSelect value={form.status} onChange={set('status')}>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </StyledSelect>
            </Field>
          </div>

          {/* Notes */}
          <Field label="Notes">
            <StyledTextarea
              value={form.notes}
              onChange={set('notes')}
              placeholder="Any special notes about this customer or installation..."
              rows={3}
            />
          </Field>

        </form>

        {/* Footer actions */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid #f0f3f8',
          display: 'flex', justifyContent: 'flex-end', gap: 10,
          flexShrink: 0, background: '#fff',
        }}>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            style={{
              padding: '9px 20px', borderRadius: 8,
              border: '1.5px solid #e8edf3', background: '#fff',
              fontSize: 14, fontWeight: 500, cursor: 'pointer',
              color: 'var(--wv-gray)', fontFamily: 'var(--font-body)',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="btn-wv-primary"
            style={{ padding: '9px 24px', fontSize: 14, opacity: saving ? 0.7 : 1 }}
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm" style={{ width: 14, height: 14 }} />
                Saving...
              </>
            ) : isEdit ? 'Save Changes' : 'Add Customer'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: translate(-50%, -48%); }
          to   { opacity: 1; transform: translate(-50%, -50%); }
        }
      `}</style>
    </>
  );
}
