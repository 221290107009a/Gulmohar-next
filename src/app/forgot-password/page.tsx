'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, ShieldCheck, RefreshCw, KeyRound, CheckCircle2, ArrowLeft } from 'lucide-react';
import { requestPasswordResetOtp, verifyPasswordResetOtp, resetPasswordWithOtp } from '@/lib/api';

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<'request' | 'otp' | 'reset'>('request');

  const [contactInput, setContactInput] = useState('');
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [timer, setTimer] = useState<number>(60);
  const canResend = step === 'otp' && timer === 0;
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!contactInput.trim()) {
      setError('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    try {
      await requestPasswordResetOtp(contactInput.trim());
      setStep('otp');
      setTimer(60);
      setSuccessMsg(`If an account exists for ${contactInput}, a reset code has been sent.`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to send the password reset code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    setError('');
    setLoading(true);
    try {
      await requestPasswordResetOtp(contactInput.trim());
      setTimer(60);
      setSuccessMsg(`If an account exists for ${contactInput}, a new reset code has been sent.`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to resend the password reset code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!enteredOtp || enteredOtp.length !== 6) {
      setError('Please enter the complete 6-digit OTP.');
      return;
    }

    setLoading(true);
    try {
      await verifyPasswordResetOtp(contactInput.trim(), enteredOtp);
      setStep('reset');
      setSuccessMsg('OTP verified. Please enter your new password.');
    } catch (verificationError) {
      setError(verificationError instanceof Error ? verificationError.message : 'Unable to verify the reset code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await resetPasswordWithOtp(contactInput.trim(), enteredOtp, newPassword, confirmNewPassword);
      setSuccessMsg('Password updated successfully! Redirecting to Sign In...');
      setTimeout(() => router.push('/login'), 1500);
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : 'Unable to update your password.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 bg-gray-50/50">
      <div className="w-full max-w-md bg-white border border-gray-100 rounded-3xl p-8 sm:p-10 shadow-xl space-y-6">
        
        {/* Header with Logo */}
        <div className="text-center space-y-2">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-md mx-auto border border-[#d4af37]/40 p-0.5 bg-[#0f1117]">
            <Image src="/img/gulmohar-logo.png" alt="Gulmohar Logo" fill className="object-cover" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 font-serif">
            {step === 'request' && 'Reset Password'}
            {step === 'otp' && 'Verify OTP'}
            {step === 'reset' && 'Create New Password'}
          </h1>
          <p className="text-xs text-gray-500">
            {step === 'request' && 'Enter your registered email address to receive a reset code'}
            {step === 'otp' && `Enter 6-digit verification OTP sent to ${contactInput}`}
            {step === 'reset' && 'Set a strong new password for your Gulmohar account'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          </div>
        )}

        {/* STEP 1: REQUEST OTP */}
        {step === 'request' && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Registered Email Address *</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={contactInput}
                  onChange={(e) => setContactInput(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#d4af37]"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
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
                  <span>Sending Reset OTP...</span>
                </>
              ) : (
                <>
                  <span>Send Reset OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: VERIFY OTP */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 text-center space-y-3">
              <KeyRound className="w-8 h-8 text-[#d4af37] mx-auto" />
              <label className="block text-xs font-bold text-gray-800">Enter 6-Digit Password Reset OTP</label>
              
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
                  onClick={() => setStep('request')}
                  className="text-gray-600 font-bold hover:underline"
                >
                  ← Edit Contact
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
                  <span>Verifying OTP...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify OTP</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 3: RESET PASSWORD */}
        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">New Password *</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#d4af37]"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Confirm New Password *</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#d4af37]"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
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
                  <span>Saving New Password...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Reset & Save Password</span>
                </>
              )}
            </button>
          </form>
        )}

        <div className="pt-2 text-center text-xs text-gray-500 border-t border-gray-100 flex items-center justify-between">
          <Link href="/login" className="text-gray-600 font-bold hover:underline flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
          
          <Link href="/register" className="text-[#e63946] font-bold hover:underline">
            Create Account
          </Link>
        </div>

      </div>
    </div>
  );
}
