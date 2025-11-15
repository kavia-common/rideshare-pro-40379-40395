import { useEffect, useRef, useState } from 'react';

// PUBLIC_INTERFACE
export function useTripStore() {
  /**
   * Minimal local state store for current trip lifecycle.
   * States: idle -> requested -> assigned -> enroute -> completed/cancelled
   */
  const [trip, setTrip] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | requesting | requested | assigned | enroute | completed | cancelled
  const [driver, setDriver] = useState(null);
  const [eta, setEta] = useState(null);
  const [route, setRoute] = useState(null); // { polyline, distance, duration, coords: [[lat,lng], ...] }
  const wsRef = useRef(null);

  useEffect(() => {
    // Clean up websocket on unmount
    return () => {
      if (wsRef.current && wsRef.current.disconnect) wsRef.current.disconnect();
    };
  }, []);

  return {
    trip, setTrip,
    status, setStatus,
    driver, setDriver,
    eta, setEta,
    route, setRoute,
    wsRef,
  };
}
