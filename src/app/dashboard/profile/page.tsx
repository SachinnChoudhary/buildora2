'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getUserProfile, updateUserProfile } from '@/services/firestore';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast, { ToastType } from '@/components/Toast';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Calendar, GraduationCap, BookOpen, Clock, Github, Linkedin, Code2, Globe, Edit2, Save, X, ExternalLink } from 'lucide-react';
import Image from 'next/image';

export default function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState<{ type: ToastType; title: string; message: string } | null>(null);

  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phone: '',
    age: '',
    college: '',
    degree: '',
    graduationYear: '',
    bio: '',
    github: '',
    linkedin: '',
    leetcode: '',
    website: ''
  });

  useEffect(() => {
    if (!user) return;
    
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile(user.uid);
        if (data) {
          setFormData({
            displayName: data.displayName || user.displayName || '',
            email: data.email || user.email || '',
            phone: data.phone || '',
            age: data.age || '',
            college: data.college || '',
            degree: data.degree || '',
            graduationYear: data.graduationYear || '',
            bio: data.bio || '',
            github: data.github || '',
            linkedin: data.linkedin || '',
            leetcode: data.leetcode || '',
            website: data.website || '',
          });

          // If no basic details are present, open in edit mode by default
          if (!data.college && !data.phone && !data.bio) {
             setIsEditing(true);
          }
        } else {
          // If no data doc exists for some reason
          setFormData(prev => ({ ...prev, displayName: user.displayName || '', email: user.email || '' }));
          setIsEditing(true);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      await updateUserProfile(user.uid, formData);
      setToast({ type: 'success', title: 'Profile Updated', message: 'Your student profile has been updated successfully.' });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setToast({ type: 'error', title: 'Update Failed', message: 'There was an error updating your profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="glassmorphism rounded-3xl p-12 border border-white/10 flex justify-center">
        <LoadingSpinner label="Loading Profile..." />
      </div>
    );
  }

  // View Mode Component
  const ProfileView = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Top Section - Avatar & Basic Info */}
      <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
        <div className="relative group shrink-0">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-brand-purple/30 relative z-10 bg-black/50 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
            {user?.photoURL ? (
              <Image src={user.photoURL} alt="Profile" fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-purple/20 to-blue-500/20">
                <User className="w-12 h-12 text-brand-purple" />
              </div>
            )}
          </div>
          <div className="absolute inset-0 bg-brand-purple/20 rounded-full blur-xl scale-110 group-hover:scale-125 transition-transform duration-500 -z-10"></div>
        </div>

        <div className="flex-1 space-y-3">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-blue-400">{formData.displayName || 'Developer'}</span>! 👋
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
            {formData.bio || "You haven't added a bio yet. Click Edit Profile to tell us about your engineering journey!"}
          </p>
        </div>

        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all shrink-0"
        >
          <Edit2 className="w-4 h-4" />
          Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {(formData.email || formData.phone || formData.age) ? (
            <div className="glassmorphism rounded-2xl p-6 border border-white/5 bg-white/[0.02]">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-brand-purple" />
                Personal Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <DetailItem icon={<Mail />} label="Email" value={formData.email} />
                <DetailItem icon={<Phone />} label="Phone" value={formData.phone} />
                <DetailItem icon={<Calendar />} label="Age" value={formData.age ? `${formData.age} years` : ''} />
              </div>
            </div>
          ) : null}

          {(formData.college || formData.degree || formData.graduationYear) ? (
            <div className="glassmorphism rounded-2xl p-6 border border-white/5 bg-white/[0.02]">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-400" />
                Academic Info
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <DetailItem icon={<BookOpen />} label="College / University" value={formData.college} fullWidth />
                <DetailItem icon={<User />} label="Degree / Major" value={formData.degree} />
                <DetailItem icon={<Clock />} label="Graduation Year" value={formData.graduationYear} />
              </div>
            </div>
          ) : null}
          
          {(!formData.email && !formData.phone && !formData.age && !formData.college && !formData.degree && !formData.graduationYear) && (
            <div className="glassmorphism rounded-2xl p-12 border border-white/5 bg-white/[0.02] flex flex-col items-center justify-center text-center">
               <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                 <User className="w-8 h-8 text-gray-400" />
               </div>
               <h3 className="text-xl font-bold text-white mb-2">No Details Added Yet</h3>
               <p className="text-gray-400 text-sm max-w-sm mb-6">Complete your profile to let the community know more about you and your skills.</p>
               <button
                  onClick={() => setIsEditing(true)}
                  className="bg-brand-purple hover:bg-brand-purple/80 text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all"
                >
                  Complete Profile
                </button>
            </div>
          )}
        </div>

        {/* Right Column - Links */}
        <div className="glassmorphism rounded-2xl p-6 border border-white/5 bg-white/[0.02] h-fit">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Globe className="w-5 h-5 text-green-400" />
            Social & Links
          </h3>
          {(formData.github || formData.linkedin || formData.leetcode || formData.website) ? (
            <div className="space-y-4">
              <LinkItem icon={<Github />} label="GitHub" url={formData.github} color="text-white" hoverBg="hover:bg-white/10" />
              <LinkItem icon={<Linkedin />} label="LinkedIn" url={formData.linkedin} color="text-[#0A66C2]" hoverBg="hover:bg-[#0A66C2]/10" />
              <LinkItem icon={<Code2 />} label="LeetCode" url={formData.leetcode} color="text-yellow-500" hoverBg="hover:bg-yellow-500/10" />
              <LinkItem icon={<Globe />} label="Portfolio" url={formData.website} color="text-brand-purple" hoverBg="hover:bg-brand-purple/10" />
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500 text-sm mb-4">No social links added.</p>
              <button onClick={() => setIsEditing(true)} className="text-brand-purple text-sm font-bold hover:underline">Add Links</button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <>
      {toast && (
        <Toast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <div className="glassmorphism rounded-3xl p-6 sm:p-10 border border-white/10 relative overflow-hidden min-h-[600px]">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-purple/5 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none translate-y-1/3 -translate-x-1/3"></div>
        
        <div className="relative z-10">
          {!isEditing ? (
            <ProfileView />
          ) : (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl mx-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Edit Profile</h2>
                  <p className="text-sm text-gray-400">Update your student and professional details.</p>
                </div>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Info */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/5 shadow-inner">
                  <h3 className="text-sm font-bold text-brand-purple uppercase tracking-widest mb-6">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Full Name" name="displayName" value={formData.displayName} onChange={handleChange} placeholder="John Doe" />
                    <InputField label="Email Address" name="email" value={formData.email} disabled />
                    <InputField label="Phone Number" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+91 9876543210" />
                    <InputField label="Age" name="age" type="number" value={formData.age} onChange={handleChange} placeholder="21" />
                    <div className="space-y-2 md:col-span-2">
                       <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Engineering Bio / Interests</label>
                       <textarea
                         name="bio"
                         value={formData.bio}
                         onChange={handleChange}
                         rows={4}
                         className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-purple/50 focus:ring-1 focus:ring-brand-purple/50 transition-all text-sm resize-none"
                         placeholder="Tell us about the stacks you are interested in, your engineering journey, etc..."
                       ></textarea>
                    </div>
                  </div>
                </div>

                {/* Academic Info */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/5 shadow-inner">
                  <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-6">Academic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <InputField label="College / University" name="college" value={formData.college} onChange={handleChange} placeholder="Indian Institute of Technology" />
                    </div>
                    <InputField label="Degree / Major" name="degree" value={formData.degree} onChange={handleChange} placeholder="B.Tech in Computer Science" />
                    <InputField label="Expected Graduation Year" name="graduationYear" value={formData.graduationYear} onChange={handleChange} placeholder="2025" />
                  </div>
                </div>

                {/* Social Links */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/5 shadow-inner">
                  <h3 className="text-sm font-bold text-green-400 uppercase tracking-widest mb-6">Social & Links</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="GitHub URL" name="github" value={formData.github} onChange={handleChange} placeholder="https://github.com/username" icon={<Github className="w-4 h-4 text-gray-500" />} />
                    <InputField label="LinkedIn URL" name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/username" icon={<Linkedin className="w-4 h-4 text-gray-500" />} />
                    <InputField label="LeetCode URL" name="leetcode" value={formData.leetcode} onChange={handleChange} placeholder="https://leetcode.com/username" icon={<Code2 className="w-4 h-4 text-gray-500" />} />
                    <InputField label="Portfolio / Website URL" name="website" value={formData.website} onChange={handleChange} placeholder="https://yourportfolio.com" icon={<Globe className="w-4 h-4 text-gray-500" />} />
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10 flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-brand-purple hover:bg-brand-purple/80 text-white px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Profile
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}

// Subcomponents

function DetailItem({ icon, label, value, fullWidth = false }: { icon: React.ReactNode, label: string, value: string, fullWidth?: boolean }) {
  if (!value) return null;
  return (
    <div className={`flex items-start gap-4 p-3 rounded-xl bg-black/20 border border-white/5 ${fullWidth ? 'sm:col-span-2' : ''}`}>
      <div className="p-2 bg-white/5 rounded-lg text-gray-400">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-sm font-medium text-white">{value}</p>
      </div>
    </div>
  );
}

function LinkItem({ icon, label, url, color, hoverBg }: { icon: React.ReactNode, label: string, url: string, color: string, hoverBg: string }) {
  if (!url) return null;
  return (
    <a 
      href={url.startsWith('http') ? url : `https://${url}`} 
      target="_blank" 
      rel="noopener noreferrer"
      className={`flex items-center gap-4 p-3 rounded-xl bg-black/20 border border-white/5 transition-all ${hoverBg} group`}
    >
      <div className={`p-2 bg-white/5 rounded-lg ${color} group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-white group-hover:text-brand-purple transition-colors">{label}</p>
      </div>
      <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
    </a>
  );
}

function InputField({ label, name, type = "text", value, onChange, placeholder, disabled, icon }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</label>
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            {icon}
          </div>
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full bg-black/20 border border-white/10 rounded-xl py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-purple/50 focus:ring-1 focus:ring-brand-purple/50 transition-all text-sm ${disabled ? 'cursor-not-allowed text-gray-500' : ''} ${icon ? 'pl-11 pr-4' : 'px-4'}`}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}
