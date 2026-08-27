// ═══════════════════════════════════════════════════
//  SHARED PRODUCT DATA & UTILITIES (PRODUCTION CLEAN)
// ═══════════════════════════════════════════════════

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  model_name: string;
  brand: string;
  old_price: string;
  cash_price: string;
  discount: string;
  credit_tag: string;
  monthly: string;
  badge: string;
  image: string;
  images?: string[];
  colors?: any;
  hasVideo?: boolean;
  video_url?: string;
  isNew?: boolean;
  category?: string;
  isOnlineOnly?: boolean;
  rawPrice?: number;
  description?: string;
  specs?: ProductSpec[];
  attributes?: Record<string, string>;
  stock?: number;
  bundled_product_ids?: string[];
  alternative_product_ids?: string[];
  service_ids?: string[];
  storage_variants?: any[];
  videos?: any[];
}

export function getProductAttributes(product: Product): Record<string, string> {
  if (product.attributes && Object.keys(product.attributes).length > 0) {
    return product.attributes;
  }
  return {};
}

export function getQuickSpecs(product: Product): ProductSpec[] {
  if (product.specs && product.specs.length > 0) {
    return product.specs.slice(0, 4);
  }
  if (product.attributes && Object.keys(product.attributes).length > 0) {
    return Object.entries(product.attributes)
      .slice(0, 4)
      .map(([key, value]) => ({ label: key, value }));
  }
  return [];
}

export function getDetailedSpecs(product: Product): ProductSpec[] {
  if (product.specs && product.specs.length > 0) {
    return product.specs;
  }
  if (product.attributes && Object.keys(product.attributes).length > 0) {
    return Object.entries(product.attributes).map(([label, value]) => ({ label, value }));
  }
  return [
    { label: 'İstehsalçı Brend', value: product.brand || 'Ümumi' },
    { label: 'Model Adı', value: product.model_name },
    { label: 'Nağd Qiymət', value: product.cash_price },
    { label: 'Kredit Şərtləri', value: product.credit_tag || '0₼ 12 ay' },
  ];
}

// ── SEO Slug Utility ──────────────────────────────
const AZ_MAP: Record<string, string> = {
  'ə': 'e', 'ö': 'o', 'ü': 'u', 'ğ': 'g', 'ş': 's',
  'ç': 'c', 'ı': 'i', 'İ': 'i', 'Ə': 'e', 'Ö': 'o', 'Ü': 'u',
  'Ğ': 'g', 'Ş': 's', 'Ç': 'c',
};

