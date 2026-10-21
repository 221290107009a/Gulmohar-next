'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  MapPin, 
  CreditCard, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Clock,
  RotateCcw,
  Star,
  X,
  MessageSquareHeart
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/utils';
import { 
  getOrderDetailInBackend, 
  cancelOrderInBackend, 
  generateInvoicePDF, 
  submitProductReview, 
  OrderPayload 
} from '@/lib/api';

interface ParsedItem {
  id?: number | string;
  product_id?: number | string;
  title: string;
  image?: string;
  size?: string;
  quantity: number;
  price: number;
}

const BACKEND_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

function resolveItemImage(item: ParsedItem, order: any): string {
  if (item.image && typeof item.image === 'string' && item.image.trim()) {
    return item.image.startsWith('http') || item.image.startsWith('/')
      ? item.image
      : `${BACKEND_BASE}/storage/${item.image}`;
  }

  if (Array.isArray(order?.products)) {
    const matched = order.products.find(
      (p: any) => String(p.product_id) === String(item.product_id) || String(p.product?.id) === String(item.product_id) || p.product?.name === item.title
    );
    if (matched?.product) {
      const p = matched.product;
      const baseImg = p.base_image?.path || p.files?.[0]?.path;
      if (baseImg) {
        return baseImg.startsWith('http') || baseImg.startsWith('/')
          ? baseImg
          : `${BACKEND_BASE}/storage/${baseImg}`;
      }
    }
  }

  const titleLower = (item.title || '').toLowerCase();
  if (titleLower.includes('chappal') || titleLower.includes('sandal') || titleLower.includes('kolhapuri')) {
    return '/img/products/kolhapuri.jpg';
  }
  if (titleLower.includes('mojari') || titleLower.includes('loafer') || titleLower.includes('leather')) {
    return '/img/products/tanmojari.jpg';
  }
  if (titleLower.includes('sneaker') || titleLower.includes('shoe')) {
    return '/img/products/whitesneaker.jpg';
  }

  return '/img/products/blackheels.jpg';
}

