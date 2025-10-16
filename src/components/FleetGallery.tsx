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
      description: 'The pinnacle of luxury sedans, offering unmatched comfort and technology for executive travel.',
      image: 'https://images.unsplash.com/photo-1728236436940-10b097998033?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZXJjZWRlcyUyMGJlbnolMjBsdXh1cnl8ZW58MXx8fHwxNzYwNTMzNDIxfDA&ixlib=rb-4.1.0&q=80&w=1080',
      features: ['Leather Interior', 'Climate Control', 'WiFi', 'Premium Sound']
    },
    {
      name: 'BMW 7 Series',
      category: 'Luxury Sedan',
      passengers: '3 Passengers',
      luggage: '3 Luggage',
      description: 'German engineering excellence with sophisticated comfort and cutting-edge performance.',
      image: 'https://images.unsplash.com/photo-1731142582229-e0ee70302c02?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibXclMjBsdXh1cnklMjBzZWRhbnxlbnwxfHx8fDE3NjA1ODY2NjN8MA&ixlib=rb-4.1.0&q=80&w=1080',
      features: ['Massage Seats', 'Ambient Lighting', 'Entertainment System', 'Privacy Glass']
    },
    {
      name: 'Audi A8',
      category: 'Premium Sedan',
      passengers: '3 Passengers',
      luggage: '3 Luggage',
      description: 'Sophisticated design combined with advanced technology for the modern executive.',
      image: 'https://images.unsplash.com/photo-1684155391823-15645c20d488?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdWRpJTIwbHV4dXJ5JTIwY2FyfGVufDF8fHx8MTc2MDUzMzUzMXww&ixlib=rb-4.1.0&q=80&w=1080',
      features: ['Adaptive Cruise', 'Quattro AWD', 'Virtual Cockpit', 'Heated Seats']
    },
    {
      name: 'Range Rover Autobiography',
      category: 'Luxury SUV',
      passengers: '6 Passengers',
      luggage: '6 Luggage',
      description: 'The ultimate combination of luxury and capability, perfect for any terrain or occasion.',
      image: 'https://images.unsplash.com/photo-1550523164-e0330d1775b2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyYW5nZSUyMHJvdmVyJTIwbHV4dXJ5fGVufDF8fHx8MTc2MDUyODkwNHww&ixlib=rb-4.1.0&q=80&w=1080',
      features: ['Terrain Response', 'Panoramic Roof', 'Premium Audio', 'Captain Seats']
    },
    {
      name: 'Tesla Model S',
      category: 'Electric Luxury',
      passengers: '4 Passengers',
      luggage: '4 Luggage',
      description: 'Cutting-edge electric performance with zero emissions and luxurious comfort.',
      image: 'https://images.unsplash.com/photo-1510268887001-0a3346314bc2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZXNsYSUyMGx1eHVyeSUyMGVsZWN0cmljfGVufDF8fHx8MTc2MDU4NjY2NHww&ixlib=rb-4.1.0&q=80&w=1080',
      features: ['Autopilot', 'Instant Torque', '17" Display', 'Supercharging']
    },
    {
      name: 'Cadillac Escalade ESV',
      category: 'Executive SUV',
      passengers: '7 Passengers',
      luggage: '8 Luggage',
      description: 'American luxury at its finest, with spacious interiors perfect for group travel.',
      image: 'https://images.unsplash.com/photo-1758217209786-95458c5d30a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlc2NhbGFkZSUyMGx1eHVyeSUyMHN1dnxlbnwxfHx8fDE3NjA1ODY2NjR8MA&ixlib=rb-4.1.0&q=80&w=1080',
      features: ['OLED Display', 'AKG Audio', 'Night Vision', 'Air Suspension']
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      {/* Header */}
      <section className="py-20 px-4 text-center">
        <h1 className="text-5xl md:text-6xl mb-6 text-[#D4AF37]">Our Fleet</h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Discover our meticulously curated collection of luxury vehicles. 
          Each vehicle is maintained to the highest standards and equipped with premium amenities.
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
