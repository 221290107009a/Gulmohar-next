'use client';

import React from 'react';
import Link from 'next/link';
import { Truck, ShieldAlert, Clock, MapPin, CheckCircle, HelpCircle, PhoneCall } from 'lucide-react';

export default function ShippingReturnsPage() {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      
      {/* Header Banner */}
      <section className="bg-[#0f1117] text-white py-16 px-4 border-b border-[#222736]">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#f5d77f]">Official Store Guidelines</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-serif">Shipping Information & No Return Policy</h1>
          <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto">
            Everything you need to know about our express delivery timelines, nationwide shipping fees, and strict non-returnable policy.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto py-12 px-4 space-y-12">
        
        {/* Shipping Policy Section */}
        <div className="bg-gray-50 rounded-3xl p-6 sm:p-10 border border-gray-200 space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
            <div className="w-10 h-10 rounded-xl bg-[#e63946]/10 text-[#e63946] flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 font-serif">Nationwide Shipping & Delivery</h2>
              <p className="text-xs text-gray-500">Pan-India dispatch via express courier partners</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-gray-200 space-y-1">
              <div className="flex items-center gap-2 text-[#e63946] font-bold text-xs">
                <Clock className="w-4 h-4" /> Dispatch Time
              </div>
              <p className="text-xs text-gray-600 font-medium">Orders are processed & dispatched within <strong>24–48 hours</strong>.</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-gray-200 space-y-1">
              <div className="flex items-center gap-2 text-[#d4af37] font-bold text-xs">
                <MapPin className="w-4 h-4" /> Metro Timelines
              </div>
              <p className="text-xs text-gray-600 font-medium">Delivered within <strong>2–4 business days</strong> in tier-1 metro cities.</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-gray-200 space-y-1">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                <CheckCircle className="w-4 h-4" /> Shipping Fee
              </div>
              <p className="text-xs text-gray-600 font-medium"><strong>FREE Shipping</strong> on all orders above ₹1,499. (₹99 for orders below ₹1,499).</p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-gray-600 leading-relaxed pt-2">
            <p>• <strong>Order Tracking:</strong> Once your shipment is dispatched, you will receive an SMS and Email notification containing your live AWB tracking link.</p>
            <p>• <strong>Cash on Delivery (COD):</strong> COD is available for select pincodes across India with verification via OTP/SMS before dispatch.</p>
          </div>
        </div>

        {/* No Return Policy Section */}
        <div className="bg-red-50/50 rounded-3xl p-6 sm:p-10 border border-red-200/80 space-y-6">
          <div className="flex items-center gap-3 border-b border-red-200/60 pb-4">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 font-serif">Strict No Return Policy</h2>
              <p className="text-xs text-red-600 font-semibold">All sales are final upon successful delivery</p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-gray-700 leading-relaxed">
            <p className="font-semibold text-gray-900">
              Please read carefully prior to placing your order:
            </p>
            
            <ul className="space-y-2 list-disc pl-5 text-gray-600 text-xs sm:text-sm">
              <li><strong>Final Sale Policy:</strong> All products purchased on Gulmohar Footwear & Apparel are non-returnable and non-refundable.</li>
              <li><strong>Quality & Hygiene Standards:</strong> Due to hygiene compliance and the handcrafted nature of luxury footwear, we do not accept returns or exchanges once the item has been delivered to the customer.</li>
              <li><strong>Damaged or Incorrect Item Received:</strong> In the rare event that you receive a defective or wrong item, please report it to support within 24 hours of delivery with an unboxing video clip for assistance.</li>
            </ul>

            <div className="p-4 bg-white rounded-2xl border border-red-200 text-xs text-gray-600 space-y-1">
              <span className="font-bold text-gray-900 block">Pro Tip for Sizing:</span>
              <p>We strongly encourage checking our detailed <Link href="/size-guide" className="text-[#e63946] underline font-bold">Size Guide & Chart</Link> before placing your order to ensure perfect fitting.</p>
            </div>
          </div>
        </div>

        {/* Need Assistance */}
        <div className="text-center bg-[#0f1117] text-white rounded-3xl p-8 space-y-4">
          <HelpCircle className="w-10 h-10 text-[#d4af37] mx-auto" />
          <h3 className="text-xl font-bold font-serif">Have Questions About Your Order?</h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto">Our customer support team is available Monday to Saturday (10:00 AM – 7:00 PM IST) to resolve any queries.</p>
          <div className="pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#e63946] hover:bg-[#c1121f] text-white text-xs font-bold rounded-xl shadow-md transition-all uppercase tracking-wider"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Contact Customer Support</span>
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
