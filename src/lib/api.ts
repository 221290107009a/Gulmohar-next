import { DUMMY_SLIDERS, DUMMY_CATEGORIES, DUMMY_PRODUCTS, SlideItem, CategoryItem, ProductItem, ProductSizeItem } from '@/data/dummyData';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '630febe3-d23c-45j6-8a0e-f432518e35as21';

const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'accesskey': API_KEY,
};

function mapBackendSizes(p: any): ProductSizeItem[] {
  if (Array.isArray(p.size_inventory) && p.size_inventory.length > 0) {
    return p.size_inventory.map((item: any) => {
      const qtyNum = typeof item.qty === 'number' ? item.qty : (parseInt(String(item.qty || 0), 10) || 0);
      const isStock = item.in_stock !== false && item.in_stock !== 0 && item.in_stock !== '0' && qtyNum > 0;
      return {
        size: String(item.size || item.name || '').trim(),
        qty: qtyNum,
        in_stock: Boolean(isStock)
      };
    });
  }
  if (Array.isArray(p.variants) && p.variants.length > 0) {
    return p.variants.map((v: any) => {
      const qtyNum = typeof v.qty === 'number' ? v.qty : (parseInt(String(v.qty || 0), 10) || 0);
      const isStock = v.in_stock !== false && v.in_stock !== 0 && v.in_stock !== '0' && qtyNum > 0;
      return {
        size: String(v.name || v.size || '').trim(),
        qty: qtyNum,
        in_stock: Boolean(isStock)
      };
    });
  }
  // Return only real backend sizes (no dummy fallbacks)
  return [];
}

/**
 * Fetch sliders from Gulmohar Backend (/api/store-slider or /api/slider)
 */
export async function getSliders(): Promise<SlideItem[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`${BACKEND_URL}/api/store-slider`, {
      headers: defaultHeaders,
      signal: controller.signal,
      cache: 'no-store'
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      if (json && json.success && Array.isArray(json.data) && json.data.length > 0) {
        return json.data.map((item: any, index: number) => ({
          id: item.id || index + 1,
          image: item.image?.startsWith('http') ? item.image : `${BACKEND_URL}/storage/${item.image || ''}`,
          title: item.title || 'Gulmohar Footwear',
          subtitle: 'Step Into Comfort, Walk in Style',
          content: item.content || 'Premium handcrafted footwear engineered with ergonomic comfort soles.',
          action_url: item.action_url || '/shop',
          button_text: 'Shop Collection',
          badge: index === 0 ? 'NEW ARRIVALS 2026' : 'FEATURED'
        }));
      }
    }
  } catch (_err) {
    // silently fallback
  }

  return DUMMY_SLIDERS;
}

let productsCache: ProductItem[] | null = null;
let categoriesCache: CategoryItem[] | null = null;
const productDetailCache: Record<string, ProductItem> = {};

let productsInFlight: Promise<ProductItem[]> | null = null;
let categoriesInFlight: Promise<CategoryItem[]> | null = null;
const productDetailInFlight: Record<string, Promise<ProductItem | null> | undefined> = {};

/**
 * Fetch categories from Gulmohar Backend
 */
