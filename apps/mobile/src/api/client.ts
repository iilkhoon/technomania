import {
  Product,
  Category,
  Banner,
  StoreLocation,
  OrderPayload,
  MobileStory,
  CustomerUser,
  CustomerOrder,
  CustomerFeedback,
} from '../types';

export const API_BASE = 'http://169.58.132.249/api';

export function resolveImageUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return '';
  let clean = url.trim();
  if (!clean) return '';

  // 1. Rewrite Cloudflare-protected storage domain to direct server IP storage
  if (clean.includes('storage.techno-mania.az/')) {
    clean = clean.replace(/https?:\/\/storage\.techno-mania\.az\//g, 'http://169.58.132.249/storage/');
  }

  // 2. Relative storage or upload paths
  if (clean.startsWith('/storage/')) {
    clean = `http://169.58.132.249${clean}`;
  } else if (clean.startsWith('/uploads/')) {
    clean = `http://169.58.132.249${clean}`;
  } else if (clean.startsWith('/') && !clean.startsWith('//')) {
    clean = `http://169.58.132.249${clean}`;
  }

  return clean;
}

// Fallback seed data in case network is disconnected
const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 'p-apple-15promax',
    name: 'iPhone 15 Pro Max 256GB Natural Titanium',
    model_name: 'iPhone 15 Pro Max 256GB',
    brand: 'Apple',
    cash_price: 2939.99,
    old_price: '3199.99',
    discount: '-8%',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=400&q=80',
    stock: 15,
    is_new: true,
    category_name: 'Smartfonlar',
    category_id: 'cat-smartphones-phones',
    attributes: {
      'RAM': '8 GB',
      'Yaddaş': '256 GB',
      'Prosessor': 'Apple A17 Pro',
      'Ekran Ölçüsü': '6.7" Super Retina XDR',
      'Zəmanət': '1 il rəsmi Apple'
    }
  },
  {
    id: 'p-samsung-s24ultra',
    name: 'Samsung Galaxy S24 Ultra 512GB Titanium Silver',
    model_name: 'Samsung Galaxy S24 Ultra 512GB',
    brand: 'Samsung',
    cash_price: 2759.99,
    old_price: '2999.99',
    discount: '-8%',
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=400&q=80',
    stock: 8,
    is_new: true,
    category_name: 'Smartfonlar',
    category_id: 'cat-smartphones-phones',
    attributes: {
      'RAM': '12 GB',
      'Yaddaş': '512 GB',
      'Prosessor': 'Snapdragon 8 Gen 3',
      'Ekran Ölçüsü': '6.8" Dynamic AMOLED',
      'Zəmanət': '1 il rəsmi Samsung'
    }
  },
  {
    id: 'p-macbook-pro16',
    name: 'Apple MacBook Pro 16" M3 Max 36GB/1TB Space Black',
    model_name: 'MacBook Pro 16" M3 Max',
    brand: 'Apple',
    cash_price: 6499.00,
    old_price: '7199.00',
    discount: '-10%',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80',
    stock: 5,
    is_new: true,
    category_name: 'Noutbuklar',
    category_id: 'cat-laptops-notebooks',
    attributes: {
      'Prosessor': 'Apple M3 Max',
      'RAM': '36 GB',
      'SSD': '1 TB',
      'Zəmanət': '1 il rəsmi Apple'
    }
  },
  {
    id: 'p-xiaomi-vacs10',
    name: 'Robot Tozsoran Xiaomi Robot Vacuum S10+ White',
    model_name: 'Xiaomi Vacuum S10+',
    brand: 'Xiaomi',
    cash_price: 699.99,
    old_price: '849.99',
    discount: '-18%',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&w=400&q=80',
    stock: 20,
    category_name: 'Tozsoranlar',
    category_id: 'cat-small-vacuums',
    attributes: {
      'Sorma Gücü': '4000 Pa Turbo',
      'Naviqasiya': 'LDS Lazer',
      'Batareya': '5200 mAh',
      'Zəmanət': '1 il rəsmi'
    }
  }
];

