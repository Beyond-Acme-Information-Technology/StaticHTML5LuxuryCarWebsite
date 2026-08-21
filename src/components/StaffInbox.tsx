import { useEffect, useState } from 'react';
import { COMPANY } from '@/config/company';

type Lead = {
  id: string;
  createdAt: string;
  type: string;
  status: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

const STATUSES = ['new', 'contacted', 'confirmed', 'closed'] as const;

interface StaffInboxProps {
  onNavigate?: (page: string) => void;
}

export default function StaffInbox({ onNavigate }: StaffInboxProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('staffToken') : null;

  async function load() {
    if (!token) {
      setError('Sign in from the Login page using the staff access token.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/leads', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || `Could not load inbox (${res.status})`);
      }
      setLeads(json.leads || []);
    } catch (err: any) {
      setError(err.message || 'Could not load inbox');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function setStatus(id: string, status: string) {
    if (!token) return;
    const res = await fetch('/api/leads', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      setLeads((current) => current.map((lead) => (lead.id === id ? { ...lead, status } : lead)));
    }
  }

  function logout() {
    sessionStorage.removeItem('staffToken');
    onNavigate?.('login');
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <h1 className="text-4xl md:text-5xl mb-3 text-[#D4AF37]">Staff inbox</h1>
              <p className="text-gray-300">
                Booking, contact, and job requests. Email still goes to {COMPANY.email}.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={load}
                className="px-5 py-3 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-colors"
              >
                Refresh
              </button>
              <button
                onClick={logout}
                className="px-5 py-3 bg-[#D4AF37] text-black hover:bg-[#B4941F] transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>

          {loading && <p className="text-gray-400">Loading requests…</p>}
          {error && (
            <div className="mb-6 p-4 border border-red-500 text-red-200">{error}</div>
          )}

          {!loading && !error && leads.length === 0 && (
            <p className="text-gray-400">
              No stored requests yet. Submit a test booking. On Vercel, add Supabase or the list
              will reset between deploys; email still arrives.
            </p>
          )}

          <div className="space-y-6">
            {leads.map((lead) => (
              <article
                key={lead.id}
                className="bg-gradient-to-b from-[#1a1a1a] to-black border border-[#D4AF37]/20 p-6"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div>
                    <p className="text-[#D4AF37] mb-1">
                      {lead.type} · {lead.subject}
                    </p>
                    <h2 className="text-xl">{lead.name || 'Unknown guest'}</h2>
                    <p className="text-gray-400 text-sm">
                      {lead.createdAt ? new Date(lead.createdAt).toLocaleString() : ''}
                    </p>
                  </div>
                  <select
                    aria-label="Request status"
                    value={lead.status}
                    onChange={(e) => setStatus(lead.id, e.target.value)}
                    className="bg-black border border-[#D4AF37]/30 px-3 py-2 text-white"
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-gray-300 mb-2">
                  <a className="text-[#D4AF37]" href={`mailto:${lead.email}`}>{lead.email}</a>
                  {lead.phone ? ` · ${lead.phone}` : ''}
                </p>
                <pre className="text-gray-400 whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {lead.message}
                </pre>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
