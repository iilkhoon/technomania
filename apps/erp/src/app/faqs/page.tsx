'use client';

import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  MessageCircle,
  Search,
  CheckCircle,
  Clock,
  Send,
  Trash2,
  Edit2,
  Sparkles,
  Filter,
  Check,
} from '../../components/HeroIconsHub';

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

export default function ErpFaqsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'answered'>('all');

  // Replying state
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const loadFaqs = () => {
      try {
        const saved = localStorage.getItem('technomania_product_faqs');
        if (saved) {
          setFaqs(JSON.parse(saved));
        } else {
          setFaqs([]);
        }
      } catch (e) {
        setFaqs([]);
      }
    };

    loadFaqs();
    window.addEventListener('techno_faqs_updated', loadFaqs);
    window.addEventListener('storage', loadFaqs);
    return () => {
      window.removeEventListener('techno_faqs_updated', loadFaqs);
      window.removeEventListener('storage', loadFaqs);
    };
  }, []);

  const saveFaqsList = (list: FaqItem[]) => {
    setFaqs(list);
    try {
      localStorage.setItem('technomania_product_faqs', JSON.stringify(list));
      window.dispatchEvent(new Event('techno_faqs_updated'));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {}
  };

  const handleOpenReply = (faq: FaqItem) => {
    setReplyingId(faq.id);
    setReplyText(faq.answer || '');
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

  const filteredFaqs = faqs.filter(f => {
    if (filterStatus === 'pending' && f.answer) return false;
    if (filterStatus === 'answered' && !f.answer) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchQ = f.question.toLowerCase().includes(q);
      const matchProd = f.product_name.toLowerCase().includes(q);
      const matchAuthor = f.author_name.toLowerCase().includes(q);
      if (!matchQ && !matchProd && !matchAuthor) return false;
    }

    return true;
  });

  const pendingCount = faqs.filter(f => !f.answer).length;
  const answeredCount = faqs.filter(f => Boolean(f.answer)).length;

  return (
    <div className="space-y-6 max-w-6xl text-slate-700">
      {/* Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl text-slate-900 font-black flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#4f533b]" /> Məhsul Sualları Və Cavabları (Q&A)
            </h1>
            <span className="text-xs bg-[#f4f5f0] text-[#4f533b] border border-[#4f533b]/20 px-2.5 py-0.5 rounded-md font-bold">
              Marketinq & Müştəri Xidməti
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Müştərilərin məhsul səhifəsində verdiyi sualları cavablandırın və ya idarə edin.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
            ⏳ {pendingCount} Cavabsız Sual
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
            ✓ {answeredCount} Cavablandırılıb
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Sual, məhsul adı və ya müştəri adı ilə axtar..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-700 outline-none focus:border-[#4f533b] transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          {(['all', 'pending', 'answered'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer capitalize ${
                filterStatus === status
                  ? 'bg-[#4f533b] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status === 'all' && 'Hamısı'}
              {status === 'pending' && 'Cavabsızlar'}
              {status === 'answered' && 'Cavablandırılanlar'}
            </button>
          ))}
        </div>
      </div>

      {/* Q&A List Cards */}
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
                    ✓ Cavablandırıldı
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
                    <Send className="w-3.5 h-3.5" /> Cavabı Dərc Et
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
                    onClick={() => handleOpenReply(f)}
                    className="text-xs text-[#4f533b] font-bold hover:underline cursor-pointer"
                  >
                    Düzəliş Et ✏️
                  </button>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium pl-4">{f.answer}</p>
              </div>
            ) : (
              <div className="pt-2 flex justify-start">
                <button
                  onClick={() => handleOpenReply(f)}
                  className="px-4 py-2 rounded-xl bg-[#4f533b] hover:bg-[#3e4230] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" /> Bu Suala Cavab Yaz
                </button>
              </div>
            )}
          </div>
        ))}

        {filteredFaqs.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-2">
            <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-extrabold text-slate-700 text-sm">Hələ ki heç bir sual tapılmadı</h3>
            <p className="text-xs text-slate-400">Müştərilər məhsul səhifəsində sual verdikdə bura düşəcək.</p>
          </div>
        )}
      </div>
    </div>
  );
}
