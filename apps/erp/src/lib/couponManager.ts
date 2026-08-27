'use client';

export interface PromoCoupon {
  id: string;
  code: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  usageCount: number;
  maxUsage?: number;
  startDate?: string;
  endDate?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

const DEFAULT_COUPONS: PromoCoupon[] = [];

export const API_COUPONS_BASE = typeof window !== 'undefined'
  ? '/api/catalog/coupons'
  : (process.env.INTERNAL_BACKEND_URL || 'http://127.0.0.1:4000/api/catalog') + '/coupons';

export async function fetchCouponsApi(): Promise<PromoCoupon[]> {
  try {
    const res = await fetch(API_COUPONS_BASE, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('technomania_promo_coupons', JSON.stringify(data));
        }
        return data;
      }
    }
  } catch (e) {}
  return getLocalCoupons();
}

export function getLocalCoupons(): PromoCoupon[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem('technomania_promo_coupons');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}

export function saveLocalCoupons(coupons: PromoCoupon[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('technomania_promo_coupons', JSON.stringify(coupons));
    window.dispatchEvent(new Event('techno_coupons_updated'));
    window.dispatchEvent(new Event('storage'));

    fetch(API_COUPONS_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(coupons),
    }).catch(e => console.error('Failed to sync coupons with backend API:', e));
  } catch (e) {}
}
