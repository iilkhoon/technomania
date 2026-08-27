'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Calendar, Clock, Newspaper, ArrowRight, Sparkles } from '../components/HeroIconsHub';

export default function NewsIndexPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem('technomania_dark') === 'true';
    setIsDarkMode(isDark);

    fetch('/api/catalog/news', {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setArticles(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <Header isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#4f533b]/10 dark:bg-[#4f533b]/20 flex items-center justify-center text-[#4f533b]">
            <Newspaper className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Xəbərlər və Məqalələr</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Texnologiya dünyasından ən son yeniliklər və rəylər</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <Newspaper className="w-12 h-12 mx-auto text-slate-400 mb-3" />
            <h3 className="font-bold text-base text-slate-700 dark:text-slate-300">Hələ heç bir məqalə yoxdur</h3>
            <p className="text-xs text-slate-400 mt-1">Yaxın zamanda yeni məqalələr əlavə olunacaq.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((item, idx) => (
              <Link
                key={item.id || idx}
                href={`/news/${item.slug || item.id}`}
                className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {item.cover_image && (
                    <div className="h-48 overflow-hidden bg-slate-100 dark:bg-slate-900">
                      <img src={item.cover_image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-5 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{item.published_at ? new Date(item.published_at).toLocaleDateString('az-AZ') : 'Bugün'}</span>
                    </div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-[#4f533b] transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3">
                      {item.summary || item.content?.slice(0, 120)}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center justify-between text-xs font-bold text-[#4f533b]">
                  <span>Ətraflı oxu</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer isDarkMode={isDarkMode} />
    </div>
  );
}
