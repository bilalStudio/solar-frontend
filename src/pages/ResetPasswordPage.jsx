import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import WattVueLogo from '../components/WattVueLogo';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Missing reset token. Please use the link from your email.');
    }
  }, [token]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error && error !== 'Missing reset token. Please use the link from your email.') setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!token) return;
    if (form.newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await authAPI.resetPassword({ token, newPassword: form.newPassword });
      setMessage('Your password has been reset! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Reset failed.';
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
          Set Your<br /><span>New Password</span>
        </div>
        <p className="login-desc">
          Choose a strong password to keep your WattVue account secure.
        </p>
      </div>

      <div className="login-right">
        <div style={{ marginBottom: 36 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 800, marginBottom: 6, color: 'var(--wv-dark)' }}>
            Reset password
          </h2>
          <p style={{ fontSize: 14, color: 'var(--wv-gray)', margin: 0 }}>
            Enter your new password below.
          </p>
        </div>

        {error && <div className="alert-wv error">{error}</div>}
        {message && (
          <div style={{
            background: 'rgba(84,168,119,0.1)', color: '#54A877', padding: 12, borderRadius: 8,
            fontSize: 13, marginBottom: 16
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label className="wv-label" htmlFor="newPassword">New password</label>
            <input
              id="newPassword" name="newPassword" type="password" className="wv-input"
              placeholder="At least 6 characters" value={form.newPassword} onChange={handleChange}
              autoComplete="new-password"
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label className="wv-label" htmlFor="confirmPassword">Confirm new password</label>
            <input
              id="confirmPassword" name="confirmPassword" type="password" className="wv-input"
              placeholder="Re-enter password" value={form.confirmPassword} onChange={handleChange}
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="btn-wv-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px 20px', fontSize: 15 }}
            disabled={loading || !token}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--wv-gray)' }}>
          <Link to="/login" style={{ color: 'var(--wv-primary)', fontWeight: 600, textDecoration: 'none' }}>
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
