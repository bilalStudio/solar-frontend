import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import WattVueLogo from '../components/WattVueLogo';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email) {
      setError('Please enter your email.');
      return;
    }

    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setMessage('If an account exists with this email, a password reset link has been sent. Please check your inbox.');
      setEmail('');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Something went wrong.';
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
          Reset<br /><span>Your Password</span>
        </div>
        <p className="login-desc">
          Enter the email address associated with your account, and we'll send you a link to reset your password.
        </p>
      </div>

      <div className="login-right">
        <div style={{ marginBottom: 36 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 800, marginBottom: 6, color: 'var(--wv-dark)' }}>
            Forgot password?
          </h2>
          <p style={{ fontSize: 14, color: 'var(--wv-gray)', margin: 0 }}>
            We'll email you a link to reset it.
          </p>
        </div>

        {error && (
          <div className="alert-wv error">{error}</div>
        )}
        {message && (
          <div className="alert-wv success" style={{
            background: 'rgba(84,168,119,0.1)', color: '#54A877', padding: 12, borderRadius: 8,
            fontSize: 13, marginBottom: 16
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 24 }}>
            <label className="wv-label" htmlFor="email">Email address</label>
            <input
              id="email" type="email" className="wv-input"
              placeholder="you@company.com" value={email}
              onChange={(e) => setEmail(e.target.value)} autoFocus
            />
          </div>

          <button type="submit" className="btn-wv-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px 20px', fontSize: 15 }}
            disabled={loading}>
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--wv-gray)' }}>
          Remembered it?{' '}
          <Link to="/login" style={{ color: 'var(--wv-primary)', fontWeight: 600, textDecoration: 'none' }}>
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
