import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, this would send data to a server
    console.log('Contact form submitted:', formData);
    setSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    }, 3000);
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
                    <p className="text-gray-300 mb-1">Main: +1 (555) 123-4567</p>
                    <p className="text-gray-300 mb-1">Toll-Free: +1 (800) 555-9876</p>
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
                    <p className="text-gray-300 mb-1">info@awesomecarservice.com</p>
                    <p className="text-gray-300 mb-1">bookings@awesomecarservice.com</p>
                    <p className="text-gray-400 text-sm">We respond within 2 hours</p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-4 p-6 bg-gradient-to-br from-[#1a1a1a] to-black border border-[#D4AF37]/20">
                  <div className="text-[#D4AF37] mt-1">
                    <MapPin size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl mb-2 text-[#D4AF37]">Location</h3>
                    <p className="text-gray-300 mb-1">123 Luxury Lane</p>
                    <p className="text-gray-300 mb-1">Premium City, ST 12345</p>
                    <p className="text-gray-300">United States</p>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-start gap-4 p-6 bg-gradient-to-br from-[#1a1a1a] to-black border border-[#D4AF37]/20">
                  <div className="text-[#D4AF37] mt-1">
                    <Clock size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl mb-2 text-[#D4AF37]">Business Hours</h3>
                    <p className="text-gray-300 mb-1">Monday - Sunday: 24 Hours</p>
                    <p className="text-gray-400 text-sm">Office Hours: 8:00 AM - 8:00 PM EST</p>
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
                      Thank you for contacting us. We'll respond to your inquiry as soon as possible.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
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
                          placeholder="your@email.com"
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
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-300 mb-2">Subject *</label>
                        <select
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          className="w-full bg-black border border-[#D4AF37]/30 px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors"
                        >
                          <option value="">Select a subject</option>
                          <option value="booking">Booking Inquiry</option>
                          <option value="general">General Question</option>
                          <option value="corporate">Corporate Services</option>
                          <option value="feedback">Feedback</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-300 mb-2">Message *</label>
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          required
                          rows={6}
                          className="w-full bg-black border border-[#D4AF37]/30 px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors resize-none"
                          placeholder="Your message..."
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full px-8 py-4 bg-[#D4AF37] text-black hover:bg-[#B4941F] transition-all duration-300 tracking-wider flex items-center justify-center gap-2"
                      >
                        <Send size={20} />
                        SEND MESSAGE
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section (Placeholder) */}
      <section className="px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#1a1a1a] border border-[#D4AF37]/20 h-96 flex items-center justify-center">
            <div className="text-center">
              <MapPin size={48} className="text-[#D4AF37] mx-auto mb-4" />
              <p className="text-gray-400">
                {/* IMPORTANT: Replace with actual Google Maps embed or map component */}
                Interactive Map Location
              </p>
              <p className="text-gray-500 text-sm mt-2">
                123 Luxury Lane, Premium City, ST 12345
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
