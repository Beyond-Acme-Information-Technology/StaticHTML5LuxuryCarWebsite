import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black text-white border-t border-[#D4AF37]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-[#D4AF37] mb-4">Awesome Luxury Services Group LLC</h3>
            <p className="text-gray-400 mb-4">
              Where luxury meets legacy. Premium transportation services for discerning clients.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-[#D4AF37] transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#D4AF37] transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#D4AF37] transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-[#D4AF37] mb-4">Contact Information</h3>
            <div className="space-y-3 text-gray-400">
              <div className="flex items-start">
                <Phone size={18} className="mr-3 mt-1 text-[#D4AF37]" />
                <div>
                  <p>+1 (408) 805-4386</p>
                  <p className="text-sm">Available 24/7</p>
                </div>
              </div>
              <div className="flex items-start">
                <Mail size={18} className="mr-3 mt-1 text-[#D4AF37]" />
                <p>awesomeluxuryservices@gmail.com</p>
              </div>
              <div className="flex items-start">
                <MapPin size={18} className="mr-3 mt-1 text-[#D4AF37]" />
                <p>1505 Bayshore Hwy. Suite A, Burlingame,CA USA 94010</p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-[#D4AF37] mb-4">Business Hours</h3>
            <div className="space-y-2 text-gray-400">
              <p>Monday - Friday: 24 Hours</p>
              <p>Saturday: 24 Hours</p>
              <p>Sunday: 24 Hours</p>
              <p className="text-[#D4AF37] mt-4">Beyond Safety & Luxury Services are our Best Policy</p>
            </div>
          </div>
        </div>

        <div className="border-t border-[#D4AF37]/20 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 Awesome Luxury Services Group LLC. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
