import { useEffect, useState } from 'react';
import { Phone } from 'lucide-react';
import { apiUrl } from '@/utils/siteUrl';
import TripLiveMap from '@/components/TripLiveMap';

type TripCard = {
  id: string;
  name: string;
  phone: string;
  pickup: string;
  dropoff: string;
  date?: string;
  time?: string;
  trip: {
    status: string;
    statusLabel: string;
    live: boolean;
    lastPing?: { lat: number; lon: number; at?: string };
    luggagePhoto?: boolean;
    messages?: { at: string; text: string }[];
  };
};

function getGps(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('This phone cannot share GPS'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => reject(new Error('Allow location so we can capture GPS')),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  });
}

function compressPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, 1200 / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, img.width * scale);
      canvas.height = Math.max(1, img.height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not prepare the photo'));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.65));
    };
    img.onerror = () => reject(new Error('Could not read that photo'));
    img.src = url;
  });
}

interface DriverPortalProps {
  onNavigate?: (page: string) => void;
}

export default function DriverPortal({ onNavigate }: DriverPortalProps) {
  const [driver, setDriver] = useState<{ name: string; vehicle?: string } | null>(null);
  const [trips, setTrips] = useState<TripCard[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<Record<string, string>>({});
  const [photo, setPhoto] = useState<Record<string, string>>({});
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('driverToken') : null;

  async function load() {
    if (!token) {
      onNavigate?.('login');
      return;
    }
    const res = await fetch(apiUrl('/api/driver-trip'), { headers: { Authorization: `Bearer ${token}` } });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      sessionStorage.removeItem('driverToken');
      onNavigate?.('login');
      return;
    }
    setDriver(json.driver);
    setTrips(json.trips || []);
  }

  useEffect(() => {
    load();
    const timer = window.setInterval(load, 15000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const live = trips.filter((item) => item.trip?.live);
    if (!live.length) return undefined;
    const timer = window.setInterval(async () => {
      try {
        const gps = await getGps();
        await Promise.all(
          live.map((item) =>
            fetch(apiUrl('/api/driver-trip'), {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ leadId: item.id, action: 'ping', ...gps }),
            })
          )
        );
      } catch {
        // keep driving
      }
    }, 20000);
    return () => window.clearInterval(timer);
  }, [trips, token]);

  async function act(leadId: string, action: string, extra: Record<string, unknown> = {}) {
    if (!token) return;
    setBusy(true);
    setError(null);
    try {
      let gps = {};
      if (['on_location', 'complete', 'on_my_way', 'on_board'].includes(action)) {
        gps = await getGps();
      }
      const res = await fetch(apiUrl('/api/driver-trip'), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, action, ...gps, ...extra }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Could not update trip');
      await load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <section className="py-12 px-4 max-w-3xl mx-auto">
        <div className="flex justify-between items-start gap-4 mb-8">
          <div>
            <h1 className="text-4xl text-[#D4AF37] mb-2">Chauffeur</h1>
            <p className="text-gray-300">{driver ? `${driver.name}${driver.vehicle ? ` · ${driver.vehicle}` : ''}` : 'Loading…'}</p>
          </div>
          <button
            type="button"
            className="px-4 py-2 border border-[#D4AF37] text-[#D4AF37]"
            onClick={() => {
              sessionStorage.removeItem('driverToken');
              onNavigate?.('login');
            }}
          >
            Sign out
          </button>
        </div>
        {error && <p className="text-red-300 mb-4">{error}</p>}
        {!trips.length && <p className="text-gray-400">No trips assigned yet. Dispatch adds you from the staff inbox.</p>}
        <div className="space-y-8">
          {trips.map((item) => {
            const status = item.trip?.status;
            return (
              <article key={item.id} className="border border-[#D4AF37] p-5 space-y-4">
                <p className="text-[#D4AF37]">{item.trip?.statusLabel}</p>
                <h2 className="text-2xl text-white">{item.name}</h2>
                <p className="text-gray-300">
                  {item.pickup} → {item.dropoff}
                </p>
                {(item.date || item.time) && (
                  <p className="text-gray-400">
                    {item.date} {item.time}
                  </p>
                )}
                <TripLiveMap ping={item.trip?.lastPing} ended={status === 'completed'} label="Your live location" />
                <div className="flex flex-wrap gap-2">
                  {status === 'assigned' && (
                    <button type="button" disabled={busy} className="px-4 py-3 bg-[#D4AF37] text-black" onClick={() => act(item.id, 'accept')}>
                      Accept trip
                    </button>
                  )}
                  {status === 'accepted' && (
                    <button type="button" disabled={busy} className="px-4 py-3 bg-[#D4AF37] text-black" onClick={() => act(item.id, 'on_my_way')}>
                      On my Way
                    </button>
                  )}
                  {status === 'on_my_way' && (
                    <button type="button" disabled={busy} className="px-4 py-3 bg-[#D4AF37] text-black" onClick={() => act(item.id, 'on_location')}>
                      On Location (capture GPS)
                    </button>
                  )}
                  {status === 'on_location' && (
                    <button
                      type="button"
                      disabled={busy || !photo[item.id]}
                      className="px-4 py-3 bg-[#D4AF37] text-black disabled:opacity-50"
                      onClick={() => act(item.id, 'on_board', { photo: photo[item.id] })}
                    >
                      On Board
                    </button>
                  )}
                  {status === 'on_board' && (
                    <button type="button" disabled={busy} className="px-4 py-3 bg-[#D4AF37] text-black" onClick={() => act(item.id, 'complete')}>
                      Drop off (capture GPS)
                    </button>
                  )}
                  {item.phone && (status === 'on_location' || status === 'on_board') && (
                    <a href={`tel:${item.phone}`} className="px-4 py-3 border border-[#D4AF37] text-[#D4AF37] inline-flex items-center gap-2">
                      <Phone size={16} /> Call guest
                    </a>
                  )}
                </div>
                {(status === 'on_location' || status === 'on_board') && (
                  <div className="space-y-3">
                    {status === 'on_location' && (
                      <label className="block text-gray-300 text-sm">
                        Luggage photo (required before On Board)
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="block mt-2 text-white"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const data = await compressPhoto(file);
                            setPhoto((cur) => ({ ...cur, [item.id]: data }));
                          }}
                        />
                      </label>
                    )}
                    {photo[item.id] && <img src={photo[item.id]} alt="Luggage" className="max-h-40 border border-[#D4AF37]/30" />}
                    <textarea
                      className="w-full bg-black border border-[#D4AF37]/30 px-3 py-2 text-white"
                      placeholder="Message the guest in the app"
                      value={message[item.id] || ''}
                      onChange={(e) => setMessage((cur) => ({ ...cur, [item.id]: e.target.value }))}
                    />
                    <button
                      type="button"
                      className="px-4 py-2 border border-[#D4AF37] text-[#D4AF37]"
                      onClick={() => act(item.id, 'message', { message: message[item.id] })}
                    >
                      Send message
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
