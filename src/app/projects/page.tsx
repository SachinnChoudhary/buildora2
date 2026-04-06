'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { type Project } from '@/lib/projects';
import Skeleton from '@/components/Skeleton';

const DOMAINS = ['All', 'Management', 'Healthcare', 'Business', 'Software Development', 'Cybersecurity', 'Networking', 'E-Commerce', 'Education', 'HR Tech', 'FinTech', 'Web3 / Healthcare', 'Generative AI', 'Cloud Native'];
const DIFFICULTIES = ['All', 'Mini', 'Major'];

export default function ProjectsPage() {
  const [domainFilter, setDomainFilter] = useState('All');
  const [diffFilter, setDiffFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (domainFilter !== 'All') params.append('domain', domainFilter);
        if (diffFilter !== 'All') params.append('difficulty', diffFilter);
        if (search) params.append('q', search);

        const res = await fetch(`/api/projects?${params.toString()}`);
        const data = await res.json();
        if (data.success) {
          setProjects(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [domainFilter, diffFilter, search]);

  const filtered = projects;

  return (
    <main className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="mb-12">
        <span className="pill-badge mb-6">EXPLORE THE CATALOG</span>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight mt-4 mb-4 uppercase">
          All <span className="text-gradient">Projects</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Production-ready B.Tech projects. Filter by domain, difficulty, or search by tech stack.
        </p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search by name or tech stack (e.g. React, Python, Solidity)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xl bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-purple/50 transition-all text-sm"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-6 mb-10 overflow-hidden">
        <div>
          <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-3 block">Domain Spectrum</span>
          <div className="flex gap-2.5 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
            {DOMAINS.map(d => (
              <button
                key={d}
                onClick={() => setDomainFilter(d)}
                className={`px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border ${domainFilter === d ? 'bg-brand-purple border-brand-purple shadow-[0_0_20px_rgba(139,92,246,0.3)] text-white' : 'border-white/10 text-gray-400 hover:bg-white/5 hover:text-white'}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-3 block">Complexity Tier</span>
          <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
            {DIFFICULTIES.map(d => (
              <button
                key={d}
                onClick={() => setDiffFilter(d)}
                className={`px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border ${diffFilter === d ? 'bg-brand-orange border-brand-orange shadow-[0_0_20px_rgba(249,115,22,0.3)] text-white' : 'border-white/10 text-gray-400 hover:bg-white/5 hover:text-white'}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-gray-500 text-sm mb-6">
        {loading ? 'Searching projects...' : `${filtered.length} project${filtered.length !== 1 ? 's' : ''} found`}
      </p>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glassmorphism rounded-2xl h-[420px] border border-white/5 p-8 space-y-6">
               <Skeleton variant="rectangular" height={160} className="rounded-xl" />
               <Skeleton variant="text" width="80%" height={28} className="rounded-lg" />
               <Skeleton variant="text" width="60%" height={16} className="rounded-md" />
               <div className="flex gap-2 pt-4">
                  <Skeleton variant="rectangular" width={60} height={20} className="rounded-md" />
                  <Skeleton variant="rectangular" width={60} height={20} className="rounded-md" />
                  <Skeleton variant="rectangular" width={60} height={20} className="rounded-md" />
               </div>
               <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/5">
                  <Skeleton variant="text" width={100} height={32} className="rounded-xl" />
                  <Skeleton variant="text" width={60} height={16} className="rounded-lg" />
               </div>
            </div>
          ))
        ) : (
          filtered.map((project: Project) => (
            <Link href={`/projects/${project.id}`} key={project.id} className="block group">
            <div className="glassmorphism rounded-2xl overflow-hidden hover:border-brand-purple/30 transition-all duration-500 flex flex-col h-full relative">
              {/* top section */}
              <div className="h-40 bg-white/[0.02] relative flex items-center justify-center border-b border-white/5 group-hover:bg-brand-purple/5 transition-colors duration-500 overflow-hidden">
                {project.thumbnail ? (
                  <Image 
                    src={project.thumbnail} 
                    alt={project.title} 
                    fill 
                    className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" 
                  />
                ) : (
                  <span className="text-5xl font-black text-white/[0.04] tracking-widest uppercase">{project.domain.split(' ')[0]}</span>
                )}
                <span className={`absolute top-4 right-4 text-[9px] font-bold tracking-[0.2em] uppercase px-2.5 py-1 rounded-full border z-10 ${project.difficulty === 'Major' ? 'text-brand-orange border-brand-orange/30 bg-[#1e1310]' : 'text-brand-purple border-brand-purple/30 bg-[#161226]'}`}>
                  {project.difficulty}
                </span>
                <div className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-brand-purple to-brand-orange w-0 group-hover:w-full transition-all duration-700 z-10" />
              </div>

              {/* content */}
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-white group-hover:text-brand-purple transition-colors mb-1">{project.title}</h3>
                <p className="text-gray-500 text-sm mb-4">{project.subtitle}</p>

                <div className="flex flex-wrap gap-1.5 mb-6">
                  {project.techStack.slice(0, 4).map(tech => (
                    <span key={tech} className="text-[10px] text-gray-400 bg-white/5 px-2 py-0.5 rounded font-mono">{tech}</span>
                  ))}
                  {project.techStack.length > 4 && <span className="text-[10px] text-gray-500">+{project.techStack.length - 4}</span>}
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white">₹{project.price}</span>
                    <span className="text-gray-500 line-through text-sm">₹{project.originalPrice}</span>
                  </div>
                  <span className="text-brand-purple text-xs font-semibold uppercase tracking-wider group-hover:text-white transition-colors">
                    View →
                  </span>
                </div>
              </div>
            </div>
          </Link>
          ))
        )}

        {/* Custom Request Card */}
        <div className="glassmorphism rounded-2xl overflow-hidden border-dashed border-2 border-white/15 hover:border-brand-orange/40 transition-all duration-500 flex flex-col items-center justify-center p-8 text-center min-h-[380px]">
          <div className="w-14 h-14 rounded-full border-2 border-brand-orange/30 bg-brand-orange/10 flex items-center justify-center mb-6">
            <svg className="h-7 w-7 text-brand-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Need Something Custom?</h3>
          <p className="text-gray-400 text-sm mb-8 max-w-xs leading-relaxed">
            Submit a custom project request. Our certified developers will build it specifically for your college requirements.
          </p>
          <button className="btn-gradient text-xs px-8 py-3">
            REQUEST CUSTOM PROJECT
          </button>
        </div>
      </div>
    </main>
  );
}
