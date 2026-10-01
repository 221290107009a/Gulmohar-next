'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Filter, ArrowUpDown, Sparkles } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { QuickViewModal } from '@/components/QuickViewModal';
import { ProductSkeletonGrid } from '@/components/ProductSkeletonGrid';
import { ProductItem, CategoryItem, DUMMY_PRODUCTS, DUMMY_CATEGORIES } from '@/data/dummyData';
import { getProducts, getCategories } from '@/lib/api';
import { useWishlist } from '@/context/WishlistContext';

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const initialQuery = searchParams.get('query') || '';
  const isWishlistFilter = searchParams.get('wishlist') === 'true';
  const isSaleFilter = searchParams.get('sale') === 'true';

  const { wishlist } = useWishlist();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedSort, setSelectedSort] = useState<string>('featured');
  const [priceRange, setPriceRange] = useState<number>(6000);
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [quickViewProduct, setQuickViewProduct] = useState<ProductItem | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      getProducts()
        .then(prodData => {
          if (isMounted) {
            setProducts(prodData || []);
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
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (initialCategory) setSelectedCategory(initialCategory);
    if (initialQuery) setSearchQuery(initialQuery);
  }, [initialCategory, initialQuery]);

  // Filter products
  let filtered = isWishlistFilter ? [...wishlist] : [...products];

  if (isSaleFilter) {
    filtered = filtered.filter(p => p.badge === 'SALE' || p.original_price > p.price);
  }

  if (selectedCategory !== 'all') {
    const cat = selectedCategory.toLowerCase();
    filtered = filtered.filter(p => {
      const matchCat = p.category_name.toLowerCase();
      if (cat === 'men-footwear' || cat === 'men') return matchCat.includes('men');
      if (cat === 'women-footwear' || cat === 'women') return matchCat.includes('women');
      if (cat === 'kids-footwear' || cat === 'kids') return matchCat.includes('kid');
      if (cat === 'ethnic-footwear' || cat === 'ethnic') return matchCat.includes('ethnic') || matchCat.includes('artisan');
      return true;
    });
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category_name.toLowerCase().includes(q)
    );
  }

  filtered = filtered.filter(p => p.price <= priceRange);

  if (selectedSize !== 'all') {
    filtered = filtered.filter(p => p.sizes?.some(s => s.size.toLowerCase().includes(selectedSize.toLowerCase()) && (inStockOnly ? s.in_stock && s.qty > 0 : true)));
  }

  if (inStockOnly) {
    filtered = filtered.filter(p => p.sizes?.some(s => s.in_stock && s.qty > 0));
  }

  // Sort
  if (selectedSort === 'priceLowToHigh') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (selectedSort === 'priceHighToLow') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (selectedSort === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  }

  const footwearSizes = ['UK 3', 'UK 4', 'UK 5', 'UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'];

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">

      {/* 1. Header Breadcrumbs & Title */}
      <div className="border-b border-gray-100 pb-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#e63946] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              {isWishlistFilter ? 'Saved Footwear' : isSaleFilter ? 'Footwear Clearance Sale' : 'Official Footwear Catalog'}
            </span>
            <h1 className="text-3xl font-extrabold text-gray-900 font-serif mt-1">
              {isWishlistFilter ? 'My Wishlist' : 'Gulmohar Footwear Collection'}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Showing {filtered.length} handcrafted footwear pairs
            </p>
          </div>

          {/* Sort Options & Mobile Filter Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="lg:hidden px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <Filter className="w-4 h-4" /> Filters
            </button>

            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-500" />
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="bg-transparent text-xs font-bold text-gray-800 outline-none cursor-pointer"
              >
                <option value="featured">Sort: Featured Footwear</option>
                <option value="priceLowToHigh">Price: Low to High</option>
                <option value="priceHighToLow">Price: High to Low</option>
                <option value="rating">Top Customer Rated</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Grid with Sidebar Filters */}
      <div className="flex flex-col lg:flex-row gap-8">

        {/* Sidebar Filters */}
        <aside className={`lg:w-64 w-full shrink-0 space-y-8 ${isMobileFilterOpen ? 'block' : 'hidden lg:block'}`}>

          {/* Categories Filter */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2">
              Footwear Categories
            </h4>
            <div className="space-y-1.5">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors flex justify-between items-center ${selectedCategory === 'all' ? 'bg-[#e63946] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                <span>All Footwear</span>
                <span>{products.length}</span>
              </button>
              {categories.map((cat) => {
                const count = products.filter(p =>
                  p.category_id === cat.id ||
                  p.category_name.toLowerCase() === cat.title.toLowerCase() ||
                  cat.slug.toLowerCase().includes(p.category_name.toLowerCase())
                ).length || cat.itemCount || 0;

                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors flex justify-between items-center ${selectedCategory.toLowerCase() === cat.slug.toLowerCase()
                        ? 'bg-[#e63946] text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    <span>{cat.title}</span>
                    <span>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size Filter with Stock indication */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2">
              Shoe Size (UK / India)
            </h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedSize('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${selectedSize === 'all'
                  ? 'bg-[#0f1117] text-white border-[#0f1117]'
                  : 'border-gray-200 text-gray-700 hover:border-gray-400'
                  }`}
              >
                All
              </button>
              {footwearSizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${selectedSize === s
                    ? 'bg-[#e63946] text-white border-[#e63946] shadow-sm'
                    : 'border-gray-200 text-gray-700 hover:border-gray-400'
                    }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-900">
                Max Price
              </h4>
              <span className="text-xs font-extrabold text-[#e63946]">₹{priceRange}</span>
            </div>
            <input
              type="range"
              min="1000"
              max="6000"
              step="200"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full accent-[#e63946] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-gray-400 font-mono">
              <span>₹1,000</span>
              <span>₹6,000</span>
            </div>
          </div>

          {/* In Stock Only Checkbox */}
          <div className="pt-2">
            <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 accent-[#e63946] rounded"
              />
              <span>In-Stock Sizes Only</span>
            </label>
          </div>

          {/* Reset Filters */}
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedSort('featured');
              setPriceRange(6000);
              setSelectedSize('all');
              setInStockOnly(false);
              setSearchQuery('');
            }}
            className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors"
          >
            Clear All Filters
          </button>

        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          {isLoading ? (
            <ProductSkeletonGrid count={6} />
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center bg-gray-50 rounded-2xl p-8">
              <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-800">No footwear pairs found</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                We couldn't find any footwear matching your chosen size or category filter. Try clearing filters.
              </p>
              <button
                onClick={() => { setSelectedCategory('all'); setSearchQuery(''); setPriceRange(6000); setSelectedSize('all'); setInStockOnly(false); }}
                className="mt-5 px-6 py-2.5 bg-[#e63946] text-white text-xs font-bold rounded-xl"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filtered.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          )}
        </main>

      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm font-bold text-gray-500">Loading footwear catalog...</div>}>
      <ShopContent />
    </Suspense>
  );
}
