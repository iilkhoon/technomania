import { createClient } from '@supabase/supabase-js';
import { Category, Product, Brand, ProductDraft } from '../types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xyzcompany.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const isSupabaseConfigured = () => false;

export const INITIAL_CATEGORIES: Category[] = [];
export const INITIAL_PRODUCTS: Product[] = [];
export const INITIAL_BRANDS: Brand[] = [];

export const ERP_SECRET_KEY = process.env.NEXT_PUBLIC_ERP_SECRET_KEY || 'technomania_secure_erp_token_2026_98x!';

export function getErpHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'x-erp-api-key': ERP_SECRET_KEY,
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    ...extra,
  };
}

export function computeCategoryFullPath(catId: string, allCategories: Category[]): string {
  const cat = allCategories.find(c => c.id === catId);
  if (!cat) return '';
  if (!cat.parent_id) return cat.slug;
  const parentPath = computeCategoryFullPath(cat.parent_id, allCategories);
  return parentPath ? `${parentPath}/${cat.slug}` : cat.slug;
}

export function getLocalCategories(): Category[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('erp_categories');
  if (data) {
    try {
      const parsed: Category[] = JSON.parse(data);
      const withFullSlug = parsed.map(c => ({
        ...c,
        full_slug: c.full_slug || computeCategoryFullPath(c.id, parsed)
      }));
      return withFullSlug.sort((a, b) => (a.sort_order || 99) - (b.sort_order || 99));
    } catch (e) {}
  }
  return [];
}

export const API_CATALOG_BASE = typeof window !== 'undefined'
  ? '/api/catalog'
  : (process.env.INTERNAL_BACKEND_URL || 'http://127.0.0.1:4000/api/catalog');

export function saveLocalCategories(categories: Category[]) {
  if (typeof window !== 'undefined') {
    const withFullSlug = categories.map(c => ({
      ...c,
      full_slug: computeCategoryFullPath(c.id, categories)
    }));
    localStorage.setItem('erp_categories', JSON.stringify(withFullSlug));
    withFullSlug.forEach(cat => {
      fetch(`${API_CATALOG_BASE}/categories`, {
        method: 'POST',
        headers: getErpHeaders(),
        body: JSON.stringify(cat)
      }).catch(() => {});
    });
  }
}

export function getFetchOptionsWithTimeout(ms = 10000): RequestInit {
  try {
    return {
      cache: 'no-store',
      signal: AbortSignal.timeout(ms),
      headers: getErpHeaders()
    };
  } catch (e) {
    return {
      cache: 'no-store',
      headers: getErpHeaders()
    };
  }
}

export const FETCH_NO_CACHE_OPTIONS: RequestInit = {
  cache: 'no-store',
  headers: getErpHeaders()
};

