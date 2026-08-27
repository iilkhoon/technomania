'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronRight, ChevronDown, ChevronUp, Filter, SlidersHorizontal,
  ArrowUpDown, CheckCircle2, ShoppingCart, Heart, Scale, Sparkles,
  Home, RotateCcw, Tag, Check, Layers, AlertCircle,
} from '../components/HeroIconsHub';

import { getLiveProducts, fetchLiveProducts, Product } from '../data/products';
import { getLocalCategories, getLocalBrands, Category, Brand } from '../lib/supabase';
import Header from '../components/Header';
import Footer from '../components/Footer';


function CatalogContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Extract slug array e.g. ['noutbuklar-komputerler-planshetler', 'komputer-aksesuarlar', 'noutbuklar-ucun-altliqlar']
  const rawSlugs = params?.slug ? (Array.isArray(params.slug) ? params.slug : [params.slug]) : [];
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [allBrands, setAllBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Accordion open/close states
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    brands: true,
    price: true,
    RAM: true,
    Yaddaş: true,
    'Ekran Ölçüsü': true,
  });

  // Selected filters state (Synced with URL query params)
  const [selectedBrands, setSelectedBrands] = useState<string[]>(() => {
    const b = searchParams?.get('brand');
    return b ? b.split(',').map(s => s.trim().toLowerCase()) : [];
  });

  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string[]>>(() => {
    const initialAttrs: Record<string, string[]> = {};
    searchParams?.forEach((val, key) => {
      if (key !== 'brand' && key !== 'price' && key !== 'sort') {
        initialAttrs[key] = val.split(',').map(s => s.trim());
      }
    });
    return initialAttrs;
  });

  const [priceRange, setPriceRange] = useState<number>(() => {
    const p = searchParams?.get('price');
    return p ? Number(p) : 5000;
  });

  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'popular'>('default');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    setCategories(getLocalCategories());
    setAllBrands(getLocalBrands());
    setProducts(getLiveProducts() as any);
    fetchLiveProducts().then(prods => {
      if (prods && prods.length > 0) setProducts(prods as any);
    });
  }, []);


  // Update URL SearchParams whenever filters change
  const updateUrlParams = (newBrands: string[], newAttrs: Record<string, string[]>, newPrice: number) => {
    const query = new URLSearchParams();
    if (newBrands.length > 0) {
      query.set('brand', newBrands.join(','));
    }
    if (newPrice < 5000) {
      query.set('price', String(newPrice));
    }
    Object.entries(newAttrs).forEach(([k, vals]) => {
      if (vals.length > 0) {
        query.set(k.toLowerCase(), vals.join(','));
      }
    });

    const queryString = query.toString();
    const basePath = `/catalog/${rawSlugs.join('/')}`;
    const targetUrl = queryString ? `${basePath}?${queryString}` : basePath;
    router.replace(targetUrl, { scroll: false });
  };

  // Find matching category by slug chain
  const currentSlug = rawSlugs[rawSlugs.length - 1] || '';
  const currentCategory = categories.find(
    c => c.slug === currentSlug || c.full_slug === rawSlugs.join('/')
  );

  // Construct Breadcrumbs
  const breadcrumbItems: { name: string; url: string }[] = [];
  let currentAccPath = '';
  rawSlugs.forEach((s) => {
    currentAccPath = currentAccPath ? `${currentAccPath}/${s}` : s;
    const cat = categories.find(c => c.slug === s || c.full_slug === currentAccPath);
    breadcrumbItems.push({
      name: cat?.name || s.replace(/-/g, ' '),
      url: `/catalog/${currentAccPath}`
    });
  });

  const getProductPrice = (p: Product) => {
    if (p.rawPrice) return p.rawPrice;
    return parseFloat(String(p.cash_price || 0).replace(/[^\d.]/g, '')) || 0;
  };

  // Extract all dynamic attributes (spec key -> unique values) from products
  const dynamicAttributeGroups = useMemo(() => {
    const groups: Record<string, Set<string>> = {};
    products.forEach(p => {
      if (p.attributes) {
        Object.entries(p.attributes).forEach(([k, v]) => {
          if (v && v.trim()) {
            if (!groups[k]) groups[k] = new Set();
            groups[k].add(v.trim());
          }
        });
      }
    });

    const result: Record<string, string[]> = {};
    Object.entries(groups).forEach(([k, valSet]) => {
      result[k] = Array.from(valSet).sort();
    });
    return result;
  }, [products]);

  // Available brands list
  const availableBrandsList = useMemo(() => {
    const brandSet = new Set<string>();
    allBrands.forEach(b => brandSet.add(b.name));
    products.forEach(p => p.brand && brandSet.add(p.brand));
    return Array.from(brandSet).sort();
  }, [allBrands, products]);

  // Toggle Brand Filter
  const toggleBrandFilter = (brandName: string) => {
    const lower = brandName.toLowerCase();
    let updated: string[];
    if (selectedBrands.includes(lower)) {
      updated = selectedBrands.filter(b => b !== lower);
    } else {
      updated = [...selectedBrands, lower];
    }
    setSelectedBrands(updated);
    updateUrlParams(updated, selectedAttributes, priceRange);
  };

  // Toggle Attribute Filter
  const toggleAttributeFilter = (attrKey: string, attrVal: string) => {
    const currentVals = selectedAttributes[attrKey] || [];
    let updatedVals: string[];
    if (currentVals.includes(attrVal)) {
      updatedVals = currentVals.filter(v => v !== attrVal);
    } else {
      updatedVals = [...currentVals, attrVal];
    }

    const updatedAttrs = { ...selectedAttributes, [attrKey]: updatedVals };
    if (updatedVals.length === 0) {
      delete updatedAttrs[attrKey];
    }
    setSelectedAttributes(updatedAttrs);
    updateUrlParams(selectedBrands, updatedAttrs, priceRange);
  };

  // Toggle Accordion Section Open/Close
  const toggleAccordion = (key: string) => {
    setOpenAccordions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Reset All Filters
  const resetAllFilters = () => {
    setSelectedBrands([]);
    setSelectedAttributes({});
    setPriceRange(5000);
    router.replace(`/catalog/${rawSlugs.join('/')}`, { scroll: false });
  };

  // Filter products by category, brands, price, and dynamic attributes
  const filteredProducts = products.filter(p => {
    // Brand Filter
    if (selectedBrands.length > 0) {
      if (!selectedBrands.includes(String(p?.brand || '').toLowerCase())) {
        return false;
      }
    }
    // Price Filter
    const numPrice = getProductPrice(p);
    if (numPrice > priceRange) {
      return false;
    }
    // Dynamic Attributes Filter
    for (const [attrKey, selectedVals] of Object.entries(selectedAttributes)) {
      if (selectedVals.length > 0) {
        const productVal = p.attributes?.[attrKey];
        if (!productVal || !selectedVals.includes(productVal)) {
          return false;
        }
      }
    }
    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = getProductPrice(a);
    const priceB = getProductPrice(b);
    if (sortBy === 'price-asc') return priceA - priceB;
    if (sortBy === 'price-desc') return priceB - priceA;
    return 0;
  });

  const totalActiveFiltersCount = selectedBrands.length + Object.values(selectedAttributes).reduce((sum, arr) => sum + arr.length, 0) + (priceRange < 5000 ? 1 : 0);

  return (
    <div className={`min-h-screen transition-colors ${isDarkMode ? 'bg-[#090d16] text-white' : 'bg-slate-50 text-slate-900'}`}>
      <Header isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      
      {/* ═══ TOP BREADCRUMBS BAR (Baku Electronics Style) ═══ */}
      <div className={`border-b py-3 px-4 sm:px-8 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'}`}>
        <div className="max-w-[1400px] mx-auto flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
          <Link href="/" className="hover:text-[#4f533b] flex items-center gap-1 transition">
            <Home className="w-3.5 h-3.5" /> Ana səhifə
          </Link>
          {breadcrumbItems.map((item, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <Link
                href={item.url}
                className={`capitalize transition ${
                  idx === breadcrumbItems.length - 1
                    ? 'font-bold text-slate-900 dark:text-white pointer-events-none'
                    : 'hover:text-[#4f533b]'
                }`}
              >
                {item.name}
              </Link>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ═══ MAIN CATALOG CONTENT ═══ */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-8 space-y-6">
        
        {/* Category Title Header */}
        <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="space-y-1 z-10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-wider bg-[#4f533b]/10 text-[#4f533b] px-3 py-1 rounded-full">
                Kataloq Bölməsi
              </span>
              {totalActiveFiltersCount > 0 && (
                <span className="text-xs font-black tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full flex items-center gap-1">
                  <Filter className="w-3 h-3" /> {totalActiveFiltersCount} aktiv filtr
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black capitalize tracking-tight text-slate-900 dark:text-white">
              {currentCategory?.name || breadcrumbItems[breadcrumbItems.length - 1]?.name || 'Məhsul Kataloqu'}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Tapılan ümumi məhsul sayı: <strong className="text-[#4f533b]">{sortedProducts.length} ədəd</strong>
            </p>
          </div>

          <div className="flex items-center gap-3 z-10">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold border outline-none cursor-pointer transition ${
                isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-200 text-slate-800'
              }`}
            >
              <option value="default">Sıralama: Standart</option>
              <option value="price-asc">Qiymət: Ucuzdan bahaya</option>
              <option value="price-desc">Qiymət: Bahadan ucuza</option>
            </select>
          </div>
        </div>

        {/* ═══ SMART ACCORDION FILTER + PRODUCTS GRID ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ═══ LEFT SMART ACCORDION FILTER SIDEBAR ═══ */}
          <div className={`lg:col-span-3 p-5 rounded-3xl border space-y-4 ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-sm flex items-center gap-2 text-slate-900 dark:text-white">
                <SlidersHorizontal className="w-4 h-4 text-[#4f533b]" /> Smart Filtrlər
              </h3>
              {totalActiveFiltersCount > 0 && (
                <button
                  onClick={resetAllFilters}
                  className="text-[11px] font-bold text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> Sıfırla
                </button>
              )}
            </div>

            {/* ── 1. BRENDLƏR ACCORDION ── */}
            <div className="border-b pb-3 border-slate-100 dark:border-slate-800 space-y-2">
              <button
                onClick={() => toggleAccordion('brands')}
                className="w-full flex items-center justify-between font-extrabold text-xs text-slate-800 dark:text-slate-200 py-1 transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-[#4f533b]" />
                  <span>Brendlər</span>
                  {selectedBrands.length > 0 && (
                    <span className="text-[10px] font-bold bg-[#4f533b] text-white px-1.5 py-0.2 rounded-full">
                      {selectedBrands.length}
                    </span>
                  )}
                </div>
                {openAccordions['brands'] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {openAccordions['brands'] && (
                <div className="space-y-1.5 max-h-56 overflow-y-auto pt-1 pr-1">
                  {availableBrandsList.map(b => {
                    const isChecked = selectedBrands.includes(b.toLowerCase());
                    return (
                      <label
                        key={b}
                        onClick={() => toggleBrandFilter(b)}
                        className={`flex items-center justify-between p-2 rounded-xl text-xs font-semibold cursor-pointer transition select-none ${
                          isChecked
                            ? 'bg-[#4f533b]/15 text-[#4f533b] font-bold'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition ${
                            isChecked ? 'bg-[#4f533b] border-[#4f533b] text-white' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                          }`}>
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span>{b}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── 2. PRICE RANGE ACCORDION ── */}
            <div className="border-b pb-3 border-slate-100 dark:border-slate-800 space-y-2">
              <button
                onClick={() => toggleAccordion('price')}
                className="w-full flex items-center justify-between font-extrabold text-xs text-slate-800 dark:text-slate-200 py-1 transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#4f533b]" />
                  <span>Maksimum Qiymət</span>
                </div>
                {openAccordions['price'] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {openAccordions['price'] && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                    <span>100 ₼</span>
                    <span className="text-[#4f533b] font-black">{priceRange} ₼</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="5000"
                    step="50"
                    value={priceRange}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setPriceRange(val);
                      updateUrlParams(selectedBrands, selectedAttributes, val);
                    }}
                    className="w-full accent-[#4f533b] cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* ── 3. DYNAMIC ATTRIBUTE ACCORDIONS (RAM, Yaddaş, Ekran, Sahə m²) ── */}
            {Object.entries(dynamicAttributeGroups).map(([attrKey, attrVals]) => {
              const selectedForThisAttr = selectedAttributes[attrKey] || [];
              const isOpen = openAccordions[attrKey] ?? true;

              return (
                <div key={attrKey} className="border-b pb-3 border-slate-100 dark:border-slate-800 space-y-2">
                  <button
                    onClick={() => toggleAccordion(attrKey)}
                    className="w-full flex items-center justify-between font-extrabold text-xs text-slate-800 dark:text-slate-200 py-1 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-[#4f533b]" />
                      <span>{attrKey}</span>
                      {selectedForThisAttr.length > 0 && (
                        <span className="text-[10px] font-bold bg-blue-600 text-white px-1.5 py-0.2 rounded-full">
                          {selectedForThisAttr.length}
                        </span>
                      )}
                    </div>
                    {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {isOpen && (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pt-1 pr-1">
                      {attrVals.map(val => {
                        const isChecked = selectedForThisAttr.includes(val);
                        return (
                          <label
                            key={val}
                            onClick={() => toggleAttributeFilter(attrKey, val)}
                            className={`flex items-center justify-between p-2 rounded-xl text-xs font-semibold cursor-pointer transition select-none ${
                              isChecked
                                ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold'
                                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded border flex items-center justify-center transition ${
                                isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                              }`}>
                                {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <span>{val}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

          </div>

          {/* ═══ RIGHT PRODUCTS GRID ═══ */}
          <div className="lg:col-span-9 space-y-6">
            {sortedProducts.length === 0 ? (
              <div className={`p-12 rounded-3xl border text-center space-y-4 ${
                isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
                <h3 className="text-lg font-black">Seçilmiş kriteriyalara uyğun məhsul tapılmadı</h3>
                <p className="text-xs text-slate-400">Filtrləri dəyişdirərək yenidən cəhd edin.</p>
                <button
                  onClick={resetAllFilters}
                  className="bg-[#4f533b] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer"
                >
                  Filtrləri Sıfırla
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProducts.map(product => (
                  <div
                    key={product.id}
                    className={`rounded-3xl border p-4 transition-all duration-200 hover:shadow-xl group flex flex-col justify-between ${
                      isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="w-full h-48 rounded-2xl bg-white border border-slate-100 dark:border-slate-800/80 relative overflow-hidden flex items-center justify-center p-4 shadow-2xs">
                        {product.discount && (
                          <span className="absolute top-3 left-3 bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full z-10">
                            {product.discount}
                          </span>
                        )}
                        <img
                          src={product.image}
                          alt={product.model_name || (product as any).name || ''}
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      <div className="space-y-1">
                        <span className="text-[11px] font-extrabold text-[#4f533b] tracking-wider">{product.brand}</span>
                        <h3 className="font-extrabold text-sm line-clamp-2 text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                          {product.model_name || (product as any).name}
                        </h3>
                      </div>

                    </div>

                    <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-lg font-black text-slate-900 dark:text-white block">{product.cash_price} ₼</span>
                        {product.old_price && (
                          <span className="text-xs text-slate-400 line-through font-semibold">{product.old_price} ₼</span>
                        )}
                      </div>

                      <button
                        className="bg-[#4f533b] hover:bg-[#3e4230] text-white p-2.5 rounded-xl transition cursor-pointer shadow-sm"
                        title="Səbətə əlavə et"
                      >
                        <ShoppingCart className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      <Footer isDarkMode={isDarkMode} />
    </div>
  );
}

export default function CatalogNestedPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500 font-bold">Yüklənir...</div>}>
      <CatalogContent />
    </React.Suspense>
  );
}
