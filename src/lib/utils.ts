import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number | string): string {
  const numeric = typeof price === 'string' ? parseFloat(price.replace(/[^0-9.-]+/g, '')) : price;
  if (isNaN(numeric)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(numeric);
}

export function calculateDiscount(originalPrice: number, sellingPrice: number): number {
  if (!originalPrice || originalPrice <= sellingPrice) return 0;
  return Math.round(((originalPrice - sellingPrice) / originalPrice) * 100);
}

export function stripHtml(html?: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, '').trim();
}

export function truncateText(text: string, length: number = 80): string {
  if (!text) return '';
  const clean = stripHtml(text);
  if (clean.length <= length) return clean;
  return clean.substring(0, length) + '...';
}

