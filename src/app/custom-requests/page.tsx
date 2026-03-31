'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, ArrowRight, ArrowLeft, Send, CheckCircle2, ChevronRight, Layout, Code, DollarSign, Calendar, Check, AlertCircle } from 'lucide-react';
import Toast from '@/components/Toast';

type Step = 0 | 1 | 2 | 3 | 4;

const TECH_STACK_OPTIONS = [
  'React', 'Next.js', 'Vue.js', 'Angular',
  'Node.js', 'Python', 'FastAPI', 'Django', 'Flask', 'Express',
  'PostgreSQL', 'MongoDB', 'Firebase', 'Redis',
  'Solidity', 'Web3.js', 'Ethers.js',
  'TailwindCSS', 'Material-UI', 'Shadcn',
  'Docker', 'Kubernetes', 'AWS', 'Vercel', 'Railway',
  'TypeScript', 'GraphQL', 'REST API',
];

const steps = [
  { id: 'basics', title: 'The Vision', icon: Layout, description: 'What are we building?' },
  { id: 'details', title: 'The Specs', icon: Code, description: 'Features and tech stack.' },
  { id: 'logistics', title: 'The Plan', icon: DollarSign, description: 'Budget and deadline.' },
  { id: 'contact', title: 'The Architect', icon: Send, description: 'How do we reach you?' },
  { id: 'review', title: 'Review', icon: CheckCircle2, description: 'Verify your request' },
];

