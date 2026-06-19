import { useState, FormEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { api } from '../AuthContext';

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resent, setResent] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // email passed via navigation state: navigate('/verify-otp', { state: { email } })
  const email = (location.state as any)?.email || '';

  if (!email) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div className="glass-panel" style={{ maxWidth: '400px', width: '100%' }}>
          <p>No email found. <Link to="/register">Go back to Register</Link></p>
        </div>
      </div>
    );
  }

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/auth/verify-otp', { email, otp });
      setSuccess('Email verified! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      const errorData = err.response?.data;
      setError(typeof errorData === 'string' ? errorData : 'Invalid or expired OTP.');
    }
  };

  const handleResend = async () => {
    setError('');
    setResent(false);
    try {
      await api.post(`/auth/resend-otp?email=${email}`);
      setResent(true);
    } catch (err: any) {
      setError('Failed to resend OTP.');
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="glass-panel" style={{ maxWidth: '400px', width: '100%' }}>
        <h1 className="logo" style={{ fontSize: '1.5rem' }}>
          <span className="logo-geu">GEU</span> <span className="logo-findnet">FindNet</span> – Verify Email
        </h1>

        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Enter the 6-digit OTP sent to <strong>{email}</strong>
        </p>

        {success && <div style={{ color: 'var(--success)', marginBottom: '10px' }}>{success}</div>}
        {error && <p className="error-message">{error}</p>}
        {resent && <div style={{ color: 'var(--success)', marginBottom: '10px' }}>OTP resent! Check your inbox.</div>}

        <form onSubmit={handleVerify}>
          <div className="input-group">
            <label>OTP</label>
            <input
              type="text"
              maxLength={6}
              placeholder="123456"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              required
              autoFocus
            />
          </div>
          <button type="submit" className="primary" style={{ width: '100%', marginTop: '15px' }}>
            Verify Email
          </button>
        </form>

        <button
          onClick={handleResend}
          style={{ width: '100%', marginTop: '10px', background: 'transparent', border: '1px solid var(--border-glass)', cursor: 'pointer', padding: '10px', borderRadius: '6px' }}
        >
          Resend OTP
        </button>

        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
          <Link to="/register">Back to Register</Link>
        </p>
      </div>
    </div>
  );
}
