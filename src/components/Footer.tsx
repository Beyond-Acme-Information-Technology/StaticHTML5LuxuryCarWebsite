import { Mail, Phone, MapPin } from 'lucide-react';
import { COMPANY, FULL_ADDRESS } from '@/config/company';

interface FooterProps {
  onNavigate?: (page: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const links = [
    { id: 'services', label: 'Services' },
    { id: 'fleet', label: 'Fleet' },
    { id: 'book', label: 'Book Online' },
    { id: 'jobs', label: 'Careers' },
    { id: 'contact', label: 'Contact' },
    { id: 'privacy', label: 'Privacy Policy' },
    { id: 'terms', label: 'Terms of Service' },
  ];

  return (
    <footer className="bg-black text-white border-t border-[#D4AF37]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-[#D4AF37] mb-4">{COMPANY.legalName}</h3>
            <p className="text-gray-400 mb-4">
              {COMPANY.tagline}. Premium chauffeur service for the San Francisco Bay Area.
            </p>
          </div>

          <div>
            <h3 className="text-[#D4AF37] mb-4">Contact Information</h3>
            <div className="space-y-3 text-gray-400">
              <div className="flex items-start">
                <Phone size={18} className="mr-3 mt-1 text-[#D4AF37]" />
                <div>
                  <a href={`tel:${COMPANY.phoneTel}`} className="hover:text-[#D4AF37]">
                    {COMPANY.phoneDisplay}
                  </a>
                  <p className="text-sm">Available 24/7</p>
                </div>
              </div>
              <div className="flex items-start">
                <Mail size={18} className="mr-3 mt-1 text-[#D4AF37]" />
                <a href={`mailto:${COMPANY.email}`} className="hover:text-[#D4AF37]">
                  {COMPANY.email}
                </a>
              </div>
              <div className="flex items-start">
                <MapPin size={18} className="mr-3 mt-1 text-[#D4AF37]" />
                <p>{FULL_ADDRESS}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[#D4AF37] mb-4">Quick Links</h3>
            <div className="space-y-2 text-gray-400">
              {links.map((link) => (
                <button
                  key={link.id}
                  onClick={() => onNavigate?.(link.id)}
                  className="block hover:text-[#D4AF37] transition-colors"
                >
                  {link.label}
                </button>
              ))}
              <p className="text-[#D4AF37] mt-4">{COMPANY.serviceHours}</p>
              <a
                href={COMPANY.yelpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-4 text-[#D4AF37] hover:text-[#B4941F]"
              >
                Yelp reviews
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-[#D4AF37]/20 mt-8 pt-8 text-center text-gray-400 space-y-5">
          <p>&copy; {new Date().getFullYear()} {COMPANY.legalName}. All rights reserved.</p>
          <a
            href="https://www.beyondacme.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-col sm:flex-row items-center justify-center gap-3 text-gray-300 hover:text-[#D4AF37]"
          >
            <span>Developed by</span>
            <span className="inline-flex items-center gap-3 bg-white px-3 py-2">
              <img src="/beyond-acme-logo.jpg" alt="Beyond Acme Information Technology" className="h-10 w-auto" />
              <img src="/beyond-acme-icon.png" alt="" className="h-8 w-8" />
            </span>
            <span className="text-white">Beyond Acme Information Technology</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
