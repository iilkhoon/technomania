'use client';

import React, { useState, useEffect } from 'react';
import {
  Award,
  Plus,
  Search,
  Trash2,
  Star,
  Edit2,
  X,
  Check,
  Upload,
  Globe,
  Image as ImageIcon,
  CheckCircle2,
} from '../../components/HeroIconsHub';
import { getLocalBrands, saveLocalBrands } from '../../lib/supabase';
import { Brand } from '../../types';

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    logo: '',
    is_popular: true,
  });

  const [logoMode, setLogoMode] = useState<'url' | 'upload'>('url');
  const [previewLogo, setPreviewLogo] = useState<string>('');

  useEffect(() => { loadBrands(); }, []);

  const loadBrands = async () => {
    if (typeof window === 'undefined') return;
    try {
      const res = await fetch('/api/catalog/brands');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setBrands(data.map((b: any) => ({
            ...b,
            logo: b.logo_url || b.logo
          })));
          return;
        }
      }
    } catch (e) {}
    setBrands(getLocalBrands() || []);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('Şəkil ölçüsü maksimum 3MB ola bilər!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setFormData(prev => ({ ...prev, logo: dataUrl }));
        setPreviewLogo(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const logoValue = formData.logo.trim() || undefined;

    const brandPayload: any = {
      id: editingBrand ? editingBrand.id : 'b-' + Date.now(),
      name: formData.name.trim(),
      slug: formData.slug.trim() || formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      logo_url: logoValue,
      logo: logoValue,
      is_popular: formData.is_popular,
    };

    try {
      const res = await fetch('/api/catalog/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brandPayload),
      });
      if (res.ok) {
        loadBrands();
        closeModal();
        return;
      }
    } catch (e) {
      console.error('Failed to save brand to backend:', e);
    }

    const updated = editingBrand
      ? brands.map(b => b.id === editingBrand.id ? brandPayload : b)
      : [brandPayload, ...brands];

    setBrands(updated);
    saveLocalBrands(updated);
    closeModal();
  };

  const togglePopularStatus = async (brand: Brand) => {
    const updatedIsPopular = !brand.is_popular;
    const updatedBrands = brands.map(b =>
      b.id === brand.id ? { ...b, is_popular: updatedIsPopular } : b
    );
    setBrands(updatedBrands);
    saveLocalBrands(updatedBrands);

    const brandPayload: any = {
      ...brand,
      logo_url: (brand as any).logo_url || brand.logo,
      is_popular: updatedIsPopular,
    };

    try {
      await fetch('/api/catalog/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache, no-store, must-revalidate' },
        body: JSON.stringify(brandPayload),
      });
    } catch (e) {
      console.error('Failed to toggle brand popular status via API:', e);
    }
  };

  const handleDeleteBrand = async (id: string) => {
    if (!confirm('Bu brendi silmək istədiyinizdən əminsiniz?')) return;
    const updated = brands.filter(b => b.id !== id);
    setBrands(updated);
    saveLocalBrands(updated);
  };

  const openAddModal = () => {
    setEditingBrand(null);
    setFormData({ name: '', slug: '', logo: '', is_popular: true });
    setPreviewLogo('');
    setLogoMode('url');
    setIsModalOpen(true);
  };

  const openEditModal = (b: Brand) => {
    setEditingBrand(b);
    const existingLogo = (b as any).logo_url || b.logo || '';
    setFormData({ name: b.name, slug: b.slug || '', logo: existingLogo, is_popular: !!b.is_popular });
    setPreviewLogo(existingLogo);
    setLogoMode(existingLogo.startsWith('data:') ? 'upload' : 'url');
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingBrand(null); };

  const filteredBrands = brands.filter(b =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.slug && b.slug.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-5 text-slate-700">

      {/* ── Header ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#4f533b]" /> Brendlər kataloqu və siyahısı
            </h1>
            <span className="text-xs bg-[#f4f5f0] text-[#4f533b] border border-[#4f533b]/20 px-2.5 py-0.5 rounded-md">
              {brands.length} brend
            </span>
          </div>
          <p className="text-sm text-slate-500">Rəsmi təchizatçı brendlərini idarə edin, loqo yükləyin və ya URL əlavə edin</p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="bg-[#4f533b] hover:bg-[#3e4230] text-white text-sm px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer active:scale-95 flex-shrink-0"
        >
          <Plus className="w-4 h-4" /> Yeni brend əlavə et
        </button>
      </div>

      {/* ── Toolbar & Stats ── */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Siyahıda brend axtar..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-700 outline-none focus:border-[#4f533b] transition placeholder:text-slate-400"
          />
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span>Ümumi Siyahı: <strong className="text-slate-800">{brands.length}</strong></span>
          <span>Populyar (TOP): <strong className="text-[#4f533b]">{brands.filter(b => b.is_popular).length}</strong></span>
        </div>
      </div>

      {/* ── Brands Table List View ── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="grid grid-cols-12 gap-4 px-6 py-3.5 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 tracking-wider select-none">
          <div className="col-span-5 sm:col-span-4">Brend Adı & Loqo</div>
          <div className="col-span-3 sm:col-span-3">URL Slug</div>
          <div className="col-span-2 sm:col-span-2">Status</div>
          <div className="col-span-2 sm:col-span-3 text-right">Əməliyyatlar</div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredBrands.map(b => {
            const logoSrc = (b as any).logo_url || b.logo;

            return (
              <div
                key={b.id}
                className="grid grid-cols-12 gap-4 px-6 py-3.5 items-center hover:bg-slate-50 transition-colors group"
              >
                {/* Logo + Name */}
                <div className="col-span-5 sm:col-span-4 flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-1.5 flex items-center justify-center flex-shrink-0 shadow-2xs group-hover:border-[#4f533b] transition">
                    {logoSrc ? (
                      <img src={logoSrc} alt={b.name} className="max-h-full max-w-full object-contain" />
                    ) : (
                      <Award className="w-6 h-6 text-slate-300" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#4f533b] transition truncate">
                      {b.name}
                    </h3>
                    <span className="text-[11px] text-slate-400 block truncate">
                      {logoSrc ? (logoSrc.startsWith('data:') ? 'Yüklənmiş Şəkil' : 'URL Loqo') : 'Loqo təyin edilməyib'}
                    </span>
                  </div>
                </div>

                {/* Slug */}
                <div className="col-span-3 sm:col-span-3">
                  <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200 inline-block truncate max-w-full">
                    /{b.slug || b.name.toLowerCase()}
                  </span>
                </div>

                {/* Status Toggle Switch */}
                <div className="col-span-2 sm:col-span-2">
                  <button
                    type="button"
                    onClick={() => togglePopularStatus(b)}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer active:scale-95 border ${
                      b.is_popular
                        ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 shadow-2xs'
                        : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                    }`}
                    title={b.is_popular ? 'TOP brend statusunu ləğv et' : 'TOP brend statusu təyin et'}
                  >
                    <Star className={`w-3.5 h-3.5 ${b.is_popular ? 'fill-amber-400 text-amber-500' : 'text-slate-400'}`} />
                    <span>{b.is_popular ? 'TOP Brend' : 'Standart'}</span>
                    <span className={`w-7 h-4 rounded-full p-0.5 transition-colors flex items-center ${
                      b.is_popular ? 'bg-amber-500 justify-end' : 'bg-slate-300 justify-start'
                    }`}>
                      <span className="w-3 h-3 rounded-full bg-white shadow-xs" />
                    </span>
                  </button>
                </div>

                {/* Actions */}
                <div className="col-span-2 sm:col-span-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(b)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#4f533b] hover:text-white text-slate-600 text-xs transition border border-slate-200 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Redaktə
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteBrand(b.id)}
                      className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-600 hover:text-white text-slate-500 transition border border-slate-200 cursor-pointer"
                      title="Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredBrands.length === 0 && (
            <div className="py-16 text-center text-slate-400 text-sm">
              Siyahıda axtarışa uyğun brend tapılmadı
            </div>
          )}
        </div>
      </div>

      {/* ── Add / Edit Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4" onClick={closeModal}>
          <div
            className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl relative"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base text-slate-900 font-bold flex items-center gap-2">
                <Award className="w-4.5 h-4.5 text-[#4f533b]" />
                {editingBrand ? 'Brendi Redaktə Et' : 'Yeni Brend Əlavə Et'}
              </h2>
              <button type="button" onClick={closeModal} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 transition cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBrand} className="space-y-4 text-xs">
              <div>
                <label className="block text-sm text-slate-700 font-medium mb-1">Brend Adı <span className="text-rose-500">*</span></label>
                <input
                  type="text" required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Məsələn: Apple, Samsung, Xiaomi"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 outline-none focus:border-[#4f533b] transition"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-700 font-medium mb-1">URL Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={e => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="apple, samsung"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-700 outline-none focus:border-[#4f533b] transition"
                />
              </div>

              {/* ── LOGO MODE SWITCHER (URL vs FILE UPLOAD) ── */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <label className="block text-sm text-slate-700 font-medium">Brend Loqosu Mənbəyi</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setLogoMode('url')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      logoMode === 'url' ? 'bg-white text-[#4f533b] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" /> URL Keçidi
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogoMode('upload')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      logoMode === 'upload' ? 'bg-white text-[#4f533b] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" /> Kompüterdən Yüklə
                  </button>
                </div>

                {logoMode === 'url' ? (
                  <div>
                    <input
                      type="text"
                      value={formData.logo}
                      onChange={e => {
                        setFormData({ ...formData, logo: e.target.value });
                        setPreviewLogo(e.target.value);
                      }}
                      placeholder="https://upload.wikimedia.org/.../logo.svg"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 outline-none focus:border-[#4f533b] transition"
                    />
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-200 hover:border-[#4f533b] rounded-2xl p-4 text-center bg-slate-50 transition cursor-pointer relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <Upload className="w-6 h-6 text-[#4f533b] mx-auto mb-1" />
                    <span className="text-xs font-bold text-slate-700 block">Şəkil faylını seçin və ya bura atın</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">PNG, SVG, JPG (Maksimum 3MB)</span>
                  </div>
                )}

                {/* Live Logo Preview Box */}
                {previewLogo && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center flex-shrink-0 shadow-2xs">
                      <img src={previewLogo} alt="Preview" className="max-h-full max-w-full object-contain" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Loqo Ön-baxışı Hazırdır
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                        {previewLogo.startsWith('data:') ? 'Fayldan Yüklənmiş Şəkil' : previewLogo}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_popular}
                    onChange={e => setFormData({ ...formData, is_popular: e.target.checked })}
                    className="w-4 h-4 rounded accent-[#4f533b] cursor-pointer"
                  />
                  <span className="text-xs text-slate-700 font-medium cursor-pointer">Populyar brend (Ana səhifədə vurğulansın)</span>
                </label>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
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
