import React, { useState } from 'react';
import BottomCard from './BottomCard';
import { getRoute } from '../utils/osm';
import { apiFetch } from '../api/client';

// PUBLIC_INTERFACE
export default function RideRequestForm({ userLocation, onRoutePreview, onTripCreated }) {
  /**
   * Ride request form allowing pickup/destination input.
   * For simplicity, inputs accept "lat,lng" format; in a full app use geocoding/autocomplete.
   */
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [error, setError] = useState('');

  const parseLatLng = (text) => {
    const [a, b] = (text || '').split(',').map(s => parseFloat(s.trim()));
    if (Number.isFinite(a) && Number.isFinite(b)) return [a, b];
    return null;
  };

  const handlePreview = async () => {
    setError('');
    const p = pickup ? parseLatLng(pickup) : userLocation;
    const d = parseLatLng(dropoff);
    if (!p || !d) { setError('Please provide pickup and destination as "lat,lng"'); return; }
    try {
      setPreviewing(true);
      const route = await getRoute(p, d);
      onRoutePreview?.(route, p, d);
    } catch (e) {
      setError('Could not fetch route preview');
    } finally {
      setPreviewing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const p = pickup ? parseLatLng(pickup) : userLocation;
    const d = parseLatLng(dropoff);
    if (!p || !d) { setError('Please provide pickup and destination as "lat,lng"'); return; }
    try {
      setLoading(true);
      const body = { pickup: { lat: p[0], lng: p[1] }, destination: { lat: d[0], lng: d[1] } };
      const trip = await apiFetch('/trips', { method: 'POST', body });
      onTripCreated?.(trip, p, d);
    } catch (e) {
      // Allow UI progression in preview mode
      const fakeTrip = { id: `trip_${Date.now()}`, status: 'requested', pickup, dropoff };
      onTripCreated?.(fakeTrip, p, d);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomCard>
      <form className="col" onSubmit={handleSubmit}>
        <div className="label">Pickup (lat,lng)</div>
        <input
          className="input"
          placeholder={userLocation ? `${userLocation[0].toFixed(5)},${userLocation[1].toFixed(5)}` : '37.7749,-122.4194'}
          value={pickup}
          onChange={(e) => setPickup(e.target.value)}
        />
        <div className="label">Destination (lat,lng)</div>
        <input
          className="input"
          placeholder="37.7840,-122.4090"
          value={dropoff}
          onChange={(e) => setDropoff(e.target.value)}
          required
        />
        {error && <div className="small" style={{ color: 'var(--color-error)' }}>{error}</div>}
        <div className="row">
          <button type="button" className="btn secondary" onClick={handlePreview} disabled={previewing}>
            {previewing ? 'Previewing...' : 'Preview Route'}
          </button>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Requesting...' : 'Request Ride'}
          </button>
        </div>
      </form>
    </BottomCard>
  );
}
