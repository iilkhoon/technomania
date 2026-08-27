'use client';

import React, { useState, useEffect } from 'react';
import {
  Percent,
  Search,
  Check,
  Package,
  TrendingUp,
  TrendingDown,
  Tag,
  CheckSquare,
  Square,
  RefreshCw,
  Save,
  RotateCcw,
  AlertTriangle,
} from '../../components/HeroIconsHub';
import { Product, Category } from '../../types';
import {
  fetchApiProducts,
  saveProductToApi,
  getLocalCategories,
} from '../../lib/supabase';
import { addAuditLog } from '../../lib/auditLogger';

export default function BulkPricingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Selected Product IDs
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Bulk Adjustment Form
  const [priceType, setPriceType] = useState<'cash' | 'credit' | 'both'>('cash');
  const [adjustMode, setAdjustMode] = useState<'percent' | 'amount'>('percent');
  const [adjustValue, setAdjustValue] = useState<number>(0);
  const [adjustDirection, setAdjustDirection] = useState<'increase' | 'decrease'>('decrease');
  const [discountTag, setDiscountTag] = useState<string>('no_change');

  const loadData = async () => {
    setLoading(true);
    try {
      const cats = getLocalCategories();
      setCategories(cats);

      const prods = await fetchApiProducts();
      setProducts(prods);
    } catch (e) {
      console.error('Failed to load products for bulk pricing:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Products
  const filteredProducts = products.filter(p => {
    const name = (p.name || p.model_name || '').toLowerCase();
    const brand = (p.brand || '').toLowerCase();
    const q = searchQuery.toLowerCase();

    const matchesSearch = !q || name.includes(q) || brand.includes(q);
    const matchesCat = selectedCategory === 'all' || p.category_id === selectedCategory;

    return matchesSearch && matchesCat;
  });

  // Toggle selection
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map(p => p.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Helper to compute new price for a product
  const computeNewPrice = (currentPrice: number) => {
    if (adjustValue === 0) return currentPrice;

    let delta = 0;
    if (adjustMode === 'percent') {
      delta = (currentPrice * adjustValue) / 100;
    } else {
      delta = adjustValue;
    }

    if (adjustDirection === 'decrease') {
      return Math.max(0, currentPrice - delta);
    } else {
      return currentPrice + delta;
    }
  };

  // Apply Bulk Changes to Selected Products
  const handleApplyChanges = async () => {
    if (selectedIds.length === 0) {
      alert('Zəhmət olmasa ən azı 1 məhsul seçin!');
      return;
    }

    setSaving(true);
    setSuccessMsg('');

    try {
      let updatedCount = 0;
      const updatedProducts = [...products];

      for (let i = 0; i < updatedProducts.length; i++) {
        const p = updatedProducts[i];
        if (selectedIds.includes(p.id)) {
          const currentCash = typeof (p as any).cash_price === 'number' ? (p as any).cash_price : parseFloat(String((p as any).cash_price || (p as any).price || 0)) || 0;
          const currentCredit = typeof (p as any).credit_price === 'number' ? (p as any).credit_price : parseFloat(String((p as any).credit_price || 0)) || 0;

          let newCash = currentCash;
          let newCredit = currentCredit;

          if (adjustValue !== 0) {
            if (priceType === 'cash' || priceType === 'both') {
              newCash = computeNewPrice(currentCash);
            }
            if (priceType === 'credit' || priceType === 'both') {
              newCredit = computeNewPrice(currentCredit);
            }
          }

          let newTag = p.discount;
          if (discountTag !== 'no_change') {
            newTag = discountTag === 'remove' ? '' : discountTag;
          }

          const updatedProd: Product = {
            ...p,
            cash_price: newCash,
            credit_price: newCredit,
            discount: newTag,
            updated_at: new Date().toISOString(),
          } as any;

          updatedProducts[i] = updatedProd;
          await saveProductToApi(updatedProd);
          updatedCount++;
        }
      }

      setProducts(updatedProducts);
      addAuditLog(
        'bulk_pricing',
        'pricing',
        `${updatedCount} məhsulun qiymət və endirimləri toplu şəkildə dəyişdirildi (${adjustDirection === 'decrease' ? '-' : '+'}${adjustValue}${adjustMode === 'percent' ? '%' : '₼'})`,
        {
          oldValues: { selectedCount: selectedIds.length, affectedCount: updatedCount },
          newValues: { adjustDirection, adjustValue, adjustMode, discountTag, priceType },
        }
      );

      setSuccessMsg(`${updatedCount} məhsulun qiyməti uğurla yeniləndi və canlı tətbiq edildi!`);
      setSelectedIds([]);
      setAdjustValue(0);
      setDiscountTag('no_change');

      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (e) {
      console.error('Failed to apply bulk pricing:', e);
      alert('Toplu qiymət tənzimləməsində xəta baş verdi!');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-700 select-none pb-12">

      {/* ── 1. PAGE HEADER ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#f4f5f0] text-[#4f533b] border border-[#4f533b]/20 flex items-center justify-center font-bold">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                Toplu qiymət və endirimlər mühərriki
              </h1>
              <p className="text-xs text-slate-500 font-normal">
                Məhsulların qiymətlərini faizlə və ya məbləğlə kütləvi şəkildə tənzimləyin, endirim etiketləri vurun
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={loadData}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 transition flex items-center gap-2 cursor-pointer font-bold active:scale-95 flex-shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
          Sinxronlaşdır
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ── 2. BULK ACTION TOOLBAR ── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#4f533b]" /> Toplu Tənzimləmə Alətləri
          </h3>
          <span className="text-xs text-slate-500">
            Seçilmiş məhsul sayı: <strong className="text-[#4f533b] font-bold">{selectedIds.length} / {filteredProducts.length}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Target Price Type */}
          <div>
            <label className="text-xs text-slate-500 block mb-1">Dəyişəcək Qiymət</label>
            <select
              value={priceType}
              onChange={e => setPriceType(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#4f533b]"
            >
              <option value="cash">Yalnız Nağd Qiymət</option>
              <option value="credit">Yalnız Kredit Qiyməti</option>
              <option value="both">Həm Nağd, Həm Kredit</option>
            </select>
          </div>

          {/* Direction (Increase / Decrease) */}
          <div>
            <label className="text-xs text-slate-500 block mb-1">Əməliyyat Növü</label>
            <select
              value={adjustDirection}
              onChange={e => setAdjustDirection(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#4f533b]"
            >
              <option value="decrease">📉 Endirim Et (Azalt)</option>
              <option value="increase">📈 Qiyməti Qaldır (Artır)</option>
            </select>
          </div>

          {/* Adjustment Mode (% vs ₼) */}
          <div>
            <label className="text-xs text-slate-500 block mb-1">Tənzimləmə Ölçüsü</label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="0"
                step="any"
                value={adjustValue}
                onChange={e => setAdjustValue(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold outline-none focus:border-[#4f533b]"
                placeholder="Dəyər..."
              />
              <select
                value={adjustMode}
                onChange={e => setAdjustMode(e.target.value as any)}
                className="bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800 outline-none font-medium cursor-pointer"
              >
                <option value="percent">%</option>
                <option value="amount">₼</option>
              </select>
            </div>
          </div>

          {/* Discount Tag */}
          <div>
            <label className="text-xs text-slate-500 block mb-1">Endirim Etiketi (Badge)</label>
            <select
              value={discountTag}
              onChange={e => setDiscountTag(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#4f533b]"
            >
              <option value="no_change">-- Dəyişdirilməsin --</option>
              <option value="Xüsusi Endirim!">🔥 Xüsusi Endirim!</option>
              <option value="Top Satış">⭐ Top Satış</option>
              <option value="Super Qiymət">💥 Super Qiymət</option>
              <option value="Məhdud Sayda">⏳ Məhdud Sayda</option>
              <option value="remove">❌ Etiketi Sil</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleApplyChanges}
              disabled={saving || selectedIds.length === 0}
              className={`w-full py-2 px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs cursor-pointer ${
                selectedIds.length > 0 && !saving
                  ? 'bg-[#4f533b] hover:bg-[#3e4230] active:scale-95'
                  : 'bg-slate-300 cursor-not-allowed'
              }`}
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Yadda Saxla Və Tətbiq Et</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 3. FILTER & SEARCH TOOLBAR ── */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Model və ya brend üzrə süzgəc..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-700 outline-none focus:border-[#4f533b] placeholder:text-slate-400"
          />
        </div>

        {/* Category selector */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-700 outline-none focus:border-[#4f533b]"
          >
            <option value="all">Bütün kateqoriyalar ({products.length})</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={toggleSelectAll}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-3.5 py-2 rounded-xl border border-slate-200 transition flex items-center gap-2 font-medium cursor-pointer"
          >
            {selectedIds.length === filteredProducts.length ? <CheckSquare className="w-4 h-4 text-[#4f533b]" /> : <Square className="w-4 h-4 text-slate-400" />}
            <span>{selectedIds.length === filteredProducts.length ? 'Hamısını Ləğv Et' : 'Bütün Siyahını Seç'}</span>
          </button>
        </div>
      </div>

      {/* ── 4. LIVE PREVIEW TABLE ── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 tracking-wider">
                <th className="py-3 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={filteredProducts.length > 0 && selectedIds.length === filteredProducts.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-[#4f533b] cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4">Məhsul</th>
                <th className="py-3 px-4">Kateqoriya</th>
                <th className="py-3 px-4">Cari Nağd Qiymət</th>
                <th className="py-3 px-4">Yeni Qiymət (Canlı Baxış)</th>
                <th className="py-3 px-4">Etiket</th>
                <th className="py-3 px-4 text-center">Seçim</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    Axtarış parametri üzrə məhsul tapılmadı!
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => {
                  const isSelected = selectedIds.includes(p.id);
                  const currentCash = typeof p.cash_price === 'number' ? p.cash_price : parseFloat(String(p.cash_price || 0)) || 0;
                  const newCash = isSelected && adjustValue > 0 ? computeNewPrice(currentCash) : currentCash;

                  return (
                    <tr
                      key={p.id}
                      onClick={() => toggleSelectOne(p.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#f4f5f0]/70' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-3 px-4 text-center" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(p.id)}
                          className="w-4 h-4 text-[#4f533b] cursor-pointer"
                        />
                      </td>

                      <td className="py-3 px-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 p-1 flex items-center justify-center flex-shrink-0">
                          {p.image ? <img src={p.image} alt={p.name} className="max-h-full object-contain" /> : <Package className="w-4 h-4 text-slate-400" />}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block truncate max-w-[220px]">{p.name || p.model_name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{p.brand || '—'}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[11px]">
                          {p.category_name || 'Ümumi'}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-bold text-slate-800">
                        {currentCash.toFixed(2)} ₼
                      </td>

                      <td className="py-3 px-4">
                        {isSelected && adjustValue > 0 ? (
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${adjustDirection === 'decrease' ? 'text-emerald-700' : 'text-rose-600'}`}>
                              {newCash.toFixed(2)} ₼
                            </span>
                            <span className="text-[10px] bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded font-mono">
                              {adjustDirection === 'decrease' ? '-' : '+'}{adjustValue}{adjustMode === 'percent' ? '%' : '₼'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono">—</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {p.discount ? (
                          <span className="bg-[#f4f5f0] text-[#4f533b] border border-[#4f533b]/20 px-2 py-0.5 rounded text-[10px] font-bold">
                            {p.discount}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono">—</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                          isSelected ? 'bg-[#4f533b] text-white border-[#4f533b]' : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {isSelected ? 'Seçilib' : 'Seçilməyib'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
