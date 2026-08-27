'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Newspaper,
  Calendar,
  Clock,
  ArrowRight,
  User,
  Mail,
  CheckCircle,
  Send,
} from './HeroIconsHub';

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image?: string;
  author_name: string;
  author_role?: string;
  author_avatar?: string;
  published_at?: string;
  is_published?: boolean;
  views_count?: number;
  sort_order?: number;
}

interface NewsSectionProps {
  isDarkMode?: boolean;
}

function formatNewsDate(d?: string): string {
  if (!d) return '21.04.2026';
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return '21.04.2026';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  } catch {
    return '21.04.2026';
  }
}

export default function NewsSection({ isDarkMode = false }: NewsSectionProps) {
  const router = useRouter();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const loadNews = () => {
    fetch('/api/catalog/news', {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          const published = data.filter((a: any) => a.is_published !== false);
          setArticles(published);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadNews();
    window.addEventListener('techno_news_updated', loadNews);
    return () => {
      window.removeEventListener('techno_news_updated', loadNews);
    };
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!clean || !clean.includes('@')) {
      setSubscribeStatus('error');
      setStatusMessage('Zəhmət olmasa düzgün email ünvanı daxil edin');
      return;
    }

    setIsSubscribing(true);
    setSubscribeStatus('idle');

    try {
      const res = await fetch('/api/catalog/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: clean })
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        setSubscribeStatus('success');
        setStatusMessage('Təşəkkür edirik! Yeniliklərə abunə oldunuz.');
        setEmail('');
      } else {
        setSubscribeStatus('error');
        setStatusMessage(data.error || 'Abunəlik zamanı xəta baş verdi');
      }
    } catch (err) {
      setSubscribeStatus('error');
      setStatusMessage('Serverlə əlaqə qurulmadı');
    } finally {
      setIsSubscribing(false);
    }
  };

  if (articles.length === 0) {
    return null;
  }

  return (
    <section className="w-full max-w-[1560px] mx-auto px-3 sm:px-5 lg:px-6 my-8 sm:my-12">
      {/* ═══ SECTION HEADER — Simple & Clean ═══ */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 tracking-wider mb-1">
            <Newspaper className="w-3.5 h-3.5" />
            <span>Xəbərlər və Bloq</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Ən son texnologiya xəbərləri
          </h2>
        </div>
      </div>

      {/* ═══ 4 ARTICLES IN 1 ROW GRID ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-6">
        {articles.slice(0, 4).map((art) => {
          const dateStr = formatNewsDate(art.published_at);

          return (
            <div
              key={art.id}
              onClick={() => router.push(`/news/${art.slug}`)}
              className={`group cursor-pointer rounded-2xl border transition-all duration-200 hover:shadow-md flex flex-col justify-between overflow-hidden ${
                isDarkMode
                  ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Image */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                {art.image ? (
                  <img
                    src={art.image}
                    alt={art.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400">
                    <Newspaper className="w-8 h-8" />
                  </div>
                )}

                {/* Date formatted as DD.MM.YYYY */}
                <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-300" />
                  <span>{dateStr}</span>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-2.5">
                <div className="space-y-1.5">
                  <h3 className="font-bold text-sm leading-snug line-clamp-2 text-slate-900 dark:text-white group-hover:text-[#4f533b] dark:group-hover:text-amber-300 transition-colors min-h-[2.5rem]">
                    {art.title}
                  </h3>

                  {art.excerpt && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {art.excerpt}
                    </p>
                  )}
                </div>

                {/* Author & Read More Button */}
                <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                    {art.author_name}
                  </span>

                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#4f533b] dark:text-amber-300">
                    <span>Oxu</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══ NEWSLETTER SUBSCRIPTION — Clean & Simple Design ═══ */}
      <div className={`mt-8 rounded-2xl p-5 sm:p-6 border transition-colors ${
        isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center justify-center md:justify-start gap-2">
              <Mail className="w-4 h-4 text-[#4f533b] dark:text-amber-300" />
              <span>Yeniliklərdən xəbərdar olun</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Email ünvanınızı daxil edərək ən son endirim və kampaniyalardan ilk siz xəbərdar olun.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full md:w-auto flex flex-col sm:flex-row gap-2 max-w-md">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email ünvanınız..."
              required
              className="px-3.5 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-[#4f533b] dark:focus:border-amber-300 text-slate-800 dark:text-slate-200 min-w-[240px]"
            />
            <button
              type="submit"
              disabled={isSubscribing}
              className="px-4 py-2 bg-[#4f533b] hover:bg-[#3e4230] text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 flex-shrink-0 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubscribing ? 'Yazılır...' : 'Abunə ol'}</span>
            </button>
          </form>
        </div>

        {statusMessage && (
          <div className={`mt-3 text-xs font-medium p-2.5 rounded-xl flex items-center gap-2 ${
            subscribeStatus === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
          }`}>
            <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}
      </div>
    </section>
  );
}
