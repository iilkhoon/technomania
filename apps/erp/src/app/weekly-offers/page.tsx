'use client';

import React, { useState, useEffect } from 'react';
import {
  Flame,
  Plus,
  Trash2,
  Save,
  Clock,
  CheckCircle,
  Package,
  Search,
  DollarSign,
  Tag,
  Calendar,
  AlertCircle,
} from '../../components/HeroIconsHub';
import { Product } from '../../types/index';
import { getLocalProducts, getErpHeaders } from '../../lib/supabase';
import { showToast } from '../../lib/toastStore';
import { addAuditLog } from '../../lib/auditLogger';

export interface WeeklyOfferItem {
  id: string; // product_id
  product_name: string;
  brand: string;
  image: string;
  original_price: number;
  deal_price: number; // Həftənin Təklifi Qiyməti
  taksit?: string; // e.g. "0% taksit"
  active?: boolean;
}

export default function ERPWeeklyOffersPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [offerItems, setOfferItems] = useState<WeeklyOfferItem[]>([]);
  const [dealEndDate, setDealEndDate] = useState<string>('2026-08-25T23:59');
  const [dealTitle, setDealTitle] = useState<string>('Həftənin təklifləri');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Product Selection Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchProdQuery, setSearchProdQuery] = useState('');
  const [selectedProdForDeal, setSelectedProdForDeal] = useState<Product | null>(null);
  const [newDealPrice, setNewDealPrice] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // Load Catalog Products
        let prods: Product[] = getLocalProducts() || [];
        try {
          const res = await fetch('/api/catalog/products', { cache: 'no-store' });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) prods = data;
          }
        } catch (e) {}
        setAllProducts(prods);

        // Load Settings (Weekly Offers)
        try {
          const res = await fetch('/api/catalog/settings', { cache: 'no-store' });
          if (res.ok) {
            const settings = await res.json();
            if (settings?.weekly_offers) {
              const wo = settings.weekly_offers;
              if (Array.isArray(wo.items)) setOfferItems(wo.items);
              if (wo.end_date) setDealEndDate(wo.end_date.substring(0, 16));
              if (wo.title) setDealTitle(wo.title);
            }
          }
        } catch (e) {}
      } catch (e) {
        console.error('Failed to load weekly offers data:', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAddProductToWeeklyOffers = () => {
    if (!selectedProdForDeal) {
      showToast('Zəhmət olmasa məhsul seçin', 'info');
      return;
    }

    const price = parseFloat(newDealPrice);
    if (isNaN(price) || price <= 0) {
      showToast('Zəhmət olmasa keçərli həftənin təklifi qiyməti daxil edin', 'info');
      return;
    }

    const origPrice = typeof selectedProdForDeal.cash_price === 'number'
      ? selectedProdForDeal.cash_price
      : (parseFloat(String(selectedProdForDeal.cash_price)) || 0);

    const newItem: WeeklyOfferItem = {
      id: selectedProdForDeal.id,
      product_name: selectedProdForDeal.model_name || selectedProdForDeal.name,
      brand: selectedProdForDeal.brand || 'Ümumi',
      image: selectedProdForDeal.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80',
      original_price: origPrice,
      deal_price: price,
      taksit: '0% taksit',
      active: true,
    };

    // Filter existing duplicate product if any
    const updated = [...offerItems.filter(item => item.id !== newItem.id), newItem];
    setOfferItems(updated);

    // Reset modal
    setSelectedProdForDeal(null);
    setNewDealPrice('');
    setIsAddModalOpen(false);
    showToast(`"${newItem.product_name}" Həftənin təkliflərinə əlavə olundu`, 'success');
  };

  const handleRemoveOffer = (id: string) => {
    const updated = offerItems.filter(item => item.id !== id);
    setOfferItems(updated);
    showToast('Məhsul Həftənin təkliflərindən silindi', 'info');
  };

  const handleUpdateDealPrice = (id: string, newPriceStr: string) => {
    const price = parseFloat(newPriceStr);
    if (isNaN(price) || price <= 0) return;

    setOfferItems(prev => prev.map(item => item.id === id ? { ...item, deal_price: price } : item));
  };

  const handleSaveWeeklyOffers = async () => {
    setIsSaving(true);
    try {
      // 1. Load current site settings
      let currentSettings: any = {};
      try {
        const res = await fetch('/api/catalog/settings', { cache: 'no-store' });
        if (res.ok) currentSettings = await res.json();
      } catch (e) {}

      // 2. Attach weekly offers payload
      const updatedSettings = {
        ...currentSettings,
        weekly_offers: {
          title: dealTitle,
          end_date: dealEndDate,
          items: offerItems,
          updated_at: new Date().toISOString(),
        }
      };

      // 3. Save to backend API (PostgreSQL)
      const saveRes = await fetch('/api/catalog/settings', {
        method: 'POST',
        headers: getErpHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(updatedSettings),
      });

      if (!saveRes.ok) throw new Error('Failed to save settings');

      // 4. Update Local Storage for Instant Client Sync
      if (typeof window !== 'undefined') {
        localStorage.setItem('technomania_site_settings', JSON.stringify(updatedSettings));
        window.dispatchEvent(new Event('technomania_settings_updated'));
        window.dispatchEvent(new Event('storage'));
      }

      addAuditLog('settings_update', 'settings', `Həftənin təklifləri yeniləndi (${offerItems.length} məhsul)`);
      showToast('Həftənin təklifləri uğurla bazaya saxlanıldı! 🚀', 'success');
    } catch (e: any) {
      console.error('Failed to save weekly offers:', e);
      showToast('Xəta baş verdi: ' + (e.message || 'Yadda saxlanıla bilmədi'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredCatalogProducts = allProducts.filter(p => {
    const name = (p.model_name || p.name || '').toLowerCase();
    const brand = (p.brand || '').toLowerCase();
    const q = searchProdQuery.toLowerCase();
    return name.includes(q) || brand.includes(q);
  });

  return (
    <div className="space-y-6 text-slate-700">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl text-slate-900 flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-500 animate-pulse" /> Həftənin Təklifləri İdarəetməsi
            </h1>
            <span className="text-xs bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-md font-bold">
              {offerItems.length} Məhsul
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Storefront ana səhifədə və məhsul siyahısında xüsusi endirimli həftənin təkliflərini idarə edin.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
          >
            <Plus className="w-4 h-4" /> Məhsul Əlavə Et
          </button>

          <button
            type="button"
            onClick={handleSaveWeeklyOffers}
            disabled={isSaving}
            className="bg-[#4f533b] hover:bg-[#3e4230] text-white text-sm px-5 py-2.5 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {isSaving ? 'Yaddas saxlanılır...' : 'Yadda Saxla'}
          </button>
        </div>
      </div>

      {/* Countdown Timer Config Box */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5 tracking-wider">
            <Clock className="w-4 h-4 text-rose-500" /> Təklifin Bitmə Tarixi (Taymer):
          </label>
          <input
            type="datetime-local"
            value={dealEndDate}
            onChange={e => setDealEndDate(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 font-mono outline-none focus:border-[#4f533b] transition"
          />
          <p className="text-xs text-slate-400">Bu tarix storefront-da real taymer olaraq geri sayılacaq.</p>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5 tracking-wider">
            <Tag className="w-4 h-4 text-[#4f533b]" /> Blok Başlığı:
          </label>
          <input
            type="text"
            value={dealTitle}
            onChange={e => setDealTitle(e.target.value)}
            placeholder="Həftənin təklifləri"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 font-bold outline-none focus:border-[#4f533b] transition"
          />
          <p className="text-xs text-slate-400">Veb saytdakı blokun üst başlığı.</p>
        </div>
      </div>

      {/* Weekly Offer Products Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-500" /> Həftənin Təklifində Olan Məhsullar
          </h3>
          <span className="text-xs text-slate-500">
            Hər məhsul üçün xüsusi həftənin təklifi qiymətini təyin edə bilərsiniz.
          </span>
        </div>

        {offerItems.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto border border-rose-100">
              <Flame className="w-8 h-8 animate-pulse" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Hələ Məhsul Əlavə Edilməyib</h4>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Yuxarıdakı "Məhsul Əlavə Et" düyməsinə basaraq kataloqdan məhsullar seçib həftənin təkliflərinə daxil edin.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-xs text-slate-500 tracking-wider">
                  <th className="py-3.5 px-4">Şəkil & Məhsul Adı</th>
                  <th className="py-3.5 px-4">Brend</th>
                  <th className="py-3.5 px-4">Orijinal Qiymət</th>
                  <th className="py-3.5 px-4">Həftənin Təklifi Qiyməti (₼)</th>
                  <th className="py-3.5 px-4">Taksit Qeydi</th>
                  <th className="py-3.5 px-4 text-right">Əməliyyat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {offerItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.product_name}
                          className="w-12 h-12 rounded-xl object-contain border border-slate-200 p-1 bg-white flex-shrink-0"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block leading-snug">{item.product_name}</span>
                          <span className="text-xs text-slate-400 font-mono">ID: {item.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[#4f533b] bg-[#4f533b]/10 border border-[#4f533b]/20 px-2.5 py-1 rounded-lg text-xs">
                        {item.brand}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 line-through font-mono">
                      {item.original_price.toFixed(2)} ₼
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 max-w-[150px]">
                        <input
                          type="number"
                          step="0.01"
                          value={item.deal_price}
                          onChange={e => handleUpdateDealPrice(item.id, e.target.value)}
                          className="w-full bg-emerald-50 border border-emerald-300 font-black text-emerald-800 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-emerald-500 transition"
                        />
                        <span className="font-bold text-emerald-700">₼</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-xs bg-rose-50 text-rose-700 border border-rose-200 px-2 py-1 rounded-md font-bold">
                        {item.taksit || '0% taksit'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveOffer(item.id)}
                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 transition cursor-pointer"
                        title="Təkliflərdən Çıxar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Flame className="w-5 h-5 text-rose-500" /> Həftənin Təkliflərinə Məhsul Əlavə Et
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchProdQuery}
                onChange={e => setSearchProdQuery(e.target.value)}
                placeholder="Məhsul adı və ya brend axtarın..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-800 outline-none focus:border-[#4f533b] transition"
              />
            </div>

            {/* Catalog Products List */}
            <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-slate-50/50">
              {filteredCatalogProducts.map(prod => {
                const isSelected = selectedProdForDeal?.id === prod.id;
                const origPrice = typeof prod.cash_price === 'number' ? prod.cash_price : (parseFloat(String(prod.cash_price)) || 0);

                return (
                  <div
                    key={prod.id}
                    onClick={() => {
                      setSelectedProdForDeal(prod);
                      setNewDealPrice((origPrice * 0.85).toFixed(2)); // Default 15% discount recommendation
                    }}
                    className={`p-3 flex items-center justify-between cursor-pointer transition ${
                      isSelected ? 'bg-[#4f533b]/10 border-l-4 border-[#4f533b]' : 'hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img src={prod.image} alt={prod.name} className="w-10 h-10 object-contain rounded-lg border border-slate-200 bg-white p-1" />
                      <div>
                        <span className="font-bold text-xs text-slate-900 block">{prod.model_name || prod.name}</span>
                        <span className="text-[11px] text-slate-400">{prod.brand}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-xs text-slate-900 block">{origPrice.toFixed(2)} ₼</span>
                      {isSelected && <span className="text-[10px] text-emerald-600 font-bold">Seçildi ✓</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Price Editor Input */}
            {selectedProdForDeal && (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                  <span>Məhsul: {selectedProdForDeal.model_name || selectedProdForDeal.name}</span>
                  <span className="line-through text-slate-400">Orijinal: {(typeof selectedProdForDeal.cash_price === 'number' ? selectedProdForDeal.cash_price : parseFloat(String(selectedProdForDeal.cash_price)) || 0).toFixed(2)} ₼</span>
                </div>

                <label className="text-xs font-black text-emerald-900 block ">
                  Xüsusi Həftənin Təklifi Qiyməti (₼):
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newDealPrice}
                  onChange={e => setNewDealPrice(e.target.value)}
                  placeholder="Xüsusi endirimli qiymət..."
                  className="w-full bg-white border border-emerald-300 font-black text-emerald-900 rounded-xl px-3.5 py-2.5 text-base outline-none focus:border-emerald-600 transition shadow-inner"
                />
                <p className="text-[11px] text-emerald-700 font-semibold">
                  * Bu qiymət storefront-da həftənin təklifi kartında, axtarışda, kataloqda və səbətdə tətbiq olunacaq.
                </p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Ləğv Et
              </button>
              <button
                type="button"
                onClick={handleAddProductToWeeklyOffers}
                disabled={!selectedProdForDeal}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#4f533b] hover:bg-[#3e4230] text-white transition cursor-pointer shadow-xs disabled:opacity-40"
              >
                Həftənin Təkliflərinə Əlavə Et
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
