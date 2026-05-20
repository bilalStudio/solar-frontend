import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import WattVueLogo from '../components/WattVueLogo';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await authAPI.login(form);
      const token = res.data?.data?.token;
      const user = res.data?.data?.user;
      if (!token || !user) {
        setError('Unexpected response from server.');
        return;
      }
      login(user, token);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Invalid credentials. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    const demoUser = { id: 1, name: 'Demo Admin', email: 'admin@wattvue.com', role: 'Administrator' };
    const demoToken = 'demo_token_wattvue_2024';
    login(demoUser, demoToken);
    navigate('/dashboard');
  };

  return (
    <div className="login-shell">
      <div className="login-left">
        <div>
          <WattVueLogo iconSize={160} />
        </div>

        <div className="login-tagline">
          Solar Performance<br />
          <span>Intelligence</span><br />
          Platform
        </div>

        <p className="login-desc">
          Track actual vs estimated solar output, calculate ROI, manage customers, and generate professional PDF reports — all in one place.
        </p>

        <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            'Real-time solar performance comparison',
            'Automated ROI & variance analytics',
            'Professional PDF report generation',
            'Email delivery to customers',
          ].map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                background: 'rgba(37,161,171,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--wv-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="login-right">
        <div style={{ marginBottom: 36 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 800, marginBottom: 6, color: 'var(--wv-dark)' }}>
            Welcome back
          </h2>
          <p style={{ fontSize: 14, color: 'var(--wv-gray)', margin: 0 }}>
            Sign in to your WattVue account
          </p>
        </div>

        {error && (
          <div className="alert-wv error">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, verticalAlign: -2 }}>
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 18 }}>
            <label className="wv-label" htmlFor="email">Email address</label>
            <input
              id="email" name="email" type="email" className="wv-input"
              placeholder="you@company.com" value={form.email} onChange={handleChange}
              autoComplete="email" autoFocus
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label className="wv-label" htmlFor="password" style={{ margin: 0 }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: 12, color: 'var(--wv-primary)', textDecoration: 'none', fontWeight: 500 }}>
                Forgot password?
              </Link>
            </div>
            <input
              id="password" name="password" type="password" className="wv-input"
              placeholder="Enter your password" value={form.password} onChange={handleChange}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit" className="btn-wv-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px 20px', fontSize: 15 }}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm" style={{ width: 16, height: 16 }} />
                Signing in...
              </>
            ) : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: 'var(--wv-gray)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--wv-primary)', fontWeight: 600, textDecoration: 'none' }}>
            Create one
          </Link>
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
          <div style={{ flex: 1, height: 1, background: '#e8edf3' }} />
          <span style={{ fontSize: 12, color: 'var(--wv-gray)' }}>or</span>
          <div style={{ flex: 1, height: 1, background: '#e8edf3' }} />
        </div>

        <button
          onClick={handleDemoLogin} className="btn-wv-outline"
          style={{ width: '100%', justifyContent: 'center', padding: '12px 20px', fontSize: 14 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          Launch Demo (no backend needed)
        </button>

        <p style={{ fontSize: 12, color: 'var(--wv-gray)', textAlign: 'center', marginTop: 24 }}>
          © 2024 WattVue. Solar Performance Intelligence Platform.
        </p>
      </div>
    </div>
  );
}