export async function fetchApiCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_CATALOG_BASE}/categories`, getFetchOptionsWithTimeout());
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        const withFullSlug = data.map((c: any) => ({
          ...c,
          full_slug: c.full_slug || computeCategoryFullPath(c.id, data)
        }));
        if (typeof window !== 'undefined') {
          localStorage.setItem('erp_categories', JSON.stringify(withFullSlug));
        }
        return withFullSlug.sort((a: any, b: any) => (a.sort_order || 99) - (b.sort_order || 99));
      }
    }
  } catch (e) {
    console.error('Error fetching live categories:', e);
  }
  return getLocalCategories();
}

export async function saveCategoryToApi(category: Category): Promise<boolean> {
  try {
    const res = await fetch(`${API_CATALOG_BASE}/categories`, {
      method: 'POST',
      headers: getErpHeaders(),
      body: JSON.stringify(category)
    });
    return res.ok;
  } catch (e) {
    console.error('Failed to save category via API:', e);
    return false;
  }
}

export async function deleteApiCategory(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_CATALOG_BASE}/categories/${id}`, {
      method: 'DELETE',
      headers: getErpHeaders()
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

export function getLocalProducts(): Product[] {
  if (typeof window === 'undefined') return INITIAL_PRODUCTS;
  const data = localStorage.getItem('erp_products');
  if (data) {
    try { return JSON.parse(data); } catch (e) {}
  }
  return INITIAL_PRODUCTS;
}

export function saveLocalProducts(products: Product[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('erp_products', JSON.stringify(products));
  }
}

export async function fetchApiProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_CATALOG_BASE}/products`, getFetchOptionsWithTimeout());

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        const formatted: Product[] = data.map((p: any) => {
          let rawImages = p.images;
          if (typeof rawImages === 'string') {
            try { rawImages = JSON.parse(rawImages); } catch (e) { rawImages = []; }
          }
          if (!Array.isArray(rawImages) || rawImages.length === 0) {
            rawImages = p.image ? [p.image] : [];
          }

          let rawVariants = p.storage_variants || p.variants;
          if (typeof rawVariants === 'string') {
            try { rawVariants = JSON.parse(rawVariants); } catch (e) { rawVariants = []; }
          }

          let rawVideos = p.videos;
          if (typeof rawVideos === 'string') {
            try { rawVideos = JSON.parse(rawVideos); } catch (e) { rawVideos = []; }
          }

          let rawAttrs = p.attributes;
          if (typeof rawAttrs === 'string') {
            try { rawAttrs = JSON.parse(rawAttrs); } catch (e) { rawAttrs = {}; }
          }

          return {
            ...p,
            id: p.id,
            name: p.name || p.model_name || '',
            model_name: p.model_name || p.name || '',
            brand: p.brand || '',
            brand_id: p.brand_id || undefined,
            cash_price: typeof p.cash_price === 'number' ? p.cash_price : parseFloat(p.cash_price) || 0,
            old_price: p.old_price ? (typeof p.old_price === 'number' ? p.old_price : parseFloat(p.old_price) || undefined) : undefined,
            cost_price: p.cost_price ? (typeof p.cost_price === 'number' ? p.cost_price : parseFloat(p.cost_price) || undefined) : undefined,
            discount_price: p.discount_price ? (typeof p.discount_price === 'number' ? p.discount_price : parseFloat(p.discount_price) || undefined) : undefined,
            stock: p.stock || 0,
            category_id: p.category_id || undefined,
            category_name: p.category_name || undefined,
            image: rawImages[0] || p.image || '',
            images: Array.isArray(rawImages) ? rawImages : (p.image ? [p.image] : []),
            storage_variants: Array.isArray(rawVariants) ? rawVariants : [],
            videos: Array.isArray(rawVideos) ? rawVideos : [],
            badge: p.badge || undefined,
            badge_color: p.badge_color || undefined,
            new_badge_until: p.new_badge_until || undefined,
            campaign: p.campaign || undefined,
            slug: p.slug || undefined,
            is_active: p.is_active ?? true,
            is_new: p.is_new ?? false,
            is_online_only: p.is_online_only ?? false,
            discount: p.discount || undefined,
            attributes: rawAttrs || {},
            created_at: p.created_at || new Date().toISOString()
          };
        });

        if (typeof window !== 'undefined') {
          localStorage.setItem('erp_products', JSON.stringify(formatted));
        }
        return formatted;
      }
    }
  } catch (e) {
    console.error('Failed to fetch products from backend API:', e);
  }
  return getLocalProducts();
}

export async function deleteApiProduct(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_CATALOG_BASE}/products/${id}`, {
      method: 'DELETE',
      headers: getErpHeaders()
    });
    return res.ok;
  } catch (e) {
    console.error('Failed to delete product via backend API:', e);
    return false;
  }
}

export async function saveProductToApi(product: Product): Promise<boolean> {
  try {
    const res = await fetch(`${API_CATALOG_BASE}/products`, {
      method: 'POST',
      headers: getErpHeaders(),
      body: JSON.stringify(product)
    });
    return res.ok;
  } catch (e) {
    console.error('Failed to save product to backend API:', e);
    return false;
  }
}

