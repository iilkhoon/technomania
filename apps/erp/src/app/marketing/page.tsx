'use client';

import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Tag,
  Gift,
  Plus,
  Star,
  Check,
  X,
  Trash2,
  Search,
  MessageSquare,
  Sparkles,
  AlertCircle,
  ThumbsUp,
  Filter,
  Package,
  Copy,
  Link as LinkIcon,
  Percent,
  DollarSign,
} from '../../components/HeroIconsHub';
import { getLocalProducts } from '../../lib/supabase';
import { Product } from '../../types';
import {
  PromoCoupon,
  getLocalCoupons,
  saveLocalCoupons
} from '../../lib/couponManager';

export interface ProductReview {
  id: string;
  product_id: string;
  product_name: string;
  user_name: string;
  user_email: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export default function MarketingPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'reviews' | 'campaigns'>('reviews');
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [coupons, setCoupons] = useState<PromoCoupon[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCouponId, setCopiedCouponId] = useState<string | null>(null);

  // Add Review Modal State
  const [isAddReviewModalOpen, setIsAddReviewModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');

  // Add Coupon Modal State
  const [isAddCouponModalOpen, setIsAddCouponModalOpen] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newDiscountType, setNewDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [newDiscountValue, setNewDiscountValue] = useState<number>(20);
  const [newMinOrderAmount, setNewMinOrderAmount] = useState<number>(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const loadData = () => {
    // Load products
    const prods = getLocalProducts() || [];
    setProducts(prods);

    // Load reviews
    try {
      const saved = localStorage.getItem('technomania_product_reviews');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setReviews(parsed);
      } else {
        setReviews([]);
      }
    } catch (e) {
      setReviews([]);
    }

    // Load coupons
    setCoupons(getLocalCoupons());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    window.addEventListener('techno_reviews_updated', loadData);
    window.addEventListener('techno_coupons_updated', loadData);
    return () => {
      window.removeEventListener('storage', loadData);
      window.removeEventListener('techno_reviews_updated', loadData);
      window.removeEventListener('techno_coupons_updated', loadData);
    };
  }, []);