function OrderItemThumbnail({
  src,
  alt,
  className = "w-14 h-14 sm:w-16 sm:h-16"
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  return (
    <div className={`relative ${className} rounded-2xl overflow-hidden bg-gray-50 border border-gray-200 shrink-0 shadow-2xs`}>
      <img
        src={imgSrc}
        alt={alt}
        onError={() => {
          if (imgSrc !== '/img/products/kolhapuri.jpg') {
            setImgSrc('/img/products/kolhapuri.jpg');
          }
        }}
        className="w-full h-full object-cover object-center"
      />
    </div>
  );
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderIdParam = params.id as string;
  const { user, isAuthReady, isAuthenticated } = useAuth();

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCanceling, setIsCanceling] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Review & Rating Modal State
  const [reviewItem, setReviewItem] = useState<ParsedItem | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [reviewerName, setReviewerName] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState<string | null>(null);
  const [reviewErrorMsg, setReviewErrorMsg] = useState<string | null>(null);
  const [reviewedProductIds, setReviewedProductIds] = useState<Record<string | number, number>>({});

  const fetchOrder = async () => {
    if (!orderIdParam) return;
    setLoading(true);
    try {
      const data = await getOrderDetailInBackend(orderIdParam);
      setOrder(data);
    } catch (err) {
      console.error('Failed to load order detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthReady) {
      fetchOrder();
    }
  }, [orderIdParam, isAuthReady]);

  useEffect(() => {
    if (user?.name) {
      setReviewerName(user.name);
    }
  }, [user]);

  if (!isAuthReady || loading) {
    return (
      <div className="max-w-4xl mx-auto py-24 px-4 text-center">
        <div className="w-10 h-10 border-3 border-[#e63946] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xs text-gray-500 font-medium">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center space-y-4">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 font-serif">Order Not Found</h1>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          We could not locate this order record in the database. It may have been deleted or the link is invalid.
        </p>
        <Link
          href="/account"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#e63946] hover:bg-[#c1121f] text-white text-xs font-bold rounded-xl transition-colors shadow-md"
        >
          <ArrowLeft className="w-4 h-4" /> Return to My Account
        </Link>
      </div>
    );
  }

  // Parse items and original DB order ID
  const orderCode = `Order #${order.id}`;
  let parsedItems: ParsedItem[] = [];

  if (order.note) {
    try {
      const noteObj = JSON.parse(order.note);
      if (noteObj && typeof noteObj === 'object') {
        if (Array.isArray(noteObj.items) && noteObj.items.length > 0) {
          parsedItems = noteObj.items.map((i: any) => ({
            id: i.id || i.product_id,
            product_id: i.product_id || i.id,
            title: i.title || 'Gulmohar Footwear',
            image: i.image || '',
            size: i.size || i.selectedSize || '',
            quantity: Number(i.quantity || i.qty || 1),
            price: Number(i.price || 0)
          }));
        }
      }
    } catch {
      // ignore
    }
  }

  if (parsedItems.length === 0 && Array.isArray(order.products)) {
    parsedItems = order.products.map((p: any) => ({
      id: p.product_id,
      product_id: p.product_id,
      title: p.product?.name || p.name || 'Footwear',
      image: p.product?.base_image?.path || p.product?.files?.[0]?.path || '',
      size: '',
      quantity: Number(p.qty || 1),
      price: parseFloat(p.unit_price?.amount || p.unit_price || 0)
    }));
  }

  const rawStatus = (order.status || 'pending').toLowerCase();
  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    completed: { label: 'Delivered', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle2 },
    processing: { label: 'Processing Order', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Clock },
    pending: { label: 'Order Placed (Pending Dispatch)', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: Truck },
    pending_payment: { label: 'Pending Payment', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock },
    on_hold: { label: 'On Hold', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: Clock },
    canceled: { label: 'Canceled', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
    refunded: { label: 'Refunded', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: RotateCcw }
  };
  const fallbackLabel = rawStatus.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
  const currentStatus = statusConfig[rawStatus] || { label: fallbackLabel, color: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock };
  const StatusIcon = currentStatus.icon;

  const totalAmount = parseFloat(order.total?.amount || order.total || 0);
  const subTotalAmount = parseFloat(order.sub_total?.amount || order.sub_total || totalAmount);
  const dateFormatted = order.created_at
    ? new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'Recent';

  const recipientName = `${order.billing_first_name || ''} ${order.billing_last_name || ''}`.trim() || user?.name || 'Customer';
  const customerPhone = order.customer_phone || user?.phone || '';
  const customerEmail = order.customer_email || user?.email || '';
  const streetAddress = order.billing_address_1 || '';
  const city = order.billing_city || '';
  const state = order.billing_state || '';
  const pincode = order.billing_zip || '';

  const isCancelable = rawStatus !== 'processing' && rawStatus !== 'completed' && rawStatus !== 'canceled' && rawStatus !== 'refunded';

  const handleOpenCancelModal = () => {
    setCancelError(null);
    setShowCancelModal(true);
  };

  const confirmCancelOrder = async () => {
    setIsCanceling(true);
    setCancelError(null);
    try {
      const success = await cancelOrderInBackend(order.id);
      if (success) {
        setShowCancelModal(false);
        setActionMessage(`Order ${orderCode} was canceled successfully and stock has been restored.`);
        await fetchOrder();
      } else {
        setCancelError('Failed to cancel order. Please verify backend connection and try again.');
      }
    } catch (err) {
      console.error('Cancel order error:', err);
      setCancelError('An unexpected error occurred while canceling the order.');
    } finally {
      setIsCanceling(false);
    }
  };

  const handleDownloadInvoice = () => {
    const invoicePayload: OrderPayload = {
      orderId: orderCode,
      recipientName: recipientName,
      phone: customerPhone,
      email: customerEmail,
      address: `${streetAddress}, ${city}, ${state} - ${pincode}`,
      street: streetAddress,
      city: city,
      state: state,
      pincode: pincode,
      label: 'Delivery Address',
      total: totalAmount,
      subtotal: subTotalAmount,
      paymentMethod: order.payment_method === 'cod' ? 'Cash On Delivery' : 'Prepaid Online',
      date: dateFormatted,
      items: parsedItems.map(i => ({
        product_id: Number(i.product_id),
        id: Number(i.id),
        title: i.title,
        quantity: i.quantity,
        size: i.size,
        price: i.price
      }))
    };
    generateInvoicePDF(invoicePayload);
  };

  const openReviewModal = (item: ParsedItem) => {
    setReviewItem(item);
    setRating(5);
    setComment('');
    setReviewSuccessMsg(null);
    setReviewErrorMsg(null);
    setReviewerName(user?.name || recipientName || 'Customer');
  };

  const closeReviewModal = () => {
    setReviewItem(null);
    setReviewSuccessMsg(null);
    setReviewErrorMsg(null);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewItem) return;

    const prodId = reviewItem.product_id || reviewItem.id;
    if (!prodId) {
      setReviewErrorMsg('Product identification is missing.');
      return;
    }

    if (!comment.trim()) {
      setReviewErrorMsg('Please write a brief comment describing your experience.');
      return;
    }

    setIsSubmittingReview(true);
    setReviewErrorMsg(null);

    const res = await submitProductReview({
      productId: prodId,
      userId: user?.id || order.customer_id || 1,
      reviewerName: reviewerName.trim() || 'Verified Customer',
      rating: rating,
      comment: comment.trim()
    });

    setIsSubmittingReview(false);

    if (res.success) {
      setReviewSuccessMsg(res.message);
      setReviewedProductIds(prev => ({ ...prev, [prodId]: rating }));
      setTimeout(() => {
        closeReviewModal();
      }, 1600);
    } else {
      setReviewErrorMsg(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Back Link */}
        <Link 
          href="/account"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to My Account Orders
        </Link>

        {/* Top Notification Feedback */}
        {actionMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Main Order Card */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#d4af37]">
                Order Details
              </span>
              <h1 className="text-2xl font-extrabold text-gray-900 font-serif mt-0.5">
                {orderCode}
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Placed on {dateFormatted}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${currentStatus.color}`}>
                <StatusIcon className="w-3.5 h-3.5" />
                {currentStatus.label}
              </span>

              <button
                onClick={handleDownloadInvoice}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
              >
                <FileText className="w-3.5 h-3.5" />
                Download Invoice
              </button>
            </div>
          </div>

          {/* Cancel Order Banner / Action */}
          {isCancelable && (
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-amber-900">Want to cancel this order?</h4>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  You can cancel your order prior to dispatch. Size stock will be restored immediately to inventory.
                </p>
              </div>
              <button
                onClick={handleOpenCancelModal}
                disabled={isCanceling}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs disabled:opacity-50 shrink-0"
              >
                {isCanceling ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Canceling & Restoring Stock...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    Cancel Order
                  </>
                )}
              </button>
            </div>
          )}

          {rawStatus === 'processing' && (
            <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 flex items-center gap-3 text-xs text-blue-900">
              <Truck className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <strong className="block font-bold">Order is Under Processing & Packaging</strong>
                <p className="text-[11px] text-blue-700 mt-0.5">
                  Your footwear is currently being prepared and packaged for dispatch. This order can no longer be canceled.
                </p>
              </div>
            </div>
          )}

          {rawStatus === 'canceled' && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 text-xs text-red-800">
              <XCircle className="w-5 h-5 text-red-600 shrink-0" />
              <div>
                <strong className="block font-bold">This Order Has Been Canceled</strong>
                <span>The product sizes and inventory quantities have been restored back to stock.</span>
              </div>
            </div>
          )}

          {/* Items Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900 font-serif flex items-center gap-2">
              <Package className="w-4 h-4 text-[#d4af37]" />
              Items in this Order ({parsedItems.length})
            </h3>

            <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden bg-gray-50/30">
              {parsedItems.map((item, index) => {
                const prodKey = item.product_id || item.id || index;
                const ratedScore = reviewedProductIds[prodKey];
                const itemImg = resolveItemImage(item, order);

                return (
                  <div key={index} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3.5">
                      <OrderItemThumbnail
                        src={itemImg}
                        alt={item.title}
                      />
                      <div className="space-y-1">
                        <h4 className="font-bold text-gray-900 text-sm">{item.title}</h4>
                        <div className="flex flex-wrap items-center gap-2 text-gray-500 text-[11px]">
                          {item.size && (
                            <span className="px-2 py-0.5 bg-gray-100 rounded-md font-bold text-gray-800 border border-gray-200">
                              Size: {item.size}
                            </span>
                          )}
                          <span>Quantity: <strong className="text-gray-800">{item.quantity}</strong></span>
                          <span>• Unit Price: {formatPrice(item.price)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 sm:self-center">
                      <div className="text-right">
                        <span className="font-extrabold text-sm text-gray-900 font-mono block">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>

                      {/* Review & Rating Button */}
                      <button
                        onClick={() => openReviewModal(item)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all shadow-2xs ${
                          ratedScore 
                            ? 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                            : 'bg-white text-gray-800 border-gray-200 hover:border-[#d4af37] hover:bg-amber-50/40'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${ratedScore ? 'fill-amber-500 text-amber-500' : 'fill-[#d4af37] text-[#d4af37]'}`} />
                        {ratedScore ? `Rated ${ratedScore}★ (Update)` : 'Rate & Review'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2-Column: Delivery Address & Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            
            {/* Delivery Address */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2 text-xs">
              <h4 className="font-bold text-gray-900 flex items-center gap-1.5 font-serif">
                <MapPin className="w-4 h-4 text-[#e63946]" />
                Delivery Address
              </h4>
              <div className="text-gray-600 space-y-1 text-[11px]">
                <strong className="text-gray-900 block text-xs">{recipientName}</strong>
                {streetAddress && <p>{streetAddress}</p>}
                {(city || state || pincode) && <p>{city}, {state} - {pincode}</p>}
                {customerPhone && <p className="pt-1">Phone: <strong className="text-gray-800 font-mono">{customerPhone}</strong></p>}
                {customerEmail && <p>Email: {customerEmail}</p>}
              </div>
            </div>

            {/* Payment & Total Breakdown */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2.5 text-xs">
              <h4 className="font-bold text-gray-900 flex items-center gap-1.5 font-serif">
                <CreditCard className="w-4 h-4 text-[#d4af37]" />
                Payment & Billing Summary
              </h4>

              <div className="space-y-1.5 text-gray-600 text-[11px]">
                <div className="flex justify-between">
                  <span>Payment Mode:</span>
                  <strong className="text-gray-900">
                    {order.payment_method === 'cod' ? 'Cash On Delivery' : 'Prepaid Online'}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-mono text-gray-900">{formatPrice(subTotalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span className="font-bold text-emerald-600">Free Express Delivery</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200 text-xs font-bold">
                  <span className="text-gray-900">Total Paid/Due:</span>
                  <span className="text-[#e63946] font-mono font-extrabold text-sm">{formatPrice(totalAmount)}</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Review & Rating Modal */}
      {reviewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-5 relative">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <OrderItemThumbnail
                  src={resolveItemImage(reviewItem, order)}
                  alt={reviewItem.title}
                  className="w-12 h-12"
                />
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37] flex items-center gap-1">
                    <MessageSquareHeart className="w-3.5 h-3.5 text-[#d4af37]" /> Rate Footwear Experience
                  </span>
                  <h3 className="text-sm font-bold text-gray-900 font-serif mt-0.5 truncate">
                    {reviewItem.title}
                  </h3>
                  {reviewItem.size && (
                    <span className="inline-block mt-0.5 px-2 py-0.5 bg-gray-100 rounded text-[10px] font-bold text-gray-600">
                      Purchased Size: {reviewItem.size}
                    </span>
                  )}
                </div>
              </div>
              <button 
                onClick={closeReviewModal}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reviewSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{reviewSuccessMsg}</span>
              </div>
            )}

            {reviewErrorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{reviewErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-4">
              
              {/* Star Rating Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Your Rating
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isActive = (hoverRating || rating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                          className="p-1 transition-transform hover:scale-115 focus:outline-hidden"
                        >
                          <Star
                            className={`w-7 h-7 transition-colors ${
                              isActive 
                                ? 'fill-[#d4af37] text-[#d4af37]' 
                                : 'fill-gray-100 text-gray-300'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-xs font-bold text-gray-700 ml-1">
                    {rating === 5 && '5/5 - Outstanding!'}
                    {rating === 4 && '4/5 - Very Good'}
                    {rating === 3 && '3/5 - Average'}
                    {rating === 2 && '2/5 - Below Expectations'}
                    {rating === 1 && '1/5 - Poor'}
                  </span>
                </div>
              </div>

              {/* Reviewer Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#d4af37]"
                />
              </div>

              {/* Comment / Review Description */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Review & Feedback
                </label>
                <textarea
                  required
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details about footwear comfort, fitting, leather quality, or finish..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#d4af37] resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeReviewModal}
                  className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-5 py-2.5 bg-[#e63946] hover:bg-[#c1121f] text-white text-xs font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmittingReview ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting Review...
                    </>
                  ) : (
                    'Submit Review & Rating'
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Custom Confirmation Modal for Canceling Order */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-gray-100 space-y-5 animate-in zoom-in-95 duration-200 relative"
            role="dialog"
            aria-modal="true"
          >
            {/* Close Button */}
            <button
              onClick={() => {
                if (!isCanceling) setShowCancelModal(false);
              }}
              disabled={isCanceling}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 p-1.5 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-40"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Warning Icon & Header */}
            <div className="flex items-start gap-4 pr-6">
              <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0 shadow-xs">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-red-600">
                  Confirm Cancellation
                </span>
                <h3 className="text-lg font-bold text-gray-900 font-serif leading-snug">
                  Cancel {orderCode}?
                </h3>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-gray-600 leading-relaxed">
              Are you sure you want to cancel this order? This will cancel your order in the database and immediately restore all reserved footwear size stock back to inventory.
            </p>

            {/* Caution Callout */}
            <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl text-[11px] text-amber-800 flex items-start gap-2.5">
              <span className="font-bold text-amber-900 shrink-0">⚠️ Important:</span>
              <span>This cancellation cannot be undone once confirmed. If you change your mind later, you will need to place a new order.</span>
            </div>

            {/* Error Message if any */}
            {cancelError && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2">
                <XCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{cancelError}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                disabled={isCanceling}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                No, Keep Order
              </button>

              <button
                type="button"
                onClick={confirmCancelOrder}
                disabled={isCanceling}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {isCanceling ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Canceling & Restoring...</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    <span>Yes, Cancel Order</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
