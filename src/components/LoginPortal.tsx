import { useEffect, useState } from 'react';
import { Lock, Mail, User, AlertCircle } from 'lucide-react';
import { COMPANY } from '@/config/company';
import { apiUrl, normalizeStaffToken } from '@/utils/siteUrl';
import { hasClientSession, saveClientSession } from '@/utils/clientSession';

interface LoginPortalProps {
  onNavigate?: (page: string) => void;
}

export default function LoginPortal({ onNavigate }: LoginPortalProps) {
  const [activeTab, setActiveTab] = useState<'client' | 'staff' | 'driver'>('client');
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    code: '',
  });
  const [clientStep, setClientStep] = useState<'email' | 'code'>('email');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [staffDenied, setStaffDenied] = useState(false);

  useEffect(() => {
    if (hasClientSession()) {
      onNavigate?.('account');
    }
  }, [onNavigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (activeTab === 'staff') {
      try {
        const token = normalizeStaffToken(loginData.password);
        const res = await fetch(apiUrl('/api/leads'), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          setStaffDenied(true);
          return;
        }
        sessionStorage.setItem('staffToken', token);
        onNavigate?.('staff');
      } catch {
        setStaffDenied(true);
      }
      return;
    }

    if (activeTab === 'driver') {
      setBusy(true);
      try {
        const res = await fetch(apiUrl('/api/driver-auth'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: loginData.email, pin: loginData.password }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.error || 'Could not sign in');
        sessionStorage.setItem('driverToken', json.token);
        onNavigate?.('driver');
      } catch (err: any) {
        setError(err.message || 'Chauffeur login failed');
      } finally {
        setBusy(false);
      }
      return;
    }

    setBusy(true);
    try {
      if (clientStep === 'email') {
        const res = await fetch(apiUrl('/api/client-auth'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'request', email: loginData.email }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(json.error || 'Could not send a code');
        }
        setClientStep('code');
        return;
      }

      const res = await fetch(apiUrl('/api/client-auth'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          email: loginData.email,
          code: loginData.code,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || 'That code did not work');
      }
      saveClientSession(json.token, json.email);
      onNavigate?.('account');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <section className="py-20 px-4 text-center">
        <h1 className="text-5xl md:text-6xl mb-6 text-[#D4AF37]">Login Portal</h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          View your booking and contact requests, or open the staff inbox.
        </p>
      </section>

      <section className="px-4 pb-20">
        <div className="max-w-md mx-auto">
          <div className="flex border border-[#D4AF37]/20 mb-8">
            <button
              type="button"
              onClick={() => {
                setActiveTab('client');
                setStaffDenied(false);
                setError(null);
              }}
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
              type="button"
              onClick={() => {
                setActiveTab('staff');
                setError(null);
              }}
              className={`flex-1 py-4 flex items-center justify-center gap-2 transition-all duration-300 ${
                activeTab === 'staff'
                  ? 'bg-[#D4AF37] text-black'
                  : 'bg-black text-gray-400 hover:text-[#D4AF37]'
              }`}
            >
              <Lock size={20} />
              Staff
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('driver');
                setStaffDenied(false);
                setError(null);
              }}
              className={`flex-1 py-4 flex items-center justify-center gap-2 transition-all duration-300 ${
                activeTab === 'driver'
                  ? 'bg-[#D4AF37] text-black'
                  : 'bg-black text-gray-400 hover:text-[#D4AF37]'
              }`}
            >
              Chauffeur
            </button>
          </div>

          <div className="bg-[#111] border border-[#D4AF37]/20 p-8">
            {staffDenied && activeTab === 'staff' ? (
              <div className="text-center py-12">
                <AlertCircle size={48} className="text-[#D4AF37] mx-auto mb-6" />
                <h3 className="text-2xl mb-4 text-[#D4AF37]">Access denied</h3>
                <p className="text-gray-300 mb-2">
                  Staff access was denied. Paste only the token value from Vercel.
                </p>
                <p className="text-[#D4AF37] mt-4">
                  <a href={`tel:${COMPANY.phoneTel}`}>{COMPANY.phoneDisplay}</a>
                </p>
                <button
                  type="button"
                  onClick={() => setStaffDenied(false)}
                  className="mt-4 text-[#D4AF37] hover:text-[#B4941F]"
                >
                  Try again
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl mb-6 text-[#D4AF37]">
                  {activeTab === 'client' ? 'Client Login' : activeTab === 'driver' ? 'Chauffeur Login' : 'Staff Login'}
                </h2>

                <form onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    {activeTab === 'client' && (
                      <div>
                        <label className="block text-gray-300 mb-2 flex items-center gap-2">
                          <Mail size={18} className="text-[#D4AF37]" />
                          Email used on your request
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={loginData.email}
                          onChange={handleChange}
                          required
                          disabled={clientStep === 'code'}
                          className="w-full bg-black border border-[#D4AF37]/30 px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none"
                          placeholder="your@email.com"
                        />
                      </div>
                    )}

                    {activeTab === 'client' && clientStep === 'code' && (
                      <div>
                        <label className="block text-gray-300 mb-2 flex items-center gap-2">
                          <Lock size={18} className="text-[#D4AF37]" />
                          6-digit code
                        </label>
                        <input
                          type="text"
                          name="code"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          value={loginData.code}
                          onChange={handleChange}
                          required
                          maxLength={6}
                          className="w-full bg-black border border-[#D4AF37]/30 px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none tracking-[0.4em]"
                          placeholder="000000"
                        />
                        <p className="text-gray-500 text-sm mt-2">
                          We emailed a code to {loginData.email}. It expires in 10 minutes.
                        </p>
                        <button
                          type="button"
                          className="mt-2 text-[#D4AF37] text-sm"
                          onClick={() => {
                            setClientStep('email');
                            setLoginData({ ...loginData, code: '' });
                          }}
                        >
                          Use a different email
                        </button>
                      </div>
                    )}

                    {activeTab === 'driver' && (
                      <>
                        <div>
                          <label className="block text-gray-300 mb-2">Phone on file</label>
                          <input
                            type="tel"
                            name="email"
                            value={loginData.email}
                            onChange={handleChange}
                            required
                            className="w-full bg-black border border-[#D4AF37]/30 px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none"
                            placeholder="(408) 555-0100"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-300 mb-2 flex items-center gap-2">
                            <Lock size={18} className="text-[#D4AF37]" />
                            PIN
                          </label>
                          <input
                            type="password"
                            name="password"
                            inputMode="numeric"
                            value={loginData.password}
                            onChange={handleChange}
                            required
                            className="w-full bg-black border border-[#D4AF37]/30 px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none"
                            placeholder="4–6 digit PIN"
                          />
                        </div>
                      </>
                    )}

                    {activeTab === 'staff' && (
                      <div>
                        <label className="block text-gray-300 mb-2 flex items-center gap-2">
                          <Lock size={18} className="text-[#D4AF37]" />
                          Access token
                        </label>
                        <input
                          type="password"
                          name="password"
                          value={loginData.password}
                          onChange={handleChange}
                          required
                          className="w-full bg-black border border-[#D4AF37]/30 px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none"
                          placeholder="Paste token value only"
                        />
                      </div>
                    )}

                    {error && <p className="text-red-300">{error}</p>}

                    <button
                      type="submit"
                      disabled={busy}
                      className="w-full px-8 py-4 bg-[#D4AF37] text-black hover:bg-[#B4941F] transition-all duration-300 tracking-wider disabled:opacity-60"
                    >
                      {activeTab === 'staff'
                        ? 'LOGIN'
                        : activeTab === 'driver'
                          ? busy
                            ? 'SIGNING IN…'
                            : 'OPEN TRIPS'
                          : clientStep === 'email'
                          ? busy
                            ? 'SENDING CODE…'
                            : 'EMAIL ME A CODE'
                          : busy
                            ? 'CHECKING…'
                            : 'OPEN MY REQUESTS'}
                    </button>
                  </div>
                </form>

                <div className="mt-8 pt-8 border-t border-[#D4AF37]/20 text-center">
                  <p className="text-gray-400 mb-4">
                    {activeTab === 'client' ? 'No request on file yet?' : activeTab === 'driver' ? 'Need a PIN?' : 'Need staff access?'}
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigate?.(activeTab === 'client' ? 'book' : 'contact')}
                    className="text-[#D4AF37] hover:text-[#B4941F] transition-colors"
                  >
                    {activeTab === 'client' ? 'Book a ride' : 'Contact Administrator'}
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="mt-8 bg-[#111] border border-[#D4AF37]/20 p-6">
            {activeTab === 'client' ? (
              <>
                <h3 className="text-[#D4AF37] mb-3">Client portal</h3>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>Use the same email you put on Contact, Book, or Jobs.</li>
                  <li>We email a one-time code. No password to remember.</li>
                  <li>You will see status of each request: new, contacted, confirmed, or closed.</li>
                </ul>
              </>
            ) : activeTab === 'driver' ? (
              <>
                <h3 className="text-[#D4AF37] mb-3">Chauffeur</h3>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>Staff add your name, phone, vehicle, and PIN in the inbox Chauffeurs tab.</li>
                  <li>Accept the trip, then On my Way, On Location, On Board, Drop off.</li>
                  <li>GPS and luggage photo are captured in this phone browser.</li>
                </ul>
              </>
            ) : (
              <>
                <h3 className="text-[#D4AF37] mb-3">Staff inbox</h3>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>See booking, contact, and job requests</li>
                  <li>Mark requests new, contacted, confirmed, or closed</li>
                  <li>Reply to guests from your sales inbox</li>
                </ul>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
