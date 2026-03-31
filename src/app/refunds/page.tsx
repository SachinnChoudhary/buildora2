import React from 'react';

export default function RefundPage() {
  return (
    <main className="min-h-screen py-20 px-6 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">
        Refund <span className="text-gradient">Policy</span>
      </h1>
      
      <div className="glassmorphism p-8 md:p-12 rounded-3xl border border-white/10 space-y-8 text-gray-300 leading-relaxed">
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">1. Eligibility for Refunds</h2>
          <p>
            At Buildora, we strive to provide high-quality, production-ready projects. 
            Because our products are digital downloads, we generally do not offer refunds 
            once the code has been accessed or downloaded. However, we consider refunds 
            in the following cases:
          </p>
          <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
            <li>The project files are corrupted or missing from the download.</li>
            <li>The project does not match the description provided on our platform.</li>
            <li>The support team is unable to resolve a critical technical issue with the initial setup within 7 days.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">2. Non-Refundable Situations</h2>
          <p>
            Refunds will not be granted for:
          </p>
          <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
            <li>Change of mind after downloading the project.</li>
            <li>Incompatibility with local hardware if the tech stack requirements were clearly stated.</li>
            <li>Failure to follow the provided implementation and setup guide.</li>
            <li>Purchasing the wrong project by mistake.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">3. Custom Project Requests</h2>
          <p>
            Custom projects involve dedicated developer time. Payments for custom projects are 
            milestone-based. Once a milestone is approved and delivered, that portion of the 
            payment is non-refundable. Cancellations of custom projects will only refund 
            the unstarted milestones.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">4. Process for Requesting a Refund</h2>
          <p>
            To request a refund, please email our support team at <span className="text-brand-purple font-medium">support@buildora.com</span> 
            with your order ID and a detailed explanation of the issue. All requests will be processed 
            within 5-7 business days.
          </p>
        </section>

        <div className="pt-8 border-t border-white/10 text-sm text-gray-500">
           Last Updated: March 30, 2026. Buildora Inc.
        </div>
      </div>
    </main>
  );
}
