'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Package, 
  MapPin, 
  Heart, 
  LogOut, 
  ChevronRight,
  ExternalLink,
  Share2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { formatPrice } from '@/lib/utils';
import { generateInvoicePDF, getUserOrders, cancelOrderInBackend, OrderPayload } from '@/lib/api';

interface OrderHistoryItem {
  id: string;
  orderId?: string;
  date: string;
  statusColor: string;
  status: string;
  items: string;
  total: number;
  rawOrder?: OrderPayload;
}

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, isAuthReady, logout, setDefaultAddress, removeAddress } = useAuth();
  const { wishlist } = useWishlist();
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses'>('orders');
  const [referralFeedback, setReferralFeedback] = useState('');
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [cancelingOrderId, setCancelingOrderId] = useState<string | null>(null);

  const fetchOrdersFromDb = async () => {
    setLoadingOrders(true);

    // Clean up any legacy localStorage orders so data is strictly from DB
    try {
      localStorage.removeItem('gulmohar_orders');
    } catch {
      // ignore
    }

    let backendOrders: any[] = [];
    try {
      if (user?.id || user?.email) {
        backendOrders = await getUserOrders({ userId: user?.id, email: user?.email });
      }
    } catch (err) {
      console.error('Error fetching backend orders:', err);
    }

    const formatted: OrderHistoryItem[] = backendOrders.map(bo => {
      const orderCode = `Order #${bo.id}`;
      let itemNames = '';
      let parsedItems: any[] = [];

      if (bo.note) {
        try {
          const noteObj = JSON.parse(bo.note);
          if (noteObj && typeof noteObj === 'object') {
            if (Array.isArray(noteObj.items) && noteObj.items.length > 0) {
              parsedItems = noteObj.items;
              itemNames = noteObj.items.map((i: any) => `${i.title} (${i.size ? `Size: ${i.size}, ` : ''}Qty: ${i.quantity})`).join(', ');
            }
          }
        } catch {
          // ignore
        }
      }

      if (!itemNames) {
        itemNames = Array.isArray(bo.products) && bo.products.length > 0
          ? bo.products.map((p: any) => `${p.product?.name || p.name || 'Footwear'} (Qty: ${p.qty})`).join(', ')
          : 'Gulmohar Footwear Order';
      }

      const statusMap: Record<string, { label: string; color: string }> = {
        completed: { label: 'Delivered', color: 'bg-emerald-100 text-emerald-800' },
        processing: { label: 'Processing Order', color: 'bg-blue-100 text-blue-800' },
        pending: { label: 'Order Placed (Pending Dispatch)', color: 'bg-amber-100 text-amber-800' },
        pending_payment: { label: 'Pending Payment', color: 'bg-amber-100 text-amber-800' },
        on_hold: { label: 'On Hold', color: 'bg-orange-100 text-orange-800' },
        canceled: { label: 'Canceled', color: 'bg-red-100 text-red-800' },
        refunded: { label: 'Refunded', color: 'bg-purple-100 text-purple-800' }
      };

      const fallbackLabel = (bo.status || 'Order Placed').replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
      const st = statusMap[bo.status] || { label: fallbackLabel, color: 'bg-amber-100 text-amber-800' };

      const raw: OrderPayload = {
        orderId: orderCode,
        recipientName: `${bo.billing_first_name || ''} ${bo.billing_last_name || ''}`.trim() || user?.name || 'Customer',
        phone: bo.customer_phone || user?.phone || '',
        email: bo.customer_email || user?.email || '',
        address: bo.billing_address_1 || '',
        street: bo.billing_address_1 || '',
        city: bo.billing_city || '',
        state: bo.billing_state || '',
        pincode: bo.billing_zip || '',
        label: 'Delivery Address',
        total: parseFloat(bo.total?.amount || bo.total || 0),
        paymentMethod: bo.payment_method === 'cod' ? 'Cash On Delivery' : 'Prepaid Online',
        date: bo.created_at ? new Date(bo.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent',
        items: parsedItems.length > 0
          ? parsedItems
          : (Array.isArray(bo.products) ? bo.products.map((p: any) => ({
              title: p.product?.name || p.name || 'Footwear',
              quantity: p.qty,
              price: parseFloat(p.unit_price?.amount || p.unit_price || 0)
            })) : [])
      };

      return {
        id: String(bo.id),
        orderId: orderCode,
        date: bo.created_at ? new Date(bo.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent',
        status: st.label,
        statusColor: st.color,
        items: itemNames,
        total: parseFloat(bo.total?.amount || bo.total || 0),
        rawOrder: raw
      };
    });

    setOrders(formatted);
    setLoadingOrders(false);
  };

  useEffect(() => {
    if (!isAuthReady) return;
    fetchOrdersFromDb();
  }, [user, isAuthReady]);

  const handleCancelOrder = async (orderId: string, orderCode?: string) => {
    setCancelingOrderId(orderId);
    try {
      const success = await cancelOrderInBackend(orderId);
      if (success) {
        fetchOrdersFromDb();
      }
    } catch (e) {
      console.error('Cancel order error:', e);
    } finally {
      setCancelingOrderId(null);
    }
  };

  const savedAddresses = user?.savedAddresses || [];

  const handleShareReferral = async () => {
    if (!user?.referralCode) return;
    const referralUrl = new URL('/register', window.location.origin);
    referralUrl.searchParams.set('ref', user.referralCode);
    referralUrl.searchParams.set('source', 'account-share');

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Join Gulmohar Footwear',
          text: `Join Gulmohar Footwear with my referral code ${user.referralCode}.`,
          url: referralUrl.toString()
        });
        setReferralFeedback('Referral link shared.');
      } else {
        await navigator.clipboard.writeText(referralUrl.toString());
        setReferralFeedback('Referral link copied.');
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      setReferralFeedback('Unable to share the referral link from this browser.');
    }
  };

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

              {loadingOrders ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-8 h-8 border-2 border-[#e63946] border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs text-gray-500">Retrieving your order records...</p>
                </div>
              ) : orders.length === 0 ? (
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
                    <div key={order.id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-3 shadow-xs hover:border-[#d4af37]/30 transition-all">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Link href={`/account/orders/${order.id}`} className="flex items-center gap-2 group">
                          <span className="font-mono font-bold text-xs text-gray-900 group-hover:text-[#e63946] transition-colors">{order.orderId || order.id}</span>
                          <span className="text-[11px] text-gray-400">• {order.date}</span>
                        </Link>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${order.statusColor}`}>
                          {order.status}
                        </span>
                      </div>

                      <Link href={`/account/orders/${order.id}`} className="block group">
                        <p className="text-xs text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
                          {order.items}
                        </p>
                      </Link>

                      <div className="flex justify-between items-center pt-2 border-t border-gray-200 text-xs">
                        <span className="text-gray-500">Order Value: <strong className="text-gray-900">{formatPrice(order.total)}</strong></span>
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/account/orders/${order.id}`}
                            className="text-gray-700 hover:text-black font-bold hover:underline transition-colors flex items-center gap-1"
                          >
                            View Details <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                          <button 
                            onClick={() => {
                              if (order.rawOrder) {
                                generateInvoicePDF(order.rawOrder);
                              } else {
                                generateInvoicePDF({
                                  orderId: order.id,
                                  recipientName: user?.name || 'Customer',
                                  phone: user?.phone || '',
                                  email: user?.email || '',
                                  address: user?.address || 'Customer Address',
                                  total: order.total,
                                  paymentMethod: 'Cash On Delivery',
                                  date: order.date,
                                  items: [{ title: order.items, quantity: 1, price: order.total }]
                                });
                              }
                            }}
                            className="text-[#e63946] hover:text-[#c1121f] font-bold hover:underline transition-colors flex items-center gap-1"
                          >
                            Download Tax Invoice
                          </button>
                        </div>
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-gray-100 pt-4">
                <div>
                  <span className="text-gray-400 block mb-1 text-xs">Your referral code</span>
                  <strong className="font-mono text-sm tracking-wider text-gray-900">{user?.referralCode}</strong>
                </div>
                <button
                  type="button"
                  onClick={handleShareReferral}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#e63946] text-white text-xs font-bold rounded-xl hover:bg-[#c1121f]"
                >
                  <Share2 className="w-4 h-4" />
                  Share referral link
                </button>
                {referralFeedback && <span role="status" className="text-xs text-gray-500">{referralFeedback}</span>}
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
