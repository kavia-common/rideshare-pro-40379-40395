import React from 'react';
import { Link } from 'react-router-dom';

// PUBLIC_INTERFACE
export default function HeaderNav() {
  /** Minimal header nav for Profile and History. */
  return (
    <div className="topbar">
      <div className="topbar-title">RideShare Pro</div>
      <div className="topbar-actions">
        <Link className="icon-btn" to="/history">History</Link>
        <Link className="icon-btn" to="/profile">Profile</Link>
      </div>
    </div>
  );
}
