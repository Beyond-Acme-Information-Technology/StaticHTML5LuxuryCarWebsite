import { useState } from 'react';
import { Menu, X, ExternalLink } from 'lucide-react';
import { trackEvent } from '@/utils/analytics';
import logo from 'figma:asset/c9df9a6d3fc84e369767220efaa1d920ab94cff6.png';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'services', label: 'Services' },
    { id: 'fleet', label: 'Fleet Gallery' },
    { id: 'book', label: 'Book Online' },
    { id: 'contact', label: 'Contact Us' },
    { id: 'privacy', label: 'Privacy Policy' },
    { id: 'jobs', label: 'Jobs' },
    { id: 'login', label: 'Login' }
  ];

  const handleNavClick = (pageId: string) => {
    onNavigate(pageId);
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loginUrl = 'https://speak-line-39441990.figma.site/';
  const loginSameTab = (import.meta.env?.VITE_LOGIN_SAME_TAB as string) === 'true';

  function trackLoginClick() {
    trackEvent('login_click', { category: 'navigation' });
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-[#D4AF37]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div
            className="flex items-center cursor-pointer"
            onClick={() => handleNavClick('home')}
          >
            <img src={logo} alt="Awesome Luxury Services Group" className="h-16 w-16" />
            <span className="ml-3 text-[#D4AF37] tracking-wider hidden sm:block">
              AWESOME LUXURY SERVICES
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => {
              if (item.id === 'login') {
                return (
                  <a
                    key={item.id}
                    href={loginUrl}
                    target={loginSameTab ? '_self' : '_blank'}
                    rel="noopener noreferrer"
                    onClick={() => trackLoginClick()}
                    aria-label={loginSameTab ? 'Login (opens in same tab)' : 'Login (opens in new tab)'}
                    className={`transition-colors duration-300 ${
                      'text-white hover:text-[#D4AF37] flex items-center gap-2'
                    }`}
                  >
                    {item.label}
                    <ExternalLink size={14} aria-hidden />
                  </a>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`transition-colors duration-300 ${
                    currentPage === item.id
                      ? 'text-[#D4AF37]'
                      : 'text-white hover:text-[#D4AF37]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-[#D4AF37]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Navigation */}
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
