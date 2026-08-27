'use client';

export interface AnalyticsData {
  productViews: Record<string, { count: number; name: string }>;
  categoryViews: Record<string, { count: number; name: string }>;
  orders: Array<{
    id: string;
    customerName: string;
    customerPhone: string;
    totalAmount: number;
    paymentMethod: 'cash' | 'credit';
    status: 'İcrada' | 'Çatdırıldı' | 'Gözləyir';
    createdAt: string;
    items: Array<{ id: string; name: string; price: number; quantity: number }>;
  }>;
}

const STORAGE_KEY = 'technomania_real_analytics';

export function getAnalyticsData(): AnalyticsData {
  if (typeof window === 'undefined') {
    return { productViews: {}, categoryViews: {}, orders: [] };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {}

  return { productViews: {}, categoryViews: {}, orders: [] };
}

export function saveAnalyticsData(data: AnalyticsData) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {}
}

export function trackProductView(productId: string, productName: string) {
  if (!productId || typeof window === 'undefined') return;
  try {
    const data = getAnalyticsData();
    if (!data || typeof data !== 'object') return;
    if (!data.productViews || typeof data.productViews !== 'object') {
      data.productViews = {};
    }
    const pid = String(productId);
    const current = data.productViews[pid] || { count: 0, name: String(productName || '') };
    data.productViews[pid] = {
      count: (current.count || 0) + 1,
      name: String(productName || current.name || '')
    };
    saveAnalyticsData(data);
  } catch (e) {}
}

export function trackCategoryView(categoryId: string, categoryName: string) {
  if (!categoryId || typeof window === 'undefined') return;
  try {
    const data = getAnalyticsData();
    if (!data || typeof data !== 'object') return;
    if (!data.categoryViews || typeof data.categoryViews !== 'object') {
      data.categoryViews = {};
    }
    const cid = String(categoryId);
    const current = data.categoryViews[cid] || { count: 0, name: String(categoryName || '') };
    data.categoryViews[cid] = {
      count: (current.count || 0) + 1,
      name: String(categoryName || current.name || '')
    };
    saveAnalyticsData(data);
  } catch (e) {}
}

export function recordNewOrder(order: {
  id: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  paymentMethod: 'cash' | 'credit';
  items: Array<{ id: string; name: string; price: number; quantity: number }>;
}) {
  if (typeof window === 'undefined') return;
  const data = getAnalyticsData();
  const newOrder = {
    ...order,
    status: 'İcrada' as const,
    createdAt: new Date().toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' }) + ' bügün'
  };
  data.orders.unshift(newOrder);
  saveAnalyticsData(data);

  // Sync to technomania_orders for legacy compatibility
  try {
    localStorage.setItem('technomania_orders', JSON.stringify(data.orders));
  } catch (e) {}
}
