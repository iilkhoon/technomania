'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Flame, Clock, ShoppingCart, ChevronRight, Sparkles, ArrowLeft } from '../components/HeroIconsHub';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { Product, toSlug } from '../data/products';
import { getLiveProducts } from '../data/products';

export interface WeeklyOfferItem {
  id: string;
  product_name: string;
  brand: string;
  image: string;
  original_price: number;
  deal_price: number;
  taksit?: string;
  active?: boolean;
}

export default function WeeklyOffersPage() {
  const router = useRouter();
  const [weeklyItems, setWeeklyItems] = useState<WeeklyOfferItem[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [dealEndDate, setDealEndDate] = useState<string>('2026-08-25T23:59');
  const [dealTitle, setDealTitle] = useState<string>('Həftənin təklifləri');
  const [timeLeft, setTimeLeft] = useState({ days: 3, hours: 14, minutes: 22, seconds: 45 });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [cart, setCart] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [comparedProducts, setComparedProducts] = useState<string[]>([]);

  useEffect(() => {
    const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('technomania_theme') : null;
    if (savedTheme === 'dark') setIsDarkMode(true);

    try {
      const savedCart = localStorage.getItem('technomania_cart');
      if (savedCart) setCart(JSON.parse(savedCart));
      const savedFavs = localStorage.getItem('technomania_favorites');
      if (savedFavs) setFavorites(JSON.parse(savedFavs));
      const savedComp = localStorage.getItem('technomania_compare');
      if (savedComp) setComparedProducts(JSON.parse(savedComp));
    } catch (e) {}

    const loadData = async () => {
      let prods = getLiveProducts() || [];
      try {
        const res = await fetch('/api/catalog/products', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) prods = data;
        }
      } catch (e) {}
      setAllProducts(prods);

      try {
        const res = await fetch('/api/catalog/settings', { cache: 'no-store' });
        if (res.ok) {
          const settings = await res.json();
          if (settings?.weekly_offers) {
            const wo = settings.weekly_offers;
            if (Array.isArray(wo.items)) setWeeklyItems(wo.items);
            if (wo.end_date) setDealEndDate(wo.end_date);
            if (wo.title) setDealTitle(wo.title);
          }
        }
      } catch (e) {}
    };

    loadData();
  }, []);

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => {
      const next = prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId];
      localStorage.setItem('technomania_favorites', JSON.stringify(next));
      window.dispatchEvent(new Event('techno_fav_updated'));
      return next;
    });
  };

  const toggleCart = (prod: Product) => {
    setCart(prev => {
      const exists = prev.some(p => p.id === prod.id);
      const next = exists ? prev.filter(p => p.id !== prod.id) : [...prev, prod];
      localStorage.setItem('technomania_cart', JSON.stringify(next));
      window.dispatchEvent(new Event('techno_cart_updated'));
      return next;
    });
  };

  const toggleCompare = (productId: string) => {
    setComparedProducts(prev => {
      const next = prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId];
      localStorage.setItem('technomania_compare', JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    const target = new Date(dealEndDate).getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = Math.max(0, target - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [dealEndDate]);

  const resolvedProducts: Product[] = weeklyItems.map(item => {
    const matched = allProducts.find(p => p.id === item.id);
    const dealPriceStr = item.deal_price.toFixed(2) + ' ₼';
    const origPriceStr = item.original_price.toFixed(2) + ' ₼';

    if (matched) {
      return {
        ...matched,
        cash_price: dealPriceStr,
        old_price: origPriceStr,
        rawPrice: item.deal_price,
        badge: item.taksit || '0% taksit',
      };
    }

    return {
      id: item.id,
      model_name: item.product_name,
      brand: item.brand,
      category: 'Həftənin təklifi',
      image: item.image,
      cash_price: dealPriceStr,
      old_price: origPriceStr,
      rawPrice: item.deal_price,
      discount: '',
      credit_tag: item.taksit || '0% 12 ay',
      monthly: (item.deal_price / 12).toFixed(1) + ' ₼/ay',
      badge: item.taksit || '0% taksit',
      colors: [],
    };
  });

  return (
    <div className={`min-h-screen transition-colors ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <Header isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-[#4f533b] transition">Ana Səhifə</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 dark:text-white font-bold">{dealTitle}</span>
        </div>

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600 via-rose-600 to-rose-700 p-6 sm:p-10 text-white shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black tracking-wider ">
                <Flame className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                Məhdud Sayda Təkliflər
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight">{dealTitle}</h1>
              <p className="text-white/80 text-xs sm:text-sm font-medium">
                Seçilmiş məhsullara xüsusi endirimlər və faizsiz hissə-hissə ödəniş imkanı. Tələsin, kampaniya müddəti məhduddur!
              </p>
            </div>

            <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-2xl text-xs font-bold self-start md:self-auto shadow-inner">
              <Clock className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
              <span>{timeLeft.days} gün</span>
              <span className="text-white/40">•</span>
              <span>{String(timeLeft.hours).padStart(2, '0')}saat</span>
              <span className="text-white/40">•</span>
              <span>{String(timeLeft.minutes).padStart(2, '0')}dəq</span>
              <span className="text-white/40">•</span>
              <span>{String(timeLeft.seconds).padStart(2, '0')}san</span>
            </div>
          </div>
        </div>

        {resolvedProducts.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <h3 className="text-lg font-bold">Hələ Həftəlik Təklif Əlavə Edilməyib</h3>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {resolvedProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onToggleFavorite={() => toggleFavorite(product.id)}
                onToggleCart={() => toggleCart(product)}
                onToggleCompare={() => toggleCompare(product.id)}
                onSelectProduct={(p) => router.push(`/product/${toSlug(p.model_name)}`)}
                isFav={favorites.includes(product.id)}
                isInCart={cart.some(p => p.id === product.id)}
                isCompared={comparedProducts.includes(product.id)}
                isDarkMode={isDarkMode}
              />
            ))}
          </div>
        )}
      </main>

      <Footer isDarkMode={isDarkMode} />
    </div>
  );
}
