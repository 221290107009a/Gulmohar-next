'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProductItem } from '@/data/dummyData';

export interface CartItem {
  product: ProductItem;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export function isCartItemInStock(item: CartItem): boolean {
  if (!item?.product) return false;
  if (item.product.in_stock === false) return false;
  if (item.product.sizes && item.product.sizes.length > 0) {
    const sObj = item.product.sizes.find(s => s.size === item.selectedSize);
    if (!sObj) return false;
    return Boolean(sObj.in_stock && sObj.qty > 0);
  }
  return true;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discount: number;
  couponCode: string;
  total: number;
  isCartOpen: boolean;
  hasOutOfStockItems: boolean;
  addToCart: (product: ProductItem, quantity?: number, color?: string, size?: string) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeOutOfStockItems: () => void;
  clearCart: () => void;
  applyCoupon: (code: string) => boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Restore persisted cart state after client hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const saved = localStorage.getItem('gulmohar_cart');
    if (saved) {
      try {
        setItems(JSON.parse(saved) as CartItem[]);
      } catch {
        console.error('Failed to parse saved cart');
      }
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('gulmohar_cart', JSON.stringify(items));
    }
  }, [items, mounted]);

  const addToCart = (product: ProductItem, quantity = 1, color?: string, size?: string) => {
    if (product.in_stock === false) {
      alert(`"${product.title}" is currently out of stock.`);
      return;
    }

    const targetSize = size || product.sizes?.[0]?.size;
    if (product.sizes && product.sizes.length > 0 && targetSize) {
      const sizeObj = product.sizes.find(s => s.size === targetSize);
      if (sizeObj && (!sizeObj.in_stock || sizeObj.qty <= 0)) {
        alert(`Size "${targetSize}" for "${product.title}" is currently out of stock.`);
        return;
      }
    }

    setItems(prev => {
      const existingIndex = prev.findIndex(item => item.product.id === product.id && item.selectedSize === size && item.selectedColor === color);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prev, {
        product,
        quantity,
        selectedColor: color || product.colors?.[0],
        selectedSize: size || product.sizes?.[0]?.size || 'UK 7'
      }];
    });
  };

  const removeFromCart = (productId: number) => {
    setItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const removeOutOfStockItems = () => {
    setItems(prev => prev.filter(item => isCartItemInStock(item)));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems(prev => prev.map(item => item.product.id === productId ? { ...item, quantity } : item));
  };

  const clearCart = () => {
    setItems([]);
    setCouponCode('');
    setDiscountPercent(0);
  };

  const applyCoupon = (code: string): boolean => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'GULMOHAR50') {
      setCouponCode('GULMOHAR50');
      setDiscountPercent(50);
      return true;
    } else if (cleanCode === 'WELCOME10') {
      setCouponCode('WELCOME10');
      setDiscountPercent(10);
      return true;
    } else if (cleanCode === 'FESTIVE20') {
      setCouponCode('FESTIVE20');
      setDiscountPercent(20);
      return true;
    }
    return false;
  };

  const hasOutOfStockItems = items.some(item => !isCartItemInStock(item));
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const discount = Math.round((subtotal * discountPercent) / 100);
  const shipping = subtotal > 1500 || subtotal === 0 ? 0 : 99;
  const total = Math.max(0, subtotal - discount + shipping);

  return (
    <CartContext.Provider value={{
      items,
      itemCount,
      subtotal,
      discount,
      couponCode,
      total,
      isCartOpen,
      hasOutOfStockItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      removeOutOfStockItems,
      clearCart,
      applyCoupon,
      setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
