import React, { useEffect, useMemo, useState } from 'react';
import MapView from '../components/MapView';
import RideRequestForm from '../components/RideRequestForm';
import TripStatus from '../components/TripStatus';
import { useTripStore } from '../state/tripStore';
import { initSocket } from '../utils/ws';
import { useAuth } from '../state/authContext';

// PUBLIC_INTERFACE
export default function Home() {
  /** Home screen: map + bottom cards for request/status. */
  const [userLocation, setUserLocation] = useState(null);
  const [pickup, setPickup] = useState(null);
  const [dropoff, setDropoff] = useState(null);
  const { trip, setTrip, status, setStatus, driver, setDriver, eta, setEta, route, setRoute, wsRef } = useTripStore();
  const { token } = useAuth();

  // geolocation
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      pos => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      () => setUserLocation([37.7749, -122.4194]),
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }, []);

  // initialize websocket
  useEffect(() => {
    const socket = initSocket(token);
    wsRef.current = socket;
    if (socket.on) {
      socket.on('connect', () => {});
      socket.on('trip:update', (payload) => {
        if (!payload) return;
        if (payload.status) setStatus(payload.status);
        if (payload.driver) setDriver(payload.driver);
        if (payload.eta) setEta(payload.eta);
        if (payload.location && payload.driver) {
          setDriver(d => ({ ...(d || {}), location: [payload.location.lat, payload.location.lng] }));
        }
      });
    }
    return () => { if (socket.disconnect) socket.disconnect(); };
  }, [token, setDriver, setEta, setStatus, wsRef]);

  const routeCoords = useMemo(() => route?.coords || [], [route]);

  const onRoutePreview = (r, p, d) => {
    setRoute(r);
    setPickup(p);
    setDropoff(d);
    setStatus('requested');
  };

  const onTripCreated = (t, p, d) => {
    setTrip(t);
    setPickup(p);
    setDropoff(d);
    setStatus('requested');
    // join room if ws available
    if (wsRef.current?.emit) {
      wsRef.current.emit('trip:join', { tripId: t.id });
    }
  };

  const cancelTrip = () => {
    setStatus('cancelled');
    setDriver(null);
    setEta(null);
    setTrip(null);
  };

  const completeTrip = () => {
    setStatus('completed');
  };

  return (
    <>
      <MapView
        userLocation={userLocation}
        routeCoords={routeCoords}
        pickup={pickup}
        dropoff={dropoff}
        driver={driver}
      />
      <div className="bottom-stack">
        {status === 'idle' || status === 'requesting' ? (
          <RideRequestForm
            userLocation={userLocation}
            onRoutePreview={onRoutePreview}
            onTripCreated={onTripCreated}
          />
        ) : (
          <TripStatus
            trip={trip}
            eta={eta}
            driver={driver}
            status={status}
            onCancel={cancelTrip}
            onComplete={completeTrip}
          />
        )}
      </div>
    </>
  );
}
