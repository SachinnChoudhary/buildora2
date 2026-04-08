'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardSkeleton from '@/components/DashboardSkeleton';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Order {
  id: string;
  userId: string;
  projectId: string;
  status: string;
  createdAt: string;
}

interface CustomRequest {
  id: string;
  title: string;
  status: string;
  budget: string;
  deadline: string;
  createdAt: string;
  techStack?: string[];
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [customRequests, setCustomRequests] = useState<CustomRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [allProjects, setAllProjects] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch orders
        const ordersRes = await fetch(`/api/orders?userId=${user.uid}`);
        const ordersData = await ordersRes.json();
        if (ordersData.success) {
          setOrders(ordersData.data);
        }

        // Fetch custom requests
        const requestsRes = await fetch(`/api/custom-requests?userId=${user.uid}`);
        const requestsData = await requestsRes.json();
        if (requestsData.success) {
          setCustomRequests(requestsData.data);
        }

        // Fetch all projects (from Supabase/Firebase/local)
        const projectsRes = await fetch('/api/projects');
        const projectsData = await projectsRes.json();
        if (projectsData.success) {
          setAllProjects(projectsData.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading || !user) {
    return <DashboardSkeleton />;
  }

  const getProjectDetails = (projectId: string) => {
    return allProjects.find(p => p.id === projectId);
  };

  const getRecommendedProjects = () => {
    if (allProjects.length === 0) return [];
    
    if (orders.length === 0) {
      return allProjects.filter(p => p.featured).slice(0, 3);
    }
    
    // Simple recommendation: projects in same domain or with similar tech
    const purchasedProjectIds = orders.map(o => o.projectId);
    const purchasedProjects = purchasedProjectIds.map(id => getProjectDetails(id)).filter(Boolean);
    const purchasedDomains = new Set(purchasedProjects.map(p => p?.domain));
    
    return allProjects
      .filter(p => !purchasedProjectIds.includes(p.id))
      .filter(p => purchasedDomains.has(p.domain))
      .slice(0, 3);
  };

  const recommendations = getRecommendedProjects();

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
        {/* Welcome / Stats Widget */}
        <div className="glassmorphism p-6 sm:p-8 rounded-3xl col-span-1 lg:col-span-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-purple/10 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-brand-purple/20 transition-all duration-700 pointer-events-none"></div>
          <div className="relative z-10">
            <h2 className="text-xs font-bold text-brand-purple uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-brand-purple animate-pulse"></div>
               Engineer Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white/5 p-5 sm:p-6 rounded-2xl border border-white/10 backdrop-blur-md">
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Purchased</p>
                <p className="text-3xl sm:text-4xl font-black text-white">{orders.length}</p>
              </div>
              <div className="bg-white/5 p-5 sm:p-6 rounded-2xl border border-white/10 backdrop-blur-md">
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Custom Requests</p>
                <p className="text-3xl sm:text-4xl font-black text-brand-orange">{customRequests.length}</p>
              </div>
              <div className="bg-white/5 p-5 sm:p-6 rounded-2xl border border-white/10 backdrop-blur-md">
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Active Build</p>
                <p className="text-3xl sm:text-4xl font-black text-brand-purple">{customRequests.filter(r => r.status === 'in-progress').length || '-'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Widget */}
        <div className="glassmorphism p-8 rounded-3xl flex flex-col justify-center items-center text-center relative overflow-hidden group">
          <Link href="/custom-requests" className="absolute inset-0 bg-gradient-to-br from-brand-purple/5 to-brand-orange/5 opacity-0 group-hover:opacity-100 transition-opacity z-0"></Link>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-brand-purple/20 flex items-center justify-center mb-6 border border-brand-purple/30 group-hover:scale-110 transition-transform">
               <svg className="w-8 h-8 text-brand-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
               </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 uppercase tracking-tight">Need Something Unique?</h3>
            <p className="text-sm text-gray-400 mb-6 max-w-[200px]">Our elite developers can build any custom project architecture for you.</p>
            <Link href="/custom-requests" className="btn-gradient w-full py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-brand-purple/20">
              Request Custom &rarr;
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-12">
        <div className="xl:col-span-3 space-y-8">
          <div className="flex items-center gap-4 mb-2">
            <h2 className="text-2xl font-black uppercase tracking-tight">My Engineering Lab</h2>
            <div className="h-[1px] flex-grow bg-white/10"></div>
          </div>
          
          {isLoading ? (
            <div className="glassmorphism rounded-3xl p-12 border border-white/10">
              <LoadingSpinner label="Calibrating Engineering Lab..." size="lg" />
            </div>
          ) : orders.length === 0 && customRequests.length === 0 ? (
            <div className="glassmorphism rounded-3xl p-16 text-center border border-white/10 relative overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-purple/5 blur-[100px] rounded-full pointer-events-none"></div>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">Your lab is currently empty. Start by exploring our project directory or requesting a custom build.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/projects" className="px-10 py-4 bg-brand-purple hover:bg-brand-purple/80 text-white rounded-full text-xs font-bold uppercase tracking-widest transition-all">
                  Explore Directory
                </Link>
                <Link href="/custom-requests" className="px-10 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full text-xs font-bold uppercase tracking-widest transition-all">
                  Custom Request
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Purchased Projects */}
              {orders.map((order) => {
                const project = getProjectDetails(order.projectId);
                if (!project) return null;

                return (
                  <div key={order.id} className="glassmorphism p-6 sm:p-8 rounded-3xl flex flex-col justify-between items-stretch gap-6 border-l-4 border-l-brand-orange hover:bg-white/5 transition-all group">
                    <div className="flex-grow">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                        <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">{project.title}</h3>
                        <span className="inline-block w-fit px-3 py-1 bg-brand-orange/20 border border-brand-orange/30 rounded-full text-[9px] font-bold uppercase tracking-widest text-brand-orange">Ownership Confirmed</span>
                      </div>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                         <div>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">Purchased</p>
                            <p className="text-xs sm:text-sm font-semibold text-white">{new Date(order.createdAt).toLocaleDateString()}</p>
                         </div>
                         <div>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">Stack</p>
                            <p className="text-xs sm:text-sm font-semibold text-brand-purple">{project.techStack.slice(0, 2).join(', ')}</p>
                         </div>
                         <div className="col-span-2">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">Build Progress</p>
                            <div className="flex items-center gap-3">
                               <div className="flex-grow h-1.5 bg-white/10 rounded-full overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-brand-purple to-brand-orange w-[45%]"></div>
                                </div>
                               <span className="text-[9px] font-bold text-gray-400 whitespace-nowrap">45% COMPLETE</span>
                            </div>
                         </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link href={`/projects/${project.id}`} className="flex-1 py-3.5 bg-white/10 hover:bg-white/20 text-center rounded-xl text-[9px] font-black uppercase tracking-widest transition-all text-white border border-white/10">
                        Access Resources
                      </Link>
                      <button 
                        onClick={() => {
                          const botBtn = document.querySelector('[data-bot-trigger]') as HTMLButtonElement;
                          if (botBtn) botBtn.click();
                        }}
                        className="flex-1 py-3.5 bg-brand-purple/10 border border-brand-purple/30 hover:bg-brand-purple/20 text-center rounded-xl text-[9px] font-black uppercase tracking-widest transition-all text-brand-purple"
                      >
                        AI Mentor
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Custom Requests */}
              {customRequests.length > 0 && (
                <div className="mt-12 space-y-6">
                  <div className="flex items-center gap-4 mb-2">
                    <h2 className="text-xl font-black uppercase tracking-tight text-gray-400">Custom Engineering Builds</h2>
                    <div className="h-[1px] flex-grow bg-white/5"></div>
                  </div>
                  {customRequests.map((request) => (
                    <div key={request.id} className="glassmorphism p-6 sm:p-8 rounded-3xl flex flex-col justify-between items-stretch gap-6 border-l-4 border-l-brand-purple hover:bg-white/5 transition-all">
                      <div className="flex-grow">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                          <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">{request.title}</h3>
                          <span className={`inline-block w-fit px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                            request.status === 'pending' ? 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-300' :
                            request.status === 'in-progress' ? 'bg-blue-500/20 border border-blue-500/30 text-blue-300' :
                            'bg-green-500/20 border border-green-500/30 text-green-300'
                          }`}>
                            {request.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                           <div>
                              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">Budget</p>
                              <p className="text-white font-bold text-sm">{request.budget}</p>
                           </div>
                           <div>
                              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">Timeframe</p>
                              <p className="text-white font-bold text-sm">{request.deadline}</p>
                           </div>
                           <div className="col-span-2 md:col-span-1">
                              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">Tech Stack</p>
                              <p className="text-brand-purple font-semibold text-[10px] sm:text-xs">{request.techStack?.slice(0, 2).join(', ') || 'Auto-matching...'}</p>
                           </div>
                        </div>
                      </div>

                      <button className="w-full py-4 bg-white/5 border border-white/10 text-center rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-400 cursor-not-allowed">
                        {request.status === 'pending' ? 'Reviewing Vision' : 
                         request.status === 'in-progress' ? 'Engineering in Progress' : 
                         'Build Completed'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recommendations Column */}
        <div className="xl:col-span-1 space-y-8">
           <div className="flex items-center gap-4 mb-2">
            <h2 className="text-sm font-black uppercase tracking-widest text-gray-500">Recommended</h2>
            <div className="h-[1px] flex-grow bg-white/10"></div>
          </div>
          
          <div className="space-y-4">
             {recommendations.map(rec => (
                <Link key={rec.id} href={`/projects/${rec.id}`} className="block glassmorphism p-6 rounded-3xl border border-white/5 hover:border-brand-purple/30 transition-all group">
                   <p className="text-[10px] font-bold text-brand-purple uppercase tracking-widest mb-2">{rec.domain}</p>
                   <h4 className="text-lg font-bold text-white mb-2 uppercase tracking-tight group-hover:text-brand-purple transition-colors">{rec.title}</h4>
                   <p className="text-gray-500 text-xs mb-4 line-clamp-2">{rec.subtitle}</p>
                   <div className="flex items-center justify-between">
                      <span className="text-white font-bold">₹{rec.price}</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-orange group-hover:translate-x-1 transition-transform flex items-center gap-1">
                         View <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </span>
                   </div>
                </Link>
             ))}
             
             <div className="p-8 rounded-3xl bg-gradient-to-br from-brand-purple to-brand-orange text-center">
                <h4 className="font-bold text-white mb-2 uppercase tracking-tight">Expand Your Stack</h4>
                <p className="text-white/80 text-xs mb-6">Unlock higher engineering tiers with our major projects.</p>
                <Link href="/projects" className="inline-block bg-white text-brand-purple px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                   View Full Catalog
                </Link>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
