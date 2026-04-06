import React from 'react';

export default function AboutPage() {
  return (
    <main className="min-h-screen py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-4">
          Building the <span className="text-gradient">Future of Engineering</span>
        </h1>
        <p className="text-gray-400 text-xl max-w-3xl mx-auto">
          At Buildora, we believe that the best way to learn engineering is by building real-world projects, not just following tutorials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
        <div className="glassmorphism p-8 rounded-3xl border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-purple/10 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
          <h2 className="text-3xl font-bold mb-6 text-white">Our Mission</h2>
          <p className="text-gray-400 leading-relaxed text-lg">
            To provide every B.Tech student with access to high-quality, production-ready project blueprints and the guidance needed to master modern technology stacks. We bridge the gap between academic theory and industry reality.
          </p>
        </div>
        <div className="glassmorphism p-8 rounded-3xl border border-white/10 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-orange/10 blur-[80px] rounded-full -translate-x-1/2 translate-y-1/2"></div>
          <h2 className="text-3xl font-bold mb-6 text-white">The Buildora Way</h2>
          <p className="text-gray-400 leading-relaxed text-lg">
            We don't just sell code. We provide an ecosystem where students can discover, build, collaborate, and deploy. Every project is designed with scalability and best practices in mind, ready for your portfolio and recruiters' eyes.
          </p>
        </div>
      </div>
      <div className="mb-32 relative py-12">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10rem] md:text-[20rem] font-black text-white/[0.02] select-none pointer-events-none uppercase tracking-tighter">
          Our Story
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10 px-4">
          <h2 className="text-4xl font-bold mb-10">The <span className="text-gradient">Origins</span></h2>
          <div className="space-y-8 text-xl text-gray-400 leading-relaxed font-light">
            <p>
              Buildora started with a simple observation: the <span className="text-white font-medium">classroom is where we learn the rules</span>, but the <span className="text-brand-purple font-medium">workshop is where we learn the game</span>. As engineering students ourselves, we felt the gap between textbook exercises and building things that actually work in the real world.
            </p>
            <p>
              We saw brilliant minds struggling not with a lack of potential, but with a lack of direction. We realized that while tutorials are everywhere, production-ready project experience is rare. We wanted to change that.
            </p>
            <blockquote className="py-8 border-y border-white/5 mx-auto max-w-2xl my-12">
              <p className="text-3xl font-accent text-white italic">
                "Our goal was never just to build a platform; it was to build a bridge between education and execution."
              </p>
            </blockquote>
            <p>
              Buildora was born to be that bridge—a launchpad where every project is a real-world case study and every student has the tools to become a creator, not just a consumer of technology.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold mb-12">The Impact We Are Making</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Students Empowered', value: '10K+' },
            { label: 'Projects Completed', value: '5K+' },
            { label: 'Success Stories', value: '500+' },
            { label: 'Expert Mentors', value: '50+' },
          ].map((stat, i) => (
            <div key={i} className="glassmorphism p-6 rounded-2xl">
              <p className="text-3xl font-bold text-gradient mb-2">{stat.value}</p>
              <p className="text-gray-400 text-sm uppercase tracking-wider font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-24">
        <h2 className="text-4xl font-bold mb-12 text-center">Meet the Visionaries</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              name: 'Sachin Chaudhary', 
              role: 'Founder', 
              image: 'https://yrcvpxqgbtmicuomceak.supabase.co/storage/v1/object/public/projects/IMG_0978.jpeg',
              bio: 'Visionary leader with a passion for transforming engineering education.',
              linkedin: 'https://www.linkedin.com/in/sachin-choudhary-b4697a361?'
            },
            { 
              name: 'Uditraj Singh', 
              role: 'Co-founder', 
              image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Uditraj',
              bio: 'Tech enthusiast dedicated to building scalable and robust platforms.',
              linkedin: 'https://linkedin.com/in/uditraj-singh'
            },
            { 
              name: 'Rishiraj Singh', 
              role: 'Co-founder', 
              image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rishiraj',
              bio: 'Strategic thinker focused on operational excellence and student success.',
              linkedin: 'https://linkedin.com/in/rishiraj-singh'
            },
          ].map((founder, i) => (
            <div key={i} className="glassmorphism p-8 rounded-3xl border border-white/10 group hover:border-brand-purple/50 transition-all duration-500 text-center relative overflow-hidden">
              <a 
                href={founder.linkedin} 
                target="_blank" 
                rel="noopener noreferrer"
                className="absolute top-4 right-4 text-gray-500 hover:text-brand-purple transition-colors duration-300"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <div className="w-32 h-32 mx-auto mb-6 rounded-2xl overflow-hidden border-2 border-brand-purple/20 group-hover:border-brand-purple/50 transition-all duration-500">
                <img 
                  src={founder.image} 
                  alt={founder.name} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-white">{founder.name}</h3>
              <p className="text-brand-purple font-medium mb-4 uppercase tracking-wider text-xs">{founder.role}</p>
              <p className="text-gray-400 text-sm leading-relaxed">{founder.bio}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="glassmorphism p-12 rounded-3xl border border-white/10 text-center relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-brand-purple/20 blur-[100px] rounded-full"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-brand-orange/20 blur-[100px] rounded-full"></div>
        <h2 className="text-3xl font-bold mb-6 relative z-10">Ready to start your journey?</h2>
        <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto relative z-10">
          Join thousands of other students and start building projects that matter.
        </p>
        <button className="bg-brand-purple text-white px-10 py-4 rounded-full font-bold shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] transition-all relative z-10">
          Browse Projects
        </button>
      </div>
    </main>
  );
}
