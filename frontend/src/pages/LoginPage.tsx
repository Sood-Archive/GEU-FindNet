import { useState, useContext, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext, api } from '../AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data);
      if (response.data.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      const errorData = err.response?.data;
      const msg = typeof errorData === 'string' ? errorData : (errorData?.message || 'Login failed.');
      if (msg.includes('Email not verified')) {
        navigate('/verify-otp', { state: { email } });
      } else {
        setError(msg);
      }
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px' }}>
        <h1 className="logo"><span className="logo-geu">GEU</span> <span className="logo-findnet">FindNet</span></h1>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>College Email</label>
            <input
              type="email"
              placeholder="user@geu.ac.in or admin@geu.ac.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="primary" style={{ width: '100%', marginTop: '10px' }}>Login</button>
        </form>
        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}
