'use client';

export interface ProductReview {
  id: string;
  product_id: string;
  product_name: string;
  user_name: string;
  user_email: string;
  rating: number; // 1 to 5
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export const INITIAL_DEFAULT_REVIEWS: ProductReview[] = [];

export const API_REVIEWS_BASE = typeof window !== 'undefined'
  ? '/api/catalog/reviews'
  : (process.env.INTERNAL_BACKEND_URL || 'http://127.0.0.1:4000/api/catalog') + '/reviews';

export async function fetchReviewsApi(): Promise<ProductReview[]> {
  try {
    const res = await fetch(API_REVIEWS_BASE, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('technomania_product_reviews', JSON.stringify(data));
        }
        return data;
      }
    }
  } catch (e) {}
  return getLocalReviews();
}

export function getLocalReviews(): ProductReview[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem('technomania_product_reviews');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
    return [];
  } catch (e) {
    return [];
  }
}

export function saveLocalReviews(reviews: ProductReview[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('technomania_product_reviews', JSON.stringify(reviews));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('techno_reviews_updated'));

    fetch(API_REVIEWS_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviews),
    }).catch(e => console.error('Failed to sync reviews with backend API:', e));
  } catch (e) {}
}

export function getProductApprovedReviews(productIdOrName: string): ProductReview[] {
  if (!productIdOrName) return [];
  try {
    const all = getLocalReviews();
    if (!Array.isArray(all)) return [];
    const target = String(productIdOrName);
    return all.filter(r =>
      r &&
      (String(r.product_id || '') === target || String(r.product_name || '') === target) &&
      r.status === 'approved'
    );
  } catch (e) {
    return [];
  }
}

export function calculateProductRatingStats(productIdOrName: string) {
  if (!productIdOrName) return { avgRating: 5.0, reviewCount: 0, reviews: [] };
  try {
    const approved = getProductApprovedReviews(productIdOrName);
    if (!approved || approved.length === 0) {
      return { avgRating: 5.0, reviewCount: 0, reviews: [] };
    }
    const sum = approved.reduce((acc, r) => acc + (r.rating || 5), 0);
    const avg = (sum / approved.length).toFixed(1);
    return {
      avgRating: parseFloat(avg) || 5.0,
      reviewCount: approved.length,
      reviews: approved
    };
  } catch (e) {
    return { avgRating: 5.0, reviewCount: 0, reviews: [] };
  }
}

export interface ProductQuestion {
  id: string;
  product_id: string;
  product_name: string;
  user_name?: string;
  user_email?: string;
  author_name?: string;
  author_email?: string;
  question: string;
  answer?: string;
  answered_by?: string;
  answered_at?: string;
  status?: 'pending' | 'approved' | 'answered';
  created_at: string;
}

export function getLocalQuestions(): ProductQuestion[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem('technomania_product_questions');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
    return [];
  } catch (e) {
    return [];
  }
}

export function saveLocalQuestions(questions: ProductQuestion[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('technomania_product_questions', JSON.stringify(questions));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('techno_questions_updated'));
  } catch (e) {}
}

export function getProductAnsweredQuestions(productIdOrName: string): ProductQuestion[] {
  if (!productIdOrName) return [];
  try {
    const all = getLocalQuestions();
    if (!Array.isArray(all)) return [];
    const target = String(productIdOrName);
    return all.filter(q =>
      q &&
      (String(q.product_id || '') === target || String(q.product_name || '') === target)
    );
  } catch (e) {
    return [];
  }
}
