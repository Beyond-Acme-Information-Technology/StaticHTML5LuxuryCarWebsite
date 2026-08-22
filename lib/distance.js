const UA = 'AwesomeLuxuryServices/1.0 (awesomeluxuryservices@gmail.com)';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function simplifyCoords(coords, maxPoints = 80) {
  if (!Array.isArray(coords) || coords.length <= maxPoints) return coords || [];
  const step = Math.ceil(coords.length / maxPoints);
  const out = [];
  for (let i = 0; i < coords.length; i += step) out.push(coords[i]);
  const last = coords[coords.length - 1];
  if (out[out.length - 1] !== last) out.push(last);
  return out;
}

async function geocode(address) {
  const query = String(address || '').trim();
  if (query.length < 5) {
    throw new Error('Enter a full street address for pickup and drop-off');
  }
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&addressdetails=1&q=${encodeURIComponent(query)}`;
  const resp = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
  });
  if (!resp.ok) {
    throw new Error('Could not look up that address');
  }
  const rows = await resp.json();
  if (!Array.isArray(rows) || !rows[0]) {
    throw new Error(`Could not find a map match for: ${query}`);
  }
  const row = rows[0];
  const country = String(row.address?.country_code || 'us').toUpperCase();
  return {
    lat: Number(row.lat),
    lon: Number(row.lon),
    label: row.display_name,
    country,
  };
}

function summarizeRoute(route, index) {
  return {
    id: index,
    label: index === 0 ? 'Fastest route' : `Alternate ${index}`,
    miles: Math.round((route.distance / 1609.344) * 10) / 10,
    durationMinutes: Math.max(1, Math.round(route.duration / 60)),
    geometry: simplifyCoords(route.geometry?.coordinates || []),
  };
}

async function drivingRoutes(points) {
  if (!points || points.length < 2) {
    throw new Error('Pickup and drop-off are required');
  }
  const path = points.map((point) => `${point.lon},${point.lat}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/driving/${path}?alternatives=true&overview=simplified&geometries=geojson`;
  const resp = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!resp.ok) {
    throw new Error('Could not calculate driving miles');
  }
  const json = await resp.json();
  const raw = Array.isArray(json.routes) ? json.routes : [];
  if (!raw.length) {
    throw new Error('No driving route found between those addresses');
  }
  const routes = [];
  const seen = new Set();
  raw.slice(0, 3).forEach((route, index) => {
    const item = summarizeRoute(route, index);
    const key = `${item.miles}:${item.durationMinutes}`;
    if (seen.has(key)) return;
    seen.add(key);
    routes.push(item);
  });
  if (routes[1]) routes[1].label = routes[1].miles > routes[0].miles ? 'Fewer highways' : 'Alternate route';
  if (routes[2]) routes[2].label = 'Scenic / longer';
  return routes;
}

async function drivingRoute(points) {
  const routes = await drivingRoutes(points);
  return routes[0];
}

async function tripDistance({ pickup, dropoff, stops = [] }) {
  const extras = (stops || []).map((item) => String(item || '').trim()).filter(Boolean);
  const labels = [pickup, ...extras, dropoff];
  const points = [];
  for (let i = 0; i < labels.length; i += 1) {
    if (i > 0) await sleep(1100);
    points.push(await geocode(labels[i]));
  }
  const routes = await drivingRoutes(points);
  const primary = routes[0];
  return {
    miles: primary.miles,
    durationMinutes: primary.durationMinutes,
    routes,
    country: points[0].country || 'US',
    stopCount: extras.length,
    resolved: points.map((point, index) => ({ address: labels[index], label: point.label })),
  };
}

module.exports = { geocode, drivingRoute, drivingRoutes, tripDistance };
