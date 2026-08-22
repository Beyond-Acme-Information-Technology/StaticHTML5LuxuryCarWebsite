import { useEffect, useMemo, useState } from 'react';
import { COMPANY } from '@/config/company';
import { apiUrl } from '@/utils/siteUrl';
import {
  clearClientSession,
  getClientToken,
  saveClientProfilePrefill,
  saveClientSession,
} from '@/utils/clientSession';

type Ride = {
  id: string;
  createdAt: string;
  status: string;
  subject: string;
  message: string;
  pickup: string;
  dropoff: string;
  date: string;
  time: string;
  when: string;
  service: string;
  vehicle: string;
  past: boolean;
  miles?: number;
  quoteCents?: number;
  paymentStatus?: string;
  rideCategory?: string;
};

type Message = {
  id: string;
  createdAt: string;
  type: string;
  status: string;
  subject: string;
  message: string;
};

type Profile = {
  email: string;
  name: string;
  phone: string;
  notes: string;
};

interface ClientPortalProps {
  onNavigate?: (page: string) => void;
}

function statusLabel(status: string) {
  if (status === 'confirmed') return 'Confirmed';
  if (status === 'accepted') return 'Accepted — pay to confirm';
  if (status === 'contacted') return 'In review';
  if (status === 'closed') return 'Completed';
  if (status === 'cancelled') return 'Cancelled';
  return 'Requested';
}

