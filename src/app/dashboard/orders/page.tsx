'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Order {
  id: string;
  userId: string;
  projectId: string;
  status: string;
  createdAt: string;
  razorpayOrderId?: string;
  cfOrderId?: string;
  amount?: number;
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch orders
        const ordersRes = await fetch(`/api/orders?userId=${user.uid}`);
        const ordersData = await ordersRes.json();
        if (ordersData.success) {
          // Sort by newest first
          const sortedOrders = ordersData.data.sort((a: any, b: any) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setOrders(sortedOrders);
        }

        // Fetch all projects mapping
        const projectsRes = await fetch('/api/projects');
        const projectsData = await projectsRes.json();
        if (projectsData.success) {
          setAllProjects(projectsData.data);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const getProjectDetails = (projectId: string) => {
    return allProjects.find(p => p.id === projectId);
  };

  if (loading) {
    return (
      <div className="glassmorphism rounded-3xl p-12 border border-white/10 flex justify-center">
        <LoadingSpinner label="Fetching Order History..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {orders.length === 0 ? (
        <div className="glassmorphism rounded-3xl p-16 text-center border border-white/10 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-orange/5 blur-[100px] rounded-full pointer-events-none"></div>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">You have not purchased any engineering packages yet.</p>
          <Link href="/projects" className="inline-block px-10 py-4 bg-brand-orange hover:bg-brand-orange/80 text-white rounded-full text-xs font-bold uppercase tracking-widest transition-all">
            Browse Directory
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {orders.map((order) => {
            const project = getProjectDetails(order.projectId);
            if (!project) return null;

            return (
              <div key={order.id} className="glassmorphism p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row gap-6 border border-white/10 hover:border-brand-orange/30 transition-all group overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/5 blur-[50px] rounded-full pointer-events-none group-hover:bg-brand-orange/10 transition-colors duration-500"></div>
                
                {/* Thumbnail */}
                <div className="w-full md:w-48 h-32 md:h-auto rounded-2xl overflow-hidden flex-shrink-0 bg-white/5 relative border border-white/10">
                  {project.thumbnailUrl ? (
                    <img src={project.thumbnailUrl} alt={project.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20 text-4xl font-black">{project.title.charAt(0)}</div>
                  )}
                  <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[8px] font-bold text-white uppercase tracking-widest border border-white/10">
                    {project.domain}
                  </div>
                </div>

                {/* Details */}
                <div className="flex-grow flex flex-col justify-center">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">{project.title}</h3>
                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[9px] font-bold uppercase tracking-widest whitespace-nowrap">
                      {order.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2">{project.subtitle || project.description}</p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-auto">
                    <div>
                      <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Order Date</p>
                      <p className="text-xs text-white font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Order Ref</p>
                      <p className="text-xs text-gray-300 font-mono">{order.cfOrderId || order.id.slice(0, 8)}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="w-full md:w-48 flex flex-col gap-3 justify-center border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-6">
                  <Link 
                    href={`/projects/${project.id}`} 
                    className="w-full py-3 bg-brand-orange text-white text-center rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-brand-orange/80 shadow-[0_0_15px_rgba(249,115,22,0.2)]"
                  >
                    View Project
                  </Link>
                  <Link 
                    href={`/projects/${project.id}`} 
                    className="w-full py-3 bg-white/5 text-white border border-white/10 text-center rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-white/10 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Downloads
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
