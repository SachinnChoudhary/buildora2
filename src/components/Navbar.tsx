'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 glassmorphism border-b border-white/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-extrabold tracking-tighter">
              <span className="text-brand-orange">Build</span><span className="text-white">ora</span><span className="text-brand-purple">.</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            <Link href="/projects" className="text-gray-300 hover:text-white transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-white/5 text-sm font-medium">
              Projects
            </Link>
            <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-white/5 text-sm font-medium">
              Pricing
            </Link>
            <Link href="/about" className="text-gray-300 hover:text-white transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-white/5 text-sm font-medium">
              About
            </Link>
            <Link href="/custom-requests" className="text-gray-300 hover:text-white transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-white/5 text-sm font-medium">
              Custom Engineering
            </Link>
            <Link href="/contact" className="text-gray-300 hover:text-white transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-white/5 text-sm font-medium">
              Contact
            </Link>

            <div className="w-px h-6 bg-white/10 mx-2" />

            {user ? (
              <div className="flex items-center gap-3">
                <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-white/5 text-sm font-medium">
                  Dashboard
                </Link>
                <button onClick={logout} className="text-gray-400 hover:text-red-400 transition-colors duration-200 text-sm font-medium px-3 py-2">
                  Logout
                </button>
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-purple to-brand-orange flex items-center justify-center text-xs font-bold text-white uppercase shadow-lg">
                  {user.displayName?.charAt(0) || user.email?.charAt(0)}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="text-gray-300 hover:text-white transition-colors duration-200 px-4 py-2 text-sm font-medium">
                  Log In
                </Link>
                <Link href="/register" className="bg-brand-purple hover:bg-brand-purple/80 transition-all duration-300 text-white px-5 py-2 rounded-full text-sm font-bold shadow-[0_0_15px_rgba(139,92,246,0.25)]">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/5 focus:outline-none transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="glassmorphism border-t border-white/10 px-4 pt-4 pb-6 space-y-1">
          <Link href="/projects" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white hover:bg-white/5 block px-4 py-3 rounded-lg text-base font-medium transition-colors">Projects</Link>
          <Link href="/pricing" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white hover:bg-white/5 block px-4 py-3 rounded-lg text-base font-medium transition-colors">Pricing</Link>
          <Link href="/about" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white hover:bg-white/5 block px-4 py-3 rounded-lg text-base font-medium transition-colors">About</Link>
          <Link href="/custom-requests" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white hover:bg-white/5 block px-4 py-3 rounded-lg text-base font-medium transition-colors">Custom Engineering</Link>
          <Link href="/contact" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white hover:bg-white/5 block px-4 py-3 rounded-lg text-base font-medium transition-colors">Contact</Link>
          <div className="border-t border-white/10 pt-3 mt-3">
            {user ? (
              <>
                <Link href="/dashboard" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white hover:bg-white/5 block px-4 py-3 rounded-lg text-base font-medium transition-colors">Dashboard</Link>
                <button onClick={() => { logout(); setIsOpen(false); }} className="text-red-400 hover:text-red-300 block px-4 py-3 rounded-lg text-base font-medium w-full text-left transition-colors">Logout</button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white hover:bg-white/5 block px-4 py-3 rounded-lg text-base font-medium transition-colors">Log In</Link>
                <Link href="/register" onClick={() => setIsOpen(false)} className="text-brand-orange font-bold block px-4 py-3 rounded-lg text-base transition-colors">Get Started &rarr;</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
