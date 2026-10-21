'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { loginUserToBackend } from '@/lib/api';
import LoginMarqueeBackground from '@/components/LoginMarqueeBackground';
import { SliderSlide } from '@/lib/slider';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [slides, setSlides] = useState<SliderSlide[]>([]);

  useEffect(() => {
    fetch('/api/login-slider')
      .then((res) => res.json())
      .then((data) => {
        if (data?.slides && Array.isArray(data.slides)) {
          setSlides(data.slides);
        }
      })
      .catch((err) => console.error('Failed to load slides:', err));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    try {
      const authenticatedUser = await loginUserToBackend(email, password);
      login(email, authenticatedUser.name, {
        userId: authenticatedUser.id,
        accessToken: authenticatedUser.accessToken,
        phone: authenticatedUser.phone,
        referralCode: authenticatedUser.referralCode
      });
      const returnTo = new URLSearchParams(window.location.search).get('returnTo');
      const safeReturnTo = returnTo?.startsWith('/') && !returnTo.startsWith('//')
        ? returnTo
        : '/account';
      router.push(safeReturnTo);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Unable to sign in. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center py-12 px-4 overflow-hidden">
      {/* Background Marquee Rows (Left & Right alternating) */}
      <div className="fixed inset-0 z-0" aria-hidden="true">
        <LoginMarqueeBackground slides={slides} />
      </div>

      {/* Floating Center Login Card with Luxury Glassmorphism */}
      <div className="relative z-10 w-full max-w-md bg-white/95 dark:bg-zinc-900/90 border border-white/60 dark:border-zinc-800/80 rounded-3xl p-8 shadow-2xl backdrop-blur-xl space-y-6">

        {/* Header with Logo */}
        <div className="text-center space-y-2">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-md mx-auto border border-[#d4af37]/40 p-0.5 bg-[#0f1117]">
            <Image src="/img/gulmohar-logo.png" alt="Gulmohar Logo" fill className="object-cover" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white font-serif">Customer Sign In</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Access your Gulmohar orders and saved favorites</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 rounded-xl text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-3 bg-gray-50/80 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs outline-none focus:border-[#d4af37]"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1 text-xs">
              <label className="font-bold text-gray-700 dark:text-gray-300">Password</label>
              <Link href="/forgot-password" className="text-[#e63946] font-semibold hover:underline">Forgot?</Link>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-gray-50/80 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs outline-none focus:border-[#d4af37]"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#e63946] hover:bg-[#c1121f] text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <span>{loading ? 'Verifying credentials...' : 'Sign In to Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-zinc-800">
          Don&apos;t have an account yet?{' '}
          <Link href="/register" className="text-[#e63946] font-bold hover:underline">
            Create Account
          </Link>
        </div>

      </div>
    </div>
  );
}