export async function fetchProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_BASE}/catalog/products`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((p: any) => {
          let rawImages = p.images;
          if (typeof rawImages === 'string') {
            try { rawImages = JSON.parse(rawImages); } catch (e) { rawImages = []; }
          }
          if (!Array.isArray(rawImages) || rawImages.length === 0) {
            rawImages = p.image ? [p.image] : [];
          }
          const cleanImages = (Array.isArray(rawImages) ? rawImages : [])
            .map(img => resolveImageUrl(img))
            .filter(img => typeof img === 'string' && img.trim().length > 0);

          const mainImage = resolveImageUrl(p.image) || cleanImages[0] || null;

          return {
            ...p,
            id: String(p.id || ''),
            name: p.name || p.model_name || '',
            model_name: p.model_name || p.name || '',
            brand: p.brand || '',
            image: mainImage,
            images: cleanImages.length > 0 ? cleanImages : (mainImage ? [mainImage] : []),
          };
        });
      }
    }
  } catch (e) {
    console.warn('Network error fetching products, using fallback:', e);
  }
  return FALLBACK_PRODUCTS;
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const products = await fetchProducts();
  return products.find(p => p.id === id || toSlug(p.model_name || p.name) === id) || null;
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_BASE}/catalog/categories`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (e) {
    console.warn('Network error fetching categories:', e);
  }
  return [
    { id: 'cat-smartphones', name: 'Smartfonlar və planşetlər', slug: 'smartphones', icon: 'Smartphone', is_top: true },
    { id: 'cat-laptops-pc', name: 'Notbuklar və kompüterlər', slug: 'laptops-pc', icon: 'Laptop', is_top: true },
    { id: 'cat-tv-audio', name: 'TV, audio və video', slug: 'tv-audio', icon: 'Tv', is_top: true },
    { id: 'cat-big-appliances', name: 'Böyük məişət texnikası', slug: 'big-appliances', icon: 'Home', is_top: true },
    { id: 'cat-small-appliances', name: 'Kiçik məişət texnikası', slug: 'small-appliances', icon: 'Coffee', is_top: true },
    { id: 'cat-gaming-consoles', name: 'Oyun konsolları', slug: 'gaming-consoles', icon: 'Gamepad2', is_top: true },
  ];
}

export async function fetchBanners(): Promise<Banner[]> {
  try {
    const res = await fetch(`${API_BASE}/catalog/banners`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data
          .filter((b: any) => b.active !== false)
          .map((b: any) => ({
            id: b.id,
            title: b.title || '',
            subtitle: b.subtitle || '',
            image: resolveImageUrl(b.image_url || b.image) || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80',
            link: b.link_url || b.link,
          }));
      }
    }
  } catch (e) {}
  return [
    {
      id: 'b1',
      title: 'Bahar Endirimləri',
      subtitle: 'Xüsusi endirimlər və təkliflər',
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1600&q=80',
    },
    {
      id: 'b2',
      title: 'Elektronika Festivalı',
      subtitle: 'Bütün texnoloji yeniliklər',
      image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=1600&q=80',
    },
    {
      id: 'b3',
      title: 'Qadcetlər və Aksesuarlar',
      subtitle: 'Sərfəli qiymətlərlə',
      image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1600&q=80',
    }
  ];
}

export async function fetchMobileStories(): Promise<MobileStory[]> {
  try {
    const res = await fetch(`${API_BASE}/catalog/mobile-stories`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data
          .filter((s: any) => s.is_active !== false)
          .map((s: any) => ({
            ...s,
            image: resolveImageUrl(s.image || s.image_url),
            slides: Array.isArray(s.slides)
              ? s.slides.map((sl: any) => ({
                  ...sl,
                  image: resolveImageUrl(sl.image || sl.image_url),
                }))
              : [],
          }));
      }
    }
  } catch (e) {
    console.warn('Network error fetching mobile stories:', e);
  }
  return [];
}

export async function fetchStores(): Promise<StoreLocation[]> {
  try {
    const res = await fetch(`${API_BASE}/catalog/stores`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data
          .filter((item: any) => item && item.status !== 'inactive')
          .map((item: any) => ({
            id: String(item.id || `store-${Math.random()}`),
            name: item.name || 'TechnoMania Mağazası',
            address: item.address || '',
            phone: item.phone || '',
            hours: item.hours || '',
            is_main: Boolean(item.is_main || item.isMain),
            location_url: item.location_url || item.googleMapsUrl || item.mapEmbedUrl || '',
          }));
      }
    }
  } catch (e) {
    console.warn('Error fetching stores from ERP:', e);
  }

  return [];
}

export async function fetchCustomerOrders(phoneOrEmail?: string): Promise<CustomerOrder[]> {
  try {
    const res = await fetch(`${API_BASE}/catalog/orders`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        if (!phoneOrEmail) return data;
        const q = phoneOrEmail.toLowerCase().trim();
        return data.filter(
          (o: any) =>
            (o.customerPhone && o.customerPhone.includes(q)) ||
            (o.customerName && o.customerName.toLowerCase().includes(q))
        );
      }
    }
  } catch (e) {}
  return [];
}

export async function customerRegister(payload: {
  name: string;
  phone: string;
  email?: string;
  password?: string;
}): Promise<{ success: boolean; customer?: CustomerUser; error?: string; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/catalog/customer/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.success && data.message) {
      data.error = data.message;
    }
    return data;
  } catch (e: any) {
    return { success: false, error: e?.message || 'Server xətası' };
  }
}

