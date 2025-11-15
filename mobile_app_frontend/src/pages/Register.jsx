import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/authContext';

// PUBLIC_INTERFACE
export default function Register() {
  /** Registration screen */
  const { register } = useAuth();
  const nav = useNavigate();
  const [payload, setPayload] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      setLoading(true);
      await register(payload);
      nav('/');
    } catch {
      setErr('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="col" style={{ paddingTop: 80, padding: 16 }}>
      <div className="card" style={{ margin: '0 auto', maxWidth: 480, width: '100%' }}>
        <h2 style={{ margin: 0 }}>Create account</h2>
        <div className="small">Book rides in seconds</div>
        <div className="spacer" />
        <form className="col" onSubmit={onSubmit}>
          <div className="label">Name</div>
          <input className="input" value={payload.name} onChange={(e)=>setPayload(v=>({...v, name: e.target.value}))} required />
          <div className="label">Email</div>
          <input className="input" type="email" value={payload.email} onChange={(e)=>setPayload(v=>({...v, email: e.target.value}))} required />
          <div className="label">Password</div>
          <input className="input" type="password" value={payload.password} onChange={(e)=>setPayload(v=>({...v, password: e.target.value}))} required />
          {err && <div className="small" style={{ color: 'var(--color-error)' }}>{err}</div>}
          <button className="btn" type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create account'}</button>
        </form>
        <div className="spacer" />
        <div className="small">Have an account? <Link to="/login" style={{ color: 'var(--color-primary)' }}>Sign in</Link></div>
      </div>
    </div>
  );
}
