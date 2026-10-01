'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProductItem } from '@/data/dummyData';

interface WishlistContextType {
  wishlist: ProductItem[];
  isInWishlist: (id: number) => boolean;
  toggleWishlist: (product: ProductItem) => void;
  removeFromWishlist: (id: number) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<ProductItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('gulmohar_wishlist');
    if (saved) {
      try {
        setWishlist(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved wishlist');
      }
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('gulmohar_wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, mounted]);

  const isInWishlist = (id: number) => wishlist.some(p => p.id === id);

  const toggleWishlist = (product: ProductItem) => {
    if (isInWishlist(product.id)) {
      setWishlist(prev => prev.filter(p => p.id !== product.id));
    } else {
      setWishlist(prev => [...prev, product]);
    }
  };

  const removeFromWishlist = (id: number) => {
    setWishlist(prev => prev.filter(p => p.id !== id));
  };

  return (
    <WishlistContext.Provider value={{ wishlist, isInWishlist, toggleWishlist, removeFromWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};
