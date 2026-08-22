const TOKEN_KEY = 'alsClientToken';
const EMAIL_KEY = 'alsClientEmail';
const PROFILE_KEY = 'alsClientProfile';
const AUTH_EVENT = 'als-client-auth';

export type ClientProfilePrefill = {
  name?: string;
  phone?: string;
};

function emit() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(AUTH_EVENT));
}

function migrateFromSessionStorage() {
  if (typeof window === 'undefined') return;
  const oldToken = sessionStorage.getItem('clientToken');
  const oldEmail = sessionStorage.getItem('clientEmail');
  if (oldToken && !localStorage.getItem(TOKEN_KEY)) {
    localStorage.setItem(TOKEN_KEY, oldToken);
  }
  if (oldEmail && !localStorage.getItem(EMAIL_KEY)) {
    localStorage.setItem(EMAIL_KEY, oldEmail);
  }
  sessionStorage.removeItem('clientToken');
  sessionStorage.removeItem('clientEmail');
}

export function getClientToken(): string | null {
  if (typeof window === 'undefined') return null;
  migrateFromSessionStorage();
  return localStorage.getItem(TOKEN_KEY);
}

export function getClientEmail(): string {
  if (typeof window === 'undefined') return '';
  migrateFromSessionStorage();
  return localStorage.getItem(EMAIL_KEY) || '';
}

export function getClientProfilePrefill(): ClientProfilePrefill {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}');
  } catch {
    return {};
  }
}

export function hasClientSession(): boolean {
  return Boolean(getClientToken());
}

export function saveClientSession(token: string, email: string, profile?: ClientProfilePrefill) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(EMAIL_KEY, email);
  if (profile) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }
  emit();
}

export function saveClientProfilePrefill(profile: ClientProfilePrefill) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile || {}));
  emit();
}

export function clearClientSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EMAIL_KEY);
  localStorage.removeItem(PROFILE_KEY);
  sessionStorage.removeItem('clientToken');
  sessionStorage.removeItem('clientEmail');
  emit();
}

export const CLIENT_AUTH_EVENT = AUTH_EVENT;
