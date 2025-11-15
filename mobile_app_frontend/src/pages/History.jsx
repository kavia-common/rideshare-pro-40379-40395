import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';

// PUBLIC_INTERFACE
export default function History() {
  /** Shows list of past trips from backend. */
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await apiFetch('/trips?limit=20', { method: 'GET' });
        if (active) setTrips(Array.isArray(data) ? data : (data.items || []));
      } catch {
        if (active) setTrips([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  return (
    <div style={{ paddingTop: 70, padding: 12 }}>
      <h2 style={{ marginTop: 0 }}>Trip History</h2>
      {loading ? <div className="small">Loading…</div> : (
        <div className="col">
          {trips.length === 0 && <div className="small">No trips yet.</div>}
          {trips.map((t) => (
            <div key={t.id || t._id} className="card">
              <div className="bold">#{t.id || t._id}</div>
              <div className="small">Status: {t.status}</div>
              {t.pickup && <div className="small">From: {t.pickup.lat},{t.pickup.lng}</div>}
              {t.destination && <div className="small">To: {t.destination.lat},{t.destination.lng}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
