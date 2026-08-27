'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Trash2,
  Check,
  X,
  Copy,
  Link as LinkIcon,
  Percent,
  DollarSign,
  Ticket,
  Search,
  Sparkles,
  Zap,
  ShoppingBag,
} from '../../components/HeroIconsHub';
import {
  PromoCoupon,
  getLocalCoupons,
  saveLocalCoupons,
  fetchCouponsApi
} from '../../lib/couponManager';

export default function PromosPage() {
  const [coupons, setCoupons] = useState<PromoCoupon[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCouponId, setCopiedCouponId] = useState<string | null>(null);

  // Add Coupon Modal State
  const [isAddCouponModalOpen, setIsAddCouponModalOpen] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newDiscountType, setNewDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [newDiscountValue, setNewDiscountValue] = useState<number>(20);
  const [newMinOrderAmount, setNewMinOrderAmount] = useState<number>(0);

  const loadData = () => {
    fetchCouponsApi().then(data => setCoupons(data));
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    window.addEventListener('techno_coupons_updated', loadData);
    return () => {
      window.removeEventListener('storage', loadData);
      window.removeEventListener('techno_coupons_updated', loadData);
    };
  }, []);

  const handleCreateCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;

    const cleanCode = newCode.trim().toUpperCase();
    const newCoup: PromoCoupon = {
      id: 'coup-' + Date.now(),
      code: cleanCode,
      discountType: newDiscountType,
      discountValue: Number(newDiscountValue) || 10,
      minOrderAmount: Number(newMinOrderAmount) || 0,
      usageCount: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    const updated = [newCoup, ...coupons];
    saveLocalCoupons(updated);
    setCoupons(updated);
    setIsAddCouponModalOpen(false);
    setNewCode('');
  };

  const handleToggleCouponStatus = (id: string) => {
    const updated = coupons.map(c => c.id === id ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' } as PromoCoupon : c);
    saveLocalCoupons(updated);
    setCoupons(updated);
  };

  const handleDeleteCoupon = (id: string) => {
    if (!confirm('Bu promo kodu silmək istədiyinizdən əminsiniz?')) return;
    const updated = coupons.filter(c => c.id !== id);
    saveLocalCoupons(updated);
    setCoupons(updated);
  };

  const handleCopyCouponLink = (code: string, id: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin.replace(':3000', ':3001') : 'http://169.58.132.249';
    const link = `${origin}/?coupon=${encodeURIComponent(code)}`;
    navigator.clipboard.writeText(link);
    setCopiedCouponId(id);
    setTimeout(() => setCopiedCouponId(null), 2000);
  };

  const filteredCoupons = coupons.filter(c =>
    c.code.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <div className="space-y-6 max-w-6xl text-slate-700">
      {/* Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Tag className="w-5 h-5 text-[#4f533b]" /> Kuponlar Və Promo Kodlar
            </h1>
            <span className="text-xs bg-[#f4f5f0] text-[#4f533b] border border-[#4f533b]/20 px-2.5 py-0.5 rounded-md font-bold">
              Marketinq & Aksiyalar
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Müştərilər üçün xüsusi promo kodlar yaradın, endirim faizini tənzimləyin və 1-klikli keçid linklərini kopyalayın.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddCouponModalOpen(true)}
          className="bg-[#4f533b] hover:bg-[#3e4230] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer active:scale-95 flex-shrink-0"
        >
          <Plus className="w-4 h-4" /> Yeni Promo Kod Yarat
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Promo kod adı ilə axtar..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-700 outline-none focus:border-[#4f533b] transition"
          />
        </div>

        <span className="text-xs font-bold text-slate-500">
          Cəmi: <strong className="text-[#4f533b]">{coupons.length} Promo Kod</strong>
        </span>
      </div>

      {/* Coupons Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCoupons.map(c => (
          <div
            key={c.id}
            className={`bg-white border rounded-2xl p-5 space-y-4 shadow-xs transition flex flex-col justify-between ${
              c.status === 'active' ? 'border-slate-200 hover:border-[#4f533b]' : 'border-slate-200 opacity-60 bg-slate-50'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-black tracking-wider text-[#4f533b] bg-[#f4f5f0] border border-[#4f533b]/20 px-3 py-1 rounded-xl font-mono">
                  {c.code}
                </span>
                <button
                  onClick={() => handleToggleCouponStatus(c.id)}
                  className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border transition cursor-pointer ${
                    c.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-slate-100 text-slate-500 border-slate-300'
                  }`}
                >
                  {c.status === 'active' ? '✓ Aktiv' : '✕ Deaktiv'}
                </button>
              </div>

              <div className="space-y-1">
                <span className="text-lg font-black text-slate-900 block">
                  {c.discountType === 'percent' ? `-${c.discountValue}% Endirim` : `-${c.discountValue} ₼ Endirim`}
                </span>
                <p className="text-xs text-slate-500 font-medium">
                  {c.minOrderAmount && c.minOrderAmount > 0
                    ? `Minimum ${c.minOrderAmount} ₼ sifariş məbləğində keçərlidir.`
                    : 'Bütün sifariş məbləğləri üçün keçərlidir.'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 flex items-center justify-between">
                <span className="text-slate-400">İstifadə Sayı:</span>
                <span className="font-extrabold text-slate-800">{c.usageCount} dəfə</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <button
                type="button"
                onClick={() => handleCopyCouponLink(c.code, c.id)}
                className="w-full bg-[#4f533b]/10 hover:bg-[#4f533b] text-[#4f533b] hover:text-white border border-[#4f533b]/20 font-extrabold text-xs py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                {copiedCouponId === c.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" /> Link Kopyalandı!
                  </>
                ) : (
                  <>
                    <LinkIcon className="w-3.5 h-3.5" /> Avtomatik Keçid Linkini Kopyala
                  </>
                )}
              </button>

              <div className="flex items-center justify-end">
                <button
                  onClick={() => handleDeleteCoupon(c.id)}
                  className="text-xs text-rose-500 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Sil
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredCoupons.length === 0 && (
          <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-2">
            <Tag className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-extrabold text-slate-700 text-sm">Hələ ki promo kod tapılmadı</h3>
            <p className="text-xs text-slate-400">Yuxarıdakı düymə ilə yeni promo kod yarada bilərsiniz.</p>
          </div>
        )}
      </div>

      {/* MODAL: CREATE NEW PROMO COUPON */}
      {isAddCouponModalOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          onClick={() => setIsAddCouponModalOpen(false)}
        >
          <div
            className="bg-white border border-slate-200 text-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#4f533b]" />
                <h3 className="font-extrabold text-base text-slate-900">Yeni Promo Kod Yarat</h3>
              </div>
              <button
                onClick={() => setIsAddCouponModalOpen(false)}
                className="p-1 rounded-lg bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCouponSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Promo Kodu (Məs: SUMMER20)</label>
                <input
                  type="text"
                  required
                  placeholder="Kodu daxil edin (Məs: SUMMER20)"
                  value={newCode}
                  onChange={e => setNewCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-black text-slate-800 outline-none focus:border-[#4f533b]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Endirim Növü</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewDiscountType('percent')}
                    className={`py-2 rounded-xl font-bold border transition cursor-pointer flex items-center justify-center gap-1 ${
                      newDiscountType === 'percent'
                        ? 'bg-[#4f533b] text-white border-[#4f533b]'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <Percent className="w-3.5 h-3.5" /> Faiz (%) Endirim
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewDiscountType('fixed')}
                    className={`py-2 rounded-xl font-bold border transition cursor-pointer flex items-center justify-center gap-1 ${
                      newDiscountType === 'fixed'
                        ? 'bg-[#4f533b] text-white border-[#4f533b]'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <DollarSign className="w-3.5 h-3.5" /> Sabit Məbləğ (₼)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">
                    {newDiscountType === 'percent' ? 'Endirim Faizi (%)' : 'Endirim Məbləği (₼)'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={newDiscountType === 'percent' ? 90 : 1000}
                    required
                    value={newDiscountValue}
                    onChange={e => setNewDiscountValue(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 outline-none focus:border-[#4f533b]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Min. Sifariş Məbləği (₼)</label>
                  <input
                    type="number"
                    min={0}
                    value={newMinOrderAmount}
                    onChange={e => setNewMinOrderAmount(Number(e.target.value))}
                    placeholder="0 = Limitsiz"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-[#4f533b]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddCouponModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  Ləğv et
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#4f533b] hover:bg-[#3e4230] text-white transition cursor-pointer shadow-xs"
                >
                  Promo Kodu Yarat Və Aktiv Et
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
