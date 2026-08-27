export interface StoreBranch {
  id: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
  mapEmbedUrl?: string;
  googleMapsUrl?: string;
  image?: string;
  isMain?: boolean;
  status: 'active' | 'inactive';
}

export const INITIAL_STORES: StoreBranch[] = [];

export const API_STORES_BASE = typeof window !== 'undefined'
  ? '/api/catalog/stores'
  : (process.env.INTERNAL_BACKEND_URL || 'http://127.0.0.1:4000/api/catalog') + '/stores';

export async function fetchStoreBranchesApi(): Promise<StoreBranch[]> {
  try {
    const res = await fetch(API_STORES_BASE, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('technomania_stores', JSON.stringify(data));
        }
        return data;
      }
    }
  } catch (e) {}
  return getStoreBranches();
}

export function getStoreBranches(): StoreBranch[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem('technomania_stores');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {}
  return [];
}

export function saveStoreBranches(stores: StoreBranch[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('technomania_stores', JSON.stringify(stores));
    window.dispatchEvent(new Event('techno_stores_updated'));
    window.dispatchEvent(new Event('storage'));
    
    fetch(API_STORES_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stores),
    }).catch(e => console.error('Failed to sync stores with backend API:', e));
  } catch (e) {
    console.error('Failed to save store branches:', e);
  }
}
