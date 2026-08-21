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

interface ClientPortalProps {
  onNavigate?: (page: string) => void;
}

export default function ClientPortal({ onNavigate }: ClientPortalProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('clientToken') : null;

  async function load() {
    if (!token) {
      setError('Sign in from the Login page with the email on your request.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(apiUrl('/api/client-leads'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || 'Could not load your requests');
      }
      setEmail(json.email || sessionStorage.getItem('clientEmail') || '');
      setLeads(json.leads || []);
    } catch (err: any) {
      setError(err.message || 'Could not load your requests');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function logout() {
    sessionStorage.removeItem('clientToken');
    sessionStorage.removeItem('clientEmail');
    onNavigate?.('login');
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <h1 className="text-4xl md:text-5xl mb-3 text-[#D4AF37]">Your requests</h1>
              <p className="text-gray-300">
                {email ? `Signed in as ${email}.` : 'Client portal'}{' '}
                Questions: {COMPANY.phoneDisplay}.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => onNavigate?.('book')}
                className="px-5 py-3 bg-[#D4AF37] text-black hover:bg-[#B4941F] transition-colors"
              >
                Book a ride
              </button>
              <button
                type="button"
                onClick={logout}
                className="px-5 py-3 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>

          {loading && <p className="text-gray-400">Loading your requests…</p>}
          {error && <div className="mb-6 p-4 border border-red-500 text-red-200">{error}</div>}

          {!loading && !error && leads.length === 0 && (
            <p className="text-gray-300 text-lg">
              No requests for this email yet. Submit a booking or contact form, then refresh this page.
            </p>
          )}

          <div className="space-y-8">
            {leads.map((lead) => (
              <article key={lead.id} className="bg-[#111] border border-[#D4AF37] p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-[#D4AF37] text-black text-sm tracking-wider uppercase">
                    {lead.type || 'request'}
                  </span>
                  <span className="px-3 py-1 border border-[#D4AF37] text-[#D4AF37] text-sm capitalize">
                    {lead.status}
                  </span>
                </div>
                <h2 className="text-2xl text-white mb-2">{lead.subject || 'Request'}</h2>
                <p className="text-gray-400 mb-4">
                  {lead.createdAt ? new Date(lead.createdAt).toLocaleString() : ''}
                </p>
                <p className="text-white whitespace-pre-wrap leading-relaxed">{lead.message}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
