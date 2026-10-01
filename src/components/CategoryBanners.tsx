'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';

export const CategoryBanners: React.FC = () => {
  const banners = [
    {
      id: 1,
      title: 'Men’s Leather & Sneakers',
      subtitle: 'Oxfords, Loafers & Slip-ons',
      image: '/img/men-large.jpg',
      link: '/shop?category=men-footwear',
      tag: 'NEW RELEASES',
      color: 'from-amber-600/30'
    },
    {
      id: 2,
      title: 'Women’s Heels & Pumps',
      subtitle: 'Stiletto Heels, Flats & Mules',
      image: '/img/women-large.jpg',
      link: '/shop?category=women-footwear',
      tag: 'BESTSELLERS',
      color: 'from-rose-600/30'
    },
    {
      id: 3,
      title: 'Kid’s & Juniors Shoes',
      subtitle: 'Air-Cushion Sport Trainers',
      image: '/img/banner-3.png',
      link: '/shop?category=kids-footwear',
      tag: 'UP TO 40% OFF',
      color: 'from-blue-600/30'
    }
  ];

  return (
    <section className="py-12 px-4 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs font-bold uppercase tracking-widest text-[#e63946] flex items-center justify-center gap-1">
          <Sparkles className="w-3.5 h-3.5" /> Footwear Departments
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1 font-serif">
          Handcrafted Luxury for Every Stride
        </h2>
        <div className="w-16 h-1 bg-[#d4af37] mx-auto mt-3 rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {banners.map((item) => (
          <Link
            key={item.id}
            href={item.link}
            className="group relative h-72 sm:h-80 rounded-2xl overflow-hidden shadow-lg border border-gray-100 block transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
          >
            {/* Background Image */}
            <Image
              src={item.image}
              alt={item.title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
            />
            {/* Dark & Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>

            {/* Top Tag */}
            <div className="absolute top-4 left-4 z-10">
              <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-gray-900 text-[11px] font-extrabold uppercase tracking-wider rounded-full shadow-sm">
                {item.tag}
              </span>
            </div>

            {/* Bottom Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 z-10 text-white space-y-1.5">
              <h3 className="text-xl font-bold font-serif group-hover:text-[#f5d77f] transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-gray-300">
                {item.subtitle}
              </p>
              <div className="pt-2 flex items-center gap-1 text-xs font-bold text-[#f5d77f] group-hover:translate-x-1 transition-transform">
                <span>Explore Footwear</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
