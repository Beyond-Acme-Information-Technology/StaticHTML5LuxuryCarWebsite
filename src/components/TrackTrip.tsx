import { useEffect, useState } from 'react';
import { apiUrl } from '@/utils/siteUrl';
import TripLiveMap from '@/components/TripLiveMap';

interface TrackTripProps {
  onNavigate?: (page: string) => void;
}

export default function TrackTrip({ onNavigate }: TrackTripProps) {
  const [trip, setTrip] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const token =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.hash.split('?')[1] || '').get('t') ||
        new URLSearchParams(window.location.search).get('t')
      : '';

  async function load() {
    if (!token) {
      setError('This tracking link is missing.');
      return;
    }
    const res = await fetch(`${apiUrl('/api/trip-track')}?t=${encodeURIComponent(token)}`);
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(json.error || 'Trip not found');
      return;
    }
    setTrip(json.trip);
    setError(null);
  }

  useEffect(() => {
    load();
    const timer = window.setInterval(load, 10000);
    return () => window.clearInterval(timer);
  }, [token]);

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <section className="py-16 px-4 max-w-3xl mx-auto">
        <h1 className="text-4xl text-[#D4AF37] mb-4">Live trip</h1>
        {error && <p className="text-red-300">{error}</p>}
        {trip && (
          <div className="space-y-4">
            <p className="text-white text-xl">{trip.statusLabel}</p>
            <p className="text-gray-300">
              {trip.driverName ? `Chauffeur ${trip.driverName}` : 'Chauffeur assigned'}
              {trip.driverVehicle ? ` · ${trip.driverVehicle}` : ''}
            </p>
            <p className="text-gray-300">
              {trip.pickup} → {trip.dropoff}
            </p>
            <TripLiveMap ping={trip.lastPing || trip.onLocation || trip.dropoffGps} ended={!trip.live} />
            {trip.messages?.length ? (
              <div className="space-y-2">
                <p className="text-[#D4AF37]">Messages</p>
                {trip.messages.map((item: { at: string; text: string }, index: number) => (
                  <p key={`${item.at}-${index}`} className="text-gray-300">
                    {item.text}
                  </p>
                ))}
              </div>
            ) : null}
            {trip.driverPhone && trip.live && (
              <a href={`tel:${trip.driverPhone}`} className="inline-block px-4 py-3 border border-[#D4AF37] text-[#D4AF37]">
                Call chauffeur
              </a>
            )}
            <button type="button" className="block text-gray-400 mt-6" onClick={() => onNavigate?.('account')}>
              Open my account
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
