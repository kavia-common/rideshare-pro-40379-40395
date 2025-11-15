import React from 'react';
import { useAuth } from '../state/authContext';

// PUBLIC_INTERFACE
export default function Profile() {
  /** Profile screen with basic info and logout. */
  const { user, logout } = useAuth();

  return (
    <div style={{ paddingTop: 70, padding: 12 }}>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Profile</h2>
        <div className="small">Email</div>
        <div className="bold">{user?.email || 'Unknown'}</div>
        <div className="spacer" />
        <button className="btn error" onClick={logout}>Log out</button>
      </div>
    </div>
  );
}