export async function getCategories(forceRefresh = false): Promise<CategoryItem[]> {
  if (categoriesCache && !forceRefresh) {
    return categoriesCache;
  }

  if (categoriesInFlight && !forceRefresh) {
    return categoriesInFlight;
  }

  categoriesInFlight = (async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/online-store-categories`, {
        headers: defaultHeaders,
        next: { revalidate: 60 }
      });

      if (res.ok) {
        const json = await res.json();
        const catList = json.categories || json.data || (Array.isArray(json) ? json : []);
        if (Array.isArray(catList) && catList.length > 0) {
          categoriesCache = catList.map((c: any) => ({
            id: c.id,
            slug: c.slug || c.name?.toLowerCase().replace(/\s+/g, '-'),
            title: c.name || c.title,
            description: c.description || 'Exclusive Footwear Collection',
            image: c.image ? (c.image.startsWith('http') ? c.image : `${BACKEND_URL}/storage/${c.image}`) : '/img/men-large.jpg',
            itemCount: c.products_count || 18
          }));
          return categoriesCache;
        }
      }
    } catch (err) {
      console.error('getCategories fetch error:', err);
    } finally {
      categoriesInFlight = null;
    }

    return categoriesCache || [];
  })();

  return categoriesInFlight;
}

/**
 * Fetch products from Gulmohar Backend with filters
 */
export async function getProducts(options?: {
  category?: string;
  query?: string;
  sort?: string;
  limit?: number;
  forceRefresh?: boolean;
}): Promise<ProductItem[]> {
  const isFiltered = Boolean(options?.category || options?.query || options?.sort || options?.limit);

  if (productsCache && !options?.forceRefresh && !isFiltered) {
    return productsCache;
  }

  if (!isFiltered && !options?.forceRefresh && productsInFlight) {
    return productsInFlight;
  }

  const fetchPromise = (async () => {
    try {
      const queryParams = new URLSearchParams();
      if (options?.category && options.category !== 'all') queryParams.set('category', options.category);
      if (options?.query) queryParams.set('query', options.query);
      if (options?.sort) queryParams.set('sort', options.sort);

      const url = `${BACKEND_URL}/api/online-store-products?${queryParams.toString()}`;
      const res = await fetch(url, {
        headers: defaultHeaders,
        next: { revalidate: 60 }
      });

      if (res.ok) {
        const json = await res.json();
        const prodList = json.data?.products || json.products || (Array.isArray(json.data) ? json.data : []);
        if (Array.isArray(prodList) && prodList.length > 0) {
          const parsed = prodList.map((p: any) => {
            const baseImg = p.base_image?.path || p.files?.[0]?.path || p.additional_images?.[0]?.path;
            const imagePath = baseImg ? (baseImg.startsWith('http') ? baseImg : `${BACKEND_URL}/storage/${baseImg}`) : '/img/products/blackheels.jpg';

            const regPrice = parseFloat(String(typeof p.price === 'object' ? (p.price?.amount || 0) : (p.price || 0))) || 0;
            const specPrice = p.special_price ? parseFloat(String(typeof p.special_price === 'object' ? (p.special_price?.amount || 0) : (p.special_price || 0))) : 0;
            const sellPrice = p.selling_price ? parseFloat(String(typeof p.selling_price === 'object' ? (p.selling_price?.amount || 0) : (p.selling_price || 0))) : 0;

            let finalPrice = regPrice;
            let origPrice = regPrice;

            if (specPrice > 0 && specPrice < regPrice) {
              finalPrice = specPrice;
              origPrice = regPrice;
            } else if (sellPrice > 0 && sellPrice < regPrice) {
              finalPrice = sellPrice;
              origPrice = regPrice;
            }

            const catObj = Array.isArray(p.categories) && p.categories.length > 0 ? p.categories[0] : null;
            const categoryName = catObj ? (catObj.name || catObj.title || 'Footwear') : 'Footwear';

            const item: ProductItem = {
              id: p.id,
              slug: p.slug || `footwear-${p.id}`,
              title: p.name || p.translations?.[0]?.name || 'Gulmohar Handcrafted Footwear',
              category_id: catObj ? catObj.id : 1,
              category_name: categoryName,
              price: finalPrice,
              original_price: origPrice,
              rating: p.reviews_avg_rating ? parseFloat(p.reviews_avg_rating) : 4.9,
              review_count: p.reviews_count || 28,
              images: [imagePath],
              description: p.description || p.translations?.[0]?.description || 'Artisan handcrafted footwear with ergonomic comfort sole.',
              badge: ((specPrice > 0 && specPrice < regPrice) ? 'SALE' : (p.is_featured ? 'HOT' : undefined)) as ProductItem['badge'],
              in_stock: p.in_stock !== false,
              colors: ['#000000', '#D4AF37'],
              sizes: mapBackendSizes(p),
              is_featured: Boolean(p.is_featured)
            };

            productDetailCache[String(p.id)] = item;
            if (p.slug) productDetailCache[String(p.slug)] = item;
            return item;
          });

          if (!isFiltered) {
            productsCache = parsed;
          }
          return parsed;
        }
      }
    } catch (err) {
      console.error('getProducts fetch error:', err);
    } finally {
      if (!isFiltered) productsInFlight = null;
    }

    return isFiltered ? [] : (productsCache || DUMMY_PRODUCTS);
  })();

  if (!isFiltered) {
    productsInFlight = fetchPromise;
  }

  return fetchPromise;
}

/**
 * Get footwear product by ID or Slug
 */
export async function getProductById(idOrSlug: string | number): Promise<ProductItem | null> {
  const key = String(idOrSlug);

  if (productDetailCache[key]) {
    return productDetailCache[key];
  }

  if (productsCache && productsCache.length > 0) {
    const foundInProductsCache = productsCache.find(
      p => p.id === Number(idOrSlug) || p.slug === key
    );
    if (foundInProductsCache) {
      productDetailCache[key] = foundInProductsCache;
      return foundInProductsCache;
    }
  }

  if (productDetailInFlight[key] !== undefined) {
    return productDetailInFlight[key]!;
  }

  const fetchPromise = (async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(`${BACKEND_URL}/api/products/${idOrSlug}`, {
        headers: defaultHeaders,
        signal: controller.signal,
        next: { revalidate: 60 }
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (json && json.product) {
          const p = json.product;
          const baseImg = p.base_image?.path || p.files?.[0]?.path;
          const imagePath = baseImg ? (baseImg.startsWith('http') ? baseImg : `${BACKEND_URL}/storage/${baseImg}`) : '/img/products/blackheels.jpg';

          const regPrice = parseFloat(String(typeof p.price === 'object' ? (p.price?.amount || 0) : (p.price || 0))) || 0;
          const specPrice = p.special_price ? parseFloat(String(typeof p.special_price === 'object' ? (p.special_price?.amount || 0) : (p.special_price || 0))) : 0;
          const sellPrice = p.selling_price ? parseFloat(String(typeof p.selling_price === 'object' ? (p.selling_price?.amount || 0) : (p.selling_price || 0))) : 0;

          let finalPrice = regPrice;
          let origPrice = regPrice;

          if (specPrice > 0 && specPrice < regPrice) {
            finalPrice = specPrice;
            origPrice = regPrice;
          } else if (sellPrice > 0 && sellPrice < regPrice) {
            finalPrice = sellPrice;
            origPrice = regPrice;
          }

          const catObj = Array.isArray(p.categories) && p.categories.length > 0 ? p.categories[0] : null;
          const categoryName = catObj ? (catObj.name || catObj.title || 'Footwear') : 'Footwear';

          const item: ProductItem = {
            id: p.id,
            slug: p.slug || `footwear-${p.id}`,
            title: p.name || p.translations?.[0]?.name || 'Gulmohar Handcrafted Footwear',
            category_id: catObj ? catObj.id : 1,
            category_name: categoryName,
            price: finalPrice,
            original_price: origPrice,
            rating: p.reviews_avg_rating ? parseFloat(p.reviews_avg_rating) : 4.9,
            review_count: p.reviews_count || 34,
            images: [imagePath],
            description: p.description || p.translations?.[0]?.description || 'Artisan handcrafted footwear with orthopedic memory cushion footbed.',
            badge: ((specPrice > 0 && specPrice < regPrice) ? 'SALE' : 'HOT') as ProductItem['badge'],
            in_stock: p.in_stock !== false,
            colors: ['#000000', '#D4AF37'],
            sizes: mapBackendSizes(p),
            is_featured: Boolean(p.is_featured)
          };

          productDetailCache[key] = item;
          productDetailCache[String(item.id)] = item;
          return item;
        }
      }
    } catch (_err) {
      // ignore
    } finally {
      delete productDetailInFlight[key];
    }

    const numericId = parseInt(String(idOrSlug), 10);
    const found = DUMMY_PRODUCTS.find(p => p.id === numericId || p.slug === String(idOrSlug));
    if (found) {
      productDetailCache[key] = found;
    }
    return found || null;
  })();

  productDetailInFlight[key] = fetchPromise;
  return fetchPromise;
}

/**
 * Save user shipping address to Laravel backend DB (/api/save-user-details)
 */
export async function saveAddressToBackend(payload: {
  userId?: number | string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/save-user-details`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({
        user_id: payload.userId || 1,
        requestType: 'address',
        first_name: payload.firstName,
        last_name: payload.lastName,
        phone: payload.phone,
        address_1: payload.address,
        city: payload.city,
        state: payload.state,
        pincode: payload.pincode
      })
    });
    return res.ok;
  } catch (err) {
    console.error('saveAddressToBackend error:', err);
    return false;
  }
}

