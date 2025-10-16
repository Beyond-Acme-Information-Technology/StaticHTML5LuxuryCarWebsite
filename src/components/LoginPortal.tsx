import { useState } from 'react';
import { Lock, Mail, User, AlertCircle } from 'lucide-react';

export default function LoginPortal() {
  const [activeTab, setActiveTab] = useState<'client' | 'staff'>('client');
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [showMessage, setShowMessage] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder - In production, this would authenticate with a backend
    console.log('Login attempted:', { ...loginData, type: activeTab });
    setShowMessage(true);
    
    setTimeout(() => {
      setShowMessage(false);
      setLoginData({ email: '', password: '' });
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      {/* Header */}
      <section className="py-20 px-4 text-center">
        <h1 className="text-5xl md:text-6xl mb-6 text-[#D4AF37]">Login Portal</h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Access your account to manage bookings, view trip history, or access staff resources.
        </p>
      </section>

      {/* Login Form */}
      <section className="px-4 pb-20">
        <div className="max-w-md mx-auto">
          {/* Tab Selection */}
          <div className="flex border border-[#D4AF37]/20 mb-8">
            <button
              onClick={() => setActiveTab('client')}
              className={`flex-1 py-4 flex items-center justify-center gap-2 transition-all duration-300 ${
                activeTab === 'client'
                  ? 'bg-[#D4AF37] text-black'
                  : 'bg-black text-gray-400 hover:text-[#D4AF37]'
              }`}
            >
              <User size={20} />
              Client Portal
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={`flex-1 py-4 flex items-center justify-center gap-2 transition-all duration-300 ${
                activeTab === 'staff'
                  ? 'bg-[#D4AF37] text-black'
                  : 'bg-black text-gray-400 hover:text-[#D4AF37]'
              }`}
            >
              <Lock size={20} />
              Staff Portal
            </button>
          </div>

          {/* Login Card */}
          <div className="bg-gradient-to-b from-[#1a1a1a] to-black border border-[#D4AF37]/20 p-8">
            {showMessage ? (
              <div className="text-center py-12">
                <AlertCircle size={48} className="text-[#D4AF37] mx-auto mb-6" />
                <h3 className="text-2xl mb-4 text-[#D4AF37]">Portal Coming Soon</h3>
                <p className="text-gray-300 mb-2">
                  The {activeTab === 'client' ? 'client' : 'staff'} portal is currently under development.
                </p>
                <p className="text-gray-400">
                  Please contact us directly for account access or assistance.
                </p>
                <div className="mt-6 pt-6 border-t border-[#D4AF37]/20">
                  <p className="text-gray-400 mb-2">Need help?</p>
                  <p className="text-[#D4AF37]">Call: +1 (555) 123-4567</p>
                  <p className="text-[#D4AF37]">Email: info@awesomecarservice.com</p>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-2xl mb-6 text-[#D4AF37]">
                  {activeTab === 'client' ? 'Client Login' : 'Staff Login'}
                </h2>

                <form onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-gray-300 mb-2 flex items-center gap-2">
                        <Mail size={18} className="text-[#D4AF37]" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={loginData.email}
                        onChange={handleChange}
                        required
                        className="w-full bg-black border border-[#D4AF37]/30 px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors"
                        placeholder="your@email.com"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-2 flex items-center gap-2">
                        <Lock size={18} className="text-[#D4AF37]" />
                        Password
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={loginData.password}
                        onChange={handleChange}
                        required
                        className="w-full bg-black border border-[#D4AF37]/30 px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors"
                        placeholder="••••••••"
                      />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-[#D4AF37]"
                        />
                        Remember me
                      </label>
                      <button
                        type="button"
                        className="text-[#D4AF37] hover:text-[#B4941F] transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>

                    <button
                      type="submit"
                      className="w-full px-8 py-4 bg-[#D4AF37] text-black hover:bg-[#B4941F] transition-all duration-300 tracking-wider"
                    >
                      LOGIN
                    </button>
                  </div>
                </form>

                <div className="mt-8 pt-8 border-t border-[#D4AF37]/20 text-center">
                  <p className="text-gray-400 mb-4">
                    {activeTab === 'client' 
                      ? "Don't have an account?" 
                      : "Need staff access?"}
                  </p>
                  <button className="text-[#D4AF37] hover:text-[#B4941F] transition-colors">
                    {activeTab === 'client' 
                      ? 'Create Client Account' 
                      : 'Contact Administrator'}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Information Boxes */}
          {!showMessage && (
            <div className="mt-8 space-y-4">
              {activeTab === 'client' ? (
                <div className="bg-gradient-to-br from-[#1a1a1a] to-black border border-[#D4AF37]/20 p-6">
                  <h3 className="text-[#D4AF37] mb-3">Client Portal Features</h3>
                  <ul className="space-y-2 text-gray-400 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-[#D4AF37]">•</span>
                      <span>Manage and track your bookings</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#D4AF37]">•</span>
                      <span>View trip history and invoices</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#D4AF37]">•</span>
                      <span>Save favorite locations and preferences</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#D4AF37]">•</span>
                      <span>Access exclusive member benefits</span>
                    </li>
                  </ul>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-[#1a1a1a] to-black border border-[#D4AF37]/20 p-6">
                  <h3 className="text-[#D4AF37] mb-3">Staff Portal Features</h3>
                  <ul className="space-y-2 text-gray-400 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-[#D4AF37]">•</span>
                      <span>View and manage daily schedules</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#D4AF37]">•</span>
                      <span>Access client information and preferences</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#D4AF37]">•</span>
                      <span>Submit time sheets and reports</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#D4AF37]">•</span>
                      <span>Training materials and resources</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Security Notice */}
      <section className="px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-[#1a1a1a] to-black border border-[#D4AF37]/20 p-8 text-center">
            <Lock size={32} className="text-[#D4AF37] mx-auto mb-4" />
            <h3 className="text-xl mb-3 text-[#D4AF37]">Your Security Matters</h3>
            <p className="text-gray-400 max-w-2xl mx-auto">
              All login credentials are encrypted and transmitted securely. 
              We never share your personal information with third parties. 
              For security concerns, please contact our support team immediately.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
