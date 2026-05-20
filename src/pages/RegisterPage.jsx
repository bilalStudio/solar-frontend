import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import WattVueLogo from '../components/WattVueLogo';

export default function RegisterPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.email || !form.password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.register({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      const token = res.data?.data?.token;
      const user = res.data?.data?.user;
      if (!token || !user) {
        setError('Unexpected response from server.');
        return;
      }
      login(user, token);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <div className="login-left">
        <div><WattVueLogo iconSize={160} /></div>
        <div className="login-tagline">
          Join<br /><span>WattVue</span><br />Today
        </div>
        <p className="login-desc">
          Create your account and start tracking solar performance, calculating ROI, and generating professional reports for your customers.
        </p>
      </div>

      <div className="login-right">
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 800, marginBottom: 6, color: 'var(--wv-dark)' }}>
            Create account
          </h2>
          <p style={{ fontSize: 14, color: 'var(--wv-gray)', margin: 0 }}>
            Get started with your WattVue platform
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
          <div style={{ marginBottom: 14 }}>
            <label className="wv-label" htmlFor="name">Full name</label>
            <input id="name" name="name" type="text" className="wv-input"
              placeholder="John Doe" value={form.name} onChange={handleChange} autoFocus />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label className="wv-label" htmlFor="email">Email address</label>
            <input id="email" name="email" type="email" className="wv-input"
              placeholder="you@company.com" value={form.email} onChange={handleChange} autoComplete="email" />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label className="wv-label" htmlFor="password">Password</label>
            <input id="password" name="password" type="password" className="wv-input"
              placeholder="At least 6 characters" value={form.password} onChange={handleChange} autoComplete="new-password" />
          </div>

          <div style={{ marginBottom: 22 }}>
            <label className="wv-label" htmlFor="confirmPassword">Confirm password</label>
            <input id="confirmPassword" name="confirmPassword" type="password" className="wv-input"
              placeholder="Re-enter password" value={form.confirmPassword} onChange={handleChange} autoComplete="new-password" />
          </div>

          <button type="submit" className="btn-wv-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px 20px', fontSize: 15 }}
            disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm" style={{ width: 16, height: 16 }} />
                Creating account...
              </>
            ) : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: 'var(--wv-gray)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--wv-primary)', fontWeight: 600, textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
