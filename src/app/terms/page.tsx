'use client';

import React from 'react';
import { FileText, ShieldAlert, Scale } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      <section className="bg-[#0f1117] text-white py-16 px-4 border-b border-[#222736]">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#f5d77f]">Legal Agreement</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-serif">Terms & Conditions</h1>
          <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto">
            Terms governing the purchase of products and use of the Gulmohar Footwear online store.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto py-12 px-4 space-y-8 text-xs sm:text-sm text-gray-600 leading-relaxed">
        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200 flex items-start gap-4">
          <Scale className="w-8 h-8 text-[#e63946] shrink-0 mt-1" />
          <p className="text-gray-700">
            By accessing or placing an order on Gulmohar Footwear & Apparel, you agree to be bound by these Terms of Service.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900 font-serif flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#e63946]" /> 1. Product Authenticity & Pricing
          </h2>
          <p>All products displayed on our website are 100% genuine handcrafted items. Prices are listed in Indian Rupees (INR) and are inclusive of GST. Prices are subject to revision without prior notice.</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900 font-serif flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-500" /> 2. Order Cancellation & No Return Policy
          </h2>
          <p>Orders can only be cancelled prior to dispatch. Once an item is dispatched or delivered, all sales are final under our strict No Return Policy.</p>
        </div>
      </div>
    </div>
  );
}
