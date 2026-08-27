'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Play,
  Trash2,
  Edit3,
  X,
  ExternalLink,
  Save,
  ArrowUp,
  ArrowDown,
  Video,
  CheckCircle2,
} from '../../components/HeroIconsHub';
import {
  YouTubeVideo,
  DEFAULT_CHANNEL_URL,
  extractYouTubeId,
  getLocalYouTubeVideos,
  saveLocalYouTubeVideos,
  fetchApiYouTubeVideos,
  saveApiYouTubeVideos,
  getLocalChannelUrl,
  saveLocalChannelUrl,
} from '../../lib/youtubeManager';
import { showToast } from '../../lib/toastStore';

const YouTubeIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

export default function VideosManagementPage() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [channelUrl, setChannelUrl] = useState(DEFAULT_CHANNEL_URL);
  const [isChannelEditing, setIsChannelEditing] = useState(false);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formCustomThumb, setFormCustomThumb] = useState('');
  const [formViews, setFormViews] = useState('');
  const [formSortOrder, setFormSortOrder] = useState(1);
  const [formIsActive, setFormIsActive] = useState(true);

  // Preview Modal
  const [previewVideo, setPreviewVideo] = useState<YouTubeVideo | null>(null);

  const loadData = async () => {
    try {
      const apiVideos = await fetchApiYouTubeVideos();
      setVideos(apiVideos);
    } catch {
      setVideos(getLocalYouTubeVideos());
    }
    setChannelUrl(getLocalChannelUrl());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    window.addEventListener('techno_youtube_updated', loadData);
    return () => {
      window.removeEventListener('storage', loadData);
      window.removeEventListener('techno_youtube_updated', loadData);
    };
  }, []);

  const handleSaveChannelUrl = () => {
    saveLocalChannelUrl(channelUrl);
    setIsChannelEditing(false);
    showToast('YouTube kanal linki uğurla yeniləndi! 🎥', 'success');
  };

  const openAddModal = () => {
    setEditingVideoId(null);
    setFormTitle('');
    setFormUrl('');
    setFormCustomThumb('');
    setFormViews('25.0K baxış');
    setFormSortOrder(videos.length + 1);
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (v: YouTubeVideo) => {
    setEditingVideoId(v.id);
    setFormTitle(v.title);
    setFormUrl(v.youtube_url);
    setFormCustomThumb(v.thumbnail_url || '');
    setFormViews(v.views_count || '');
    setFormSortOrder(v.sort_order || 1);
    setFormIsActive(v.is_active);
    setIsModalOpen(true);
  };

  const handleSaveVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formUrl.trim()) {
      showToast('Zəhmət olmasa video adı və YouTube linkini daxil edin.', 'error');
      return;
    }

    const extractedId = extractYouTubeId(formUrl);
    if (!extractedId) {
      showToast('Düzgün YouTube linki daxil edin (Məs: https://www.youtube.com/watch?v=...)', 'error');
      return;
    }

    const autoThumb = `https://img.youtube.com/vi/${extractedId}/hqdefault.jpg`;
    const finalThumb = formCustomThumb.trim() ? formCustomThumb.trim() : autoThumb;

    let updated: YouTubeVideo[];
    if (editingVideoId) {
      updated = videos.map(v =>
        v.id === editingVideoId
          ? {
            ...v,
            title: formTitle.trim(),
            youtube_url: formUrl.trim(),
            video_id: extractedId,
            thumbnail_url: finalThumb,
            views_count: formViews.trim() || '20.0K baxış',
            sort_order: Number(formSortOrder) || 1,
            is_active: formIsActive,
          }
          : v
      );
      showToast('Video icmalı uğurla yeniləndi! 🎬', 'success');
    } else {
      const newVideo: YouTubeVideo = {
        id: 'yt-' + Date.now(),
        title: formTitle.trim(),
        youtube_url: formUrl.trim(),
        video_id: extractedId,
        thumbnail_url: finalThumb,
        views_count: formViews.trim() || '20.0K baxış',
        sort_order: Number(formSortOrder) || videos.length + 1,
        is_active: formIsActive,
        created_at: new Date().toISOString(),
      };
      updated = [...videos, newVideo];
      showToast('Yeni YouTube video icmalı əlavə edildi! 🚀', 'success');
    }

    updated.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    setVideos(updated);
    saveApiYouTubeVideos(updated);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bu videonu silmək istədiyinizə əminsiniz?')) {
      const updated = videos.filter(v => v.id !== id);
      setVideos(updated);
      saveApiYouTubeVideos(updated);
      showToast('Video silindi.', 'success');
    }
  };

  const handleToggleActive = (id: string) => {
    const updated = videos.map(v => (v.id === id ? { ...v, is_active: !v.is_active } : v));
    setVideos(updated);
    saveApiYouTubeVideos(updated);
    showToast('Video statusu dəyişdirildi.', 'success');
  };

  const handleMoveOrder = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= videos.length) return;

    const copy = [...videos];
    const temp = copy[index];
    copy[index] = copy[newIdx];
    copy[newIdx] = temp;

    const reordered = copy.map((v, i) => ({ ...v, sort_order: i + 1 }));
    setVideos(reordered);
    saveApiYouTubeVideos(reordered);
  };

  const liveExtractedId = extractYouTubeId(formUrl);
  const activeCount = videos.filter(v => v.is_active).length;

  return (
    <div className="space-y-6 text-slate-700">
      {/* ═══ 1. HEADER & ACTIONS ═══ */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Video className="w-5 h-5 text-[#4f533b]" /> YouTube Video İcmallar
            </h1>
            <span className="text-xs bg-[#f4f5f0] text-[#4f533b] border border-[#4f533b]/20 px-2.5 py-0.5 rounded-full font-semibold">
              {videos.length} video
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Ana səhifədəki <span className="font-semibold text-slate-700">"Texno icmallar ilə seçimini düzgün et"</span> bölməsində çıxan videoları idarə edin.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button
            type="button"
            onClick={openAddModal}
            className="bg-[#4f533b] hover:bg-[#3e4230] text-white text-xs px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer active:scale-95 font-semibold"
          >
            <Plus className="w-4 h-4" /> Yeni video əlavə et
          </button>
        </div>
      </div>

      {/* ═══ 2. STATS & CHANNEL LINK BAR ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Stat 1: Total & Active */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 tracking-wider">Ümumi Videolar</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {videos.length} <span className="text-sm font-normal text-slate-400">ədəd</span>
            </div>
            <span className="text-xs text-emerald-600 font-semibold">
              {activeCount} aktiv video
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#f4f5f0] text-[#4f533b] border border-[#4f533b]/10 flex items-center justify-center">
            <Video className="w-6 h-6" />
          </div>
        </div>

        {/* Stat 2: Home Visibility */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 tracking-wider">Ana Səhifədə Görünür</span>
            <div className="text-2xl font-bold text-[#4f533b] mt-1">
              {Math.min(3, activeCount)} / 3 <span className="text-sm font-normal text-slate-400">video</span>
            </div>
            <span className="text-xs text-slate-500">İlk 3 aktiv video ana səhifədə çıxır</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center">
            <YouTubeIcon className="w-6 h-6 text-rose-600" />
          </div>
        </div>

        {/* Stat 3: Channel URL Configuration */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 tracking-wider">YouTube Kanal Keçid Linki</span>
            <a
              href={channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#4f533b] font-semibold hover:underline flex items-center gap-1"
            >
              <span>Kanala bax</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <input
              type="text"
              value={channelUrl}
              onChange={e => {
                setChannelUrl(e.target.value);
                setIsChannelEditing(true);
              }}
              placeholder="https://youtube.com/@technomania"
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-[#4f533b] text-slate-800 transition"
            />
            {isChannelEditing && (
              <button
                type="button"
                onClick={handleSaveChannelUrl}
                className="px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition flex items-center gap-1 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Yadda saxla</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ═══ 3. VIDEOS LIST TABLE / CARDS ═══ */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>Mövcud Video İcmallar</span>
            <span className="text-xs bg-white text-slate-600 border border-slate-200 font-semibold px-2 py-0.5 rounded-full">
              {videos.length}
            </span>
          </h2>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            (Sıralama nömrəsinə görə ilk 3 aktiv video ana səhifədə birbaşa görünəcək)
          </span>
        </div>

        {videos.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Video className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-500">Hələ heç bir YouTube videosu əlavə edilməyib.</p>
            <button
              type="button"
              onClick={openAddModal}
              className="px-4 py-2 rounded-xl bg-[#4f533b] text-white text-xs font-bold shadow-xs hover:bg-[#3e4230] transition cursor-pointer"
            >
              İlk Videonu Əlavə Et →
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {videos.map((video, idx) => {
              const thumb =
                video.thumbnail_url ||
                (video.video_id ? `https://img.youtube.com/vi/${video.video_id}/hqdefault.jpg` : '');

              const isVisibleOnHome = idx < 3 && video.is_active;

              return (
                <div
                  key={video.id}
                  className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  {/* Left: Thumbnail + Title + Info */}
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    {/* Reorder Buttons */}
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveOrder(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer transition"
                        title="Yuxarı daşı"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveOrder(idx, 'down')}
                        disabled={idx === videos.length - 1}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer transition"
                        title="Aşağı daşı"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Thumbnail with Player preview click */}
                    <div
                      onClick={() => setPreviewVideo(video)}
                      className="relative w-28 sm:w-36 aspect-video rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200 cursor-pointer group shadow-2xs"
                    >
                      <img src={thumb} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-[#4f533b] text-white flex items-center justify-center shadow-md">
                          <Play className="w-4 h-4 fill-white translate-x-0.5" />
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-400">#{video.sort_order || idx + 1}</span>
                        {isVisibleOnHome && (
                          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                            ★ Ana Səhifədə Aktiv
                          </span>
                        )}
                        <span className="text-xs text-slate-400 font-mono">ID: {video.video_id}</span>
                      </div>

                      <h3 className="font-bold text-sm sm:text-base text-slate-900 line-clamp-1">
                        {video.title}
                      </h3>

                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        {video.views_count && <span>👁 {video.views_count}</span>}
                        <a
                          href={video.youtube_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#4f533b] hover:underline flex items-center gap-1 font-semibold"
                        >
                          <YouTubeIcon className="w-3.5 h-3.5 text-rose-600" />
                          <span>YouTube-da aç</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Right: Status Switch & Actions */}
                  <div className="flex items-center gap-2.5 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                    {/* Active Switch */}
                    <button
                      type="button"
                      onClick={() => handleToggleActive(video.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${video.is_active
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
                        }`}
                    >
                      {video.is_active ? <CheckCircle2 className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      <span>{video.is_active ? 'Aktiv' : 'Deaktiv'}</span>
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => openEditModal(video)}
                      className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer border border-transparent hover:border-slate-200"
                      title="Düzəliş et"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDelete(video.id)}
                      className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition cursor-pointer border border-transparent hover:border-rose-100"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══ 4. ADD / EDIT VIDEO MODAL ═══ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 z-10 overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center">
                  <YouTubeIcon className="w-4 h-4 text-rose-600" />
                </div>
                <h3 className="font-bold text-base text-slate-900">
                  {editingVideoId ? 'Video İcmalını Yenilə' : 'Yeni YouTube Video İcmalı Əlavə Et'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveVideo} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Video Title */}
              <div>
                <label className="block text-xs font-bold tracking-wider text-slate-600 mb-1.5">
                  Video Başlığı / Adı *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="Məs: iPhone 16 Pro Max və Galaxy S24 Ultra Testi"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm outline-none focus:border-[#4f533b] transition"
                />
              </div>

              {/* YouTube Link */}
              <div>
                <label className="block text-xs font-bold tracking-wider text-slate-600 mb-1.5">
                  YouTube Video Linki *
                </label>
                <input
                  type="url"
                  required
                  value={formUrl}
                  onChange={e => setFormUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm outline-none focus:border-[#4f533b] transition"
                />
                {liveExtractedId && (
                  <div className="mt-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                    <img
                      src={`https://img.youtube.com/vi/${liveExtractedId}/hqdefault.jpg`}
                      alt="Thumbnail preview"
                      className="w-16 aspect-video rounded-lg object-cover border border-emerald-100"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-emerald-800 block">
                        ✓ YouTube ID tapıldı: {liveExtractedId}
                      </span>
                      <span className="text-emerald-600">Thumbnail avtomatik YouTube-dan çəkiləcək.</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Custom Thumbnail URL (Optional) */}
              <div>
                <label className="block text-xs font-bold tracking-wider text-slate-600 mb-1.5">
                  Xüsusi Thumbnail Şəkli (İxtiyari)
                </label>
                <input
                  type="url"
                  value={formCustomThumb}
                  onChange={e => setFormCustomThumb(e.target.value)}
                  placeholder="Boş qoysanız YouTube-un rəsmi şəkli istifadə olunacaq"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs outline-none focus:border-[#4f533b] transition"
                />
              </div>

              {/* Views */}
              <div>
                <label className="block text-xs font-bold tracking-wider text-slate-600 mb-1.5">
                  Baxış Sayı Mətni
                </label>
                <input
                  type="text"
                  value={formViews}
                  onChange={e => setFormViews(e.target.value)}
                  placeholder="Məs: 35.4K baxış"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs outline-none focus:border-[#4f533b] transition"
                />
              </div>

              {/* Sort Order & Active */}
              <div className="grid grid-cols-2 gap-3 items-center pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold tracking-wider text-slate-600 mb-1.5">
                    Sıralama (Sıra nömrəsi)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formSortOrder}
                    onChange={e => setFormSortOrder(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs outline-none focus:border-[#4f533b] transition"
                  />
                </div>

                <div className="pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsActive}
                      onChange={e => setFormIsActive(e.target.checked)}
                      className="w-4 h-4 accent-[#4f533b] rounded cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-slate-700">
                      Saytda Aktiv olsun
                    </span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition cursor-pointer"
                >
                  Ləğv et
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#4f533b] hover:bg-[#3e4230] text-white text-xs font-bold shadow-xs transition cursor-pointer active:scale-95"
                >
                  {editingVideoId ? 'Yadda saxla' : 'Videonu əlavə et'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ 5. LIVE PREVIEW MODAL ═══ */}
      {previewVideo && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setPreviewVideo(null)} />
          <div className="relative w-full max-w-3xl bg-white text-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-200 z-10 animate-scaleUp">
            <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0 pr-4">
                <YouTubeIcon className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <h4 className="font-bold text-sm text-slate-900 truncate">{previewVideo.title}</h4>
              </div>
              <button
                type="button"
                onClick={() => setPreviewVideo(null)}
                className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 flex items-center justify-center transition cursor-pointer flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${previewVideo.video_id}?autoplay=1&rel=0`}
                title={previewVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
