import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { RIDE_CATEGORIES } from '@/config/company';
import { apiUrl } from '@/utils/siteUrl';

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
};

function dollars(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
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

  async function getQuote() {
    setBusy(true);
    setError(null);
    onQuote(null);
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
      onQuote({
        miles: json.quote.miles,
        stopCount: json.quote.stopCount,
        durationMinutes: json.durationMinutes,
        country: json.country,
        totalCents: json.quote.totalCents,
        waitPerMinuteCents: json.quote.waitPerMinuteCents,
        rideCategory: json.quote.rideCategory,
        lineItems: json.quote.lineItems,
        pickup,
        dropoff,
        stops,
      });
    } catch (err: any) {
      setError(err.message || 'Could not calculate miles');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-gray-300 mb-2">Passenger type *</label>
        <select
          value={rideCategory}
          onChange={(e) => {
            onQuote(null);
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
        <input
          value={pickup}
          onChange={(e) => {
            onQuote(null);
            onChange({ pickup: e.target.value });
          }}
          required
          className="w-full bg-black border border-[#D4AF37]/30 px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none"
          placeholder="Street address, hotel, or terminal"
        />
      </div>
      {stops.map((stop, index) => (
        <div key={`${stop}-${index}`}>
          <label className="block text-gray-300 mb-2">Stop {index + 1}</label>
          <div className="flex gap-2">
            <input
              value={stop}
              onChange={(e) => {
                const next = [...stops];
                next[index] = e.target.value;
                onQuote(null);
                onChange({ stops: next });
              }}
              className="flex-1 bg-black border border-[#D4AF37]/30 px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none"
            />
            <button
              type="button"
              className="px-3 border border-[#D4AF37] text-[#D4AF37]"
              onClick={() => {
                onQuote(null);
                onChange({ stops: stops.filter((_, i) => i !== index) });
              }}
            >
              Remove
            </button>
          </div>
        </div>
      ))}
      <div className="flex gap-2">
        <input
          value={stopDraft}
          onChange={(e) => setStopDraft(e.target.value)}
          className="flex-1 bg-black border border-[#D4AF37]/30 px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none"
          placeholder="Add a stop (optional)"
        />
        <button
          type="button"
          className="px-4 border border-[#D4AF37] text-[#D4AF37]"
          onClick={() => {
            if (!stopDraft.trim()) return;
            onQuote(null);
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
        <input
          value={dropoff}
          onChange={(e) => {
            onQuote(null);
            onChange({ dropoff: e.target.value });
          }}
          required
          className="w-full bg-black border border-[#D4AF37]/30 px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none"
          placeholder="Destination address"
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
      {error && <p className="text-red-300">{error}</p>}
      {quote && (
        <div className="border border-[#D4AF37] p-5">
          <p className="text-[#D4AF37] mb-3">
            {quote.miles} miles · about {quote.durationMinutes} min · {quote.country} rates
          </p>
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
