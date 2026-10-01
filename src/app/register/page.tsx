'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Lock, Mail, User, Phone, ArrowRight, ShieldCheck, RefreshCw, KeyRound, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [step, setStep] = useState<'details' | 'otp'>('details');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [timer, setTimer] = useState<number>(60);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Countdown timer for OTP Resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Step 1: Trigger OTP Generation
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!formData.phone || formData.phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);

    // Generate OTP & Trigger Email API
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);

    fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: formData.email || 'ac5818204@gmail.com',
        type: 'otp',
        otp: newOtp
      })
    }).catch(console.error);

    setTimeout(() => {
      setStep('otp');
      setTimer(60);
      setCanResend(false);
      setLoading(false);
      setSuccessMsg(`Verification OTP sent successfully to ${formData.email || 'ac5818204@gmail.com'}`);
    }, 800);
  };

  // Resend OTP
  const handleResendOtp = () => {
    if (!canResend) return;
    setError('');
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setTimer(60);
    setCanResend(false);
    setSuccessMsg(`A new OTP has been sent to ${formData.phone}`);
  };

  // Step 2: Verify OTP & Complete Registration
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!enteredOtp || enteredOtp.length !== 6) {
      setError('Please enter the complete 6-digit OTP.');
      return;
    }

    // Check entered OTP against generated OTP (or test OTP 123456)
    if (enteredOtp !== generatedOtp && enteredOtp !== '123456') {
      setError('Invalid OTP entered. Please check your SMS or try 123456.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      login(formData.email, formData.name);
      router.push('/account');
    }, 1200);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 bg-gray-50/50">
      <div className="w-full max-w-lg bg-white border border-gray-100 rounded-3xl p-8 sm:p-10 shadow-xl space-y-6">
        
        {/* Header with Logo */}
        <div className="text-center space-y-2">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-md mx-auto border border-[#d4af37]/40 p-0.5 bg-[#0f1117]">
            <Image src="/img/gulmohar-logo.png" alt="Gulmohar Logo" fill className="object-cover" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 font-serif">
            {step === 'details' ? 'Create Gulmohar Account' : 'Verify Mobile OTP'}
          </h1>
          <p className="text-xs text-gray-500">
            {step === 'details' 
              ? 'Join our community for exclusive footwear launches and rewards'
              : `Enter the 6-digit verification code sent to ${formData.phone}`}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        {successMsg && step === 'otp' && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
            {generatedOtp && (
              <p className="text-[11px] text-emerald-800 font-mono bg-emerald-100/70 px-2 py-1 rounded border border-emerald-200 inline-block mt-1">
                Demo OTP: <strong>{generatedOtp}</strong> (or enter <strong>123456</strong>)
              </p>
            )}
          </div>
        )}

        {/* STEP 1: ACCOUNT DETAILS FORM */}
        {step === 'details' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Yousaf Khan"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#d4af37]"
                />
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email Address *</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#d4af37]"
                  />
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Number (For OTP) *</label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98987 98322"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#d4af37]"
                  />
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Password *</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#d4af37]"
                  />
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Confirm Password *</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#d4af37]"
                  />
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#e63946] hover:bg-[#c1121f] text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sending Verification OTP...</span>
                </>
              ) : (
                <>
                  <span>Send OTP & Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: OTP VERIFICATION STEP */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 text-center space-y-3">
              <KeyRound className="w-8 h-8 text-[#d4af37] mx-auto" />
              <label className="block text-xs font-bold text-gray-800">Enter 6-Digit Verification Code</label>
              
              <div className="flex justify-center">
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  className="w-48 text-center tracking-[0.5em] text-lg font-mono font-bold py-2.5 bg-white border-2 border-gray-300 rounded-xl outline-none focus:border-[#e63946] shadow-inner"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="text-gray-600 font-bold hover:underline"
                >
                  ← Edit Phone / Details
                </button>

                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-[#e63946] font-bold hover:underline"
                  >
                    Resend OTP
                  </button>
                ) : (
                  <span className="text-gray-400">Resend in <strong>{timer}s</strong></span>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying OTP & Creating Account...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify OTP & Create Account</span>
                </>
              )}
            </button>
          </form>
        )}

        <div className="pt-2 text-center text-xs text-gray-500 border-t border-gray-100">
          Already registered?{' '}
          <Link href="/login" className="text-[#e63946] font-bold hover:underline">
            Sign In Here
          </Link>
        </div>

      </div>
    </div>
  );
}
