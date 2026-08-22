import PLACES from '../../lib/california-places.json';

export type PlaceSuggestion = { label: string; hint?: string; source?: string };

type PlaceRow = { label: string; hint?: string; aliases?: string[] };

function normalize(value: string) {
  return String(value || '')
    .toLowerCase()
    .replace(/[.'’]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function searchableLabel(label: string) {
  return normalize(String(label || '').replace(/,?\s*ca(\s+\d{5})?$/i, ''));
}

function tokens(value: string) {
  return normalize(value).split(/[^a-z0-9]+/).filter(Boolean);
}

export function searchCaliforniaPlaces(query: string, limit = 8): PlaceSuggestion[] {
  const q = normalize(query);
  if (q.length < 1) return [];
  const scored: (PlaceRow & { score: number })[] = [];
  for (const place of PLACES as PlaceRow[]) {
    const label = searchableLabel(place.label);
    const aliases = (place.aliases || []).map(normalize);
    const hint = normalize(place.hint || '');
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
