import { Car, Plane, Users, Briefcase, Heart, Clock } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ServicesProps {
  onNavigate: (page: string) => void;
}

export default function Services({ onNavigate }: ServicesProps) {
  const services = [
    {
      icon: <Briefcase size={40} />,
      title: 'Corporate Travel',
      description: 'Professional chauffeur services for business executives, board meetings, and corporate events. Punctual, discreet, and reliable.',
      image: 'https://images.unsplash.com/photo-1485291571150-772bcfc10da5?auto=format&fit=crop&w=1400&q=80'
    },
    {
      icon: <Plane size={40} />,
      title: 'Airport Transfers',
      description: 'Seamless transportation to and from all major airports. Flight tracking, meet & greet service, and luggage assistance included.',
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1400&q=80'
    },
    {
      icon: <Heart size={40} />,
      title: 'Special Events',
      description: 'Make your special day unforgettable with our wedding and event transportation services. Elegant vehicles for memorable moments.',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=80'
    },
    {
      icon: <Users size={40} />,
      title: 'Group Transportation',
      description: 'Luxury SUVs and a party bus for birthdays, concerts, wineries, and corporate outings. One chauffeur, everyone together.',
      image: '/fleet/party-bus.png'
    },
    {
      icon: <Clock size={40} />,
      title: 'Hourly Service',
      description: 'Flexible hourly chauffeur service for multiple stops, shopping excursions, or full-day business needs. Total convenience and control.',
      image: 'https://images.unsplash.com/photo-1547731269-e4073e054f12?auto=format&fit=crop&w=1400&q=80'
    },
    {
      icon: <Car size={40} />,
      title: 'Private Chauffeur',
      description: 'Dedicated chauffeur service for long-term arrangements. Your personal driver available when you need them.',
      image: '/fleet/s-class.jpg'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      {/* Header */}
      <section className="py-20 px-4 text-center">
        <h1 className="text-5xl md:text-6xl mb-6 text-[#D4AF37]">Our Services</h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Comprehensive luxury transportation solutions tailored to your needs. 
          Each service is delivered with the utmost attention to detail and professionalism.
        </p>
      </section>

      {/* Services Grid */}
      <section className="px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="group bg-gradient-to-b from-[#1a1a1a] to-black border border-[#D4AF37]/20 hover:border-[#D4AF37] transition-all duration-300 overflow-hidden"
              >
                <div className="relative h-64 overflow-hidden">
                  <ImageWithFallback
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-[#D4AF37]">
                    {service.icon}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl mb-3 text-[#D4AF37]">{service.title}</h3>
                  <p className="text-gray-400 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-black to-[#1a1a1a]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl text-center mb-16 text-[#D4AF37]">What's Included</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="p-6">
              <div className="text-[#D4AF37] text-3xl mb-4">✓</div>
              <h3 className="text-xl mb-2 text-[#D4AF37]">Professional Chauffeurs</h3>
              <p className="text-gray-400">Licensed, vetted, and expertly trained</p>
            </div>
            <div className="p-6">
              <div className="text-[#D4AF37] text-3xl mb-4">✓</div>
              <h3 className="text-xl mb-2 text-[#D4AF37]">Premium Vehicles</h3>
              <p className="text-gray-400">Immaculately maintained luxury fleet</p>
            </div>
            <div className="p-6">
              <div className="text-[#D4AF37] text-3xl mb-4">✓</div>
              <h3 className="text-xl mb-2 text-[#D4AF37]">Complimentary Amenities</h3>
              <p className="text-gray-400">Water, WiFi, and newspapers</p>
            </div>
            <div className="p-6">
              <div className="text-[#D4AF37] text-3xl mb-4">✓</div>
              <h3 className="text-xl mb-2 text-[#D4AF37]">24/7 Support</h3>
              <p className="text-gray-400">Always available when you need us</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 text-center">
        <h2 className="text-4xl mb-8 text-[#D4AF37]">Ready to Book?</h2>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Experience the difference that true luxury service makes. Reserve your vehicle today.
        </p>
        <button
          onClick={() => onNavigate('book')}
          className="px-12 py-4 bg-[#D4AF37] text-black hover:bg-[#B4941F] transition-all duration-300 tracking-wider"
        >
          BOOK NOW
        </button>
      </section>
    </div>
  );
}
