const UA = 'AwesomeLuxuryServices/1.0 (awesomeluxuryservices@gmail.com)';
const CA_BBOX = '-124.48,32.53,-114.13,42.01';
const BIAS = { lat: '37.5846', lon: '-122.3661' };

const SHORTCUTS = {
  sfo: 'San Francisco International Airport, San Francisco, CA 94128',
  sjc: 'San Jose Mineta International Airport, San Jose, CA 95110',
  oak: 'Oakland International Airport, Oakland, CA 94621',
};

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

function queryVariants(address) {
  let text = String(address || '').trim();
  const lower = text.toLowerCase().replace(/[().]/g, ' ').replace(/\s+/g, ' ').trim();
  if (SHORTCUTS[lower]) text = SHORTCUTS[lower];
  const stripped = text
    .replace(/\b(suite|ste|unit|apt|apartment|#)\s*[a-z0-9-]+\b/gi, '')
    .replace(/\s+,/g, ',')
    .replace(/\s+/g, ' ')
    .trim();
  const highway = stripped
    .replace(/\bHwy\b/gi, 'Highway')
    .replace(/\bPkwy\b/gi, 'Parkway')
    .replace(/\bBlvd\b/gi, 'Boulevard');
  const oldBay = highway
    .replace(/\b(\d+)\s+Bayshore Highway\b/gi, '$1 Old Bayshore Highway')
    .replace(/\b(\d+)\s+Bayshore Hwy\b/gi, '$1 Old Bayshore Highway');
  const withState = /\bca\b|\bcalifornia\b/i.test(stripped) ? stripped : `${stripped}, California`;
  return [...new Set([text, stripped, highway, oldBay, withState].filter((item) => item && item.length >= 3))];
}

function houseNumber(query) {
  const match = String(query || '').match(/\b(\d{2,6})\b/);
  return match ? match[1] : '';
}

function photonPoint(feature) {
  const coords = feature?.geometry?.coordinates;
  if (!Array.isArray(coords) || coords.length < 2) return null;
  const props = feature.properties || {};
  const country = String(props.countrycode || 'us').toUpperCase();
  return {
    lat: Number(coords[1]),
    lon: Number(coords[0]),
    label: [props.name, props.housenumber, props.street, props.city || props.town, props.state, props.postcode]
      .filter(Boolean)
      .join(', '),
    country: country === 'USA' ? 'US' : country,
  };
}

async function geocodePhoton(query) {
  const url =
    `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}` +
    `&lat=${BIAS.lat}&lon=${BIAS.lon}&limit=5&lang=en&bbox=${CA_BBOX}`;
  const resp = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(4500),
  });
  if (!resp.ok) return null;
  const json = await resp.json().catch(() => ({}));
  const features = Array.isArray(json.features) ? json.features : [];
  if (!features.length) return null;
  const number = houseNumber(query);
  const numbered = number
    ? features.find((feature) => String(feature.properties?.housenumber || '') === number)
    : null;
  if (number && !numbered) return null;
  const match = numbered || features.find((feature) => feature.properties?.housenumber) || features[0];
  return photonPoint(match);
}

async function geocodeNominatim(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&addressdetails=1&countrycodes=us&q=${encodeURIComponent(query)}`;
  const resp = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(4500),
  });
  if (!resp.ok) return null;
  const rows = await resp.json().catch(() => []);
  if (!Array.isArray(rows) || !rows[0]) return null;
  const row = rows[0];
  return {
    lat: Number(row.lat),
    lon: Number(row.lon),
    label: row.display_name,
    country: String(row.address?.country_code || 'us').toUpperCase(),
  };
}

async function geocode(address) {
  const original = String(address || '').trim();
  if (original.length < 3) {
    throw new Error('Enter a full street address for pickup and drop-off');
  }
  const variants = queryVariants(original);
  const photonHits = await Promise.all(variants.map((query) => geocodePhoton(query).catch(() => null)));
  const photon = photonHits.find(Boolean);
  if (photon) return photon;
  for (let i = 0; i < variants.length; i += 1) {
    if (i > 0) await sleep(1100);
    const nominatim = await geocodeNominatim(variants[i]);
    if (nominatim) return nominatim;
  }
  throw new Error(`Could not find a map match for: ${original}`);
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
  const points = await Promise.all(labels.map((label) => geocode(label)));
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
