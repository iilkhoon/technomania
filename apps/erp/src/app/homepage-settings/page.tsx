'use client';

import React, { useState, useEffect } from 'react';
import {
  Layout,
  Clock,
  CheckSquare,
  Shuffle,
  Save,
  Check,
  Search,
  Sparkles,
  Package,
  Layers,
  Info,
  ArrowRight,
  Sliders,
  Filter,
  FolderTree,
  Star,
  CheckCircle2,
  X,
  RefreshCw,
} from '../../components/HeroIconsHub';
import { Product, Category } from '../../types';
import { fetchApiProducts, fetchApiCategories, getLocalProducts, getLocalCategories, getErpHeaders } from '../../lib/supabase';

export default function HomepageSettingsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [filterView, setFilterView] = useState<'all' | 'selected_only' | 'unselected_only'>('all');

  // Mode: 'latest' | 'selected' | 'mixed'
  const [featuredMode, setFeaturedMode] = useState<'latest' | 'selected' | 'mixed'>('latest');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [prodsData, catsData] = await Promise.all([
        fetchApiProducts(),
        fetchApiCategories()
      ]);
      setProducts(prodsData && prodsData.length > 0 ? prodsData : getLocalProducts() || []);
      setCategories(catsData && catsData.length > 0 ? catsData : getLocalCategories() || []);

      // Load Settings
      const savedStr = localStorage.getItem('technomania_site_settings');
      if (savedStr) {
        const parsed = JSON.parse(savedStr);
        if (parsed.featured_mode) setFeaturedMode(parsed.featured_mode);
        if (Array.isArray(parsed.featured_product_ids)) setSelectedProductIds(parsed.featured_product_ids);
      }

      const res = await fetch('/api/catalog/settings', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object') {
          if (data.featured_mode) setFeaturedMode(data.featured_mode);
          if (Array.isArray(data.featured_product_ids)) setSelectedProductIds(data.featured_product_ids);
        }
      }
    } catch (e) {
      console.error('Error loading homepage settings data:', e);
      setProducts(getLocalProducts() || []);
      setCategories(getLocalCategories() || []);
    }
  };

  const handleToggleProductSelect = (id: string) => {
    setSelectedProductIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(pId => pId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredProducts.map(p => p.id);
    setSelectedProductIds(prev => Array.from(new Set([...prev, ...filteredIds])));
  };

  const handleClearSelected = () => {
    setSelectedProductIds([]);
  };

  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);

    try {
      let currentSettings: any = {};
      try {
        const savedStr = localStorage.getItem('technomania_site_settings');
        if (savedStr) currentSettings = JSON.parse(savedStr);
      } catch (e) {}

      const updatedSettings = {
        ...currentSettings,
        featured_mode: featuredMode,
        featured_product_ids: selectedProductIds,
        updated_at: new Date().toISOString(),
      };

      localStorage.setItem('technomania_site_settings', JSON.stringify(updatedSettings));
      window.dispatchEvent(new Event('techno_settings_updated'));
      window.dispatchEvent(new Event('storage'));

      const res = await fetch('/api/catalog/settings', {
        method: 'POST',
        headers: getErpHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(updatedSettings),
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (e) {
      console.error('Error saving homepage settings:', e);
    } finally {
      setSaving(false);
    }
  };

  // Filter products by Search, Category, and View Tab
  const filteredProducts = products.filter(p => {
    // 1. Search Query Filter
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      (p.name || p.model_name || '').toLowerCase().includes(q) ||
      (p.brand || '').toLowerCase().includes(q) ||
      (p.category_name || '').toLowerCase().includes(q);

    if (!matchesSearch) return false;

    // 2. Category Filter
    if (selectedCategoryId !== 'all') {
      const catMatches = p.category_id === selectedCategoryId ||
        categories.some(c => c.id === selectedCategoryId && (c.name === p.category_name || c.id === p.category_id));
      if (!catMatches) return false;
    }

    // 3. View Filter Tab ('all' | 'selected_only' | 'unselected_only')
    const isSelected = selectedProductIds.includes(p.id);
    if (filterView === 'selected_only' && !isSelected) return false;
    if (filterView === 'unselected_only' && isSelected) return false;

    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl text-slate-700">
      {/* Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl text-slate-900 font-bold flex items-center gap-2">
              <Layout className="w-5 h-5 text-[#4f533b]" /> Ana səhifə və önə çıxan məhsullar
            </h1>
            <span className="text-xs bg-[#f4f5f0] text-[#4f533b] border border-[#4f533b]/20 px-2.5 py-0.5 rounded-md font-bold">
              Vitrin tənzimləmələri
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Saytın ana səhifəsindəki "Önə çıxan məhsullar" vitrininin düzülüş rejimini seçin və kateqoriyalar üzrə idarə edin.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm text-white transition flex items-center gap-2 shadow-sm cursor-pointer active:scale-95 flex-shrink-0 ${
            savedSuccess
              ? 'bg-emerald-600'
              : 'bg-[#4f533b] hover:bg-[#3e4230]'
          }`}
        >
          {saving ? (
            <span>Yadda saxlanılır...</span>
          ) : savedSuccess ? (
            <>
              <Check className="w-4 h-4" /> Yadda saxlanıldı!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Dəyişiklikləri yadda saxla
            </>
          )}
        </button>
      </div>

      {/* Mode Selection Grid (3 Mode Options) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Mode 1: Latest Added */}
        <div
          onClick={() => setFeaturedMode('latest')}
          className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 relative ${
            featuredMode === 'latest'
              ? 'bg-[#f4f5f0] border-[#4f533b] shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${featuredMode === 'latest' ? 'bg-[#4f533b] text-white' : 'bg-slate-100 text-slate-600'}`}>
                <Clock className="w-5 h-5" />
              </div>
              <input
                type="radio"
                name="featuredMode"
                checked={featuredMode === 'latest'}
                onChange={() => setFeaturedMode('latest')}
                className="w-4 h-4 text-[#4f533b] cursor-pointer"
              />
            </div>
            <h3 className="font-bold text-slate-900 text-base">1. Ən son əlavə edilən məhsullar</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Bazaya ən son yüklənən və yenilənən məhsullar avtomatik olaraq ana səhifənin ən üstündə sıralanır.
            </p>
          </div>
          <span className="text-[11px] font-bold text-[#4f533b] pt-2 border-t border-slate-200/60 block">
            ✓ Avtomatik Sıralama
          </span>
        </div>

        {/* Mode 2: Manually Selected */}
        <div
          onClick={() => setFeaturedMode('selected')}
          className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 relative ${
            featuredMode === 'selected'
              ? 'bg-[#f4f5f0] border-[#4f533b] shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${featuredMode === 'selected' ? 'bg-[#4f533b] text-white' : 'bg-slate-100 text-slate-600'}`}>
                <CheckSquare className="w-5 h-5" />
              </div>
              <input
                type="radio"
                name="featuredMode"
                checked={featuredMode === 'selected'}
                onChange={() => setFeaturedMode('selected')}
                className="w-4 h-4 text-[#4f533b] cursor-pointer"
              />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">2. Seçilmiş Məhsullar</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Yalnız aşağıdakı siyahıdan sizin xüsusi seçdiyiniz məhsullar ana səhifədə göstərilir.
            </p>
          </div>
          <span className="text-[11px] font-bold text-[#4f533b] pt-2 border-t border-slate-200/60 block">
            🎯 Seçilmiş ({selectedProductIds.length} məhsul)
          </span>
        </div>

        {/* Mode 3: Mixed Mode */}
        <div
          onClick={() => setFeaturedMode('mixed')}
          className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 relative ${
            featuredMode === 'mixed'
              ? 'bg-[#f4f5f0] border-[#4f533b] shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${featuredMode === 'mixed' ? 'bg-[#4f533b] text-white' : 'bg-slate-100 text-slate-600'}`}>
                <Shuffle className="w-5 h-5" />
              </div>
              <input
                type="radio"
                name="featuredMode"
                checked={featuredMode === 'mixed'}
                onChange={() => setFeaturedMode('mixed')}
                className="w-4 h-4 text-[#4f533b] cursor-pointer"
              />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">3. Qarışıq Rejim (Arasına Sox)</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Sizin seçdiyiniz xüsusi məhsullar ən son əlavə olunan məhsulların arasına növbəli şəkildə yerləşdirilir.
            </p>
          </div>
          <span className="text-[11px] font-bold text-[#4f533b] pt-2 border-t border-slate-200/60 block">
            ⚡ Seçilmişlər + Ən Son Yüklənənlər
          </span>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-3 text-xs">
        <Info className="w-5 h-5 text-amber-600 flex-shrink-0" />
        <div>
          <strong className="block font-bold mb-0.5">Rejim haqqında məlumat:</strong>
          {featuredMode === 'latest' && 'Hal-hazırda "Ən son əlavə edilən məhsullar" rejimi aktivdir. Bazadakı bütün yeni məhsullar tarixinə görə avtomatik çıxacaq.'}
          {featuredMode === 'selected' && 'Hal-hazırda "Seçilmiş məhsullar" rejimi aktivdir. Yalnız aşağıda quş qoyduğunuz məhsullar ana səhifədə nümayiş olunacaq.'}
          {featuredMode === 'mixed' && 'Hal-hazırda "Qarışıq rejim" aktivdir. Seçdiyiniz məhsullar ən son əlavə olunan məhsulların arasına sırayla yerləşdiriləcək.'}
        </div>
      </div>

      {/* Product Selection List Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-xs">
        {/* Section Title & Quick Batch Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Package className="w-5 h-5 text-[#4f533b]" /> Məhsul Siyahısı Və Kateqoriya İdarəetməsi
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ana səhifədə önə çıxarmaq istədiyiniz məhsulları kateqoriyalar üzrə filtrləyin və seçin ({selectedProductIds.length} seçilib)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAllFiltered}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs text-slate-700 font-bold transition cursor-pointer active:scale-95"
            >
              Axtarışdakıların Hamısını Seç ({filteredProducts.length})
            </button>
            {selectedProductIds.length > 0 && (
              <button
                type="button"
                onClick={handleClearSelected}
                className="px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-xs text-rose-600 font-bold transition cursor-pointer active:scale-95"
              >
                Seçimləri Sıfırla ({selectedProductIds.length})
              </button>
            )}
          </div>
        </div>

        {/* Filters Toolbar: Search Bar + Category Dropdown + Status Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Məhsul adı, brend və ya model ilə axtar..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-700 outline-none focus:border-[#4f533b] transition"
            />
          </div>

          {/* Category Dropdown Filter */}
          <div className="md:col-span-4 relative">
            <div className="relative">
              <FolderTree className="w-4 h-4 absolute left-3.5 top-3 text-[#4f533b]" />
              <select
                value={selectedCategoryId}
                onChange={e => setSelectedCategoryId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-bold text-slate-700 outline-none focus:border-[#4f533b] transition cursor-pointer appearance-none"
              >
                <option value="all">📁 Bütün Kateqoriyalar ({products.length} məhsul)</option>
                {categories.map(c => {
                  const count = products.filter(p => p.category_id === c.id || p.category_name === c.name).length;
                  return (
                    <option key={c.id} value={c.id}>
                      {c.level === 1 ? '• ' : c.level === 2 ? '── ' : '──── '} {c.name} ({count})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Selection Filter Tabs */}
          <div className="md:col-span-3 flex items-center bg-slate-100 p-1 rounded-xl gap-1">
            <button
              type="button"
              onClick={() => setFilterView('all')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition text-center cursor-pointer ${
                filterView === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Bütün
            </button>
            <button
              type="button"
              onClick={() => setFilterView('selected_only')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition text-center cursor-pointer ${
                filterView === 'selected_only' ? 'bg-[#4f533b] text-white shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Seçilənlər ({selectedProductIds.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterView('unselected_only')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition text-center cursor-pointer ${
                filterView === 'unselected_only' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Digər
            </button>
          </div>
        </div>

        {/* Quick Category Chips / Shortcuts */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-[11px] font-bold text-slate-400 tracking-wider mr-1 flex-shrink-0">Dəqiq Filter:</span>
          <button
            type="button"
            onClick={() => setSelectedCategoryId('all')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer flex-shrink-0 ${
              selectedCategoryId === 'all'
                ? 'bg-[#4f533b] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Bütün Məhsullar
          </button>
          {categories.slice(0, 8).map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCategoryId(c.id)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer flex-shrink-0 ${
                selectedCategoryId === c.id
                  ? 'bg-[#4f533b] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[560px] overflow-y-auto pr-1 scrollbar-thin">
          {filteredProducts.map(p => {
            const isSelected = selectedProductIds.includes(p.id);
            const priceDisplay = typeof p.cash_price === 'number' ? `${p.cash_price.toFixed(2)} ₼` : p.cash_price;

            return (
              <div
                key={p.id}
                onClick={() => handleToggleProductSelect(p.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none flex items-center gap-3.5 relative group ${
                  isSelected
                    ? 'bg-[#f4f5f0] border-[#4f533b] shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs'
                }`}
              >
                {/* Selection Checkbox indicator */}
                <div className={`w-5 h-5 rounded-lg border flex items-center justify-center flex-shrink-0 transition-colors ${
                  isSelected ? 'bg-[#4f533b] border-[#4f533b] text-white' : 'border-slate-300 bg-white group-hover:border-[#4f533b]'
                }`}>
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>

                {/* Product Thumbnail */}
                <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center flex-shrink-0 shadow-2xs">
                  {p.image ? (
                    <img src={p.image} alt={p.name || p.model_name} className="max-h-full max-w-full object-contain" />
                  ) : (
                    <Package className="w-6 h-6 text-slate-300" />
                  )}
                </div>

                {/* Product Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-[10px] font-black text-slate-400 truncate">{p.brand || 'Standart'}</span>
                    {isSelected ? (
                      <span className="text-[10px] bg-[#4f533b] text-white px-2 py-0.5 rounded-full font-extrabold flex-shrink-0 flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-white" /> Önə Çıxan
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-medium truncate">
                        {p.category_name || 'Kateqoriya'}
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs font-extrabold text-slate-900 truncate group-hover:text-[#4f533b] transition">
                    {p.name || p.model_name}
                  </h4>

                  <div className="flex items-center justify-between gap-2 mt-1">
                    <span className="text-xs font-black text-[#4f533b]">{priceDisplay}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      p.stock > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'
                    }`}>
                      {p.stock > 0 ? `Stok: ${p.stock}` : 'Bitib'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredProducts.length === 0 && (
            <div className="col-span-full py-14 text-center text-slate-400 text-xs space-y-2">
              <Package className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-bold">Axtarışa və ya kateqoriyaya uyğun məhsul tapılmadı</p>
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setSelectedCategoryId('all'); setFilterView('all'); }}
                className="text-xs text-[#4f533b] font-bold underline cursor-pointer"
              >
                Bütün filtrləri sıfırla
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
