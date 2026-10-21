import { DUMMY_SLIDERS, DUMMY_PRODUCTS, SlideItem, CategoryItem, ProductItem, ProductSizeItem } from '@/data/dummyData';

export interface OrderPayload {
  orderId: string;
  userId?: number;
  customerId?: number;
  recipientName: string;
  phone: string;
  email: string;
  address: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  label: string;
  total: number;
  subtotal?: number;
  paymentMethod: string;
  date?: string;
  items: Array<{
    product_id?: number;
    id?: number;
    title: string;
    quantity: number;
    size?: string;
    price: number;
  }>;
}

export interface RegisterUserPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  referredByCode?: string;
  referralShareSource?: string;
}

export interface RegisteredUser {
  id: number;
  referralCode: string;
  accessToken: string;
  name: string;
  phone: string;
}

export type AuthenticatedUser = RegisteredUser;


type ApiRecord = Record<string, unknown>;

interface BackendSizeRecord {
  size?: string;
  name?: string;
  qty?: number | string | null;
  in_stock?: boolean | number | string | null;
}

interface BackendCategoryRecord {
  id?: number;
  slug?: string;
  name?: string;
  title?: string;
  description?: string;
  image?: string;
  products_count?: number;
}

interface BackendProductRecord {
  id: number;
  slug?: string;
  name?: string;
  translations?: Array<{ name?: string; description?: string }>;
  price?: number | string | { amount?: number | string };
  special_price?: number | string | { amount?: number | string } | null;
  selling_price?: number | string | { amount?: number | string } | null;
  base_image?: { path?: string };
  files?: Array<{ path?: string }>;
  additional_images?: Array<{ path?: string }>;
  categories?: BackendCategoryRecord[];
  reviews_avg_rating?: number | string;
  reviews_count?: number;
  description?: string;
  is_featured?: boolean;
  in_stock?: boolean | number | string | null;
  size_inventory?: BackendSizeRecord[];
  variants?: BackendSizeRecord[];
}

interface BackendSliderRecord {
  id?: number;
  image?: string;
  title?: string;
  content?: string;
  action_url?: string;
}

function asRecord(value: unknown): ApiRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as ApiRecord
    : {};
}

function parseBackendPrice(value: unknown): number {
  const rawValue = typeof value === 'object' && value !== null
    ? (value as { amount?: unknown }).amount
    : value;
  return parseFloat(String(rawValue || 0)) || 0;
}
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

export function getProductShareUrl(productId: number, referralCode: string): string {
  return `${BACKEND_URL}/online-store/product/${encodeURIComponent(String(productId))}/ref/${encodeURIComponent(referralCode)}`;
}

export function extractProductImages(p: BackendProductRecord): string[] {
  const images: string[] = [];

  const addPath = (pathVal?: string | null) => {
    if (!pathVal || typeof pathVal !== 'string') return;
    const clean = pathVal.trim();
    if (!clean) return;
    const full = clean.startsWith('http') || clean.startsWith('/')
      ? clean
      : `${BACKEND_URL}/storage/${clean}`;
    if (!images.includes(full)) {
      images.push(full);
    }
  };

  // 1. Base Image
  addPath(p.base_image?.path);

  // 2. Additional Images
  if (Array.isArray(p.additional_images)) {
    for (const img of p.additional_images) {
      if (typeof img === 'string') addPath(img);
      else if (img && typeof img === 'object' && img.path) addPath(img.path);
    }
  }

  // 3. Media
  const anyP = p as any;
  if (Array.isArray(anyP?.media)) {
    for (const m of anyP.media) {
      if (typeof m === 'string') addPath(m);
      else if (m && typeof m === 'object' && m.path) addPath(m.path);
    }
  }

  // 4. Files
  if (Array.isArray(p.files)) {
    for (const f of p.files) {
      if (typeof f === 'string') addPath(f);
      else if (f && typeof f === 'object' && f.path) addPath(f.path);
    }
  }

  // 5. Fallback
  if (images.length === 0) {
    const baseImg = p.base_image?.path || p.files?.[0]?.path || p.additional_images?.[0]?.path;
    const fallbackPath = baseImg
      ? (baseImg.startsWith('http') || baseImg.startsWith('/') ? baseImg : `${BACKEND_URL}/storage/${baseImg}`)
      : '/img/products/blackheels.jpg';
    images.push(fallbackPath);
  }

  return images;
}

