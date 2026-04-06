import React from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md">
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-purple to-brand-orange animate-orbit opacity-20 blur-xl"></div>
        <div className="relative z-10 w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-xl shadow-2xl">
           <span className="text-2xl font-black text-white">B</span>
        </div>
      </div>
      <LoadingSpinner label="Initializing Buildora Hub" size="lg" />
      <div className="absolute top-0 left-0 w-full overflow-hidden">
         <div className="loading-bar"></div>
      </div>
    </div>
  );
}