  const saveReviewsList = (list: ProductReview[]) => {
    setReviews(list);
    try {
      localStorage.setItem('technomania_product_reviews', JSON.stringify(list));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('techno_reviews_updated'));
    } catch (e) {}
  };

  const handleUpdateStatus = (id: string, status: 'approved' | 'rejected') => {
    const updated = reviews.map(r => r.id === id ? { ...r, status } : r);
    saveReviewsList(updated);
  };

  const handleDeleteReview = (id: string) => {
    if (!confirm('Bu müştəri rəyini silmək istədiyinizdən əminsiniz?')) return;
    const updated = reviews.filter(r => r.id !== id);
    saveReviewsList(updated);
  };

  const handleCreateReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !newUserName.trim() || !selectedProductId) return;

    const prod = products.find(p => String(p.id) === String(selectedProductId));
    const newReview: ProductReview = {
      id: 'rev-' + Date.now(),
      product_id: String(selectedProductId),
      product_name: prod ? (prod.name || prod.model_name || 'Məhsul') : 'Seçilmiş Məhsul',
      user_name: newUserName.trim(),
      user_email: newUserEmail.trim() || 'user@mail.az',
      rating: Number(newRating) || 5,
      comment: newComment.trim(),
      status: 'approved',
      created_at: new Date().toISOString(),
    };

    saveReviewsList([newReview, ...reviews]);
    setIsAddReviewModalOpen(false);
    setNewComment('');
    setNewUserName('');
    setNewUserEmail('');
  };

  // Coupon Handlers
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

  // Metrics
  const pendingCount = reviews.filter(r => r.status === 'pending').length;
  const approvedCount = reviews.filter(r => r.status === 'approved').length;

  const filteredReviews = reviews.filter(r => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      r.product_name.toLowerCase().includes(q) ||
      r.user_name.toLowerCase().includes(q) ||
      r.comment.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-6xl text-slate-700">
      {/* ── Header ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-[#4f533b]" /> Marketinq və promo kodlar
            </h1>
            <span className="text-xs bg-[#f4f5f0] text-[#4f533b] border border-[#4f533b]/20 px-2.5 py-0.5 rounded-md font-bold">
              Marketinq və aksiyalar
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Promo kodları və kuponları idarə edin, avtomatik keçid linkləri yaradın və müştəri rəylərini moderasiya edin.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'reviews' ? (
            <button
              onClick={() => {
                if (products.length > 0 && !selectedProductId) setSelectedProductId(String(products[0].id));
                setIsAddReviewModalOpen(true);
              }}
              className="bg-[#4f533b] hover:bg-[#3e4230] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer active:scale-95 flex-shrink-0"
            >
              <Plus className="w-4 h-4" /> Yeni rəy əlavə et
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddCouponModalOpen(true)}
              className="bg-[#4f533b] hover:bg-[#3e4230] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer active:scale-95 flex-shrink-0"
            >
              <Plus className="w-4 h-4" /> Yeni promo kod yarat
            </button>
          )}
        </div>
      </div>

      {/* ── Navigation Tabs Bar ── */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer relative ${
            activeTab === 'reviews'
              ? 'bg-[#4f533b] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span>Müştəri rəyləri ({reviews.length})</span>
          {pendingCount > 0 && (
            <span className="ml-1 bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
              {pendingCount} gözləyir
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('campaigns')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'campaigns'
              ? 'bg-[#4f533b] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <Tag className="w-4 h-4" /> Promo kodlar və kuponlar ({coupons.length})
        </button>
      </div>

      {/* ── TAB 1: PRODUCT REVIEWS MODERATION HUB ── */}
      {activeTab === 'reviews' && (
        <div className="space-y-5">
          {/* Analytics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-bold block">Ümumi Rəylər</span>
                <span className="text-xl font-black text-slate-900 mt-1 block">{reviews.length} rəy</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-bold block">Gözləyən Rəylər</span>
                <span className="text-xl font-black text-amber-600 mt-1 block">{pendingCount} gözləyir</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-bold block">Təsdiqlənən Rəylər</span>
                <span className="text-xl font-black text-emerald-600 mt-1 block">{approvedCount} rəy</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ThumbsUp className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1 mr-1">
                <Filter className="w-3.5 h-3.5" /> Status:
              </span>
              {(['all', 'pending', 'approved', 'rejected'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    statusFilter === st
                      ? 'bg-[#4f533b] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st === 'all' && 'Bütün Rəylər'}
                  {st === 'pending' && `⏳ Gözləyənlər (${pendingCount})`}
                  {st === 'approved' && `✓ Təsdiqlənənlər (${approvedCount})`}
                  {st === 'rejected' && '✕ İmtina Edilənlər'}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Məhsul adı və ya rəy yazan ilə axtar..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-700 outline-none focus:border-[#4f533b] transition"
              />
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-3">
            {filteredReviews.map(r => (
              <div
                key={r.id}
                className="bg-white border border-slate-200 hover:border-[#4f533b] rounded-2xl p-5 shadow-xs transition space-y-3"
              >
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-[#4f533b] bg-[#f4f5f0] border border-[#4f533b]/20 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                        <Package className="w-3 h-3 text-[#4f533b]" /> {r.product_name}
                      </span>
                      {r.status === 'approved' && (
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          ✓ Təsdiqlənib (Saytda Canlıdır)
                        </span>
                      )}
                      {r.status === 'pending' && (
                        <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-md animate-pulse">
                          ⏳ Admin Təsdiqi Gözləyir
                        </span>
                      )}
                      {r.status === 'rejected' && (
                        <span className="bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          ✕ İmtina Edilib
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-extrabold text-sm text-slate-900">{r.user_name}</span>
                      <span className="text-xs text-slate-400">({r.user_email})</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-400 font-mono" suppressHydrationWarning>
                        {isMounted ? new Date(r.created_at).toLocaleDateString('az-AZ') : r.created_at}
                      </span>
                    </div>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= (r.rating || 5)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-black text-amber-800 ml-1">{r.rating}.0</span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-medium bg-slate-50 border border-slate-100 p-3.5 rounded-xl">
                  "{r.comment}"
                </p>

                <div className="flex items-center justify-end gap-2 pt-1">
                  {r.status !== 'approved' && (
                    <button
                      onClick={() => handleUpdateStatus(r.id, 'approved')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer shadow-2xs"
                    >
                      <Check className="w-3.5 h-3.5" /> Təsdiqlə Və Saytda Yayımla
                    </button>
                  )}

                  {r.status !== 'rejected' && (
                    <button
                      onClick={() => handleUpdateStatus(r.id, 'rejected')}
                      className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer shadow-2xs"
                    >
                      <X className="w-3.5 h-3.5" /> İmtina Et
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteReview(r.id)}
                    className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    title="Rəyi Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {filteredReviews.length === 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-2">
                <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="font-extrabold text-slate-700 text-sm">Hələ ki rəy tapılmadı</h3>
                <p className="text-xs text-slate-400">Filtrlərə uyğun heç bir müştəri rəyi yoxdur.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: PROMO CODES & COUPONS MANAGER ── */}
      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-extrabold text-slate-900 block text-sm">Aktiv Promo Kodlar Və Avtomatik Keçid Linkləri</span>
              <span className="text-slate-400">Her promo kod üçün avtomatik link yaradılır. Keçid edən istifadəçilərə səbətdə avtomatik tətbiq olunur.</span>
            </div>
            <button
              onClick={() => setIsAddCouponModalOpen(true)}
              className="bg-[#4f533b] hover:bg-[#3e4230] text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" /> Yeni Promo Kod Əlavə Et
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons.map(c => (
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
          </div>
        </div>
      )}

      {/* ── MODAL: CREATE NEW PROMO COUPON ── */}
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

      {/* ── MODAL: MANUAL CREATE REVIEW (Admin Panel) ── */}
      {isAddReviewModalOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsAddReviewModalOpen(false)}
        >
          <div
            className="bg-white border border-slate-200 text-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative my-auto animate-fadeIn space-y-5"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <h3 className="font-extrabold text-base text-slate-900">Məhsul Üçün Yeni Rəy Əlavə Et</h3>
              </div>
              <button
                onClick={() => setIsAddReviewModalOpen(false)}
                className="p-1 rounded-lg bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Məhsulu Seçin</label>
                <select
                  value={selectedProductId}
                  onChange={e => setSelectedProductId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-[#4f533b]"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name || p.model_name} ({p.brand})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Müştəri Adı</label>
                  <input
                    type="text"
                    required
                    value={newUserName}
                    onChange={e => setNewUserName(e.target.value)}
                    placeholder="Məs: Elvin Rəhimov"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-[#4f533b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Müştəri Email</label>
                  <input
                    type="email"
                    value={newUserEmail}
                    onChange={e => setNewUserEmail(e.target.value)}
                    placeholder="elvin@mail.az"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-[#4f533b]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Reytinq Ulduzu (1 - 5)</label>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-2 rounded-xl">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setNewRating(s)}
                      className="p-1 cursor-pointer transition transform hover:scale-125"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          s <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-black text-slate-700 ml-2">{newRating}.0 / 5.0</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Müştəri Rəyi</label>
                <textarea
                  rows={3}
                  required
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Məhsul haqqında müsbət və ya obyektiv rəy yazın..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 outline-none focus:border-[#4f533b]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddReviewModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  Ləğv et
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#4f533b] hover:bg-[#3e4230] text-white transition cursor-pointer shadow-xs"
                >
                  Rəyi Təsdiqlə Və Yarad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
