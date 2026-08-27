'use client';

import React, { useState, useEffect } from 'react';
import {
  Award,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Image as ImageIcon,
  Tag,
  Eye,
  Sliders,
} from '../../components/HeroIconsHub';

interface Privilege {
  id: string;
  title: string;
  description: string;
  icon: string;
  image_url?: string;
  badge?: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
}

export default function PrivilegesAdminPage() {
  const [privileges, setPrivileges] = useState<Privilege[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Privilege | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Award');
  const [imageUrl, setImageUrl] = useState('');
  const [badge, setBadge] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  // Status
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadPrivileges = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/catalog/privileges', { cache: 'no-store' });
      const data = await res.json();
      if (Array.isArray(data)) setPrivileges(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrivileges();
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setTitle('');
    setDescription('');
    setIcon('Award');
    setImageUrl('');
    setBadge('');
    setSortOrder(privileges.length);
    setIsActive(true);
    setErrorMsg('');
    setMessage('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Privilege) => {
    setEditingItem(p);
    setTitle(p.title || '');
    setDescription(p.description || '');
    setIcon(p.icon || 'Award');
    setImageUrl(p.image_url || '');
    setBadge(p.badge || '');
    setSortOrder(p.sort_order || 0);
    setIsActive(p.is_active !== false);
    setErrorMsg('');
    setMessage('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setErrorMsg('Başlıq və açıqlama məcburidir.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setMessage('');

    try {
      const payload = {
        id: editingItem?.id,
        title,
        description,
        icon,
        image_url: imageUrl || null,
        badge: badge || null,
        sort_order: Number(sortOrder) || 0,
        is_active: isActive,
      };

      const res = await fetch('/api/catalog/privileges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Yadda saxlanılarkən xəta baş verdi.');
      }

      setMessage('İmtiyaz uğurla yadda saxlanıldı!');
      setIsModalOpen(false);
      loadPrivileges();
    } catch (err: any) {
      setErrorMsg(err.message || 'Xəta baş verdi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu imtiyazı silmək istədiyinizə əminsiniz?')) return;
    try {
      const res = await fetch(`/api/catalog/privileges/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPrivileges(prev => prev.filter(p => p.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#4f533b]/10 text-[#4f533b] flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-800">Müştəri İmtiyazları (VIP)</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Storefront müştəri profilində nümayiş olunan VIP imtiyazlar və təsvirlər.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-5 py-2.5 rounded-xl bg-[#4f533b] hover:bg-[#3e4230] text-white font-bold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni İmtiyaz Əlavə Et</span>
        </button>
      </div>

      {/* Grid of Privileges */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <div className="w-8 h-8 border-3 border-[#4f533b] border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : privileges.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700 mb-1">Hələ heç bir imtiyaz əlavə edilməyib</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            Müştəriləriniz üçün pulsuz çatdırılma, keşbek, VIP xidmət kimi üstünlüklər yaradın.
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-[#4f533b] text-white text-xs font-bold"
          >
            İlk İmtiyazı Yarat
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {privileges.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between relative group hover:border-[#4f533b] transition"
            >
              {p.badge && (
                <span className="absolute top-4 right-4 bg-amber-400 text-slate-900 font-black text-[9px] px-2.5 py-0.5 rounded-full shadow-xs">
                  {p.badge}
                </span>
              )}

              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#f4f5f0] text-[#4f533b] flex items-center justify-center mb-3 border border-[#4f533b]/20">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.title} className="w-6 h-6 object-contain" />
                  ) : (
                    <Award className="w-6 h-6" />
                  )}
                </div>

                <h3 className="font-black text-slate-800 text-base mb-1">{p.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-4">
                  {p.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] font-mono text-slate-400">Sıra: #{p.sort_order}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                    title="Redaktə et"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute right-5 top-5 p-2 rounded-full text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-black text-slate-800 mb-1">
              {editingItem ? 'İmtiyazı Redaktə Et' : 'Yeni Müştəri İmtiyazı'}
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Müştəri bu kartın üzərinə klik etdikdə açılacaq pop-up açıqlama mətnini daxil edin.
            </p>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold mb-4">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1.5 block">İmtiyaz Başlığı *</label>
                <input
                  type="text"
                  required
                  placeholder="Məs: Pulsuz Qapıda Çatdırılma"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-[#4f533b] transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1.5 block">Qısa Badge / Etiket (Opsional)</label>
                <input
                  type="text"
                  placeholder="Məs: VIP, 0₼, Pulsuz"
                  value={badge}
                  onChange={e => setBadge(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-[#4f533b] transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1.5 block">İkon Şəkli URL (və ya Data URL)</label>
                <input
                  type="text"
                  placeholder="https://... və ya boş buraxın"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-800 outline-none focus:border-[#4f533b] transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1.5 block">Pop-up Ətraflı Açıqlaması *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Müştəri bu imtiyaza klik etdikdə açılacaq ətraflı şərtlər və qaydalar..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-[#4f533b] transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1.5 block">Sıralama Nömrəsi</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={e => setSortOrder(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-[#4f533b]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1.5 block">Status</label>
                  <select
                    value={isActive ? 'true' : 'false'}
                    onChange={e => setIsActive(e.target.value === 'true')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-[#4f533b]"
                  >
                    <option value="true">Aktiv</option>
                    <option value="false">Deaktiv</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition"
                >
                  Ləğv Et
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-[#4f533b] hover:bg-[#3e4230] text-white text-xs font-bold shadow-xs transition flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{submitting ? 'Yadda saxlanılır...' : 'Yadda Saxla'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
