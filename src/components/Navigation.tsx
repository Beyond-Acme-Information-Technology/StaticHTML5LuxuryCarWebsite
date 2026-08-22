import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { trackEvent } from '@/utils/analytics';
import logo from 'figma:asset/c9df9a6d3fc84e369767220efaa1d920ab94cff6.png';
import { hasClientSession } from '@/utils/clientSession';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  clientSignedIn?: boolean;
}

export default function Navigation({ currentPage, onNavigate, clientSignedIn = false }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const signedIn = clientSignedIn || hasClientSession();

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'services', label: 'Services' },
    { id: 'fleet', label: 'Fleet Gallery' },
    { id: 'book', label: 'Book Online' },
    { id: 'contact', label: 'Contact Us' },
    { id: 'jobs', label: 'Jobs' },
    { id: signedIn ? 'account' : 'login', label: signedIn ? 'My Account' : 'Login' },
  ];

  const handleNavClick = (pageId: string) => {
    const next = pageId === 'login' && hasClientSession() ? 'account' : pageId;
    onNavigate(next);
    setIsMenuOpen(false);
    if (pageId === 'login' || pageId === 'account') {
      trackEvent('login_click', { category: 'navigation' });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-[#D4AF37]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div
            className="flex items-center cursor-pointer"
            onClick={() => handleNavClick('home')}
          >
            <img src={logo} alt="Awesome Luxury Services Group" className="h-16 w-16" />
            <span className="ml-3 text-[#D4AF37] tracking-wider hidden sm:block">
              AWESOME LUXURY SERVICES
            </span>
          </div>

          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`transition-colors duration-300 ${
                  currentPage === item.id || (item.id === 'account' && currentPage === 'login')
                    ? 'text-[#D4AF37]'
                    : 'text-white hover:text-[#D4AF37]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            className="md:hidden text-[#D4AF37]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden pb-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`block w-full text-left py-3 px-4 transition-colors duration-300 ${
                  currentPage === item.id
                    ? 'text-[#D4AF37] bg-[#D4AF37]/10'
                    : 'text-white hover:text-[#D4AF37] hover:bg-[#D4AF37]/5'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