async function postRegistrationRequest(path: string, body: Record<string, unknown>): Promise<ApiRecord> {
  let response: Response;
  try {
    response = await fetch(`${BACKEND_URL}/api/web-register/${path}`, {
      method: 'POST',
      headers: defaultHeaders,
      cache: 'no-store',
      body: JSON.stringify(body)
    });
  } catch {
    throw new Error('Cannot connect to Gulmohar backend. Check that Apache is running and gulmohar-backend.test is in the Windows hosts file.');
  }
  const result = asRecord(await response.json().catch(() => ({})));

  if (!response.ok || result.success !== true) {
    if (response.status === 409) {
      throw new Error('An account with this email already exists. Please sign in instead.');
    }
    if (response.status === 422 && path === 'verify-otp') {
      throw new Error('The verification code is invalid or expired. Please check your email.');
    }
    throw new Error('We could not complete registration with the server. Please try again.');
  }

  return result;
}

export async function requestRegistrationOtp(email: string): Promise<void> {
  await postRegistrationRequest('send-otp', { email });
}

export async function verifyRegistrationOtp(email: string, code: string): Promise<void> {
  await postRegistrationRequest('verify-otp', { email, code });
}

export async function loginUserToBackend(email: string, password: string): Promise<AuthenticatedUser> {
  let response: Response;
  try {
    response = await fetch(`${BACKEND_URL}/api/web-login`, {
      method: 'POST',
      headers: defaultHeaders,
      cache: 'no-store',
      body: JSON.stringify({ email, password })
    });
  } catch {
    throw new Error('Cannot connect to Gulmohar backend. Check that Apache is running and gulmohar-backend.test is in the Windows hosts file.');
  }

  const result = asRecord(await response.json().catch(() => ({})));
  if (response.status === 401) {
    throw new Error('Email or password is incorrect.');
  }
  if (!response.ok || result.success !== true) {
    throw new Error('We could not sign you in. Please try again.');
  }

  const data = asRecord(result.data);
  const id = Number(data.user_id);
  if (!Number.isInteger(id) || id < 1 || typeof data.access_token !== 'string' || typeof data.referral_code !== 'string') {
    throw new Error('The backend returned an invalid login session. Please try again.');
  }

  const name = [data.first_name, data.last_name]
    .filter((part): part is string => typeof part === 'string' && part.length > 0)
    .join(' ');
  return {
    id,
    name: name || email,
    phone: typeof data.phone === 'string' ? data.phone : '',
    referralCode: data.referral_code,
    accessToken: data.access_token
  };
}

export async function revokeWebLoginToken(accessToken: string): Promise<void> {
  try {
    await fetch(`${BACKEND_URL}/api/web-logout`, {
      method: 'POST',
      headers: { ...defaultHeaders, Authorization: `Bearer ${accessToken}` },
      cache: 'no-store'
    });
  } catch {
    // Local logout still succeeds when the server cannot be reached.
  }
}

async function postWebPasswordRequest(path: string, body: Record<string, string>): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`${BACKEND_URL}/api/web-password/${path}`, {
      method: 'POST',
      headers: defaultHeaders,
      cache: 'no-store',
      body: JSON.stringify(body)
    });
  } catch {
    throw new Error('Cannot connect to Gulmohar backend. Check that Apache is running and gulmohar-backend.test is in the Windows hosts file.');
  }

  const result = asRecord(await response.json().catch(() => ({})));
  if (response.status === 422) {
    throw new Error('The reset code is invalid or expired, or the password details are invalid.');
  }
  if (!response.ok || result.success !== true) {
    throw new Error('We could not process this password reset. Please try again.');
  }
}

export function requestPasswordResetOtp(email: string): Promise<void> {
  return postWebPasswordRequest('send-otp', { email });
}

export function verifyPasswordResetOtp(email: string, code: string): Promise<void> {
  return postWebPasswordRequest('verify-otp', { email, code });
}

export function resetPasswordWithOtp(email: string, code: string, newPassword: string, confirmation: string): Promise<void> {
  return postWebPasswordRequest('reset', {
    email,
    code,
    new_password: newPassword,
    new_password_confirmation: confirmation
  });
}

