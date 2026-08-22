import { useEffect, useState } from 'react';
import { Calendar, Clock, Car, User, Mail, Phone, Plane, Minus, Plus } from 'lucide-react';
import { AIRPORTS, COMPANY, SERVICE_TYPES, VEHICLE_OPTIONS } from '@/config/company';
import { sendLead } from '@/utils/sendLead';
import { getClientEmail, getClientProfilePrefill, hasClientSession } from '@/utils/clientSession';
import TripQuote, { QuoteResult } from '@/components/TripQuote';
import DatePicker, { formatPickupDate } from '@/components/DatePicker';
import TimePicker, { formatPickupTime } from '@/components/TimePicker';

const fieldClass =
  'w-full bg-black border border-[#D4AF37]/30 px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors';

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length < 4) return digits;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function isAirportAddress(value: string) {
  return AIRPORTS.some((airport) => airport.address === value);
}

export default function BookOnline() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    serviceType: 'airport',
    airport: '',
    airportDirection: 'from' as 'from' | 'to',
    flightNumber: '',
    pickupLocation: '',
    dropoffLocation: '',
    rideCategory: 'regular',
    vehicleType: '',
    passengers: 1,
    specialRequests: '',
  });
  const [honeypot, setHoneypot] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ date?: string; time?: string; vehicle?: string }>({});
  const [stops, setStops] = useState<string[]>([]);
  const [quote, setQuote] = useState<QuoteResult | null>(null);

  useEffect(() => {
    const query = window.location.hash.split('?')[1] || window.location.search.replace(/^\?/, '');
    const params = new URLSearchParams(query);
    const airport = params.get('airport') || '';
    const service = params.get('service') || '';
    const prefill = getClientProfilePrefill();
    setFormData((prev) => ({
      ...prev,
      airport: AIRPORTS.some((item) => item.id === airport) ? airport : prev.airport,
      serviceType: SERVICE_TYPES.some((item) => item.id === service)
        ? service
        : airport
          ? 'airport'
          : prev.serviceType,
      fullName: prev.fullName || prefill.name || '',
      email: prev.email || getClientEmail() || '',
      phone: prev.phone || prefill.phone || '',
    }));
  }, []);

  const selectedVehicle = VEHICLE_OPTIONS.find((vehicle) => vehicle.name === formData.vehicleType);
  const maxPassengers = selectedVehicle?.seats ?? 7;

  function applyAirportAddress(next: {
    airport?: string;
    airportDirection?: 'from' | 'to';
    serviceType?: string;
  }) {
    const airportId = next.airport ?? formData.airport;
    const direction = next.airportDirection ?? formData.airportDirection;
    const serviceType = next.serviceType ?? formData.serviceType;
    const airport = AIRPORTS.find((item) => item.id === airportId);
    if (serviceType !== 'airport' || !airport) return {};

    const updates: Partial<typeof formData> = {};
    if (direction === 'from') {
      if (!formData.pickupLocation || isAirportAddress(formData.pickupLocation)) {
        updates.pickupLocation = airport.address;
      }
      if (isAirportAddress(formData.dropoffLocation)) {
        updates.dropoffLocation = '';
      }
    } else {
      if (!formData.dropoffLocation || isAirportAddress(formData.dropoffLocation)) {
        updates.dropoffLocation = airport.address;
      }
      if (isAirportAddress(formData.pickupLocation)) {
        updates.pickupLocation = '';
      }
    }
    if (Object.keys(updates).length) setQuote(null);
    return updates;
  }

  function updateForm(patch: Partial<typeof formData>) {
    const airportPatch =
      patch.airport !== undefined || patch.airportDirection !== undefined || patch.serviceType !== undefined
        ? applyAirportAddress(patch)
        : {};
    setFormData((prev) => ({ ...prev, ...patch, ...airportPatch }));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: typeof fieldErrors = {};
    if (!formData.date) nextErrors.date = 'Choose a date from the calendar.';
    if (!formData.time) nextErrors.time = 'Choose a pickup time.';
    if (!formData.vehicleType) nextErrors.vehicle = 'Tap a vehicle to select it.';
    setFieldErrors(nextErrors);
    if (nextErrors.date || nextErrors.time || nextErrors.vehicle) {
      setSendError('Please complete the highlighted fields.');
      return;
    }
    if (!quote) {
      setSendError('Calculate miles and price before submitting.');
      return;
    }
    setIsSending(true);
    setSendError(null);

    const serviceLabel = SERVICE_TYPES.find((item) => item.id === formData.serviceType)?.label || formData.serviceType;
    const airportLabel = selectedAirport?.label || formData.airport || 'N/A';
    const directionLabel =
      showAirportFields && formData.airportDirection === 'from' ? 'Pickup at airport' : 'Drop-off at airport';

    try {
      await sendLead({
        type: 'booking',
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        subject: 'Booking Request',
        honeypot,
        meta: {
          pickup: formData.pickupLocation,
          dropoff: formData.dropoffLocation,
          stops,
          date: formData.date,
          time: formData.time,
          service: serviceLabel,
          vehicle: formData.vehicleType,
          passengers: String(formData.passengers),
          airport: airportLabel,
          airportDirection: showAirportFields ? formData.airportDirection : '',
          flight: formData.flightNumber,
          rideCategory: quote.rideCategory,
          miles: String(quote.miles),
          quoteCents: quote.totalCents,
          waitPerMinuteCents: quote.waitPerMinuteCents,
          country: quote.country,
          lineItems: quote.lineItems,
          routeLabel: quote.routeLabel || '',
          durationMinutes: quote.durationMinutes,
          paymentStatus: 'unpaid',
        },
        message: `Booking details:
Name: ${formData.fullName}
Email: ${formData.email}
Phone: ${formData.phone}
Service: ${serviceLabel}
Airport: ${airportLabel}
Direction: ${showAirportFields ? directionLabel : 'N/A'}
Flight: ${formData.flightNumber || 'N/A'}
Date: ${formatPickupDate(formData.date)}
Time: ${formatPickupTime(formData.time)}
Pickup: ${formData.pickupLocation}
Stops: ${stops.join(' → ') || 'None'}
Dropoff: ${formData.dropoffLocation}
Miles: ${quote.miles}
Route: ${quote.routeLabel || 'Fastest route'}
Quote: $${(quote.totalCents / 100).toFixed(2)}
Passenger type: ${quote.rideCategory}
Vehicle: ${formData.vehicleType}
Passengers: ${formData.passengers}
Special Requests: ${formData.specialRequests || 'None'}`,
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          fullName: hasClientSession() ? formData.fullName : '',
          email: hasClientSession() ? formData.email : '',
          phone: hasClientSession() ? formData.phone : '',
          date: '',
          time: '',
          serviceType: 'airport',
          airport: '',
          airportDirection: 'from',
          flightNumber: '',
          pickupLocation: '',
          dropoffLocation: '',
          rideCategory: 'regular',
          vehicleType: '',
          passengers: 1,
          specialRequests: '',
        });
        setStops([]);
        setQuote(null);
        setFieldErrors({});
      }, 4000);
    } catch (err: any) {
      setSendError(err?.message || 'Failed to submit booking request');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-20" style={{ colorScheme: 'dark' }}>
      <section className="py-16 px-4 text-center">
        <h1 className="text-5xl md:text-6xl mb-6 text-[#D4AF37]">Book Online</h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Choose a date from the calendar, tell us where to go, and we will confirm your chauffeur.
        </p>
        <p className="text-gray-400 mt-4">
          Same-day trips:{' '}
          <a href={`tel:${COMPANY.phoneTel}`} className="text-[#D4AF37] hover:underline">
            {COMPANY.phoneDisplay}
          </a>
        </p>
      </section>

      <section className="px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-b from-[#1a1a1a] to-black border border-[#D4AF37]/20 p-6 md:p-12">
            {submitted ? (
              <div className="text-center py-12">
                <div className="text-[#D4AF37] text-6xl mb-6">✓</div>
                <h2 className="text-3xl mb-4 text-[#D4AF37]">Booking Request Received</h2>
                <p className="text-gray-300 text-xl">
                  Thank you. We will confirm shortly. For same-day travel call {COMPANY.phoneDisplay}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="als_hp"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  autoComplete="off"
                  data-lpignore="true"
                  tabIndex={-1}
                  aria-hidden="true"
                  className="absolute -left-[9999px] w-px h-px overflow-hidden"
                />
                {sendError && (
                  <div className="mb-6 p-3 bg-red-600 text-white">
                    <strong>Error:</strong> {sendError}
                  </div>
                )}

                <div className="mb-10">
                  <h2 className="text-2xl mb-2 text-[#D4AF37]">1. What do you need?</h2>
                  <p className="text-gray-400 mb-5">Tap a service. You can change this later.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SERVICE_TYPES.map((service) => {
                      const selected = formData.serviceType === service.id;
                      return (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => updateForm({ serviceType: service.id })}
                          className={`text-left px-4 py-4 border transition-colors ${
                            selected
                              ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-white'
                              : 'border-[#D4AF37]/25 text-gray-300 hover:border-[#D4AF37]'
                          }`}
                        >
                          <span className="block text-[#D4AF37]">{service.label}</span>
                          <span className="block text-sm text-gray-400 mt-1">{service.hint}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mb-10">
                  <h2 className="text-2xl mb-2 text-[#D4AF37]">2. When should we pick you up?</h2>
                  <p className="text-gray-400 mb-5">Open the calendar, then pick a time. Past dates are turned off.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-300 mb-2 flex items-center gap-2">
                        <Calendar size={18} className="text-[#D4AF37]" />
                        Pickup date *
                      </label>
                      <DatePicker
                        value={formData.date}
                        onChange={(date) => {
                          setFieldErrors((prev) => ({ ...prev, date: undefined }));
                          updateForm({ date });
                        }}
                        error={fieldErrors.date}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2 flex items-center gap-2">
                        <Clock size={18} className="text-[#D4AF37]" />
                        Pickup time *
                      </label>
                      <TimePicker
                        value={formData.time}
                        onChange={(time) => {
                          setFieldErrors((prev) => ({ ...prev, time: undefined }));
                          updateForm({ time });
                        }}
                        error={fieldErrors.time}
                      />
                    </div>
                  </div>
                </div>

                {showAirportFields && (
                  <div className="mb-10">
                    <h2 className="text-2xl mb-2 text-[#D4AF37]">Airport details</h2>
                    <p className="text-gray-400 mb-5">We will fill the airport address for you. Add the other stop next.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                      {[
                        { id: 'from' as const, label: 'Coming from the airport', hint: 'We pick you up at arrivals' },
                        { id: 'to' as const, label: 'Going to the airport', hint: 'We drop you at departures' },
                      ].map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => updateForm({ airportDirection: option.id })}
                          className={`text-left px-4 py-4 border ${
                            formData.airportDirection === option.id
                              ? 'border-[#D4AF37] bg-[#D4AF37]/15'
                              : 'border-[#D4AF37]/25 hover:border-[#D4AF37]'
                          }`}
                        >
                          <span className="block text-[#D4AF37]">{option.label}</span>
                          <span className="block text-sm text-gray-400 mt-1">{option.hint}</span>
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-gray-300 mb-2 flex items-center gap-2">
                          <Plane size={18} className="text-[#D4AF37]" />
                          Airport *
                        </label>
                        <select
                          name="airport"
                          value={formData.airport}
                          onChange={(e) => updateForm({ airport: e.target.value })}
                          required={showAirportFields}
                          className={fieldClass}
                        >
                          <option value="">Select airport</option>
                          {AIRPORTS.map((airport) => (
                            <option key={airport.id} value={airport.id}>
                              {airport.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-2">Flight number (optional)</label>
                        <input
                          type="text"
                          name="flightNumber"
                          value={formData.flightNumber}
                          onChange={(e) => updateForm({ flightNumber: e.target.value.toUpperCase() })}
                          className={fieldClass}
                          placeholder="e.g. UA 123"
                          autoComplete="off"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="mb-10">
                  <h2 className="text-2xl mb-2 text-[#D4AF37]">3. Where are we going?</h2>
                  <p className="text-gray-400 mb-5">
                    Enter pickup and drop-off, then tap Calculate miles and price. Staff accept the quote before payment.
                  </p>
                  <TripQuote
                    pickup={formData.pickupLocation}
                    dropoff={formData.dropoffLocation}
                    stops={stops}
                    rideCategory={formData.rideCategory}
                    quote={quote}
                    onQuote={setQuote}
                    onChange={(fields) => {
                      setFormData((prev) => ({
                        ...prev,
                        pickupLocation: fields.pickup ?? prev.pickupLocation,
                        dropoffLocation: fields.dropoff ?? prev.dropoffLocation,
                        rideCategory: fields.rideCategory ?? prev.rideCategory,
                      }));
                      if (fields.stops) setStops(fields.stops);
                    }}
                  />
                </div>

                <div className="mb-10">
                  <h2 className="text-2xl mb-2 text-[#D4AF37]">4. Which vehicle?</h2>
                  <p className="text-gray-400 mb-5">Tap a car. Seats are a guide — tell us if you have extra luggage.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    {VEHICLE_OPTIONS.map((vehicle) => {
                      const selected = formData.vehicleType === vehicle.name;
                      return (
                        <button
                          key={vehicle.name}
                          type="button"
                          onClick={() => {
                            setFieldErrors((prev) => ({ ...prev, vehicle: undefined }));
                            updateForm({
                              vehicleType: vehicle.name,
                              passengers: Math.min(formData.passengers, vehicle.seats),
                            });
                          }}
                          className={`text-left px-4 py-4 border flex items-start gap-3 ${
                            selected
                              ? 'border-[#D4AF37] bg-[#D4AF37]/15'
                              : 'border-[#D4AF37]/25 hover:border-[#D4AF37]'
                          }`}
                        >
                          <Car size={20} className="text-[#D4AF37] mt-0.5 shrink-0" />
                          <span>
                            <span className="block text-white">{vehicle.name}</span>
                            <span className="block text-sm text-gray-400 mt-1">
                              {vehicle.kind} · up to {vehicle.seats} passengers
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {fieldErrors.vehicle && <p className="text-red-400 text-sm mb-4">{fieldErrors.vehicle}</p>}
                  <label className="block text-gray-300 mb-2 flex items-center gap-2">
                    <User size={18} className="text-[#D4AF37]" />
                    Number of passengers *
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      aria-label="Fewer passengers"
                      className="w-12 h-12 border border-[#D4AF37] text-[#D4AF37] flex items-center justify-center hover:bg-[#D4AF37] hover:text-black"
                      onClick={() => updateForm({ passengers: Math.max(1, formData.passengers - 1) })}
                    >
                      <Minus size={18} />
                    </button>
                    <span className="text-xl min-w-[4rem] text-center">{formData.passengers}</span>
                    <button
                      type="button"
                      aria-label="More passengers"
                      className="w-12 h-12 border border-[#D4AF37] text-[#D4AF37] flex items-center justify-center hover:bg-[#D4AF37] hover:text-black"
                      onClick={() => updateForm({ passengers: Math.min(maxPassengers, formData.passengers + 1) })}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                <div className="mb-10">
                  <h2 className="text-2xl mb-2 text-[#D4AF37]">5. How can we reach you?</h2>
                  <p className="text-gray-400 mb-5">We confirm by phone or email, usually within two hours.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-300 mb-2 flex items-center gap-2">
                        <User size={18} className="text-[#D4AF37]" />
                        Full name *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={(e) => updateForm({ fullName: e.target.value })}
                        required
                        autoComplete="name"
                        className={fieldClass}
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2 flex items-center gap-2">
                        <Phone size={18} className="text-[#D4AF37]" />
                        Mobile number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={(e) => updateForm({ phone: formatPhone(e.target.value) })}
                        required
                        autoComplete="tel"
                        inputMode="tel"
                        className={fieldClass}
                        placeholder="(408) 555-1234"
                      />
                    </div>
                  </div>
                  <div className="mt-6">
                    <label className="block text-gray-300 mb-2 flex items-center gap-2">
                      <Mail size={18} className="text-[#D4AF37]" />
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={(e) => updateForm({ email: e.target.value })}
                      required
                      autoComplete="email"
                      className={fieldClass}
                      placeholder="you@example.com"
                    />
                  </div>
                  <div className="mt-6">
                    <label className="block text-gray-300 mb-2">Notes (child seats, meet & greet, extra luggage)</label>
                    <textarea
                      name="specialRequests"
                      value={formData.specialRequests}
                      onChange={(e) => updateForm({ specialRequests: e.target.value })}
                      rows={3}
                      className={`${fieldClass} resize-none`}
                      placeholder="Anything we should know"
                    />
                  </div>
                </div>

                {(formData.date || formData.time || formData.vehicleType || quote) && (
                  <div className="mb-8 border border-[#D4AF37]/40 p-5 bg-black/40">
                    <h3 className="text-[#D4AF37] mb-3">Your trip</h3>
                    <ul className="text-gray-300 space-y-1">
                      {formData.date && (
                        <li>
                          {formatPickupDate(formData.date)}
                          {formData.time ? ` at ${formatPickupTime(formData.time)}` : ''}
                        </li>
                      )}
                      {formData.pickupLocation && <li>From {formData.pickupLocation}</li>}
                      {formData.dropoffLocation && <li>To {formData.dropoffLocation}</li>}
                      {formData.vehicleType && (
                        <li>
                          {formData.vehicleType} · {formData.passengers} passenger
                          {formData.passengers === 1 ? '' : 's'}
                        </li>
                      )}
                      {quote && <li>Quoted ${(quote.totalCents / 100).toFixed(2)} · {quote.miles} miles</li>}
                    </ul>
                  </div>
                )}

                <div className="text-center">
                  <button
                    type="submit"
                    disabled={isSending}
                    className={`px-12 py-4 ${isSending ? 'opacity-60 cursor-not-allowed' : 'bg-[#D4AF37] hover:bg-[#B4941F]'} text-black transition-all duration-300 tracking-wider`}
                  >
                    {isSending ? 'SENDING...' : 'SUBMIT BOOKING REQUEST'}
                  </button>
                  <p className="text-gray-400 mt-4 text-sm">
                    Required fields marked *. Booking is confirmed after staff accept and you pay.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-b from-black to-[#1a1a1a]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl text-center mb-16 text-[#D4AF37]">How booking works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-[#D4AF37] text-3xl mb-4">1</div>
              <h3 className="text-xl mb-3 text-[#D4AF37]">Request</h3>
              <p className="text-gray-400">Pick a date, time, route, and car. We price the trip by mile.</p>
            </div>
            <div className="text-center p-6">
              <div className="text-[#D4AF37] text-3xl mb-4">2</div>
              <h3 className="text-xl mb-3 text-[#D4AF37]">Confirm</h3>
              <p className="text-gray-400">
                We accept the quote and send a Stripe payment link. Call {COMPANY.phoneDisplay} for same-day trips.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-[#D4AF37] text-3xl mb-4">3</div>
              <h3 className="text-xl mb-3 text-[#D4AF37]">Ride</h3>
              <p className="text-gray-400">
                Your chauffeur arrives on time, with meet & greet at the airport when you ask.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
