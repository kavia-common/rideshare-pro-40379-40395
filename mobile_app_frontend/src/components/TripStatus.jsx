import React from 'react';
import BottomCard from './BottomCard';

// PUBLIC_INTERFACE
export default function TripStatus({ trip, eta, driver, status, onCancel, onComplete }) {
  /** Displays current trip status and actions. */
  return (
    <BottomCard>
      <div className="col">
        <div className="bold">Trip Status: {status || trip?.status || 'idle'}</div>
        {eta && <div className="small">ETA: {Math.round(eta / 60)} min</div>}
        {driver && (
          <div className="small">Driver: {driver.name || 'Assigned'} {driver.vehicle ? `(${driver.vehicle})` : ''}</div>
        )}
        <div className="row">
          <button className="btn error" onClick={onCancel}>Cancel</button>
          <button className="btn secondary" onClick={onComplete}>Complete</button>
        </div>
      </div>
    </BottomCard>
  );
}
