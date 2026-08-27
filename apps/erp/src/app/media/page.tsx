'use client';

import React, { useState, useEffect } from 'react';
import {
  ImageIcon,
  Upload,
  Search,
  Copy,
  Trash2,
  CheckCircle,
  ExternalLink,
  Video,
  FileImage,
  RefreshCw,
  Plus,
  Folder,
  FolderOpen,
  Eye,
  X,
  Layers,
  Filter,
  Check,
} from '../../components/HeroIconsHub';

interface MediaFile {
  id: string;
  name: string;
  url: string;
  folder?: string;
  created_at?: string;
}

const FOLDERS = [
  { id: 'all', name: 'Bütün medialar', icon: Layers },
  { id: 'products', name: 'Məhsul şəkilləri', icon: Folder },
  { id: 'banners', name: 'Bannerlər və slaydlar', icon: Folder },
  { id: 'brands', name: 'Brend loqoları', icon: Folder },
  { id: 'other', name: 'Digər fayllar', icon: Folder }
];

export default function MediaGalleryPage() {
  const [mediaList, setMediaList] = useState<MediaFile[]>([]);
  const [search, setSearch] = useState('');
  const [activeFolder, setActiveFolder] = useState('all');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadName, setUploadName] = useState('');
  const [uploadFolder, setUploadFolder] = useState('products');
  const [modalOpen, setModalOpen] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<MediaFile | null>(null);

  const loadMedia = () => {
    fetch('/api/catalog/media', {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setMediaList(data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu faylı silmək istədiyinizdən əminsiniz?')) return;
    try {
      await fetch(`/api/catalog/media/${id}`, { method: 'DELETE' });
      loadMedia();
    } catch (e) {}
  };

  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadUrl.trim()) return;
    setIsUploading(true);
    try {
      const res = await fetch('/api/catalog/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: uploadName.trim() || 'Fayl-' + Date.now(),
          url: uploadUrl.trim(),
          folder: uploadFolder
        })
      });
      if (res.ok) {
        setUploadUrl('');
        setUploadName('');
        setModalOpen(false);
        loadMedia();
      }
    } catch (e) {
      alert('Xəta baş verdi');
    } finally {
      setIsUploading(false);
    }
  };

  const isVideoUrl = (url: string) => {
    return url.endsWith('.mp4') || url.endsWith('.webm') || url.includes('youtube.com') || url.includes('youtu.be');
  };

  const filtered = mediaList.filter(item => {
    const matchSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.url.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;

    if (activeFolder !== 'all') {
      const itemFolder = item.folder || (item.name.toLowerCase().includes('banner') ? 'banners' : (item.name.toLowerCase().includes('logo') || item.name.toLowerCase().includes('brend') ? 'brands' : 'products'));
      if (itemFolder !== activeFolder) return false;
    }

    if (filterType === 'image') return !isVideoUrl(item.url);
    if (filterType === 'video') return isVideoUrl(item.url);
    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-800">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4f533b]/10 text-[#4f533b] text-xs font-bold">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Fayl və media mərkəzi</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Server medya qalereyası
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Məhsullara, bannerlərə və brendlərə aid bütün şəkillər, loqolar və videoların kateqoriyalaşdırılmış arxivi
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={loadMedia}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            title="Yenilə"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4f533b] hover:bg-[#3e4230] text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni media əlavə et</span>
          </button>
        </div>
      </div>

      {/* ── Folder Category Pills ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {FOLDERS.map(f => {
          const Icon = f.icon;
          const isActive = activeFolder === f.id;
          const count = f.id === 'all'
            ? mediaList.length
            : mediaList.filter(m => (m.folder || (m.name.toLowerCase().includes('banner') ? 'banners' : (m.name.toLowerCase().includes('logo') ? 'brands' : 'products'))) === f.id).length;

          return (
            <button
              key={f.id}
              onClick={() => setActiveFolder(f.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer border ${
                isActive
                  ? 'bg-[#4f533b] text-white border-[#4f533b] shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{f.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Search & Media Type Filter ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Fayl adı və ya URL ilə axtar..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-700 outline-none focus:border-[#4f533b] transition"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterType === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Hamısı
          </button>
          <button
            onClick={() => setFilterType('image')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              filterType === 'image' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FileImage className="w-3.5 h-3.5" />
            <span>Şəkillər</span>
          </button>
          <button
            onClick={() => setFilterType('video')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              filterType === 'video' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Videolar</span>
          </button>
        </div>
      </div>

      {/* ── Media Grid ── */}
      {filtered.length === 0 ? (
        <div className="bg-white p-16 rounded-3xl border border-dashed border-slate-200 text-center space-y-3">
          <ImageIcon className="w-12 h-12 mx-auto text-slate-300" />
          <div className="text-sm font-bold text-slate-700">Bu qovluqda heç bir media faylı tapılmadı</div>
          <p className="text-xs text-slate-400">Yeni URL əlavə edərək fayl bazasını zənginləşdirə bilərsiniz</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map(item => {
            const isVideo = isVideoUrl(item.url);
            const isCopied = copiedId === item.id;

            return (
              <div
                key={item.id}
                className="group relative bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Thumbnail Preview */}
                <div
                  onClick={() => setPreviewMedia(item)}
                  className="relative aspect-square w-full bg-slate-50 flex items-center justify-center overflow-hidden cursor-pointer"
                >
                  {isVideo ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white p-2">
                      <Video className="w-8 h-8 text-amber-400 mb-1" />
                      <span className="text-[10px] text-slate-300 font-mono text-center truncate w-full">Video Fayl</span>
                    </div>
                  ) : (
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      className="w-8 h-8 rounded-full bg-white/90 text-slate-800 flex items-center justify-center shadow-xs hover:scale-110 transition"
                      title="Böyük baxış"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Info Bar */}
                <div className="p-3 bg-white space-y-1.5 border-t border-slate-100">
                  <div className="text-xs font-bold text-slate-800 truncate" title={item.name}>
                    {item.name}
                  </div>

                  <div className="flex items-center justify-between gap-1 pt-1">
                    <button
                      onClick={() => handleCopy(item.id, item.url)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                        isCopied ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                      title="URL kopyala"
                    >
                      {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{isCopied ? 'Kopyalandı' : 'Kopyala'}</span>
                    </button>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                      title="Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══ ADD MEDIA MODAL ══ */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-slate-900">Yeni media faylı əlavə et</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMedia} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Faylın adı</label>
                <input
                  type="text"
                  value={uploadName}
                  onChange={e => setUploadName(e.target.value)}
                  placeholder="Məs: iPhone 15 Pro Max Natural Titanium"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-[#4f533b] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Fayl / Şəkil URL-i *</label>
                <input
                  type="url"
                  required
                  value={uploadUrl}
                  onChange={e => setUploadUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... və ya /images/..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-mono outline-none focus:border-[#4f533b] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Qovluq / Kateqoriya</label>
                <select
                  value={uploadFolder}
                  onChange={e => setUploadFolder(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-[#4f533b] transition"
                >
                  <option value="products">Məhsul şəkilləri</option>
                  <option value="banners">Bannerlər və slaydlar</option>
                  <option value="brands">Brend loqoları</option>
                  <option value="other">Digər fayllar</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Ləğv et
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2 rounded-xl bg-[#4f533b] hover:bg-[#3e4230] text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isUploading ? 'Əlavə edilir...' : 'Yadda saxla'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ LIGHTBOX PREVIEW MODAL ══ */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative bg-white rounded-3xl p-4 max-w-2xl w-full border border-slate-200 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-bold text-xs text-slate-800 truncate">{previewMedia.name}</span>
              <button
                onClick={() => setPreviewMedia(null)}
                className="w-7 h-7 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-full aspect-video bg-slate-900 rounded-2xl flex items-center justify-center overflow-hidden">
              {isVideoUrl(previewMedia.url) ? (
                <video src={previewMedia.url} controls className="max-h-full max-w-full" autoPlay />
              ) : (
                <img src={previewMedia.url} alt={previewMedia.name} className="max-h-full max-w-full object-contain" />
              )}
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="font-mono text-[11px] text-slate-500 truncate max-w-[400px]">{previewMedia.url}</span>
              <button
                onClick={() => handleCopy(previewMedia.id, previewMedia.url)}
                className="px-3 py-1.5 rounded-xl bg-[#4f533b] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>URL kopyala</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
