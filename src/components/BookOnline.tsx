import { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, Car, User, Mail, Phone, Plane } from 'lucide-react';
import { AIRPORTS, COMPANY, SERVICE_TYPES, VEHICLE_TYPES } from '@/config/company';
import { sendLead } from '@/utils/sendLead';

export default function BookOnline() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    serviceType: 'point-to-point',
    airport: '',
    flightNumber: '',
    pickupLocation: '',
    dropoffLocation: '',
    vehicleType: '',
    passengers: '1',
    specialRequests: '',
  });
  const [honeypot, setHoneypot] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  useEffect(() => {
    const query = window.location.hash.split('?')[1] || window.location.search.replace(/^\?/, '');
    const params = new URLSearchParams(query);
    const airport = params.get('airport') || '';
    const service = params.get('service') || '';
    setFormData((prev) => ({
      ...prev,
      airport: AIRPORTS.some((item) => item.id === airport) ? airport : prev.airport,
      serviceType: SERVICE_TYPES.some((item) => item.id === service) ? service : airport ? 'airport' : prev.serviceType,
    }));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setSendError(null);

    const serviceLabel = SERVICE_TYPES.find((item) => item.id === formData.serviceType)?.label || formData.serviceType;
    const airportLabel = AIRPORTS.find((item) => item.id === formData.airport)?.label || formData.airport || 'N/A';

    try {
      await sendLead({
        type: 'booking',
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        subject: 'Booking Request',
        honeypot,
        message: `Booking details:
Name: ${formData.fullName}
Email: ${formData.email}
Phone: ${formData.phone}
Service: ${serviceLabel}
Airport: ${airportLabel}
Flight: ${formData.flightNumber || 'N/A'}
Date: ${formData.date}
Time: ${formData.time}
Pickup: ${formData.pickupLocation}
Dropoff: ${formData.dropoffLocation}
Vehicle: ${formData.vehicleType}
Passengers: ${formData.passengers}
Special Requests: ${formData.specialRequests || 'None'}`,
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          date: '',
          time: '',
          serviceType: 'point-to-point',
          airport: '',
          flightNumber: '',
          pickupLocation: '',
          dropoffLocation: '',
          vehicleType: '',
          passengers: '1',
          specialRequests: '',
        });
      }, 4000);
    } catch (err: any) {
      setSendError(err?.message || 'Failed to submit booking request');
    } finally {
      setIsSending(false);
    }
  };

  const showAirportFields = formData.serviceType === 'airport';

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <section className="py-20 px-4 text-center">
        <h1 className="text-5xl md:text-6xl mb-6 text-[#D4AF37]">Book Online</h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Reserve your luxury vehicle in minutes. We serve SFO, SJC, Oakland, and the greater Bay Area from Burlingame.
        </p>
      </section>

      <section className="px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-b from-[#1a1a1a] to-black border border-[#D4AF37]/20 p-8 md:p-12">
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
                  <div className="mb-4 p-3 bg-red-600 text-white rounded">
                    <strong>Error:</strong> {sendError}
                  </div>
                )}
                <div className="mb-8">
                  <h2 className="text-2xl mb-6 text-[#D4AF37] border-b border-[#D4AF37]/20 pb-3">
                    Personal Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-300 mb-2 flex items-center gap-2">
                        <User size={18} className="text-[#D4AF37]" />
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        className="w-full bg-black border border-[#D4AF37]/30 px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2 flex items-center gap-2">
                        <Mail size={18} className="text-[#D4AF37]" />
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full bg-black border border-[#D4AF37]/30 px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>
                  <div className="mt-6">
                    <label className="block text-gray-300 mb-2 flex items-center gap-2">
                      <Phone size={18} className="text-[#D4AF37]" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full bg-black border border-[#D4AF37]/30 px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors"
                      placeholder={COMPANY.phoneDisplay}
                    />
                  </div>
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl mb-6 text-[#D4AF37] border-b border-[#D4AF37]/20 pb-3">
                    Trip Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-300 mb-2">Service Type *</label>
                      <select
                        name="serviceType"
                        value={formData.serviceType}
                        onChange={handleChange}
                        required
                        className="w-full bg-black border border-[#D4AF37]/30 px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors"
                      >
                        {SERVICE_TYPES.map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2 flex items-center gap-2">
                        <Calendar size={18} className="text-[#D4AF37]" />
                        Date *
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                        className="w-full bg-black border border-[#D4AF37]/30 px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2 flex items-center gap-2">
                        <Clock size={18} className="text-[#D4AF37]" />
                        Time *
                      </label>
                      <input
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        required
                        className="w-full bg-black border border-[#D4AF37]/30 px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors"
                      />
                    </div>
                    {showAirportFields && (
                      <>
                        <div>
                          <label className="block text-gray-300 mb-2 flex items-center gap-2">
                            <Plane size={18} className="text-[#D4AF37]" />
                            Airport *
                          </label>
                          <select
                            name="airport"
                            value={formData.airport}
                            onChange={handleChange}
                            required={showAirportFields}
                            className="w-full bg-black border border-[#D4AF37]/30 px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors"
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
                          <label className="block text-gray-300 mb-2">Flight Number</label>
                          <input
                            type="text"
                            name="flightNumber"
                            value={formData.flightNumber}
                            onChange={handleChange}
                            className="w-full bg-black border border-[#D4AF37]/30 px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors"
                            placeholder="e.g. UA 123"
                          />
                        </div>
                      </>
                    )}
                  </div>
                  <div className="mt-6">
                    <label className="block text-gray-300 mb-2 flex items-center gap-2">
                      <MapPin size={18} className="text-[#D4AF37]" />
                      Pickup Location *
                    </label>
                    <input
                      type="text"
                      name="pickupLocation"
                      value={formData.pickupLocation}
                      onChange={handleChange}
                      required
                      className="w-full bg-black border border-[#D4AF37]/30 px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors"
                      placeholder="Street address, hotel, or terminal"
                    />
                  </div>
                  <div className="mt-6">
                    <label className="block text-gray-300 mb-2 flex items-center gap-2">
                      <MapPin size={18} className="text-[#D4AF37]" />
                      Dropoff Location *
                    </label>
                    <input
                      type="text"
                      name="dropoffLocation"
                      value={formData.dropoffLocation}
                      onChange={handleChange}
                      required
                      className="w-full bg-black border border-[#D4AF37]/30 px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors"
                      placeholder="Destination address"
                    />
                  </div>
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl mb-6 text-[#D4AF37] border-b border-[#D4AF37]/20 pb-3">
                    Vehicle Selection
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-300 mb-2 flex items-center gap-2">
                        <Car size={18} className="text-[#D4AF37]" />
                        Vehicle Type *
                      </label>
                      <select
                        name="vehicleType"
                        value={formData.vehicleType}
                        onChange={handleChange}
                        required
                        className="w-full bg-black border border-[#D4AF37]/30 px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors"
                      >
                        <option value="">Select a vehicle</option>
                        {VEHICLE_TYPES.map((vehicle) => (
                          <option key={vehicle} value={vehicle}>
                            {vehicle}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2 flex items-center gap-2">
                        <User size={18} className="text-[#D4AF37]" />
                        Number of Passengers *
                      </label>
                      <select
                        name="passengers"
                        value={formData.passengers}
                        onChange={handleChange}
                        required
                        className="w-full bg-black border border-[#D4AF37]/30 px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors"
                      >
                        {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                          <option key={num} value={num}>
                            {num} {num === 1 ? 'Passenger' : 'Passengers'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <label className="block text-gray-300 mb-2">Special Requests or Notes</label>
                  <textarea
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleChange}
                    rows={4}
                    className="w-full bg-black border border-[#D4AF37]/30 px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors resize-none"
                    placeholder="Child seats, extra stops, meet & greet, or other notes"
                  />
                </div>

                <div className="text-center">
                  <button
                    type="submit"
                    disabled={isSending}
                    className={`px-16 py-4 ${isSending ? 'opacity-60 cursor-not-allowed' : 'bg-[#D4AF37] hover:bg-[#B4941F]'} text-black transition-all duration-300 tracking-wider`}
                  >
                    {isSending ? 'SENDING...' : 'SUBMIT BOOKING REQUEST'}
                  </button>
                  <p className="text-gray-400 mt-4 text-sm">
                    Required fields marked *. We confirm by phone or email, usually within two hours.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-b from-black to-[#1a1a1a]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl text-center mb-16 text-[#D4AF37]">Booking Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-[#D4AF37] text-3xl mb-4">1</div>
              <h3 className="text-xl mb-3 text-[#D4AF37]">Submit Request</h3>
              <p className="text-gray-400">
                Tell us the service type, times, and vehicle. Airport transfers can include flight number and terminal.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-[#D4AF37] text-3xl mb-4">2</div>
              <h3 className="text-xl mb-3 text-[#D4AF37]">Confirmation</h3>
              <p className="text-gray-400">
                We confirm availability, quote, and chauffeur details. Call {COMPANY.phoneDisplay} for same-day trips.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-[#D4AF37] text-3xl mb-4">3</div>
              <h3 className="text-xl mb-3 text-[#D4AF37]">Enjoy Your Ride</h3>
              <p className="text-gray-400">
                Your chauffeur arrives on time with meet & greet for airport arrivals when requested.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
