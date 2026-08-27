'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  getLiveProducts,
  matchProductSearch,
  toSlug,
  Product,
  getProductAttributes
} from '../data/products';
import { translations, Language } from '../data/translations';
import MobileNavbar from '../components/MobileNavbar';
import BannerImageSlider from '../components/BannerImageSlider';
import DynamicFilterSidebar, { FilterState } from '../components/DynamicFilterSidebar';
import ProductCard from '../components/ProductCard';
import {
  Search, ShoppingCart, Heart, Scale, User, Filter,
  RotateCcw, SearchX, ChevronRight, TrendingUp, Sparkles,
  Truck, ArrowRight, Flame, ChevronDown,
} from '../components/HeroIconsHub';

import Header from '../components/Header';
import Footer from '../components/Footer';

export default function SearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q') || '';

  const [filterState, setFilterState] = useState<FilterState>({
    minPrice: 0,
    maxPrice: 10000,
    selectedBrands: [],
    selectedSpecs: {},
  });

  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc'>('popular');
  const [cart, setCart] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [comparedProducts, setComparedProducts] = useState<string[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>('AZ');
  const [seoExpanded, setSeoExpanded] = useState(false);
  const [searchBanners, setSearchBanners] = useState<any[]>([]);

  const t = translations[currentLang] || translations.AZ;

  useEffect(() => {
    const savedLang = (localStorage.getItem('technomania_lang') as Language) || 'AZ';
    if (savedLang) setCurrentLang(savedLang);
    const savedDark = localStorage.getItem('technomania_dark') === 'true';
    setIsDarkMode(savedDark);

    fetch('/api/catalog/banners', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          const matched = data.filter((b: any) => b && b.active !== false && (b.position === 'search_banner' || b.position === 'search') && (b.image || b.image_url));
          setSearchBanners(matched);
        }
      })
      .catch(() => {});
  }, []);

  const handleLangChange = (lang: Language) => {
    setCurrentLang(lang);
    localStorage.setItem('technomania_lang', lang);
  };

  const handleSearchSubmit = (newQuery: string) => {
    router.push(`/search?q=${encodeURIComponent(newQuery)}`);
  };

  const [remoteProducts, setRemoteProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    let isCancelled = false;
    const fetchSearch = async () => {
      if (!queryParam) {
        setRemoteProducts(null);
        return;
      }
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(queryParam)}&limit=100`, {
          cache: 'no-store',
        });
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.hits) && !isCancelled) {
            const mapped: Product[] = data.hits.map((h: any) => ({
              id: h.id,
              model_name: h.model_name || h.name,
              brand: h.brand,
              cash_price: h.cash_price ? `${Number(h.cash_price).toLocaleString()} ₼` : '0 ₼',
              old_price: h.old_price || '',
              discount: h.discount || '',
              credit_tag: '0₼ 12 ay',
              monthly: `${Math.round((Number(h.cash_price) || 0) / 12)} ₼`,
              badge: h.is_new ? 'Yeni' : '',
              image: h.image || '',
              colors: [],
              rawPrice: Number(h.cash_price) || 0,
              category: h.category_name,
              attributes: h.attributes || {},
              stock: h.stock || 0,
            }));
            setRemoteProducts(mapped);
            return;
          }
        }
      } catch (e) {}
      if (!isCancelled) setRemoteProducts(null);
    };

    fetchSearch();
    return () => { isCancelled = true; };
  }, [queryParam]);

  const allProducts = getLiveProducts();
  const searchedBaseProducts = remoteProducts !== null
    ? remoteProducts
    : allProducts.filter(prod => matchProductSearch(prod, queryParam));

  let filtered = searchedBaseProducts.filter(prod => {
    if (filterState.selectedBrands.length > 0) {
      const matchBrand = filterState.selectedBrands.some(b => String(prod?.brand || '').toLowerCase() === String(b || '').toLowerCase());
      if (!matchBrand) return false;
    }

    const attrs = getProductAttributes(prod);
    for (const [groupTitle, selectedVals] of Object.entries(filterState.selectedSpecs)) {
      if (selectedVals.length > 0) {
        const prodVal = attrs[groupTitle];
        if (!prodVal || !selectedVals.includes(prodVal)) {
          return false;
        }
      }
    }

    const price = prod.rawPrice || parseFloat(prod.cash_price.replace(/[^\d.]/g, '')) || 0;
    if (filterState.minPrice > 0 && price < filterState.minPrice) return false;
    if (filterState.maxPrice < 10000 && price > filterState.maxPrice) return false;

    return true;
  });

  if (sortBy === 'price-asc') {
    filtered = [...filtered].sort((a, b) => (a.rawPrice || 0) - (b.rawPrice || 0));
  } else if (sortBy === 'price-desc') {
    filtered = [...filtered].sort((a, b) => (b.rawPrice || 0) - (a.rawPrice || 0));
  }

  const resetFilters = () => {
    setFilterState({
      minPrice: 0,
      maxPrice: 10000,
      selectedBrands: [],
      selectedSpecs: {},
    });
    setSortBy('popular');
  };

  const removeBrandBadge = (bName: string) => {
    setFilterState(prev => ({
      ...prev,
      selectedBrands: prev.selectedBrands.filter(b => b !== bName),
    }));
  };

  const removeSpecBadge = (group: string, val: string) => {
    setFilterState(prev => {
      const groupVals = prev.selectedSpecs[group] || [];
      return {
        ...prev,
        selectedSpecs: {
          ...prev.selectedSpecs,
          [group]: groupVals.filter(v => v !== val),
        },
      };
    });
  };

  useEffect(() => {
    const savedCart = localStorage.getItem('technomania_cart');
    if (savedCart) {
      try { setCart(JSON.parse(savedCart)); } catch (e) {}
    }
  }, []);

  const toggleCart = (prod: Product) => {
    setCart(prev => {
      const updated = prev.find(p => p.id === prod.id) ? prev.filter(p => p.id !== prod.id) : [...prev, prod];
      localStorage.setItem('technomania_cart', JSON.stringify(updated));
      return updated;
    });
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('technomania_favorites', JSON.stringify(next));
      window.dispatchEvent(new Event('storage'));
      return next;
    });
  };

  const toggleCompare = (id: string) => {
    setComparedProducts(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('technomania_compare', JSON.stringify(next));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('techno_compare_updated'));
      return next;
    });
  };

  const hasActiveFilters =
    filterState.selectedBrands.length > 0 ||
    filterState.minPrice > 0 ||
    filterState.maxPrice < 10000 ||
    Object.values(filterState.selectedSpecs).some(arr => arr.length > 0);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100 dark' : 'bg-[#f8fafc] text-slate-900'} flex flex-col`}>
      <Header
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        currentLang={currentLang}
        setCurrentLang={handleLangChange}
      />

      <main className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex-1">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-400 mb-3 font-semibold">
          <Link href="/" className="hover:text-[#4f533b] transition">Əsas səhifə</Link>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <span className="text-[#4f533b] font-bold">Axtarış: "{queryParam}"</span>
        </div>

        {/* Dedicated Search Page Banner (Configured exclusively from ERP Banners with position "search_banner") */}
        {searchBanners.length > 0 && (
          <div className="mb-6 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs border border-slate-200/60 dark:border-slate-800 relative group">
            {searchBanners.map((sb, idx) => (
              <div
                key={sb.id || idx}
                onClick={() => {
                  if (sb.link) {
                    if (sb.link.startsWith('http')) window.open(sb.link, '_blank');
                    else router.push(sb.link);
                  }
                }}
                className={`w-full overflow-hidden ${sb.link ? 'cursor-pointer' : ''}`}
              >
                <img
                  src={sb.image || sb.image_url}
                  alt={sb.title || 'Axtarış Banneri'}
                  className="w-full h-auto max-h-[280px] object-cover transition-transform duration-500 group-hover:scale-101"
                />
              </div>
            ))}
          </div>
        )}

        {/* Header Bar + Sort Dropdown */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Axtarış nəticələri: <span className="text-[#4f533b]">"{queryParam}"</span>
            </h1>
            <span className="text-xs font-bold text-slate-400">({filtered.length})</span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className={`text-xs font-black px-4 py-2 rounded-xl border outline-none cursor-pointer transition ${
                isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800 shadow-2xs'
              }`}
            >
              <option value="popular">⇵ Çeşidləmə</option>
              <option value="price-asc">Qiymətə görə (ucuzdan bahaya)</option>
              <option value="price-desc">Qiymətə görə (bahadan ucuza)</option>
            </select>
          </div>
        </div>

        {/* Active Filter Badges Bar */}
        {hasActiveFilters && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <button
              onClick={resetFilters}
              className="text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3.5 py-1.5 rounded-full hover:bg-slate-300 transition cursor-pointer flex items-center gap-1.5"
            >
              Seçilənləri sil
            </button>

            {filterState.selectedBrands.map(b => (
              <span
                key={b}
                className="inline-flex items-center gap-1.5 text-xs font-bold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800 shadow-2xs"
              >
                Brend: {b}
                <button onClick={() => removeBrandBadge(b)} className="hover:text-[#4f533b] cursor-pointer text-slate-400">✕</button>
              </span>
            ))}

            {Object.entries(filterState.selectedSpecs).map(([group, vals]) =>
              vals.map(v => (
                <span
                  key={`${group}-${v}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800 shadow-2xs"
                >
                  {group}: {v}
                  <button onClick={() => removeSpecBadge(group, v)} className="hover:text-[#4f533b] cursor-pointer text-slate-400">✕</button>
                </span>
              ))
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          <div className="lg:col-span-3">
            <DynamicFilterSidebar
              products={searchedBaseProducts}
              filteredCount={filtered.length}
              categorySlug={queryParam}
              categoryName={queryParam ? `"${queryParam}"` : 'Məhsullar'}
              filterState={filterState}
              onFilterChange={setFilterState}
              onReset={resetFilters}
              isDarkMode={isDarkMode}
            />
          </div>

          <div className="lg:col-span-9">
            {filtered.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3.5 lg:gap-4 items-stretch">
                {filtered.map((prod, idx) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    priority={idx < 4}
                    onToggleFav={toggleFavorite}
                    onToggleCart={toggleCart}
                    onToggleCompare={toggleCompare}
                    onCreditClick={(p) => router.push(`/product/${toSlug(p.model_name)}`)}
                    onSelectProduct={(p) => router.push(`/product/${toSlug(p.model_name)}`)}
                    isFav={favorites.includes(prod.id)}
                    isInCart={!!cart.find(c => c.id === prod.id)}
                    isCompared={comparedProducts.includes(prod.id)}
                    isDarkMode={isDarkMode}
                  />
                ))}
              </div>
            ) : (
              <div className="py-20 px-6 text-center rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-sm">
                <div className="w-20 h-20 rounded-3xl bg-[#f4f5f0] dark:bg-stone-900 text-[#4f533b] flex items-center justify-center mx-auto mb-4 border border-[#4f533b]/20 shadow-inner">
                  <SearchX className="w-10 h-10" />
                </div>
                <h3 className="font-black text-xl sm:text-2xl text-slate-900 dark:text-white mb-2 tracking-tight">
                  Axtarışa uyğun nəticə tapılmadı!
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6 font-medium leading-relaxed">
                  Daxil etdiyiniz <strong className="text-slate-700 dark:text-slate-200">"{queryParam}"</strong> sorğusuna və ya filtrlərə uyğun heç bir məhsul tapılmadı. Sorğun dəqiqləşdirin və ya filtrləri sıfırlayın.
                </p>
                <button
                  onClick={resetFilters}
                  className="bg-[#4f533b] hover:bg-[#3e4230] text-white font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-lg shadow-[#4f533b]/25 transition cursor-pointer inline-flex items-center gap-2 active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" /> Filtrləri sıfırla və bütün məhsullara bax
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white mb-3">
            Axtarış nəticələri: sevdiyin keyfiyyət və zəmanət artıq evində
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Müasir texnologiyalar və məişət cihazları üzrə rəsmi zəmanətli məhsulları 24 ayadək hissə-hissə faizsiz taksitlə əldə edin. Bakı və bütün regionlar üzrə çatdırılma xidməti aktivdir.
          </p>

          {seoExpanded && (
            <div className="mt-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed space-y-2 animate-fadeIn">
              <p>
                Rəsmi zəmanət müddəti, faizsiz taksit kartları (Birbank, Tamkart, Bolkart), Bakı və regionlara sürətli pulsuz çatdırılma xidməti ilə alış-verişinizi rahatlıqla tamamlayın.
              </p>
            </div>
          )}

          <div className="mt-4 text-center">
            <button
              onClick={() => setSeoExpanded(!seoExpanded)}
              className="text-xs font-black text-slate-500 hover:text-slate-800 dark:hover:text-white bg-slate-100 dark:bg-slate-800 px-6 py-2 rounded-xl transition cursor-pointer inline-flex items-center gap-1.5"
            >
              <span>{seoExpanded ? 'Qatla' : 'Hamısını göstər'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${seoExpanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

      </main>

      {/* Footer */}
      <Footer isDarkMode={isDarkMode} />
    </div>
  );
}