export async function registerUserToBackend(payload: RegisterUserPayload, otpCode: string): Promise<RegisteredUser> {
  const nameParts = payload.name.trim().split(/\s+/);
  const firstName = nameParts[0] || 'Customer';
  const lastName = nameParts.slice(1).join(' ') || firstName;
  const shareSource = payload.referralShareSource === 'product-share'
    ? 'store'
    : payload.referralShareSource === 'account-share'
      ? 'web'
      : payload.referralShareSource?.slice(0, 10);
  const registrationResult = await postRegistrationRequest('complete', {
    first_name: firstName,
    last_name: lastName,
    email: payload.email,
    phone: payload.phone,
    password: payload.password,
    otp_code: otpCode,
    referrer_code: payload.referredByCode,
    share_source: shareSource
  });
  const registrationData = asRecord(registrationResult.data);
  const userId = Number(registrationData.user_id);
  if (!Number.isInteger(userId) || userId < 1
    || typeof registrationData.referral_code !== 'string'
    || typeof registrationData.access_token !== 'string') {
    throw new Error('The server did not return a valid new account. Please retry registration.');
  }

  return {
    id: userId,
    name: payload.name.trim() || payload.email,
    phone: payload.phone,
    referralCode: registrationData.referral_code,
    accessToken: registrationData.access_token
  };
}

const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '630febe3-d23c-45j6-8a0e-f432518e35as21';

const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'accesskey': API_KEY,
};

