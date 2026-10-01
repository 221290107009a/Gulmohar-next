'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Star, Award, CheckCircle } from 'lucide-react';
import { HeroSlider } from '@/components/HeroSlider';
import { CategoryBanners } from '@/components/CategoryBanners';
import { FeaturesBar } from '@/components/FeaturesBar';
import { ProductCarousel } from '@/components/ProductCarousel';
import { QuickViewModal } from '@/components/QuickViewModal';
import { ProductSkeletonGrid } from '@/components/ProductSkeletonGrid';
import { ProductItem, CategoryItem, DUMMY_REVIEWS } from '@/data/dummyData';
import { getProducts, getCategories } from '@/lib/api';

export default function HomePage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [quickViewProduct, setQuickViewProduct] = useState<ProductItem | null>(null);

  useEffect(() => {
    let isMounted = true;

    getProducts()
      .then(prodData => {
        if (isMounted && prodData) {
          setProducts(prodData);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    getCategories().then(catData => {
      if (isMounted && catData && catData.length > 0) {
        setCategories(catData);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Build dynamic category sliders with their respective category products
  const categorySliders: { category: CategoryItem; products: ProductItem[]; position: 'left' | 'right' }[] = [];

  categories.forEach((cat, idx) => {
    const catProds = products.filter(p => 
      p.category_id === cat.id || 
      p.category_name.toLowerCase().trim() === cat.title.toLowerCase().trim() ||
      cat.slug.toLowerCase().includes(p.category_name.toLowerCase().trim()) ||
      p.category_name.toLowerCase().trim().includes(cat.title.toLowerCase().trim())
    );
    if (catProds.length > 0) {
      categorySliders.push({
        category: cat,
        products: catProds,
        position: idx % 2 === 0 ? 'left' : 'right'
      });
    }
  });

  // Group any remaining products that weren't matched in existing sliders
  const mappedProductIds = new Set(categorySliders.flatMap(s => s.products.map(p => p.id)));
  const unmappedProducts = products.filter(p => !mappedProductIds.has(p.id));

  if (unmappedProducts.length > 0) {
    const grouped: Record<string, ProductItem[]> = {};
    unmappedProducts.forEach(p => {
      const cName = p.category_name || 'Featured Collection';
      if (!grouped[cName]) grouped[cName] = [];
      grouped[cName].push(p);
    });

    Object.entries(grouped).forEach(([cName, prods], idx) => {
      categorySliders.push({
        category: {
          id: 990 + idx,
          slug: cName.toLowerCase().replace(/\s+/g, '-'),
          title: cName,
          description: 'Handcrafted Footwear Collection',
          image: prods[0]?.images[0] || '/img/men-large.jpg',
          itemCount: prods.length
        },
        products: prods,
        position: (categorySliders.length + idx) % 2 === 0 ? 'left' : 'right'
      });
    });
  }

  // Fallback: If no category sliders exist but products exist, create a general Featured Collection slider
  if (categorySliders.length === 0 && products.length > 0) {
    categorySliders.push({
      category: {
        id: 999,
        slug: 'featured-collection',
        title: 'Featured Footwear Collection',
        description: 'Artisan Handcrafted Footwear',
        image: products[0]?.images[0] || '/img/men-large.jpg',
        itemCount: products.length
      },
      products: products,
      position: 'left'
    });
  }

  return (
    <div className="w-full">
      
      {/* 1. HERO SLIDER (Managed dynamically from Gulmohar Backend) */}
      <HeroSlider />

      {/* 2. FOOTWEAR CATEGORY BANNERS */}
      <CategoryBanners />

      {/* 3. TRUST & FOOTWEAR COMFORT STRIP */}
      <FeaturesBar />

      {/* 4. DYNAMIC CATEGORY PRODUCT CAROUSEL SLIDERS OR SKELETON LOADER */}
      {isLoading ? (
        <section className="py-12 px-4 max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div className="w-48 h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <ProductSkeletonGrid count={4} />
        </section>
      ) : (
        categorySliders.map(({ category, products: catProducts, position }) => (
          <ProductCarousel
            key={category.id}
            title={category.title}
            subtitle={category.description || 'Handcrafted Luxury Collection'}
            bannerImage={category.image || '/img/women-large.jpg'}
            bannerTitle={category.title}
            bannerSubtitle={category.description || 'Step into comfort & elegance'}
            bannerLink={`/shop?category=${category.slug}`}
            bannerPosition={position}
            products={catProducts}
            onQuickView={(p) => setQuickViewProduct(p)}
          />
        ))
      )}

      {/* NEW ARRIVAL SANDALS & SLIDERS FEATURE BANNER */}
      <section className="py-8 px-4 max-w-7xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-[#0b0c10] border border-[#d4af37]/30">
          <div className="relative w-full h-[320px] sm:h-[420px] md:h-[500px]">
            <Image
              src="/img/sandals_banner.jpg"
              alt="Artisan Comfort Sandals & Sliders Collection 2026"
              fill
              priority
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover object-center transform hover:scale-105 transition-transform duration-1000"
            />
            {/* Soft Gradient Overlay for text contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80"></div>
          </div>

          {/* Banner Content Overlay */}
          <div className="absolute bottom-0 inset-x-0 p-6 sm:p-10 md:p-14 z-20 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#d4af37]/25 border border-[#d4af37]/50 text-[#f5d77f] text-xs font-bold uppercase tracking-widest backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" /> LATEST 2026 COLLECTION
              </div>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white font-serif tracking-tight drop-shadow-md">
                Artisan Comfort Sandals & Sliders
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-gray-200 leading-relaxed font-normal max-w-xl drop-shadow">
                Handcrafted double-buckle sliders, T-strap sandals & contoured suede soles in vibrant earth tones — Mustard, Olive Green, Tan Brown, Slate Blue & Onyx Black.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-4">
              <Link
                href="/shop"
                className="px-8 py-4 bg-[#e63946] hover:bg-[#c1121f] text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider shadow-xl shadow-red-600/30 transition-all transform hover:-translate-y-1 flex items-center gap-2"
              >
                <span>Shop New Collection</span>
                <Sparkles className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. LUXURY ARTISAN LEATHER SHOES PROMOTIONAL BANNER */}
      <section className="py-12 px-4 max-w-7xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-[#0c0e15] border border-[#2a2f40] p-8 md:p-14 flex flex-col lg:flex-row items-center justify-between gap-8">

          {/* Decorative Gold Glow */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#d4af37]/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#e63946]/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-xl text-white space-y-4 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#f5d77f] text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" /> 100% Genuine Artisan Leather
            </div>

            <h2 className="text-3xl md:text-5xl font-extrabold font-serif tracking-tight leading-tight">
              Goodyear Welted & <br />
              <span className="text-[#f5d77f]">Orthopedic Memory Cushion</span>
            </h2>

            <p className="text-sm md:text-base text-gray-300 leading-relaxed">
              Every pair of Gulmohar footwear is handcrafted by master cordwainers with orthopedic arch support to ensure you step into comfort and walk in style.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <Link
                href="/shop"
                className="px-8 py-3.5 bg-[#e63946] hover:bg-[#c1121f] text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 transition-all transform hover:-translate-y-0.5"
              >
                Explore Leather Shoes
              </Link>
              <span className="text-xs text-[#f5d77f] font-mono font-bold">
                Flat 50% Coupon: <span className="bg-white/10 px-2 py-1 rounded border border-[#d4af37]/40 text-white">GULMOHAR50</span>
              </span>
            </div>
          </div>

          <div className="relative z-10 w-64 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden border-2 border-[#d4af37]/40 shadow-2xl p-1 bg-black/40">
            <Image
              src="/img/gulmohar-logo.png"
              alt="Gulmohar Footwear Emblem"
              fill
              sizes="(max-width: 768px) 256px, 320px"
              className="object-cover rounded-xl"
            />
          </div>

        </div>
      </section>

      {/* 6. VERIFIED CUSTOMER FOOTWEAR TESTIMONIALS */}
      <section className="py-16 px-4 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#e63946] flex items-center justify-center gap-1">
              <Award className="w-3.5 h-3.5" /> Customer Happiness
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-serif mt-1">
              Loved By Over 25,000+ Shoe Lovers
            </h2>
            <div className="w-16 h-1 bg-[#d4af37] mx-auto mt-3 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DUMMY_REVIEWS.map((review) => (
              <div
                key={review.id}
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center text-amber-400">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 italic leading-relaxed">
                    "{review.comment}"
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#0f1117] text-[#f5d77f] font-bold text-xs flex items-center justify-center font-serif">
                      {review.name[0]}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">{review.name}</h4>
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-500" /> Verified Footwear Buyer
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400">{review.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUICK VIEW POPUP MODAL */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

    </div>
  );
}