export function toSlug(name: any): string {
  if (!name) return '';
  const str = String(name);
  return str
    .split('')
    .map(ch => AZ_MAP[ch] ?? ch)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getProductBySlug(slug: string): Product | undefined {
  if (!slug) return undefined;
  let decoded = slug;
  try {
    decoded = decodeURIComponent(slug);
  } catch (e) {
    decoded = slug;
  }
  const targetSlug = toSlug(decoded);
  const pool = _inMemoryProducts;

  // 1. Exact ID match
  let found = pool.find(p => p && String(p.id).toLowerCase() === decoded.toLowerCase());
  if (found) return found;

  // 2. Exact slug match on model_name or id
  found = pool.find(p => p && (toSlug(p.model_name) === targetSlug || toSlug(p.id) === targetSlug));
  if (found) return found;

  // 3. Substring slug match
  found = pool.find(
    p =>
      p &&
      targetSlug.length > 2 &&
      (toSlug(p.model_name).includes(targetSlug) || targetSlug.includes(toSlug(p.model_name)))
  );
  if (found) return found;

  // 4. Match by brand + model keywords
  const normDecoded = normalizeSearchString(decoded);
  if (normDecoded) {
    found = pool.find(p => p && matchProductSearch(p, normDecoded));
    if (found) return found;
  }

  return undefined;
}

export async function fetchProductBySlugApi(slug: string): Promise<Product | undefined> {
  if (!slug) return undefined;
  let decoded = slug;
  try {
    decoded = decodeURIComponent(slug);
  } catch (e) {
    decoded = slug;
  }
  const allLive = await fetchLiveProducts();
  const targetSlug = toSlug(decoded);
  const found = (allLive || []).find(
    p =>
      p &&
      (String(p.id).toLowerCase() === decoded.toLowerCase() ||
        toSlug(p.model_name) === targetSlug ||
        toSlug(p.id) === targetSlug ||
        (targetSlug.length > 2 && toSlug(p.model_name).includes(targetSlug)))
  );
  if (found) return found;

  return getProductBySlug(decoded);
}

export function getSimilarProducts(product: Product, count = 6): Product[] {
  if (!product) return [];
  const pool = _inMemoryProducts;
  const category = product.category ?? product.brand;
  const filtered = pool.filter(
    p => p && p.id !== product.id && (p.category === category || p.brand === product.brand)
  );
  if (filtered.length >= count) {
    return filtered.slice(0, count);
  }
  const remaining = pool.filter(p => p && p.id !== product.id && !filtered.includes(p));
  return [...filtered, ...remaining].slice(0, count);
}

// ── In-Memory Live Catalog (Strictly Real Data, No Dummy Products) ──
let _inMemoryProducts: Product[] = [];
export const LEADER_PRODUCTS: Product[] = [];
export const GREAT_OFFERS: Product[] = [];
export const ALL_PRODUCTS: Product[] = [];

export function adaptErpProductToWeb(erpP: any): Product {
  if (!erpP) {
    return {
      id: '',
      model_name: '',
      brand: '',
      old_price: '',
      cash_price: '0 ₼',
      rawPrice: 0,
      discount: '',
      credit_tag: '0₼ 12 ay',
      monthly: '0 ₼/ay',
      badge: '',
      image: '',
      images: [],
      colors: ['#0f172a'],
      category: '',
      isOnlineOnly: false,
      attributes: {},
    };
  }

  let cashPriceNum = typeof erpP.cash_price === 'number' ? erpP.cash_price : parseFloat(String(erpP.cash_price || 0).replace(/[^\d.]/g, '')) || 0;
  let oldPriceNum = typeof erpP.old_price === 'number' ? erpP.old_price : parseFloat(String(erpP.old_price || 0).replace(/[^\d.]/g, '')) || 0;

  const monthlyNum = (cashPriceNum / 12).toFixed(1);

  let rawImages = erpP.images;
  if (typeof rawImages === 'string') {
    try { rawImages = JSON.parse(rawImages); } catch (e) { rawImages = []; }
  }
  if (!Array.isArray(rawImages) || rawImages.length === 0) {
    rawImages = erpP.image ? [erpP.image] : [];
  }
  const cleanImages = (Array.isArray(rawImages) ? rawImages : []).filter(img => typeof img === 'string' && img.trim().length > 0);

  let rawAltIds = erpP.alternative_product_ids;
  if (typeof rawAltIds === 'string') {
    try { rawAltIds = JSON.parse(rawAltIds); } catch (e) { rawAltIds = []; }
  }

  let rawServiceIds = erpP.service_ids;
  if (typeof rawServiceIds === 'string') {
    try { rawServiceIds = JSON.parse(rawServiceIds); } catch (e) { rawServiceIds = []; }
  }

  let rawBundleIds = erpP.bundled_product_ids;
  if (typeof rawBundleIds === 'string') {
    try { rawBundleIds = JSON.parse(rawBundleIds); } catch (e) { rawBundleIds = []; }
  }

  let rawVariants = erpP.storage_variants || erpP.variants;
  if (typeof rawVariants === 'string') {
    try { rawVariants = JSON.parse(rawVariants); } catch (e) { rawVariants = []; }
  }

  let rawVideos = erpP.videos;
  if (typeof rawVideos === 'string') {
    try { rawVideos = JSON.parse(rawVideos); } catch (e) { rawVideos = []; }
  }

  return {
    id: String(erpP.id || ''),
    model_name: String(erpP.name || erpP.model_name || ''),
    brand: String(erpP.brand || ''),
    old_price: oldPriceNum ? `${oldPriceNum.toFixed(2)} ₼` : '',
    cash_price: `${cashPriceNum.toFixed(2)} ₼`,
    rawPrice: cashPriceNum,
    discount: String(erpP.discount || (oldPriceNum > cashPriceNum ? `-${Math.round((1 - cashPriceNum / oldPriceNum) * 100)}%` : '')),
    credit_tag: '0₼ 12 ay',
    monthly: `${monthlyNum} ₼/ay`,
    badge: String(erpP.badge || erpP.badge_text || ''),
    image: cleanImages[0] || String(erpP.image || ''),
    images: cleanImages.length > 0 ? cleanImages : (erpP.image ? [String(erpP.image)] : []),
    colors: Array.isArray(erpP.colors) && erpP.colors.length > 0 ? erpP.colors : ['#0f172a'],
    hasVideo: Boolean(erpP.video_url || erpP.videoUrl || erpP.hasVideo || (Array.isArray(rawVideos) && rawVideos.length > 0)),
    video_url: String(erpP.video_url || erpP.videoUrl || ''),
    description: String(erpP.description || erpP.desc || ''),
    isNew: !!erpP.is_new,
    category: String(erpP.category_name || erpP.category || ''),
    isOnlineOnly: !!erpP.is_online_only,
    attributes: (erpP.attributes && typeof erpP.attributes === 'object') ? erpP.attributes : {},
    stock: typeof erpP.stock === 'number' ? erpP.stock : (parseInt(String(erpP.stock || 0), 10) || 0),
    bundled_product_ids: Array.isArray(rawBundleIds) ? rawBundleIds : [],
    alternative_product_ids: Array.isArray(rawAltIds) ? rawAltIds : [],
    service_ids: Array.isArray(rawServiceIds) ? rawServiceIds : [],
    storage_variants: Array.isArray(rawVariants) ? rawVariants : [],
    videos: Array.isArray(rawVideos) ? rawVideos : [],
  };
}

export const API_CATALOG_BASE = typeof window !== 'undefined'
  ? '/api/catalog'
  : (process.env.INTERNAL_BACKEND_URL || 'http://127.0.0.1:4000/api/catalog');

export async function fetchLiveProducts(): Promise<Product[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(`${API_CATALOG_BASE}/products`, {
      signal: controller.signal,
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    } as any).catch(() => null);
    clearTimeout(timeoutId);

    if (res && res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        const adapted = data.map(adaptErpProductToWeb).filter(p => p && p.id);
        _inMemoryProducts = adapted;
        return adapted;
      }
    }
  } catch (e: any) {
    console.error('Error in fetchLiveProducts:', e);
  }
  return _inMemoryProducts;
}

