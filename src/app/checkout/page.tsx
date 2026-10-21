'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Truck,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  Lock,
  Mail,
  MapPin,
  PlusCircle,
  Home,
  Briefcase,
  Check,
  Printer,
  AlertCircle
} from 'lucide-react';
import { useCart, isCartItemInStock } from '@/context/CartContext';
import { useAuth, SavedAddress } from '@/context/AuthContext';
import { formatPrice } from '@/lib/utils';
import { saveAddressToBackend, placeOrderToBackend, generateInvoicePDF, OrderPayload } from '@/lib/api';

const EMPTY_SAVED_ADDRESSES: SavedAddress[] = [];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, discount, total, clearCart, removeFromCart, hasOutOfStockItems, removeOutOfStockItems } = useCart();
  const { user, addAddress, isAuthenticated, isAuthReady } = useAuth();

  const savedAddresses = user?.savedAddresses ?? EMPTY_SAVED_ADDRESSES;

  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    savedAddresses.find(a => a.isDefault)?.id || savedAddresses[0]?.id || 'custom'
  );

  const [formData, setFormData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: '',
    state: '',
    pincode: '',
    addressLabel: 'Home',
    saveAddress: true,
    notes: ''
  });

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string>('');
  const [placedOrderSummary, setPlacedOrderSummary] = useState<OrderPayload | null>(null);
  const [emailSent, setEmailSent] = useState<boolean | null>(null);

  useEffect(() => {
    if (isAuthReady && !isAuthenticated) {
      router.replace('/login?returnTo=%2Fcheckout');
    }
  }, [isAuthenticated, isAuthReady, router]);

  // Synchronize form when selected address card changes
  useEffect(() => {
    if (selectedAddressId && selectedAddressId !== 'custom') {
      const found = savedAddresses.find(a => a.id === selectedAddressId);
      if (found) {
        const nameParts = (found.name || user?.name || '').split(' ');
        // Keep form fields synchronized when the selected saved address changes.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormData(prev => ({
          ...prev,
          firstName: nameParts[0] || prev.firstName,
          lastName: nameParts.slice(1).join(' ') || prev.lastName,
          phone: found.phone || prev.phone,
          address: found.street || prev.address,
          city: found.city || prev.city,
          state: found.state || prev.state,
          pincode: found.pincode || prev.pincode,
          addressLabel: found.label || 'Home'
        }));
      }
    }
  }, [selectedAddressId, savedAddresses, user?.name]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (name === 'address' || name === 'city' || name === 'pincode' || name === 'phone') {
      setSelectedAddressId('custom');
    }
  };

  const handleSelectAddressCard = (addr: SavedAddress) => {
    setSelectedAddressId(addr.id);
    const nameParts = (addr.name || user?.name || '').split(' ');
    setFormData(prev => ({
      ...prev,
      firstName: nameParts[0] || prev.firstName,
      lastName: nameParts.slice(1).join(' ') || prev.lastName,
      phone: addr.phone || prev.phone,
      address: addr.street || prev.address,
      city: addr.city || prev.city,
      state: addr.state || prev.state,
      pincode: addr.pincode || prev.pincode,
      addressLabel: addr.label || 'Home'
    }));
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user) {
      router.replace('/login?returnTo=%2Fcheckout');
      return;
    }

    const outOfStockItems = items.filter(item => !isCartItemInStock(item));
    if (outOfStockItems.length > 0) {
      alert(`Cannot place order: Some items in your bag are out of stock (${outOfStockItems.map(i => i.product.title).join(', ')}).\nPlease remove them to proceed.`);
      return;
    }
    const newOrderId = `GM-${Math.floor(100000 + Math.random() * 900000)}`;

    const fullRecipientName = `${formData.firstName} ${formData.lastName}`.trim() || user?.name || 'Valued Customer';
    const formattedFullAddress = `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`;

    // Optionally save new custom address to user profile if checked
    if (formData.saveAddress && user && selectedAddressId === 'custom') {
      addAddress({
        label: formData.addressLabel || 'Home',
        name: fullRecipientName,
        phone: formData.phone,
        street: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        isDefault: false
      });
    }

    const orderData: OrderPayload = {
      orderId: newOrderId,
      userId: user?.id,
      customerId: user?.id,
      recipientName: fullRecipientName,
      phone: formData.phone,
      email: formData.email,
      address: formattedFullAddress,
      street: formData.address,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      label: formData.addressLabel,
      total: total,
      subtotal: subtotal,
      paymentMethod: paymentMethod === 'cod' ? 'Cash On Delivery' : 'Prepaid Online (Razorpay/UPI)',
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      items: items.map(i => ({
        product_id: i.product.id,
        id: i.product.id,
        title: i.product.title,
        image: i.product.images?.[0] || '',
        quantity: i.quantity,
        size: i.selectedSize,
        price: i.product.price
      }))
    };

    // Clean up any legacy localStorage orders so orders are strictly from DB
    try {
      localStorage.removeItem('gulmohar_orders');
    } catch {
      // ignore
    }

    // Save address to backend DB
    saveAddressToBackend({
      userId: user?.id || 1,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode
    }).catch(console.error);

    // Save directly to Laravel DB
    await placeOrderToBackend(orderData);

    setPlacedOrderId(newOrderId);
    setPlacedOrderSummary(orderData);
    setIsOrderPlaced(true);

    setEmailSent(null);
    fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: formData.email || 'customer@gulmoharfootwear.com',
        type: 'order',
        orderDetails: orderData
      })
    }).then((response) => {
      setEmailSent(response.ok);
    }).catch((error: unknown) => {
      console.error('Order email request failed:', error);
      setEmailSent(false);
    });

    clearCart();
  };

  if (!isAuthReady || !isAuthenticated || !user) {
    return (
      <div className="max-w-3xl mx-auto py-24 px-4 text-center" role="status">
        <Lock className="w-8 h-8 text-[#d4af37] mx-auto mb-3" />
        <p className="text-sm font-semibold text-gray-800">Sign in is required to continue to checkout.</p>
        <p className="text-xs text-gray-500 mt-1">Redirecting you to sign in...</p>
      </div>
    );
  }

  if (isOrderPlaced && placedOrderSummary) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4">
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-xl text-center space-y-6">
          
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg border border-emerald-100">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#d4af37]">
              Order Confirmed & Dispatched Soon
            </span>
            <h1 className="text-3xl font-extrabold text-gray-900 font-serif mt-1">
              Thank You for Your Order!
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Your order has been recorded. Order Reference: <strong className="text-gray-900 font-mono text-sm">{placedOrderId}</strong>
            </p>
          </div>

          {/* Email Confirmation Alert */}
          <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-800 flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <span className={`font-bold block ${emailSent === false ? 'text-amber-900' : 'text-emerald-900'}`}>
                {emailSent === false ? 'Email delivery is unavailable' : emailSent ? 'Invoice & Shipment Notice Sent!' : 'Sending order confirmation...'}
              </span>
              <p className="text-[11px] text-emerald-700">
                {emailSent === false
                  ? 'Your order is recorded, but the confirmation email could not be sent. Please contact support if needed.'
                  : emailSent
                    ? <>Official invoice and shipment details were sent to <strong>{placedOrderSummary.email}</strong>.</>
                    : 'Your order confirmation is being sent.'}
              </p>
            </div>
          </div>

          {/* Order Side Address Card */}
          <div className="bg-gray-50/80 border border-gray-200 rounded-2xl p-6 text-left space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#e63946]" />
                <h3 className="font-bold text-sm text-gray-900 font-serif">Delivery Address Summary</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#d4af37]/20 text-[#8a6d1c] uppercase border border-[#d4af37]/40">
                {placedOrderSummary.label || 'Shipping Address'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-700">
              <div>
                <span className="text-gray-400 block text-[11px]">Recipient Name</span>
                <strong className="text-gray-900 text-sm block mt-0.5">{placedOrderSummary.recipientName}</strong>
                <span className="text-gray-500 font-mono text-[11px]">Phone: {placedOrderSummary.phone}</span>
              </div>

              <div>
                <span className="text-gray-400 block text-[11px]">Full Shipping Address</span>
                <p className="text-gray-900 font-medium mt-0.5 leading-relaxed">
                  {placedOrderSummary.address}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-200 flex flex-wrap justify-between items-center text-xs text-gray-600 gap-2">
              <div>
                <span className="text-gray-400">Payment Status: </span>
                <strong className="text-emerald-600 font-bold uppercase">{placedOrderSummary.paymentMethod}</strong>
              </div>
              <div>
                <span className="text-gray-400">Total Amount: </span>
                <strong className="text-lg text-[#e63946] font-extrabold">{formatPrice(placedOrderSummary.total)}</strong>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => generateInvoicePDF(placedOrderSummary)}
              className="px-6 py-3 bg-[#e63946] hover:bg-[#c1121f] text-white font-bold rounded-xl text-xs shadow-md shadow-red-600/20 transition-all flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Download Tax Invoice (PDF)</span>
            </button>
            <Link
              href="/account"
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xs transition-colors"
            >
              View My Account & Orders
            </Link>
            <Link
              href="/"
              className="px-6 py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl text-xs transition-all"
            >
              Back to Home
            </Link>
          </div>

        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center">
        <h2 className="text-xl font-bold text-gray-900 font-serif">Your shopping bag is empty</h2>
        <p className="text-xs text-gray-500 mt-1">Please add footwear items to your bag before checkout.</p>
        <Link href="/shop" className="mt-5 inline-block px-8 py-3 bg-[#e63946] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md">
          Explore Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">

      <div className="border-b border-gray-100 pb-4 mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 font-serif">Checkout & Delivery Details</h1>
        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
          <Lock className="w-3.5 h-3.5 text-emerald-600" /> 256-Bit SSL Encrypted & Express Shipping
        </p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Shipping & Billing Details */}
        <div className="lg:col-span-2 space-y-6">

          {/* 1. Address Selection & Input Section */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-lg font-bold text-gray-900 font-serif flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#e63946]" />
                <span>1. Select / Enter Delivery Address</span>
              </h2>
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <Truck className="w-4 h-4" /> Free Express Delivery
              </span>
            </div>

            {/* Saved Addresses Picker (if user logged in & has saved addresses) */}
            {savedAddresses.length > 0 && (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-gray-700">Choose from Saved Addresses:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedAddresses.map(addr => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => handleSelectAddressCard(addr)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all relative ${
                          isSelected
                            ? 'border-[#e63946] bg-red-50/30 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700 flex items-center gap-1">
                            {addr.label === 'Work' ? <Briefcase className="w-3 h-3" /> : <Home className="w-3 h-3" />}
                            {addr.label}
                          </span>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-[#e63946] text-white flex items-center justify-center">
                              <Check className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                        <p className="font-bold text-xs text-gray-900">{addr.name || user?.name}</p>
                        <p className="text-[11px] text-gray-600 mt-1 line-clamp-2">{addr.street}, {addr.city} - {addr.pincode}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">Mobile: {addr.phone}</p>
                      </div>
                    );
                  })}

                  <div
                    onClick={() => setSelectedAddressId('custom')}
                    className={`p-4 rounded-2xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center text-center transition-all ${
                      selectedAddressId === 'custom'
                        ? 'border-[#e63946] bg-red-50/20'
                        : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
                    }`}
                  >
                    <PlusCircle className="w-6 h-6 text-gray-400 mb-1" />
                    <span className="font-bold text-xs text-gray-800">Enter New Address</span>
                    <span className="text-[10px] text-gray-400">Fill standard address form below</span>
                  </div>
                </div>
              </div>
            )}

            {/* Address Form Inputs */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                {selectedAddressId === 'custom' ? 'Recipient & Shipping Details' : 'Selected Shipping Details'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Phone Number *</label>
                  <input
                    type="tel"
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+91 98765 43210"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Street Address / House No / Building *</label>
                <input
                  type="text"
                  required
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="e.g. Flat 402, Royal Residency, Hill Road"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Mumbai"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="Maharashtra"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">PIN / Postal Code *</label>
                  <input
                    type="text"
                    required
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="400050"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs">
                  <label className="font-bold text-gray-700">Address Label:</label>
                  <select
                    name="addressLabel"
                    value={formData.addressLabel}
                    onChange={handleInputChange}
                    className="p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none"
                  >
                    <option value="Home">Home</option>
                    <option value="Work">Work</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {user && (
                  <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      name="saveAddress"
                      checked={formData.saveAddress}
                      onChange={handleInputChange}
                      className="accent-[#e63946] rounded"
                    />
                    <span>Save address to profile for future orders</span>
                  </label>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Delivery Notes (Optional)</label>
                <textarea
                  rows={2}
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Special instructions for courier delivery..."
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#d4af37]"
                />
              </div>
            </div>

          </div>

          {/* 2. Payment Method Selector */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900 font-serif border-b border-gray-100 pb-3 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#e63946]" />
              <span>2. Select Payment Method</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer flex items-start gap-3 transition-all ${
                  paymentMethod === 'cod' ? 'border-[#e63946] bg-red-50/40 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="mt-1 accent-[#e63946]"
                />
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Cash on Delivery (COD)</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Pay in cash or UPI upon package delivery.</p>
                </div>
              </label>

              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer flex items-start gap-3 transition-all ${
                  paymentMethod === 'online' ? 'border-[#e63946] bg-red-50/40 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'online'}
                  onChange={() => setPaymentMethod('online')}
                  className="mt-1 accent-[#e63946]"
                />
                <div>
                  <h4 className="font-bold text-sm text-gray-900">UPI / Cards / NetBanking</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Instant online payment via Razorpay payment gateway.</p>
                </div>
              </label>
            </div>
          </div>

        </div>

        {/* Order Summary Column */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-gray-900 font-serif border-b border-gray-100 pb-3">
              Order Summary ({items.length} Items)
            </h3>

            {/* Items summary list */}
            {hasOutOfStockItems && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-red-800">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Out of Stock items detected</span>
                </div>
                <p>You cannot checkout with out of stock items.</p>
                <button
                  type="button"
                  onClick={removeOutOfStockItems}
                  className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-bold transition-colors"
                >
                  Remove Out of Stock Items
                </button>
              </div>
            )}

            <div className="max-h-64 overflow-y-auto space-y-3 divide-y divide-gray-50">
              {items.map((item, idx) => {
                const inStock = isCartItemInStock(item);
                return (
                <div key={idx} className="pt-2 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-12 h-12 bg-gray-50 rounded-lg overflow-hidden shrink-0 border">
                      <Image src={item.product.images[0]} alt={item.product.title} fill className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 truncate">{item.product.title}</p>
                      <p className="text-gray-400">Qty: {item.quantity} {item.selectedSize ? `| Size: ${item.selectedSize}` : ''}</p>
                      {!inStock && (
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">
                            Out of Stock
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-[10px] text-red-600 underline font-semibold hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="font-bold text-gray-900 shrink-0">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
                );
              })}
            </div>

            {/* Calculations */}
            <div className="border-t border-gray-100 pt-3 space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-gray-900">{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Voucher Discount</span>
                  <span>- {formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className="font-bold text-emerald-600">FREE</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between text-sm font-extrabold text-gray-900">
                <span>Total Due</span>
                <span className="text-xl text-[#e63946]">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={hasOutOfStockItems}
              className={`w-full py-4 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all mt-4 ${
                hasOutOfStockItems
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                  : 'bg-[#e63946] hover:bg-[#c1121f] text-white shadow-lg shadow-red-600/30'
              }`}
            >
              {hasOutOfStockItems ? (
                <span>Cannot Place Order (Items Out of Stock)</span>
              ) : (
                <>
                  <span>Place Order Now</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-2 text-center text-[11px] text-gray-400">
              By placing this order you agree to Gulmohar Terms of Service & Shipping Policy.
            </div>

          </div>
        </div>

      </form>

    </div>
  );
}
