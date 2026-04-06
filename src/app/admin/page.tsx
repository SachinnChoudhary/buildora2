'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useFirestoreRealtime } from '@/hooks/useFirestore';
import { getUserProfile } from '@/services/firestore';

const TABS = ['Overview', 'Projects', 'Orders', 'Custom Requests', 'Users', 'Diagnostics'] as const;
type Tab = (typeof TABS)[number];

const statusColors: Record<string, string> = {
  completed: 'text-green-400 bg-green-400/10 border-green-400/20',
  refunded: 'text-red-400 bg-red-400/10 border-red-400/20',
  pending: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  in_progress: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
};

const DOMAINS = ['Web Development', 'Mobile App', 'AI / Machine Learning', 'Data Science', 'Blockchain', 'Cybersecurity', 'Cloud Computing', 'IoT'];
const TECH_STACKS = ['React', 'Next.js', 'Node.js', 'Python', 'Go', 'Firebase', 'Supabase', 'Tailwind CSS', 'MongoDB', 'PostgreSQL', 'Flutter', 'React Native'];
const TAGS = ['Fullstack', 'Frontend', 'Backend', 'Mini Project', 'Major Project', 'SaaS', 'Automation', 'Real-time'];

export default function AdminPanel() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('Overview');
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, totalUsers: 0, totalProjects: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  // Live Subscriptions - Only enable once authorized
  // Live Subscriptions
  const { data: liveOrders } = useFirestoreRealtime('orders', [], { enabled: !!isAuthorized });
  const { data: liveRequests } = useFirestoreRealtime('project_requests', [], { enabled: !!isAuthorized });
  const { data: liveUsers } = useFirestoreRealtime('users', [], { enabled: !!isAuthorized });
  const [liveProjects, setLiveProjects] = useState<any[]>([]);

  const fetchSupabaseProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (data.success) setLiveProjects(data.data);
    } catch (err) {
      console.error('Failed to sync with Supabase catalog', err);
    }
  };

  useEffect(() => {
    if (isAuthorized) fetchSupabaseProjects();
  }, [isAuthorized]);

  // Project Management State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    domain: '',
    difficulty: 'Mini' as 'Mini' | 'Major',
    price: 0,
    techStack: '',
    tags: '',
    description: '',
    featured: false,
    sourceType: 'zip' as 'zip' | 'link',
    externalRepoUrl: '',
    sourceFile: null as File | null,
    thumbnailFile: null as File | null
  });
  const [isUploading, setIsUploading] = useState(false);

  const toggleValue = (field: 'techStack' | 'tags', value: string) => {
    const currentValues = formData[field].split(',').map(v => v.trim()).filter(Boolean);
    if (currentValues.includes(value)) {
      setFormData({ ...formData, [field]: currentValues.filter(v => v !== value).join(', ') });
    } else {
      setFormData({ ...formData, [field]: [...currentValues, value].join(', ') });
    }
  };

  useEffect(() => {
    async function checkAccess() {
      if (authLoading) return;

      if (!user) {
        console.log("No user found in AdminPanel, redirecting to login");
        router.push('/login?redirect=/admin');
        return;
      }

      try {
        console.log("Checking admin access for:", user.uid);
        const profile = await getUserProfile(user.uid);
        console.log("Admin check profile result:", profile);
        if (profile && profile.role === 'admin') {
          console.log("Authorized as admin!");
          setIsAuthorized(true);
        } else {
          console.log("Not authorized as admin. Profile role:", profile?.role);
          setIsAuthorized(false);
          router.push('/dashboard');
        }
      } catch (err: any) {
        console.error("Authorization check failed with error:", err.message);
        setIsAuthorized(false);
        router.push('/login');
      }
    }

    checkAccess();
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
        }
      } catch (err) {
        console.error('Failed to fetch admin stats', err);
      } finally {
        setStatsLoading(false);
      }
    };
    if (isAuthorized) {
      fetchStats();
    }
  }, [isAuthorized]);

  // Loading state
  if (authLoading || isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm font-medium uppercase tracking-widest">Verifying Admin Access...</p>
        </div>
      </div>
    );
  }

  // Final check to prevent any UI leaks
  if (isAuthorized === false) return null;

  const totalRevenue = stats.totalRevenue;
  const totalOrders = liveOrders.length || stats.totalOrders;
  const totalUsers = liveUsers.length || stats.totalUsers;
  const totalProjects = liveProjects.length || stats.totalProjects;
  
  const handleOpenModal = (project?: any) => {
    if (project) {
      setModalMode('edit');
      setEditingId(project.id);
      setFormData({
        title: project.title,
        subtitle: project.subtitle,
        domain: project.domain,
        difficulty: project.difficulty,
        price: project.price,
        techStack: Array.isArray(project.techStack) ? project.techStack.join(', ') : project.techStack,
        tags: Array.isArray(project.tags) ? project.tags.join(', ') : (project.tags || ''),
        description: project.description || '',
        featured: project.featured || false,
        sourceType: project.externalRepoUrl ? 'link' : 'zip',
        externalRepoUrl: project.externalRepoUrl || '',
        sourceFile: null,
        thumbnailFile: null
      });
    } else {
      setModalMode('add');
      setEditingId(null);
      setFormData({
        title: '',
        subtitle: '',
        domain: '',
        difficulty: 'Mini',
        price: 0,
        techStack: '',
        tags: '',
        description: '',
        featured: false,
        sourceType: 'zip',
        externalRepoUrl: '',
        sourceFile: null,
        thumbnailFile: null
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      const { createSupabaseProject, updateSupabaseProject } = await import ('@/services/supabaseProjects');
      
      const projectPayload = {
        ...formData,
        techStack: formData.techStack.split(',').map(s => (s as string).trim()).filter(Boolean),
        tags: formData.tags.split(',').map(s => (s as string).trim()).filter(Boolean),
        sourceFile: formData.sourceType === 'zip' ? formData.sourceFile : null,
        externalRepoUrl: formData.sourceType === 'link' ? formData.externalRepoUrl : '',
        updatedAt: new Date().toISOString()
      };

      if (modalMode === 'edit' && editingId) {
        await updateSupabaseProject(editingId, projectPayload);
      } else {
        await createSupabaseProject(projectPayload);
      }
      setIsModalOpen(false);
      await fetchSupabaseProjects(); // Real-time refresh
    } catch (err: any) {
      console.error('Error saving project to Supabase:', err);
      alert(`Failed to save: ${err.message || 'Check your Supabase configuration'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        const { deleteSupabaseProject } = await import('@/services/supabaseProjects');
        await deleteSupabaseProject(id);
      } catch (err: any) {
        console.error('Error deleting project from Supabase:', err);
        alert('Failed to delete project. You might need to check your Supabase Storage policies.');
      }
    }
  };

  return (
    <main className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Modal Backdrop */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-2xl glassmorphism border border-white/10 rounded-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6 uppercase tracking-tight">
              {modalMode === 'edit' ? 'Edit Project' : 'Add New Project'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Title</label>
                  <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-white" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Domain</label>
                  <input required value={formData.domain} onChange={e => setFormData({...formData, domain: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-brand-purple/50 transition-colors" />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {DOMAINS.map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setFormData({ ...formData, domain: d })}
                        className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all border ${
                          formData.domain === d 
                            ? 'bg-brand-purple/20 border-brand-purple/40 text-brand-purple' 
                            : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Subtitle</label>
                  <input required value={formData.subtitle} onChange={e => setFormData({...formData, subtitle: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-white" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Description</label>
                  <textarea required rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-white" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Difficulty</label>
                  <select value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: e.target.value as any})} className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-white">
                    <option value="Mini">Mini</option>
                    <option value="Major">Major</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Price (₹)</label>
                  <input type="number" required value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-white" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Tech Stack (comma separated)</label>
                  <input required value={formData.techStack} onChange={e => setFormData({...formData, techStack: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-brand-purple/50 transition-colors" placeholder="React, Next.js, Firebase..." />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {TECH_STACKS.map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleValue('techStack', t)}
                        className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all border ${
                          formData.techStack.includes(t)
                            ? 'bg-brand-orange/20 border-brand-orange/40 text-brand-orange' 
                            : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Tags (comma separated)</label>
                  <input required value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-brand-purple/50 transition-colors" placeholder="Fullstack, AI, Automation..." />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {TAGS.map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleValue('tags', t)}
                        className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all border ${
                          formData.tags.includes(t)
                            ? 'bg-brand-purple/20 border-brand-purple/40 text-brand-purple' 
                            : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Source Selection */}
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase mb-3 block">Source Code Delivery Method</label>
                  <div className="flex gap-4 p-1 bg-white/5 border border-white/10 rounded-xl w-fit">
                    <button 
                      type="button" 
                      onClick={() => setFormData({...formData, sourceType: 'zip'})}
                      className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${formData.sourceType === 'zip' ? 'bg-brand-purple text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                    >
                      UPLOAD ZIP
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setFormData({...formData, sourceType: 'link'})}
                      className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${formData.sourceType === 'link' ? 'bg-brand-orange text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                    >
                      REPO LINK
                    </button>
                  </div>
                </div>

                {/* File Uploads (Conditional) */}
                {formData.sourceType === 'zip' ? (
                  <div className={modalMode === 'edit' ? 'opacity-50' : ''}>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Source Code (ZIP)</label>
                    <input 
                      type="file" 
                      accept=".zip" 
                      required={modalMode === 'add'}
                      onChange={e => setFormData({...formData, sourceFile: e.target.files?.[0] || null})} 
                      className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand-orange file:text-white hover:file:bg-brand-orange/80" 
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Repository Link (GitHub/GitLab)</label>
                    <input 
                      type="url" 
                      required={formData.sourceType === 'link'}
                      value={formData.externalRepoUrl}
                      onChange={e => setFormData({...formData, externalRepoUrl: e.target.value})} 
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-white"
                      placeholder="https://github.com/..."
                    />
                  </div>
                )}

                <div className={modalMode === 'edit' ? 'opacity-50' : ''}>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Thumbnail (PNG/JPG)</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    required={modalMode === 'add'}
                    onChange={e => setFormData({...formData, thumbnailFile: e.target.files?.[0] || null})} 
                    className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand-purple file:text-white hover:file:bg-brand-purple/80" 
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-lg text-sm font-bold text-gray-400 hover:text-white transition-colors">CANCEL</button>
                <button 
                  type="submit" 
                  disabled={isUploading}
                  className={`btn-gradient px-8 py-2 rounded-lg text-sm flex items-center gap-2 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      UPLOADING...
                    </>
                  ) : 'SAVE PROJECT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mb-10">
        <span className="pill-badge mb-6">ADMIN PANEL</span>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mt-4 uppercase">
          Control <span className="text-gradient">Center</span>
        </h1>
        <p className="text-gray-500 text-sm mt-2">Manage projects, orders, users, and custom requests.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-10 overflow-x-auto pb-2">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${tab === t ? 'bg-brand-purple/20 text-brand-purple border border-brand-purple/30' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {tab === 'Overview' && (
        <div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {[
              { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: '💰' },
              { label: 'Total Orders', value: totalOrders.toString(), icon: '📦' },
              { label: 'Registered Users', value: totalUsers.toString(), icon: '👥' },
              { label: 'Projects Listed', value: totalProjects.toString(), icon: '🧩' },
            ].map(stat => (
              <div key={stat.label} className="glassmorphism p-6 rounded-2xl">
                <div className="items-center justify-between mb-4 flex">
                  <span className="text-2xl">{stat.icon}</span>
                  <div className="pulse-dot" />
                </div>
                <p className="text-3xl font-black text-white mb-1">{stat.value}</p>
                <p className="text-gray-500 text-xs uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Recent orders */}
          <h3 className="text-xl font-bold text-white mb-4 uppercase tracking-tight">Recent Orders</h3>
          <div className="glassmorphism rounded-2xl overflow-hidden mb-10">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider p-4">Order ID</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider p-4">User</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider p-4">Project</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider p-4">Amount</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider p-4">Status</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider p-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {liveOrders.slice(0, 5).map((order: any) => (
                    <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 text-sm font-mono text-gray-400">{order.id}</td>
                      <td className="p-4 text-sm text-white">{order.email || order.user}</td>
                      <td className="p-4 text-sm text-gray-300">{order.projectTitle || order.project}</td>
                      <td className="p-4 text-sm text-white font-bold">₹{(order.amount || 0).toLocaleString('en-IN')}</td>
                      <td className="p-4">
                        <span className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border ${statusColors[order.status || 'pending']}`}>
                          {order.status || 'pending'}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-500">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : order.date || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pending custom requests */}
          <h3 className="text-xl font-bold text-white mb-4 uppercase tracking-tight">Pending Custom Requests</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveRequests.filter((r: any) => r.status === 'pending').map((req: any) => (
              <div key={req.id} className="glassmorphism p-6 rounded-2xl hover:border-brand-purple/20 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-white font-bold">{req.title || req.projectTitle}</span>
                  <span className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border ${statusColors[req.status || 'pending']}`}>
                    {(req.status || 'pending').replace('_', ' ')}
                  </span>
                </div>
                <p className="text-gray-500 text-xs mb-1">{req.email || req.contactName}</p>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/10">
                  <span className="text-brand-orange font-bold text-sm">₹{req.budget}</span>
                  <span className="text-gray-500 text-xs">{req.createdAt ? new Date(req.createdAt).toLocaleDateString() : req.date || 'N/A'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Projects tab ── */}
      {tab === 'Projects' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-400 text-sm">{liveProjects.length} projects listed</p>
            <button onClick={() => handleOpenModal()} className="btn-gradient text-[10px] px-6 py-2.5">+ ADD PROJECT</button>
          </div>
          <div className="glassmorphism rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider p-4">Title</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider p-4">Domain</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider p-4">Level</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider p-4">Price</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider p-4">Featured</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {liveProjects.map((project: any) => (
                    <tr key={project.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <p className="text-white font-bold text-sm">{project.title}</p>
                        <p className="text-gray-500 text-xs">{project.subtitle}</p>
                      </td>
                      <td className="p-4 text-sm text-gray-400">{project.domain}</td>
                      <td className="p-4">
                        <span className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border ${project.difficulty === 'Major' ? 'text-brand-orange border-brand-orange/30 bg-brand-orange/10' : 'text-brand-purple border-brand-purple/30 bg-brand-purple/10'}`}>
                          {project.difficulty}
                        </span>
                      </td>
                      <td className="p-4 text-white font-bold text-sm">₹{(project.price || 0).toLocaleString('en-IN')}</td>
                      <td className="p-4">
                        {project.featured ? (
                          <span className="text-green-400 text-xs">● Yes</span>
                        ) : (
                          <span className="text-gray-500 text-xs">○ No</span>
                        )}
                      </td>
                      <td className="p-4 flex gap-2">
                        <button onClick={() => handleOpenModal(project)} className="text-xs text-brand-purple hover:text-white transition-colors">Edit</button>
                        <button onClick={() => handleDelete(project.id)} className="text-xs text-red-400 hover:text-red-300 transition-colors">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Orders tab ── */}
      {tab === 'Orders' && (
        <div className="glassmorphism rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider p-4">Order ID</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider p-4">User</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider p-4">Project</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider p-4">Amount</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider p-4">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider p-4">Date</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {liveOrders.map((order: any) => (
                  <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 text-sm font-mono text-gray-400">{order.id}</td>
                    <td className="p-4 text-sm text-white">{order.email || order.user}</td>
                    <td className="p-4 text-sm text-gray-300">{order.projectTitle || order.project}</td>
                    <td className="p-4 text-sm text-white font-bold">₹{(order.amount || 0).toLocaleString('en-IN')}</td>
                    <td className="p-4">
                      <span className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border ${statusColors[order.status || 'pending']}`}>
                        {order.status || 'pending'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-500">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : order.date || 'N/A'}</td>
                    <td className="p-4">
                      <button className="text-xs text-brand-purple hover:text-white transition-colors">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Custom Requests tab ── */}
      {tab === 'Custom Requests' && (
        <div className="glassmorphism rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider p-4">ID</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider p-4">User</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider p-4">Title</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider p-4">Budget</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider p-4">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider p-4">Date</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {liveRequests.map((req: any) => (
                  <tr key={req.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 text-sm font-mono text-gray-400">{req.id}</td>
                    <td className="p-4 text-sm text-white">{req.email || req.contactName}</td>
                    <td className="p-4 text-sm text-gray-300">{req.title || req.projectTitle}</td>
                    <td className="p-4 text-sm text-brand-orange font-bold">₹{req.budget}</td>
                    <td className="p-4">
                      <span className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border ${statusColors[req.status || 'pending']}`}>
                        {(req.status || 'pending').replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-500">{req.createdAt ? new Date(req.createdAt).toLocaleDateString() : req.date || 'N/A'}</td>
                    <td className="p-4 flex gap-2">
                      <button className="text-xs text-brand-purple hover:text-white transition-colors">Assign</button>
                      <button className="text-xs text-green-400 hover:text-green-300 transition-colors">Approve</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Users tab ── */}
      {tab === 'Users' && (
        <div>
          <p className="text-gray-400 text-sm mb-6">{liveUsers.length} registered users</p>
          <div className="glassmorphism rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider p-4">User</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider p-4">Email</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider p-4">Role</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider p-4">Orders</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider p-4">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {liveUsers.map((u: any) => (
                    <tr key={u.email || u.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-purple to-brand-orange flex items-center justify-center text-xs font-bold text-white">
                          {(u.displayName || u.name || 'U').charAt(0)}
                        </div>
                        <span className="text-white text-sm font-medium">{u.displayName || u.name || 'User'}</span>
                      </td>
                      <td className="p-4 text-sm text-gray-400">{u.email}</td>
                      <td className="p-4">
                        <span className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border ${u.role === 'admin' ? 'text-brand-orange border-brand-orange/30 bg-brand-orange/10' : 'text-gray-400 border-white/10 bg-white/5'}`}>
                          {u.role || 'student'}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-white">{u.stats?.projectsCompleted || 0}</td>
                      <td className="p-4 text-sm text-gray-500">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {/* ── Diagnostics tab ── */}
      {tab === 'Diagnostics' && <DiagnosticsPanel />}
    </main>
  );
}

function DiagnosticsPanel() {
  const [results, setResults] = useState<Record<string, { status: 'loading' | 'success' | 'error', message: string }>>({
    firebase: { status: 'loading', message: 'Checking...' },
    supabase_db: { status: 'loading', message: 'Checking...' },
    supabase_storage: { status: 'loading', message: 'Checking...' },
    gemini: { status: 'loading', message: 'Checking...' },
  });

  const runAllTests = async () => {
    setResults({
      firebase: { status: 'loading', message: 'Checking...' },
      supabase_db: { status: 'loading', message: 'Checking...' },
      supabase_storage: { status: 'loading', message: 'Checking...' },
      gemini: { status: 'loading', message: 'Checking...' },
    });

    // 1. Firebase Check
    try {
      const { db } = await import('@/lib/firebase');
      const { doc, getDoc, setDoc, serverTimestamp } = await import('firebase/firestore');
      const testRef = doc(db, 'system_checks', 'health');
      await setDoc(testRef, { lastCheck: serverTimestamp() }, { merge: true });
      const snap = await getDoc(testRef);
      if (snap.exists()) {
        setResults(prev => ({ ...prev, firebase: { status: 'success', message: 'Firestore Connection OK' } }));
      }
    } catch (err: any) {
      setResults(prev => ({ ...prev, firebase: { status: 'error', message: `Firestore Error: ${err.message}` } }));
    }

    // 2. Supabase DB Check
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data, error } = await supabase.from('projects').select('id').limit(1);
      if (error) throw error;
      setResults(prev => ({ ...prev, supabase_db: { status: 'success', message: `Connected to Projects table (${data.length} records found)` } }));
    } catch (err: any) {
      setResults(prev => ({ ...prev, supabase_db: { status: 'error', message: `Supabase DB Error: ${err.message}` } }));
    }

    // 3. Supabase Storage Check
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data, error } = await supabase.storage.getBucket('projects');
      if (error) throw error;
      setResults(prev => ({ ...prev, supabase_storage: { status: 'success', message: `Bucket 'projects' found (Public: ${data.public ? 'YES' : 'NO'})` } }));
    } catch (err: any) {
      setResults(prev => ({ ...prev, supabase_storage: { status: 'error', message: `Storage Error: ${err.message}. Ensure bucket 'projects' exists and is Public.` } }));
    }

    // 4. Gemini AI Check
    try {
      const res = await fetch('/api/bot', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'health_check_ping', history: [] }) 
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResults(prev => ({ ...prev, gemini: { status: 'success', message: 'AI Mentor Response OK' } }));
    } catch (err: any) {
      setResults(prev => ({ ...prev, gemini: { status: 'error', message: `AI Error: ${err.message}` } }));
    }
  };

  useEffect(() => {
    runAllTests();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-tight mt-0">System Health</h2>
          <p className="text-gray-500 text-xs mt-1">Verify real-time connectivity to all external services.</p>
        </div>
        <button onClick={runAllTests} className="btn-gradient px-6 py-2.5 text-[10px] uppercase font-bold tracking-widest">RE-RUN ALL TESTS</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(results).map(([service, res]) => (
          <div key={service} className="glassmorphism p-6 rounded-2xl border border-white/5">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{service.replace('_', ' ')}</span>
              {res.status === 'loading' ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : res.status === 'success' ? (
                <span className="text-green-400 text-xs font-bold">● ONLINE</span>
              ) : (
                <span className="text-red-400 text-xs font-bold">● FAILURE</span>
              )}
            </div>
            <p className={`text-sm font-medium ${res.status === 'error' ? 'text-red-300' : 'text-white'}`}>{res.message}</p>
            {res.status === 'error' && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-[10px] text-red-200">💡 Tip: Check your .env.local credentials and RLS policies in the dashboard.</p>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-10 p-6 glassmorphism rounded-2xl border border-white/10 bg-brand-purple/5">
        <h3 className="text-sm font-bold text-white uppercase mb-2">Diagnostic Log</h3>
        <p className="text-xs text-gray-400 leading-relaxed italic">
          If you are seeing a "Row-Level Security policy" error on Supabase, ensure you have run the fix SQL I provided in the dashboard. For "Bucket not found" errors, create a bucket named 'projects' in Supabase Storage with 'Public' access enabled.
        </p>
      </div>
    </div>
  );
}
