interface PrivacyPolicyProps {
  onNavigate?: (page: string) => void;
}

export default function PrivacyPolicy({ onNavigate }: PrivacyPolicyProps) {
  return (
    <div className="min-h-screen bg-black text-white py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl mb-6 text-[#D4AF37]">PRIVACY POLICY</h1>
        <p className="text-sm text-gray-400 mb-8">Awesome Luxury Services Groups LLC</p>
        <p className="text-sm text-gray-400 mb-6">Effective Date: February 17, 2026</p>
        <p className="text-sm text-gray-400 mb-8">Last Updated: February 17, 2026</p>

        <section className="mb-6">
          <h2 className="text-2xl text-[#D4AF37] mb-2">1. Introduction</h2>
          <p className="text-gray-300 leading-relaxed">
            Welcome to Awesome Luxury Services Groups LLC (“Company,” “we,” “our,” or “us”), located at:
          </p>
          <address className="not-italic text-gray-300 mt-2">
            1505 Bayshore Hwy. Suite A<br />
            Burlingame, CA 94010, USA
          </address>
          <p className="text-gray-300 mt-4">
            We are committed to protecting your privacy and safeguarding your personal information. This Privacy Policy describes how we collect, use, disclose, and protect your information when you visit our website (awesomeservicesgroups.com) (“AWESOME LUXURY SERVICES”), book transportation services, communicate with us, or use our chauffeur and luxury transportation services. By accessing or using our Site and services, you agree to this Privacy Policy.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl text-[#D4AF37] mb-2">2. Information We Collect</h2>
          <h3 className="text-lg text-[#D4AF37] mt-2">A. Personal Information You Provide</h3>
          <p className="text-gray-300 mt-2">
            We may collect the following personal information: full name, email address, phone number, billing address, payment information (processed securely through third-party providers), pickup and drop-off locations, travel itinerary details, special requests and service preferences, and corporate account details (if applicable).
          </p>

          <h3 className="text-lg text-[#D4AF37] mt-4">B. Automatically Collected Information</h3>
          <p className="text-gray-300 mt-2">
            When you use our Site, we may automatically collect IP address, browser type and version, device identifiers, operating system, pages visited, time and date of visit, and referral sources.
          </p>

          <h3 className="text-lg text-[#D4AF37] mt-4">C. Cookies &amp; Tracking Technologies</h3>
          <p className="text-gray-300 mt-2">
            We use cookies, analytics tools, and similar technologies to improve website functionality, analyze traffic, personalize user experience, and enhance security. You may control cookies through your browser settings.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl text-[#D4AF37] mb-2">3. How We Use Your Information</h2>
          <p className="text-gray-300">
            We use your information to provide and manage luxury transportation services, confirm and manage bookings, process payments securely, communicate service updates and confirmations, provide customer support, improve our website and service quality, prevent fraud and enhance safety, and comply with legal and regulatory obligations.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl text-[#D4AF37] mb-2">4. How We Share Your Information</h2>
          <p className="text-gray-300">
            We may share your information with payment processors, technology and hosting providers, dispatching partners or affiliated chauffeurs, and legal authorities when required by law. We do not sell your personal information.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl text-[#D4AF37] mb-2">5. California Privacy Rights (CCPA/CPRA Notice)</h2>
          <p className="text-gray-300">
            If you are a California resident, you have rights under the CCPA/CPRA, including the right to know what personal information we collect, the right to request deletion, correction, opt-out of sale/sharing, and the right to non-discrimination for exercising privacy rights. To exercise your rights, contact us at awesomeluxuryservices@gmail.com or (408) 689-8909. We will verify your identity before processing requests.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl text-[#D4AF37] mb-2">6. Data Retention</h2>
          <p className="text-gray-300">
            We retain personal information only as long as necessary to provide services, comply with tax and legal obligations, resolve disputes, and enforce agreements. When no longer required, data is securely deleted or anonymized.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl text-[#D4AF37] mb-2">7. Data Security</h2>
          <p className="text-gray-300">
            We implement administrative, technical, and physical safeguards to protect your personal data, including secure payment processing, encrypted communications (SSL), restricted access, and secure storage systems. However, no system can guarantee 100% security.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl text-[#D4AF37] mb-2">8. Third-Party Links</h2>
          <p className="text-gray-300">
            Our Site may contain links to third-party websites. We are not responsible for the privacy practices or content of external sites.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl text-[#D4AF37] mb-2">9. Children’s Privacy</h2>
          <p className="text-gray-300">Our services are not intended for individuals under the age of 13. We do not knowingly collect personal information from children.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl text-[#D4AF37] mb-2">10. International Users</h2>
          <p className="text-gray-300">If you access our Site from outside the United States, your information may be transferred to and processed in the United States, where data protection laws may differ.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl text-[#D4AF37] mb-2">11. Updates to This Policy</h2>
          <p className="text-gray-300">We may update this Privacy Policy periodically. Changes will be posted on this page with an updated “Last Updated” date.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl text-[#D4AF37] mb-2">12. Contact Information</h2>
          <p className="text-gray-300">If you have questions, contact:</p>
          <address className="not-italic text-gray-300 mt-2">
            Awesome Luxury Services Groups LLC<br />
            1505 Bayshore Hwy. Suite A<br />
            Burlingame, CA 94010, USA<br />
            Email: <a href="mailto:awesomeluxuryservices@gmail.com" className="text-[#D4AF37]">awesomeluxuryservices@gmail.com</a><br />
            Phone: <a href="tel:+14086898909" className="text-[#D4AF37]">(408) 689-8909</a>
          </address>
        </section>

        <div className="mt-8">
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