export default function ClientPortal({ onNavigate }: ClientPortalProps) {
  const [tab, setTab] = useState<'overview' | 'rides' | 'profile' | 'messages'>('overview');
  const [profile, setProfile] = useState<Profile>({ email: '', name: '', phone: '', notes: '' });
  const [rides, setRides] = useState<Ride[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);

  async function load() {
    const token = getClientToken();
    if (!token) {
      onNavigate?.('login');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const paid = new URLSearchParams(window.location.hash.split('?')[1] || '').get('paid');
      if (paid) {
        await fetch(apiUrl('/api/stripe-confirm'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: paid }),
        });
      }
      const res = await fetch(apiUrl('/api/client-leads'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json().catch(() => ({}));
      if (res.status === 401) {
        clearClientSession();
        onNavigate?.('login');
        return;
      }
      if (!res.ok) {
        throw new Error(json.error || 'Could not load your account');
      }
      const nextProfile = json.profile || {
        email: json.email || '',
        name: '',
        phone: '',
        notes: '',
      };
      setProfile(nextProfile);
      setRides(json.rides || []);
      setMessages(json.messages || []);
      saveClientSession(token, nextProfile.email || json.email, {
        name: nextProfile.name,
        phone: nextProfile.phone,
      });
    } catch (err: any) {
      setError(err.message || 'Could not load your account');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function logout() {
    const token = getClientToken();
    try {
      if (token) {
        await fetch(apiUrl('/api/client-auth'), {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'logout' }),
        });
      }
    } catch {
      // still clear the local session
    }
    clearClientSession();
    onNavigate?.('login');
  }

  async function pay(leadId: string) {
    const token = getClientToken();
    if (!token) return;
    setPayingId(leadId);
    setError(null);
    try {
      const res = await fetch(apiUrl('/api/pay'), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ leadId }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Could not start payment');
      window.location.href = json.url;
    } catch (err: any) {
      setError(err.message || 'Could not start payment');
      setPayingId(null);
    }
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    const token = getClientToken();
    if (!token) return;
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch(apiUrl('/api/client-leads'), {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          notes: profile.notes,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || 'Could not save profile');
      }
      setProfile(json.profile);
      saveClientProfilePrefill({ name: json.profile.name, phone: json.profile.phone });
      setSaved(true);
    } catch (err: any) {
      setError(err.message || 'Could not save profile');
    } finally {
      setSaving(false);
    }
  }

  const upcoming = useMemo(() => rides.filter((ride) => !ride.past), [rides]);
  const past = useMemo(() => rides.filter((ride) => ride.past), [rides]);
  const nextRide = upcoming[0];

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <p className="text-[#D4AF37] tracking-wider mb-2">MY ACCOUNT</p>
              <h1 className="text-4xl md:text-5xl mb-3 text-white">
                {profile.name ? `Welcome, ${profile.name.split(' ')[0]}` : 'Your account'}
              </h1>
              <p className="text-gray-300">
                {profile.email || 'Signed in'}. Session stays active on this browser for 7 days.
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

          <div className="flex flex-wrap gap-2 mb-8 border-b border-[#D4AF37]/20 pb-4">
            {(
              [
                ['overview', 'Overview'],
                ['rides', 'My rides'],
                ['profile', 'My profile'],
                ['messages', 'Messages'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`px-4 py-2 ${
                  tab === id ? 'bg-[#D4AF37] text-black' : 'text-gray-300 hover:text-[#D4AF37]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {loading && <p className="text-gray-400">Loading your account…</p>}
          {error && <div className="mb-6 p-4 border border-red-500 text-red-200">{error}</div>}

          {!loading && tab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <article className="md:col-span-2 bg-[#111] border border-[#D4AF37]/30 p-6">
                <h2 className="text-2xl text-[#D4AF37] mb-4">Next ride</h2>
                {nextRide ? (
                  <RideCard ride={nextRide} onPay={pay} payingId={payingId} />
                ) : (
                  <p className="text-gray-300">
                    No upcoming trips yet. Book a ride and it will appear here after you submit the form.
                  </p>
                )}
              </article>
              <article className="bg-[#111] border border-[#D4AF37]/30 p-6">
                <h2 className="text-2xl text-[#D4AF37] mb-4">Profile</h2>
                <p className="text-white mb-2">{profile.name || 'Add your name'}</p>
                <p className="text-gray-400 mb-2">{profile.email}</p>
                <p className="text-gray-400 mb-4">{profile.phone || 'Add a phone number'}</p>
                <button type="button" className="text-[#D4AF37]" onClick={() => setTab('profile')}>
                  Edit profile
                </button>
                <p className="text-gray-500 mt-6">
                  {upcoming.length} upcoming · {past.length} past · {messages.length} messages
                </p>
                <p className="text-gray-500 mt-4">Need a change? Call {COMPANY.phoneDisplay}.</p>
              </article>
            </div>
          )}

          {!loading && tab === 'rides' && (
            <div className="space-y-10">
              <section>
                <h2 className="text-2xl text-[#D4AF37] mb-4">Upcoming</h2>
                {upcoming.length === 0 && (
                  <p className="text-gray-300">No upcoming rides. Confirmed and requested trips show here.</p>
                )}
                <div className="space-y-6">
                  {upcoming.map((ride) => (
                    <RideCard key={ride.id} ride={ride} onPay={pay} payingId={payingId} />
                  ))}
                </div>
              </section>
              <section>
                <h2 className="text-2xl text-[#D4AF37] mb-4">Past rides</h2>
                {past.length === 0 && (
                  <p className="text-gray-300">Past and completed trips will collect here.</p>
                )}
                <div className="space-y-6">
                  {past.map((ride) => (
                    <RideCard key={ride.id} ride={ride} onPay={pay} payingId={payingId} />
                  ))}
                </div>
              </section>
            </div>
          )}

          {!loading && tab === 'profile' && (
            <form onSubmit={saveProfile} className="max-w-xl bg-[#111] border border-[#D4AF37]/30 p-6 space-y-5">
              <div>
                <label className="block text-gray-300 mb-2">Full name</label>
                <input
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full bg-black border border-[#D4AF37]/30 px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Email</label>
                <input
                  value={profile.email}
                  disabled
                  className="w-full bg-black border border-[#D4AF37]/30 px-4 py-3 text-gray-500"
                />
                <p className="text-gray-500 text-sm mt-2">Sign in uses this email. It cannot be changed here.</p>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Phone</label>
                <input
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full bg-black border border-[#D4AF37]/30 px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Ride preferences</label>
                <textarea
                  value={profile.notes}
                  onChange={(e) => setProfile({ ...profile, notes: e.target.value })}
                  rows={4}
                  placeholder="Preferred vehicle, quiet cabin, child seat, building gate code…"
                  className="w-full bg-black border border-[#D4AF37]/30 px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
              {saved && <p className="text-[#D4AF37]">Profile saved on this account.</p>}
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 bg-[#D4AF37] text-black hover:bg-[#B4941F] disabled:opacity-60"
              >
                {saving ? 'SAVING…' : 'SAVE PROFILE'}
              </button>
            </form>
          )}

          {!loading && tab === 'messages' && (
            <div className="space-y-6">
              {messages.length === 0 && (
                <p className="text-gray-300">Contact and jobs messages for this email will show here.</p>
              )}
              {messages.map((item) => (
                <article key={item.id} className="bg-[#111] border border-[#D4AF37]/30 p-6">
                  <div className="flex flex-wrap gap-3 mb-3">
                    <span className="px-3 py-1 bg-[#D4AF37] text-black text-sm uppercase">{item.type}</span>
                    <span className="px-3 py-1 border border-[#D4AF37] text-[#D4AF37] text-sm">
                      {statusLabel(item.status)}
                    </span>
                  </div>
                  <h3 className="text-xl mb-2">{item.subject || 'Message'}</h3>
                  <p className="text-gray-400 mb-3">
                    {item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}
                  </p>
                  <p className="whitespace-pre-wrap">{item.message}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function RideCard({
  ride,
  onPay,
  payingId,
}: {
  ride: Ride;
  onPay: (id: string) => void;
  payingId: string | null;
}) {
  const due = ride.status === 'accepted' || ride.paymentStatus === 'extra_due';
  return (
    <article className="bg-[#111] border border-[#D4AF37]/30 p-6">
      <div className="flex flex-wrap gap-3 mb-3">
        <span className="px-3 py-1 bg-[#D4AF37] text-black text-sm">{statusLabel(ride.status)}</span>
        {ride.rideCategory && <span className="text-gray-400">{ride.rideCategory.replace(/_/g, ' ')}</span>}
        {ride.service && <span className="text-gray-400">{ride.service}</span>}
      </div>
      <h3 className="text-2xl text-white mb-2">
        {ride.pickup && ride.dropoff ? `${ride.pickup} → ${ride.dropoff}` : ride.subject || 'Ride request'}
      </h3>
      <p className="text-gray-400 mb-2">{ride.when || (ride.createdAt ? new Date(ride.createdAt).toLocaleString() : '')}</p>
      {ride.miles ? <p className="text-gray-300">{ride.miles} miles</p> : null}
      {ride.quoteCents ? (
        <p className="text-white text-xl my-2">${(Number(ride.quoteCents) / 100).toFixed(2)}</p>
      ) : null}
      {ride.vehicle && <p className="text-gray-300">Vehicle: {ride.vehicle}</p>}
      {due && (
        <button
          type="button"
          onClick={() => onPay(ride.id)}
          disabled={payingId === ride.id}
          className="mt-4 px-5 py-3 bg-[#D4AF37] text-black hover:bg-[#B4941F] disabled:opacity-60"
        >
          {payingId === ride.id ? 'Opening Stripe…' : 'Pay with Stripe'}
        </button>
      )}
    </article>
  );
}