export default function CustomRequestPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const [formData, setFormData] = useState({
    title: '',
    requirements: '',
    techStack: [] as string[],
    budget: '',
    deadline: '',
    contactName: '',
    whatsapp: '',
    email: '',
    institution: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/custom-requests');
    }
  }, [authLoading, user, router]);

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 4) as Step);
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0) as Step);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleTechStack = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack.includes(tech)
        ? prev.techStack.filter(t => t !== tech)
        : [...prev.techStack, tech],
    }));
  };

  const isStepValid = (): boolean => {
    switch (currentStep) {
      case 0:
        return formData.title.trim().length >= 5;
      case 1:
        return formData.requirements.trim().length >= 20 && formData.techStack.length > 0;
      case 2:
        return formData.budget !== '' && formData.deadline !== '';
      case 3:
        return formData.contactName.trim() !== '' && formData.whatsapp.trim() !== '' && formData.email.trim() !== '';
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      router.push('/login?redirect=/custom-requests');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/custom-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          title: formData.title,
          requirements: formData.requirements,
          techStack: formData.techStack,
          budget: formData.budget,
          deadline: formData.deadline,
          contactName: formData.contactName,
          whatsapp: formData.whatsapp,
          email: formData.email,
          institution: formData.institution,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setIsSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => router.push('/dashboard'), 5000);
      } else {
        setToastType('error');
        setToastMessage(data.error || 'Submission failed');
        setShowToast(true);
      }
    } catch (error) {
      setToastType('error');
      setToastMessage('An error occurred. Please try again.');
      setShowToast(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) return null;

  return (
    <main className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-purple/5 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-orange/5 blur-[100px] rounded-full -translate-x-1/3 translate-y-1/3 pointer-events-none" />

      {showToast && (
        <Toast 
          type={toastType}
          title={toastType === 'success' ? 'Success!' : 'Error'}
          message={toastMessage}
          onClose={() => setShowToast(false)}
        />
      )}

      <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="text-center mb-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="pill-badge mb-4"
                >
                  <Sparkles className="w-3 h-3" /> Custom Engineering
                </motion.div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 uppercase">
                  Request <span className="text-gradient">Custom Project</span>
                </h1>
                <p className="text-gray-400 max-w-xl mx-auto">
                  Can&apos;t find what you need? Tell us your vision, and our world-class developers will build it specifically for your college requirements.
                </p>
              </div>

              {/* Step Indicator */}
              <div className="grid grid-cols-5 gap-2 mb-12">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = index === currentStep;
                  const isCompleted = index < currentStep;

                  return (
                    <div key={step.id} className="relative">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border ${
                          isActive ? 'bg-brand-purple border-brand-purple text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]' : 
                          isCompleted ? 'bg-green-500/20 border-green-500/50 text-green-400' : 
                          'bg-white/5 border-white/10 text-gray-500'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="hidden sm:block mt-3 text-center">
                          <p className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-white' : 'text-gray-500'}`}>
                            {step.title}
                          </p>
                        </div>
                      </div>
                      {index < steps.length - 1 && (
                        <div className="absolute top-5 left-[calc(50%+20px)] right-[calc(-50%+20px)] h-[1px] bg-white/10" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Form Container */}
              <div className="glassmorphism p-8 md:p-12 rounded-3xl min-h-[400px] flex flex-col border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-white/5 overflow-hidden">
                   <motion.div 
                      className="h-full bg-gradient-to-r from-brand-purple to-brand-orange"
                      animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                      transition={{ duration: 0.5 }}
                   />
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex-grow pt-4"
                  >
                    {currentStep === 0 && (
                      <div className="space-y-6">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest text-brand-purple mb-4 flex items-center gap-2">
                             <Layout className="w-4 h-4" /> Project Title *
                          </label>
                          <input
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="e.g. AI-Powered Smart Grid Management"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:ring-2 focus:ring-brand-purple/50 transition-all font-medium text-lg placeholder:text-gray-600"
                          />
                          <div className="flex justify-between items-center mt-3">
                             <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                Minimum 5 characters required
                             </p>
                             <p className={`text-[10px] font-bold uppercase tracking-widest ${formData.title.length >= 5 ? 'text-green-500' : 'text-gray-500'}`}>
                                {formData.title.length}/100
                             </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {currentStep === 1 && (
                      <div className="space-y-8">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest text-brand-purple mb-4 flex items-center gap-2">
                             <Code className="w-4 h-4" /> Technical Requirements *
                          </label>
                          <textarea
                            name="requirements"
                            rows={4}
                            value={formData.requirements}
                            onChange={handleInputChange}
                            placeholder="Describe high-level architecture, key features, and problem statement..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:ring-2 focus:ring-brand-purple/50 transition-all resize-none font-medium leading-relaxed"
                          />
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-2">
                             {formData.requirements.length}/5000 characters • Min 20 required
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest text-brand-purple mb-4">Preferred Tech Stack *</label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {TECH_STACK_OPTIONS.map((tech) => (
                              <button
                                key={tech}
                                onClick={() => toggleTechStack(tech)}
                                className={`px-4 py-3 rounded-xl border font-bold transition-all text-[10px] uppercase tracking-widest ${
                                  formData.techStack.includes(tech)
                                    ? 'bg-brand-orange/20 border-brand-orange text-brand-orange'
                                    : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10'
                                }`}
                              >
                                {tech}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {currentStep === 2 && (
                      <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-brand-purple mb-4 flex items-center gap-2">
                               <DollarSign className="w-4 h-4" /> Target Budget (₹)
                            </label>
                            <input
                              name="budget"
                              value={formData.budget}
                              onChange={handleInputChange}
                              placeholder="e.g. ₹5,000 - ₹10,000"
                              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:ring-2 focus:ring-brand-purple/50 transition-all font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-brand-purple mb-4 flex items-center gap-2">
                               <Calendar className="w-4 h-4" /> Timeline / Deadline
                            </label>
                            <input
                              name="deadline"
                              value={formData.deadline}
                              onChange={handleInputChange}
                              placeholder="e.g. 3 weeks"
                              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:ring-2 focus:ring-brand-purple/50 transition-all font-bold"
                            />
                          </div>
                        </div>
                      </div>
                    )}                    {currentStep === 3 && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-brand-purple mb-4">Full Name *</label>
                            <input
                              name="contactName"
                              value={formData.contactName}
                              onChange={handleInputChange}
                              placeholder="e.g. Sachin Chaudhary"
                              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-purple/50 transition-all font-medium"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-brand-purple mb-4">WhatsApp Number *</label>
                            <input
                              name="whatsapp"
                              value={formData.whatsapp}
                              onChange={handleInputChange}
                              placeholder="e.g. +91 9876543210"
                              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-purple/50 transition-all font-medium"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-brand-purple mb-4">Email Address *</label>
                            <input
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              placeholder="e.g. name@college.edu"
                              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-purple/50 transition-all font-medium"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-brand-purple mb-4">College / Company</label>
                            <input
                              name="institution"
                              value={formData.institution}
                              onChange={handleInputChange}
                              placeholder="e.g. RV College of Engineering"
                              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-purple/50 transition-all font-medium"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {currentStep === 4 && (
                      <div className="space-y-8">
                        <div className="p-8 rounded-3xl bg-white/5 border border-white/10 relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-4 opacity-10">
                              <CheckCircle2 className="w-24 h-24 text-white" />
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                             <div>
                               <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-2">Project Vision</p>
                               <p className="text-2xl font-black text-white uppercase leading-tight">{formData.title || 'Untitled Build'}</p>
                             </div>
                             <div>
                               <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-2">Target Stack</p>
                               <div className="flex flex-wrap gap-2">
                                  {formData.techStack.map(t => (
                                     <span key={t} className="px-3 py-1 bg-brand-orange/10 border border-brand-orange/20 rounded-full text-[10px] font-bold text-brand-orange uppercase">{t}</span>
                                  ))}
                               </div>
                             </div>
                           </div>
                           <div className="mt-8 pt-8 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div>
                               <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-3">Core Requirements</p>
                               <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
                                  {formData.requirements || 'No specific technical details provided.'}
                               </p>
                             </div>
                             <div>
                               <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-3">The Architect</p>
                               <div className="space-y-1">
                                  <p className="text-white font-bold">{formData.contactName}</p>
                                  <p className="text-gray-400 text-xs">{formData.email} • {formData.whatsapp}</p>
                                  <p className="text-gray-500 text-[10px] uppercase tracking-wider">{formData.institution}</p>
                               </div>
                             </div>
                           </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="p-6 rounded-2xl bg-brand-purple/10 border border-brand-purple/20">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-purple mb-1">Proposed Budget</p>
                            <p className="text-xl font-black text-white">{formData.budget || 'Open Negotiation'}</p>
                          </div>
                          <div className="p-6 rounded-2xl bg-brand-purple/10 border border-brand-purple/20">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-purple mb-1">Desired Timeline</p>
                            <p className="text-xl font-black text-white">{formData.deadline || 'Flexible'}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-12 pt-8 border-t border-white/10">
                  <button
                    onClick={prevStep}
                    className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${
                      currentStep === 0 ? 'opacity-0 pointer-events-none' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <ArrowLeft className="w-4 h-4" /> Go Back
                  </button>

                  <div className="flex items-center gap-4">
                    {currentStep < 4 ? (
                      <button
                        onClick={nextStep}
                        disabled={!isStepValid()}
                        className="bg-brand-purple hover:bg-brand-purple/80 transition-all text-white px-10 py-5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-3 shadow-lg shadow-brand-purple/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Proceed <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="btn-gradient px-12 py-5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-brand-purple/20 disabled:opacity-50"
                      >
                        {isSubmitting ? 'Initiating Build...' : 'Confirm Request'} <Send className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glassmorphism p-16 md:p-24 rounded-[3rem] text-center border border-white/10 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-green-500/10">
                 <motion.div 
                    className="h-full bg-green-500"
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 5, ease: "linear" }}
                 />
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 10, delay: 0.2 }}
                className="w-24 h-24 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-10"
              >
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </motion.div>
              <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight mb-6">Build Initiated!</h2>
              <p className="text-gray-400 max-w-xl mx-auto text-lg mb-12">
                Your custom project request has been logged into our high-performance engineering queue. Our senior architects will review your vision and reach out within 24 hours.
              </p>
              <div className="flex flex-col items-center gap-6">
                <Link href="/dashboard" className="px-12 py-5 bg-white text-brand-purple rounded-full text-xs font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all">
                  Go to Dashboard
                </Link>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  Redirecting automatically in 5 seconds...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
