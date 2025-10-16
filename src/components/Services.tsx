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
      image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGF1ZmZldXIlMjBzZXJ2aWNlfGVufDF8fHx8MTc2MDU4NjYyOXww&ixlib=rb-4.1.0&q=80&w=1080'
    },
    {
      icon: <Plane size={40} />,
      title: 'Airport Transfers',
      description: 'Seamless transportation to and from all major airports. Flight tracking, meet & greet service, and luggage assistance included.',
      image: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhaXJwb3J0JTIwdHJhbnNmZXJ8ZW58MXx8fHwxNzYwNDg3MDEyfDA&ixlib=rb-4.1.0&q=80&w=1080'
    },
    {
      icon: <Heart size={40} />,
      title: 'Special Events',
      description: 'Make your special day unforgettable with our wedding and event transportation services. Elegant vehicles for memorable moments.',
      image: 'https://images.unsplash.com/photo-1618409699341-26cfaec26de8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwbGltb3VzaW5lfGVufDF8fHx8MTc2MDU4NjYzMHww&ixlib=rb-4.1.0&q=80&w=1080'
    },
    {
      icon: <Users size={40} />,
      title: 'Group Transportation',
      description: 'Spacious luxury SUVs and vans for group travel. Perfect for corporate outings, family trips, or group celebrations.',
      image: 'https://images.unsplash.com/photo-1739950075618-f9ae2f90b0c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBTVVYlMjBibGFja3xlbnwxfHx8fDE3NjA1ODY2Mjl8MA&ixlib=rb-4.1.0&q=80&w=1080'
    },
    {
      icon: <Clock size={40} />,
      title: 'Hourly Service',
      description: 'Flexible hourly chauffeur service for multiple stops, shopping excursions, or full-day business needs. Total convenience and control.',
      image: 'https://images.unsplash.com/photo-1547731269-e4073e054f12?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzZWRhbiUyMGludGVyaW9yfGVufDF8fHx8MTc2MDQ4ODc5N3ww&ixlib=rb-4.1.0&q=80&w=1080'
    },
    {
      icon: <Car size={40} />,
      title: 'Private Chauffeur',
      description: 'Dedicated chauffeur service for long-term arrangements. Your personal driver available when you need them.',
      image: 'https://images.unsplash.com/photo-1760465066570-6c2261f851e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBjYXIlMjBmbGVldHxlbnwxfHx8fDE3NjA1ODY2MzF8MA&ixlib=rb-4.1.0&q=80&w=1080'
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
