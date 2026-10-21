'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Heart, ShoppingBag, Eye, Star, Check } from 'lucide-react';
import { ProductItem } from '@/data/dummyData';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { formatPrice, calculateDiscount } from '@/lib/utils';
import { getProductById } from '@/lib/api';

interface ProductCardProps {
  product: ProductItem;
  onQuickView?: (product: ProductItem) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const router = useRouter();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isAdded, setIsAdded] = useState(false);
  const isWishlisted = isInWishlist(product.id);
  const hasSpecialPrice = Boolean(
    product.has_special_price ?? (product.special_price && product.special_price < product.original_price)
  ) || (product.badge === 'SALE' && product.original_price > product.price);

  const discount = hasSpecialPrice ? calculateDiscount(product.original_price, product.price) : 0;

  // Find first available in-stock size
  const firstInStockSizeObj = product.sizes?.find(s => s.in_stock && s.qty > 0);
  const isOutOfStock = !product.in_stock || (Boolean(product.sizes && product.sizes.length > 0) && !firstInStockSizeObj);

  const handleQuickBuy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    if (onQuickView) {
      onQuickView(product);
    } else {
      router.push(`/product/${product.id}`);
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) onQuickView(product);
  };

  const displayImage = product.images?.[0] || '/img/products/blackheels.jpg';
  const [secondImage, setSecondImage] = useState<string | null>(product.images?.[1] || null);
  const [isHovered, setIsHovered] = useState(false);
  const [hasRequestedAjax, setHasRequestedAjax] = useState(false);

  useEffect(() => {
    if (product.images?.[1]) {
      setSecondImage(product.images[1]);
    }
  }, [product.images]);

  const handlePointerEnter = async () => {
    setIsHovered(true);
    // If second image is not present yet, use AJAX to fetch additional product gallery images
    if (!secondImage && !hasRequestedAjax) {
      setHasRequestedAjax(true);
      try {
        const fullProd = await getProductById(product.id || product.slug);
        if (fullProd && Array.isArray(fullProd.images) && fullProd.images.length > 1) {
          setSecondImage(fullProd.images[1]);
        }
      } catch (err) {
        console.error('AJAX hover image fetch error:', err);
      }
    }
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
      
      {/* 1. Image Container */}
      <Link 
        href={`/product/${product.id}`} 
        onMouseEnter={handlePointerEnter}
        onMouseLeave={handlePointerLeave}
        className="relative w-full aspect-square bg-gray-50 overflow-hidden block"
      >
        <Image
          src={displayImage}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover object-center group-hover:scale-108 transition-transform duration-500"
        />

        {/* Alternate Image on Hover via AJAX */}
        {secondImage && secondImage !== displayImage && (
          <Image
            src={secondImage}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className={`object-cover object-center transition-opacity duration-500 absolute inset-0 ${
              isHovered ? 'opacity-100 scale-108' : 'opacity-0 scale-100'
            }`}
          />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {isOutOfStock ? (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase text-white bg-red-600 shadow-sm">
              OUT OF STOCK
            </span>
          ) : (
            <>
              {hasSpecialPrice && discount > 0 ? (
                <>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase text-white bg-amber-600 shadow-sm">
                    SALE
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#d4af37] text-gray-900 shadow-sm">
                    -{discount}%
                  </span>
                </>
              ) : (
                product.badge && product.badge !== 'SALE' && (
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase text-white shadow-sm ${
                    product.badge === 'HOT' ? 'bg-[#e63946]' :
                    product.badge === 'NEW' ? 'bg-emerald-600' : 'bg-[#0f1117]'
                  }`}>
                    {product.badge}
                  </span>
                )
              )}
            </>
          )}
        </div>

        {/* Floating Actions: Wishlist & Quick View */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
          <button
            onClick={handleWishlist}
            aria-label="Wishlist"
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-md ${
              isWishlisted 
                ? 'bg-[#e63946] text-white' 
                : 'bg-white/90 text-gray-700 hover:bg-[#e63946] hover:text-white backdrop-blur-sm'
            }`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
          </button>

          {onQuickView && (
            <button
              onClick={handleQuickViewClick}
              aria-label="Quick View"
              className="w-8 h-8 rounded-full bg-white/90 text-gray-700 hover:bg-[#0f1117] hover:text-[#f5d77f] flex items-center justify-center transition-all shadow-md opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Hover Quick Buy Overlay */}
        <div className="absolute inset-x-3 bottom-3 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <button
            onClick={handleQuickBuy}
            disabled={isOutOfStock}
            className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-lg ${
              isOutOfStock
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed shadow-none'
                : 'bg-[#0f1117] hover:bg-[#e63946] text-white active:scale-98'
            }`}
          >
            {isOutOfStock ? (
              <span>Out of Stock</span>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" /> Quick Buy
              </>
            )}
          </button>
        </div>
      </Link>

      {/* 2. Product Details */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-2">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            {product.category_name}
          </span>
          <Link href={`/product/${product.id}`} className="block">
            <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#e63946] transition-colors line-clamp-1 mt-0.5">
              {product.title}
            </h3>
          </Link>
        </div>

        {/* Available Sizes Strip */}
        <div className="flex items-center gap-1 overflow-x-auto py-1">
          <span className="text-[10px] text-gray-400 mr-1 shrink-0 font-medium">Sizes:</span>
          {product.sizes?.map((s, idx) => (
            <span
              key={idx}
              className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold shrink-0 ${
                s.in_stock && s.qty > 0
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-gray-50 text-gray-300 line-through'
              }`}
              title={s.in_stock && s.qty > 0 ? `${s.qty} in stock` : 'Out of stock'}
            >
              {s.size.split(' ')[0]}
            </span>
          ))}
        </div>

        {/* Ratings */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center text-amber-400">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span className="text-xs font-bold text-gray-800 ml-1">{product.rating}</span>
          </div>
          <span className="text-[11px] text-gray-400">({product.review_count})</span>
        </div>

        {/* Price Row */}
        <div className="flex items-baseline gap-2 pt-1 border-t border-gray-50">
          <span className="text-base font-extrabold text-[#e63946]">
            {formatPrice(product.price)}
          </span>
          {hasSpecialPrice && discount > 0 && product.original_price > product.price && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(product.original_price)}
            </span>
          )}
        </div>
      </div>

    </div>
  );
};
