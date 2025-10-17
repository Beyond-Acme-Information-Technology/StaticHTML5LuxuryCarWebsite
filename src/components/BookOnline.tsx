import { useState } from 'react';
import { Calendar, Clock, MapPin, Car, User, Mail, Phone } from 'lucide-react';

export default function BookOnline() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    pickupLocation: '',
    dropoffLocation: '',
    vehicleType: '',
    passengers: '1',
    specialRequests: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, this would send data to a server
    console.log('Booking submitted:', formData);
    setSubmitted(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        date: '',
        time: '',
        pickupLocation: '',
        dropoffLocation: '',
        vehicleType: '',
        passengers: '1',
        specialRequests: ''
      });
    }, 3000);
  };

  const vehicleTypes = [
    'Mercedes-Benz S-Class',
    'BMW 7 Series',
    'Audi A8',
    'Range Rover Autobiography',
    'Tesla Model S',
    'Cadillac Escalade ESV'
  ];

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      {/* Header */}
      <section className="py-20 px-4 text-center">
        <h1 className="text-5xl md:text-6xl mb-6 text-[#D4AF37]">Book Online</h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Reserve your luxury vehicle in minutes. Fill out the form below and we'll confirm your booking shortly.
        </p>
      </section>

      {/* Booking Form */}
      <section className="px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-b from-[#1a1a1a] to-black border border-[#D4AF37]/20 p-8 md:p-12">
            {submitted ? (
              <div className="text-center py-12">
                <div className="text-[#D4AF37] text-6xl mb-6">✓</div>
                <h2 className="text-3xl mb-4 text-[#D4AF37]">Booking Request Received!</h2>
                <p className="text-gray-300 text-xl">
                  Thank you for choosing Awesome Luxury Services. We'll contact you shortly to confirm your reservation.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Personal Information */}
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
                        placeholder="Your Name Here"
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
                        placeholder="awesomeluxuryservices@gmail.com"
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
                      placeholder="+1 (415) 619-8276"
                    />
                  </div>
                </div>

                {/* Trip Details */}
                <div className="mb-8">
                  <h2 className="text-2xl mb-6 text-[#D4AF37] border-b border-[#D4AF37]/20 pb-3">
                    Trip Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      placeholder="Enter pickup address"
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
                      placeholder="Enter dropoff address"
                    />
                  </div>
                </div>

                {/* Vehicle Selection */}
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
                        {vehicleTypes.map((vehicle, index) => (
                          <option key={index} value={vehicle}>
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

                {/* Special Requests */}
                <div className="mb-8">
                  <label className="block text-gray-300 mb-2">
                    Special Requests or Notes
                  </label>
                  <textarea
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleChange}
                    rows={4}
                    className="w-full bg-black border border-[#D4AF37]/30 px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors resize-none"
                    placeholder="Any special requirements? (Optional)"
                  />
                </div>

                {/* Submit Button */}
                <div className="text-center">
                  <button
                    type="submit"
                    className="px-16 py-4 bg-[#D4AF37] text-black hover:bg-[#B4941F] transition-all duration-300 tracking-wider"
                  >
                    SUBMIT BOOKING REQUEST
                  </button>
                  <p className="text-gray-400 mt-4 text-sm">
                    * Required fields. We'll contact you within 2 hours to confirm your reservation.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-black to-[#1a1a1a]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl text-center mb-16 text-[#D4AF37]">Booking Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-[#D4AF37] text-3xl mb-4">1</div>
              <h3 className="text-xl mb-3 text-[#D4AF37]">Submit Request</h3>
              <p className="text-gray-400">
                Fill out the booking form with your trip details and vehicle preference.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-[#D4AF37] text-3xl mb-4">2</div>
              <h3 className="text-xl mb-3 text-[#D4AF37]">Confirmation</h3>
              <p className="text-gray-400">
                We'll contact you within 2 hours to confirm availability and finalize details.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-[#D4AF37] text-3xl mb-4">3</div>
              <h3 className="text-xl mb-3 text-[#D4AF37]">Enjoy Your Ride</h3>
              <p className="text-gray-400">
                Your chauffeur will arrive on time, ready to provide exceptional service.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
