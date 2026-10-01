'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
import { SlideItem, DUMMY_SLIDERS } from '@/data/dummyData';
import { getSliders } from '@/lib/api';

export const HeroSlider: React.FC<{ initialSlides?: SlideItem[] }> = ({ initialSlides }) => {
  const [slides, setSlides] = useState<SlideItem[]>(initialSlides || DUMMY_SLIDERS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(!initialSlides);

  useEffect(() => {
    async function loadBackendSlides() {
      try {
        const data = await getSliders();
        if (data && data.length > 0) {
          setSlides(data);
        }
      } catch (err) {
        console.error('Failed to load slides:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadBackendSlides();
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex(prev => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex(prev => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const interval = setInterval(nextSlide, 5500);
    return () => clearInterval(interval);
  }, [nextSlide, isPaused, slides.length]);

  const currentSlide = slides[currentIndex] || slides[0] || DUMMY_SLIDERS[0];

  return (
    <section 
      className="relative w-full overflow-hidden bg-[#0d0f14] min-h-[500px] md:min-h-[620px] flex items-center"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background slide images with crossfade */}
      {slides.map((slide, idx) => (
        <div 
          key={slide.id || idx}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          {/* Background Image */}
          <div className="relative w-full h-full">
            <Image
              src={slide.image || '/img/slide_1.jpg'}
              alt={slide.title}
              fill
              className="object-cover object-center scale-105 transition-transform duration-[7000ms]"
              priority={idx === 0}
            />
            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f14] via-transparent to-transparent"></div>
          </div>
        </div>
      ))}

      {/* Slide Content Container */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 py-16 sm:py-24 w-full">
        <div className="max-w-2xl text-white space-y-6">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/50 text-[#f5d77f] text-xs font-bold uppercase tracking-widest backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>{currentSlide.badge || 'GULMOHAR EXCLUSIVE 2026'}</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight text-white font-serif drop-shadow-md">
            {currentSlide.title}
          </h1>

          {/* Subtitle / Description */}
          <p className="text-base sm:text-lg text-gray-200 leading-relaxed max-w-xl font-normal drop-shadow">
            {currentSlide.content}
          </p>

          {/* Action Button & Offer Tag */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href={currentSlide.action_url || '/shop'}
              className="px-8 py-4 bg-[#e63946] hover:bg-[#c1121f] text-white font-bold rounded-xl text-sm uppercase tracking-wider shadow-lg shadow-red-600/30 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 group"
            >
              <span>{currentSlide.button_text || 'Shop Now'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/shop?category=footwear"
              className="px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-sm uppercase tracking-wider border border-white/30 backdrop-blur-md transition-all"
            >
              Explore Footwear
            </Link>
          </div>

        </div>
      </div>

      {/* Floating Offer Badge (like ecommerce-app off-card) */}
      <div className="hidden lg:flex absolute right-16 top-1/2 -translate-y-1/2 z-20 flex-col items-center justify-center w-36 h-36 rounded-full bg-gradient-to-tr from-[#e63946] to-[#ff6b6b] text-white shadow-2xl border-4 border-white/20 rotate-12 animate-float">
        <span className="text-xs uppercase font-extrabold tracking-widest">Up to</span>
        <span className="text-3xl font-black">60%</span>
        <span className="text-[11px] font-bold uppercase tracking-wider">OFF SALE</span>
      </div>

      {/* Navigation Controls */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/40 hover:bg-[#e63946] text-white border border-white/20 flex items-center justify-center backdrop-blur-md transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/40 hover:bg-[#e63946] text-white border border-white/20 flex items-center justify-center backdrop-blur-md transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  i === currentIndex ? 'w-8 bg-[#d4af37]' : 'w-2.5 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}

    </section>
  );
};