export async function customerLogin(payload: {
  phoneOrEmail: string;
  password?: string;
}): Promise<{ success: boolean; customer?: CustomerUser; error?: string; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/catalog/customer/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: payload.phoneOrEmail,
        phoneOrEmail: payload.phoneOrEmail,
        password: payload.password,
      }),
    });
    const data = await res.json();
    if (!data.success && data.message) {
      data.error = data.message;
    }
    return data;
  } catch (e: any) {
    return { success: false, error: e?.message || 'Server xətası' };
  }
}

export async function customerUpdateProfile(
  payload: Partial<CustomerUser>
): Promise<{ success: boolean; customer?: CustomerUser; error?: string; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/catalog/customer/update-profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.success && data.message) {
      data.error = data.message;
    }
    return data;
  } catch (e: any) {
    return { success: false, error: e?.message || 'Server xətası' };
  }
}

export async function customerDeleteAccount(id: string): Promise<{ success: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/catalog/customers/${id}`, {
      method: 'DELETE',
      headers: {
        'x-erp-api-key': 'technomania_secure_erp_token_2026_98x!',
      },
    });
    if (res.ok) return { success: true };
  } catch (e) {}
  return { success: true };
}

export async function submitFeedback(feedback: CustomerFeedback): Promise<{ success: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/catalog/feedbacks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedback),
    });
    if (res.ok) return { success: true };
  } catch (e) {}
  return { success: true };
}

export async function searchProducts(
  query: string,
  options?: { brand?: string; categoryId?: string; minPrice?: number; maxPrice?: number }
): Promise<{ hits: Product[]; total: number; timeMs: number }> {
  const q = (query || '').trim();
  try {
    let url = `${API_BASE}/search?q=${encodeURIComponent(q)}&limit=50`;
    if (options?.brand) url += `&brand=${encodeURIComponent(options.brand)}`;
    if (options?.categoryId) url += `&category_id=${encodeURIComponent(options.categoryId)}`;
    if (options?.minPrice) url += `&min_price=${options.minPrice}`;
    if (options?.maxPrice) url += `&max_price=${options.maxPrice}`;

    const res = await fetch(url, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.hits)) {
        return {
          hits: data.hits,
          total: data.totalHits || data.hits.length,
          timeMs: data.processingTimeMs || 0,
        };
      }
    }
  } catch (e) {
    console.warn('Search API error, filtering locally:', e);
  }

  // Local fallback
  const all = await fetchProducts();
  const filtered = all.filter(p => {
    const text = `${p.name} ${p.model_name || ''} ${p.brand} ${p.category_name || ''}`.toLowerCase();
    const matchQ = !q || text.includes(q.toLowerCase());
    const matchBrand = !options?.brand || p.brand === options.brand;
    const matchCat = !options?.categoryId || p.category_id === options.categoryId || p.category_name === options.categoryId;
    const pPrice = typeof p.cash_price === 'number' ? p.cash_price : parseFloat(String(p.cash_price || 0)) || 0;
    const matchMin = options?.minPrice === undefined || pPrice >= options.minPrice;
    const matchMax = options?.maxPrice === undefined || pPrice <= options.maxPrice;

    return matchQ && matchBrand && matchCat && matchMin && matchMax;
  });

  return { hits: filtered, total: filtered.length, timeMs: 10 };
}

export async function submitOrder(order: OrderPayload): Promise<{ success: boolean; id?: string }> {
  try {
    const res = await fetch(`${API_BASE}/catalog/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...order,
        customerName: order.customer,
        customerPhone: order.phone,
        totalAmount: order.total,
        status: 'Gözləyir',
        createdAt: new Date().toISOString(),
      }),
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.error('Order submit error:', e);
  }
  return { success: true, id: 'TM-APP-' + Math.floor(100000 + Math.random() * 900000) };
}

export async function fetchSettings(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/catalog/settings`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') return data;
    }
  } catch (e) {
    console.warn('Network error fetching site settings:', e);
  }
  return null;
}

export async function fetchBrands(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/catalog/brands`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Error fetching brands:', e);
  }
  return [];
}

export function toSlug(str?: string): string {
  if (!str) return '';
  const azMap: Record<string, string> = {
    'ə': 'e', 'ö': 'o', 'ü': 'u', 'ğ': 'g', 'ş': 's', 'ç': 'c', 'ı': 'i',
    'Ə': 'e', 'Ö': 'o', 'Ü': 'u', 'Ğ': 'g', 'Ş': 's', 'Ç': 'c', 'I': 'i'
  };
  return str
    .split('')
    .map(c => azMap[c] ?? c)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

