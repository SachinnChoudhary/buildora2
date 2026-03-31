import React from 'react';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen py-20 px-6 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">
        Privacy <span className="text-gradient">Policy</span>
      </h1>
      
      <div className="glassmorphism p-8 md:p-12 rounded-3xl border border-white/10 space-y-8 text-gray-300 leading-relaxed overflow-hidden relative">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-orange/5 blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
        
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">1. Data Collection</h2>
          <p>
            Buildora collects information from users when they register, make a purchase, 
            or request custom projects. This includes name, email address, transaction 
            details, and student profiles.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">2. Data Usage</h2>
          <p>
            The information we collect is used to personalize users' experiences, 
            process transactions, improve our platform, and provide technical support 
            through our AI mentor and development team.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">3. Data Security</h2>
          <p>
            We implement various security measures to maintain the safety of your 
            personal information. We use encrypted payment gateways and do not 
            store sensitive payment details on our servers.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">4. Third-Party Access</h2>
          <p>
            We do not sell, trade, or otherwise transfer your personal information 
            to outside parties except for trusted third parties who help us operate 
            our platform (e.g., Stripe for payments, Google for Auth).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">5. Your Consent</h2>
          <p>
            By using our platform, you consent to our website's Privacy Policy.
          </p>
        </section>

        <div className="pt-8 border-t border-white/10 text-sm text-gray-500">
           Last Updated: March 30, 2026. Buildora Inc.
        </div>
      </div>
    </main>
  );
}
