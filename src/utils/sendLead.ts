export type LeadPayload = {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  type?: 'contact' | 'booking' | 'job';
  position?: string;
  honeypot?: string;
};

export async function sendLead(payload: LeadPayload): Promise<{ ok: boolean; provider?: string }> {
  const API_BASE = (import.meta.env?.VITE_EMAIL_API_BASE as string) ?? '/api/send-email';
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  let json: { error?: string; details?: string; provider?: string } | null = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  if (!res.ok) {
    const text = json?.error || json?.details || `Request failed (${res.status})`;
    throw new Error(text);
  }

  return { ok: true, provider: json?.provider };
}
