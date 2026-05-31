import { useState } from 'react';
import { fieldAuthAPI } from "../../services/fieldApi";
import { useFieldAuth } from "../../context/FieldAuthContext";
import { useToast } from "../../components/ToastContext";
export default function FieldLoginPage() {
  const { login } = useFieldAuth();
  const toast = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.warning('Please enter email and password.'); return; }
    setLoading(true);
    try {
      const res = await fieldAuthAPI.login(form);
      login(res.data?.data);
      window.location.href = '/field/documents';
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check your credentials.', 'Login Failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #1e293b 0%, #25A1AB 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: 36,
        width: '100%', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#25A1AB', letterSpacing: -1 }}>
            WATT<span style={{ color: '#1e293b' }}>VUE</span>
          </div>
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Field Technician Portal</div>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
              Email Address
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              style={{
                width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0',
                borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
              Password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              style={{
                width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0',
                borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '12px', background: loading ? '#94a3b8' : '#25A1AB',
              color: '#fff', border: 'none', borderRadius: 8, fontSize: 15,
              fontWeight: 600, cursor: loading ? 'default' : 'pointer',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 20 }}>
          Contact your administrator for access
        </p>
      </div>
    </div>
  );
}
