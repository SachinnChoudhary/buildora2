import React from 'react';
import Skeleton from './Skeleton';

const DashboardSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[80vh] animate-slow-pulse">
      {/* Header Skeleton */}
      <div className="mb-8 border-b border-white/10 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="space-y-4">
          <Skeleton variant="text" width={250} height={40} className="rounded-2xl" />
          <Skeleton variant="text" width={400} height={20} className="rounded-lg" />
        </div>
        <Skeleton variant="rectangular" width={160} height={48} className="rounded-full" />
      </div>

      {/* Grid Stats Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="glassmorphism p-8 rounded-3xl col-span-1 lg:col-span-2 space-y-6">
          <Skeleton variant="text" width={150} height={16} className="rounded-full mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Skeleton variant="rectangular" height={100} className="rounded-2xl" />
            <Skeleton variant="rectangular" height={100} className="rounded-2xl" />
            <Skeleton variant="rectangular" height={100} className="rounded-2xl" />
          </div>
        </div>
        <Skeleton variant="rectangular" height={240} className="rounded-3xl" />
      </div>

      {/* Lab Skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-12">
        <div className="xl:col-span-3 space-y-8">
          <div className="flex items-center gap-4 mb-2">
            <Skeleton variant="text" width={200} height={28} className="rounded-lg" />
            <div className="h-[1px] flex-grow bg-white/10"></div>
          </div>
          
          {[1, 2].map((i) => (
            <div key={i} className="glassmorphism p-8 rounded-3xl border-l-4 border-l-brand-orange/20">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Skeleton variant="text" width={300} height={32} className="rounded-xl" />
                  <Skeleton variant="rectangular" width={100} height={24} className="rounded-full" />
                </div>
                <Skeleton variant="text" height={20} className="rounded-lg" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4">
                  <Skeleton variant="rectangular" height={60} className="rounded-xl" />
                  <Skeleton variant="rectangular" height={60} className="rounded-xl" />
                  <Skeleton variant="rectangular" height={20} className="rounded-full col-span-2 mt-auto mb-auto" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Skeleton */}
        <div className="xl:col-span-1 space-y-8">
           <div className="flex items-center gap-4 mb-2">
            <Skeleton variant="text" width={120} height={14} className="rounded-full" />
            <div className="h-[1px] flex-grow bg-white/10"></div>
          </div>
          
          <div className="space-y-4">
             {[1, 2, 3].map(i => (
                <div key={i} className="glassmorphism p-6 rounded-3xl border border-white/5 space-y-3">
                   <Skeleton variant="text" width={80} height={10} className="rounded-full" />
                   <Skeleton variant="text" height={20} className="rounded-lg" />
                   <Skeleton variant="text" height={14} className="rounded-md opacity-50" />
                   <div className="flex justify-between pt-2">
                      <Skeleton variant="text" width={60} height={16} className="rounded-lg" />
                      <Skeleton variant="text" width={40} height={16} className="rounded-lg" />
                   </div>
                </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
