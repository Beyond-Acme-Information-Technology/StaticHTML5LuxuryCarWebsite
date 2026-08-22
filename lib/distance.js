const UA = 'AwesomeLuxuryServices/1.0 (awesomeluxuryservices@gmail.com)';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

async function drivingRoute(points) {
  if (!points || points.length < 2) {
    throw new Error('Pickup and drop-off are required');
  }
  const path = points.map((point) => `${point.lon},${point.lat}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/driving/${path}?overview=false`;
  const resp = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!resp.ok) {
    throw new Error('Could not calculate driving miles');
  }
  const json = await resp.json();
  const route = json.routes && json.routes[0];
  if (!route) {
    throw new Error('No driving route found between those addresses');
  }
  return {
    miles: Math.round((route.distance / 1609.344) * 10) / 10,
    durationMinutes: Math.max(1, Math.round(route.duration / 60)),
  };
}

async function tripDistance({ pickup, dropoff, stops = [] }) {
  const extras = (stops || []).map((item) => String(item || '').trim()).filter(Boolean);
  const labels = [pickup, ...extras, dropoff];
  const points = [];
  for (let i = 0; i < labels.length; i += 1) {
    if (i > 0) await sleep(1100);
    points.push(await geocode(labels[i]));
  }
  const route = await drivingRoute(points);
  return {
    ...route,
    country: points[0].country || 'US',
    stopCount: extras.length,
    resolved: points.map((point, index) => ({ address: labels[index], label: point.label })),
  };
}

module.exports = { geocode, drivingRoute, tripDistance };
