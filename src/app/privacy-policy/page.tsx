'use client';

import React from 'react';
import { ShieldCheck, Lock, Eye, FileText } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      <section className="bg-[#0f1117] text-white py-16 px-4 border-b border-[#222736]">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#f5d77f]">Data Security & Protection</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-serif">Privacy Policy</h1>
          <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto">
            Last Updated: September 2026. How Gulmohar Footwear collects, uses, and safeguards your personal information.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto py-12 px-4 space-y-8 text-xs sm:text-sm text-gray-600 leading-relaxed">
        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200 flex items-start gap-4">
          <ShieldCheck className="w-8 h-8 text-[#d4af37] shrink-0 mt-1" />
          <p className="text-gray-700">
            <strong>Your Privacy Matters:</strong> Gulmohar Footwear (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) respects your confidentiality. We process personal data solely to fulfill orders, provide customer support, and enhance your shopping experience.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900 font-serif flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#e63946]" /> 1. Information We Collect
          </h2>
          <p>When you register an account or place an order, we collect details such as your name, email address, phone number, shipping address, and order transaction history.</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900 font-serif flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#e63946]" /> 2. Payment Security
          </h2>
          <p>We do not store your credit card credentials or bank passwords on our servers. Payment processing is encrypted and handled securely through certified PCI-DSS compliant payment gateways (Razorpay, Paytm, Cashfree).</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900 font-serif flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#e63946]" /> 3. Data Protection & Sharing
          </h2>
          <p>We never sell, rent, or trade your personal information to third-party marketing companies. Data is shared exclusively with verified delivery logistics partners to ensure timely dispatch of your orders.</p>
        </div>
      </div>
    </div>
  );
}
