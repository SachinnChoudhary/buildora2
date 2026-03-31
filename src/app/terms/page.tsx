import React from 'react';

export default function TermsPage() {
  return (
    <main className="min-h-screen py-20 px-6 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">
        Terms of <span className="text-gradient">Service</span>
      </h1>
      
      <div className="glassmorphism p-8 md:p-12 rounded-3xl border border-white/10 space-y-8 text-gray-300 leading-relaxed overflow-hidden relative">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-purple/5 blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
        
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing and using Buildora, you agree to comply with and be bound by 
            these Terms of Service. If you do not agree to these terms, please refrain 
            from using the platform.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">2. Intellectual Property</h2>
          <p>
            The platform, including all content, designs, features, and source code 
            blueprints, is protected by intellectual property laws. Users are granted 
            a non-exclusive license to use the purchased projects for personal, educational, 
            and career development purposes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">3. Use of Projects</h2>
          <p>
            Projects purchased from Buildora are intended for the student's learning and portfolio. 
            Redistributing, reselling, or claiming sole authorship of the base projects 
            without significant modification is prohibited. Buildora is not responsible 
            for academic consequences if these terms are violated.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">4. User Responsibilities</h2>
          <p>
            Users are responsible for maintaining the confidentiality of their accounts and 
            passwords. Buildora is not liable for unauthorized access resulting from 
            user negligence.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">5. Limitation of Liability</h2>
          <p>
            Buildora is provided "as is." We do not guarantee that the platform will be 
            always available or error-free. We are not liable for any damages resulting 
            from the use of the platform or the code provided.
          </p>
        </section>

        <div className="pt-8 border-t border-white/10 text-sm text-gray-500">
           Last Updated: March 30, 2026. Buildora Inc.
        </div>
      </div>
    </main>
  );
}
