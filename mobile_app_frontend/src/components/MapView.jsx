import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Leaflet default icon fix for CRA bundling
import 'leaflet/dist/leaflet.css';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function FlyTo({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 14, { duration: 0.8 });
  }, [center, map]);
  return null;
}

// PUBLIC_INTERFACE
export default function MapView({ userLocation, routeCoords = [], pickup, dropoff, driver }) {
  /** Full-screen map with OSM tiles and optional overlays. */
  const defaultCenter = useMemo(() => userLocation || [37.7749, -122.4194], [userLocation]);
  const [center, setCenter] = useState(defaultCenter);

  useEffect(() => { if (userLocation) setCenter(userLocation); }, [userLocation]);

  return (
    <div className="map-container" role="region" aria-label="Map">
      <MapContainer center={center} zoom={13} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FlyTo center={center} />
        {userLocation && <Marker position={userLocation} />}
        {pickup && <Marker position={pickup} />}
        {dropoff && <Marker position={dropoff} />}
        {driver?.location && <Marker position={driver.location} />}
        {routeCoords.length > 0 && (
          <Polyline positions={routeCoords} pathOptions={{ color: '#2563EB', weight: 5, opacity: 0.8 }} />
        )}
      </MapContainer>
    </div>
  );
}
