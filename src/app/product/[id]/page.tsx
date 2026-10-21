'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Star, 
  ShoppingBag, 
  Heart, 
  Truck, 
  ShieldAlert, 
  Check, 
  ArrowRight,
  AlertCircle,
  Share2
} from 'lucide-react';
import { ProductItem, ProductSizeItem, DUMMY_REVIEWS } from '@/data/dummyData';
import { getProductById, getProducts, getProductShareUrl, getProductReviews, submitProductReview } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice, calculateDiscount, stripHtml } from '@/lib/utils';
import { ProductCard } from '@/components/ProductCard';
import { QuickViewModal } from '@/components/QuickViewModal';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();

  const [product, setProduct] = useState<ProductItem | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ProductItem[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<ProductItem | null>(null);
  const [activeImage, setActiveImage] = useState<string>('');
  const [selectedSizeObj, setSelectedSizeObj] = useState<ProductSizeItem | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'reviews' | 'shipping'>('desc');
  const [isAdded, setIsAdded] = useState<boolean>(false);
  const [reviews, setReviews] = useState(DUMMY_REVIEWS);
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newRating, setNewRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [shareFeedback, setShareFeedback] = useState('');

  useEffect(() => {
    if (user?.name) {
      setNewReviewName(user.name);
    }
  }, [user]);

  useEffect(() => {
    let isMounted = true;
    async function loadProductData() {
      // Fetch product detail immediately
      getProductById(id).then(async p => {
        if (isMounted && p) {
          setProduct(p);
          setActiveImage(p.images[0] || '/img/products/blackheels.jpg');
          const firstInStock = p.sizes?.find(s => s.in_stock && s.qty > 0) || p.sizes?.[0] || null;
          setSelectedSizeObj(firstInStock);

          // Fetch real reviews from DB
          const dbReviews = await getProductReviews(p.id);
          if (isMounted && dbReviews && dbReviews.length > 0) {
            const mapped = dbReviews.map(r => ({
              id: r.id,
              name: r.reviewer_name || r.name || 'Verified Customer',
              rating: Number(r.rating || 5),
              date: r.created_at_formatted || 'Recently',
              comment: r.comment
            }));
            setReviews([...mapped, ...DUMMY_REVIEWS]);
          }
        }
      });

      // Fetch related products in background
      getProducts().then(all => {
        if (isMounted && all) {
          setRelatedProducts(all.filter(item => item.id !== Number(id)).slice(0, 4));
        }
      });
    }
    loadProductData();
    return () => { isMounted = false; };
  }, [id]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 animate-pulse space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="w-full aspect-square bg-gray-200 rounded-2xl"></div>
          <div className="space-y-4 pt-4">
            <div className="w-32 h-4 bg-gray-200 rounded"></div>
            <div className="w-3/4 h-8 bg-gray-200 rounded"></div>
            <div className="w-40 h-6 bg-gray-200 rounded"></div>
            <div className="w-full h-24 bg-gray-200 rounded"></div>
            <div className="w-full h-12 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

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
  const maxStock = (hasSizes ? activeSize?.qty : 10) || 1;

  const handleAddToCart = () => {
    if (!isSelectedSizeAvailable) {
      alert('Selected size or product is currently out of stock.');
      return;
    }
    addToCart(product, quantity, product.colors?.[0], activeSize?.size);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (!isSelectedSizeAvailable) {
      alert('Selected size or product is currently out of stock.');
      return;
    }
    addToCart(product, quantity, product.colors?.[0], activeSize?.size);
    router.push('/checkout');
  };

  const handleShareProduct = async () => {
    const shareUrl = user?.referralCode
      ? getProductShareUrl(product.id, user.referralCode)
      : `${window.location.origin}/product/${encodeURIComponent(product.slug)}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: product.title, text: stripHtml(product.description), url: shareUrl });
        setShareFeedback('Product link shared.');
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setShareFeedback('Product link copied.');
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      setShareFeedback('Unable to share the product link from this browser.');
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : (product.rating ? String(product.rating) : '5.0');

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewComment.trim()) return;

    setIsSubmittingReview(true);
    const res = await submitProductReview({
      productId: product.id,
      userId: user?.id || 1,
      reviewerName: newReviewName.trim(),
      rating: newRating,
      comment: newReviewComment.trim()
    });
    setIsSubmittingReview(false);

    if (res.success) {
      setReviews([
        {
          id: Date.now(),
          name: newReviewName.trim(),
          rating: newRating,
          date: 'Just now',
          comment: newReviewComment.trim()
        },
        ...reviews
      ]);
      setNewReviewComment('');
      alert('Thank you! Your verified customer review has been saved in the database.');
    } else {
      alert(res.message || 'Failed to submit review.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      
      {/* 1. Breadcrumbs */}
      <nav className="text-xs text-gray-400 mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-gray-900">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-gray-900">Footwear Collection</Link>
        <span>/</span>
        <Link href={`/shop?category=${product.category_name.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-gray-900">
          {product.category_name}
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-bold truncate max-w-xs">{product.title}</span>
      </nav>

      {/* 2. Main Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Left: Gallery */}
        <div className="space-y-4">
          <div className="relative w-full aspect-square bg-gray-50 rounded-3xl overflow-hidden shadow-md border border-gray-100">
            <Image
              src={activeImage || product.images[0]}
              alt={product.title}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
            {hasSpecialPrice && discount > 0 && (
              <span className="absolute top-4 left-4 px-3 py-1 bg-[#e63946] text-white text-xs font-extrabold rounded-full shadow-md">
                SAVE {discount}%
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                    activeImage === img ? 'border-[#e63946] scale-105 shadow-md' : 'border-gray-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt="Preview" fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info & Actions */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            
            {/* Category & Stock Indicator */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-[#e63946]">
                {product.category_name}
              </span>
              {isSelectedSizeAvailable ? (
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-full">
                  <Check className="w-3.5 h-3.5" /> In Stock & Ready to Dispatch
                </span>
              ) : (
                <span className="text-xs font-semibold text-red-600 flex items-center gap-1 bg-red-50 px-2.5 py-1 rounded-full">
                  <AlertCircle className="w-3.5 h-3.5" /> Selected Size Out of Stock
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 font-serif">
              {product.title}
            </h1>

            {/* Star Rating */}
            <div className="flex items-center gap-3">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < Math.round(Number(averageRating)) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`} 
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-gray-700">{averageRating} / 5.0</span>
              <span className="text-xs text-gray-400">({reviews.length} Verified Customer Reviews)</span>
            </div>

            {/* Price Row */}
            <div className="flex items-baseline gap-4 pt-2 border-t border-gray-100">
              <span className="text-3xl font-black text-[#e63946]">
                {formatPrice(product.price)}
              </span>
              {hasSpecialPrice && discount > 0 && product.original_price > product.price && (
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(product.original_price)}
                </span>
              )}
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                Inclusive of all taxes
              </span>
            </div>

            {/* Short Description */}
            <p className="text-sm text-gray-600 leading-relaxed">
              {stripHtml(product.description)}
            </p>

            {/* Size Selector with Backend Stock Quantities */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-900">Select Shoe Size:</span>
                  {activeSize && (
                    <span className={`text-xs font-bold ${
                      activeSize.qty > 0 && activeSize.qty <= 4
                        ? 'text-amber-600 animate-pulse'
                        : activeSize.qty > 4
                        ? 'text-emerald-600'
                        : 'text-red-500'
                    }`}>
                      {activeSize.qty > 0 ? `Inventory: ${activeSize.qty} pairs remaining` : 'Size currently Out of Stock'}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                  {product.sizes.map((sItem) => {
                    const isAvail = sItem.in_stock && sItem.qty > 0;
                    const isSelected = activeSize?.size === sItem.size;

                    return (
                      <button
                        key={sItem.size}
                        onClick={() => setSelectedSizeObj(sItem)}
                        className={`p-3 rounded-2xl text-xs font-bold border transition-all flex flex-col items-center justify-center ${
                          isSelected
                            ? 'border-[#e63946] bg-[#e63946] text-white shadow-lg scale-102'
                            : isAvail
                            ? 'border-gray-200 text-gray-800 hover:border-gray-400 bg-white hover:bg-gray-50'
                            : 'border-dashed border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed'
                        }`}
                      >
                        <span className="text-sm">{sItem.size}</span>
                        <span className={`text-[10px] mt-0.5 ${
                          isSelected ? 'text-white/90 font-medium' : isAvail ? 'text-gray-500' : 'text-red-400 font-semibold'
                        }`}>
                          {isAvail ? `${sItem.qty} in stock` : 'Out of Stock'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Stepper */}
            <div className="flex items-center gap-4 pt-2">
              <span className="text-xs font-bold text-gray-800">Quantity:</span>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-3.5 py-2 text-gray-700 hover:bg-gray-200 font-bold"
                >
                  -
                </button>
                <span className="px-5 py-2 text-xs font-bold text-gray-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(maxStock, q + 1))}
                  disabled={quantity >= maxStock}
                  className="px-3.5 py-2 text-gray-700 hover:bg-gray-200 font-bold disabled:opacity-30"
                >
                  +
                </button>
              </div>
              {activeSize && activeSize.qty > 0 && (
                <span className="text-[11px] text-gray-400">Max {maxStock} per order</span>
              )}
            </div>

          </div>

          {/* Action Buttons */}
          <div className="pt-6 space-y-3 border-t border-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                disabled={!isSelectedSizeAvailable || isAdded}
                className={`py-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all ${
                  isAdded 
                    ? 'bg-emerald-600 text-white' 
                    : isSelectedSizeAvailable
                    ? 'bg-[#0f1117] hover:bg-black text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4" /> Added To Bag
                  </>
                ) : isSelectedSizeAvailable ? (
                  <>
                    <ShoppingBag className="w-4 h-4" /> Add {activeSize?.size} to Cart
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4" /> Size Out of Stock
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={!isSelectedSizeAvailable}
                className={`py-4 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 ${
                  isSelectedSizeAvailable 
                    ? 'bg-[#e63946] hover:bg-[#c1121f] text-white shadow-red-600/30'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <span>Buy Now with 1-Click</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => toggleWishlist(product)}
                className="inline-flex items-center gap-2 text-xs font-bold text-gray-700 hover:text-[#e63946]"
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#e63946] text-[#e63946]' : ''}`} />
                <span>{isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
              </button>

              <button
                type="button"
                onClick={handleShareProduct}
                className="inline-flex items-center gap-2 text-xs font-bold text-gray-700 hover:text-[#e63946]"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Product</span>
              </button>

              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5 text-[#d4af37]" /> Free Delivery</span>
                <span className="flex items-center gap-1"><ShieldAlert className="w-3.5 h-3.5 text-amber-500" /> Non-Returnable</span>
              </div>
            </div>
            {shareFeedback && <p role="status" className="text-xs text-gray-500">{shareFeedback}</p>}

          </div>

        </div>

      </div>

      {/* 3. Specifications, Reviews & Shipping Tabs */}
      <div className="mt-16 border-t border-gray-100 pt-10">
        
        {/* Tab Headers */}
        <div className="flex border-b border-gray-200 gap-8 pb-3">
          <button
            onClick={() => setActiveTab('desc')}
            className={`text-sm font-bold pb-2 transition-colors relative ${
              activeTab === 'desc' ? 'text-[#e63946]' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Footwear Specifications
            {activeTab === 'desc' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e63946]"></span>}
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`text-sm font-bold pb-2 transition-colors relative ${
              activeTab === 'reviews' ? 'text-[#e63946]' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Customer Reviews ({reviews.length})
            {activeTab === 'reviews' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e63946]"></span>}
          </button>

          <button
            onClick={() => setActiveTab('shipping')}
            className={`text-sm font-bold pb-2 transition-colors relative ${
              activeTab === 'shipping' ? 'text-[#e63946]' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Size Guide & Return Policy
            {activeTab === 'shipping' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e63946]"></span>}
          </button>
        </div>

        {/* Tab Contents */}
        <div className="py-8">
          {activeTab === 'desc' && (
            <div className="space-y-4 max-w-3xl text-sm text-gray-700 leading-relaxed">
              <h3 className="font-bold text-gray-900 text-base">Footwear Specifications & Details</h3>
              {product.description ? (
                <div
                  className="space-y-2 text-sm text-gray-700 leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2.5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2.5 [&_ol]:space-y-1 [&_li]:text-gray-700 [&_strong]:font-bold [&_strong]:text-gray-900 [&_p]:mb-2.5 [&_p:last-child]:mb-0 [&_h1]:text-xl [&_h2]:text-lg [&_h3]:text-base [&_h1]:font-bold [&_h2]:font-bold [&_h3]:font-bold"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              ) : (
                <p className="text-gray-400 italic">No description provided for this product.</p>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-8 max-w-3xl">
              
              {/* Add Review Form */}
              <form onSubmit={handleAddReview} className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4">
                <h4 className="text-sm font-bold text-gray-900">Write a Verified Footwear Review</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    required
                    value={newReviewName}
                    onChange={(e) => setNewReviewName(e.target.value)}
                    placeholder="Your Full Name"
                    className="p-3 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-[#e63946]"
                  />
                  <div className="flex items-center gap-1.5 p-2 bg-white border border-gray-200 rounded-xl">
                    <span className="text-xs font-bold text-gray-700 mr-1">Rating:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setNewRating(star)}
                        className="p-0.5 transition-transform hover:scale-120 focus:outline-hidden"
                      >
                        <Star
                          className={`w-4 h-4 transition-colors ${
                            (hoverRating || newRating) >= star
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-gray-100 text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-gray-700 ml-1">
                      {newRating} / 5
                    </span>
                  </div>
                </div>
                <textarea
                  required
                  rows={3}
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  placeholder="How was the comfort, arch support, and leather quality?..."
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-[#e63946]"
                />
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-6 py-2.5 bg-[#e63946] hover:bg-[#c1121f] text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {isSubmittingReview ? 'Submitting Review...' : 'Submit Review'}
                </button>
              </form>

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="p-4 bg-white border border-gray-100 rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs text-gray-900">{r.name}</span>
                      <span className="text-[10px] text-gray-400">{r.date}</span>
                    </div>
                    <div className="flex text-amber-400">
                      {[...Array(r.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs text-gray-600">{r.comment}</p>
                  </div>
                ))}
              </div>

            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-3 max-w-3xl text-xs text-gray-600 leading-relaxed">
              <h4 className="font-bold text-gray-900 text-sm">Footwear Sizing & No Return Policy</h4>
              <p>• We use standard <strong>UK / Indian Footwear Sizing</strong>. If you are between sizes, we recommend sizing up for comfortable toe clearance.</p>
              <p>• <strong>No Return Policy:</strong> All products are final sale. Due to hygiene and handcrafted quality assurance, we do not accept returns or exchanges once delivered.</p>
            </div>
          )}
        </div>

      </div>

      {/* 4. Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16 border-t border-gray-100 pt-12">
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-[#e63946]">Recommended Footwear</span>
            <h3 className="text-2xl font-extrabold text-gray-900 font-serif mt-1">You May Also Like</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onQuickView={(prod) => setQuickViewProduct(prod)}
              />
            ))}
          </div>
        </div>
      )}

      {/* QUICK VIEW POPUP MODAL */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

    </div>
  );
}
