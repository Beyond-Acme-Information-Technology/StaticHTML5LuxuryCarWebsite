interface TermsOfServiceProps {
  onNavigate?: (page: string) => void;
}

export default function TermsOfService({ onNavigate }: TermsOfServiceProps) {
  return (
    <div className="min-h-screen bg-black text-white py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl mb-6 text-[#D4AF37]">TERMS OF SERVICE</h1>
        <p className="text-sm text-gray-400 mb-8">Awesome Luxury Services Group LLC</p>
        <p className="text-sm text-gray-400 mb-8">Last Updated: August 21, 2026</p>

        <section className="mb-6">
          <h2 className="text-2xl text-[#D4AF37] mb-2">1. Agreement</h2>
          <p className="text-gray-300 leading-relaxed">
            These Terms govern use of awesomeservicesgroups.com and chauffeur services provided by Awesome Luxury Services Group LLC, 1505 Bayshore Hwy. Suite A, Burlingame, CA 94010. By requesting a reservation or using the Site, you agree to these Terms.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl text-[#D4AF37] mb-2">2. Reservations</h2>
          <p className="text-gray-300 leading-relaxed">
            Online forms are requests, not confirmed bookings, until we confirm availability, vehicle, price, and pickup details by phone or email. You are responsible for accurate passenger counts, luggage, flight numbers, and special requirements.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl text-[#D4AF37] mb-2">3. Cancellations and waiting time</h2>
          <p className="text-gray-300 leading-relaxed">
            Cancellation, wait-time, and no-show policies are stated on your confirmation. Airport pickups include reasonable flight tracking; excessive wait time may be billed. We are not liable for delays caused by traffic, weather, airport operations, or events beyond our control.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl text-[#D4AF37] mb-2">4. Conduct and safety</h2>
          <p className="text-gray-300 leading-relaxed">
            Passengers must follow chauffeur instructions and applicable law. We may refuse or end service for unsafe, unlawful, or abusive conduct. Smoking, illegal substances, and damage to vehicles are prohibited and may result in cleaning or repair charges.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl text-[#D4AF37] mb-2">5. Payment</h2>
          <p className="text-gray-300 leading-relaxed">
            Rates are quoted in USD. Payment methods and any deposit will be described at confirmation. You authorize charges for the agreed fare, approved extras, wait time, tolls, parking, and damage.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl text-[#D4AF37] mb-2">6. Limitation of liability</h2>
          <p className="text-gray-300 leading-relaxed">
            To the fullest extent permitted by California law, our liability for any claim arising from a trip or the Site is limited to the amount paid for the affected reservation. We are not liable for indirect, incidental, or consequential damages.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl text-[#D4AF37] mb-2">7. Website use</h2>
          <p className="text-gray-300 leading-relaxed">
            You may not misuse the Site, submit false requests, or attempt to disrupt our systems. Content on the Site is for information and booking inquiries. Vehicle photos are representative and may vary.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl text-[#D4AF37] mb-2">8. Privacy</h2>
          <p className="text-gray-300 leading-relaxed">
            Personal information is handled as described in our Privacy Policy. California residents may exercise CCPA/CPRA rights as stated there.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl text-[#D4AF37] mb-2">9. Governing law</h2>
          <p className="text-gray-300 leading-relaxed">
            These Terms are governed by the laws of the State of California, without regard to conflict-of-law rules. Venue for disputes is San Mateo County, California, unless applicable law requires otherwise.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl text-[#D4AF37] mb-2">10. Contact</h2>
          <p className="text-gray-300 leading-relaxed">
            Awesome Luxury Services Group LLC · 1505 Bayshore Hwy. Suite A, Burlingame, CA 94010 · awesomeluxuryservices@gmail.com · +1 (408) 805-4386
          </p>
        </section>

        <div className="mt-8 flex gap-4">
          <button
            onClick={() => onNavigate?.('privacy')}
            className="px-6 py-3 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all duration-200"
          >
            Privacy Policy
          </button>
          <button
            onClick={() => onNavigate?.('home')}
            className="px-6 py-3 bg-[#D4AF37] text-black hover:bg-[#B4941F] transition-all duration-200"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
