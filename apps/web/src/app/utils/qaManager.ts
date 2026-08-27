'use client';

export interface ProductQuestion {
  id: string;
  product_id: string;
  product_name: string;
  author_name: string;
  author_email?: string;
  question: string;
  answer?: string;
  answered_by?: string;
  created_at: string;
  answered_at?: string;
}

export const API_FAQS_BASE = typeof window !== 'undefined'
  ? '/api/catalog/faqs'
  : (process.env.INTERNAL_BACKEND_URL || 'http://127.0.0.1:4000/api/catalog') + '/faqs';

export async function fetchQuestionsApi(): Promise<ProductQuestion[]> {
  try {
    const res = await fetch(API_FAQS_BASE, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('technomania_product_faqs', JSON.stringify(data));
        }
        return data;
      }
    }
  } catch (e) {}
  return getLocalQuestions();
}

export function getLocalQuestions(): ProductQuestion[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem('technomania_product_faqs');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}

export function saveLocalQuestions(questions: ProductQuestion[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('technomania_product_faqs', JSON.stringify(questions));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('techno_faqs_updated'));

    fetch(API_FAQS_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(questions),
    }).catch(e => console.error('Failed to sync FAQs with backend API:', e));
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
      (String(q.product_id || '') === target || String(q.product_name || '') === target) &&
      Boolean(q.answer && q.answer.trim().length > 0)
    );
  } catch (e) {
    return [];
  }
}
