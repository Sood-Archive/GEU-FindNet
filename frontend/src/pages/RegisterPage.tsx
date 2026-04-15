import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../AuthContext';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    course: '',
    studentId: '',
    collegeEmail: '',
    personalEmail: '',
    password: ''
  });
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.collegeEmail.endsWith('@geu.ac.in')) {
      setError('College Email must end with @geu.ac.in');
      return;
    }

    try {
      await api.post('/auth/register', formData);
      setSuccess('Account created! Check your college email for the OTP.');
      setStep('verify');
    } catch (err: any) {
      const errorData = err.response?.data;
      setError(typeof errorData === 'string' ? errorData : (errorData?.message || 'Registration failed.'));
    }
  };

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/auth/verify-otp', { email: formData.collegeEmail, otp });
      setSuccess('Email verified! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      const errorData = err.response?.data;
      setError(typeof errorData === 'string' ? errorData : (errorData?.message || 'Verification failed.'));
    }
  };

  const handleResend = async () => {
    setError('');
    try {
      await api.post(`/auth/resend-otp?email=${formData.collegeEmail}`);
      setSuccess('OTP resent to your college email.');
    } catch (err: any) {
      setError('Failed to resend OTP.');
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '500px' }}>
        <h1 className="logo" style={{ fontSize: '1.5rem' }}>
          <span className="logo-geu">GEU</span> <span className="logo-findnet">FindNet</span> - {step === 'register' ? 'Register' : 'Verify Email'}
        </h1>

        {success && <div style={{ color: 'var(--success)', marginBottom: '10px' }}>{success}</div>}
        {error && <p className="error-message">{error}</p>}

        {step === 'register' && (
          <form onSubmit={handleRegister}>
            <div className="input-group">
              <label>Full Name</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label>Course</label>
              <input type="text" name="course" value={formData.course} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label>Student ID (Numeric)</label>
              <input type="number" name="studentId" value={formData.studentId} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label>College Email (@geu.ac.in)</label>
              <input type="email" name="collegeEmail" value={formData.collegeEmail} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label>Personal Email</label>
              <input type="email" name="personalEmail" value={formData.personalEmail} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required />
            </div>
            <button type="submit" className="primary" style={{ width: '100%', marginTop: '15px' }}>Register</button>
          </form>
        )}

        {step === 'verify' && (
          <form onSubmit={handleVerify}>
            <p style={{ marginBottom: '15px', color: 'var(--text-secondary)' }}>
              Enter the 6-digit OTP sent to <strong>{formData.collegeEmail}</strong>
            </p>
            <div className="input-group">
              <label>OTP</label>
              <input
                type="text"
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="primary" style={{ width: '100%', marginTop: '15px' }}>Verify Email</button>
            <button type="button" onClick={handleResend} style={{ width: '100%', marginTop: '10px', background: 'transparent', border: '1px solid var(--border-glass)', cursor: 'pointer' }}>
              Resend OTP
            </button>
          </form>
        )}

        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}
