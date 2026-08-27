'use client';

import React, { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Search,
  Trash2,
  Edit2,
  X,
  Check,
  Sparkles,
  CheckCircle2,
} from '../../components/HeroIconsHub';

export interface ProductBadge {
  id: string;
  name: string;
  color: string;
  textColor?: string;
}

export const DEFAULT_BADGES: ProductBadge[] = [];

export default function BadgesPage() {
  const [badges, setBadges] = useState<ProductBadge[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState<ProductBadge | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    color: '#ef4444',
    textColor: '#ffffff',
  });

  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = () => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem('technomania_product_badges');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const OLD_DEFAULT_IDS = new Set([
            'b-hit', 'b-new', 'b-discount', 'b-super', 'b-rec', 'b-excl', 'b-free-shipping',
            'bdg-1', 'bdg-2', 'bdg-3', 'bdg-4', 'bdg-5'
          ]);
          const cleaned = parsed.filter((b: any) => !b.id || !OLD_DEFAULT_IDS.has(b.id));
          setBadges(cleaned);
          if (cleaned.length !== parsed.length) {
            localStorage.setItem('technomania_product_badges', JSON.stringify(cleaned));
          }
          return;
        }
      }
    } catch (e) {}
    setBadges([]);
  };

  const handleSaveBadge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const payload: ProductBadge = {
      id: editingBadge ? editingBadge.id : 'badge-' + Date.now(),
      name: formData.name.trim(),
      color: formData.color,
      textColor: formData.textColor,
    };

    const updated = editingBadge
      ? badges.map(b => b.id === editingBadge.id ? payload : b)
      : [payload, ...badges];

    setBadges(updated);
    try {
      localStorage.setItem('technomania_product_badges', JSON.stringify(updated));
      window.dispatchEvent(new Event('techno_badges_updated'));
    } catch (e) {}
    closeModal();
  };

  const handleDeleteBadge = (id: string) => {
    if (!confirm('Bu badge-i (etiketi) silmək istədiyinizdən əminsiniz?')) return;
    const updated = badges.filter(b => b.id !== id);
    setBadges(updated);
    try {
      localStorage.setItem('technomania_product_badges', JSON.stringify(updated));
      window.dispatchEvent(new Event('techno_badges_updated'));
    } catch (e) {}
  };

  const openAddModal = () => {
    setEditingBadge(null);
    setFormData({ name: '', color: '#ef4444', textColor: '#ffffff' });
    setIsModalOpen(true);
  };

  const openEditModal = (b: ProductBadge) => {
    setEditingBadge(b);
    setFormData({ name: b.name, color: b.color, textColor: b.textColor || '#ffffff' });
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingBadge(null); };

  const filteredBadges = badges.filter(b =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5 text-slate-700">

      {/* ── Header ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl text-slate-900 flex items-center gap-2">
              <Tag className="w-5 h-5 text-[#4f533b]" /> Məhsul Badge-ləri & Etiketlər
            </h1>
            <span className="text-xs bg-[#f4f5f0] text-[#4f533b] border border-[#4f533b]/20 px-2.5 py-0.5 rounded-md">
              {badges.length} etiket
            </span>
          </div>
          <p className="text-sm text-slate-500">Məhsulların üzərində görünən rəngli badge-ləri və etiketləri idarə edin</p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="bg-[#4f533b] hover:bg-[#3e4230] text-white text-sm px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer active:scale-95 flex-shrink-0"
        >
          <Plus className="w-4 h-4" /> Yeni Badge Yarat
        </button>
      </div>

      {/* ── Toolbar ── */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Etiket axtar..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-700 outline-none focus:border-[#4f533b] transition placeholder:text-slate-400"
          />
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span>Ümumi Etiketlər: <strong className="text-slate-800">{badges.length}</strong></span>
        </div>
      </div>

      {/* ── Badges Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredBadges.map(b => (
          <div
            key={b.id}
            className="bg-white border border-slate-200 hover:border-[#4f533b] rounded-2xl p-4 flex flex-col justify-between gap-4 shadow-xs group transition-all"
          >
            <div className="flex items-center justify-between">
              <span
                className="px-3 py-1.5 rounded-xl text-xs font-black shadow-xs inline-flex items-center gap-1.5"
                style={{ backgroundColor: b.color, color: b.textColor || '#ffffff' }}
              >
                <Sparkles className="w-3.5 h-3.5" /> {b.name}
              </span>
              <span className="text-[11px] font-mono text-slate-400">{b.color}</span>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => openEditModal(b)}
                className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs py-1.5 rounded-lg border border-slate-200 transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <Edit2 className="w-3 h-3" /> Redaktə
              </button>
              <button
                type="button"
                onClick={() => handleDeleteBadge(b.id)}
                className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-500 border border-rose-100 flex items-center justify-center transition cursor-pointer"
                title="Sil"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {filteredBadges.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 text-sm">
            Axtarışa uyğun badge tapılmadı
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4" onClick={closeModal}>
          <div
            className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl relative"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base text-slate-900 font-bold flex items-center gap-2">
                <Tag className="w-4.5 h-4.5 text-[#4f533b]" />
                {editingBadge ? 'Badge-i Redaktə Et' : 'Yeni Badge Yarat'}
              </h2>
              <button type="button" onClick={closeModal} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 transition cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBadge} className="space-y-4 text-xs">
              <div>
                <label className="block text-sm text-slate-700 font-medium mb-1">Badge Mətni <span className="text-rose-500">*</span></label>
                <input
                  type="text" required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Məsələn: Endirim 30%, Eksklüziv, Super Qiymət"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 outline-none focus:border-[#4f533b] transition"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-700 font-medium mb-1">Badge Rəngi Seçin</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={e => setFormData({ ...formData, color: e.target.value })}
                    className="w-10 h-10 rounded-xl border border-slate-200 p-0.5 cursor-pointer flex-shrink-0"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={e => setFormData({ ...formData, color: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-700"
                  />
                </div>
              </div>

              {/* Rəng Presetləri */}
              <div>
                <label className="block text-xs text-slate-500 mb-1.5 font-medium">Hazır Rəng Palitrası:</label>
                <div className="flex flex-wrap gap-2">
                  {['#ef4444', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#4f533b', '#0f172a'].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: c })}
                      className="w-7 h-7 rounded-lg border border-white shadow-xs cursor-pointer transition hover:scale-110 flex items-center justify-center text-white"
                      style={{ backgroundColor: c }}
                    >
                      {formData.color === c && <CheckCircle2 className="w-4 h-4 drop-shadow-xs" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ön Baxış */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <span className="text-xs text-slate-400 font-medium block">Canlı Ön-baxış:</span>
                <div className="pt-1">
                  <span
                    className="px-3 py-1.5 rounded-xl text-xs font-black shadow-xs inline-flex items-center gap-1.5"
                    style={{ backgroundColor: formData.color, color: formData.textColor }}
                  >
                    <Sparkles className="w-3.5 h-3.5" /> {formData.name || 'Nümunə Badge'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button" onClick={closeModal}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs py-2.5 rounded-xl border border-slate-200 cursor-pointer transition font-bold"
                >
                  Ləğv Et
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#4f533b] hover:bg-[#3e4230] text-white text-xs py-2.5 rounded-xl cursor-pointer transition font-bold flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" /> Yadda Saxla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
