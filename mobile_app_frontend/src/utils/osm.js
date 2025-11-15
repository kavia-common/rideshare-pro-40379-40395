const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving';

/**
 * PUBLIC_INTERFACE
 * getRoute
 * Calls public OSRM endpoint to get route between [lng,lat] pairs, returns decoded geometry and stats.
 */
export async function getRoute(origin, destination) {
  // origin/destination: [lat, lng]
  const start = [origin[1], origin[0]].join(',');
  const end = [destination[1], destination[0]].join(',');
  const url = `${OSRM_BASE}/${start};${end}?overview=full&geometries=polyline6`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('OSRM route failed');
  const data = await res.json();
  const route = data.routes?.[0];
  if (!route) throw new Error('No route found');
  return {
    distance: route.distance,
    duration: route.duration,
    coords: decodePolyline(route.geometry, 6),
    raw: route,
  };
}

/**
 * PUBLIC_INTERFACE
 * decodePolyline
 * Decodes OSRM polyline with precision (default 5, OSRM often uses 6).
 */
export function decodePolyline(str, precision = 5) {
  let index = 0, lat = 0, lng = 0, coordinates = [];
  const factor = Math.pow(10, precision);
  while (index < str.length) {
    let result = 0, shift = 0, b;
    do {
      b = str.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
    lat += dlat;

    result = 0; shift = 0;
    do {
      b = str.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
    lng += dlng;
    coordinates.push([lat / factor, lng / factor]);
  }
  return coordinates;
}
