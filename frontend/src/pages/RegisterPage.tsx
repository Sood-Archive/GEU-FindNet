import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../AuthContext';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '', course: '', studentId: '',
    collegeEmail: '', personalEmail: '', password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.collegeEmail.endsWith('@geu.ac.in')) {
      setError('College Email must end with @geu.ac.in');
      return;
    }
    try {
      await api.post('/auth/register', formData);
      navigate('/verify-otp', { state: { email: formData.collegeEmail } });
    } catch (err: any) {
      const errorData = err.response?.data;
      const msg = typeof errorData === 'string' ? errorData : (errorData?.message || 'Registration failed.');
      // If already registered (verified or not), go to verify page — OTP was resent for unverified
      if (msg.includes('Email already registered')) {
        navigate('/verify-otp', { state: { email: formData.collegeEmail } });
      } else {
        setError(msg);
      }
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '500px' }}>
        <h1 className="logo" style={{ fontSize: '1.5rem' }}>
          <span className="logo-geu">GEU</span> <span className="logo-findnet">FindNet</span> - Register
        </h1>
        {error && <p className="error-message">{error}</p>}
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
            <label>Student ID</label>
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
        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}
