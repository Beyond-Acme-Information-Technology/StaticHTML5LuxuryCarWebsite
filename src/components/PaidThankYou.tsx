import { useEffect, useState } from 'react';
import { COMPANY } from '@/config/company';
import { apiUrl } from '@/utils/siteUrl';
import { hasClientSession } from '@/utils/clientSession';

interface PaidThankYouProps {
  onNavigate?: (page: string) => void;
}

export default function PaidThankYou({ onNavigate }: PaidThankYouProps) {
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading');
  const [message, setMessage] = useState('Confirming your payment…');

  useEffect(() => {
    const query = window.location.hash.split('?')[1] || '';
    const params = new URLSearchParams(query);
    if (params.get('pay') === 'cancelled') {
      setState('error');
      setMessage('Payment was cancelled. Your quote is still waiting if you want to try again.');
      return;
    }
    const sessionId = params.get('session_id') || params.get('paid');
    if (!sessionId) {
      setState('error');
      setMessage('No payment was found on this page. If you already paid, check the email we sent.');
      return;
    }

    fetch(apiUrl('/api/stripe-confirm'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    })
      .then(async (res) => {
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(json.error || 'Could not confirm payment');
        }
        setState('ok');
        setMessage('Your trip is confirmed. A receipt is on the way.');
      })
      .catch((err) => {
        setState('error');
        setMessage(err.message || 'Payment may still be processing. We will email you when it is confirmed.');
      });
  }, []);

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <section className="py-24 px-4 text-center max-w-2xl mx-auto">
        <div className={`text-6xl mb-6 ${state === 'error' ? 'text-red-400' : 'text-[#D4AF37]'}`}>
          {state === 'loading' ? '…' : state === 'ok' ? '✓' : '!'}
        </div>
        <h1 className="text-4xl mb-4 text-[#D4AF37]">
          {state === 'ok' ? 'Payment received' : state === 'loading' ? 'Confirming payment' : 'Payment status'}
        </h1>
        <p className="text-gray-300 text-xl mb-10">{message}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            type="button"
            onClick={() => onNavigate?.(hasClientSession() ? 'account' : 'login')}
            className="px-8 py-3 bg-[#D4AF37] text-black hover:bg-[#B4941F]"
          >
            {hasClientSession() ? 'View my trips' : 'Sign in to view trips'}
          </button>
          <a href={`tel:${COMPANY.phoneTel}`} className="px-8 py-3 border border-[#D4AF37] text-[#D4AF37]">
            Call {COMPANY.phoneDisplay}
          </a>
        </div>
      </section>
    </div>
  );
}
