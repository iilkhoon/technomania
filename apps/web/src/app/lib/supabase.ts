export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  is_popular?: boolean;
  description?: string;
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  full_slug?: string;
  icon: string;
  icon_url?: string;
  description?: string;
  parent_id?: string | null;
  level?: 1 | 2 | 3;
  is_top?: boolean;
  sort_order?: number;
  created_at?: string;
  product_count?: number;
}

export interface ProductSpec {
  key: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  model_name?: string;
  brand: string;
  brand_id?: string;
  cash_price: number;
  old_price?: number;
  discount_price?: number;
  stock: number;
  category_id: string;
  category_name?: string;
  image: string;
  is_active: boolean;
  is_new?: boolean;
  is_online_only?: boolean;
  discount?: string;
  attributes: Record<string, string>;
  created_at?: string;
}

export const INITIAL_PRODUCTS: Product[] = [];
export const INITIAL_CATEGORIES: Category[] = [];
export const INITIAL_BRANDS: Brand[] = [];

let _categoriesCache: Category[] = [];
let _productsCache: Product[] = [];
let _brandsCache: Brand[] = [];

export function computeCategoryFullPath(catId: string, allCategories: Category[]): string {
  const cat = allCategories.find(c => c.id === catId);
  if (!cat) return '';
  if (!cat.parent_id) return cat.slug;
  const parentPath = computeCategoryFullPath(cat.parent_id, allCategories);
  return parentPath ? `${parentPath}/${cat.slug}` : cat.slug;
}

export function getLocalCategories(): Category[] {
  return _categoriesCache;
}

export function getLocalProducts(): Product[] {
  return _productsCache;
}

export function getLocalBrands(): Brand[] {
  return _brandsCache;
}

export const API_CATALOG_BASE = typeof window !== 'undefined'
  ? '/api/catalog'
  : (process.env.INTERNAL_BACKEND_URL || 'http://127.0.0.1:4000/api/catalog');

export const FAST_FETCH_OPTIONS: RequestInit = {
  cache: 'no-store',
  headers: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache'
  }
};

export async function fetchApiCategories(): Promise<Category[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(`${API_CATALOG_BASE}/categories`, {
      ...FAST_FETCH_OPTIONS,
      signal: controller.signal,
    }).catch(() => null);
    clearTimeout(timeoutId);

    if (res && res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        const withFullSlug = data.map((c: any) => ({
          ...c,
          full_slug: c.full_slug || computeCategoryFullPath(c.id, data)
        }));
        const sorted = withFullSlug.sort((a: any, b: any) => (a.sort_order || 99) - (b.sort_order || 99));
        _categoriesCache = sorted;
        return sorted;
      }
    }
  } catch (e) {
    console.error('Error fetching categories:', e);
  }
  return _categoriesCache;
}

export async function fetchApiProducts(): Promise<Product[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(`${API_CATALOG_BASE}/products`, {
      ...FAST_FETCH_OPTIONS,
      signal: controller.signal,
    }).catch(() => null);
    clearTimeout(timeoutId);

    if (res && res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        _productsCache = data;
        return data;
      }
    }
  } catch (e) {
    console.error('Error fetching products:', e);
  }
  return _productsCache;
}

export async function fetchApiBrands(): Promise<Brand[]> {
  try {
    const res = await fetch(`${API_CATALOG_BASE}/brands`, FAST_FETCH_OPTIONS).catch(() => null);
    if (res && res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        _brandsCache = data;
        return data;
      }
    }
  } catch (e) {
    console.error('Error fetching brands:', e);
  }
  return _brandsCache;
}