export async function fetchSiteSettingsServer(): Promise<any> {
  try {
    const url = typeof window !== 'undefined'
      ? '/api/catalog/settings'
      : (process.env.INTERNAL_BACKEND_URL || 'http://technomania_backend:4000/api/catalog') + '/settings';

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      signal: controller.signal,
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    } as any).catch(() => null);
    clearTimeout(timeoutId);

    if (res && res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object' && !Array.isArray(data) && !data.statusCode) {
        return data;
      }
    }
  } catch (e) {}
  return {};
}

export function normalizeSearchString(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/ə/g, 'e')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/[^a-z0-9\s]/g, ' ');
}

export function matchProductSearch(prod: Product, query: string): boolean {
  if (!prod || !query || !query.trim()) return true;

  const rawQ = query.toLowerCase().trim();
  const normQ = normalizeSearchString(query);

  const rawTarget = `${prod.model_name || ''} ${prod.brand || ''} ${prod.category || ''} ${prod.description || ''} ${prod.badge || ''}`.toLowerCase();
  const normTarget = normalizeSearchString(rawTarget);

  if (rawTarget.includes(rawQ) || normTarget.includes(normQ)) return true;

  const queryTokens = normQ.split(/\s+/).filter(Boolean);
  if (queryTokens.length === 0) return true;

  return queryTokens.every(token => normTarget.includes(token));
}

export function getLiveProducts(): Product[] {
  return _inMemoryProducts;
}
