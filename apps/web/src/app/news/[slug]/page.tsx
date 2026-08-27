'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import {
  Calendar,
  Clock,
  ArrowLeft,
  Share2,
  User,
  Eye,
  CheckCircle,
  Newspaper,
} from '../../components/HeroIconsHub';

export default function NewsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem('technomania_dark') === 'true';
    setIsDarkMode(isDark);

    if (slug) {
      fetch(`/api/catalog/news/${slug}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
        .then(r => r.json())
        .then(data => {
          if (data && data.title) {
            setArticle(data);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [slug]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#f4f5f8] text-slate-900'}`}>
      <Header isDarkMode={isDarkMode} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Back button */}
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-500 hover:text-[#4f533b] dark:hover:text-amber-300 transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Ana səhifəyə qayıt</span>
        </button>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-3 border-[#4f533b] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400 font-bold">Xəbər yüklənir...</p>
          </div>
        ) : !article ? (
          <div className="py-20 text-center space-y-4">
            <Newspaper className="w-16 h-16 stroke-[1.5] text-slate-400 mx-auto" />
            <h2 className="text-xl font-bold">Xəbər tapılmadı</h2>
            <p className="text-xs text-slate-500">Axtardığınız məqalə silinmiş və ya mövcud deyil.</p>
          </div>
        ) : (
          <article className="space-y-8">
            {/* Header / Meta */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-400">
                <span className="bg-[#4f533b]/10 text-[#4f533b] dark:text-amber-300 px-3 py-1 rounded-full font-bold">
                  Texno Xəbər
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {article.published_at
                    ? new Date(article.published_at).toLocaleDateString('az-AZ', { day: 'numeric', month: 'long', year: 'numeric' })
                    : 'Bugün'}
                </span>
                {article.views_count !== undefined && (
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    {article.views_count} baxış
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-slate-900 dark:text-white">
                {article.title}
              </h1>

              {article.excerpt && (
                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  {article.excerpt}
                </p>
              )}

              {/* Author & Share Bar */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {article.author_avatar ? (
                    <img
                      src={article.author_avatar}
                      alt={article.author_name}
                      className="w-11 h-11 rounded-full object-cover border-2 border-[#4f533b]/30"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-[#4f533b]/15 text-[#4f533b] dark:text-amber-300 flex items-center justify-center font-bold">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {article.author_name || 'TechnoMania Redaksiya'}
                    </h4>
                    <span className="text-xs text-slate-400 font-medium">
                      {article.author_role || 'Texno İcmalçı'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{copied ? 'Link Kopyalandı!' : 'Paylaş'}</span>
                </button>
              </div>
            </div>

            {/* Featured Image */}
            {article.image && (
              <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 aspect-[16/9] w-full bg-slate-900">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content Body */}
            <div className={`prose max-w-none text-sm sm:text-base leading-relaxed space-y-4 ${
              isDarkMode ? 'text-slate-200' : 'text-slate-700'
            }`}>
              {article.content?.split('\n').map((paragraph: string, idx: number) => {
                if (!paragraph.trim()) return null;
                return <p key={idx}>{paragraph}</p>;
              })}
            </div>
          </article>
        )}
      </main>

      <Footer isDarkMode={isDarkMode} />
    </div>
  );
}
