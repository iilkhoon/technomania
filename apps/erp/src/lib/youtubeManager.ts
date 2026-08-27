export interface YouTubeVideo {
  id: string;
  title: string;
  youtube_url: string;
  video_id: string;
  thumbnail_url?: string;
  duration?: string;
  views_count?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export const DEFAULT_YOUTUBE_VIDEOS: YouTubeVideo[] = [
  {
    id: 'yt-1',
    title: 'iPhone 16 Pro Max və Galaxy S24 Ultra — Hansı Flaqmanı Seçməli? (Ətraflı İcmal)',
    youtube_url: 'https://www.youtube.com/watch?v=kYJv8ZlX-qE',
    video_id: 'kYJv8ZlX-qE',
    thumbnail_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
    duration: '14:35',
    views_count: '42.8K baxış',
    is_active: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 'yt-2',
    title: 'MacBook Pro M3 Max vs Asus ROG Strix — Qeyminq və Render Güc Testi',
    youtube_url: 'https://www.youtube.com/watch?v=0oAeqjK9d70',
    video_id: '0oAeqjK9d70',
    thumbnail_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    duration: '19:12',
    views_count: '31.5K baxış',
    is_active: true,
    sort_order: 2,
    created_at: new Date().toISOString(),
  },
  {
    id: 'yt-3',
    title: '2026-cı İlin Ən Yaxşı Büdcəli Smartfonları — Top 5 Ən Sərfəli Model',
    youtube_url: 'https://www.youtube.com/watch?v=3gV_F8tK3dE',
    video_id: '3gV_F8tK3dE',
    thumbnail_url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80',
    duration: '11:48',
    views_count: '58.2K baxış',
    is_active: true,
    sort_order: 3,
    created_at: new Date().toISOString(),
  },
];

export const DEFAULT_CHANNEL_URL = 'https://www.youtube.com/@technomania';

export const API_CATALOG_BASE = typeof window !== 'undefined'
  ? '/api/catalog'
  : (process.env.INTERNAL_BACKEND_URL || 'http://127.0.0.1:4000/api/catalog');

export function extractYouTubeId(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = trimmed.match(regExp);
  return match && match[1] ? match[1] : '';
}

export function getLocalYouTubeVideos(): YouTubeVideo[] {
  if (typeof window === 'undefined') return DEFAULT_YOUTUBE_VIDEOS;
  try {
    const raw = localStorage.getItem('techno_youtube_videos');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      }
    }
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_YOUTUBE_VIDEOS;
}

export function saveLocalYouTubeVideos(videos: YouTubeVideo[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('techno_youtube_videos', JSON.stringify(videos));
    window.dispatchEvent(new Event('techno_youtube_updated'));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.error(e);
  }
}

export async function fetchApiYouTubeVideos(): Promise<YouTubeVideo[]> {
  try {
    const res = await fetch(`${API_CATALOG_BASE}/videos`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        if (typeof window !== 'undefined') {
          try { localStorage.setItem('techno_youtube_videos', JSON.stringify(data)); } catch (e) {}
        }
        return data.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      }
    }
  } catch (e) {
    console.error('Failed to fetch youtube videos from API:', e);
  }
  return getLocalYouTubeVideos();
}

import { getErpHeaders } from './supabase';

export async function saveApiYouTubeVideos(videos: YouTubeVideo[]): Promise<void> {
  saveLocalYouTubeVideos(videos);
  try {
    const headers = getErpHeaders({ 'Content-Type': 'application/json' });
    let res = await fetch(`${API_CATALOG_BASE}/videos`, {
      method: 'POST',
      headers,
      body: JSON.stringify(videos)
    }).catch(() => null);

    if (!res || !res.ok) {
      await fetch('/api/catalog/videos', {
        method: 'POST',
        headers,
        body: JSON.stringify(videos)
      }).catch(() => null);
    }
  } catch (e) {
    console.error('Failed to save youtube videos to backend API:', e);
  }
}

export function getLocalChannelUrl(): string {
  if (typeof window === 'undefined') return DEFAULT_CHANNEL_URL;
  try {
    return localStorage.getItem('techno_youtube_channel_url') || DEFAULT_CHANNEL_URL;
  } catch {
    return DEFAULT_CHANNEL_URL;
  }
}

export function saveLocalChannelUrl(url: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('techno_youtube_channel_url', url || DEFAULT_CHANNEL_URL);
    window.dispatchEvent(new Event('techno_youtube_updated'));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.error(e);
  }
}
