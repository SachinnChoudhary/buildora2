'use client';
import Link from 'next/link';
import { useState } from 'react';

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    period: '',
    description: 'Perfect for exploring the platform.',
    features: [
      '1 Free Mini Project',
      'Basic documentation access',
      'Community support forum',
      'AI Mentor (5 queries/day)',
    ],
    cta: 'Get Started Free',
    highlighted: false,
    gradient: 'from-white/5 to-white/5',
  },
  {
    name: 'Pro Student',
    price: '₹799',
    period: '/month',
    description: 'For serious learners who want full access.',
    features: [
      'All Mini Projects included',
      'Full documentation + video walkthroughs',
      'Priority AI Mentor (unlimited)',
      'Resume & portfolio generator',
      'Deployment guides included',
      'Priority customer support',
    ],
    cta: 'Start Pro Trial',
    highlighted: true,
    gradient: 'from-brand-purple/20 to-brand-orange/20',
  },
  {
    name: 'College',
    price: '₹14999',
    period: '/semester',
    description: 'For institutions looking to empower students.',
    features: [
      'Everything in Pro Student',
      'Bulk student licenses (up to 100)',
      'Admin dashboard & analytics',
      'Plagiarism detection tools',
      'Custom branding options',
      'Dedicated account manager',
      'API integration support',
    ],
    cta: 'Contact Sales',
    highlighted: false,
    gradient: 'from-white/5 to-white/5',
  },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <main className="min-h-screen py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16 relative">
        <div className="absolute top-1/2 left-1/2 -z-10 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 blur-[120px] rounded-full bg-brand-purple/10"></div>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
          Simple, Transparent <span className="text-gradient">Pricing</span>
        </h1>
        <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-10">
          Invest in your career, not in overpriced tutorials. Pick the plan that fits your ambition.
        </p>

        {/* Annual Toggle */}
        <div className="flex items-center justify-center gap-4">
          <span className={`text-sm font-medium ${!annual ? 'text-white' : 'text-gray-500'}`}>Monthly</span>
          <button
            onClick={() => setAnnual(!annual)}
            className={`relative w-14 h-7 rounded-full transition-colors ${annual ? 'bg-brand-purple' : 'bg-white/20'}`}
          >
            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${annual ? 'translate-x-8' : 'translate-x-1'}`}></div>
          </button>
          <span className={`text-sm font-medium ${annual ? 'text-white' : 'text-gray-500'}`}>
            Annual <span className="text-brand-orange text-xs ml-1 font-bold">Save 20%</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative glassmorphism rounded-3xl p-8 border transition-all duration-300 flex flex-col ${
              plan.highlighted
                ? 'border-brand-purple/50 shadow-[0_0_40px_rgba(139,92,246,0.15)] scale-105'
                : 'border-white/10 hover:border-white/20'
            }`}
          >
            {plan.highlighted && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-brand-purple to-brand-orange text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                  Most Popular
                </span>
              </div>
            )}
            
            <div className={`bg-gradient-to-br ${plan.gradient} rounded-2xl p-6 -mx-2 -mt-2 mb-6`}>
              <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
              <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">
                  {plan.price === 'Free' ? 'Free' : annual ? `₹${Math.round(parseInt(plan.price.replace('₹', '')) * 0.8)}` : plan.price}
                </span>
                {plan.period && <span className="text-gray-400">{plan.period}</span>}
              </div>
            </div>

            <ul className="space-y-4 flex-grow mb-8">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm text-gray-300">
                  <svg className="w-5 h-5 text-brand-purple flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            <Link
              href={plan.name === 'College' ? '/contact' : '/register'}
              className={`w-full text-center py-3.5 rounded-xl font-bold transition-all ${
                plan.highlighted
                  ? 'bg-brand-purple text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>

      {/* FAQ teaser */}
      <div className="text-center mt-20">
        <p className="text-gray-400">
          Have questions? <Link href="/contact" className="text-brand-purple hover:text-brand-orange transition-colors font-medium">Talk to our team &rarr;</Link>
        </p>
      </div>
    </main>
  );
}
