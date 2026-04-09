'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useFirestoreRealtime } from '@/hooks/useFirestore';
import { getUserProfile } from '@/services/firestore';
import { createSupabaseProject, updateSupabaseProject, deleteSupabaseProject } from '@/services/supabaseProjects';
import AdminSkeleton from '@/components/AdminSkeleton';
import Toast from '@/components/Toast';

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

  // Live Subscriptions
  const { data: liveOrders } = useFirestoreRealtime('orders', [], { enabled: !!isAuthorized });
  const [liveRequests, setLiveRequests] = useState<any[]>([]);
  const { data: liveUsers } = useFirestoreRealtime('users', [], { enabled: !!isAuthorized });
  const [liveProjects, setLiveProjects] = useState<any[]>([]);

  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState<string>('');
  const [requestStatusFilter, setRequestStatusFilter] = useState<string>('all');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isRequestEditingEnabled, setIsRequestEditingEnabled] = useState(false);
  const [editingRequest, setEditingRequest] = useState<any>(null);
  const [requestNotesData, setRequestNotesData] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const formatBudget = (budget: any) => {
    if (!budget || String(budget).toLowerCase() === 'flexible') return 'Flexible';
    return '₹' + String(budget).replace(/^[₹$\s]+/, '');
  };

  const saveCustomRequestUpdates = async () => {
    if (!editingRequest) return;
    try {
      setLiveRequests(prev => prev.map(req => req.id === editingRequest.id ? {...req, ...editingRequest} : req));
      const payload = { ...editingRequest };
      
      const res = await fetch('/api/custom-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!data.success) {
        console.error('Failed to update request details', data.error);
        fetchCustomRequests();
        setToastType('error');
        setToastMessage('Failed to save details');
      } else {
        setToastType('success');
        setToastMessage('Details & Commits saved successfully!');
        setIsRequestModalOpen(false);
      }
    } catch (err) {
      console.error('Error updating details', err);
      fetchCustomRequests();
      setToastType('error');
      setToastMessage('An error occurred during save');
    }
  };

  const updateCustomRequestStatus = async (id: string, newStatus: string, newNotes?: string) => {
    try {
      setLiveRequests(prev => prev.map(req => req.id === id ? { ...req, status: newStatus || req.status, adminNotes: newNotes !== undefined ? newNotes : req.adminNotes } : req));
      
      const payload: any = { id };
      if (newStatus) payload.status = newStatus;
      if (newNotes !== undefined) payload.adminNotes = newNotes;

      const res = await fetch('/api/custom-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!data.success) {
        console.error('Failed to update status', data.error);
        fetchCustomRequests();
      }
    } catch (err) {
      console.error('Error updating status', err);
      fetchCustomRequests();
    }
  };

  const fetchSupabaseProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (data.success) setLiveProjects(data.data);
    } catch (err) {
      console.error('Failed to sync with Supabase catalog', err);
    }
  };

  const fetchCustomRequests = async () => {
    try {
      const res = await fetch('/api/custom-requests?all=true');
      const data = await res.json();
      if (data.success) setLiveRequests(data.data);
    } catch (err) {
      console.error('Failed to fetch custom requests', err);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchSupabaseProjects();
      fetchCustomRequests();
    }
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isGeneratingDetails, setIsGeneratingDetails] = useState(false);

  // Order Management State
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [isOrderUpdating, setIsOrderUpdating] = useState(false);

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
        router.push('/login?redirect=/admin');
        return;
      }

      try {
        const profile = await getUserProfile(user.uid);
        if (profile && profile.role === 'admin') {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
          router.push('/dashboard');
        }
      } catch (err: any) {
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

  if (authLoading || isAuthorized === null) {
    return <AdminSkeleton />;
  }

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
    setUploadProgress(0);
    try {
      const projectPayload = {
        ...formData,
        techStack: formData.techStack.split(',').map(s => (s as string).trim()).filter(Boolean),
        tags: formData.tags.split(',').map(s => (s as string).trim()).filter(Boolean),
        sourceFile: formData.sourceType === 'zip' ? formData.sourceFile : null,
        externalRepoUrl: formData.sourceType === 'link' ? formData.externalRepoUrl : '',
        updatedAt: new Date().toISOString(),
        onProgress: (p: number) => setUploadProgress(p)
      };

      if (modalMode === 'edit' && editingId) {
        await updateSupabaseProject(editingId, projectPayload);
      } else {
        await createSupabaseProject(projectPayload);
      }
      setIsModalOpen(false);
      await fetchSupabaseProjects();
    } catch (err: any) {
      console.error('Error saving project to Supabase:', err);
      alert(`Failed to save: ${err.message || 'Check your Supabase configuration'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateDetails = async () => {
    if (!formData.title) return;
    setIsGeneratingDetails(true);
    try {
      const res = await fetch('/api/generate-project-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: formData.title })
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error);
      }
      setFormData(prev => ({
        ...prev,
        domain: data.data.domain || prev.domain,
        subtitle: data.data.subtitle || prev.subtitle,
        description: data.data.description || prev.description,
        techStack: data.data.techStack || prev.techStack,
        tags: data.data.tags || prev.tags,
        difficulty: data.data.difficulty || prev.difficulty
      }));
      setToastType('success');
      setToastMessage('Details automatically generated using Gemini AI!');
    } catch (err: any) {
      console.error('Failed to generate details:', err);
      setToastType('error');
      setToastMessage(err.message || 'Failed to auto-fill details');
    } finally {
      setIsGeneratingDetails(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteSupabaseProject(id);
        await fetchSupabaseProjects();
      } catch (err: any) {
        console.error('Error deleting project from Supabase:', err);
        alert('Failed to delete project.');
      }
    }
  };

  const handleOrderSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsOrderUpdating(true);
    try {
      const { db } = await import('@/lib/firebase');
      const { doc, updateDoc } = await import('firebase/firestore');
      const orderRef = doc(db, 'orders', editingOrder.id);
      await updateDoc(orderRef, {
        status: editingOrder.status,
        amount: editingOrder.amount,
      });
      setIsOrderModalOpen(false);
    } catch (err: any) {
      console.error('Failed to update order', err);
      alert('Failed to update order: ' + err.message);
    } finally {
      setIsOrderUpdating(false);
    }
  };

  return (
    <main className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {toastMessage && (
        <Toast
          type={toastType}
          title={toastType === 'success' ? 'Success' : 'Error'}
          message={toastMessage}
          onClose={() => setToastMessage('')}
        />
      )}
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
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Title</label>
                  <div className="flex gap-2">
                    <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-white flex-1" />
                    <button type="button" onClick={handleGenerateDetails} disabled={isGeneratingDetails || !formData.title} className="bg-brand-purple/20 text-brand-purple hover:bg-brand-purple/30 px-4 py-2 rounded-lg text-xs font-bold uppercase transition flex items-center gap-2 min-w-max disabled:opacity-50 border border-brand-purple/30">
                      {isGeneratingDetails ? 'GENERATING...' : '✨ AUTO-FILL'}
                    </button>
                  </div>
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
                      {uploadProgress > 0 && uploadProgress < 100 ? `UPLOADING (${uploadProgress}%)` : 'UPLOADING...'}
                    </>
                  ) : 'SAVE PROJECT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Modal Backdrop */}
      {isOrderModalOpen && editingOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsOrderModalOpen(false)}></div>
          <div className="relative w-full max-w-xl glassmorphism border border-white/10 rounded-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
             <h2 className="text-2xl font-bold text-white mb-6 uppercase tracking-tight">
               Edit Order {editingOrder.id}
             </h2>
             <form onSubmit={handleOrderSave} className="space-y-4">
               <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Status</label>
                  <select value={editingOrder.status} onChange={e => setEditingOrder({...editingOrder, status: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-brand-purple/50 transition-colors">
                    <option value="pending" className="bg-[#0f1115]">pending</option>
                    <option value="completed" className="bg-[#0f1115]">completed</option>
                    <option value="refunded" className="bg-[#0f1115]">refunded</option>
                    <option value="in_progress" className="bg-[#0f1115]">in_progress</option>
                  </select>
               </div>
               <div>
                 <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Amount (₹)</label>
                 <input type="number" value={editingOrder.amount || 0} onChange={e => setEditingOrder({...editingOrder, amount: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-brand-purple/50 transition-colors" />
               </div>
               <div className="flex justify-end gap-3 mt-8">
                 <button type="button" onClick={() => setIsOrderModalOpen(false)} className="px-6 py-2 rounded-lg text-sm font-bold text-gray-400 hover:text-white transition-colors">CANCEL</button>
                 <button type="submit" disabled={isOrderUpdating} className={`btn-gradient px-8 py-2 rounded-lg text-sm flex items-center gap-2 ${isOrderUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {isOrderUpdating ? 'SAVING...' : 'SAVE ORDER'}
                 </button>
               </div>
             </form>
          </div>
        </div>
      )}

      {/* Custom Request Detail Modal */}
      {isRequestModalOpen && editingRequest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsRequestModalOpen(false)}></div>
          <div className="relative w-full max-w-3xl glassmorphism border border-white/10 rounded-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">Request Details</h3>
              <button 
                onClick={() => setIsRequestEditingEnabled(!isRequestEditingEnabled)}
                className={`text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-lg border transition-colors ${
                  isRequestEditingEnabled ? 'bg-brand-purple/20 text-brand-purple border-brand-purple/30' : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'
                }`}
              >
                {isRequestEditingEnabled ? 'Cancel Editing' : 'Edit Fields'}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="glassmorphism p-4 border border-white/5 rounded-xl">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Display ID</p>
                <p className="text-white font-mono text-xs">{editingRequest.displayId || editingRequest.id}</p>
              </div>
              <div className="glassmorphism p-4 border border-white/5 rounded-xl">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Status</p>
                <div className="mt-1 flex flex-col items-start gap-2">
                  <span className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border ${statusColors[editingRequest.status || 'pending']}`}>
                    {(editingRequest.status || 'pending').replace('_', ' ')}
                  </span>
                  <select 
                    value={editingRequest.status}
                    onChange={(e) => updateCustomRequestStatus(editingRequest.id, e.target.value, undefined)}
                    className="bg-white/5 border border-white/10 text-white text-xs rounded-lg px-3 py-1.5 outline-none focus:border-brand-purple w-full transition-colors"
                  >
                     <option value="pending" className="bg-[#0f1115]">Pending</option>
                     <option value="in_progress" className="bg-[#0f1115]">In Progress</option>
                     <option value="completed" className="bg-[#0f1115]">Completed</option>
                     <option value="refunded" className="bg-[#0f1115]">Refunded</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="glassmorphism p-5 border border-white/5 rounded-xl space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Customer</p>
                  {isRequestEditingEnabled ? (
                    <input 
                      value={editingRequest.contactName || ''} 
                      onChange={e => setEditingRequest({...editingRequest, contactName: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 text-white text-sm font-bold rounded-lg px-3 py-2 outline-none focus:border-brand-purple transition-colors"
                    />
                  ) : (
                    <p className="text-white text-sm font-bold">{editingRequest.contactName || editingRequest.userId}</p>
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Email</p>
                  {isRequestEditingEnabled ? (
                    <input 
                      value={editingRequest.email || ''} 
                      onChange={e => setEditingRequest({...editingRequest, email: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 text-white text-xs rounded-lg px-3 py-2 outline-none focus:border-brand-purple transition-colors"
                    />
                  ) : (
                    <p className="text-gray-300 text-xs">{editingRequest.email}</p>
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">WhatsApp</p>
                  {isRequestEditingEnabled ? (
                    <input 
                      value={editingRequest.whatsapp || ''} 
                      onChange={e => setEditingRequest({...editingRequest, whatsapp: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 text-white text-xs rounded-lg px-3 py-2 outline-none focus:border-brand-purple transition-colors"
                    />
                  ) : (
                    <p className="text-gray-300 text-xs mt-0.5">{editingRequest.whatsapp}</p>
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Institution</p>
                  {isRequestEditingEnabled ? (
                    <input 
                      value={editingRequest.institution || ''} 
                      onChange={e => setEditingRequest({...editingRequest, institution: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 text-white text-xs rounded-lg px-3 py-2 outline-none focus:border-brand-purple transition-colors"
                    />
                  ) : (
                    <p className="text-gray-300 text-xs">{editingRequest.institution || 'N/A'}</p>
                  )}
                </div>

                <div className="col-span-2 pt-3 border-t border-white/5">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Vision / Title</p>
                  {isRequestEditingEnabled ? (
                    <input 
                      value={editingRequest.title || ''} 
                      onChange={e => setEditingRequest({...editingRequest, title: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 text-brand-purple text-sm font-bold rounded-lg px-3 py-2 outline-none focus:border-brand-purple transition-colors"
                    />
                  ) : (
                    <p className="text-brand-purple text-sm font-bold">{editingRequest.title}</p>
                  )}
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Core Requirements</p>
                  {isRequestEditingEnabled ? (
                    <textarea 
                      value={editingRequest.requirements || ''} 
                      onChange={e => setEditingRequest({...editingRequest, requirements: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 text-gray-300 text-sm whitespace-pre-wrap leading-relaxed rounded-lg p-3 outline-none focus:border-brand-purple transition-colors min-h-[150px] resize-y"
                    />
                  ) : (
                    <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed bg-white/5 p-4 rounded-lg border border-white/5">{editingRequest.requirements}</p>
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Budget / The Plan</p>
                  {isRequestEditingEnabled ? (
                    <input 
                      value={editingRequest.budget || ''} 
                      onChange={e => setEditingRequest({...editingRequest, budget: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 text-brand-orange text-sm font-bold rounded-lg px-3 py-2 outline-none focus:border-brand-purple transition-colors"
                    />
                  ) : (
                    <p className="text-brand-orange text-sm font-bold">{formatBudget(editingRequest.budget)}</p>
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Timeline</p>
                  {isRequestEditingEnabled ? (
                    <input 
                      value={editingRequest.deadline || ''} 
                      onChange={e => setEditingRequest({...editingRequest, deadline: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 text-white text-sm font-bold rounded-lg px-3 py-2 outline-none focus:border-brand-purple transition-colors"
                    />
                  ) : (
                    <p className="text-white text-sm font-bold">{editingRequest.deadline || 'No deadline'}</p>
                  )}
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Preferred Stack</p>
                  {isRequestEditingEnabled ? (
                    <input 
                      value={editingRequest.techStack?.join(', ') || ''} 
                      onChange={e => {
                         const arr = e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean);
                         setEditingRequest({...editingRequest, techStack: arr});
                      }}
                      className="w-full bg-white/5 border border-white/10 text-white text-xs rounded-lg px-3 py-2 outline-none focus:border-brand-purple transition-colors"
                    />
                  ) : (
                    <p className="text-white text-xs">{editingRequest.techStack?.length ? editingRequest.techStack.join(', ') : 'None specified'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Negotiation & Quotation Block */}
            <div className="glassmorphism p-5 border border-brand-orange/30 rounded-xl space-y-4 mb-6 bg-brand-orange/5">
              <h4 className="text-sm font-black text-brand-orange uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse"></span> Quotation & Negotiation
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Admin Quote (₹)</p>
                   {isRequestEditingEnabled ? (
                     <input 
                       type="number"
                       value={editingRequest.adminQuote || ''} 
                       onChange={e => setEditingRequest({...editingRequest, adminQuote: e.target.value})}
                       placeholder="e.g. 50000"
                       className="w-full bg-white/5 border border-white/10 text-white text-sm font-bold rounded-lg px-3 py-2 outline-none focus:border-brand-orange transition-colors"
                     />
                   ) : (
                     <p className="text-white text-sm font-bold">
                       {editingRequest.adminQuote ? `₹${Number(editingRequest.adminQuote).toLocaleString('en-IN')}` : 'Not quoted yet'}
                     </p>
                   )}
                 </div>
                 <div>
                   <p className="text-[10px] font-bold text-brand-purple uppercase tracking-widest mb-1">Token Advance Req (₹)</p>
                   {isRequestEditingEnabled ? (
                     <input 
                       type="number"
                       value={editingRequest.tokenAmount || ''} 
                       onChange={e => setEditingRequest({...editingRequest, tokenAmount: e.target.value})}
                       placeholder="e.g. 5000"
                       className="w-full bg-white/5 border border-white/10 text-brand-purple text-sm font-bold rounded-lg px-3 py-2 outline-none focus:border-brand-orange transition-colors"
                     />
                   ) : (
                     <p className="text-brand-purple text-sm font-bold">
                       {editingRequest.tokenAmount ? `₹${Number(editingRequest.tokenAmount).toLocaleString('en-IN')}` : 'Not set'}
                     </p>
                   )}
                 </div>
                 <div className="col-span-2 md:col-span-1">
                   <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">User Counter Offer</p>
                   <div className="flex items-center gap-2">
                     <p className="text-white text-sm font-bold border border-white/5 bg-white/5 px-3 py-2 rounded-lg flex-grow">
                        {editingRequest.userOffer ? `₹${Number(editingRequest.userOffer).toLocaleString('en-IN')}` : 'No counter offer'}
                     </p>
                     {editingRequest.userOffer && editingRequest.negotiationStatus === 'user_countered' && (
                       <div className="flex gap-2">
                         <button
                           onClick={() => {
                             if (window.confirm('Accept this user offer?')) {
                               setEditingRequest({
                                 ...editingRequest,
                                 adminQuote: editingRequest.userOffer,
                                 negotiationStatus: 'awaiting_token_payment'
                               });
                             }
                           }}
                           className="flex items-center gap-1.5 bg-green-500/10 text-green-400 px-3 py-2 rounded-lg hover:bg-green-500/20 border border-green-500/20 transition-colors text-xs font-bold uppercase tracking-widest whitespace-nowrap"
                           title="Accept User Offer"
                         >
                           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                           Accept
                         </button>
                         <button
                           onClick={() => {
                             if (window.confirm('Reject this user offer?')) {
                               setEditingRequest({
                                 ...editingRequest,
                                 negotiationStatus: 'admin_rejected'
                               });
                             }
                           }}
                           className="flex items-center gap-1.5 bg-red-500/10 text-red-400 px-3 py-2 rounded-lg hover:bg-red-500/20 border border-red-500/20 transition-colors text-xs font-bold uppercase tracking-widest whitespace-nowrap"
                           title="Reject User Offer"
                         >
                           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                           Reject
                         </button>
                       </div>
                     )}
                   </div>
                 </div>
                 <div className="col-span-2 md:col-span-1">
                   <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Negotiation Stage</p>
                   {isRequestEditingEnabled ? (
                     <select 
                       value={editingRequest.negotiationStatus || 'pending'}
                       onChange={e => setEditingRequest({...editingRequest, negotiationStatus: e.target.value})}
                       className="w-full bg-white/5 border border-white/10 text-gray-300 text-sm font-bold rounded-lg px-3 py-2 outline-none focus:border-brand-orange transition-colors"
                     >
                        <option value="pending" className="bg-[#0f1115]">Reviewing (Pending)</option>
                        <option value="admin_quoted" className="bg-[#0f1115]">Quote Sent to User</option>
                        <option value="user_countered" className="bg-[#0f1115]">User Countered</option>
                        <option value="admin_rejected" className="bg-[#0f1115]">Admin Rejected Offer</option>
                        <option value="user_rejected" className="bg-[#0f1115]">User Rejected Quote</option>
                        <option value="awaiting_token_payment" className="bg-[#0f1115]">Awaiting Token Payment</option>
                        <option value="token_paid" className="bg-[#0f1115]">Token Paid (Ready to Build)</option>
                     </select>
                   ) : (
                     <p className="text-gray-300 text-sm font-bold px-3 py-2 bg-white/5 rounded-lg border border-white/5 uppercase tracking-wider text-[10px]">
                        {(editingRequest.negotiationStatus || 'pending').replace(/_/g, ' ')}
                     </p>
                   )}
                  </div>
                </div>
              </div>

              <div className="glassmorphism p-5 border border-brand-purple/30 rounded-xl space-y-4">
              <h4 className="text-sm font-black text-brand-purple uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-purple animate-pulse"></span> Admin Commits & Updates
              </h4>
              <textarea 
                placeholder="Enter latest commit message or progress updates for the user..."
                value={requestNotesData}
                onChange={(e) => setRequestNotesData(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg p-3 outline-none focus:border-brand-purple min-h-[120px] mb-4 transition-colors resize-y"
              ></textarea>
              <button 
                onClick={() => {
                   updateCustomRequestStatus(editingRequest.id, '', requestNotesData);
                   saveCustomRequestUpdates();
                }}
                className="w-full py-3 bg-brand-purple hover:bg-brand-purple/80 text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-brand-purple/20"
              >
                Save Details & Commits
              </button>
            </div>
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
                  <span className="text-brand-orange font-bold text-sm">{formatBudget(req.budget)}</span>
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
                      <button onClick={() => { setEditingOrder(order); setIsOrderModalOpen(true); }} className="text-xs text-brand-purple hover:text-white transition-colors">View</button>
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
        <div className="glassmorphism p-8 border border-white/10 rounded-2xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-black text-white uppercase tracking-tight">Custom Requests</h2>
            <select 
              value={requestStatusFilter} 
              onChange={(e) => setRequestStatusFilter(e.target.value)}
              className="bg-white/5 border border-white/10 text-white text-xs font-bold uppercase tracking-wider rounded-lg px-4 py-2 outline-none focus:border-brand-purple transition-all"
            >
              <option value="all" className="bg-[#0f1115]">All Status</option>
              <option value="pending" className="bg-[#0f1115]">Pending</option>
              <option value="in_progress" className="bg-[#0f1115]">In Progress</option>
              <option value="completed" className="bg-[#0f1115]">Completed</option>
            </select>
          </div>

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
                {liveRequests
                  .filter((req: any) => requestStatusFilter === 'all' || req.status === requestStatusFilter)
                  .map((req: any) => (
                  <tr key={req.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 text-sm font-mono text-gray-400">{req.displayId || req.id}</td>
                    <td className="p-4 text-sm text-white">{req.email || req.contactName}</td>
                    <td className="p-4 text-sm text-gray-300">{req.title || req.projectTitle}</td>
                    <td className="p-4 text-sm text-brand-orange font-bold">{formatBudget(req.budget)}</td>
                    <td className="p-4">
                      <span className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border ${statusColors[req.status || 'pending']}`}>
                        {(req.status || 'pending').replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-500">{req.createdAt ? new Date(req.createdAt).toLocaleDateString() : req.date || 'N/A'}</td>
                    <td className="p-4 flex gap-2">
                      <button onClick={() => { setIsRequestEditingEnabled(false); setEditingRequest(req); setRequestNotesData(req.adminNotes || ''); setIsRequestModalOpen(true); }} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Details</button>
                      <button onClick={() => updateCustomRequestStatus(req.id, 'in_progress')} className="text-xs text-brand-purple hover:text-white transition-colors">Assign</button>
                      <button onClick={() => updateCustomRequestStatus(req.id, 'completed')} className="text-xs text-green-400 hover:text-green-300 transition-colors">Approve</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {liveRequests.filter((r: any) => requestStatusFilter === 'all' || r.status === requestStatusFilter).length === 0 && (
              <div className="text-center py-16 text-gray-600">
                <p className="text-4xl mb-3">📝</p>
                <p className="font-bold">No Custom Requests</p>
                <p className="text-sm">There are no requests matching this filter.</p>
              </div>
            )}
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
                <div className="w-5 h-5 rounded-full border-2 border-white/5 border-t-brand-purple animate-spin" />
              ) : res.status === 'success' ? (
                <div className="flex items-center gap-1.5">
                   <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)] animate-pulse" />
                   <span className="text-green-400 text-[10px] font-bold tracking-widest">ONLINE</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                   <div className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.5)]" />
                   <span className="text-red-400 text-[10px] font-bold tracking-widest">FAILURE</span>
                </div>
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
