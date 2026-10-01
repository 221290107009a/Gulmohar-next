'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Ruler, HelpCircle, ChevronDown, CheckCircle2, ArrowRight } from 'lucide-react';

export default function SizeGuideFaqsPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "How do I choose the correct shoe size?",
      a: "Gulmohar Footwear uses standard UK/Indian sizing. Measure your foot length from heel to the longest toe in centimeters. If you are between sizes, we recommend selecting one size larger for maximum comfort."
    },
    {
      q: "Are the shoes suitable for wide feet?",
      a: "Yes! Our handcrafted leather loafers, mojaris, and orthopedic sneakers feature flexible natural leather uppers that mould gently to the shape of your feet over 2–3 wears."
    },
    {
      q: "What payment methods do you accept?",
      a: "We accept Credit/Debit cards (Visa, Mastercard, RuPay), UPI (Google Pay, PhonePe, Paytm), Net Banking, and Cash on Delivery (COD) across eligible Indian pincodes."
    },
    {
      q: "How can I track my shipment?",
      a: "Once dispatched, you will receive an SMS and email notification with your live tracking AWB link. You can also view your live status in your Account page."
    },
    {
      q: "What is your Return & Exchange policy?",
      a: "Gulmohar Footwear operates under a strict No Return Policy for hygiene and quality control. All sales are final once delivered. Please refer to our size chart prior to purchase."
    }
  ];

  return (
    <div className="min-h-screen bg-white text-gray-800">
      
      {/* Header Banner */}
      <section className="bg-[#0f1117] text-white py-16 px-4 border-b border-[#222736]">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#f5d77f]">Fit Assistance & FAQs</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-serif">Footwear Size Guide & FAQs</h1>
          <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto">
            Find your exact Indian/UK footwear size and get answers to frequently asked customer questions.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto py-12 px-4 space-y-16">
        
        {/* Footwear Size Chart Section */}
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d4af37]/20 text-[#d4af37] flex items-center justify-center shrink-0">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 font-serif">Indian / UK Size Chart</h2>
              <p className="text-xs text-gray-500">Standard Foot Length Measurements (Centimeters)</p>
            </div>
          </div>

          {/* Men's Size Table */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wider text-[#e63946]">Men's Footwear Size Conversion</h3>
            <div className="overflow-x-auto rounded-2xl border border-gray-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#0f1117] text-[#f5d77f] font-bold uppercase">
                  <tr>
                    <th className="p-3">UK / India Size</th>
                    <th className="p-3">EU Size</th>
                    <th className="p-3">US Size</th>
                    <th className="p-3">Foot Length (cm)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  <tr className="hover:bg-gray-50"><td className="p-3 font-bold">UK 6</td><td className="p-3">40</td><td className="p-3">7</td><td className="p-3">25.0 cm</td></tr>
                  <tr className="hover:bg-gray-50"><td className="p-3 font-bold">UK 7</td><td className="p-3">41</td><td className="p-3">8</td><td className="p-3">25.8 cm</td></tr>
                  <tr className="hover:bg-gray-50"><td className="p-3 font-bold">UK 8</td><td className="p-3">42</td><td className="p-3">9</td><td className="p-3">26.6 cm</td></tr>
                  <tr className="hover:bg-gray-50"><td className="p-3 font-bold">UK 9</td><td className="p-3">43</td><td className="p-3">10</td><td className="p-3">27.5 cm</td></tr>
                  <tr className="hover:bg-gray-50"><td className="p-3 font-bold">UK 10</td><td className="p-3">44</td><td className="p-3">11</td><td className="p-3">28.3 cm</td></tr>
                  <tr className="hover:bg-gray-50"><td className="p-3 font-bold">UK 11</td><td className="p-3">45</td><td className="p-3">12</td><td className="p-3">29.1 cm</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Women's Size Table */}
          <div className="space-y-3 pt-4">
            <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wider text-[#e63946]">Women's Footwear Size Conversion</h3>
            <div className="overflow-x-auto rounded-2xl border border-gray-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#0f1117] text-[#f5d77f] font-bold uppercase">
                  <tr>
                    <th className="p-3">UK / India Size</th>
                    <th className="p-3">EU Size</th>
                    <th className="p-3">US Size</th>
                    <th className="p-3">Foot Length (cm)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  <tr className="hover:bg-gray-50"><td className="p-3 font-bold">UK 3 (36)</td><td className="p-3">36</td><td className="p-3">5</td><td className="p-3">22.5 cm</td></tr>
                  <tr className="hover:bg-gray-50"><td className="p-3 font-bold">UK 4 (37)</td><td className="p-3">37</td><td className="p-3">6</td><td className="p-3">23.2 cm</td></tr>
                  <tr className="hover:bg-gray-50"><td className="p-3 font-bold">UK 5 (38)</td><td className="p-3">38</td><td className="p-3">7</td><td className="p-3">24.0 cm</td></tr>
                  <tr className="hover:bg-gray-50"><td className="p-3 font-bold">UK 6 (39)</td><td className="p-3">39</td><td className="p-3">8</td><td className="p-3">24.7 cm</td></tr>
                  <tr className="hover:bg-gray-50"><td className="p-3 font-bold">UK 7 (40)</td><td className="p-3">40</td><td className="p-3">9</td><td className="p-3">25.5 cm</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FAQs Section */}
        <div className="space-y-6 border-t border-gray-100 pt-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 font-serif">Frequently Asked Questions</h2>
              <p className="text-xs text-gray-500">Everything about ordering, payments, and product care</p>
            </div>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="border border-gray-200 rounded-2xl overflow-hidden transition-all bg-white">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left font-bold text-sm text-gray-900 flex justify-between items-center hover:bg-gray-50 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180 text-[#e63946]' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="p-4 pt-0 text-xs text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Direct Link to Shop */}
        <div className="bg-[#0f1117] text-white rounded-3xl p-8 text-center space-y-4">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
          <h3 className="text-xl font-bold font-serif">Ready to Find Your Perfect Pair?</h3>
          <p className="text-xs text-gray-400">Explore our artisan loafers, leather boots, heels, and ethnic mojaris.</p>
          <div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#e63946] hover:bg-[#c1121f] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md"
            >
              <span>Shop All Footwear</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
