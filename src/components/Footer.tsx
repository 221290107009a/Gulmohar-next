'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Truck,
  ShieldAlert,
  CreditCard,
  Send,
  Heart
} from 'lucide-react';

export const Footer: React.FC = () => {
  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for subscribing to Gulmohar Footwear newsletter!');
  };

  return (
    <footer className="bg-[#0c0e14] text-white border-t border-[#1f2433]">

      {/* 1. BRAND HIGHLIGHT TRUST STRIP */}
      <div className="border-b border-[#1c2130] py-8 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-[#141824]/60 border border-[#262c3f]">
            <div className="w-12 h-12 rounded-xl bg-[#e63946]/10 text-[#e63946] flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-100">Free Express Delivery</h4>
              <p className="text-xs text-gray-400">All India shipping on orders ₹1499+</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-[#141824]/60 border border-[#262c3f]">
            <div className="w-12 h-12 rounded-xl bg-[#d4af37]/10 text-[#d4af37] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-100">100% Genuine Handcrafted</h4>
              <p className="text-xs text-gray-400">Premium authentic artisan quality</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-[#141824]/60 border border-[#262c3f]">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-100">No Return Policy</h4>
              <p className="text-xs text-gray-400">All sales are final once delivered</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-[#141824]/60 border border-[#262c3f]">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-100">Secure Payment Gateways</h4>
              <p className="text-xs text-gray-400">UPI, Cards, NetBanking & COD</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN FOOTER CONTENT */}
      <div className="max-w-7xl mx-auto py-12 px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

        {/* Brand Column */}
        <div className="lg:col-span-2 space-y-4">
          <Link href="/" className="flex items-center gap-3 group inline-flex">
            <div className="relative w-14 h-14 rounded-xl overflow-hidden shadow-lg border border-[#d4af37]/60 p-0.5 bg-[#0f1117]">
              <Image
                src="/img/gulmohar-logo.png"
                alt="Gulmohar Footwear"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-extrabold tracking-tight text-white font-serif">
                GULMOHAR <span className="text-[#e63946]">FOOTWEAR</span>
              </span>
              <span className="text-[11px] uppercase tracking-widest text-[#f5d77f]">
                Step Into Comfort, Walk In Style
              </span>
            </div>
          </Link>

          <p className="text-sm text-gray-400 leading-relaxed pr-6">
            Gulmohar Footwear & Apparel represents timeless craftsmanship, ergonomic comfort, and contemporary Indian design. Built with premium materials to empower your every stride with confidence.
          </p>

          <div className="space-y-2 pt-2 text-sm text-gray-300">
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-[#d4af37]" />
              <span>Gulmohar Footwear, Vadla, Bhavnagar,364002</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-[#d4af37]" />
              <span>+91 9429974671 / +91 9898798322</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-[#d4af37]" />
              <span>support@footweargulmohar.com</span>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-white border-b border-[#262c3f] pb-2">
            Categories
          </h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link href="/shop?category=footwear" className="hover:text-[#f5d77f] transition-colors">Signature Footwear</Link></li>
            <li><Link href="/shop?category=men" className="hover:text-[#f5d77f] transition-colors">Men's Apparel & Shoes</Link></li>
            <li><Link href="/shop?category=women" className="hover:text-[#f5d77f] transition-colors">Women's Heels & Denim</Link></li>
            <li><Link href="/shop?category=kids" className="hover:text-[#f5d77f] transition-colors">Kid's Jackets & Tops</Link></li>
            <li><Link href="/shop?sale=true" className="hover:text-[#e63946] transition-colors font-medium">Seasonal Special Sale</Link></li>
          </ul>
        </div>

        {/* Customer Care */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-white border-b border-[#262c3f] pb-2">
            Customer Care
          </h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link href="/account" className="hover:text-[#f5d77f] transition-colors">My Account & Orders</Link></li>
            <li><Link href="/cart" className="hover:text-[#f5d77f] transition-colors">View Cart</Link></li>
            <li><Link href="/contact" className="hover:text-[#f5d77f] transition-colors">Contact Support</Link></li>
            <li><Link href="/contact" className="hover:text-[#f5d77f] transition-colors">Shipping & Returns</Link></li>
            <li><Link href="/contact" className="hover:text-[#f5d77f] transition-colors">Size Guide & FAQs</Link></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-white border-b border-[#262c3f] pb-2">
            Join Gulmohar Newsletter
          </h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            Subscribe to receive insider access to new footwear drops, seasonal discounts and styling guides.
          </p>

          <form onSubmit={handleNewsletter} className="space-y-2">
            <div className="relative">
              <input
                type="email"
                required
                placeholder="Enter your email address"
                className="w-full px-3 py-2.5 bg-[#141824] border border-[#2e364d] rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-[#e63946] hover:bg-[#c1121f] text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <span>Subscribe Now</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="pt-2">
            <span className="text-[11px] text-gray-500 block mb-2">We Accept:</span>
            <div className="flex flex-wrap gap-2 text-xs font-mono text-gray-400">
              <span className="bg-[#141824] px-2 py-1 rounded border border-[#262c3f]">UPI / GPay</span>
              <span className="bg-[#141824] px-2 py-1 rounded border border-[#262c3f]">VISA</span>
              <span className="bg-[#141824] px-2 py-1 rounded border border-[#262c3f]">Mastercard</span>
              <span className="bg-[#141824] px-2 py-1 rounded border border-[#262c3f]">COD</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. COPYRIGHT STRIP */}
      <div className="bg-[#08090d] border-t border-[#181c28] py-4 px-4 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-center sm:text-left">
          <p>© {new Date().getFullYear()} Gulmohar Footwear & Apparel. All Rights Reserved.</p>
          <p className="flex items-center gap-1">
            Crafted with <Heart className="w-3.5 h-3.5 text-[#e63946] fill-[#e63946]" /> for Style & Comfort
          </p>
        </div>
      </div>

    </footer>
  );
};