/**
 * Place order to Laravel backend DB (/api/order-place)
 */
export async function placeOrderToBackend(orderData: any) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/order-place`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(orderData)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error('placeOrderToBackend error:', err);
  }
  return null;
}

/**
 * Generate and trigger download/print for Invoice PDF bill (Sangho style layout)
 */
export function generateInvoicePDF(order: {
  orderId: string;
  recipientName: string;
  phone: string;
  email: string;
  address: string;
  paymentMethod: string;
  total: number;
  items: Array<{ title: string; quantity: number; size?: string; price: number }>;
  date?: string;
}) {
  const currentDate = order.date || new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const subtotal = order.items.reduce((acc, i) => acc + (i.price * i.quantity), 0);

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to download/print the invoice PDF.');
    return;
  }

  const invoiceHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Tax Invoice - ${order.orderId}</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 25px; color: #1f2937; background: #fff; }
        .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .header-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
        .logo { font-size: 24px; font-weight: 900; letter-spacing: 2px; color: #000; text-transform: uppercase; font-family: serif; }
        .logo span { color: #e63946; }
        .tagline { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; }
        .title-badge { font-size: 18px; font-weight: 800; color: #e63946; text-align: right; text-transform: uppercase; }
        .meta-text { font-size: 12px; color: #4b5563; text-align: right; margin-top: 4px; }
        .divider { height: 2px; background: linear-gradient(90deg, #e63946 0%, #d4af37 100%); margin: 15px 0 25px 0; border: none; }
        .address-section { width: 100%; margin-bottom: 30px; border-collapse: collapse; }
        .address-card { width: 50%; vertical-align: top; font-size: 12px; line-height: 1.6; }
        .address-card h4 { margin: 0 0 6px 0; font-size: 12px; text-transform: uppercase; color: #e63946; letter-spacing: 0.5px; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
        .items-table th { background: #f9fafb; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; color: #374151; border-bottom: 2px solid #e5e7eb; }
        .items-table td { padding: 12px; font-size: 12px; border-bottom: 1px solid #f3f4f6; color: #111827; }
        .totals-table { width: 40%; margin-left: auto; border-collapse: collapse; font-size: 12px; }
        .totals-table td { padding: 6px 12px; }
        .totals-table .grand-total { font-size: 16px; font-weight: 800; color: #e63946; border-top: 2px solid #111827; padding-top: 10px; }
        .footer { margin-top: 40px; padding-top: 15px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 11px; color: #6b7280; }
        @media print {
          body { padding: 0; }
          .invoice-box { border: none; box-shadow: none; padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="text-align: center; margin-bottom: 20px;">
        <button onclick="window.print()" style="padding: 10px 24px; background: #e63946; color: #fff; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">
          Print / Save PDF Invoice
        </button>
      </div>

      <div class="invoice-box">
        <table class="header-table">
          <tr>
            <td>
              <div class="logo">Gulmohar <span>Footwear</span></div>
              <div class="tagline">Handcrafted Luxury & Ergonomic Comfort</div>
            </td>
            <td>
              <div class="title-badge">TAX INVOICE</div>
              <div class="meta-text"><strong>Invoice No:</strong> ${order.orderId}</div>
              <div class="meta-text"><strong>Date:</strong> ${currentDate}</div>
              <div class="meta-text"><strong>Payment:</strong> ${order.paymentMethod}</div>
            </td>
          </tr>
        </table>

        <div class="divider"></div>

        <table class="address-section">
          <tr>
            <td class="address-card">
              <h4>Billed & Shipped To:</h4>
              <strong>${order.recipientName}</strong><br />
              ${order.address}<br />
              <strong>Mobile:</strong> ${order.phone}<br />
              <strong>Email:</strong> ${order.email}
            </td>
            <td class="address-card" style="text-align: right;">
              <h4>Seller Details:</h4>
              <strong>Gulmohar Footwear Pvt Ltd</strong><br />
              102, Craftsman Plaza, FC Road<br />
              Mumbai, Maharashtra - 400050<br />
              GSTIN: 27AABCG1234F1Z9<br />
              Support: support@gulmoharfootwear.com
            </td>
          </tr>
        </table>

        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 50%;">Item Description</th>
              <th style="text-align: center;">Size</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Unit Price</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td><strong>${item.title}</strong></td>
                <td style="text-align: center;">${item.size || 'Standard'}</td>
                <td style="text-align: center;">${item.quantity}</td>
                <td style="text-align: right;">₹${item.price.toLocaleString('en-IN')}</td>
                <td style="text-align: right;"><strong>₹${(item.price * item.quantity).toLocaleString('en-IN')}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <table class="totals-table">
          <tr>
            <td>Subtotal:</td>
            <td style="text-align: right;">₹${subtotal.toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td>Delivery Charges:</td>
            <td style="text-align: right; color: #059669; font-weight: bold;">FREE</td>
          </tr>
          <tr>
            <td>GST (Included 18%):</td>
            <td style="text-align: right;">₹${Math.round(order.total * 0.18).toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td class="grand-total">Total Amount:</td>
            <td class="grand-total" style="text-align: right;">₹${order.total.toLocaleString('en-IN')}</td>
          </tr>
        </table>

        <div class="footer">
          <p>Thank you for shopping with Gulmohar Footwear! For warranty or returns visit gulmoharfootwear.com</p>
          <p>This is a computer-generated tax invoice receipt requiring no physical signature.</p>
        </div>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() { window.print(); }, 500);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(invoiceHtml);
  printWindow.document.close();
}


