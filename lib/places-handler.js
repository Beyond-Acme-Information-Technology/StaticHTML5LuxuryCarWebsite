const { searchCaliforniaPlaces } = require('./california-places');

const UA = 'AwesomeLuxuryServices/1.0 (awesomeluxuryservices@gmail.com)';
const CA_BBOX = '-124.48,32.53,-114.13,42.01';
const BIAS = { lat: '37.5846', lon: '-122.3661' };
const memory = new Map();

function readQuery(req) {
  if (req.query && req.query.q != null) return String(req.query.q);
  const raw = String(req.url || '');
  const search = raw.includes('?') ? raw.slice(raw.indexOf('?') + 1) : '';
  return new URLSearchParams(search).get('q') || '';
}

function formatPhoton(feature) {
  const props = feature.properties || {};
  const street = [props.housenumber, props.street].filter(Boolean).join(' ').trim();
  const city = props.city || props.town || props.village || props.district || '';
  const stateRaw = String(props.state || '');
  const state = /california/i.test(stateRaw) || stateRaw.toUpperCase() === 'CA' ? 'CA' : stateRaw;
  const zip = props.postcode || '';
  const locality = [city, [state, zip].filter(Boolean).join(' ')].filter(Boolean).join(', ');
  const name = String(props.name || '').trim();
  if (name && street && street.toLowerCase().includes(name.toLowerCase())) {
    return [street, locality].filter(Boolean).join(', ');
  }
  if (name && street && name.toLowerCase() !== street.toLowerCase()) {
    return [name, street, locality].filter(Boolean).join(', ');
  }
  return [name || street, locality].filter(Boolean).join(', ');
}

function inCalifornia(feature) {
  const props = feature.properties || {};
  const country = String(props.countrycode || props.country || '').toLowerCase();
  if (country && country !== 'us' && country !== 'usa' && country !== 'united states') return false;
  const state = String(props.state || '').toLowerCase();
  if (!state) return true;
  return state === 'california' || state === 'ca';
}

function photonQuery(query) {
  const q = String(query || '').trim();
  if (/\bca\b|\bcalifornia\b/i.test(q)) return q;
  return `${q}, California`;
}

async function photonSearch(query) {
  const cached = memory.get(query);
  if (cached && Date.now() - cached.at < 24 * 60 * 60 * 1000) {
    return cached.places;
  }
  const url =
    `https://photon.komoot.io/api/?q=${encodeURIComponent(photonQuery(query))}` +
    `&lat=${BIAS.lat}&lon=${BIAS.lon}&limit=8&lang=en&bbox=${CA_BBOX}`;
  const resp = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(4000),
  });
  if (!resp.ok) return [];
  const json = await resp.json().catch(() => ({}));
  const places = (json.features || [])
    .filter(inCalifornia)
    .map((feature) => ({
      label: formatPhoton(feature),
      hint: feature.properties?.city || 'California',
      source: 'california',
    }))
    .filter((place, index, all) => place.label && all.findIndex((row) => row.label === place.label) === index);
  if (memory.size > 400) memory.clear();
  memory.set(query, { at: Date.now(), places });
  return places;
}

function mergePlaces(local, remote) {
  const seen = new Set();
  const out = [];
  for (const place of [...local, ...remote]) {
    const key = String(place.label || '').toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(place);
    if (out.length >= 8) break;
  }
  return out;
}

async function handlePlaces(req, res) {
  res.setHeader('Cache-Control', 'public, max-age=600');
  const query = readQuery(req).trim();
  const local = searchCaliforniaPlaces(query, 8);
  if (query.length < 2) {
    return res.status(200).json({ places: local });
  }
  try {
    const remote = query.length >= 3 ? await photonSearch(query) : [];
    return res.status(200).json({ places: mergePlaces(local, remote) });
  } catch (err) {
    console.error('places:', err.message);
    return res.status(200).json({ places: local });
  }
}

module.exports = { handlePlaces };
