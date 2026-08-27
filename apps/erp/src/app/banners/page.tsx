'use client';

import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Plus,
  Smartphone,
  Monitor,
  Edit2,
  Trash2,
  Info,
  X,
  Power,
  UploadCloud,
  Upload,
  Link as LinkIcon,
  Check,
  Eye,
} from '../../components/HeroIconsHub';
import { getLocalBanners, saveLocalBanners, BannerItem, getErpHeaders } from '../../lib/supabase';

export default function BannersPage() {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'desktop' | 'mobile' | 'search'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [positionKey, setPositionKey] = useState<BannerItem['position']>('hero_slide_1');
  const [image, setImage] = useState('');
  const [link, setLink] = useState('');
  const [active, setActive] = useState(true);

  // Upload State
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const fetchBannersApi = async (path: string, options?: RequestInit) => {
    if (typeof window === 'undefined') return null;
    const mergedOpts: RequestInit = {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        ...getErpHeaders(),
        ...(options?.headers || {})
      },
      ...options
    };
    try {
      const r1 = await fetch(path, mergedOpts);
      if (r1.ok) return r1;
    } catch (e) {}
    try {
      const r2 = await fetch(`/erp${path}`, mergedOpts);
      if (r2.ok) return r2;
    } catch (e) {}
    return null;
  };

  const saveBannersToApi = async (list: BannerItem[]) => {
    try {
      saveLocalBanners(list);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('techno_banners_updated'));
        window.dispatchEvent(new Event('storage'));
      }
      await fetchBannersApi('/api/catalog/banners', {
        method: 'POST',
        headers: getErpHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(list)
      });
    } catch (e) {
      console.error('Failed to sync banners to backend:', e);
    }
  };

  useEffect(() => {
    fetchBannersApi('/api/catalog/banners')
      .then(r => r ? r.json() : null)
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setBanners(data);
          try { saveLocalBanners(data); } catch (e) {}
        } else {
          setBanners(getLocalBanners());
        }
      })
      .catch(() => setBanners(getLocalBanners()));

    const handleStorageUpdate = () => {
      setBanners(getLocalBanners());
    };
    window.addEventListener('techno_banners_updated', handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);
    return () => {
      window.removeEventListener('techno_banners_updated', handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, []);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Zəhmət olmasa yalnız şəkil faylı seçin (PNG, JPG, WEBP, SVG)!');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      if (!rawDataUrl) return;

      const img = new Image();
      img.onload = () => {
        const MAX_WIDTH = 1400;
        const MAX_HEIGHT = 1400;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          if (width > height) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          } else {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
          setImage(compressedDataUrl);
          setFileName(file.name);
        } else {
          setImage(rawDataUrl);
          setFileName(file.name);
        }
      };
      img.onerror = () => {
        setImage(rawDataUrl);
        setFileName(file.name);
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const openAddModal = () => {
    setEditingBanner(null);
    setTitle('');
    setSubtitle('');
    setPositionKey('hero_slide_1');
    setImage('');
    setLink('');
    setFileName('');
    setUploadMode('file');
    setActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (b: BannerItem) => {
    setEditingBanner(b);
    setTitle(b.title || '');
    setSubtitle(b.subtitle || '');
    setPositionKey(b.position || 'hero_slide_1');
    setImage(b.image || '');
    setLink(b.link || '');
    setFileName(b.image?.startsWith('data:') ? 'Yüklənmiş şəkil' : '');
    setUploadMode(b.image?.startsWith('data:') ? 'file' : 'url');
    setActive(!!b.active);
    setIsModalOpen(true);
  };

  const handleToggleActive = (id: number | string) => {
    const updated = banners.map((b) => (b.id === id ? { ...b, active: !b.active } : b));
    setBanners(updated);
    saveBannersToApi(updated);
  };

  const handleDeleteBanner = (id: number | string) => {
    if (!confirm('Bu banneri silmək istədiyinizdən əminsiniz?')) return;
    const updated = banners.filter((b) => b.id !== id);
    setBanners(updated);
    saveBannersToApi(updated);
  };

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let positionLabel = 'Ana səhifə əsas slayder (sol)';
    let dimensions = '870 × 460 px';
    let ratio = '19:10';

    if (positionKey === 'hero_slide_2') {
      positionLabel = 'Ana səhifə slayder 2 (sağ)';
      dimensions = '300 × 460 px';
      ratio = '2:3';
    } else if (positionKey === 'mobile_top') {
      positionLabel = 'Mobil top banner';
      dimensions = '800 × 240 px';
      ratio = '10:3';
    } else if (positionKey === 'search_banner') {
      positionLabel = 'Axtarış səhifəsi banneri';
      dimensions = '1400 × 280 px';
      ratio = '5:1';
    } else if (positionKey === 'bottom_promo') {
      positionLabel = 'Aşağı promo banner';
      dimensions = '1400 × 320 px';
      ratio = '35:8';
    }

    const payloadImage = image.trim() || '/banners/technomania_credit_banner.png';

    let updatedList: BannerItem[];

    if (editingBanner) {
      updatedList = banners.map((b) =>
        b.id === editingBanner.id
          ? {
              ...b,
              title,
              subtitle,
              position: positionKey,
              positionLabel,
              dimensions,
              ratio,
              image: payloadImage,
              link,
              active,
            }
          : b
      );
    } else {
      const newObj: BannerItem = {
        id: Date.now(),
        title,
        subtitle,
        position: positionKey,
        positionLabel,
        dimensions,
        ratio,
        image: payloadImage,
        link,
        active,
      };
      updatedList = [newObj, ...banners];
    }

    setBanners(updatedList);
    saveBannersToApi(updatedList);
    setIsModalOpen(false);
  };

  const filteredBanners = banners.filter((b) => {
    if (activeTab === 'desktop') return b.position.startsWith('hero') || b.position === 'bottom_promo';
    if (activeTab === 'mobile') return b.position === 'mobile_top';
    if (activeTab === 'search') return b.position === 'search_banner';
    return true;
  });

  return (
    <div className="space-y-6 text-slate-700">
      {/* ── Başlıq Bölməsi ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#4f533b]" /> Banner və reklam idarəetməsi
            </h1>
            <span className="text-xs bg-[#f4f5f0] text-[#4f533b] border border-[#4f533b]/20 px-2.5 py-0.5 rounded-full font-semibold">
              {banners.length} banner
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Ana səhifə slayderləri, mobil bannerlər və reklam yerlərini sadə qaydada idarə edin.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="bg-[#4f533b] hover:bg-[#3e4230] text-white text-xs px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer active:scale-95 flex-shrink-0 font-semibold"
        >
          <Plus className="w-4 h-4" /> Yeni banner əlavə et
        </button>
      </div>

      {/* ── Şəkil Ölçüləri Və Təlimat ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#4f533b]" />
          <h3 className="text-xs font-bold text-slate-900">
            Tövsiyə olunan şəkil ölçüləri
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
            <span className="text-[11px] text-[#4f533b] font-bold block">Ana səhifə əsas slayder (sol)</span>
            <div className="text-sm font-mono font-bold text-slate-900">870 × 460 px</div>
            <span className="text-[11px] text-slate-500">Nisbət: 19:10</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
            <span className="text-[11px] text-indigo-700 font-bold block">Ana səhifə slayder 2 (sağ)</span>
            <div className="text-sm font-mono font-bold text-slate-900">300 × 460 px</div>
            <span className="text-[11px] text-slate-500">Nisbət: 2:3</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
            <span className="text-[11px] text-amber-700 font-bold block">Mobil top banner</span>
            <div className="text-sm font-mono font-bold text-slate-900">800 × 240 px</div>
            <span className="text-[11px] text-slate-500">Kateqoriya üstü</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
            <span className="text-[11px] text-rose-700 font-bold block">🔍 Axtarış Səhifəsi Banneri</span>
            <div className="text-sm font-mono font-bold text-slate-900">1400 × 280 px</div>
            <span className="text-[11px] text-slate-500">Xüsusi axtarış</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
            <span className="text-[11px] text-emerald-700 font-bold block">Aşağı promo banner</span>
            <div className="text-sm font-mono font-bold text-slate-900">1400 × 320 px</div>
            <span className="text-[11px] text-slate-500">Geniş promo</span>
          </div>
        </div>
      </div>

      {/* ── Tablar ── */}
      <div className="bg-white border border-slate-200 p-3 rounded-2xl shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'all' ? 'bg-[#4f533b] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bütün bannerlər ({banners.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('desktop')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'desktop' ? 'bg-[#4f533b] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" /> Masaüstü ({banners.filter(b => b.position.startsWith('hero') || b.position === 'bottom_promo').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('mobile')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'mobile' ? 'bg-[#4f533b] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" /> Mobil ({banners.filter(b => b.position === 'mobile_top').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'search' ? 'bg-[#4f533b] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🔍 Axtarış Səhifəsi ({banners.filter(b => b.position === 'search_banner').length})
          </button>
        </div>

        <span className="text-xs text-slate-500 hidden sm:inline-block">
          Cəmi: <strong className="text-slate-900">{filteredBanners.length}</strong> banner nümayiş olunur
        </span>
      </div>

      {/* ── Banner Kartları ── */}
      {filteredBanners.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
          <ImageIcon className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">Hələ heç bir banner əlavə olunmayıb</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Mobil və ya masaüstü ana səhifə üçün "Yeni banner əlavə et" düyməsinə vuraraq ilk bannerinizi əlavə edin.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBanners.map((b) => (
            <div
              key={b.id}
              className={`bg-white border rounded-2xl p-4 shadow-xs space-y-3 transition flex flex-col justify-between ${
                b.active ? 'border-slate-200 hover:border-[#4f533b]' : 'border-slate-200 bg-slate-50 opacity-60'
              }`}
            >
              <div>
                {/* Banner Önizləmə Şəkli */}
                <div className="w-full h-44 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 mb-3 relative group">
                  <img
                    src={b.image}
                    alt={b.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    <span
                      className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${
                        b.active
                          ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-700 text-white border-slate-800'
                      }`}
                    >
                      {b.active ? 'Aktiv' : 'Deaktiv'}
                    </span>
                  </div>

                  <span className="absolute bottom-2 right-2 bg-slate-900/80 text-white font-mono text-[11px] px-2 py-0.5 rounded-md">
                    {b.dimensions}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{b.title}</h3>
                {b.subtitle && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{b.subtitle}</p>}

                <div className="flex items-center justify-between text-xs text-slate-400 mt-3 pt-2.5 border-t border-slate-100">
                  <span className="truncate">Mövqe: <strong className="text-slate-700 font-semibold">{b.positionLabel || b.position}</strong></span>
                  <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">{b.ratio}</span>
                </div>
              </div>

              {/* Əməliyyat Düymələri */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleToggleActive(b.id)}
                  className={`text-xs px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer font-semibold ${
                    b.active
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  {b.active ? 'Deaktiv et' : 'Aktiv et'}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEditModal(b)}
                    className="p-1.5 rounded-xl bg-slate-100 hover:bg-[#4f533b] hover:text-white text-slate-600 border border-slate-200 transition cursor-pointer"
                    title="Redaktə et"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteBanner(b.id)}
                    className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-600 hover:text-white text-slate-600 border border-slate-200 transition cursor-pointer"
                    title="Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Əlavə Et / Redaktə Et Modal ── */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                {editingBanner ? <Edit2 className="w-4 h-4 text-[#4f533b]" /> : <Plus className="w-4 h-4 text-[#4f533b]" />}
                {editingBanner ? 'Banneri redaktə et' : 'Yeni banner əlavə et'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 transition cursor-pointer p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold text-xs mb-1">Banner başlığı *</label>
                <input
                  type="text"
                  required
                  placeholder="Məs: Möhtəşəm kreditlə telefon sahibi olmaq daha asan"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs outline-none focus:border-[#4f533b] transition font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold text-xs mb-1">Alt mətn / qısa təsvir</label>
                <input
                  type="text"
                  placeholder="Məs: 0% ilkin ödəniş, 24 ayadək komissiyasız taksit!"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs outline-none focus:border-[#4f533b] transition font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold text-xs mb-1">Mövqe və şəkil ölçüsü</label>
                <select
                  value={positionKey}
                  onChange={(e) => setPositionKey(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs outline-none focus:border-[#4f533b] transition font-medium"
                >
                  <option value="hero_slide_1">Ana səhifə əsas slayder (sol) — [870 × 460 px]</option>
                  <option value="hero_slide_2">Ana səhifə slayder 2 (sağ) — [300 × 460 px]</option>
                  <option value="mobile_top">Mobil top banner — [800 × 240 px]</option>
                  <option value="search_banner">🔍 Axtarış Səhifəsi Xüsusi Banneri — [1400 × 280 px]</option>
                  <option value="bottom_promo">Aşağı promo banner — [1400 × 320 px]</option>
                </select>
              </div>

              {/* Banner Şəkli Yükləmə Bölməsi */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-700 font-bold text-xs">Banner şəkli *</label>
                  <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setUploadMode('file')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                        uploadMode === 'file' ? 'bg-[#4f533b] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <UploadCloud className="w-3 h-3" /> Kompyuterdən yüklə
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMode('url')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                        uploadMode === 'url' ? 'bg-[#4f533b] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <LinkIcon className="w-3 h-3" /> URL linki
                    </button>
                  </div>
                </div>

                {uploadMode === 'file' ? (
                  <div className="space-y-2">
                    <input
                      type="file"
                      id="banner-file-input"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onClick={() => document.getElementById('banner-file-input')?.click()}
                      className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
                        isDragging
                          ? 'border-[#4f533b] bg-[#f4f5f0]'
                          : image
                          ? 'border-emerald-300 bg-emerald-50/30'
                          : 'border-slate-300 hover:border-[#4f533b] bg-slate-50/50 hover:bg-[#f4f5f0]/40'
                      }`}
                    >
                      {image ? (
                        <div className="w-full space-y-2">
                          <div className="relative w-full h-36 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 shadow-xs">
                            <img src={image} alt="Banner preview" className="w-full h-full object-cover" />
                            <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
                              <Check className="w-3 h-3" /> Yükləndi
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-slate-600 px-1">
                            <span className="truncate max-w-[200px] font-mono text-[11px] text-slate-700">
                              {fileName || 'Şəkil seçildi'}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                document.getElementById('banner-file-input')?.click();
                              }}
                              className="text-[#4f533b] font-semibold hover:underline cursor-pointer"
                            >
                              Şəkli dəyiş
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-full bg-[#f4f5f0] text-[#4f533b] border border-[#4f533b]/20 flex items-center justify-center">
                            <Upload className="w-5 h-5" />
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-xs font-bold text-slate-800">
                              Fayl seçmək üçün bura klikləyin və ya faylı sürüşdürün
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Tövsiyə olunan şəkil formatları: PNG, JPG, WEBP, SVG
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      placeholder="https://example.com/banner.png"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs outline-none focus:border-[#4f533b] transition font-medium"
                    />
                    {image && (
                      <div className="mt-2 w-full h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                        <img src={image} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-bold text-xs mb-1">Keçid linki (istəyə bağlı)</label>
                <input
                  type="text"
                  placeholder="#products-grid-section və ya /catalog/smartphones"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs outline-none focus:border-[#4f533b] transition font-medium"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="active-check"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 accent-[#4f533b] rounded cursor-pointer"
                />
                <label htmlFor="active-check" className="text-slate-700 font-semibold text-xs cursor-pointer">
                  Aktiv banner (saytda nümayiş olunsun)
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs transition border border-slate-200 cursor-pointer"
                >
                  Ləğv et
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-2 rounded-xl bg-[#4f533b] hover:bg-[#3e4230] text-white font-bold text-xs transition cursor-pointer shadow-xs active:scale-95"
                >
                  {editingBanner ? 'Yadda saxla' : 'Banneri əlavə et'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
