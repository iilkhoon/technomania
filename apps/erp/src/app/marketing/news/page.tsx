'use client';

import React, { useState, useEffect } from 'react';
import {
  Newspaper,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  CheckCircle,
  X,
  Calendar,
  User,
  UploadCloud,
  ExternalLink,
  ArrowLeft,
  Save,
  Clock,
  Sparkles,
  Tag,
  FileText,
  Globe,
  Share2,
  Check,
} from '../../../components/HeroIconsHub';

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image?: string;
  author_name: string;
  author_role?: string;
  author_avatar?: string;
  published_at?: string;
  is_published?: boolean;
  views_count?: number;
  sort_order?: number;
  tag?: string;
  seo_title?: string;
  seo_desc?: string;
  read_time?: string;
}

const EMPTY_NEWS: Partial<NewsItem> = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  image: '',
  author_name: 'TechnoMania Redaksiya',
  author_role: 'Aparıcı Texno İcmalçı',
  author_avatar: '',
  is_published: true,
  sort_order: 1,
  tag: 'İcmal',
  seo_title: '',
  seo_desc: '',
  read_time: '4 dəqiqə'
};

export default function MarketingNewsPage() {
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'editor'>('list');
  const [formData, setFormData] = useState<Partial<NewsItem>>(EMPTY_NEWS);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadArticles = () => {
    fetch('/api/catalog/news', {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setArticles(data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const handleTitleChange = (title: string) => {
    const autoSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\u00C0-\u024F\u0400-\u04FF]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug && prev.slug !== autoSlug ? prev.slug : autoSlug
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFormData(prev => ({ ...prev, image: ev.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFormData(prev => ({ ...prev, author_avatar: ev.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim() || !formData.content?.trim()) {
      alert('Zəhmət olmasa xəbərin başlığını və ətraflı məzmununu daxil edin');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/catalog/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          published_at: formData.published_at || new Date().toISOString()
        })
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => {
          setSaveSuccess(false);
          setViewMode('list');
          setFormData(EMPTY_NEWS);
          loadArticles();
        }, 800);
      } else {
        alert('Yadda saxlanılarkən xəta baş verdi');
      }
    } catch (e) {
      alert('Serverlə əlaqə qurulmadı');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu məqaləni silmək istədiyinizdən əminsiniz?')) return;
    try {
      await fetch(`/api/catalog/news/${id}`, { method: 'DELETE' });
      loadArticles();
    } catch (e) {}
  };

  const handleEdit = (art: NewsItem) => {
    setFormData(art);
    setViewMode('editor');
  };

  const handleCreateNew = () => {
    setFormData({
      ...EMPTY_NEWS,
      published_at: new Date().toISOString()
    });
    setViewMode('editor');
  };

  const filtered = articles.filter(a =>
    a.title?.toLowerCase().includes(search.toLowerCase()) ||
    a.author_name?.toLowerCase().includes(search.toLowerCase()) ||
    a.excerpt?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 text-slate-800">
      {/* ═══════════════════════════════════════════════════════════
          VIEW 1: FULL-PAGE DETAILED ARTICLE EDITOR (TƏK SƏHİFƏLİ)
         ═══════════════════════════════════════════════════════════ */}
      {viewMode === 'editor' ? (
        <form onSubmit={handleSave} className="space-y-6 animate-fadeIn">
          {/* Editor Header Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer flex items-center justify-center"
                title="Siyahıya qayıt"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-xl font-black text-slate-900">
                  {formData.id ? 'Xəbəri Redaktə Et' : 'Yeni Xəbər / Bloq Məqaləsi Əlavə Et'}
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Bütün sahələri ətraflı doldurun və canlı saytda dərc edin.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                İmtina et
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-[#4f533b] hover:bg-[#3e4230] text-white font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
              >
                {saveSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
                <span>{saving ? 'Saxlanılır...' : saveSuccess ? 'Yadda Saxlanıldı!' : 'Yadda Saxla və Dərc Et'}</span>
              </button>
            </div>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left 2 Columns: Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Card 1: Əsas Məlumatlar */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
                <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#4f533b]" />
                  <span>Əsas Məzmun Məlumatları</span>
                </h3>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Xəbərin Başlığı (Title) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Məs: iPhone 16 Pro Max haqqında bütün detallar..."
                      value={formData.title || ''}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 font-bold outline-none focus:border-[#4f533b] focus:bg-white transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">
                        URL Slug (SEO Ünvan)
                      </label>
                      <input
                        type="text"
                        placeholder="iphone-16-pro-max-icmal"
                        value={formData.slug || ''}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 outline-none focus:border-[#4f533b] focus:bg-white transition"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">
                        Teq / Kateqoriya
                      </label>
                      <input
                        type="text"
                        placeholder="Məs: Smartfonlar, İcmal, Məsləhət"
                        value={formData.tag || ''}
                        onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 outline-none focus:border-[#4f533b] focus:bg-white transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Qısa Xülasə (Excerpt / Giriş mətni)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Kartlarda və axtarış sistemlərində görünən 1-2 cümləlik qısa xülasə..."
                      value={formData.excerpt || ''}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 outline-none focus:border-[#4f533b] focus:bg-white transition resize-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Ətraflı Məqalə Mətni (Tam Məzmun) <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={12}
                      required
                      placeholder="Məqalənin tam mətni, abzaslar, xüsusiyyətlər və test nəticələri..."
                      value={formData.content || ''}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 leading-relaxed outline-none focus:border-[#4f533b] focus:bg-white transition"
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: SEO Meta Məlumatları */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
                <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#4f533b]" />
                  <span>Axtarış Sistemləri (SEO) Parametrləri</span>
                </h3>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">SEO Meta Başlıq (Title)</label>
                    <input
                      type="text"
                      placeholder="TechnoMania Bloq — Ən Son Texnologiya Xəbərləri"
                      value={formData.seo_title || ''}
                      onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 outline-none focus:border-[#4f533b] transition"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">SEO Meta Açıqlama (Description)</label>
                    <textarea
                      rows={2}
                      placeholder="Google axtarış nəticələrində çıxan 150 simvolluq qısa meta təsvir..."
                      value={formData.seo_desc || ''}
                      onChange={(e) => setFormData({ ...formData, seo_desc: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 outline-none focus:border-[#4f533b] transition resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Media, Author, Publish Settings */}
            <div className="space-y-6">
              {/* Card 3: Örtük Şəkli */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
                <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-[#4f533b]" />
                  <span>Xəbərin Örtük Şəkli</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <input
                    type="text"
                    placeholder="https://... və ya aşağıdan yükləyin"
                    value={formData.image || ''}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-700 outline-none focus:border-[#4f533b]"
                  />

                  <label className="flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-slate-300 hover:border-[#4f533b] bg-slate-50 hover:bg-[#f4f5f0] text-slate-600 transition cursor-pointer">
                    <UploadCloud className="w-6 h-6 text-[#4f533b] mb-1" />
                    <span className="font-bold text-xs">Kompüterdən Şəkil Seçin</span>
                    <span className="text-[10px] text-slate-400">JPG, PNG, WEBP (16:10 formatı tövsiyə olunur)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>

                  {formData.image && (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-[16/10] bg-slate-100">
                      <img src={formData.image} alt="Cover Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: '' })}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-rose-600 text-white rounded-lg transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Card 4: Müəllif Məlumatları */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
                <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#4f533b]" />
                  <span>Müəllif & Redaksiya</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Müəllif Adı</label>
                    <input
                      type="text"
                      placeholder="Məs: Emil Məmmədov"
                      value={formData.author_name || ''}
                      onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-[#4f533b]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Müəllif Vəzifəsi</label>
                    <input
                      type="text"
                      placeholder="Məs: Baş Redaktor, Texno İcmalçı"
                      value={formData.author_role || ''}
                      onChange={(e) => setFormData({ ...formData, author_role: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-[#4f533b]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Müəllif Avatarı (URL və ya Yüklə)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="https://..."
                        value={formData.author_avatar || ''}
                        onChange={(e) => setFormData({ ...formData, author_avatar: e.target.value })}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-[#4f533b]"
                      />
                      <label className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer border border-slate-200">
                        <UploadCloud className="w-4 h-4" />
                        <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 5: Nəşr Parametrləri */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
                <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#4f533b]" />
                  <span>Yayım və Status</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Oxunma Müddəti</label>
                    <input
                      type="text"
                      placeholder="Məs: 3 dəqiqə"
                      value={formData.read_time || '4 dəqiqə'}
                      onChange={(e) => setFormData({ ...formData, read_time: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-[#4f533b]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Sıralama Nömrəsi</label>
                    <input
                      type="number"
                      value={formData.sort_order || 1}
                      onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-[#4f533b]"
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 block">Saytda Dərc Edilsin</span>
                      <span className="text-[10px] text-slate-400">Aktiv olduqda dərhal ana səhifədə görünür</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, is_published: !formData.is_published })}
                      className={`w-12 h-6.5 rounded-full transition-colors p-1 flex items-center ${
                        formData.is_published ? 'bg-[#4f533b] justify-end' : 'bg-slate-300 justify-start'
                      }`}
                    >
                      <div className="w-4.5 h-4.5 rounded-full bg-white shadow-xs" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      ) : (
        /* ═══════════════════════════════════════════════════════════
            VIEW 2: ARTICLES LIST VIEW
           ═══════════════════════════════════════════════════════════ */
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4f533b]/10 text-[#4f533b] text-xs font-bold">
                <Newspaper className="w-3.5 h-3.5" />
                <span>Marketinq & Bloq Mərkəzi</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Xəbərlər və Bloq Məqalələri
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Saytda dərc olunan texnoloji xəbərlər, cihaz icmalları və bloq yazılarını idarə edin.
              </p>
            </div>

            <button
              onClick={handleCreateNew}
              className="px-5 py-3 bg-[#4f533b] hover:bg-[#3e4230] text-white font-extrabold text-xs sm:text-sm rounded-2xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Xəbər Əlavə Et</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Xəbərlərdə və müəllif adlarında axtarın..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((art) => (
              <div
                key={art.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail */}
                  <div className="relative aspect-[16/9] w-full bg-slate-100 overflow-hidden">
                    {art.image ? (
                      <img src={art.image} alt={art.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Newspaper className="w-8 h-8" />
                      </div>
                    )}
                    <span className={`absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      art.is_published !== false ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'
                    }`}>
                      {art.is_published !== false ? 'Dərc olunub' : 'Qaralama'}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-sm text-slate-900 line-clamp-2 leading-snug">
                      {art.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {art.excerpt || art.content}
                    </p>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {art.author_name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleEdit(art)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-[#4f533b] hover:text-white text-slate-700 transition cursor-pointer"
                      title="Redaktə et"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(art.id)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-rose-600 hover:text-white text-rose-600 transition cursor-pointer"
                      title="Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
              <Newspaper className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-black text-slate-700 text-base">Heç bir xəbər tapılmadı</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Yeni məqalə əlavə edərək saytın xəbərlər bölməsində yayımlaya bilərsiniz.
              </p>
              <button
                onClick={handleCreateNew}
                className="px-4 py-2 bg-[#4f533b] text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Xəbər Əlavə Et
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
