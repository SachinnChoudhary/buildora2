'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardSkeleton from '@/components/DashboardSkeleton';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  if (loading || !user) {
    if (loading) return <DashboardSkeleton />;
    return null; // Will redirect in page.tsx or we can redirect here
  }

  const tabs = [
    { name: 'Overview', href: '/dashboard' },
    { name: 'Profile', href: '/dashboard/profile' },
    { name: 'Orders', href: '/dashboard/orders' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-28 min-h-[80vh]">
      <div className="mb-6 border-b border-white/10 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2 uppercase tracking-tight">
            Welcome, <span className="text-gradient">{user.displayName || user.email?.split('@')[0]}</span>
          </h1>
          <p className="text-gray-400">Manage your profile, orders, and engineering projects.</p>
        </div>
        <Link href="/projects" className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest text-white transition-all border border-white/10 hover:border-white/30 backdrop-blur-sm">
          Browse Directory
        </Link>
      </div>

      {/* Sub-nav */}
      <div className="flex space-x-2 md:space-x-4 mb-8 overflow-x-auto pb-2 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all ${
                isActive 
                  ? 'bg-brand-purple text-white shadow-[0_0_15px_rgba(139,92,246,0.25)] border border-brand-purple/50' 
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5'
              }`}
            >
              {tab.name}
            </Link>
          );
        })}
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
        {children}
      </div>
    </div>
  );
}
