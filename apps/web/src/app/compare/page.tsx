'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Scale,
  Trash2,
  Plus,
  ArrowRight,
  ShoppingCart,
  Check,
  X,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  Layers,
  Package,
} from '../components/HeroIconsHub';
import { Product, getLiveProducts, toSlug, getDetailedSpecs } from '../data/products';
import { translations, Language } from '../data/translations';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function ComparePage() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>('AZ');
  const t = translations[currentLang] || translations.AZ;

  const [comparedIds, setComparedIds] = useState<string[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>(() => getLiveProducts());
  const [onlyDifferences, setOnlyDifferences] = useState(false);
  const [cart, setCart] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCompareData = () => {
    try {
      const savedCompare = localStorage.getItem('technomania_compare');
      if (savedCompare) {
        const parsed = JSON.parse(savedCompare);
        if (Array.isArray(parsed)) {
          // Normalize ids to strings
          const normalized = parsed.map((item: any) => typeof item === 'object' && item?.id ? String(item.id) : String(item));
          setComparedIds(normalized);
        }
      } else {
        setComparedIds([]);
      }
    } catch (e) {
      setComparedIds([]);
    }

    try {
      const savedCart = localStorage.getItem('technomania_cart');
      if (savedCart) setCart(JSON.parse(savedCart));
    } catch (e) {}
  };

  // Fetch live products from backend to ensure all dynamic ERP products are available
  useEffect(() => {
    const savedLang = (localStorage.getItem('technomania_lang') as Language) || 'AZ';
    if (savedLang && (savedLang === 'AZ' || savedLang === 'EN' || savedLang === 'RU')) {
      setCurrentLang(savedLang);
    }

    const savedDark = localStorage.getItem('technomania_dark') === 'true';
    setIsDarkMode(savedDark);
    if (savedDark) {
      document.documentElement.classList.add('dark');
    }

    loadCompareData();

    // Fetch dynamic live products
    fetch('/api/catalog/products', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: Product[] = data.map((p: any) => ({
            id: String(p.id),
            model_name: p.name || p.model_name || '',
            brand: p.brand || p.brand_name || '',
            cash_price: typeof p.cash_price === 'number' ? `${p.cash_price.toLocaleString()} ₼` : String(p.cash_price || '0 ₼'),
            old_price: p.old_price ? (typeof p.old_price === 'number' ? `${p.old_price.toLocaleString()} ₼` : String(p.old_price)) : '',
            discount: p.discount || '',
            credit_tag: p.credit_tag || '0₼ 12 ay',
            monthly: p.monthly || `${Math.round((Number(p.cash_price) || 0) / 12)} ₼`,
            badge: p.badge || (p.is_new ? 'Yeni' : ''),
            image: p.image || p.image_url || (Array.isArray(p.images) && p.images[0] ? p.images[0] : ''),
            images: p.images || [],
            colors: p.colors || [],
            category: p.category_name || p.category || '',
            rawPrice: Number(p.cash_price) || 0,
            stock: p.stock || 0,
            attributes: p.attributes || {},
            specs: p.specs || [],
            description: p.description || '',
          }));

          const combined = [...mapped];
          getLiveProducts().forEach(sp => {
            if (!combined.some(cp => String(cp.id) === String(sp.id))) {
              combined.push(sp);
            }
          });
          setAllProducts(combined);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    window.addEventListener('storage', loadCompareData);
    window.addEventListener('techno_compare_updated', loadCompareData);
    return () => {
      window.removeEventListener('storage', loadCompareData);
      window.removeEventListener('techno_compare_updated', loadCompareData);
    };
  }, []);

  const handleLangChange = (lang: Language) => {
    setCurrentLang(lang);
    localStorage.setItem('technomania_lang', lang);
  };

  const saveCompareState = (ids: string[]) => {
    setComparedIds(ids);
    localStorage.setItem('technomania_compare', JSON.stringify(ids));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('techno_compare_updated'));
  };

  const removeProduct = (id: string) => {
    const next = comparedIds.filter(item => String(item) !== String(id));
    saveCompareState(next);
  };

  const clearAll = () => {
    saveCompareState([]);
  };

  const addToCart = (product: Product) => {
    const nextCart = [...cart, product];
    setCart(nextCart);
    localStorage.setItem('technomania_cart', JSON.stringify(nextCart));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('techno_cart_updated'));
    window.dispatchEvent(new CustomEvent('techno_toast', {
      detail: {
        type: 'cart',
        title: product.model_name,
        subtitle: 'Səbətə əlavə olundu!',
      }
    }));
  };

  // Find all matched products
  const comparedProducts = useMemo(() => {
    return comparedIds
      .map(id => allProducts.find(p => String(p.id) === String(id) || toSlug(p.model_name || p.id) === String(id)))
      .filter((p): p is Product => p !== undefined);
  }, [comparedIds, allProducts]);

  // ═══ CATEGORY GROUPING LOGIC ═══
  const categoriesWithProducts = useMemo(() => {
    const map = new Map<string, Product[]>();
    comparedProducts.forEach(prod => {
      const cat = prod.category?.trim() || 'Ümumi';
      if (!map.has(cat)) {
        map.set(cat, []);
      }
      map.get(cat)!.push(prod);
    });
    return Array.from(map.entries()).map(([name, items]) => ({
      name,
      items,
      count: items.length,
    }));
  }, [comparedProducts]);

  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('');

  // Auto-sync selected category
  useEffect(() => {
    if (categoriesWithProducts.length > 0) {
      if (!selectedCategoryName || !categoriesWithProducts.some(c => c.name === selectedCategoryName)) {
        setSelectedCategoryName(categoriesWithProducts[0].name);
      }
    } else {
      setSelectedCategoryName('');
    }
  }, [categoriesWithProducts, selectedCategoryName]);

  // Filter products for active selected category
  const activeCategoryProducts = useMemo(() => {
    if (!selectedCategoryName) return comparedProducts;
    const found = categoriesWithProducts.find(c => c.name === selectedCategoryName);
    return found ? found.items : comparedProducts;
  }, [categoriesWithProducts, selectedCategoryName, comparedProducts]);

  // Group specs for side-by-side comparison for active category products
  const specMap = useMemo(() => {
    const map = new Map<string, Record<string, string>>();
    activeCategoryProducts.forEach(prod => {
      const specs = getDetailedSpecs(prod);
      specs.forEach(s => {
        if (!map.has(s.label)) {
          map.set(s.label, {});
        }
        map.get(s.label)![prod.id] = s.value;
      });
    });
    return map;
  }, [activeCategoryProducts]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-[#0B0F17] text-slate-100 dark' : 'bg-[#F8FAFC] text-slate-900'} flex flex-col`}>
      <Header
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        currentLang={currentLang}
        setCurrentLang={handleLangChange}
      />

      {/* ═══ CLEAN MODERN HEADER BAR ═══ */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <div className={`rounded-3xl p-5 sm:p-6 border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          isDarkMode
            ? 'bg-slate-900 border-slate-800 text-white'
            : 'bg-white border-slate-200 text-slate-900 shadow-sm'
        }`}>
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#4f533b]/10 dark:bg-stone-800 flex items-center justify-center text-[#4f533b] dark:text-[#a3a886] border border-[#4f533b]/20">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg sm:text-xl font-black tracking-tight">
                  Məhsul Müqayisəsi
                </h1>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#4f533b]/10 dark:bg-[#4f533b]/30 text-[#4f533b] dark:text-[#a3a886] border border-[#4f533b]/20 font-mono">
                  {comparedProducts.length} məhsul
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Seçilmiş məhsulların kateqoriya üzrə qiymət və texniki göstəricilərinin yan-yana müqayisəsi
              </p>
            </div>
          </div>

          {comparedProducts.length > 0 && (
            <div className="flex items-center gap-2.5 flex-wrap">
              {activeCategoryProducts.length >= 2 && (
                <button
                  type="button"
                  onClick={() => setOnlyDifferences(!onlyDifferences)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer border shadow-xs ${
                    onlyDifferences
                      ? 'bg-[#4f533b] text-white border-[#4f533b]'
                      : isDarkMode
                      ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>{onlyDifferences ? 'Bütün Göstəricilər' : 'Yalnız Fərqli Göstəricilər'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={clearAll}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer border border-rose-200 dark:border-rose-900/60 shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Siyahını Təmizlə</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {comparedProducts.length === 0 ? (
          /* ═══ EMPTY COMPARISON STATE ═══ */
          <div className={`rounded-3xl border p-8 sm:p-14 text-center max-w-lg mx-auto my-8 transition-colors ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
          }`}>
            <div className="w-16 h-16 rounded-3xl bg-[#4f533b]/10 dark:bg-stone-800 flex items-center justify-center mx-auto mb-4 text-[#4f533b] dark:text-[#a3a886] border border-[#4f533b]/20">
              <Scale className="w-8 h-8" />
            </div>

            <h3 className="text-lg sm:text-xl font-black mb-2">Müqayisə Siyahınız Boşdur</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Məhsulları xüsusiyyətlərinə görə müqayisə etmək üçün kataloqdan məhsul kartlarının üzərindəki tərəzi (<Scale className="w-3.5 h-3.5 inline text-[#4f533b] mx-0.5" />) ikonuna klikləyin.
            </p>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#4f533b] hover:bg-[#3e4230] text-white font-bold text-xs sm:text-sm transition shadow-lg shadow-[#4f533b]/25 active:scale-95"
            >
              <span>Məhsul Kataloquna Keç</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* ═══ CATEGORY TABS SELECTOR ═══ */}
            {categoriesWithProducts.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-hide py-1.5 px-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-xs">
                <span className="text-xs font-bold text-slate-400 px-2 flex items-center gap-1 shrink-0">
                  <Layers className="w-3.5 h-3.5 text-[#4f533b]" />
                  <span>Kateqoriya seçin:</span>
                </span>
                <div className="flex items-center gap-2">
                  {categoriesWithProducts.map(cat => {
                    const isSelected = selectedCategoryName === cat.name;
                    return (
                      <button
                        key={cat.name}
                        onClick={() => setSelectedCategoryName(cat.name)}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 border whitespace-nowrap ${
                          isSelected
                            ? 'bg-[#4f533b] text-white border-[#4f533b] shadow-md shadow-[#4f533b]/20 scale-105'
                            : isDarkMode
                            ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span>{cat.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                          isSelected ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}>
                          {cat.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {activeCategoryProducts.length === 1 ? (
              /* ═══ 1 PRODUCT IN ACTIVE CATEGORY ═══ */
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 flex-shrink-0 text-amber-600" />
                    <span>"{selectedCategoryName}" kateqoriyasında 1 məhsul var. Müqayisə etmək üçün bu kateqoriyadan ən azı daha 1 məhsul əlavə edin.</span>
                  </div>
                  <Link
                    href="/"
                    className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition flex items-center gap-1 flex-shrink-0"
                  >
                    <span>Məhsul Əlavə Et</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {/* Added Product Card */}
                  {activeCategoryProducts.map(prod => (
                    <div
                      key={prod.id}
                      className={`rounded-3xl border p-5 relative flex flex-col justify-between transition-all ${
                        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => removeProduct(prod.id)}
                        className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                        title="Müqayisədən çıxart"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      <div>
                        <div className="w-full h-48 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-800">
                          {prod.image ? (
                            <img src={prod.image} alt={prod.model_name} className="max-h-40 max-w-full object-contain" />
                          ) : (
                            <Package className="w-12 h-12 text-slate-300" />
                          )}
                        </div>

                        <span className="text-[10px] font-black uppercase tracking-wider text-[#4f533b] dark:text-[#a3a886] bg-[#4f533b]/10 dark:bg-stone-800 px-2.5 py-0.5 rounded-full inline-block mb-1.5">
                          {prod.brand || 'Orijinal'}
                        </span>

                        <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-2 mb-2">
                          {prod.model_name}
                        </h4>

                        <div className="text-lg font-black text-[#4f533b] dark:text-[#a3a886] mb-4">
                          {prod.cash_price}
                        </div>

                        {/* Quick Specs preview */}
                        <div className="space-y-1.5 mb-5 text-xs">
                          {getDetailedSpecs(prod).slice(0, 4).map((s, i) => (
                            <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                              <span className="text-slate-400 font-medium">{s.label}</span>
                              <span className="font-bold">{s.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => addToCart(prod)}
                        className="w-full py-3 rounded-2xl bg-[#4f533b] hover:bg-[#3e4230] text-white font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#4f533b]/20"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>Səbətə At</span>
                      </button>
                    </div>
                  ))}

                  {/* Slot to Add 2nd Product in this category */}
                  <Link
                    href="/"
                    className={`rounded-3xl border-2 border-dashed p-8 flex flex-col items-center justify-center text-center group cursor-pointer transition min-h-[380px] ${
                      isDarkMode
                        ? 'border-slate-800 hover:border-[#4f533b] bg-slate-900/40 hover:bg-slate-900'
                        : 'border-slate-300 hover:border-[#4f533b] bg-slate-50/60 hover:bg-[#f8faf7]'
                    }`}
                  >
                    <div className="w-16 h-16 rounded-3xl bg-[#4f533b]/10 text-[#4f533b] dark:text-[#a3a886] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Plus className="w-8 h-8" />
                    </div>
                    <h4 className="font-black text-base text-slate-800 dark:text-slate-200 mb-1.5">
                      "{selectedCategoryName}" Kateqoriyasından 2-ci Məhsulu Seçin
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed mb-4">
                      Kataloqdan eyni kateqoriyalı digər modeli seçərək tərəzi ikonuna vurun və tam texniki fərqləri görün.
                    </p>
                    <span className="px-4 py-2 rounded-xl bg-[#4f533b] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs">
                      <span>Kataloqa Keç</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </Link>
                </div>
              </div>
            ) : (
              /* ═══ FULL COMPARISON TABLE FOR SELECTED CATEGORY (2+ PRODUCTS) ═══ */
              <div className={`rounded-3xl border overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="overflow-x-auto scrollbar-thin">
                  <table className="w-full text-left border-collapse min-w-[720px]">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
                        <th className="p-5 w-64 font-bold text-xs tracking-wider text-slate-400 align-bottom">
                          <span className="block font-black text-slate-900 dark:text-white text-sm mb-1">
                            {selectedCategoryName}
                          </span>
                          Məhsul & Parametrlər
                        </th>
                        {activeCategoryProducts.map(prod => (
                          <th key={prod.id} className="p-5 w-72 sm:w-80 align-top relative border-l border-slate-200 dark:border-slate-800">
                            <button
                              type="button"
                              onClick={() => removeProduct(prod.id)}
                              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                              title="Sil"
                            >
                              <X className="w-4 h-4" />
                            </button>

                            <div className="flex flex-col items-center text-center">
                              <Link href={`/product/${toSlug(prod.model_name || prod.id)}`} className="w-36 h-36 p-2 flex items-center justify-center mb-3 group">
                                {prod.image ? (
                                  <img
                                    src={prod.image}
                                    alt={prod.model_name}
                                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                                  />
                                ) : (
                                  <Package className="w-12 h-12 text-slate-300" />
                                )}
                              </Link>

                              <span className="text-[10px] font-black uppercase text-[#4f533b] dark:text-[#a3a886] mb-1">
                                {prod.brand || 'Orijinal'}
                              </span>

                              <Link
                                href={`/product/${toSlug(prod.model_name || prod.id)}`}
                                className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-2 hover:text-[#4f533b] transition mb-2"
                              >
                                {prod.model_name}
                              </Link>

                              <div className="text-base sm:text-lg font-black text-[#4f533b] dark:text-[#a3a886] mb-3">
                                {prod.cash_price}
                              </div>

                              <button
                                type="button"
                                onClick={() => addToCart(prod)}
                                className="w-full py-2.5 rounded-xl bg-[#4f533b] hover:bg-[#3e4230] text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95"
                              >
                                <ShoppingCart className="w-3.5 h-3.5" />
                                <span>Səbətə At</span>
                              </button>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                      {/* Price row */}
                      <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="p-4 font-bold text-slate-500 dark:text-slate-400 bg-slate-50/40 dark:bg-slate-900/40">
                          Nağd Qiymət
                        </td>
                        {activeCategoryProducts.map(prod => (
                          <td key={prod.id} className="p-4 font-black text-[#4f533b] dark:text-[#a3a886] text-sm border-l border-slate-100 dark:border-slate-800">
                            {prod.cash_price}
                          </td>
                        ))}
                      </tr>

                      {/* Monthly credit payment */}
                      <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="p-4 font-bold text-slate-500 dark:text-slate-400 bg-slate-50/40 dark:bg-slate-900/40">
                          Aylıq Hissəli Ödəniş
                        </td>
                        {activeCategoryProducts.map(prod => (
                          <td key={prod.id} className="p-4 font-bold text-slate-700 dark:text-slate-300 border-l border-slate-100 dark:border-slate-800">
                            {prod.monthly || 'Kredit var'}
                          </td>
                        ))}
                      </tr>

                      {/* Stock availability */}
                      <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="p-4 font-bold text-slate-500 dark:text-slate-400 bg-slate-50/40 dark:bg-slate-900/40">
                          Stok Mövcudluğu
                        </td>
                        {activeCategoryProducts.map(prod => (
                          <td key={prod.id} className="p-4 font-bold border-l border-slate-100 dark:border-slate-800">
                            <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                              <Check className="w-3.5 h-3.5" />
                              <span>Mövcuddur</span>
                            </span>
                          </td>
                        ))}
                      </tr>

                      {/* Dynamic Detailed Technical Specs */}
                      {Array.from(specMap.entries()).map(([label, valMap]) => {
                        const values = activeCategoryProducts.map(p => valMap[p.id] || '-');
                        const isDiff = values.some(v => v !== values[0]);

                        if (onlyDifferences && !isDiff) {
                          return null; // Skip non-differing specs when filter is active
                        }

                        return (
                          <tr key={label} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 ${isDiff ? 'bg-amber-500/5' : ''}`}>
                            <td className="p-4 font-bold text-slate-600 dark:text-slate-300 bg-slate-50/40 dark:bg-slate-900/40">
                              {label}
                            </td>
                            {activeCategoryProducts.map(prod => {
                              const val = valMap[prod.id] || '-';
                              return (
                                <td
                                  key={prod.id}
                                  className={`p-4 border-l border-slate-100 dark:border-slate-800 font-medium ${
                                    isDiff ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'
                                  }`}
                                >
                                  {val}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer isDarkMode={isDarkMode} />
    </div>
  );
}
