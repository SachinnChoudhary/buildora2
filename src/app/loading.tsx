import React from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07090E] backdrop-blur-md">
      <LoadingSpinner size="lg" label="Building Experience..." />
    </div>
  );
}
