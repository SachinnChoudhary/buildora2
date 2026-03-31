'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { mapFirebaseError } from '@/lib/error-mapping';
import { Eye, EyeOff } from 'lucide-react';
import { getUserProfile } from '@/services/firestore';

function LoginForm() {
  const { user, signInWithGoogle, signInWithEmail, sendPasswordReset, loading } = useAuth();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function handleLoginRedirect() {
      if (user && !loading) {
        console.log("LoginPage: Analyzing redirect for:", user.uid);
        // 1. Priority: Manual Redirect Parameter
        const requestedRedirect = searchParams.get('redirect');
        if (requestedRedirect) {
          console.log("LoginPage: Found explicit redirect param:", requestedRedirect);
          router.push(requestedRedirect);
          return;
        }

        // 2. Secondary: Role-based Redirection
        try {
          const profile = await getUserProfile(user.uid);
          console.log("LoginPage: Profile fetched:", profile);
          if (profile && profile.role === 'admin') {
            console.log("LoginPage: Redirecting ADMIN to /admin");
            router.push('/admin');
          } else {
            console.log("LoginPage: Redirecting USER to /dashboard");
            router.push('/dashboard');
          }
        } catch (err) {
          console.error("LoginPage: Redirect check failed:", err);
          router.push('/dashboard');
        }
      }
    }
    
    handleLoginRedirect();
  }, [user, loading, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetMessage('');
    try {
      await signInWithEmail(email, password);
    } catch (err: any) {
      setError(mapFirebaseError(err));
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email above to receive a reset link.');
      return;
    }
    setError('');
    setIsResetting(true);
    try {
      await sendPasswordReset(email);
      setResetMessage('Check your inbox! We\'ve sent a password reset link to your email.');
      setTimeout(() => setResetMessage(''), 8000);
    } catch (err: any) {
      setError(mapFirebaseError(err));
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="max-w-md w-full space-y-8 glassmorphism p-10 rounded-2xl">
      <div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-white">
          Welcome back to <span className="text-gradient">Buildora</span>
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Sign in to access your projects and AI mentor.
        </p>
      </div>
      
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-md text-center">
            {error}
          </div>
        )}
        {resetMessage && (
          <div className="bg-green-500/10 border border-green-500/50 text-green-500 text-sm p-3 rounded-md text-center">
            {resetMessage}
          </div>
        )}
        <div className="space-y-4">
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
          <div className="relative">
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none relative block w-full px-3 py-3 border border-white/10 bg-white/5 placeholder-gray-500 text-white rounded-lg focus:outline-none focus:ring-brand-purple focus:border-brand-purple focus:z-10 sm:text-sm pr-12"
              placeholder="Password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors z-20"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={isResetting}
            className="text-xs font-medium text-brand-orange hover:text-brand-purple transition-colors disabled:opacity-50"
          >
            {isResetting ? 'Sending link...' : 'Forgot your password?'}
          </button>
        </div>

        <div>
          <button
            type="submit"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-purple hover:bg-brand-purple/80 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-purple"
          >
            Sign In
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-background text-gray-400">Or continue with</span>
          </div>
        </div>

        <button
          type="button"
          onClick={signInWithGoogle}
          className="group relative w-full flex justify-center py-3 px-4 border border-white/20 text-sm font-medium rounded-md text-white bg-white/5 hover:bg-white/10 hover:border-white/30 transition-all focus:outline-none"
        >
          <span className="absolute left-0 inset-y-0 flex items-center pl-3">
            <svg className="h-5 w-5 text-gray-400 group-hover:text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
            </svg>
          </span>
          Google
        </button>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Don't have an account?</span>
          <Link href="/register" className="font-medium text-brand-orange hover:text-brand-purple transition-colors">
            Sign up
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-1/2 left-1/2 -z-10 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 blur-[100px] rounded-full bg-brand-purple/10"></div>
      <Suspense fallback={<div className="text-white">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
