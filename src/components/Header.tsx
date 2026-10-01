'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  Phone,
  ChevronDown,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/utils';
import { CategoryItem } from '@/data/dummyData';
import { getCategories } from '@/lib/api';

export const Header: React.FC = () => {
  const router = useRouter();
  const { items, itemCount, subtotal, removeFromCart } = useCart();
  const { wishlist } = useWishlist();
  const { user, isAuthenticated, logout } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartDropdownOpen, setIsCartDropdownOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  useEffect(() => {
    async function fetchBackendCategories() {
      try {
        const catData = await getCategories();
        if (catData && catData.length > 0) {
          setCategories(catData);
        }
      } catch (err) {
        console.error('Failed to load categories in Header:', err);
      }
    }
    fetchBackendCategories();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?query=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="w-full z-50 sticky top-0 bg-white transition-all shadow-sm">
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="bg-[#0f1117] text-white text-xs border-b border-[#222736] py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-[#e63946] text-white px-2 py-0.5 rounded font-semibold text-[10px] uppercase tracking-wider">
              <Sparkles className="w-3 h-3 animate-pulse" /> Footwear Sale Live
            </span>
            <span className="text-gray-300">
              Get Up to <strong className="text-[#f5d77f]">50% OFF</strong> on Handcrafted Leather Shoes & Heels!
            </span>
          </div>

          <div className="flex items-center gap-5 text-gray-400">
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Hotline: +91 9429974671</span>
            </div>
            <span className="text-gray-600">|</span>
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Genuine Artisan Leather</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER BAR */}
      <div className="border-b border-gray-100 py-3.5 px-4 bg-white/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden shadow-md border border-[#d4af37]/40 p-0.5 bg-[#0f1117] group-hover:scale-105 transition-transform duration-300">
              <Image
                src="/img/gulmohar-logo.png"
                alt="Gulmohar Footwear Logo"
                fill
                sizes="56px"
                className="object-cover"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl md:text-2xl font-extrabold tracking-tight text-[#0f1117] flex items-center gap-1 font-serif">
                GULMOHAR <span className="text-[#e63946]">FOOTWEAR</span>
              </span>
              <span className="text-[10px] md:text-[11px] uppercase tracking-widest text-[#997300] font-medium">
                Step Into Comfort, Walk In Style
              </span>
            </div>
          </Link>

          {/* Live Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-xl relative">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search leather shoes, sneakers, stiletto heels, loafers, mojaris..."
                className="w-full pl-4 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:bg-white focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 outline-none transition-all"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-[#e63946] hover:bg-[#c1121f] text-white rounded-full flex items-center justify-center transition-all shadow-sm"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Action Icons (Account, Wishlist, Cart) */}
          <div className="flex items-center gap-4 md:gap-6">

            {/* Account dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                className="flex items-center gap-2 text-gray-700 hover:text-[#e63946] transition-colors py-1"
              >
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                  <User className="w-4 h-4" />
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs text-gray-500 font-medium">Hello,</span>
                  <span className="text-xs font-bold text-gray-800 flex items-center gap-0.5">
                    {isAuthenticated ? user?.name?.split(' ')[0] : 'Sign In'}
                    <ChevronDown className="w-3 h-3" />
                  </span>
                </div>
              </button>

              {isAccountDropdownOpen && (
                <div
                  className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                  onMouseLeave={() => setIsAccountDropdownOpen(false)}
                >
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs text-gray-500">Signed in as</p>
                        <p className="text-sm font-semibold text-gray-900 truncate">{user?.email}</p>
                      </div>
                      <Link
                        href="/account"
                        onClick={() => setIsAccountDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#e63946]"
                      >
                        My Account & Orders
                      </Link>
                      <button
                        onClick={() => { logout(); setIsAccountDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="p-3">
                        <Link
                          href="/login"
                          onClick={() => setIsAccountDropdownOpen(false)}
                          className="w-full block text-center py-2 bg-[#e63946] hover:bg-[#c1121f] text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
                        >
                          Sign In
                        </Link>
                      </div>
                      <div className="px-3 pb-2 text-center text-xs text-gray-500">
                        New customer?{' '}
                        <Link
                          href="/register"
                          onClick={() => setIsAccountDropdownOpen(false)}
                          className="text-[#e63946] font-semibold hover:underline"
                        >
                          Sign Up
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Wishlist button */}
            <Link href="/shop?wishlist=true" className="relative p-2 text-gray-700 hover:text-[#e63946] transition-colors">
              <Heart className="w-6 h-6" />
              {wishlist.length > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-[#e63946] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart with Dropdown Hover */}
            <div
              className="relative"
              onMouseEnter={() => setIsCartDropdownOpen(true)}
              onMouseLeave={() => setIsCartDropdownOpen(false)}
            >
              <Link
                href="/cart"
                className="flex items-center gap-2 p-2 bg-gray-50 hover:bg-gray-100 rounded-full border border-gray-200 transition-colors group"
              >
                <div className="relative">
                  <ShoppingBag className="w-5 h-5 text-gray-800 group-hover:text-[#e63946] transition-colors" />
                  <span className="absolute -top-1.5 -right-2 w-5 h-5 bg-[#e63946] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    {itemCount}
                  </span>
                </div>
                <div className="hidden sm:flex flex-col text-left pr-2">
                  <span className="text-[10px] text-gray-500 leading-none">Bag Total</span>
                  <span className="text-xs font-bold text-gray-900 leading-tight">{formatPrice(subtotal)}</span>
                </div>
              </Link>

              {/* Cart Dropdown Preview */}
              {isCartDropdownOpen && (
                <div className="absolute right-0 top-11 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <span className="font-bold text-gray-900 text-sm">Shopping Bag ({itemCount})</span>
                    <span className="text-xs text-gray-500 font-medium">Subtotal: {formatPrice(subtotal)}</span>
                  </div>

                  {items.length === 0 ? (
                    <div className="py-8 text-center">
                      <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-gray-700">Your bag is empty</p>
                      <p className="text-xs text-gray-400 mt-1">Explore our shoes, sneakers & heels</p>
                      <Link
                        href="/shop"
                        onClick={() => setIsCartDropdownOpen(false)}
                        className="mt-4 inline-block px-4 py-2 bg-[#0f1117] text-[#f5d77f] text-xs font-bold rounded-lg hover:bg-black transition-colors"
                      >
                        Explore Footwear
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div className="max-h-60 overflow-y-auto py-2 space-y-3 divide-y divide-gray-50">
                        {items.map((item, idx) => (
                          <div key={idx} className="pt-2 flex items-center gap-3">
                            <div className="relative w-14 h-14 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                              <Image
                                src={item.product.images[0]}
                                alt={item.product.title}
                                fill
                                sizes="56px"
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-bold text-gray-900 truncate">{item.product.title}</h4>
                              <p className="text-[11px] text-gray-500">
                                {item.quantity} × <strong className="text-[#e63946]">{formatPrice(item.product.price)}</strong>
                              </p>
                              {item.selectedSize && (
                                <span className="inline-block text-[10px] bg-red-50 text-[#e63946] font-bold px-1.5 py-0.5 rounded">
                                  Size: {item.selectedSize}
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="pt-3 border-t border-gray-100 space-y-2">
                        <div className="flex justify-between items-center font-bold text-sm">
                          <span>Total Amount:</span>
                          <span className="text-[#e63946] text-base">{formatPrice(subtotal)}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Link
                            href="/cart"
                            onClick={() => setIsCartDropdownOpen(false)}
                            className="py-2.5 text-center text-xs font-bold text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                          >
                            View Bag
                          </Link>
                          <Link
                            href="/checkout"
                            onClick={() => setIsCartDropdownOpen(false)}
                            className="py-2.5 text-center text-xs font-bold text-white bg-[#e63946] hover:bg-[#c1121f] rounded-xl shadow-md transition-all flex items-center justify-center gap-1"
                          >
                            Checkout <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-700 hover:text-[#e63946] md:hidden"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* 3. LOWER NAVIGATION BAR */}
      <div className="bg-[#11141c] text-white text-sm hidden md:block border-t border-[#262b36]">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4">

          {/* Footwear Categories Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="flex items-center gap-3 bg-[#e63946] text-white px-6 py-3.5 font-bold uppercase tracking-wide text-xs hover:bg-[#c1121f] transition-colors"
            >
              <Menu className="w-4 h-4" />
              <span>Footwear Categories</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`} />
            </button>

            {isCategoryOpen && (
              <div
                className="absolute left-0 top-full w-64 bg-white text-gray-800 shadow-2xl rounded-b-xl border border-gray-100 py-2 z-50"
                onMouseLeave={() => setIsCategoryOpen(false)}
              >
                {(categories.length > 0 ? categories : []).map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/shop?category=${cat.slug}`}
                    onClick={() => setIsCategoryOpen(false)}
                    className="flex items-center justify-between px-5 py-2.5 text-xs font-semibold hover:bg-red-50 hover:text-[#e63946] transition-colors border-b border-gray-50 last:border-0"
                  >
                    <span>{cat.title}</span>
                    <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{cat.itemCount || 'Collection'}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Nav Links */}
          <nav className="flex items-center gap-1">
            <Link href="/" className="px-5 py-3.5 font-semibold text-xs tracking-wider uppercase hover:text-[#f5d77f] hover:bg-white/5 transition-colors">
              Home
            </Link>
            <Link href="/shop" className="px-5 py-3.5 font-semibold text-xs tracking-wider uppercase hover:text-[#f5d77f] hover:bg-white/5 transition-colors">
              All Collection
            </Link>
            <Link href="/shop?category=men-footwear" className="px-5 py-3.5 font-semibold text-xs tracking-wider uppercase hover:text-[#f5d77f] hover:bg-white/5 transition-colors">
              Men's Collection
            </Link>
            <Link href="/shop?category=women-footwear" className="px-5 py-3.5 font-semibold text-xs tracking-wider uppercase hover:text-[#f5d77f] hover:bg-white/5 transition-colors">
              Women's Collection
            </Link>
            <Link href="/shop?category=kids-footwear" className="px-5 py-3.5 font-semibold text-xs tracking-wider uppercase hover:text-[#f5d77f] hover:bg-white/5 transition-colors">
              Kid's Collection
            </Link>
            <Link href="/contact" className="px-5 py-3.5 font-semibold text-xs tracking-wider uppercase hover:text-[#f5d77f] hover:bg-white/5 transition-colors">
              Contact
            </Link>
          </nav>

          {/* Free Shipping Badge */}
          <div className="flex items-center gap-2 text-xs text-gray-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Free Express Delivery Above ₹1,499</span>
          </div>

        </div>
      </div>

      {/* 4. MOBILE NAVIGATION DRAWER */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-4 py-4 space-y-4 shadow-xl">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search footwear..."
              className="w-full pl-4 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
            />
            <button type="submit" className="absolute right-2 top-2 text-gray-500">
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Mobile Nav Links */}
          <nav className="flex flex-col space-y-2">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2 px-3 font-semibold text-gray-800 hover:bg-gray-50 rounded-lg"
            >
              Home
            </Link>
            <Link
              href="/shop"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2 px-3 font-semibold text-gray-800 hover:bg-gray-50 rounded-lg"
            >
              All Footwear
            </Link>
            <Link
              href="/shop?category=men-footwear"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2 px-3 font-semibold text-gray-800 hover:bg-gray-50 rounded-lg"
            >
              Men’s Footwear
            </Link>
            <Link
              href="/shop?category=women-footwear"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2 px-3 font-semibold text-gray-800 hover:bg-gray-50 rounded-lg"
            >
              Women’s Footwear
            </Link>
            <Link
              href="/shop?category=kids-footwear"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2 px-3 font-semibold text-gray-800 hover:bg-gray-50 rounded-lg"
            >
              Kid’s Footwear
            </Link>
            <Link
              href="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2 px-3 font-semibold text-gray-800 hover:bg-gray-50 rounded-lg"
            >
              Contact Support
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
