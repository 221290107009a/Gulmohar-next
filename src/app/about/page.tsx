'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Award, ShieldCheck, Sparkles, Truck, Users, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      
      {/* Hero Header */}
      <section className="relative bg-[#0f1117] text-white py-20 px-4 overflow-hidden border-b border-[#222736]">
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:24px_24px]"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/50 text-[#f5d77f] text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" /> Our Legacy & Craftsmanship
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-serif tracking-tight text-white">
            About <span className="text-[#e63946]">Gulmohar Footwear</span>
          </h1>
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Crafting timeless artisan footwear with ergonomic comfort, genuine full-grain leathers, and contemporary Indian design sensibilities since inception.
          </p>
        </div>
      </section>

      {/* Story & Philosophy Section */}
      <section className="max-w-7xl mx-auto py-16 px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-block">
            <span className="text-xs font-bold uppercase tracking-widest text-[#e63946]">Crafted for Distinction</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 font-serif mt-1">
              Where Heritage Artistry Meets Ergonomic Innovation
            </h2>
          </div>

          <p className="text-gray-600 text-sm leading-relaxed">
            At <strong>Gulmohar Footwear</strong>, every pair of shoes tells a story of dedicated craftsmanship. Born out of a passion for authentic leather artistry and modern footwear aesthetics, we bridge the gap between traditional Indian craftsmanship and all-day walking comfort.
          </p>

          <p className="text-gray-600 text-sm leading-relaxed">
            From hand-stitched Punjabi Mojaris and Kolhapuris to sleek Italian-style leather Oxfords, stiletto heels, and everyday memory-foam sneakers, each product undergoes rigorous quality testing and anatomical fit evaluations.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div className="space-y-1">
              <span className="text-2xl font-black text-[#e63946] font-serif">100%</span>
              <p className="text-xs font-bold text-gray-800">Genuine Artisan Leather</p>
            </div>
            <div className="space-y-1">
              <span className="text-2xl font-black text-[#d4af37] font-serif">50,000+</span>
              <p className="text-xs font-bold text-gray-800">Happy Strides Nationwide</p>
            </div>
          </div>
        </div>

        <div className="relative h-96 sm:h-[450px] rounded-3xl overflow-hidden shadow-2xl border border-gray-100 bg-gray-100">
          <Image
            src="/img/gulmohar-logo.png"
            alt="Gulmohar Craftsmanship"
            fill
            className="object-contain p-8 bg-[#0f1117]"
          />
        </div>
      </section>

      {/* Core Brand Pillars */}
      <section className="bg-gray-50 py-16 px-4 border-y border-gray-100">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#e63946]">Why Choose Us</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-serif">Our Commitment to Quality</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#e63946]/10 text-[#e63946] flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 text-base">Full-Grain Leather</h3>
              <p className="text-xs text-gray-500 leading-relaxed">Handpicked hides crafted by master artisans to deliver breathable, durable luxury that ages gracefully.</p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#d4af37]/10 text-[#d4af37] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 text-base">Orthopedic Comfort</h3>
              <p className="text-xs text-gray-500 leading-relaxed">High-density memory foam insoles with arch contouring for effortless, fatigue-free walking.</p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 text-base">Fast Dispatch</h3>
              <p className="text-xs text-gray-500 leading-relaxed">Express nationwide shipping with real-time tracking updates straight to your mobile.</p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 text-base">Ethical Artisan Work</h3>
              <p className="text-xs text-gray-500 leading-relaxed">Directly empowering indigenous footwear craftsmen and fair-wage community clusters across India.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-16 px-4 bg-[#0f1117] text-white text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-2xl sm:text-4xl font-extrabold font-serif">Step Into Gulmohar Elegance</h2>
          <p className="text-xs sm:text-sm text-gray-400">Discover our newest footwear collections, loafers, stilettos, and festive mojaris.</p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#e63946] hover:bg-[#c1121f] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-600/30"
          >
            <span>Explore All Footwear</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

    </div>
  );
}
