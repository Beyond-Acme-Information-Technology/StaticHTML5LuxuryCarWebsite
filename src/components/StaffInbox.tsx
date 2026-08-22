import { useEffect, useState } from 'react';
import { COMPANY } from '@/config/company';
import { apiUrl } from '@/utils/siteUrl';
import TripLiveMap from '@/components/TripLiveMap';

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
  meta?: {
    pickup?: string;
    dropoff?: string;
    miles?: number;
    quoteCents?: number;
    paymentStatus?: string;
    rideCategory?: string;
    waitPerMinuteCents?: number;
    paymentIntentId?: string;
    checkoutUrl?: string;
    stops?: string[];
    routeLabel?: string;
    trip?: {
      status?: string;
      driverId?: string;
      driverName?: string;
      trackToken?: string;
      lastPing?: { lat: number; lon: number; at?: string };
      onLocation?: { lat: number; lon: number; at?: string };
      dropoffGps?: { lat: number; lon: number; at?: string };
      luggagePhoto?: string;
    };
  };
};

const STATUSES = ['new', 'contacted', 'accepted', 'confirmed', 'cancelled', 'closed'] as const;

interface StaffInboxProps {
  onNavigate?: (page: string) => void;
}

export default function StaffInbox({ onNavigate }: StaffInboxProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'inbox' | 'rates' | 'drivers'>('inbox');
  const [rates, setRates] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [driversError, setDriversError] = useState<string | null>(null);
  const [savingDriver, setSavingDriver] = useState(false);
  const [assign, setAssign] = useState<Record<string, string>>({});
  const [surcharge, setSurcharge] = useState<Record<string, { minutes: string; amount: string; reason: string }>>({});
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
      const ratesRes = await fetch(apiUrl('/api/staff-booking'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const ratesJson = await ratesRes.json().catch(() => ({}));
      if (ratesRes.ok) setRates(ratesJson.rates || []);
      const driversRes = await fetch(apiUrl('/api/drivers'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const driversJson = await driversRes.json().catch(() => ({}));
      if (driversRes.ok) {
        setDrivers(driversJson.drivers || []);
        setDriversError(null);
      } else {
        setDriversError(driversJson.error || `Could not load chauffeurs (${driversRes.status})`);
      }
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

  async function bookingAction(id: string, action: string, extra: Record<string, unknown> = {}) {
    if (!token) return;
    const res = await fetch(apiUrl('/api/staff-booking'), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, action, ...extra }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(json.error || 'Staff action failed');
      return;
    }
    if (json.lead) {
      setLeads((current) => current.map((lead) => (lead.id === id ? json.lead : lead)));
    }
    if (json.rates) setRates(json.rates);
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

          <div className="flex gap-2 mb-8">
            <button
              type="button"
              className={`px-4 py-2 ${tab === 'inbox' ? 'bg-[#D4AF37] text-black' : 'text-gray-300'}`}
              onClick={() => setTab('inbox')}
            >
              Inbox
            </button>
            <button
              type="button"
              className={`px-4 py-2 ${tab === 'rates' ? 'bg-[#D4AF37] text-black' : 'text-gray-300'}`}
              onClick={() => setTab('rates')}
            >
              Per-mile rates
            </button>
            <button
              type="button"
              className={`px-4 py-2 ${tab === 'drivers' ? 'bg-[#D4AF37] text-black' : 'text-gray-300'}`}
              onClick={() => setTab('drivers')}
            >
              Chauffeurs
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 border border-red-500 text-red-200">{error}</div>
          )}

          {tab === 'rates' && (
            <div className="space-y-6">
              <p className="text-gray-300">
                Enter dollar amounts. Country is the ISO code from the pickup address (US, CA, GB).
                Suggested US start: regular $4.50/mi, medical $5.25/mi, patient+equipment $6.50/mi.
              </p>
              {rates.map((rate) => (
                <form
                  key={`${rate.country}-${rate.rideCategory}`}
                  className="bg-[#111] border border-[#D4AF37]/30 p-6 grid md:grid-cols-5 gap-4 items-end"
                  onSubmit={(e) => {
                    e.preventDefault();
                    bookingAction('', 'save-rate', {
                      country: rate.country,
                      rideCategory: rate.rideCategory,
                      baseCents: Math.round(Number((e.currentTarget.elements.namedItem('base') as HTMLInputElement).value) * 100),
                      perMileCents: Math.round(Number((e.currentTarget.elements.namedItem('mile') as HTMLInputElement).value) * 100),
                      perStopCents: Math.round(Number((e.currentTarget.elements.namedItem('stop') as HTMLInputElement).value) * 100),
                      waitPerMinuteCents: Math.round(Number((e.currentTarget.elements.namedItem('wait') as HTMLInputElement).value) * 100),
                    });
                  }}
                >
                  <p className="md:col-span-5 text-[#D4AF37]">
                    {rate.country} · {String(rate.rideCategory).replace(/_/g, ' ')}
                  </p>
                  <label className="text-sm text-gray-400">
                    Base $
                    <input name="base" defaultValue={(rate.baseCents / 100).toFixed(2)} className="w-full bg-black border border-[#D4AF37]/30 px-3 py-2 text-white mt-1" />
                  </label>
                  <label className="text-sm text-gray-400">
                    Per mile $
                    <input name="mile" defaultValue={(rate.perMileCents / 100).toFixed(2)} className="w-full bg-black border border-[#D4AF37]/30 px-3 py-2 text-white mt-1" />
                  </label>
                  <label className="text-sm text-gray-400">
                    Per stop $
                    <input name="stop" defaultValue={(rate.perStopCents / 100).toFixed(2)} className="w-full bg-black border border-[#D4AF37]/30 px-3 py-2 text-white mt-1" />
                  </label>
                  <label className="text-sm text-gray-400">
                    Wait / min $
                    <input name="wait" defaultValue={(rate.waitPerMinuteCents / 100).toFixed(2)} className="w-full bg-black border border-[#D4AF37]/30 px-3 py-2 text-white mt-1" />
                  </label>
                  <button type="submit" className="px-4 py-2 bg-[#D4AF37] text-black">Save</button>
                </form>
              ))}
            </div>
          )}

          {tab === 'drivers' && (
            <div className="space-y-8">
              <p className="text-gray-300">
                Enter chauffeur details here, then assign them to a paid or accepted booking in Inbox.
                They sign in at Login → Chauffeur with phone and PIN.
              </p>
              {driversError && (
                <div className="p-4 border border-red-500 text-red-200">{driversError}</div>
              )}
              <form
                className="bg-[#111] border border-[#D4AF37]/30 p-6 grid md:grid-cols-2 gap-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!token || savingDriver) return;
                  const form = e.currentTarget;
                  const payload = {
                    name: (form.elements.namedItem('name') as HTMLInputElement).value,
                    phone: (form.elements.namedItem('phone') as HTMLInputElement).value,
                    email: (form.elements.namedItem('email') as HTMLInputElement).value,
                    vehicle: (form.elements.namedItem('vehicle') as HTMLInputElement).value,
                    licenseNo: (form.elements.namedItem('license') as HTMLInputElement).value,
                    pin: (form.elements.namedItem('pin') as HTMLInputElement).value,
                    notes: (form.elements.namedItem('notes') as HTMLInputElement).value,
                  };
                  setSavingDriver(true);
                  setDriversError(null);
                  try {
                    const res = await fetch(apiUrl('/api/drivers'), {
                      method: 'POST',
                      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                      body: JSON.stringify(payload),
                    });
                    const json = await res.json().catch(() => ({}));
                    if (!res.ok) {
                      setDriversError(json.error || 'Could not save chauffeur');
                      return;
                    }
                    const next = Array.isArray(json.drivers) ? [...json.drivers] : [];
                    if (json.driver && !next.some((row: any) => row.id === json.driver.id)) {
                      next.unshift(json.driver);
                    }
                    setDrivers(next);
                    form.reset();
                  } catch (err: any) {
                    setDriversError(err.message || 'Could not save chauffeur');
                  } finally {
                    setSavingDriver(false);
                  }
                }}
              >
                <input name="name" required placeholder="Full name" className="bg-black border border-[#D4AF37]/30 px-3 py-2 text-white" />
                <input name="phone" required placeholder="Phone" className="bg-black border border-[#D4AF37]/30 px-3 py-2 text-white" />
                <input name="email" placeholder="Email (optional)" className="bg-black border border-[#D4AF37]/30 px-3 py-2 text-white" />
                <input name="vehicle" placeholder="Vehicle" className="bg-black border border-[#D4AF37]/30 px-3 py-2 text-white" />
                <input name="license" placeholder="License #" className="bg-black border border-[#D4AF37]/30 px-3 py-2 text-white" />
                <input name="pin" required placeholder="4–6 digit PIN" className="bg-black border border-[#D4AF37]/30 px-3 py-2 text-white" />
                <input name="notes" placeholder="Notes" className="md:col-span-2 bg-black border border-[#D4AF37]/30 px-3 py-2 text-white" />
                <button type="submit" disabled={savingDriver} className="px-4 py-2 bg-[#D4AF37] text-black disabled:opacity-60">
                  {savingDriver ? 'Saving…' : 'Save chauffeur'}
                </button>
              </form>
              <div className="space-y-4">
                <h3 className="text-white text-xl">
                  Saved chauffeurs ({drivers.length})
                </h3>
                {drivers.length === 0 && !savingDriver && (
                  <p className="text-gray-400">
                    No chauffeurs saved yet. Add a name, 10-digit phone, and 4–6 digit PIN above.
                  </p>
                )}
                {drivers.map((driver) => (
                  <article key={driver.id} className="border border-[#D4AF37]/30 p-4 text-gray-300">
                    <p className="text-white text-xl">{driver.name}</p>
                    <p>{driver.phone}{driver.vehicle ? ` · ${driver.vehicle}` : ''}</p>
                    <p className="text-gray-500">{driver.active === false ? 'Inactive' : 'Active'}</p>
                  </article>
                ))}
              </div>
            </div>
          )}

          {tab === 'inbox' && !loading && !error && leads.length === 0 && (
            <p className="text-gray-300 text-lg">
              No requests yet. Submit a Contact, Booking, or Jobs form on the website, then click Refresh.
            </p>
          )}

          {tab === 'inbox' && (
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

                    {lead.meta?.quoteCents ? (
                  <div className="mt-6 border-t border-[#D4AF37]/20 pt-6 space-y-3">
                    <p className="text-white">
                      Quote ${(Number(lead.meta.quoteCents) / 100).toFixed(2)} · {lead.meta.miles || '?'} miles
                      {lead.meta.routeLabel ? ` · ${lead.meta.routeLabel}` : ''}
                      {lead.meta.pickup ? ` · ${lead.meta.pickup} → ${lead.meta.dropoff}` : ''}
                    </p>
                    {(lead.status === 'accepted' || lead.status === 'confirmed' || lead.meta?.paymentStatus === 'paid') && (
                      <div className="flex flex-wrap gap-2 items-center">
                        <select
                          className="bg-black border border-[#D4AF37]/30 px-3 py-2 text-white"
                          value={assign[lead.id] || lead.meta?.trip?.driverId || ''}
                          onChange={(e) => setAssign((cur) => ({ ...cur, [lead.id]: e.target.value }))}
                        >
                          <option value="">Assign chauffeur</option>
                          {drivers.filter((item) => item.active !== false).map((driver) => (
                            <option key={driver.id} value={driver.id}>
                              {driver.name}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="px-4 py-2 border border-[#D4AF37] text-[#D4AF37]"
                          onClick={async () => {
                            if (!token) return;
                            const driverId = assign[lead.id] || lead.meta?.trip?.driverId;
                            if (!driverId) {
                              setError('Select a chauffeur from the list, then click Assign trip.');
                              return;
                            }
                            if (!drivers.length) {
                              setError('No chauffeurs loaded. Open the Chauffeurs tab, save one, then click Refresh.');
                              return;
                            }
                            const res = await fetch(apiUrl('/api/drivers'), {
                              method: 'POST',
                              headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                              body: JSON.stringify({ action: 'assign', id: lead.id, driverId }),
                            });
                            const json = await res.json().catch(() => ({}));
                            if (!res.ok) {
                              setError(json.error || 'Could not assign chauffeur');
                              return;
                            }
                            setError(null);
                            if (json.lead) {
                              setLeads((current) => current.map((row) => (row.id === lead.id ? json.lead : row)));
                            }
                          }}
                        >
                          Assign trip
                        </button>
                        {drivers.length === 0 && (
                          <p className="text-gray-400 text-sm">Save a chauffeur on the Chauffeurs tab first.</p>
                        )}
                      </div>
                    )}
                    {lead.meta?.trip && (
                      <div className="space-y-3">
                        <p className="text-[#D4AF37]">
                          Trip: {lead.meta.trip.status} · {lead.meta.trip.driverName}
                        </p>
                        <TripLiveMap
                          ping={lead.meta.trip.lastPing || lead.meta.trip.onLocation || lead.meta.trip.dropoffGps}
                          ended={lead.meta.trip.status === 'completed'}
                          label="Live chauffeur location"
                        />
                        {lead.meta.trip.trackToken && (
                          <p className="text-gray-400 text-sm break-all">
                            Guest track link: {`${window.location.origin}/#/track?t=${lead.meta.trip.trackToken}`}
                          </p>
                        )}
                        {lead.meta.trip.luggagePhoto && String(lead.meta.trip.luggagePhoto).startsWith('data:image/') && (
                          <img src={lead.meta.trip.luggagePhoto} alt="Luggage" className="max-h-48" />
                        )}
                      </div>
                    )}
                    {lead.status === 'new' || lead.status === 'contacted' ? (
                      <button
                        type="button"
                        className="px-5 py-3 bg-[#D4AF37] text-black"
                        onClick={() => bookingAction(lead.id, 'accept')}
                      >
                        Accept quote (email Stripe pay link)
                      </button>
                    ) : null}
                    {lead.status === 'confirmed' && lead.meta.paymentIntentId ? (
                      <button
                        type="button"
                        className="px-5 py-3 border border-[#D4AF37] text-[#D4AF37]"
                        onClick={() => bookingAction(lead.id, 'refund')}
                      >
                        Cancel and refund Stripe
                      </button>
                    ) : null}
                    {(lead.status === 'accepted' || lead.status === 'confirmed') && (
                      <div className="flex flex-wrap gap-2 items-end">
                        <input
                          placeholder="Wait minutes"
                          className="bg-black border border-[#D4AF37]/30 px-3 py-2 text-white"
                          value={surcharge[lead.id]?.minutes || ''}
                          onChange={(e) =>
                            setSurcharge((cur) => ({
                              ...cur,
                              [lead.id]: { minutes: e.target.value, amount: cur[lead.id]?.amount || '', reason: cur[lead.id]?.reason || '' },
                            }))
                          }
                        />
                        <input
                          placeholder="Or amount USD"
                          className="bg-black border border-[#D4AF37]/30 px-3 py-2 text-white"
                          value={surcharge[lead.id]?.amount || ''}
                          onChange={(e) =>
                            setSurcharge((cur) => ({
                              ...cur,
                              [lead.id]: { amount: e.target.value, minutes: cur[lead.id]?.minutes || '', reason: cur[lead.id]?.reason || '' },
                            }))
                          }
                        />
                        <input
                          placeholder="Reason"
                          className="bg-black border border-[#D4AF37]/30 px-3 py-2 text-white"
                          value={surcharge[lead.id]?.reason || ''}
                          onChange={(e) =>
                            setSurcharge((cur) => ({
                              ...cur,
                              [lead.id]: { reason: e.target.value, minutes: cur[lead.id]?.minutes || '', amount: cur[lead.id]?.amount || '' },
                            }))
                          }
                        />
                        <button
                          type="button"
                          className="px-4 py-2 border border-[#D4AF37] text-[#D4AF37]"
                          onClick={() =>
                            bookingAction(lead.id, 'surcharge', {
                              kind: 'wait',
                              minutes: surcharge[lead.id]?.minutes,
                              amountCents: Math.round(Number(surcharge[lead.id]?.amount || 0) * 100),
                              reason: surcharge[lead.id]?.reason || 'Wait time',
                            })
                          }
                        >
                          Charge wait
                        </button>
                        <button
                          type="button"
                          className="px-4 py-2 border border-[#D4AF37] text-[#D4AF37]"
                          onClick={() =>
                            bookingAction(lead.id, 'surcharge', {
                              kind: 'damage',
                              amountCents: Math.round(Number(surcharge[lead.id]?.amount || 0) * 100),
                              reason: surcharge[lead.id]?.reason || 'Vehicle damage',
                            })
                          }
                        >
                          Charge damage
                        </button>
                      </div>
                    )}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
          )}
        </div>
      </section>
    </div>
  );
}
