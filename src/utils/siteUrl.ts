const APEX = 'awesomeservicesgroups.com';
const WWW = `www.${APEX}`;

export function redirectApexToWww() {
  if (typeof window === 'undefined') return;
  if (window.location.hostname !== APEX) return;
  window.location.replace(
    `https://${WWW}${window.location.pathname}${window.location.search}${window.location.hash}`
  );
}

export function apiUrl(path: string) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (typeof window !== 'undefined' && window.location.hostname === APEX) {
    return `https://${WWW}${normalized}`;
  }
  return normalized;
}

export function normalizeStaffToken(value: string) {
  return value
    .trim()
    .replace(/^STAFF_INBOX_TOKEN\s*=\s*/i, '')
    .replace(/^["']|["']$/g, '')
    .trim();
}