function mapBackendSizes(p: BackendProductRecord): ProductSizeItem[] {
  if (Array.isArray(p.size_inventory) && p.size_inventory.length > 0) {
    return p.size_inventory.map((item) => {
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
    return p.variants.map((variant) => {
      const qtyNum = typeof variant.qty === 'number' ? variant.qty : (parseInt(String(variant.qty || 0), 10) || 0);
      const isStock = variant.in_stock !== false && variant.in_stock !== 0 && variant.in_stock !== '0' && qtyNum > 0;
      return {
        size: String(variant.name || variant.size || '').trim(),
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
      const json = asRecord(await res.json());
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        return json.data.map((rawItem: unknown, index: number) => {
          const item = rawItem as BackendSliderRecord;
          return {
          id: item.id || index + 1,
          image: item.image?.startsWith('http') ? item.image : `${BACKEND_URL}/storage/${item.image || ''}`,
          title: item.title || 'Gulmohar Footwear',
          subtitle: 'Step Into Comfort, Walk in Style',
          content: item.content || 'Premium handcrafted footwear engineered with ergonomic comfort soles.',
          action_url: item.action_url || '/shop',
          button_text: 'Shop Collection',
          badge: index === 0 ? 'NEW ARRIVALS 2026' : 'FEATURED'
          };
        });
      }
    }
  } catch {
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

  const request = (async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/online-store-categories`, {
        headers: defaultHeaders,
        next: { revalidate: 60 }
      });

      if (res.ok) {
        const response: unknown = await res.json();
        const json = asRecord(response);
        const catList = json.categories || json.data || (Array.isArray(response) ? response : []);
        if (Array.isArray(catList) && catList.length > 0) {
          categoriesCache = catList.map((rawCategory: unknown, index: number) => {
            const c = rawCategory as BackendCategoryRecord;
            return {
              id: c.id || index + 1,
              slug: c.slug || c.name?.toLowerCase().replace(/\s+/g, '-') || `category-${index + 1}`,
              title: c.name || c.title || 'Footwear',
              description: c.description || 'Exclusive Footwear Collection',
              image: c.image ? (c.image.startsWith('http') ? c.image : `${BACKEND_URL}/storage/${c.image}`) : '/img/men-large.jpg',
              itemCount: typeof c.products_count === 'number' ? c.products_count : 0
            };
          });
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

  categoriesInFlight = request;
  return request;
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
        const response: unknown = await res.json();
        const json = asRecord(response);
        const data = asRecord(json.data);
        const prodList = data.products || json.products || (Array.isArray(json.data) ? json.data : []);
        if (Array.isArray(prodList) && prodList.length > 0) {
          const parsed = prodList.map((rawProduct: unknown) => {
            const p = rawProduct as BackendProductRecord;
            const baseImg = p.base_image?.path || p.files?.[0]?.path || p.additional_images?.[0]?.path;
            const imagePath = baseImg ? (baseImg.startsWith('http') ? baseImg : `${BACKEND_URL}/storage/${baseImg}`) : '/img/products/blackheels.jpg';

            const regPrice = parseBackendPrice(p.price);
            const specPrice = p.special_price ? parseBackendPrice(p.special_price) : 0;

            const hasSpecialPrice = specPrice > 0 && specPrice < regPrice;
            const finalPrice = hasSpecialPrice ? specPrice : regPrice;
            const origPrice = regPrice;

            const productCategories = Array.isArray(p.categories) ? p.categories : [];
            const catObj = productCategories.length > 0 ? productCategories[0] : null;
            const categoryName = catObj ? (catObj.name || catObj.title || 'Uncategorized') : 'Uncategorized';
            const categoryIds = productCategories.map(c => Number(c.id)).filter(id => !isNaN(id) && id > 0);
            const categorySlugs = productCategories.map(c => (c.slug || '').toLowerCase()).filter(Boolean);

            const sizes = mapBackendSizes(p);
            const isStockFlag = p.in_stock !== false && p.in_stock !== 0 && p.in_stock !== '0';
            const in_stock = sizes.length > 0
              ? isStockFlag && sizes.some(s => s.in_stock && s.qty > 0)
              : isStockFlag;

            const item: ProductItem = {
              id: p.id,
              slug: p.slug || `footwear-${p.id}`,
              title: p.name || p.translations?.[0]?.name || 'Gulmohar Handcrafted Footwear',
              category_id: catObj?.id ?? (categoryIds[0] || 0),
              category_name: categoryName,
              category_ids: categoryIds,
              category_slugs: categorySlugs,
              price: finalPrice,
              original_price: origPrice,
              special_price: hasSpecialPrice ? specPrice : null,
              has_special_price: hasSpecialPrice,
              rating: p.reviews_avg_rating ? parseFloat(String(p.reviews_avg_rating)) : 4.9,
              review_count: p.reviews_count || 28,
              images: extractProductImages(p),
              description: p.description || p.translations?.[0]?.description || 'Artisan handcrafted footwear with ergonomic comfort sole.',
              badge: (hasSpecialPrice ? 'SALE' : (p.is_featured ? 'HOT' : undefined)) as ProductItem['badge'],
              in_stock,
              colors: ['#000000', '#D4AF37'],
              sizes,
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
        const json = asRecord(await res.json());
          if (json.product) {
            const p = json.product as BackendProductRecord;
          const baseImg = p.base_image?.path || p.files?.[0]?.path;
          const imagePath = baseImg ? (baseImg.startsWith('http') ? baseImg : `${BACKEND_URL}/storage/${baseImg}`) : '/img/products/blackheels.jpg';

          const regPrice = parseBackendPrice(p.price);
          const specPrice = p.special_price ? parseBackendPrice(p.special_price) : 0;

          const hasSpecialPrice = specPrice > 0 && specPrice < regPrice;
          const finalPrice = hasSpecialPrice ? specPrice : regPrice;
          const origPrice = regPrice;

          const productCategories = Array.isArray(p.categories) ? p.categories : [];
          const catObj = productCategories.length > 0 ? productCategories[0] : null;
          const categoryName = catObj ? (catObj.name || catObj.title || 'Uncategorized') : 'Uncategorized';
          const categoryIds = productCategories.map(c => Number(c.id)).filter(id => !isNaN(id) && id > 0);
          const categorySlugs = productCategories.map(c => (c.slug || '').toLowerCase()).filter(Boolean);

          const sizes = mapBackendSizes(p);
          const isStockFlag = p.in_stock !== false && p.in_stock !== 0 && p.in_stock !== '0';
          const in_stock = sizes.length > 0
            ? isStockFlag && sizes.some(s => s.in_stock && s.qty > 0)
            : isStockFlag;

          const item: ProductItem = {
            id: p.id,
            slug: p.slug || `footwear-${p.id}`,
            title: p.name || p.translations?.[0]?.name || 'Gulmohar Handcrafted Footwear',
            category_id: catObj?.id ?? (categoryIds[0] || 0),
            category_name: categoryName,
            category_ids: categoryIds,
            category_slugs: categorySlugs,
            price: finalPrice,
            original_price: origPrice,
            special_price: hasSpecialPrice ? specPrice : null,
            has_special_price: hasSpecialPrice,
            rating: p.reviews_avg_rating ? parseFloat(String(p.reviews_avg_rating)) : 4.9,
            review_count: p.reviews_count || 34,
            images: extractProductImages(p),
            description: p.description || p.translations?.[0]?.description || 'Artisan handcrafted footwear with orthopedic memory cushion footbed.',
            badge: (hasSpecialPrice ? 'SALE' : (p.is_featured ? 'HOT' : undefined)) as ProductItem['badge'],
            in_stock,
            colors: ['#000000', '#D4AF37'],
            sizes,
            is_featured: Boolean(p.is_featured)
          };

          productDetailCache[key] = item;
          productDetailCache[String(item.id)] = item;
          return item;
        }
      }
    } catch {
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
export async function placeOrderToBackend(orderData: OrderPayload) {
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
 * Fetch orders for a user from Laravel backend (/api/orders)
 */
export async function getUserOrders(params: { userId?: number; email?: string }): Promise<any[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/orders`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({
        user_id: params.userId,
        email: params.email
      })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'success' && Array.isArray(data.data)) {
        return data.data;
      }
    }
  } catch (err) {
    console.error('getUserOrders error:', err);
  }
  return [];
}

/**
 * Cancel order in Laravel backend (/api/orders/{id}/cancel) which restores stock
 */
export async function cancelOrderInBackend(orderId: number | string): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/orders/${orderId}/cancel`, {
      method: 'POST',
      headers: defaultHeaders
    });
    if (res.ok) {
      const data = await res.json();
      return data.status === 'success';
    }
  } catch (err) {
    console.error('cancelOrderInBackend error:', err);
  }
  return false;
}

/**
 * Get single order details from Laravel backend (/api/orders/{id})
 */
export async function getOrderDetailInBackend(orderId: number | string): Promise<any | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/orders/${orderId}`, {
      method: 'GET',
      headers: defaultHeaders,
      cache: 'no-store'
    });
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'success' && data.data) {
        return data.data;
      }
    }
  } catch (err) {
    console.error('getOrderDetailInBackend error:', err);
  }
  return null;
}

