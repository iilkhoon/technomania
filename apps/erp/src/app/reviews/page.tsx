'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Star,
  Check,
  X,
  Trash2,
  Search,
  Plus,
  AlertCircle,
  ThumbsUp,
  Filter,
  Package,
  Sparkles,
  HelpCircle,
  Send,
  CheckCircle,
} from '../../components/HeroIconsHub';
import { getLocalProducts } from '../../lib/supabase';
import { Product } from '../../types';

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

export interface FaqItem {
  id: string;
  product_id: string;
  product_name: string;
  author_name: string;
  question: string;
  answer?: string;
  answered_by?: string;
  created_at: string;
  answered_at?: string;
}

export default function ReviewsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'reviews' | 'qa'>('reviews');
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Replying QA State
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Add Review Modal State
  const [isAddReviewModalOpen, setIsAddReviewModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');

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

    // Load FAQs/Questions
    try {
      const savedFaqs = localStorage.getItem('technomania_product_faqs');
      if (savedFaqs) {
        const parsedFaqs = JSON.parse(savedFaqs);
        if (Array.isArray(parsedFaqs)) setFaqs(parsedFaqs);
      } else {
        setFaqs([]);
      }
    } catch (e) {
      setFaqs([]);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    window.addEventListener('techno_reviews_updated', loadData);
    window.addEventListener('techno_faqs_updated', loadData);
    return () => {
      window.removeEventListener('storage', loadData);
      window.removeEventListener('techno_reviews_updated', loadData);
      window.removeEventListener('techno_faqs_updated', loadData);
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

  const saveFaqsList = (list: FaqItem[]) => {
    setFaqs(list);
    try {
      localStorage.setItem('technomania_product_faqs', JSON.stringify(list));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('techno_faqs_updated'));
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

  const handleSaveReply = (id: string) => {
    if (!replyText.trim()) return;

    const updated = faqs.map(f => {
      if (f.id === id) {
        return {
          ...f,
          answer: replyText.trim(),
          answered_by: 'Techno Support (Admin)',
          answered_at: new Date().toISOString(),
        };
      }
      return f;
    });

    saveFaqsList(updated);
    setReplyingId(null);
    setReplyText('');
  };

  const handleDeleteFaq = (id: string) => {
    if (!confirm('Bu sualı silmək istədiyinizdən əminsiniz?')) return;
    const updated = faqs.filter(f => f.id !== id);
    saveFaqsList(updated);
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

  // Metrics
  const pendingReviewsCount = reviews.filter(r => r.status === 'pending').length;
  const approvedReviewsCount = reviews.filter(r => r.status === 'approved').length;
  const pendingFaqsCount = faqs.filter(f => !f.answer).length;
  const answeredFaqsCount = faqs.filter(f => Boolean(f.answer)).length;

  const avgStoreRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / reviews.length).toFixed(1)
    : '5.0';

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

  const filteredFaqs = faqs.filter(f => {
    const q = searchQuery.toLowerCase().trim();
    const matchQ = !q || f.question.toLowerCase().includes(q) || f.product_name.toLowerCase().includes(q) || f.author_name.toLowerCase().includes(q);
    return matchQ;
  });

  return (
    <div className="space-y-6 max-w-6xl text-slate-700">
      {/* ── Header ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#4f533b]" /> Müştəri rəyləri və suallar moderasiyası
            </h1>
          </div>
          <p className="text-sm text-slate-500">
            Alıcıların məhsullara yazdığı rəyləri təsdiqləyin, sualları cavablandırın və ulduz reytinqini idarə edin.
          </p>
        </div>

        {activeTab === 'reviews' && (
          <button
            onClick={() => {
              if (products.length > 0 && !selectedProductId) setSelectedProductId(String(products[0].id));
              setIsAddReviewModalOpen(true);
            }}
            className="bg-[#4f533b] hover:bg-[#3e4230] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer active:scale-95 flex-shrink-0"
          >
            <Plus className="w-4 h-4" /> Yeni Rəy Əlavə Et
          </button>
        )}
      </div>

      {/* ── Navigation Tabs ── */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'reviews'
              ? 'bg-[#4f533b] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span>Müştəri rəyləri ({reviews.length})</span>
          {pendingReviewsCount > 0 && (
            <span className="bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
              {pendingReviewsCount} gözləyir
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('qa')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'qa'
              ? 'bg-[#4f533b] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Məhsul sualları və cavablar ({faqs.length})</span>
          {pendingFaqsCount > 0 && (
            <span className="bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
              {pendingFaqsCount} cavabsız
            </span>
          )}
        </button>
      </div>

      {/* ── TAB 1: REVIEWS MODERATION ── */}
      {activeTab === 'reviews' && (
        <div className="space-y-5">
          {/* Analytics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-bold block">Ümumi rəylər</span>
                <span className="text-xl font-black text-slate-900 mt-1 block">{reviews.length} rəy</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-bold block">Gözləyən rəylər</span>
                <span className="text-xl font-black text-amber-600 mt-1 block">{pendingReviewsCount} gözləyir</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-bold block">Təsdiqlənən rəylər</span>
                <span className="text-xl font-black text-emerald-600 mt-1 block">{approvedReviewsCount} rəy</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ThumbsUp className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-bold block">Orta bal (rating)</span>
                <span className="text-xl font-black text-amber-500 mt-1 block flex items-center gap-1">
                  ⭐ {avgStoreRating} / 5.0
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                <Star className="w-5 h-5 fill-amber-400" />
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
                  {st === 'pending' && `⏳ Gözləyənlər (${pendingReviewsCount})`}
                  {st === 'approved' && `✓ Təsdiqlənənlər (${approvedReviewsCount})`}
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

                {/* Comment Text */}
                <p className="text-xs text-slate-700 leading-relaxed font-medium bg-slate-50 border border-slate-100 p-3.5 rounded-xl">
                  "{r.comment}"
                </p>

                {/* Action Buttons */}
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

      {/* ── TAB 2: PRODUCT QUESTIONS (Q&A) MODERATION ── */}
      {activeTab === 'qa' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-700">
              Müştərilərin məhsul səhifəsindən verdiyi suallar və rəsmi cavablarınız:
            </span>
            <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-xl font-bold">
              ⏳ {pendingFaqsCount} Cavabsız Sual
            </span>
          </div>

          <div className="space-y-4">
            {filteredFaqs.map(f => (
              <div key={f.id} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-black text-[#4f533b] bg-[#f4f5f0] border border-[#4f533b]/20 px-2.5 py-0.5 rounded-md inline-block mb-1">
                      📦 {f.product_name}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-base">"{f.question}"</h3>
                    <span className="text-xs text-slate-400 mt-1 block" suppressHydrationWarning>
                      Göndərən: <strong className="text-slate-700">{f.author_name}</strong> • {isMounted ? new Date(f.created_at).toLocaleDateString('az-AZ') : f.created_at}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {f.answer ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        ✓ Cavablandırıldı Və Saytda Yayımlandı
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        ⏳ Cavabsız
                      </span>
                    )}
                    <button
                      onClick={() => handleDeleteFaq(f.id)}
                      className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Answer Display or Reply Editor */}
                {replyingId === f.id ? (
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                    <label className="block text-xs font-bold text-slate-700">Menecer Cavabını Yazın:</label>
                    <textarea
                      rows={3}
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder="Müştərinin sualına rəsmi cavabı bura qeyd edin..."
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 outline-none focus:border-[#4f533b]"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setReplyingId(null)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 bg-white"
                      >
                        Ləğv Et
                      </button>
                      <button
                        onClick={() => handleSaveReply(f.id)}
                        className="px-4 py-1.5 rounded-xl bg-[#4f533b] hover:bg-[#3e4230] text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" /> Cavabı Saytda Yayımla
                      </button>
                    </div>
                  </div>
                ) : f.answer ? (
                  <div className="bg-emerald-50/70 border border-emerald-200 p-3.5 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-900 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Rəsmi Cavab ({f.answered_by || 'Techno Support'}):
                      </span>
                      <button
                        onClick={() => { setReplyingId(f.id); setReplyText(f.answer || ''); }}
                        className="text-xs text-[#4f533b] font-bold hover:underline cursor-pointer"
                      >
                        Redaktə et
                      </button>
                    </div>
                    <p className="text-xs text-emerald-950 font-medium">"{f.answer}"</p>
                  </div>
                ) : (
                  <button
                    onClick={() => { setReplyingId(f.id); setReplyText(''); }}
                    className="bg-[#4f533b] hover:bg-[#3e4230] text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" /> Cavab Yaz Və Saytda Göstər
                  </button>
                )}
              </div>
            ))}

            {filteredFaqs.length === 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-2">
                <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="font-extrabold text-slate-700 text-sm">Hələ ki məhsul sualı yoxdur</h3>
                <p className="text-xs text-slate-400">Müştərilər məhsul səhifəsindən sual verdikdə burada əks olunacaq.</p>
              </div>
            )}
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
                        className={`w-6 h-6 ${s <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
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
