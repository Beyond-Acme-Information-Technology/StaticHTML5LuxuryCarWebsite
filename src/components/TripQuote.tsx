import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { RIDE_CATEGORIES } from '@/config/company';
import { apiUrl } from '@/utils/siteUrl';
import AddressField from '@/components/AddressField';

export type RouteOption = {
  id: number;
  label: string;
  miles: number;
  durationMinutes: number;
  geometry?: number[][];
  quote: {
    miles: number;
    stopCount: number;
    totalCents: number;
    waitPerMinuteCents: number;
    rideCategory: string;
    lineItems: { label: string; cents: number }[];
    quoteId?: string;
  };
};

export type QuoteResult = {
  miles: number;
  stopCount: number;
  durationMinutes: number;
  country: string;
  totalCents: number;
  waitPerMinuteCents: number;
  rideCategory: string;
  lineItems: { label: string; cents: number }[];
  pickup: string;
  dropoff: string;
  stops: string[];
  routeLabel?: string;
  geometry?: number[][];
  routes?: RouteOption[];
};

function dollars(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function RouteSketch({ geometry }: { geometry?: number[][] }) {
  if (!geometry || geometry.length < 2) return null;
  const lons = geometry.map((pair) => pair[0]);
  const lats = geometry.map((pair) => pair[1]);
  const minX = Math.min(...lons);
  const maxX = Math.max(...lons);
  const minY = Math.min(...lats);
  const maxY = Math.max(...lats);
  const w = 280;
  const h = 90;
  const pad = 8;
  const sx = (x: number) => pad + ((x - minX) / (maxX - minX || 1)) * (w - pad * 2);
  const sy = (y: number) => h - pad - ((y - minY) / (maxY - minY || 1)) * (h - pad * 2);
  const d = geometry
    .map((pair, index) => `${index ? 'L' : 'M'}${sx(pair[0]).toFixed(1)} ${sy(pair[1]).toFixed(1)}`)
    .join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-20 bg-black/60 mt-3" aria-hidden>
      <path d={d} fill="none" stroke="#D4AF37" strokeWidth="2.5" />
    </svg>
  );
}

function toQuote(json: any, pickup: string, dropoff: string, stops: string[], route: RouteOption): QuoteResult {
  return {
    miles: route.miles,
    stopCount: route.quote.stopCount,
    durationMinutes: route.durationMinutes,
    country: json.country,
    totalCents: route.quote.totalCents,
    waitPerMinuteCents: route.quote.waitPerMinuteCents,
    rideCategory: route.quote.rideCategory,
    lineItems: route.quote.lineItems,
    pickup,
    dropoff,
    stops,
    routeLabel: route.label,
    geometry: route.geometry,
    routes: json.routes,
  };
}

interface TripQuoteProps {
  pickup: string;
  dropoff: string;
  stops: string[];
  rideCategory: string;
  onChange: (fields: { pickup?: string; dropoff?: string; stops?: string[]; rideCategory?: string }) => void;
  onQuote: (quote: QuoteResult | null) => void;
  quote: QuoteResult | null;
}