export async function uploadImageToStorageApi(base64: string, folder = 'products'): Promise<string> {
  if (!base64 || typeof base64 !== 'string') return base64;
  if (base64.startsWith('http://') || base64.startsWith('https://')) return base64;
  try {
    const res = await fetch(`${API_CATALOG_BASE}/upload-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64, folder }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.url) return data.url;
    }
  } catch (e) {
    console.error('Failed to upload image to storage API:', e);
  }
  return base64;
}

export async function updateProductStockApi(id: string, stock: number): Promise<boolean> {
  try {
    const res = await fetch(`${API_CATALOG_BASE}/products/${id}/stock`, {
      method: 'PATCH',
      headers: getErpHeaders(),
      body: JSON.stringify({ stock }),
    });
    return res.ok;
  } catch (e) {
    console.error('Failed to update product stock via API:', e);
    return false;
  }
}

export function getLocalBrands(): Brand[] {
  if (typeof window === 'undefined') return INITIAL_BRANDS;
  const data = localStorage.getItem('erp_brands');
  if (data) {
    try { return JSON.parse(data); } catch (e) {}
  }
  return INITIAL_BRANDS;
}

export function saveLocalBrands(brands: Brand[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('erp_brands', JSON.stringify(brands));
    brands.forEach(b => {
      fetch(`${API_CATALOG_BASE}/brands`, {
        method: 'POST',
        headers: getErpHeaders(),
        body: JSON.stringify(b)
      }).catch(() => {});
    });
  }
}

export async function saveBrandToApi(brand: Brand): Promise<boolean> {
  try {
    const res = await fetch(`${API_CATALOG_BASE}/brands`, {
      method: 'POST',
      headers: getErpHeaders(),
      body: JSON.stringify(brand)
    });
    return res.ok;
  } catch (e) {
    console.error('Failed to save brand via API:', e);
    return false;
  }
}

export interface BannerItem {
  id: string | number;
  title: string;
  subtitle?: string;
  image: string;
  position: 'hero_slide_1' | 'hero_slide_2' | 'mobile_top' | 'bottom_promo' | 'search_banner';
  positionLabel: string;
  dimensions: string;
  ratio: string;
  link?: string;
  active: boolean;
}

export const INITIAL_BANNERS: BannerItem[] = [];

export function getLocalBanners(): BannerItem[] {
  if (typeof window === 'undefined') return INITIAL_BANNERS;
  const data = localStorage.getItem('techno_erp_banners');
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {}
  }
  return INITIAL_BANNERS;
}

export async function fetchApiBanners(): Promise<BannerItem[]> {
  try {
    const res = await fetch(`${API_CATALOG_BASE}/banners`, getFetchOptionsWithTimeout());
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('techno_erp_banners', JSON.stringify(data));
        }
        return data;
      }
    }
  } catch (e) {}
  return getLocalBanners();
}

export async function saveBannerToApi(banner: BannerItem): Promise<boolean> {
  try {
    const res = await fetch(`${API_CATALOG_BASE}/banners`, {
      method: 'POST',
      headers: getErpHeaders(),
      body: JSON.stringify(banner)
    });
    if (res.ok) {
      const current = getLocalBanners();
      const updated = [banner, ...current.filter(b => b.id !== banner.id)];
      saveLocalBanners(updated);
      return true;
    }
  } catch (e) {
    console.error('Failed to save banner via API:', e);
  }
  return false;
}

export function saveLocalBanners(banners: BannerItem[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('techno_erp_banners', JSON.stringify(banners));
    window.dispatchEvent(new Event('techno_banners_updated'));
  }
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  created_at?: string;
}

export function getLocalMedia(): MediaItem[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('techno_erp_media');
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {}
  }
  return [];
}

export function saveLocalMedia(items: MediaItem[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('techno_erp_media', JSON.stringify(items));
    window.dispatchEvent(new Event('techno_media_updated'));
  }
}

export async function fetchApiMedia(): Promise<MediaItem[]> {
  try {
    const res = await fetch(`${API_CATALOG_BASE}/media`, FETCH_NO_CACHE_OPTIONS);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('techno_erp_media', JSON.stringify(data));
        }
        return data;
      }
    }
  } catch (e) {
    console.error('Failed to fetch media gallery from API:', e);
  }
  return getLocalMedia();
}

export async function saveMediaToApi(item: { name?: string; url: string }): Promise<MediaItem | null> {
  try {
    const res = await fetch(`${API_CATALOG_BASE}/media`, {
      method: 'POST',
      headers: getErpHeaders(),
      body: JSON.stringify(item),
    });
    if (res.ok) {
      const saved = await res.json();
      const current = getLocalMedia();
      const updated = [saved, ...current.filter(m => m.id !== saved.id)];
      saveLocalMedia(updated);
      return saved;
    }
  } catch (e) {
    console.error('Failed to save media to API:', e);
  }
  return null;
}

export async function deleteMediaFromApi(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_CATALOG_BASE}/media/${id}`, {
      method: 'DELETE',
      headers: getErpHeaders()
    });
    if (res.ok) {
      const current = getLocalMedia();
      saveLocalMedia(current.filter(m => m.id !== id));
      return true;
    }
  } catch (e) {
    console.error('Failed to delete media from API:', e);
  }
  return false;
}

export function getLocalDrafts(): ProductDraft[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('techno_product_drafts');
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {}
  }
  return [];
}

export function saveLocalDraft(draft: ProductDraft) {
  if (typeof window !== 'undefined') {
    const current = getLocalDrafts();
    const updated = [draft, ...current.filter(d => d.id !== draft.id)];
    localStorage.setItem('techno_product_drafts', JSON.stringify(updated));
    window.dispatchEvent(new Event('techno_drafts_updated'));
  }
}

export function deleteLocalDraft(id: string) {
  if (typeof window !== 'undefined') {
    const current = getLocalDrafts();
    const updated = current.filter(d => d.id !== id);
    localStorage.setItem('techno_product_drafts', JSON.stringify(updated));
    window.dispatchEvent(new Event('techno_drafts_updated'));
  }
}
