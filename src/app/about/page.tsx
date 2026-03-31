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
