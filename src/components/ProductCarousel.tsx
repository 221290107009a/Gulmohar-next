'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { ProductItem } from '@/data/dummyData';
import { ProductCard } from '@/components/ProductCard';

interface ProductCarouselProps {
  title: string;
  subtitle?: string;
  bannerImage: string;
  bannerTitle: string;
  bannerSubtitle: string;
  bannerLink: string;
  bannerPosition?: 'left' | 'right';
  products: ProductItem[];
  onQuickView?: (p: ProductItem) => void;
}

export const ProductCarousel: React.FC<ProductCarouselProps> = ({
  title,
  subtitle,
  bannerImage,
  bannerTitle,
  bannerSubtitle,
  bannerLink,
  bannerPosition = 'left',
  products,
  onQuickView
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const bannerElement = (
    <div className="lg:w-1/4 w-full shrink-0">
      <div className="relative h-[380px] lg:h-full min-h-[380px] rounded-2xl overflow-hidden shadow-xl border border-gray-100 group">
        <Image
          src={bannerImage}
          alt={bannerTitle}
          fill
          sizes="(max-width: 1024px) 100vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white space-y-3 z-10">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#f5d77f]">
            Featured Showcase
          </span>
          <h3 className="text-3xl font-extrabold font-serif">
            {bannerTitle}
          </h3>
          <p className="text-xs text-gray-300">
            {bannerSubtitle}
          </p>
          <Link
            href={bannerLink}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#e63946] hover:bg-[#c1121f] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all group-hover:translate-x-1"
          >
            <span>Discover More</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <section className="py-12 px-4 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-8 items-stretch">
        
        {bannerPosition === 'left' && bannerElement}

        {/* Products Carousel Area */}
        <div className="lg:w-3/4 w-full flex flex-col justify-between">
          
          {/* Header Controls */}
          <div className="flex items-center justify-between pb-6 border-b border-gray-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#e63946] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> {subtitle || 'Top Trending'}
              </span>
              <h2 className="text-2xl font-extrabold text-gray-900 font-serif">
                {title}
              </h2>
            </div>

            {/* Slider Next/Prev buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => scroll('left')}
                className="w-10 h-10 rounded-full border border-gray-200 hover:border-[#e63946] hover:bg-[#e63946] hover:text-white text-gray-700 flex items-center justify-center transition-colors shadow-sm"
                aria-label="Previous"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-10 h-10 rounded-full border border-gray-200 hover:border-[#e63946] hover:bg-[#e63946] hover:text-white text-gray-700 flex items-center justify-center transition-colors shadow-sm"
                aria-label="Next"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Horizontal scroll container */}
          <div 
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto py-6 scrollbar-none scroll-smooth snap-x"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {products.map((p) => (
              <div key={p.id} className="min-w-[240px] sm:min-w-[260px] max-w-[280px] shrink-0 snap-start">
                <ProductCard product={p} onQuickView={onQuickView} />
              </div>
            ))}
          </div>

          {/* Bottom view all link */}
          <div className="pt-2 text-right">
            <Link 
              href={bannerLink}
              className="text-xs font-bold text-[#e63946] hover:text-[#c1121f] inline-flex items-center gap-1 hover:underline"
            >
              <span>View All {title} Products</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

        {bannerPosition === 'right' && bannerElement}

      </div>
    </section>
  );
};
