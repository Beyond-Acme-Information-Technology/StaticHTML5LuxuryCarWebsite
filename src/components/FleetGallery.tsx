import { Users, Briefcase, Info } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface FleetGalleryProps {
  onNavigate: (page: string) => void;
}

export default function FleetGallery({ onNavigate }: FleetGalleryProps) {
  const vehicles = [
    {
      name: 'Mercedes-Benz S-Class',
      category: 'Executive Sedan',
      passengers: '3 Passengers',
      luggage: '3 Luggage',
      description: 'Black S-Class for executive travel: quiet cabin, leather, and a composed Bay Area ride.',
      image: '/fleet/s-class.jpg',
      features: ['Leather Interior', 'Climate Control', 'WiFi', 'Premium Sound']
    },
    {
      name: 'BMW 7 Series',
      category: 'Luxury Sedan',
      passengers: '3 Passengers',
      luggage: '3 Luggage',
      description: 'Current-generation black 7 Series with massage seats, privacy glass, and a smooth chauffeur cabin.',
      image: '/fleet/bmw-7.jpg',
      features: ['Massage Seats', 'Ambient Lighting', 'Entertainment System', 'Privacy Glass']
    },
    {
      name: 'Chevrolet Suburban',
      category: 'Full-size SUV',
      passengers: '7 Passengers',
      luggage: '8 Luggage',
      description: 'Black Chevrolet Suburban for airport runs, families, and groups that need third-row space and luggage room.',
      image: '/fleet/suburban.jpg',
      features: ['Third row', 'Luggage room', 'Captain seats', 'WiFi']
    },
    {
      name: 'Range Rover Autobiography',
      category: 'Luxury SUV',
      passengers: '6 Passengers',
      luggage: '6 Luggage',
      description: 'Black Range Rover Autobiography: commanding presence with a quiet, first-class cabin.',
      image: '/fleet/range-rover.jpg',
      features: ['Terrain Response', 'Panoramic Roof', 'Premium Audio', 'Captain Seats']
    },
    {
      name: 'Tesla Model S',
      category: 'Electric Luxury',
      passengers: '4 Passengers',
      luggage: '4 Luggage',
      description: 'Black Model S for a smooth, quiet electric ride to SFO, SJC, or the city.',
      image: '/fleet/tesla.jpg',
      features: ['Autopilot', 'Instant Torque', '17" Display', 'Supercharging']
    },
    {
      name: 'Cadillac Escalade ESV',
      category: 'Executive SUV',
      passengers: '7 Passengers',
      luggage: '8 Luggage',
      description: 'Latest black Escalade ESV — all-black finish, tall LED signature, and room for seven.',
      image: '/fleet/escalade.png',
      features: ['OLED Display', 'AKG Audio', 'Night Vision', 'Air Suspension']
    },
    {
      name: 'Party Bus',
      category: 'Nightlife / Events',
      passengers: '22 Passengers',
      luggage: 'Light bags',
      description: 'Black luxury coach with panoramic glass, lights, and sound. Birthdays, concerts, and winery groups.',
      image: '/fleet/party-bus.png',
      features: ['LED lighting', 'Sound system', 'Lounge seating', 'Chauffeur included']
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      {/* Header */}
      <section className="py-20 px-4 text-center">
        <h1 className="text-5xl md:text-6xl mb-6 text-[#D4AF37]">Our Fleet</h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          An all-black fleet: luxury sedans, SUVs including Suburban and the latest Escalade, plus a party bus for nights out.
          Each vehicle is maintained to chauffeur standard and equipped with premium amenities.
        </p>
      </section>

      {/* Fleet Grid */}
      <section className="px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vehicles.map((vehicle, index) => (
              <div
                key={index}
                className="group bg-gradient-to-b from-[#1a1a1a] to-black border border-[#D4AF37]/20 hover:border-[#D4AF37] transition-all duration-300 overflow-hidden"
              >
                {/* Vehicle Image */}
                <div className="relative h-64 overflow-hidden">
                  <ImageWithFallback
                    src={vehicle.image}
                    alt={vehicle.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                  <div className="absolute top-4 right-4 bg-[#D4AF37] text-black px-3 py-1 tracking-wider">
                    {vehicle.category}
                  </div>
                </div>

                {/* Vehicle Details */}
                <div className="p-6">
                  <h3 className="text-2xl mb-3 text-[#D4AF37]">{vehicle.name}</h3>
                  
                  {/* Capacity Info */}
                  <div className="flex items-center gap-4 mb-4 text-gray-400">
                    <div className="flex items-center gap-2">
                      <Users size={18} className="text-[#D4AF37]" />
                      <span>{vehicle.passengers}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase size={18} className="text-[#D4AF37]" />
                      <span>{vehicle.luggage}</span>
                    </div>
                  </div>

                  <p className="text-gray-400 mb-4 leading-relaxed">
                    {vehicle.description}
                  </p>

                  {/* Features */}
                  <div className="border-t border-[#D4AF37]/20 pt-4">
                    <div className="flex items-center gap-2 mb-3 text-[#D4AF37]">
                      <Info size={18} />
                      <span>Features</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {vehicle.features.map((feature, idx) => (
                        <div key={idx} className="text-sm text-gray-400 flex items-center gap-2">
                          <span className="text-[#D4AF37]">•</span>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-600 text-sm mt-10">
            S-Class, 7 Series, Range Rover, and Model S photos via Wikimedia Commons, CC BY-SA 4.0, Damian B Oh.
          </p>
        </div>
      </section>

      {/* Why Our Fleet Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-black to-[#1a1a1a]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl text-center mb-16 text-[#D4AF37]">Fleet Standards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-[#D4AF37] text-4xl mb-4">100%</div>
              <h3 className="text-xl mb-2 text-[#D4AF37]">Maintained</h3>
              <p className="text-gray-400">Regular service and inspection</p>
            </div>
            <div className="text-center">
              <div className="text-[#D4AF37] text-4xl mb-4">5★</div>
              <h3 className="text-xl mb-2 text-[#D4AF37]">Rated</h3>
              <p className="text-gray-400">Top-tier luxury vehicles only</p>
            </div>
            <div className="text-center">
              <div className="text-[#D4AF37] text-4xl mb-4">24/7</div>
              <h3 className="text-xl mb-2 text-[#D4AF37]">Available</h3>
              <p className="text-gray-400">Fleet ready when you need it</p>
            </div>
            <div className="text-center">
              <div className="text-[#D4AF37] text-4xl mb-4">Latest</div>
              <h3 className="text-xl mb-2 text-[#D4AF37]">Models</h3>
              <p className="text-gray-400">Current year luxury vehicles</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 text-center">
        <h2 className="text-4xl mb-8 text-[#D4AF37]">Choose Your Vehicle</h2>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Select from our premium fleet and experience luxury transportation at its finest.
        </p>
        <button
          onClick={() => onNavigate('book')}
          className="px-12 py-4 bg-[#D4AF37] text-black hover:bg-[#B4941F] transition-all duration-300 tracking-wider"
        >
          BOOK YOUR VEHICLE
        </button>
      </section>
    </div>
  );
}
