import { useEffect, useState } from 'react';
import { COMPANY } from '@/config/company';
import { apiUrl } from '@/utils/siteUrl';

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
      const res = await fetch(apiUrl('/api/leads'), {
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
    const res = await fetch(apiUrl('/api/leads'), {
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
                {loading ? 'Loading requests…' : `${leads.length} stored request${leads.length === 1 ? '' : 's'}.`}
                {' '}Email still goes to {COMPANY.email}.
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

          {error && (
            <div className="mb-6 p-4 border border-red-500 text-red-200">{error}</div>
          )}

          {!loading && !error && leads.length === 0 && (
            <p className="text-gray-300 text-lg">
              No requests yet. Submit a Contact, Booking, or Jobs form on the website, then click Refresh.
            </p>
          )}

          <div className="space-y-8">
            {leads.map((lead) => (
              <article
                key={lead.id}
                className="bg-[#111] border border-[#D4AF37] p-6 md:p-8"
              >
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className="px-3 py-1 bg-[#D4AF37] text-black text-sm tracking-wider uppercase">
                    {lead.type || 'request'}
                  </span>
                  <span className="text-white text-lg">{lead.subject || 'No subject'}</span>
                </div>

                <dl className="grid gap-4 md:grid-cols-2 text-base mb-6">
                  <div>
                    <dt className="text-[#D4AF37] text-sm mb-1">Guest</dt>
                    <dd className="text-white text-xl">{lead.name || 'Unknown guest'}</dd>
                  </div>
                  <div>
                    <dt className="text-[#D4AF37] text-sm mb-1">Received</dt>
                    <dd className="text-white">
                      {lead.createdAt ? new Date(lead.createdAt).toLocaleString() : '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#D4AF37] text-sm mb-1">Email</dt>
                    <dd>
                      {lead.email ? (
                        <a className="text-white underline" href={`mailto:${lead.email}`}>
                          {lead.email}
                        </a>
                      ) : (
                        '—'
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#D4AF37] text-sm mb-1">Phone</dt>
                    <dd>
                      {lead.phone ? (
                        <a className="text-white underline" href={`tel:${lead.phone}`}>
                          {lead.phone}
                        </a>
                      ) : (
                        '—'
                      )}
                    </dd>
                  </div>
                </dl>

                <div className="mb-6">
                  <p className="text-[#D4AF37] text-sm mb-2">Message</p>
                  <p className="text-white whitespace-pre-wrap leading-relaxed">
                    {lead.message || 'No message body'}
                  </p>
                </div>

                <div>
                  <p className="text-[#D4AF37] text-sm mb-2">Status</p>
                  <div className="flex flex-wrap gap-2">
                    {STATUSES.map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setStatus(lead.id, status)}
                        className={`px-4 py-2 border capitalize ${
                          lead.status === status
                            ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                            : 'border-[#D4AF37]/50 text-white hover:border-[#D4AF37]'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
