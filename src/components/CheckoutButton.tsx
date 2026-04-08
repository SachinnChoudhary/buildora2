'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2, CreditCard } from 'lucide-react';

interface CheckoutButtonProps {
  projectId: string;
  amount: number;
  projectTitle: string;
}

export default function CheckoutButton({ projectId, amount, projectTitle }: CheckoutButtonProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initialize Cashfree script on mount
    if (typeof window !== 'undefined' && !(window as any).Cashfree) {
      const script = document.createElement('script');
      script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleCheckout = async () => {
    if (authLoading) return;

    if (!user) {
      router.push(`/login?redirect=/projects/${projectId}`);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          projectId,
          amount,
        }),
      });

      const data = await response.json();

      if (data.success && data.data.paymentSessionId) {
        // Redirection to Cashfree payment page
        const cf = (window as any).Cashfree({
          mode: data.data.env === 'PROD' ? 'production' : 'sandbox'
        });
        cf.checkout({
          paymentSessionId: data.data.paymentSessionId,
          redirectTarget: "_self",
        });
      } else if (data.success && data.data.url) {
        // Mock fallback
        window.location.href = data.data.url;
      } else {
        alert(data.error || 'Failed to initiate checkout. Please try again.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={isLoading || authLoading}
      className="w-full btn-gradient py-4 rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2 group relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard className="w-5 h-5 relative z-10" />
          <span className="relative z-10">Get Full Source Code</span>
        </>
      )}
    </button>
  );
}