export default function TripQuote({
  pickup,
  dropoff,
  stops,
  rideCategory,
  onChange,
  onQuote,
  quote,
}: TripQuoteProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stopDraft, setStopDraft] = useState('');
  const [routes, setRoutes] = useState<RouteOption[]>([]);

  async function getQuote() {
    setBusy(true);
    setError(null);
    onQuote(null);
    setRoutes([]);
    try {
      const res = await fetch(apiUrl('/api/quote'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pickup, dropoff, stops, rideCategory }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || 'Could not calculate miles');
      }
      const nextRoutes: RouteOption[] = Array.isArray(json.routes) && json.routes.length
        ? json.routes
        : json.quote
          ? [
              {
                id: 0,
                label: 'Fastest route',
                miles: json.quote.miles,
                durationMinutes: json.durationMinutes,
                quote: json.quote,
              },
            ]
          : [];
      if (!nextRoutes[0]?.quote) {
        throw new Error('Could not calculate miles for those addresses');
      }
      setRoutes(nextRoutes);
      onQuote(toQuote(json, pickup, dropoff, stops, nextRoutes[0]));
    } catch (err: any) {
      setError(err.message || 'Could not calculate miles');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-gray-300 mb-2">Who is riding? *</label>
        <select
          value={rideCategory}
          onChange={(e) => {
            onQuote(null);
            setRoutes([]);
            onChange({ rideCategory: e.target.value });
          }}
          className="w-full bg-black border border-[#D4AF37]/30 px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none"
        >
          {RIDE_CATEGORIES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
        {rideCategory !== 'regular' && (
          <p className="text-gray-500 text-sm mt-2">
            Non-emergency transport only. We are not an ambulance and do not provide urgent medical care.
          </p>
        )}
      </div>
      <div>
        <label className="block text-gray-300 mb-2 flex items-center gap-2">
          <MapPin size={18} className="text-[#D4AF37]" />
          Pickup location *
        </label>
        <AddressField
          value={pickup}
          onChange={(next) => {
            onQuote(null);
            setRoutes([]);
            onChange({ pickup: next });
          }}
          required
          aria-label="Pickup location"
          placeholder="Start typing an address, hotel, or SFO"
        />
        <p className="text-gray-500 text-sm mt-2">
          California addresses, airports, and hotels appear as you type. You can still enter any street address.
        </p>
      </div>
      {stops.map((stop, index) => (
        <div key={`stop-${index}`}>
          <label className="block text-gray-300 mb-2">Stop {index + 1}</label>
          <div className="flex gap-2 items-start">
            <AddressField
              className="flex-1"
              value={stop}
              onChange={(nextValue) => {
                const next = [...stops];
                next[index] = nextValue;
                onQuote(null);
                setRoutes([]);
                onChange({ stops: next });
              }}
              aria-label={`Stop ${index + 1}`}
              placeholder="Stop address"
            />
            <button
              type="button"
              className="px-3 border border-[#D4AF37] text-[#D4AF37]"
              onClick={() => {
                onQuote(null);
                setRoutes([]);
                onChange({ stops: stops.filter((_, i) => i !== index) });
              }}
            >
              Remove
            </button>
          </div>
        </div>
      ))}
      <div className="flex gap-2">
        <AddressField
          className="flex-1"
          value={stopDraft}
          onChange={setStopDraft}
          aria-label="Add a stop"
          placeholder="Add a stop on the way (optional)"
        />
        <button
          type="button"
          className="px-4 border border-[#D4AF37] text-[#D4AF37] whitespace-nowrap"
          onClick={() => {
            if (!stopDraft.trim()) return;
            onQuote(null);
            setRoutes([]);
            onChange({ stops: [...stops, stopDraft.trim()] });
            setStopDraft('');
          }}
        >
          Add stop
        </button>
      </div>
      <div>
        <label className="block text-gray-300 mb-2 flex items-center gap-2">
          <MapPin size={18} className="text-[#D4AF37]" />
          Drop-off location *
        </label>
        <AddressField
          value={dropoff}
          onChange={(next) => {
            onQuote(null);
            setRoutes([]);
            onChange({ dropoff: next });
          }}
          required
          aria-label="Drop-off location"
          placeholder="Start typing the drop-off address"
        />
      </div>
      <button
        type="button"
        onClick={getQuote}
        disabled={busy || !pickup || !dropoff}
        className="px-6 py-3 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black disabled:opacity-50"
      >
        {busy ? 'CALCULATING MILES…' : 'CALCULATE MILES AND PRICE'}
      </button>
      {!quote && !busy && (
        <p className="text-gray-500 text-sm">This looks up driving miles and shows a price before you send the request.</p>
      )}
      {error && <p className="text-red-300">{error}</p>}
      {routes.length > 1 && quote && (
        <div>
          <p className="text-gray-300 mb-3">Choose a route. Price follows the miles for that path.</p>
          <div className="grid gap-3 md:grid-cols-2">
            {routes.map((route) => {
              const selected = quote.routeLabel === route.label && quote.miles === route.miles;
              return (
                <button
                  key={`${route.label}-${route.miles}`}
                  type="button"
                  onClick={() =>
                    onQuote({
                      ...quote,
                      miles: route.miles,
                      durationMinutes: route.durationMinutes,
                      totalCents: route.quote.totalCents,
                      lineItems: route.quote.lineItems,
                      routeLabel: route.label,
                      geometry: route.geometry,
                    })
                  }
                  className={`text-left p-4 border ${
                    selected ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-[#D4AF37]/30 hover:border-[#D4AF37]'
                  }`}
                >
                  <p className="text-[#D4AF37]">{route.label}</p>
                  <p className="text-white text-lg mt-1">
                    {route.miles} miles · about {route.durationMinutes} min
                  </p>
                  <p className="text-white">{dollars(route.quote.totalCents)}</p>
                  <RouteSketch geometry={route.geometry} />
                </button>
              );
            })}
          </div>
        </div>
      )}
      {quote && (
        <div className="border border-[#D4AF37] p-5">
          <p className="text-[#D4AF37] mb-3">
            {quote.routeLabel ? `${quote.routeLabel} · ` : ''}
            {quote.miles} miles · about {quote.durationMinutes} min · {quote.country} rates
          </p>
          {routes.length <= 1 && <RouteSketch geometry={quote.geometry} />}
          <ul className="text-gray-300 space-y-1 mb-3">
            {quote.lineItems.map((item) => (
              <li key={item.label} className="flex justify-between gap-4">
                <span>{item.label}</span>
                <span>{dollars(item.cents)}</span>
              </li>
            ))}
          </ul>
          <p className="text-2xl text-white">Total {dollars(quote.totalCents)}</p>
          <p className="text-gray-500 text-sm mt-2">
            Staff must accept this quote. The booking is confirmed after you pay on Stripe.
          </p>
        </div>
      )}
    </div>
  );
}
