'use client';

import React from 'react';
import { Truck, ShieldCheck, Award, Headphones, ShieldAlert } from 'lucide-react';

export const FeaturesBar: React.FC = () => {
  const features = [
    {
      icon: Truck,
      title: 'Free Shipping Nationwide',
      desc: 'On all orders above ₹1,499'
    },
    {
      icon: Award,
      title: 'Artisan Crafted Footwear',
      desc: 'Handcrafted luxury and comfort'
    },
    {
      icon: ShieldAlert,
      title: 'No Return Policy',
      desc: 'All sales are final once delivered'
    },
    {
      icon: Headphones,
      title: 'Dedicated 24/7 Support',
      desc: 'Phone & WhatsApp assistance'
    }
  ];

  return (
    <section className="bg-gray-50 border-y border-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[#e63946]/10 text-[#e63946] flex items-center justify-center shrink-0">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900">{f.title}</h4>
                <p className="text-xs text-gray-500">{f.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