/**
 * Submit product review and rating to Laravel backend (/api/products/{productId}/reviews)
 */
export async function submitProductReview(params: {
  productId: number | string;
  userId: number | string;
  reviewerName: string;
  rating: number;
  comment: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/products/${params.productId}/reviews`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({
        user_id: params.userId,
        reviewer_name: params.reviewerName,
        rating: params.rating,
        comment: params.comment
      })
    });
    const data = await res.json().catch(() => null);
    if (res.ok && (data?.success || data?.status === 'success' || data?.data)) {
      return { success: true, message: data?.message || 'Thank you for your rating and review!' };
    }
    return { success: false, message: data?.message || 'Could not submit review. Please try again.' };
  } catch (err) {
    console.error('submitProductReview error:', err);
    return { success: false, message: 'Server connection error.' };
  }
}

export interface BackendReviewItem {
  id: number;
  reviewer_id?: number | string;
  reviewer_name?: string;
  name?: string;
  rating: number;
  comment: string;
  created_at?: string;
  created_at_formatted?: string;
}

/**
 * Fetch product reviews from Laravel backend DB (/api/products/{productId}/reviews)
 */
export async function getProductReviews(productId: number | string): Promise<BackendReviewItem[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/products/${productId}/reviews`, {
      method: 'GET',
      headers: defaultHeaders,
      cache: 'no-store'
    });
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json?.data)) {
        return json.data;
      }
      if (Array.isArray(json)) {
        return json;
      }
    }
  } catch (err) {
    console.error('getProductReviews error:', err);
  }
  return [];
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
              <strong>Gulmohar Footwear</strong><br />
              Vadla RTO Road, Bhavnagar<br />
              Gujarat - 364002, India<br />
              <strong>Phone:</strong> +91 9898798322 / +91 9429974671<br />
              <strong>Email:</strong> support@footweargulmohar.com
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
          <p>Thank you for shopping with Gulmohar Footwear! (No Warranty & No Return Policy)</p>
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


