'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  UploadCloud,
  Search,
  Check,
  Trash2,
  Image as ImageIcon,
  RefreshCw,
  Plus,
  Maximize2,
  FolderOpen,
} from './HeroIconsHub';
import {
  MediaItem,
  fetchApiMedia,
  saveMediaToApi,
  deleteMediaFromApi,
  uploadImageToStorageApi,
  getLocalMedia,
} from '../lib/supabase';

interface MediaGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImages: (urls: string[]) => void;
  multiple?: boolean;
}

export default function MediaGalleryModal({
  isOpen,
  onClose,
  onSelectImages,
  multiple = true,
}: MediaGalleryModalProps) {
  const [mounted, setMounted] = useState(false);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadMedia();
      setSelectedUrls([]);
    }
  }, [isOpen]);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const items = await fetchApiMedia();
      setMediaList(Array.isArray(items) ? items : getLocalMedia());
    } catch (e) {
      console.error('Error loading media:', e);
      setMediaList(getLocalMedia());
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const fileArray = Array.from(files);

    try {
      for (const file of fileArray) {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        const storageUrl = await uploadImageToStorageApi(base64, 'media');

        const saved = await saveMediaToApi({
          name: file.name.replace(/\.[^/.]+$/, ''),
          url: storageUrl,
        });

        if (saved) {
          setMediaList(prev => [saved, ...prev.filter(m => m.id !== saved.id)]);
        }
      }
    } catch (err) {
      console.error('Error uploading file to media gallery:', err);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const toggleSelectUrl = (url: string) => {
    if (multiple) {
      if (selectedUrls.includes(url)) {
        setSelectedUrls(prev => prev.filter(u => u !== url));
      } else {
        setSelectedUrls(prev => [...prev, url]);
      }
    } else {
      setSelectedUrls([url]);
    }
  };

  const handleDeleteMedia = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (!confirm(`"${name || 'Şəkil'}" faylını qalereyadan silmək istədiyinizdən əminsiniz?`)) return;

    setMediaList(prev => prev.filter(m => m.id !== id));
    await deleteMediaFromApi(id);
  };

  const handleConfirmSelection = () => {
    if (selectedUrls.length > 0) {
      onSelectImages(selectedUrls);
      onClose();
    }
  };

  if (!mounted || !isOpen) return null;

  const filteredMedia = mediaList.filter(item => {
    if (!searchQuery.trim()) return true;
    const name = (item.name || '').toLowerCase();
    const url = (item.url || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    return name.includes(q) || url.includes(q);
  });

  const modalContent = (
    <div
      className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-[999999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white border border-slate-200 text-slate-900 rounded-3xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl relative my-auto animate-fadeIn overflow-hidden z-10"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#f4f5f0] text-[#4f533b] border border-[#4f533b]/20 flex items-center justify-center font-bold">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Server Mediya Qalereyası
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Serverə yüklənmiş bütün şəkillərə baxın və məhsul üçün istədiyinizi seçin
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition cursor-pointer border border-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar Bar */}
        <div className="p-4 border-b border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Şəkil adı üzrə axtar..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-700 outline-none focus:border-[#4f533b] transition"
            />
          </div>

          {/* Upload Button & Stats */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <span className="text-xs text-slate-500 font-semibold hidden md:inline">
              Ümumi: <strong className="text-slate-900">{mediaList.length} şəkil</strong>
            </span>

            <button
              type="button"
              onClick={loadMedia}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition cursor-pointer"
              title="Yenilə"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <label className="bg-[#4f533b] hover:bg-[#3e4230] text-white text-xs px-3.5 py-2 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer font-bold relative">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
              <UploadCloud className="w-4 h-4" />
              {uploading ? 'Yüklənir...' : '+ Qalereyaya Yüklə'}
            </label>
          </div>
        </div>

        {/* Media Grid Gallery */}
        <div className="flex-1 p-5 overflow-y-auto min-h-[320px] max-h-[55vh]">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-[#4f533b]" />
              <span className="text-sm font-medium">Mediya şəkilləri yüklənir...</span>
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <ImageIcon className="w-12 h-12 mx-auto text-slate-300 stroke-[1.5]" />
              <p className="text-sm font-semibold text-slate-600">Qalereyada şəkil tapılmadı!</p>
              <p className="text-xs text-slate-400">Yuxarıdakı "+ Qalereyaya Yüklə" düyməsi ilə yeni şəkillər əlavə edin.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3.5">
              {filteredMedia.map(item => {
                const isSelected = selectedUrls.includes(item.url);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleSelectUrl(item.url)}
                    className={`group relative rounded-2xl border-2 transition overflow-hidden cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#4f533b] ring-2 ring-[#4f533b]/20 bg-[#f4f5f0]/30 shadow-md'
                        : 'border-slate-200 hover:border-slate-400 bg-slate-50'
                    }`}
                  >
                    {/* Image Box */}
                    <div className="h-32 w-full p-2 flex items-center justify-center relative bg-white">
                      <img
                        src={item.url}
                        alt={item.name}
                        className="max-h-full max-w-full object-contain"
                      />

                      {/* Select indicator */}
                      <div className={`absolute top-2 left-2 w-5 h-5 rounded-md flex items-center justify-center transition ${
                        isSelected ? 'bg-[#4f533b] text-white shadow-xs' : 'bg-slate-900/40 text-transparent group-hover:bg-slate-900/60'
                      }`}>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>

                      {/* Preview Lightbox Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewImage(item.url);
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white opacity-0 group-hover:opacity-100 transition hover:bg-black/70"
                        title="Böyüt (Bax)"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Footer Info & Actions */}
                    <div className="p-2 bg-white border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 truncate text-[11px] max-w-[100px]" title={item.name}>
                        {item.name || 'Şəkil'}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteMedia(e, item.id, item.name)}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Qalereyadan sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-600 font-semibold">
            {selectedUrls.length > 0 ? (
              <span className="text-[#4f533b] font-bold">
                {selectedUrls.length} şəkil seçilib
              </span>
            ) : (
              'Məhsula əlavə etmək üçün şəkillərə klikləyin'
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer border border-slate-200"
            >
              Ləğv Et
            </button>
            <button
              type="button"
              onClick={handleConfirmSelection}
              disabled={selectedUrls.length === 0}
              className="px-5 py-2 rounded-xl bg-[#4f533b] hover:bg-[#3e4230] text-white text-xs font-bold transition shadow-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" /> Seçilənləri Məhsula Əlavə Et ({selectedUrls.length})
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox Modal Preview */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/80 z-[1000000] flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[85vh] p-2">
            <img src={previewImage} alt="Preview" className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl" />
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(modalContent, document.body);
}
