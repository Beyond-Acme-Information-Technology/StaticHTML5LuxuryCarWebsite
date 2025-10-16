import { ChevronRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=1920&h=1080&fit=crop"
            alt="Luxury car"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <h1 className="text-5xl md:text-7xl mb-6 tracking-wider text-[#D4AF37]">
            WHERE LUXURY MEETS LEGACY
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-300">
            Experience unparalleled sophistication in every journey
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('book')}
              className="px-8 py-4 bg-[#D4AF37] text-black hover:bg-[#B4941F] transition-all duration-300 tracking-wider inline-flex items-center justify-center"
            >
              BOOK NOW <ChevronRight className="ml-2" />
            </button>
            <button
              onClick={() => onNavigate('fleet')}
              className="px-8 py-4 border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all duration-300 tracking-wider"
            >
              VIEW FLEET
            </button>
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl mb-8 text-[#D4AF37]">Welcome to Excellence</h2>
          <p className="text-lg text-gray-300 leading-relaxed mb-6">
            Awesome Luxury Services Group LLC is the premier choice for discerning clients who demand nothing but the finest in luxury transportation. With a fleet of meticulously maintained vehicles and professional chauffeurs, we deliver an experience that transcends ordinary travel.
          </p>
          <p className="text-lg text-gray-300 leading-relaxed">
            From corporate executives to special occasions, we provide seamless, elegant transportation solutions tailored to your unique needs. Every journey with us is a statement of sophistication and style.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-gradient-to-b from-black to-[#1a1a1a]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl text-center mb-16 text-[#D4AF37]">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-black/50 p-8 border border-[#D4AF37]/20 hover:border-[#D4AF37] transition-all duration-300">
              <div className="text-[#D4AF37] text-5xl mb-4">01</div>
              <h3 className="text-2xl mb-4 text-[#D4AF37]">Premium Fleet</h3>
              <p className="text-gray-400">
                Our collection of luxury vehicles is maintained to the highest standards, ensuring comfort and reliability.
              </p>
            </div>
            <div className="bg-black/50 p-8 border border-[#D4AF37]/20 hover:border-[#D4AF37] transition-all duration-300">
              <div className="text-[#D4AF37] text-5xl mb-4">02</div>
              <h3 className="text-2xl mb-4 text-[#D4AF37]">Professional Service</h3>
              <p className="text-gray-400">
                Experienced chauffeurs trained in discretion, safety, and exceptional customer service.
              </p>
            </div>
            <div className="bg-black/50 p-8 border border-[#D4AF37]/20 hover:border-[#D4AF37] transition-all duration-300">
              <div className="text-[#D4AF37] text-5xl mb-4">03</div>
              <h3 className="text-2xl mb-4 text-[#D4AF37]">24/7 Availability</h3>
              <p className="text-gray-400">
                Round-the-clock service to accommodate your schedule, whenever you need us.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl mb-8 text-[#D4AF37]">Ready to Experience Luxury?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Book your next journey with us and discover the difference that true luxury makes.
          </p>
          <button
            onClick={() => onNavigate('book')}
            className="px-12 py-4 bg-[#D4AF37] text-black hover:bg-[#B4941F] transition-all duration-300 tracking-wider inline-flex items-center"
          >
            RESERVE NOW <ChevronRight className="ml-2" />
          </button>
        </div>
      </section>
    </div>
  );
}
