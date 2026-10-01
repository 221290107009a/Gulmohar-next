'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Package, 
  MapPin, 
  Heart, 
  LogOut, 
  ShieldCheck, 
  Clock, 
  CheckCircle2,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { formatPrice } from '@/lib/utils';

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, setDefaultAddress, removeAddress } = useAuth();
  const { wishlist } = useWishlist();
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses'>('orders');

  const orders: any[] = [];
  const savedAddresses = user?.savedAddresses || [];

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center">
        <div className="w-16 h-16 bg-red-50 text-[#e63946] rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 font-serif">Sign In Required</h2>
        <p className="text-xs text-gray-500 mt-1">Please sign in to view your orders and manage your profile.</p>
        <Link
          href="/login"
          className="mt-5 inline-block px-8 py-3 bg-[#e63946] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      
      {/* Header Profile Greeting */}
      <div className="bg-[#0f1117] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#202534] mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#d4af37]/20 border border-[#d4af37]/50 text-[#f5d77f] font-extrabold text-2xl flex items-center justify-center font-serif">
            {user?.name?.[0] || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-serif">{user?.name}</h1>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{user?.email} • {user?.phone}</p>
          </div>
        </div>

        <button
          onClick={() => { logout(); router.push('/'); }}
          className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-red-500/20 text-white hover:text-red-400 text-xs font-bold transition-colors flex items-center gap-2 border border-white/10"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Navigation Sidebar */}
        <div className="space-y-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between ${
              activeTab === 'orders' ? 'bg-[#e63946] text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <Package className="w-4 h-4" />
              <span>My Orders History</span>
            </div>
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between ${
              activeTab === 'profile' ? 'bg-[#e63946] text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <User className="w-4 h-4" />
              <span>Profile Details</span>
            </div>
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between ${
              activeTab === 'addresses' ? 'bg-[#e63946] text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4" />
              <span>Saved Addresses ({savedAddresses.length})</span>
            </div>
            <ChevronRight className="w-4 h-4" />
          </button>

          <Link
            href="/shop?wishlist=true"
            className="w-full text-left px-4 py-3 rounded-2xl text-xs font-bold bg-white text-gray-700 hover:bg-gray-50 border border-gray-100 transition-all flex items-center justify-between block"
          >
            <div className="flex items-center gap-3">
              <Heart className="w-4 h-4 text-[#e63946]" />
              <span>Wishlist ({wishlist.length})</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
          </Link>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          
          {/* Orders History Tab */}
          {activeTab === 'orders' && (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-gray-900 font-serif border-b border-gray-100 pb-3">
                Recent Orders
              </h2>

              {orders.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <Package className="w-12 h-12 text-gray-300 mx-auto" />
                  <h3 className="text-base font-bold text-gray-800">No Orders Placed Yet</h3>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    When you place an order, your invoice summary and shipment tracking history will appear here.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/shop"
                      className="inline-block px-6 py-2.5 bg-[#e63946] hover:bg-[#c1121f] text-white text-xs font-bold rounded-xl shadow-md transition-colors uppercase tracking-wider"
                    >
                      Explore Footwear Collection
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-gray-900">{order.id}</span>
                          <span className="text-[11px] text-gray-400">• {order.date}</span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${order.statusColor}`}>
                          {order.status}
                        </span>
                      </div>

                      <p className="text-xs text-gray-700 font-medium">
                        {order.items}
                      </p>

                      <div className="flex justify-between items-center pt-2 border-t border-gray-200 text-xs">
                        <span className="text-gray-500">Order Value: <strong className="text-gray-900">{formatPrice(order.total)}</strong></span>
                        <button 
                          onClick={() => alert(`Invoice for ${order.id} will be downloaded.`)}
                          className="text-[#e63946] font-bold hover:underline"
                        >
                          Download Invoice
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-gray-900 font-serif border-b border-gray-100 pb-3">
                Account Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-400 block mb-1">Full Name</span>
                  <strong className="text-gray-900">{user?.name}</strong>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-400 block mb-1">Email Address</span>
                  <strong className="text-gray-900">{user?.email}</strong>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-400 block mb-1">Mobile Phone</span>
                  <strong className="text-gray-900">{user?.phone}</strong>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-400 block mb-1">Default Address</span>
                  <strong className="text-gray-900">{user?.address}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h2 className="text-lg font-bold text-gray-900 font-serif">
                  Saved Delivery Addresses
                </h2>
                <Link
                  href="/checkout"
                  className="px-3 py-1.5 bg-[#e63946] text-white font-bold text-xs rounded-xl"
                >
                  + Add Address at Checkout
                </Link>
              </div>

              {savedAddresses.length === 0 ? (
                <p className="text-xs text-gray-500 py-6 text-center">No saved addresses yet. Addresses saved at checkout will appear here.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {savedAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`p-4 rounded-2xl border-2 space-y-2 text-xs relative ${
                        addr.isDefault ? 'border-[#d4af37] bg-amber-50/20' : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="px-2 py-0.5 bg-gray-900 text-white rounded font-bold text-[10px] uppercase">
                          {addr.label}
                        </span>
                        {addr.isDefault && (
                          <span className="text-[10px] font-bold uppercase text-[#8a6d1c] bg-[#d4af37]/30 px-2 py-0.5 rounded">
                            Default Address
                          </span>
                        )}
                      </div>

                      <p className="font-bold text-gray-900 text-sm">{addr.name || user?.name}</p>
                      <p className="text-gray-600">{addr.street}, {addr.city} - {addr.pincode}</p>
                      <p className="text-gray-500">Mobile: {addr.phone}</p>

                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                        {!addr.isDefault && (
                          <button
                            onClick={() => setDefaultAddress(addr.id)}
                            className="text-[#d4af37] font-bold hover:underline"
                          >
                            Set as Default
                          </button>
                        )}
                        <button
                          onClick={() => removeAddress(addr.id)}
                          className="text-red-500 font-bold hover:underline ml-auto"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
