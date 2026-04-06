'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { type Project } from '@/lib/projects';
import CheckoutButton from '@/components/CheckoutButton';
import Toast from '@/components/Toast';
import BuildoraBot from '@/components/BuildoraBot';
import FileExplorer from '@/components/FileExplorer';
import ReviewsSection from '@/components/ReviewsSection';
import { notFound } from 'next/navigation';

export default function ProjectDetail() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCanceled, setShowCanceled] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/projects/${id}`);
        const data = await res.json();
        if (data.success) {
          setProject(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch project:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  useEffect(() => {
    if (searchParams.get('success') === 'true') setShowSuccess(true);
    if (searchParams.get('canceled') === 'true') setShowCanceled(true);
  }, [searchParams]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="pulse-dot w-8 h-8" />
      </main>
    );
  }

  if (!project) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-4xl font-black mb-4">Project Not Found</h1>
        <Link href="/projects" className="text-brand-purple hover:text-white transition-colors">
          ← Back to Catalog
        </Link>
      </main>
    );
  }

  const discount = Math.round((1 - project.price / project.originalPrice) * 100);

  return (
    <main className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
      {/* Toast Notifications */}
      {showSuccess && (
        <Toast
          type="success"
          title="Payment Successful!"
          message="Your project is now in your dashboard. Happy building!"
          duration={6000}
          onClose={() => setShowSuccess(false)}
        />
      )}
      {showCanceled && (
        <Toast
          type="error"
          title="Payment Canceled"
          message="The transaction was not completed. You can try again anytime."
          duration={6000}
          onClose={() => setShowCanceled(false)}
        />
      )}

      <div className="mb-8">
        <Link href="/projects" className="text-brand-purple hover:text-white transition-colors flex items-center gap-2 text-sm font-medium uppercase tracking-wider group">
          <span className="group-hover:-translate-x-1 transition-transform inline-block">←</span> Back to Catalog
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-10">
          {/* Hero card */}
          <div className="glassmorphism p-8 md:p-10 rounded-3xl relative overflow-hidden">
            {project.thumbnail && (
              <div className="relative w-full h-64 md:h-80 mb-8 rounded-2xl overflow-hidden border border-white/10">
                <Image src={project.thumbnail} alt={project.title} fill className="object-cover" />
              </div>
            )}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-purple/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />

            <div className="flex items-center gap-4 mb-6">
              <span className={`text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-full border ${project.difficulty === 'Major' ? 'text-brand-orange border-brand-orange/30 bg-brand-orange/10' : 'text-brand-purple border-brand-purple/30 bg-brand-purple/10'}`}>
                {project.difficulty}
              </span>
              <span className="text-gray-500 text-xs font-medium uppercase tracking-[0.15em]">{project.domain}</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-2 uppercase">
              {project.title}
            </h1>
            <p className="text-xl md:text-2xl text-gradient font-bold mb-6">{project.subtitle}</p>

            <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-8 max-w-2xl">
              {project.description}
            </p>

            <div className="flex flex-wrap gap-2">
              {project.techStack.map(tech => (
                <span key={tech} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm font-medium text-gray-300">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Features */}
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-6">What You&apos;ll Build</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.features.map((feature, i) => (
                <div key={i} className="glassmorphism p-4 rounded-xl flex items-start gap-4 hover:bg-white/5 transition-colors">
                  <div className="w-8 h-8 rounded-full border border-brand-purple/30 bg-brand-purple/10 flex flex-shrink-0 items-center justify-center">
                    <span className="text-brand-purple text-xs font-bold">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <p className="text-gray-300 text-sm mt-1">{feature}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Project Structure / File Tree */}
          {project.fileTree && project.fileTree.length > 0 ? (
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight mb-6">Source Code Overview</h2>
              <p className="text-gray-500 text-sm mb-4">Browse the folder structure to understand the project architecture.</p>
              <FileExplorer tree={project.fileTree} />
            </div>
          ) : project.sourceUrl ? (
            <div className="glassmorphism p-8 rounded-2xl border border-white/10 text-center">
              <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Hosted Repository</h2>
              <p className="text-gray-500 text-sm mb-6 uppercase tracking-wider">This project is hosted on an external version control system.</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-brand-orange uppercase">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                External Repository (GitHub / GitLab)
              </div>
            </div>
          ) : null}

          {/* What's Included */}
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-6">What&apos;s Included</h2>
            <div className="glassmorphism p-6 md:p-8 rounded-2xl space-y-4">
              {project.includes.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-300 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Checkout */}
        <div className="lg:col-span-1">
          <div className="glassmorphism p-8 rounded-3xl sticky top-24">
            <h3 className="text-xl font-black uppercase tracking-tight mb-1">Purchase Project</h3>
            <p className="text-gray-500 text-xs mb-6">Get instant access to the codebase and AI mentoring.</p>

            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-5xl font-black text-white">₹{project.price}</span>
              <span className="text-gray-500 line-through text-lg">₹{project.originalPrice}</span>
            </div>
            <span className="inline-block text-brand-orange bg-brand-orange/10 border border-brand-orange/20 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider mb-6">
              {discount}% OFF
            </span>

            <div className="border-t border-white/10 pt-6 mb-6" />

            <CheckoutButton 
              projectId={project.id} 
              amount={project.price} 
              projectTitle={project.title} 
            />
            <p className="text-center text-[10px] text-gray-500 mb-6 leading-relaxed">
              Secure payment via PhonePe. 14-day refund policy<br />if the code doesn&apos;t match the description.
            </p>

            <div className="space-y-3 pt-4 border-t border-white/10">
              {[
                'Lifetime source code access',
                'College submission report template',
                'Buildora verified certificate',
                'AI Mentor for debugging help',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-xs text-gray-400">{item}</span>
                </div>
              ))}
            </div>
            
            <ReviewsSection projectId={id} />

            {/* Footer Navigation */}
            <div className="mt-12 pt-8 border-t border-white/10 flex justify-between items-center">
              <Link href="/projects" className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2">
                ← Back to Projects
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
