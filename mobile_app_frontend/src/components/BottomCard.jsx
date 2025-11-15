import React from 'react';

// PUBLIC_INTERFACE
export default function BottomCard({ children, elevated = true }) {
  /** Floating bottom card for stacked UI. */
  return (
    <div className="card" style={{ boxShadow: elevated ? 'var(--shadow-md)' : 'var(--shadow-sm)' }}>
      {children}
    </div>
  );
}
