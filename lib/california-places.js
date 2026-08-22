const PLACES = require('./california-places.json');

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[.'’]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function searchableLabel(label) {
  return normalize(String(label || '').replace(/,?\s*ca(\s+\d{5})?$/i, ''));
}

function tokens(value) {
  return normalize(value).split(/[^a-z0-9]+/).filter(Boolean);
}

function searchCaliforniaPlaces(query, limit = 8) {
  const q = normalize(query);
  if (q.length < 1) return [];
  const scored = [];
  for (const place of PLACES) {
    const label = searchableLabel(place.label);
    const aliases = (place.aliases || []).map(normalize);
    const hint = normalize(place.hint);
    const words = [...tokens(place.label), ...tokens(hint), ...aliases.flatMap(tokens)];
    let score = 0;
    if (aliases.some((alias) => alias === q) || hint === q) score = 100;
    else if (words.some((word) => word === q)) score = 90;
    else if (label.startsWith(q) || aliases.some((alias) => alias.startsWith(q))) score = 80;
    else if (q.length >= 4 && (label.includes(q) || aliases.some((alias) => alias.includes(q)) || hint.includes(q))) score = 50;
    else if (q.length >= 3 && words.some((word) => word.startsWith(q))) score = 40;
    if (score) scored.push({ ...place, score });
  }
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ label, hint }) => ({ label, hint: hint || '', source: 'cache' }));
}

module.exports = { PLACES, searchCaliforniaPlaces };
