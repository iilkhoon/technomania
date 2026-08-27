'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Heart, ShoppingCart, Trash2, Check, Zap, ChevronRight, Scale
} from '../components/HeroIconsHub';
import { getLiveProducts, toSlug, Product } from '../data/products';
import { translations, Language } from '../data/translations';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';

const ALL_PRODUCTS = getLiveProducts();

export default function WishlistPage() {
  const router = useRouter();
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [cart, setCart] = useState<Product[]>([]);
  const [comparedProducts, setComparedProducts] = useState<string[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>('AZ');

  const [creditModalProduct, setCreditModalProduct] = useState<Product | null>(null);
  const [creditSubmitted, setCreditSubmitted] = useState(false);
  const [creditForm, setCreditForm] = useState({ name: '', phone: '+994 ', months: '12' });

  const t = translations[currentLang] || translations.AZ;

  useEffect(() => {
    const savedLang = (localStorage.getItem('technomania_lang') as Language) || 'AZ';
    if (savedLang) setCurrentLang(savedLang);
    const savedDark = localStorage.getItem('technomania_dark') === 'true';
    setIsDarkMode(savedDark);
  }, []);

  const handleLangChange = (lang: Language) => {
    setCurrentLang(lang);
    localStorage.setItem('technomania_lang', lang);
  };

  useEffect(() => {
    const savedFavs = localStorage.getItem('technomania_favorites');
    if (savedFavs) {
      try { setFavoriteIds(JSON.parse(savedFavs)); } catch (e) {}
    } else {
      setFavoriteIds([]);
    }

    const savedCart = localStorage.getItem('technomania_cart');
    if (savedCart) {
      try { setCart(JSON.parse(savedCart)); } catch (e) {}
    }

    const savedCompare = localStorage.getItem('technomania_compare');
    if (savedCompare) {
      try { setComparedProducts(JSON.parse(savedCompare)); } catch (e) {}
    }
  }, []);

  const saveFavorites = (ids: string[]) => {
    setFavoriteIds(ids);
    localStorage.setItem('technomania_favorites', JSON.stringify(ids));
  };

  const removeFavorite = (id: string) => {
    const next = favoriteIds.filter(x => x !== id);
    saveFavorites(next);
  };

  const clearAllFavorites = () => {
    saveFavorites([]);
  };

  const toggleCart = (prod: Product) => {
    setCart(prev => {
      const exists = prev.find(c => c.id === prod.id);
      const next = exists ? prev.filter(c => c.id !== prod.id) : [...prev, prod];
      localStorage.setItem('technomania_cart', JSON.stringify(next));
      return next;
    });
  };

  const toggleCompare = (pId: string) => {
    setComparedProducts(prev => {
      const next = prev.includes(pId) ? prev.filter(id => id !== pId) : [...prev, pId];
      localStorage.setItem('technomania_compare', JSON.stringify(next));
      return next;
    });
  };

  const addAllToCart = () => {
    const favoriteProducts = ALL_PRODUCTS.filter(p => favoriteIds.includes(p.id));
    setCart(prev => {
      const newItems = favoriteProducts.filter(fp => !prev.some(c => c.id === fp.id));
      const next = [...prev, ...newItems];
      localStorage.setItem('technomania_cart', JSON.stringify(next));
      return next;
    });
  };

  const favoriteProducts = ALL_PRODUCTS.filter(p => favoriteIds.includes(p.id));

  const handleCreditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreditSubmitted(true);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-[#0B0F17] text-slate-100 dark' : 'bg-[#F8FAFC] text-slate-900'} flex flex-col`}>
      <Header
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        currentLang={currentLang}
        setCurrentLang={handleLangChange}
      />

      {/* ═══ CLEAN MINIMAL HEADER BAR ═══ */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <div className={`rounded-2xl p-4 sm:p-5 border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          isDarkMode
            ? 'bg-slate-900 border-slate-800 text-white'
            : 'bg-white border-slate-200 text-slate-900 shadow-2xs'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-500 border border-rose-100 dark:border-rose-900/40">
              <Heart className="w-5 h-5 fill-rose-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight">
                  {t.wishlistTitle}
                </h1>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {favoriteProducts.length} məhsul
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.wishlistDesc}
              </p>
            </div>
          </div>

          {favoriteProducts.length > 0 && (
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={addAllToCart}
                className="flex items-center gap-2 bg-[#4f533b] hover:bg-[#3e4230] text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
              >
                <ShoppingCart className="w-3.5 h-3.5" /> {t.addAllToCart}
              </button>

              <button
                onClick={clearAllFavorites}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer border border-rose-200 dark:border-rose-900/60"
              >
                <Trash2 className="w-3.5 h-3.5" /> Siyahını Təmizlə
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {favoriteProducts.length === 0 ? (
          /* ═══ MINIMAL CLEAN EMPTY STATE ═══ */
          <div className={`rounded-2xl border p-8 sm:p-12 text-center max-w-lg mx-auto my-8 transition-colors ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-2xs'
          }`}>
            <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-900/40 flex items-center justify-center mx-auto mb-4 text-rose-500">
              <Heart className="w-8 h-8 fill-rose-500" />
            </div>

            <h3 className="text-lg font-bold mb-2">Bəyənilən Məhsul Yoxdur</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Sevdiyiniz məhsulları yadda saxlamaq üçün kataloqda məhsul kartlarının üzərindəki ürək ikonuna (❤️) sıxaraq bəyəndiyiniz məhsulları əlavə edin.
            </p>

            <button
              onClick={() => router.push('/')}
              className="bg-[#4f533b] hover:bg-[#3e4230] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition flex items-center justify-center gap-2 mx-auto cursor-pointer"
            >
              Kataloqa Keçid Et <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* ═══ WISHLIST GRID WITH PRODUCT CARDS ═══ */
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 items-stretch">
            {favoriteProducts.map(prod => (
              <ProductCard
                key={prod.id}
                product={prod}
                onToggleFavorite={() => removeFavorite(prod.id)}
                onToggleCart={toggleCart}
                onToggleCompare={toggleCompare}
                onSelectProduct={(p) => router.push(`/product/${toSlug(p.model_name)}`)}
                onCreditClick={(p) => { setCreditModalProduct(p); setCreditSubmitted(false); }}
                isFav={true}
                isInCart={!!cart.find(c => c.id === prod.id)}
                isCompared={comparedProducts.includes(prod.id)}
                isDarkMode={isDarkMode}
              />
            ))}
          </div>
        )}
      </div>

      {/* CREDIT MODAL */}
      {creditModalProduct && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          onClick={() => setCreditModalProduct(null)}
        >
          <div
            className={`rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border ${isDarkMode ? 'bg-[#0F1623] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-[#4f533b] to-[#3e4230] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-black text-lg">Hissə-hissə Ödəniş Müraciəti</h3>
                <p className="text-xs text-emerald-100">{creditModalProduct.model_name}</p>
              </div>
              <button onClick={() => setCreditModalProduct(null)} className="text-white/70 hover:text-white transition cursor-pointer">
                ✕
              </button>
            </div>

            {!creditSubmitted ? (
              <form onSubmit={handleCreditSubmit} className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-bold mb-1 block">Ad Və Soyadınız</label>
                  <input
                    required
                    value={creditForm.name}
                    onChange={e => setCreditForm({ ...creditForm, name: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2.5 text-xs outline-none focus:border-[#4f533b] ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                    placeholder="Məs: Əli Əliyev"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold mb-1 block">Mobil Telefon</label>
                  <input
                    required
                    value={creditForm.phone}
                    onChange={e => setCreditForm({ ...creditForm, phone: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2.5 text-xs outline-none focus:border-[#4f533b] ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold mb-1 block">Kredit Müddəti</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['6', '12', '18', '24'].map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setCreditForm({ ...creditForm, months: m })}
                        className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                          creditForm.months === m
                            ? 'bg-[#4f533b] text-white shadow-xs'
                            : isDarkMode ? 'bg-slate-900 text-slate-300' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {m} ay
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#4f533b] hover:bg-[#3e4230] text-white font-black py-3 rounded-xl shadow-lg transition text-xs cursor-pointer mt-2"
                >
                  Müraciəti Təsdiqlə →
                </button>
              </form>
            ) : (
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-[#f4f5f0] dark:bg-stone-900 flex items-center justify-center mx-auto mb-3 text-[#4f533b]">
                  <Check className="w-8 h-8" />
                </div>
                <h4 className="font-black text-lg">Müraciətiniz Qəbul Edildi!</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Mütəxəssisimiz 5 dəqiqə ərzində sizinlə əlaqə saxlayacaq.</p>
                <button
                  onClick={() => { setCreditModalProduct(null); setCreditSubmitted(false); }}
                  className="mt-5 bg-[#4f533b] text-white text-xs font-extrabold px-6 py-2.5 rounded-xl transition cursor-pointer"
                >
                  Bağla
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <Footer isDarkMode={isDarkMode} />
    </div>
  );
}
