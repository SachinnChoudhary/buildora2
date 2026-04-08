'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, ArrowRight, Package } from 'lucide-react';
import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');
  const orderId = searchParams.get('order_id');

  return (
    <div className="flex-1 w-full flex items-center justify-center relative min-h-screen z-10 px-4 pt-24 pb-12">
      {/* Background Glow */}
      <div className="absolute inset-0 max-w-lg mx-auto h-[600px] bg-green-500/20 blur-[120px] rounded-full pointer-events-none -z-10" />
      
      <div className="glassmorphism p-10 md:p-14 rounded-3xl w-full max-w-xl text-center relative overflow-hidden border border-green-500/20 shadow-[0_0_80px_rgba(34,197,94,0.1)]">
        
        {/* Animated Check */}
        <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8 relative">
          <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping opacity-75" />
          <CheckCircle className="w-12 h-12 text-green-400 relative z-10" />
        </div>

        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 uppercase">
          Payment <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">Successful</span>
        </h1>
        
        <p className="text-gray-300 text-lg mb-8 leading-relaxed">
          Your order has been confirmed! You now have full access to the project source code and mentoring features.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {projectId && (
            <Link 
              href={`/projects/${projectId}`}
              className="w-full sm:w-auto px-8 py-4 bg-brand-purple hover:bg-brand-purple/90 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Package className="w-5 h-5" />
              View Your Project
            </Link>
          )}
          
          <Link 
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all group"
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        {/* Transaction ID Info */}
        {orderId && (
          <div className="mt-10 pt-8 border-t border-white/10">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 block">Transaction ID</span>
            <span className="font-mono text-xs md:text-sm text-gray-400 select-all">{orderId}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <main className="min-h-screen relative flex flex-col items-center">
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="pulse-dot w-8 h-8" />
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </main>
  );
}
