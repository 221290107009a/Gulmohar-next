'use client';

import React from 'react';

export const ProductSkeletonCard: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-3 shadow-sm animate-pulse space-y-3">
      {/* Image Container Skeleton */}
      <div className="w-full aspect-square bg-gray-200 rounded-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
      </div>
      
      {/* Category Badge & Rating Skeleton */}
      <div className="flex justify-between items-center pt-1">
        <div className="w-16 h-3 bg-gray-200 rounded"></div>
        <div className="w-10 h-3 bg-gray-200 rounded"></div>
      </div>

      {/* Title Skeleton */}
      <div className="w-4/5 h-4 bg-gray-200 rounded"></div>

      {/* Price & Action Button Skeleton */}
      <div className="flex justify-between items-center pt-2">
        <div className="w-20 h-5 bg-gray-200 rounded"></div>
        <div className="w-9 h-9 bg-gray-200 rounded-full"></div>
      </div>
    </div>
  );
};

export const ProductSkeletonGrid: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeletonCard key={i} />
      ))}
    </div>
  );
};
