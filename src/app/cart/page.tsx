'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, Tag, ArrowLeft, AlertCircle } from 'lucide-react';
import { useCart, isCartItemInStock } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const { 
    items, 
    itemCount, 
    subtotal, 
    discount, 
    couponCode, 
    total, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    applyCoupon,
    hasOutOfStockItems,
    removeOutOfStockItems
  } = useCart();

  const [inputCoupon, setInputCoupon] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;
    const success = applyCoupon(inputCoupon);
    if (success) {
      setCouponMessage({ type: 'success', text: `Coupon "${inputCoupon.toUpperCase()}" applied successfully!` });
      setInputCoupon('');
    } else {
      setCouponMessage({ type: 'error', text: 'Invalid coupon code. Try GULMOHAR50 or WELCOME10' });
    }
  };

  const shipping = subtotal > 1500 || subtotal === 0 ? 0 : 99;

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-24 px-4 text-center">
        <div className="w-20 h-20 bg-red-50 text-[#e63946] rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 font-serif">Your Shopping Bag is Empty</h2>
        <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
          Explore our handcrafted footwear and latest fashion apparel to find the perfect addition to your style.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex items-center gap-2 px-8 py-3.5 bg-[#e63946] hover:bg-[#c1121f] text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-red-600/20 transition-all"
        >
          <span>Start Shopping Now</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      
      {/* Header */}
      <div className="border-b border-gray-100 pb-4 mb-8 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 font-serif">Shopping Bag</h1>
          <p className="text-xs text-gray-500 mt-1">Review items ({itemCount}) before secure checkout</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-gray-400 hover:text-red-600 self-start sm:self-auto transition-colors"
        >
          Clear entire bag
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Cart Items List Table */}
        <div className="lg:col-span-2 space-y-4">
          {hasOutOfStockItems && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-red-700">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <span><strong>Attention:</strong> Some items in your bag are out of stock. Please remove them to proceed.</span>
              </div>
              <button
                onClick={removeOutOfStockItems}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs self-start sm:self-auto shrink-0 transition-colors"
              >
                Remove Out of Stock
              </button>
            </div>
          )}

          <div className="divide-y divide-gray-100 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            {items.map((item, idx) => {
              const inStock = isCartItemInStock(item);
              return (
              <div key={idx} className={`py-5 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between ${
                !inStock ? 'opacity-80' : ''
              }`}>
                
                {/* Image & Title */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="relative w-20 h-20 rounded-2xl bg-gray-50 overflow-hidden shrink-0 border border-gray-100">
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#e63946]">
                      {item.product.category_name}
                    </span>
                    <Link href={`/product/${item.product.id}`} className="block">
                      <h3 className="text-sm font-bold text-gray-900 hover:text-[#e63946] transition-colors truncate">
                        {item.product.title}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      {item.selectedSize && <span>Size: <strong className="text-gray-800">{item.selectedSize}</strong></span>}
                      <span>Unit: <strong className="text-gray-800">{formatPrice(item.product.price)}</strong></span>
                      {!inStock && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-red-100 text-red-700 border border-red-200">
                          Out of Stock
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stepper, Total & Remove */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-gray-50">
                  
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="px-3 py-1.5 text-gray-600 hover:bg-gray-200 font-bold"
                    >
                      -
                    </button>
                    <span className="px-3 py-1.5 text-xs font-bold text-gray-900">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="px-3 py-1.5 text-gray-600 hover:bg-gray-200 font-bold"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-sm font-extrabold text-[#e63946] min-w-[75px] text-right">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                </div>

              </div>
              );
            })}
          </div>

          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-[#e63946]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>

        {/* Order Summary & Coupon */}
        <div className="space-y-6">
          
          {/* Coupon Box */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#d4af37]" /> Apply Promo Voucher
            </h3>
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                value={inputCoupon}
                onChange={(e) => setInputCoupon(e.target.value)}
                placeholder="e.g. GULMOHAR50"
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs uppercase font-mono tracking-wider outline-none focus:border-[#d4af37]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#0f1117] hover:bg-black text-[#f5d77f] text-xs font-bold rounded-xl"
              >
                Apply
              </button>
            </form>

            {couponMessage && (
              <p className={`text-xs font-medium ${couponMessage.type === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
                {couponMessage.text}
              </p>
            )}

            {couponCode && (
              <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-800">
                <span>Code <strong>{couponCode}</strong> Active</span>
                <span className="font-bold">Applied</span>
              </div>
            )}
          </div>

          {/* Totals Breakdown */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-gray-900 font-serif border-b border-gray-100 pb-3">
              Order Calculation
            </h3>

            <div className="space-y-2.5 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Bag Subtotal</span>
                <span className="font-bold text-gray-900">{formatPrice(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Special Discount</span>
                  <span>- {formatPrice(discount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span className="font-bold text-gray-900">
                  {shipping === 0 ? <span className="text-emerald-600">FREE</span> : formatPrice(shipping)}
                </span>
              </div>

              <div className="border-t border-gray-100 pt-3 flex justify-between text-sm font-extrabold text-gray-900">
                <span>Grand Total</span>
                <span className="text-lg text-[#e63946]">{formatPrice(total)}</span>
              </div>
            </div>

            {hasOutOfStockItems ? (
              <div className="space-y-2 mt-4">
                <button
                  disabled
                  className="w-full py-4 bg-gray-200 text-gray-500 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed"
                >
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span>Cannot Checkout: Remove Out of Stock Items</span>
                </button>
                <button
                  onClick={removeOutOfStockItems}
                  className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl text-xs transition-colors"
                >
                  Remove Out of Stock Items
                </button>
              </div>
            ) : (
              <Link
                href="/checkout"
                className="w-full py-4 bg-[#e63946] hover:bg-[#c1121f] text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all mt-4"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-gray-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>256-bit Bank Grade SSL Security</span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
