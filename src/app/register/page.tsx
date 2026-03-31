'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { mapFirebaseError } from '@/lib/error-mapping';

export default function RegisterPage() {
  const { user, signInWithGoogle, signUpWithEmail, loading } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await signUpWithEmail(email, password, displayName);
    } catch (err: any) {
      setError(mapFirebaseError(err));
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-1/2 left-1/2 -z-10 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 blur-[100px] rounded-full bg-brand-orange/10"></div>
      
      <div className="max-w-md w-full space-y-8 glassmorphism p-10 rounded-2xl">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-white">
            Join <span className="text-gradient">Buildora</span> Framework
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Start building production-grade academic projects today.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-md text-center">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="display-name" className="sr-only">Full Name</label>
              <input
                id="display-name"
                name="name"
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="appearance-none relative block w-full px-3 py-3 border border-white/10 bg-white/5 placeholder-gray-500 text-white rounded-lg focus:outline-none focus:ring-brand-purple focus:border-brand-purple focus:z-10 sm:text-sm"
                placeholder="Full Name (e.g. John Doe)"
              />
            </div>
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-3 border border-white/10 bg-white/5 placeholder-gray-500 text-white rounded-lg focus:outline-none focus:ring-brand-purple focus:border-brand-purple focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-3 border border-white/10 bg-white/5 placeholder-gray-500 text-white rounded-lg focus:outline-none focus:ring-brand-purple focus:border-brand-purple focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">Confirm Password</label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-3 border border-white/10 bg-white/5 placeholder-gray-500 text-white rounded-lg focus:outline-none focus:ring-brand-purple focus:border-brand-purple focus:z-10 sm:text-sm"
                placeholder="Confirm password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-purple hover:bg-brand-purple/80 transition-all focus:outline-none shadow-[0_0_15px_rgba(139,92,246,0.3)]"
            >
              Start Your Journey
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-gray-400">Or join with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={signInWithGoogle}
            className="group relative w-full flex justify-center py-3 px-4 border border-white/20 text-sm font-medium rounded-md text-white bg-white/5 hover:bg-white/10 transition-all focus:outline-none"
          >
            Google
          </button>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Already a member?</span>
            <Link href="/login" className="font-medium text-brand-purple hover:text-brand-orange transition-colors">
              Log in instead
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
