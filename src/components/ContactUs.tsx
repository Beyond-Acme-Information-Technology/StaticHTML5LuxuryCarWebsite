import { useEffect, useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import { COMPANY, CONTACT_SUBJECTS, FULL_ADDRESS, MAPS_EMBED_SRC } from '@/config/company';
import { sendLead } from '@/utils/sendLead';
import { getClientEmail, getClientProfilePrefill } from '@/utils/clientSession';
import TripQuote, { QuoteResult } from '@/components/TripQuote';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'booking',
    message: '',
    pickup: '',
    dropoff: '',
    rideCategory: 'regular',
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState('');
  const [stops, setStops] = useState<string[]>([]);
  const [quote, setQuote] = useState<QuoteResult | null>(null);

  useEffect(() => {
    const prefill = getClientProfilePrefill();
    setFormData((prev) => ({
      ...prev,
      name: prev.name || prefill.name || '',
      email: prev.email || getClientEmail() || '',
      phone: prev.phone || prefill.phone || '',
    }));
  }, []);

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!quote) {
      setSendError('Calculate miles and price from pickup and drop-off before sending.');
      return;
    }
    setIsSending(true);
    setSendError(null);

    try {
      await sendLead({
        type: formData.subject === 'feedback' ? 'contact' : 'booking',
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: `${formData.message}

Pickup: ${quote.pickup}
Stops: ${quote.stops.join(' → ') || 'None'}
Dropoff: ${quote.dropoff}
Miles: ${quote.miles}
Quote: $${(quote.totalCents / 100).toFixed(2)}
Passenger type: ${quote.rideCategory}`,
        honeypot,
        meta: {
          pickup: quote.pickup,
          dropoff: quote.dropoff,
          stops: quote.stops,
          rideCategory: quote.rideCategory,
          miles: quote.miles,
          quoteCents: quote.totalCents,
          waitPerMinuteCents: quote.waitPerMinuteCents,
          country: quote.country,
          lineItems: quote.lineItems,
          paymentStatus: 'unpaid',
        },
      });

      setSubmitted(true);

      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: 'booking',
          message: '',
          pickup: '',
          dropoff: '',
          rideCategory: 'regular',
        });
        setStops([]);
        setQuote(null);
      }, 4000);
    } catch (err: any) {
      console.error('Send failed', err);
      setSendError(err?.message || 'Send failed');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      {/* Header */}
      <section className="py-20 px-4 text-center">
        <h1 className="text-5xl md:text-6xl mb-6 text-[#D4AF37]">Contact Us</h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Get in touch with our team. We're here to assist you 24/7 with all your luxury transportation needs.
        </p>
      </section>

      {/* Contact Info & Form */}
      <section className="px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="text-3xl mb-8 text-[#D4AF37]">Get In Touch</h2>

              <div className="space-y-8">
                {/* Phone */}
                <div className="flex items-start gap-4 p-6 bg-gradient-to-br from-[#1a1a1a] to-black border border-[#D4AF37]/20">
                  <div className="text-[#D4AF37] mt-1">
                    <Phone size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl mb-2 text-[#D4AF37]">Phone</h3>
                    <p className="text-gray-300 mb-1">
                      <a href={`tel:${COMPANY.phoneTel}`} className="hover:text-[#D4AF37]">{COMPANY.phoneDisplay}</a>
                    </p>
                    <p className="text-gray-400 text-sm">Available 24/7 for reservations</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4 p-6 bg-gradient-to-br from-[#1a1a1a] to-black border border-[#D4AF37]/20">
                  <div className="text-[#D4AF37] mt-1">
                    <Mail size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl mb-2 text-[#D4AF37]">Email</h3>
                    <p className="text-gray-300 mb-1">
                      <a href={`mailto:${COMPANY.email}`} className="hover:text-[#D4AF37]">{COMPANY.email}</a>
                    </p>
                    <p className="text-gray-400 text-sm">We respond within 2 hours during office hours</p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-4 p-6 bg-gradient-to-br from-[#1a1a1a] to-black border border-[#D4AF37]/20">
                  <div className="text-[#D4AF37] mt-1">
                    <MapPin size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl mb-2 text-[#D4AF37]">Location</h3>
                    <p className="text-gray-300 mb-1">{COMPANY.addressLine1}</p>
                    <p className="text-gray-300 mb-1">{COMPANY.addressLine2}</p>
                    <p className="text-gray-300">{COMPANY.country}</p>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-start gap-4 p-6 bg-gradient-to-br from-[#1a1a1a] to-black border border-[#D4AF37]/20">
                  <div className="text-[#D4AF37] mt-1">
                    <Clock size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl mb-2 text-[#D4AF37]">Business Hours</h3>
                    <p className="text-gray-300 mb-1">{COMPANY.serviceHours}</p>
                    <p className="text-gray-400 text-sm">{COMPANY.officeHours}</p>
                    <p className="text-gray-400 text-sm">After-hours support available</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-3xl mb-8 text-[#D4AF37]">Send Us A Message</h2>

              <div className="bg-gradient-to-b from-[#1a1a1a] to-black border border-[#D4AF37]/20 p-8">
                {submitted ? (
                  <div className="text-center py-12">
                    <div className="text-[#D4AF37] text-6xl mb-6">✓</div>
                    <h3 className="text-2xl mb-4 text-[#D4AF37]">Message Sent!</h3>
                    <p className="text-gray-300">
                      Thank you for contacting us. We will respond as soon as possible.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    {/* Honeypot field to deter bots (visually hidden) */}
                    <input
                      type="text"
                      name="als_hp"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                      autoComplete="off"
                      data-lpignore="true"
                      tabIndex={-1}
                      aria-hidden="true"
                      style={{ position: 'absolute', left: '-9999px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden' }}
                    />
                    {sendError && (
                      <div className="mb-4 p-3 bg-red-600 text-white rounded">
                        <strong>Error:</strong> {sendError}
                      </div>
                    )}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-gray-300 mb-2">Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full bg-black border border-[#D4AF37]/30 px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors"
                          placeholder="Your name"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-300 mb-2">Email *</label>
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

                      <div>
                        <label className="block text-gray-300 mb-2">Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full bg-black border border-[#D4AF37]/30 px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors"
                          placeholder={COMPANY.phoneDisplay}
                        />
                      </div>

                      <div>
                        <label className="block text-gray-300 mb-2">Subject *</label>
                        <select
                          name="subject"
                          aria-label="Subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          className="w-full bg-black border border-[#D4AF37]/30 px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors"
                        >
                          <option value="">Select a subject</option>
                          {CONTACT_SUBJECTS.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <TripQuote
                        pickup={formData.pickup}
                        dropoff={formData.dropoff}
                        stops={stops}
                        rideCategory={formData.rideCategory}
                        quote={quote}
                        onQuote={setQuote}
                        onChange={(fields) => {
                          setFormData((prev) => ({
                            ...prev,
                            pickup: fields.pickup ?? prev.pickup,
                            dropoff: fields.dropoff ?? prev.dropoff,
                            rideCategory: fields.rideCategory ?? prev.rideCategory,
                          }));
                          if (fields.stops) setStops(fields.stops);
                        }}
                      />

                      <div>
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          required
                          rows={6}
                          className="w-full bg-black border border-[#D4AF37]/30 px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors resize-none"
                          placeholder="How can we help?"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSending}
                        className={`w-full px-8 py-4 ${isSending ? 'opacity-60 cursor-not-allowed' : 'bg-[#D4AF37] hover:bg-[#B4941F]'} text-black transition-all duration-300 tracking-wider flex items-center justify-center gap-2`}
                      >
                        <Send size={20} />
                        {isSending ? 'SENDING...' : 'SEND MESSAGE'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#1a1a1a] border border-[#D4AF37]/20 overflow-hidden">
            <iframe
              title={`${COMPANY.shortName} office map`}
              src={MAPS_EMBED_SRC}
              className="w-full h-96 border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <p className="text-gray-400 text-sm text-center py-3">{FULL_ADDRESS}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
