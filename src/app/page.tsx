'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

/* ── scroll‑reveal hook ── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.12 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, vis };
}
function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, vis } = useReveal();
  return (
    <div ref={ref} className={className} style={{ opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(50px)', transition: `all 0.8s cubic-bezier(.22,1,.36,1) ${delay}ms` }}>
      {children}
    </div>
  );
}

/* ── cursor glow ── */
function useCursor() {
  const [p, setP] = useState({ x: -200, y: -200 });
  useEffect(() => {
    const h = (e: MouseEvent) => setP({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, []);
  return p;
}

/* ── data ── */
const PROJECTS = [
  { id: 'neurohire', title: 'NeuroHire', sub: 'AI-Powered ATS Resume Screener', tech: 'Next.js · FastAPI · Gemini', tag: 'MAJOR' },
  { id: 'findash', title: 'FinDash', sub: 'Real-time Crypto Portfolio', tech: 'React · Node · WebSockets', tag: 'MINI' },
  { id: 'medchain', title: 'MedChain', sub: 'Blockchain Health Records', tech: 'Solidity · React · IPFS', tag: 'MAJOR' },
  { id: 'docuchat', title: 'DocuChat', sub: 'RAG‑based PDF Analyzer', tech: 'Python · LangChain · OpenAI', tag: 'MINI' },
];

const STEPS = [
  { n: '01', title: 'Discover', desc: 'Browse curated projects by domain, tech stack, or difficulty level.' },
  { n: '02', title: 'Purchase', desc: 'Secure checkout via Stripe. Instant access to source code & docs.' },
  { n: '03', title: 'Build', desc: 'Follow step-by-step roadmaps. Get help from our AI Mentor anytime.' },
  { n: '04', title: 'Deploy', desc: 'Ship to production with 1-click guides. Add a live link to your resume.' },
];

const PAIN_POINTS = [
  { title: 'Broken GitHub Repos', desc: 'Outdated dependencies. Missing env files. No documentation. Hours wasted on someone else\'s half‑finished code.' },
  { title: 'Overpriced Brokers', desc: 'Same PHP project sold to 500 students. Zero learning outcome. Just a shady ZIP file on WhatsApp.' },
  { title: 'Tutorial Hell', desc: '20-hour YouTube courses that teach concepts but never result in a deployable, portfolio-ready project.' },
];

export default function Home() {
  const cursor = useCursor();

  /* typing effect */
  const [typed, setTyped] = useState('');
  const full = 'Build. Deploy. Get Hired.';
  useEffect(() => {
    let i = 0;
    const iv = setInterval(() => { setTyped(full.slice(0, ++i)); if (i >= full.length) clearInterval(iv); }, 55);
    return () => clearInterval(iv);
  }, []);

  return (
    <main className="relative">
      {/* cursor glow */}
      <div className="pointer-events-none fixed z-50 w-[350px] h-[350px] rounded-full opacity-[0.12] mix-blend-screen blur-[90px]" style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 70%)', left: cursor.x - 175, top: cursor.y - 175 }} />

      {/* ════════════════════════════════════════════ */}
      {/*  HERO                                        */}
      {/* ════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 grid-bg radial-rings overflow-hidden">
        {/* ambient blobs */}
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-brand-purple/10 blur-[160px] rounded-full -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-brand-orange/8 blur-[140px] rounded-full -z-10" />

        {/* giant watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 select-none pointer-events-none">
          <span className="text-[6rem] sm:text-[10rem] md:text-[16rem] lg:text-[20rem] font-black text-outline tracking-tighter leading-none">BUILDORA</span>
        </div>

        <Reveal>
          <span className="pill-badge mb-8 sm:mb-10">
            <span className="pulse-dot" />
            REDEFINING ACADEMIC PROJECTS
          </span>
        </Reveal>

        <Reveal delay={100}>
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-[5.5rem] font-black tracking-tight leading-[1.05] max-w-5xl mb-6 sm:mb-8 uppercase">
            THE FUTURE OF<br />
            <span className="text-gradient">PRODUCTION-READY</span><br />
            STUDENT PROJECTS
          </h1>
        </Reveal>

        <Reveal delay={200}>
          <p className="text-xs sm:text-sm uppercase tracking-[0.25em] text-gray-400 font-medium mb-6">
            WHERE REAL OUTCOMES ARE PRIORITIZED
          </p>
        </Reveal>

        <Reveal delay={300}>
          <p className="text-gray-400 text-base md:text-lg max-w-2xl mb-4 leading-relaxed">
            Buildora enables B.Tech students to discover, purchase, and deploy
            production-grade projects with clarity — before time and effort are wasted.
          </p>
        </Reveal>

        <Reveal delay={350}>
          <div className="font-mono text-brand-purple h-7 mb-10 text-sm">
            {typed}<span className="animate-pulse">|</span>
          </div>
        </Reveal>

        <Reveal delay={400}>
          <Link href="/projects" className="btn-gradient">
            GET EARLY ACCESS
          </Link>
        </Reveal>

        <Reveal delay={500}>
          <p className="text-gray-500 text-xs mt-6 tracking-wider">
            Early access for our first members • Limited beta availability • No commitment required
          </p>
        </Reveal>

        {/* scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-600">
          <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
          <div className="w-5 h-8 rounded-full border border-gray-700 flex justify-center pt-2">
            <div className="w-1 h-1.5 bg-gray-500 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════ */}
      {/*  THE TRANSFORMATION                          */}
      {/* ════════════════════════════════════════════ */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-brand-purple/[0.02] to-transparent" />
        {/* giant bg text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 select-none pointer-events-none whitespace-nowrap">
          <span className="text-[5rem] sm:text-[8rem] md:text-[14rem] font-black text-outline tracking-tighter">SHIFT</span>
        </div>

        <div className="max-w-5xl mx-auto text-center">
          <Reveal>
            <span className="pill-badge mb-10">THE TRANSFORMATION</span>
          </Reveal>

          <Reveal delay={100}>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] mb-6">
              Moving from<br />
              <span className="font-accent text-gray-500 normal-case">Accidental</span><br />
              to <span className="gradient-underline">Intentional Growth.</span>
            </h2>
          </Reveal>

          <Reveal delay={200}>
            <div className="glassmorphism max-w-2xl mx-auto p-8 md:p-10 rounded-2xl mt-12">
              <p className="text-brand-purple text-lg md:text-xl leading-relaxed font-medium">
                Buildora adds structure to the creative spark, turning chaotic
                academic panic into measurable, deployable outcomes.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════ */}
      {/*  PROOF OF VALUE — 2 columns                  */}
      {/* ════════════════════════════════════════════ */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-8">
          {[
            { title: 'Production-Ready Code', desc: 'Every project ships with clean architecture, typed APIs, Docker configs, and deployment guides. No more spaghetti.' },
            { title: 'Verified Outcomes', desc: 'A curated ecosystem of projects and mentors who value quality over quantity. Buildora-verified certificates for every build.' },
          ].map((item, i) => (
            <Reveal key={item.title} delay={i * 150}>
              <div className="text-center">
                <h3 className="text-3xl md:text-4xl font-black text-white mb-6 tracking-tight">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed max-w-sm mx-auto mb-6">{item.desc}</p>
                <div className="line-divider mx-auto" />
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════ */}
      {/*  THE REALITY — Pain Points                   */}
      {/* ════════════════════════════════════════════ */}
      <section className="py-28 px-6 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-brand-orange/[0.02] to-transparent" />
        <div className="max-w-5xl mx-auto text-center">
          <Reveal>
            <span className="pill-badge mb-10">WHAT WE SOLVE</span>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="text-3xl md:text-5xl font-black tracking-[0.1em] uppercase mb-4 text-gray-300">
              THE REALITY
            </h2>
            <div className="line-divider mx-auto mb-16" />
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PAIN_POINTS.map((p, i) => (
              <Reveal key={p.title} delay={i * 120}>
                <div className="glassmorphism p-8 rounded-2xl text-left h-full hover:border-brand-purple/20 transition-all duration-500">
                  <div className="w-10 h-10 rounded-full border border-brand-purple/30 flex items-center justify-center mb-6">
                    <span className="text-brand-purple font-bold text-sm">0{i + 1}</span>
                  </div>
                  <h4 className="text-xl font-bold text-white mb-3">{p.title}</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">{p.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════ */}
      {/*  HOW IT WORKS                                */}
      {/* ════════════════════════════════════════════ */}
      <section className="py-28 px-6 relative grid-bg radial-rings overflow-hidden">
        <div className="max-w-5xl mx-auto text-center">
          <Reveal>
            <span className="pill-badge mb-10">
              ⚡ COMMITMENT-FIRST LEARNING
            </span>
          </Reveal>

          <Reveal delay={100}>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
              How It Works for <span className="text-gradient font-accent normal-case">Students</span>
            </h2>
          </Reveal>
          <Reveal delay={150}>
            <p className="text-gray-400 max-w-xl mx-auto mb-16 leading-relaxed">
              Before any real work begins, we give students a clear path from
              first discovery to verified deployment.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 120}>
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-full border-2 border-brand-purple/40 flex items-center justify-center mb-6 bg-brand-purple/10">
                    <span className="text-brand-orange font-bold text-sm">{s.n}</span>
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">{s.title}</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════ */}
      {/*  FEATURED PROJECTS                           */}
      {/* ════════════════════════════════════════════ */}
      <section className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <span className="pill-badge mb-10">EXPLORE THE CATALOG</span>
          </Reveal>
          <Reveal delay={100}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14 gap-4">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight">
                Featured <span className="text-gradient">Projects</span>
              </h2>
              <Link href="/projects" className="text-brand-purple hover:text-white transition-colors font-semibold text-sm uppercase tracking-wider">
                View all &rarr;
              </Link>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {PROJECTS.map((p, i) => (
              <Reveal key={p.id} delay={i * 100}>
                <Link href={`/projects/${p.id}`} className="block group">
                  <div className="glassmorphism rounded-2xl p-8 hover:border-brand-purple/30 transition-all duration-500 relative overflow-hidden h-full">
                    {/* tag */}
                    <span className={`absolute top-6 right-6 text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-full border ${p.tag === 'MAJOR' ? 'text-brand-orange border-brand-orange/30 bg-brand-orange/10' : 'text-brand-purple border-brand-purple/30 bg-brand-purple/10'}`}>
                      {p.tag}
                    </span>

                    <h3 className="text-2xl md:text-3xl font-black text-white mb-2 group-hover:text-gradient transition-all">{p.title}</h3>
                    <p className="text-gray-400 mb-6">{p.sub}</p>
                    <p className="font-mono text-xs text-gray-500">{p.tech}</p>

                    {/* bottom gradient line */}
                    <div className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full bg-gradient-to-r from-brand-purple to-brand-orange transition-all duration-700" />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════ */}
      {/*  CUSTOM PROJECT CTA                          */}
      {/* ════════════════════════════════════════════ */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="glassmorphism p-10 md:p-16 rounded-[2.5rem] border border-white/10 relative overflow-hidden group">
               {/* background glow */}
               <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-orange/20 blur-[100px] rounded-full group-hover:bg-brand-orange/30 transition-all duration-700 pointer-events-none" />
               <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-brand-purple/10 blur-[120px] rounded-full group-hover:bg-brand-purple/20 transition-all duration-700 pointer-events-none" />
               
               <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                  <div className="text-center md:text-left">
                     <span className="text-[10px] font-bold text-brand-purple uppercase tracking-[0.3em] mb-4 block">CAN'T FIND WHAT YOU NEED?</span>
                     <h2 className="text-3xl md:text-5xl font-black text-white mb-6 uppercase tracking-tight">
                        REQUEST A <span className="text-gradient">CUSTOM BUILD</span>
                     </h2>
                     <p className="text-gray-400 max-w-sm text-sm md:text-base leading-relaxed">
                        Our expert engineering team can build any project architecture 
                        specifically tailored to your college requirements.
                     </p>
                  </div>
                  <Link href="/custom-requests" className="btn-gradient px-10 py-5 rounded-full text-xs font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all whitespace-nowrap">
                     START YOUR VISION &rarr;
                  </Link>
               </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════ */}
      {/*  EARLY ACCESS BENEFITS                       */}
      {/* ════════════════════════════════════════════ */}
      <section className="py-28 px-6 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-purple/[0.02] to-brand-orange/[0.02]" />
        <div className="max-w-5xl mx-auto text-center">
          <Reveal>
            <span className="pill-badge mb-10">
              <span className="pulse-dot" />
              EARLY ACCESS BENEFITS
            </span>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
              Why join <span className="font-accent text-gradient normal-case">Early.</span>
            </h2>
          </Reveal>
          <Reveal delay={150}>
            <p className="text-gray-400 max-w-2xl mx-auto mb-16 leading-relaxed">
              Limited spots. First students and colleges get zero platform fees,
              priority support, and early access to the ecosystem. Join now — before the waitlist grows.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Students card */}
            <Reveal delay={200}>
              <div className="glassmorphism rounded-2xl p-8 md:p-10 text-left">
                <h3 className="text-xl font-black uppercase tracking-[0.15em] text-white mb-2">Students</h3>
                <div className="line-divider mb-8" />
                <div className="space-y-6">
                  {[
                    ['Free starter project', 'Access to 1 free project instantly.'],
                    ['AI Mentor access', 'Unlimited AI debugging and guidance.'],
                    ['Priority support', 'Faster response times during beta.'],
                    ['Resume builder', 'Auto-generate portfolio from completed projects.'],
                  ].map(([t, d]) => (
                    <div key={t}>
                      <p className="text-white font-bold text-sm mb-0.5">{t}</p>
                      <p className="text-gray-500 text-sm">{d}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* Colleges card */}
            <Reveal delay={300}>
              <div className="glassmorphism rounded-2xl p-8 md:p-10 text-left">
                <h3 className="text-xl font-black uppercase tracking-[0.15em] text-white mb-2">Colleges</h3>
                <div className="line-divider mb-8" />
                <div className="space-y-6">
                  {[
                    ['Student pool', 'Access to early student enrollment tools.'],
                    ['Reduced costs', 'Reduced licensing costs during beta.'],
                    ['Priority onboarding', 'Dedicated account manager setup.'],
                    ['Analytics dashboard', 'Early access to performance tracking.'],
                  ].map(([t, d]) => (
                    <div key={t}>
                      <p className="text-white font-bold text-sm mb-0.5">{t}</p>
                      <p className="text-gray-500 text-sm">{d}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════ */}
      {/*  TESTIMONIALS                                */}
      {/* ════════════════════════════════════════════ */}
      <section className="py-28 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <Reveal>
            <span className="pill-badge mb-10">SOCIAL PROOF</span>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-16">
              Students <span className="text-gradient">Love</span> It
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Aarav S.', college: 'VIT Vellore', text: 'The code quality was production-grade. The AI mentor helped me understand every single line of the architecture.' },
              { name: 'Priya M.', college: 'SRM Chennai', text: 'I requested a custom ML project and got it delivered milestone-by-milestone. My guide was genuinely impressed.' },
              { name: 'Rohit K.', college: 'BITS Pilani', text: 'I actually have a live project link on my resume now. Got 3 interview calls within a week.' },
            ].map((t, i) => (
              <Reveal key={t.name} delay={i * 100}>
                <div className="glassmorphism p-8 rounded-2xl text-left h-full flex flex-col">
                  <div className="flex gap-1 mb-5">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} className="w-4 h-4 text-brand-orange" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    ))}
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed flex-grow mb-6">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-purple to-brand-orange flex items-center justify-center text-xs font-bold text-white">{t.name.charAt(0)}</div>
                    <div>
                      <p className="text-white font-semibold text-xs">{t.name}</p>
                      <p className="text-gray-500 text-[10px]">{t.college}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════ */}
      {/*  FINAL CTA                                   */}
      {/* ════════════════════════════════════════════ */}
      <section className="relative py-36 px-6 grid-bg overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-brand-purple/8 blur-[160px] rounded-full -z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-orange/5 blur-[140px] rounded-full ml-32 -z-10" />

        <div className="max-w-4xl mx-auto text-center relative">
          <Reveal>
            <h2 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight leading-[1] mb-8">
              STOP SEARCHING.<br />
              <span className="text-gradient">START BUILDING.</span>
            </h2>
          </Reveal>
          <Reveal delay={150}>
            <p className="text-gray-400 text-base md:text-lg mb-12 max-w-xl mx-auto leading-relaxed">
              Join thousands of students who stopped downloading broken repos
              and started shipping real, deployed, portfolio-worthy projects.
            </p>
          </Reveal>
          <Reveal delay={300}>
            <Link href="/projects" className="btn-gradient inline-block">
              EXPLORE PROJECTS
            </Link>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
