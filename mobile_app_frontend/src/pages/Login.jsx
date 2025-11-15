import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/authContext';

// PUBLIC_INTERFACE
export default function Login() {
  /** Login screen */
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      setLoading(true);
      await login(email, password);
      nav('/');
    } catch (e) {
      setErr('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="col" style={{ paddingTop: 80, padding: 16 }}>
      <div className="card" style={{ margin: '0 auto', maxWidth: 480, width: '100%' }}>
        <h2 style={{ margin: 0 }}>Welcome back</h2>
        <div className="small">Sign in to continue</div>
        <div className="spacer" />
        <form className="col" onSubmit={onSubmit}>
          <div className="label">Email</div>
          <input className="input" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
          <div className="label">Password</div>
          <input className="input" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
          {err && <div className="small" style={{ color: 'var(--color-error)' }}>{err}</div>}
          <button className="btn" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
        </form>
        <div className="spacer" />
        <div className="small">No account? <Link to="/register" style={{ color: 'var(--color-primary)' }}>Create one</Link></div>
      </div>
    </div>
  );
}
