'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, Star, ShoppingBag, Heart, Check, AlertCircle, Zap } from 'lucide-react';
import { ProductItem, ProductSizeItem } from '@/data/dummyData';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { formatPrice, calculateDiscount, stripHtml } from '@/lib/utils';

interface QuickViewModalProps {
  product: ProductItem | null;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedSizeObj, setSelectedSizeObj] = useState<ProductSizeItem | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdded, setIsAdded] = useState<boolean>(false);

  if (!product) return null;

  const currentImg = selectedImage || product.images[0];
  const isWishlisted = isInWishlist(product.id);
  const hasSpecialPrice = Boolean(
    product.has_special_price ?? (product.special_price && product.special_price < product.original_price)
  ) || (product.badge === 'SALE' && product.original_price > product.price);
  const discount = hasSpecialPrice ? calculateDiscount(product.original_price, product.price) : 0;

  const hasSizes = product.sizes && product.sizes.length > 0;
  const activeSize = selectedSizeObj || product.sizes?.find(s => s.in_stock && s.qty > 0) || product.sizes?.[0];
  const isSelectedSizeAvailable = product.in_stock !== false && (hasSizes
    ? Boolean(activeSize?.in_stock && (activeSize?.qty ?? 0) > 0)
    : true);

  const router = useRouter();

  const handleAdd = () => {
    if (!isSelectedSizeAvailable) return;
    addToCart(product, quantity, product.colors?.[0], activeSize?.size);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 1200);
  };

  const handleBuyNow = () => {
    if (!isSelectedSizeAvailable) return;
    addToCart(product, quantity, product.colors?.[0], activeSize?.size);
    onClose();
    router.push('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Modal Card */}
      <div 
        className="relative w-full max-w-3xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-gray-100 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image Gallery Preview */}
        <div className="md:w-1/2 p-6 bg-gray-50 flex flex-col justify-between">
          <div className="relative w-full aspect-square bg-white rounded-2xl overflow-hidden shadow-inner border border-gray-100">
            <Image
              src={currentImg}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
            {hasSpecialPrice && discount > 0 && (
              <span className="absolute top-3 left-3 px-3 py-1 bg-[#e63946] text-white text-xs font-bold rounded-full">
                SAVE {discount}%
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3 mt-4 overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    currentImg === img ? 'border-[#e63946]' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt="Thumbnail" fill sizes="64px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info & Options */}
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#e63946]">
                {product.category_name}
              </span>
              <h2 className="text-xl font-bold text-gray-900 font-serif mt-1">
                {product.title}
              </h2>
            </div>

            {/* Ratings */}
            <div className="flex items-center gap-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <span className="text-xs text-gray-500">({product.review_count} Customer Ratings)</span>
            </div>

            {/* Pricing */}
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-extrabold text-[#e63946]">
                {formatPrice(product.price)}
              </span>
              {hasSpecialPrice && discount > 0 && product.original_price > product.price && (
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(product.original_price)}
                </span>
              )}
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              {stripHtml(product.description)}
            </p>

            {/* Size Selector with Backend Quantity Display */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-800">Select Shoe Size:</span>
                  {activeSize && (
                    <span className={`text-[11px] font-bold ${
                      activeSize.qty > 0 && activeSize.qty <= 5 
                        ? 'text-amber-600' 
                        : activeSize.qty > 5 
                        ? 'text-emerald-600' 
                        : 'text-red-500'
                    }`}>
                      {activeSize.qty > 0 ? `${activeSize.qty} pairs left in stock` : 'Out of Stock'}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((sItem) => {
                    const isAvail = sItem.in_stock && sItem.qty > 0;
                    const isSelected = activeSize?.size === sItem.size;

                    return (
                      <button
                        key={sItem.size}
                        onClick={() => setSelectedSizeObj(sItem)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center min-w-[54px] ${
                          isSelected
                            ? 'border-[#e63946] bg-[#e63946] text-white shadow-md'
                            : isAvail
                            ? 'border-gray-200 text-gray-800 hover:border-gray-400 bg-gray-50'
                            : 'border-dashed border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed'
                        }`}
                      >
                        <span>{sItem.size}</span>
                        <span className={`text-[9px] font-normal ${
                          isSelected ? 'text-white/90' : isAvail ? 'text-gray-400' : 'text-red-300'
                        }`}>
                          {isAvail ? `${sItem.qty} left` : 'Sold'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-200 font-bold"
                >
                  -
                </button>
                <span className="px-4 py-2 text-xs font-bold text-gray-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(activeSize?.qty || 10, q + 1))}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-200 font-bold"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => toggleWishlist(product)}
                className={`p-3 rounded-xl border transition-colors ${
                  isWishlisted ? 'border-red-200 bg-red-50 text-[#e63946]' : 'border-gray-200 text-gray-600 hover:text-[#e63946]'
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-[#e63946]' : ''}`} />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 space-y-2.5">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleAdd}
                disabled={!isSelectedSizeAvailable || isAdded}
                className={`py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md transition-all ${
                  isAdded 
                    ? 'bg-emerald-600 text-white' 
                    : isSelectedSizeAvailable
                    ? 'bg-gray-900 hover:bg-black text-white active:scale-98'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4" /> Added to Bag!
                  </>
                ) : isSelectedSizeAvailable ? (
                  <>
                    <ShoppingBag className="w-4 h-4" /> Add to Bag
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4" /> Out of Stock
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={!isSelectedSizeAvailable}
                className={`py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg transition-all ${
                  isSelectedSizeAvailable
                    ? 'bg-[#e63946] hover:bg-[#c1121f] text-white active:scale-98'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                }`}
              >
                <Zap className="w-4 h-4 fill-white" /> Buy Now
              </button>
            </div>

            <Link
              href={`/product/${product.id}`}
              onClick={onClose}
              className="block text-center text-xs font-bold text-gray-500 hover:text-[#e63946] hover:underline pt-1"
            >
              View Full Product Specifications & Details →
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
};
