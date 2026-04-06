import React from 'react';
import Skeleton from './Skeleton';

const AdminSkeleton: React.FC = () => {
  return (
    <main className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-slow-pulse">
      {/* Admin Header */}
      <div className="mb-10 space-y-4">
        <Skeleton variant="rectangular" width={140} height={28} className="rounded-full" />
        <Skeleton variant="text" width={300} height={56} className="rounded-2xl" />
        <Skeleton variant="text" width={400} height={20} className="rounded-lg" />
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-4 mb-10 overflow-x-auto pb-2">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Skeleton key={i} variant="rectangular" width={100} height={40} className="rounded-xl flex-shrink-0" />
        ))}
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="glassmorphism p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton variant="circular" width={32} height={32} />
              <div className="w-2 h-2 rounded-full bg-white/10" />
            </div>
            <Skeleton variant="text" width="60%" height={32} className="rounded-xl" />
            <Skeleton variant="text" width="40%" height={12} className="rounded-full opacity-50" />
          </div>
        ))}
      </div>

      {/* Table Skeleton Placeholder */}
      <div className="glassmorphism rounded-2xl p-6 space-y-6">
        <Skeleton variant="text" width={200} height={24} className="rounded-lg" />
        <div className="space-y-4 pt-4">
          <div className="flex justify-between pb-4 border-b border-white/5">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} variant="text" width={100} height={16} className="rounded-md opacity-30" />
            ))}
          </div>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex justify-between py-4 border-b border-white/5 last:border-0">
               {[1, 2, 3, 4, 5].map(j => (
                  <Skeleton key={j} variant="text" width={100} height={20} className="rounded-lg" />
               ))}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default AdminSkeleton;
