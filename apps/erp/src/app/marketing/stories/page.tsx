'use client';

import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Plus,
  RefreshCw,
  Trash2,
  Edit,
  Eye,
  CheckCircle,
  X,
  Sparkles,
  Link as LinkIcon,
  Tag,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Layers,
  ShoppingBag,
  Upload,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
} from '../../../components/HeroIconsHub';
import { showToast } from '../../../lib/toastStore';

export interface StorySlide {
  id: string;
  image: string;
  title?: string;
  subtitle?: string;
  link?: string;
  button_text?: string;
}

export interface MobileStoryItem {
  id: string;
  title: string;
  image: string;
  media_url?: string;
  badge?: string;
  badge_color?: string;
  slides?: StorySlide[];
  link?: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
}

const BADGE_COLOR_PRESETS = [
  { name: 'Zeytun (Brend)', hex: '#4f533b' },
  { name: 'Qırmızı (Aksiya)', hex: '#ef4444' },
  { name: 'Zümrüd (Yeni)', hex: '#10b981' },
  { name: 'Qızılı (Qaynar)', hex: '#f59e0b' },
  { name: 'Kral Mavi', hex: '#3b82f6' },
  { name: 'Bənövşəyi', hex: '#8b5cf6' },
  { name: 'Çəhrayı (Trend)', hex: '#ec4899' },
  { name: 'Tünd Qara', hex: '#0f172a' },
];

const DEFAULT_SEED_STORIES: MobileStoryItem[] = [
  {
    id: 'story_1',
    title: 'Yeni Modellər',
    badge: 'Trend',
    badge_color: '#ef4444',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
    media_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80',
    link: '/(tabs)/catalog',
    sort_order: 1,
    is_active: true,
    slides: [
      {
        id: 's1_1',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80',
        title: 'Smartfonlarda Böyük Endirim',
        subtitle: 'Bütün modellərə 24 ayadək taksit',
        link: '/(tabs)/catalog',
        button_text: 'Məhsullara bax',
      },
      {
        id: 's1_2',
        image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1200&q=80',
        title: 'iPhone 15 Seriyası',
        subtitle: 'İlkin ödənişsiz əldə edin',
        link: '/(tabs)/search',
        button_text: 'Sifariş et',
      }
    ]
  },
  {
    id: 'story_2',
    title: 'iPhone 16 Pro',
    badge: 'Yeni',
    badge_color: '#10b981',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80',
    media_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80',
    link: '/(tabs)/search',
    sort_order: 2,
    is_active: true,
    slides: [
      {
        id: 's2_1',
        image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80',
        title: 'Titanium Dizayn',
        subtitle: 'Super Retina XDR ekran',
        link: '/(tabs)/search',
        button_text: 'Kəşf et',
      }
    ]
  },
  {
    id: 'story_3',
    title: 'Qaynar Endirim',
    badge: '50%-dək',
    badge_color: '#f59e0b',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=600&q=80',
    media_url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80',
    link: '/(tabs)/catalog',
    sort_order: 3,
    is_active: true,
    slides: [
      {
        id: 's3_1',
        image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80',
        title: 'Həftəsonu Kampaniyası',
        subtitle: 'Xüsusi seçilmiş məhsullara 50%-dək endirim',
        link: '/(tabs)/catalog',
        button_text: 'Fürsəti qaçırma',
      }
    ]
  }
];

// Helper to compress images to light dataUrls
const compressImage = (file: File, maxWidth: number, maxHeight: number, callback: (dataUrl: string) => void) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        callback(dataUrl);
      } else {
        callback(e.target?.result as string);
      }
    };
    img.src = e.target?.result as string;
  };
  reader.readAsDataURL(file);
};

export default function MobileStoriesPage() {
  const [stories, setStories] = useState<MobileStoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<MobileStoryItem | null>(null);

  // Preview Simulator State
  const [previewStory, setPreviewStory] = useState<MobileStoryItem | null>(null);
  const [previewSlideIdx, setPreviewSlideIdx] = useState<number>(0);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formBadge, setFormBadge] = useState('Yeni');
  const [formBadgeColor, setFormBadgeColor] = useState('#4f533b');
  const [formSlides, setFormSlides] = useState<StorySlide[]>([]);
  const [formIsActive, setFormIsActive] = useState(true);

  const loadStories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/catalog/mobile-stories', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setStories(data.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)));
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.error('Failed to fetch mobile stories:', e);
    }
    setStories([]);
    setLoading(false);
  };

  useEffect(() => {
    loadStories();
  }, []);

  const handleOpenNewModal = () => {
    setEditingStory(null);
    setFormTitle('');
    setFormImage('');
    setFormBadge('Yeni');
    setFormBadgeColor('#4f533b');
    setFormSlides([
      {
        id: 'slide_' + Date.now(),
        image: '',
        title: '',
        subtitle: '',
        link: '/(tabs)/catalog',
        button_text: 'Məhsula bax',
      }
    ]);
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: MobileStoryItem) => {
    setEditingStory(item);
    setFormTitle(item.title || '');
    setFormImage(item.image || '');
    setFormBadge(item.badge || '');
    setFormBadgeColor(item.badge_color || '#4f533b');

    let parsedSlides: StorySlide[] = [];
    if (Array.isArray(item.slides) && item.slides.length > 0) {
      parsedSlides = item.slides;
    } else {
      parsedSlides = [
        {
          id: 'slide_' + Date.now(),
          image: item.media_url || item.image || '',
          title: item.title || '',
          link: item.link || '/(tabs)/catalog',
          button_text: 'Məhsula bax',
        }
      ];
    }
    setFormSlides(parsedSlides);
    setFormIsActive(item.is_active !== false);
    setIsModalOpen(true);
  };

  // Avatar Upload Handler
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    compressImage(file, 400, 400, (dataUrl) => {
      setFormImage(dataUrl);
      // If first slide has no image, default it
      setFormSlides(prev => {
        if (prev.length > 0 && !prev[0].image) {
          const copy = [...prev];
          copy[0] = { ...copy[0], image: dataUrl };
          return copy;
        }
        return prev;
      });
    });
  };

  // Slide Image Upload Handler
  const handleSlideImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    compressImage(file, 1080, 1920, (dataUrl) => {
      setFormSlides(prev => {
        const copy = [...prev];
        copy[index] = { ...copy[index], image: dataUrl };
        return copy;
      });
    });
  };

  // Add new slide to form
  const handleAddSlide = () => {
    setFormSlides(prev => [
      ...prev,
      {
        id: 'slide_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
        image: formImage || '',
        title: '',
        subtitle: '',
        link: '/(tabs)/catalog',
        button_text: 'Məhsula bax',
      }
    ]);
  };

  // Remove slide from form
  const handleRemoveSlide = (index: number) => {
    if (formSlides.length <= 1) {
      showToast('Ən azı 1 slayd olmalıdır!', 'warning');
      return;
    }
    setFormSlides(prev => prev.filter((_, i) => i !== index));
  };

  // Move slide up / down
  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === formSlides.length - 1) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    setFormSlides(prev => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy;
    });
  };

  const handleSaveStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToast('Zəhmət olmasa hekayə başlığını yazın!', 'error');
      return;
    }
    if (!formImage.trim()) {
      showToast('Zəhmət olmasa dairəvi avatar şəklini yükləyin!', 'error');
      return;
    }

    // Ensure slides have valid images (fallback to avatar if empty)
    const sanitizedSlides = formSlides.map(s => ({
      ...s,
      image: s.image?.trim() || formImage.trim(),
      link: s.link?.trim() || '/(tabs)/catalog',
      button_text: s.button_text?.trim() || 'Məhsula bax',
    }));

    const storyPayload: MobileStoryItem = {
      id: editingStory ? editingStory.id : `story_${Date.now()}`,
      title: formTitle.trim(),
      image: formImage.trim(),
      media_url: sanitizedSlides[0]?.image || formImage.trim(),
      badge: formBadge.trim(),
      badge_color: formBadgeColor.trim() || '#4f533b',
      slides: sanitizedSlides,
      link: sanitizedSlides[0]?.link || '/(tabs)/catalog',
      sort_order: editingStory ? editingStory.sort_order : stories.length + 1,
      is_active: formIsActive,
    };

    try {
      const res = await fetch('/api/catalog/mobile-stories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-erp-api-key': 'technomania_secure_erp_token_2026_98x!',
        },
        body: JSON.stringify(storyPayload),
      });

      if (res.ok) {
        showToast(editingStory ? 'Hekayə yeniləndi! ✅' : 'Yeni hekayə əlavə edildi! 🚀', 'success');
        setIsModalOpen(false);
        loadStories();
      } else {
        showToast('Saxlanılarkən xəta baş verdi', 'error');
      }
    } catch (e) {
      showToast('Şəbəkə xətası baş verdi', 'error');
    }
  };

  const handleDeleteStory = async (id: string, title: string) => {
    if (!confirm(`"${title}" hekayəsini silmək istədiyinizdən əminsiniz?`)) return;

    try {
      const res = await fetch(`/api/catalog/mobile-stories/${id}`, {
        method: 'DELETE',
        headers: {
          'x-erp-api-key': 'technomania_secure_erp_token_2026_98x!',
        },
      });

      if (res.ok) {
        showToast('Hekayə silindi! 🗑️', 'info');
        loadStories();
      }
    } catch (e) {
      showToast('Silinərkən xəta baş verdi', 'error');
    }
  };

  const handleToggleActive = async (story: MobileStoryItem) => {
    const updated = { ...story, is_active: !story.is_active };
    try {
      await fetch('/api/catalog/mobile-stories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-erp-api-key': 'technomania_secure_erp_token_2026_98x!',
        },
        body: JSON.stringify(updated),
      });
      showToast(`Hekayə ${updated.is_active ? 'aktiv edildi' : 'deaktiv edildi'}`, 'info');
      loadStories();
    } catch (e) {}
  };

  const handleSeedDefaults = async () => {
    if (!confirm('Nümunə hekayələri bərpa etmək istəyirsiniz?')) return;
    for (const s of DEFAULT_SEED_STORIES) {
      await fetch('/api/catalog/mobile-stories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-erp-api-key': 'technomania_secure_erp_token_2026_98x!',
        },
        body: JSON.stringify(s),
      });
    }
    showToast('Nümunə hekayələr yükləndi! ✨', 'success');
    loadStories();
  };

  // Open Preview Simulator
  const handleOpenPreview = (story: MobileStoryItem) => {
    setPreviewStory(story);
    setPreviewSlideIdx(0);
  };

  return (
    <div className="space-y-6 max-w-7xl pb-12 antialiased select-none text-slate-700">
      {/* Header Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#4f533b]/10 text-[#4f533b] flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <span>Mobil Tətbiq Hekayələri (Stories)</span>
                <span className="text-[10px] bg-[#4f533b] text-white px-2 py-0.5 rounded-full font-bold">
                  App & Web
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Mobil tətbiqin ən yuxarısında dairəvi ikonlarla görünən çoxsaylı hekayələri (Stories) idarə edin, şəkillər yükləyin və xüsusi nişanlar (badge) təyin edin.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={loadStories}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition cursor-pointer"
            title="Yenilə"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleSeedDefaults}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Nümunələri bərpa et</span>
          </button>

          <button
            type="button"
            onClick={handleOpenNewModal}
            className="flex-1 sm:flex-initial px-5 py-2.5 bg-[#4f533b] hover:bg-[#3e4230] text-white font-bold text-xs rounded-2xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Story Yarat</span>
          </button>
        </div>
      </div>

      {/* Stories Live Mobile Bar Visual Preview */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Mobil Tətbiqdə Canlı Görünüş (Canlı Önizləmə)
            </h2>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {stories.filter(s => s.is_active).length} aktiv hekayə
          </span>
        </div>

        {/* Stories Horizontal Circular Bar */}
        <div className="flex items-start gap-4 overflow-x-auto py-3 scrollbar-hide">
          {stories.length === 0 ? (
            <div className="w-full py-8 text-center text-xs text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
              Hələ heç bir hekayə əlavə edilməyib. Yuxarıdakı "Yeni Story Yarat" düyməsi ilə ilk hekayənizi əlavə edin.
            </div>
          ) : (
            stories.map((story) => {
              const slideCount = (story.slides && story.slides.length > 0) ? story.slides.length : 1;
              return (
                <div
                  key={story.id}
                  onClick={() => handleOpenPreview(story)}
                  className="flex flex-col items-center w-[72px] flex-shrink-0 cursor-pointer group"
                >
                  {/* Outer Animated Ring Wrapper */}
                  <div className="w-[66px] h-[66px] rounded-full p-[2.5px] relative bg-gradient-to-tr from-[#4f533b] via-amber-400 to-[#4f533b] transition-transform duration-300 group-hover:scale-105 shadow-xs">
                    <div className="w-full h-full rounded-full overflow-hidden bg-white p-[2px]">
                      <img
                        src={story.image}
                        alt={story.title}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>

                    {/* Dairənin Tam Altında Xüsusi Rəngli Badge */}
                    {story.badge && story.badge.trim() !== '' && (
                      <div
                        className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-2 py-0.2 rounded-full text-[9px] font-black text-white shadow-xs whitespace-nowrap border border-white/80"
                        style={{ backgroundColor: story.badge_color || '#4f533b' }}
                      >
                        {story.badge}
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <span className={`text-[11px] font-semibold text-center mt-2.5 truncate w-full ${story.is_active ? 'text-slate-800' : 'text-slate-400 opacity-60'}`}>
                    {story.title}
                  </span>

                  {/* Multi-slide count pill */}
                  {slideCount > 1 && (
                    <span className="text-[9px] font-bold text-slate-400 -mt-0.5">
                      {slideCount} slayd
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Stories Table */}
      <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-black text-sm text-slate-900">Bütün Hekayələr Siyahısı</h2>
          <span className="text-xs font-bold text-slate-400">Ümumi: {stories.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-5">Sıra</th>
                <th className="py-3 px-5">Hekayə & Avatar</th>
                <th className="py-3 px-5">Slaydlar (Məzmun)</th>
                <th className="py-3 px-5">Nişan (Badge)</th>
                <th className="py-3 px-5">Keçid Linki</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-right">Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    Hekayələr yüklənir...
                  </td>
                </tr>
              ) : stories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    Hekayə tapılmadı. "Yeni Story Yarat" düyməsi ilə əlavə edin.
                  </td>
                </tr>
              ) : (
                stories.map((story, idx) => {
                  const slides = story.slides && story.slides.length > 0 ? story.slides : [];
                  return (
                    <tr key={story.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-5 font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={story.image}
                              alt={story.title}
                              className="w-12 h-12 rounded-full object-cover border-2 border-slate-200 shadow-2xs"
                            />
                            {story.badge && (
                              <span
                                className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full text-[8px] font-black text-white shadow-2xs border border-white"
                                style={{ backgroundColor: story.badge_color || '#4f533b' }}
                              >
                                {story.badge}
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block text-xs">{story.title}</span>
                            <span className="text-[10px] text-slate-400 truncate block max-w-[160px]">
                              ID: {story.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <div className="flex items-center gap-1.5">
                          <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-black text-xs border border-slate-200 flex items-center gap-1">
                            <Layers className="w-3.5 h-3.5 text-[#4f533b]" />
                            <span>{slides.length > 0 ? slides.length : 1} slayd</span>
                          </span>
                          <div className="flex -space-x-2 overflow-hidden">
                            {slides.slice(0, 3).map((sl, sIdx) => (
                              <img
                                key={sIdx}
                                src={sl.image || story.image}
                                alt=""
                                className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                              />
                            ))}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        {story.badge ? (
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[11px] text-white shadow-2xs"
                            style={{ backgroundColor: story.badge_color || '#4f533b' }}
                          >
                            <Sparkles className="w-3 h-3 text-white" />
                            <span>{story.badge}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      <td className="py-4 px-5">
                        <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                          {story.link || (slides[0]?.link) || '/(tabs)/catalog'}
                        </span>
                      </td>

                      <td className="py-4 px-5">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(story)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer border ${
                            story.is_active
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${story.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          <span>{story.is_active ? 'Aktiv' : 'Deaktiv'}</span>
                        </button>
                      </td>

                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenPreview(story)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                            title="Önizlə"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(story)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#4f533b] transition cursor-pointer"
                            title="Redaktə et"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteStory(story.id, story.title)}
                            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer"
                            title="Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Story Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scaleUp my-8 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#4f533b]/10 text-[#4f533b] flex items-center justify-center font-bold">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">
                    {editingStory ? 'Hekayəni Redaktə Et' : 'Yeni Story Yarat'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Başlıq, avatar şəkli, nişan və bir neçə slayd əlavə edin.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Scrollable Body */}
            <form onSubmit={handleSaveStory} className="space-y-4 text-xs overflow-y-auto pr-1 flex-1">
              {/* 1. Story Main Details (Title & Avatar) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80">
                <div className="space-y-3">
                  <div>
                    <label className="block font-black text-slate-700 mb-1">
                      Hekayə Başlığı (Adı) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="Məs: iPhone 16 Pro, Qaynar Təkliflər"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-semibold outline-none focus:border-[#4f533b]"
                    />
                  </div>

                  <div>
                    <label className="block font-black text-slate-700 mb-1">
                      Nişan Mətni (Badge)
                    </label>
                    <input
                      type="text"
                      value={formBadge}
                      onChange={(e) => setFormBadge(e.target.value)}
                      placeholder="Məs: Yeni, 50%, Trend, Şok"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-semibold outline-none focus:border-[#4f533b]"
                    />
                  </div>

                  {/* Badge Color Selector */}
                  <div>
                    <label className="block font-black text-slate-700 mb-1.5">
                      Nişanın Rəngi (Badge Color)
                    </label>
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      {BADGE_COLOR_PRESETS.map((c) => (
                        <button
                          key={c.hex}
                          type="button"
                          onClick={() => setFormBadgeColor(c.hex)}
                          className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${
                            formBadgeColor === c.hex ? 'scale-125 border-slate-900 shadow-md ring-2 ring-slate-400' : 'border-white hover:scale-110 shadow-xs'
                          }`}
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formBadgeColor}
                        onChange={(e) => setFormBadgeColor(e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5 bg-white"
                      />
                      <input
                        type="text"
                        value={formBadgeColor}
                        onChange={(e) => setFormBadgeColor(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-mono text-xs outline-none uppercase"
                      />
                    </div>
                  </div>
                </div>

                {/* Avatar Upload Container */}
                <div>
                  <label className="block font-black text-slate-700 mb-1">
                    Dairəvi Avatar Şəkli (Upload) *
                  </label>
                  <div className="flex flex-col items-center justify-center p-4 bg-white border-2 border-dashed border-slate-200 rounded-2xl hover:border-[#4f533b] transition">
                    {formImage ? (
                      <div className="relative mb-2 group">
                        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#4f533b] p-0.5 shadow-md">
                          <img
                            src={formImage}
                            alt="Avatar"
                            className="w-full h-full object-cover rounded-full"
                          />
                        </div>
                        {formBadge && (
                          <span
                            className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.2 rounded-full text-[9px] font-black text-white shadow-xs border border-white whitespace-nowrap"
                            style={{ backgroundColor: formBadgeColor }}
                          >
                            {formBadge}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2 border border-slate-200">
                        <ImageIcon className="w-7 h-7" />
                      </div>
                    )}

                    <label className="px-4 py-2 bg-[#4f533b] hover:bg-[#3e4230] text-white font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs shadow-xs active:scale-95">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{formImage ? 'Şəkli Dəyiş' : 'Şəkil Yüklə (Upload)'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[10px] text-slate-400 mt-1.5">PNG, JPG, WebP dəstəklənir</p>
                  </div>
                </div>
              </div>

              {/* 2. Multi-Slide Management (1-dən çox story yerləşdirmək) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#4f533b]" />
                    <span className="font-black text-slate-900 text-xs">
                      Hekayə Slaydları ({formSlides.length} slayd)
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddSlide}
                    className="px-3.5 py-1.5 bg-[#4f533b]/10 hover:bg-[#4f533b]/20 text-[#4f533b] font-black rounded-xl transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Yeni Slayd Əlavə Et</span>
                  </button>
                </div>

                {/* Slides List */}
                <div className="space-y-3">
                  {formSlides.map((slide, sIdx) => (
                    <div
                      key={slide.id || sIdx}
                      className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                        <span className="font-black text-[#4f533b] text-xs flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-[#4f533b] text-white flex items-center justify-center text-[10px]">
                            {sIdx + 1}
                          </span>
                          <span>Slayd #{sIdx + 1}</span>
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={sIdx === 0}
                            onClick={() => handleMoveSlide(sIdx, 'up')}
                            className="p-1 rounded-lg bg-white hover:bg-slate-200 text-slate-600 disabled:opacity-30 cursor-pointer"
                            title="Yuxarı qaldır"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            disabled={sIdx === formSlides.length - 1}
                            onClick={() => handleMoveSlide(sIdx, 'down')}
                            className="p-1 rounded-lg bg-white hover:bg-slate-200 text-slate-600 disabled:opacity-30 cursor-pointer"
                            title="Aşağı endir"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>

                          {formSlides.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveSlide(sIdx)}
                              className="p-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer ml-1"
                              title="Slaydı sil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                        {/* Slide Image Preview & Upload */}
                        <div className="sm:col-span-4 flex items-center gap-3">
                          <div className="w-16 h-24 bg-black rounded-xl overflow-hidden relative border border-slate-300 flex-shrink-0">
                            {slide.image ? (
                              <img
                                src={slide.image}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-500">
                                <ImageIcon className="w-6 h-6" />
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                            <label className="px-3 py-1.5 bg-white border border-slate-200 hover:border-[#4f533b] text-slate-700 font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1 text-[11px] shadow-2xs">
                              <Upload className="w-3 h-3 text-[#4f533b]" />
                              <span>Şəkil Yüklə</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleSlideImageUpload(sIdx, e)}
                                className="hidden"
                              />
                            </label>
                            <span className="text-[10px] text-slate-400">9:16 format tövsiyə olunur</span>
                          </div>
                        </div>

                        {/* Slide Texts & Links */}
                        <div className="sm:col-span-8 space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Slayd Başlığı</label>
                              <input
                                type="text"
                                value={slide.title || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormSlides(prev => {
                                    const copy = [...prev];
                                    copy[sIdx] = { ...copy[sIdx], title: val };
                                    return copy;
                                  });
                                }}
                                placeholder="Məs: 50% Endirim"
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-medium outline-none text-xs"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Düymə Mətni</label>
                              <input
                                type="text"
                                value={slide.button_text || 'Məhsula bax'}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormSlides(prev => {
                                    const copy = [...prev];
                                    copy[sIdx] = { ...copy[sIdx], button_text: val };
                                    return copy;
                                  });
                                }}
                                placeholder="Məs: Məhsula bax"
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-medium outline-none text-xs"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Keçid Linki</label>
                            <input
                              type="text"
                              value={slide.link || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormSlides(prev => {
                                  const copy = [...prev];
                                  copy[sIdx] = { ...copy[sIdx], link: val };
                                  return copy;
                                });
                              }}
                              placeholder="/(tabs)/catalog və ya /product/123"
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-mono text-[11px] outline-none text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Checkbox */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="rounded text-[#4f533b] focus:ring-[#4f533b]"
                />
                <label htmlFor="isActiveCheck" className="font-bold text-slate-700 cursor-pointer">
                  Hekayə dərhal tətbiqdə aktiv olsun
                </label>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Ləğv et
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#4f533b] hover:bg-[#3e4230] text-white font-bold rounded-xl shadow-xs transition cursor-pointer"
                >
                  Yadda saxla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Story Full Screen Phone Simulator Preview Modal with Multi-Slide Navigation */}
      {previewStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          {(() => {
            const previewSlides = (previewStory.slides && previewStory.slides.length > 0)
              ? previewStory.slides
              : [{ id: previewStory.id, image: previewStory.media_url || previewStory.image, title: previewStory.title, link: previewStory.link, button_text: 'Məhsula bax' }];

            const activeSlide = previewSlides[previewSlideIdx] || previewSlides[0];

            const handleNextSlide = () => {
              if (previewSlideIdx < previewSlides.length - 1) {
                setPreviewSlideIdx(prev => prev + 1);
              } else {
                setPreviewStory(null);
              }
            };

            const handlePrevSlide = () => {
              if (previewSlideIdx > 0) {
                setPreviewSlideIdx(prev => prev - 1);
              }
            };

            return (
              <div className="relative w-full max-w-sm h-[600px] bg-black rounded-[42px] border-4 border-slate-800 shadow-2xl overflow-hidden animate-scaleUp flex flex-col justify-between p-4 text-white select-none">
                {/* Background Media */}
                <img
                  src={activeSlide.image || previewStory.image}
                  alt={activeSlide.title || previewStory.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-transparent to-black/85 pointer-events-none" />

                {/* Top Bar with Multi-Segment Progress Bars */}
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center gap-1.5 w-full">
                    {previewSlides.map((_, sIdx) => {
                      const isFilled = sIdx <= previewSlideIdx;
                      return (
                        <div
                          key={sIdx}
                          className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
                        >
                          <div
                            className={`h-full bg-white transition-all duration-300 ${isFilled ? 'w-full' : 'w-0'}`}
                          />
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={previewStory.image}
                        alt=""
                        className="w-8 h-8 rounded-full border border-white object-cover shadow-xs"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs block">{previewStory.title}</span>
                          {previewSlides.length > 1 && (
                            <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">
                              {previewSlideIdx + 1}/{previewSlides.length}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-white/70 block">TechnoMania Mobil</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPreviewStory(null)}
                      className="w-7 h-7 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Left / Right Interactive Tap Zones */}
                <div className="absolute inset-0 z-20 flex">
                  <div
                    onClick={handlePrevSlide}
                    className="w-1/3 h-full cursor-pointer"
                    title="Əvvəlki slayd"
                  />
                  <div
                    onClick={handleNextSlide}
                    className="w-2/3 h-full cursor-pointer"
                    title="Növbəti slayd"
                  />
                </div>

                {/* Navigation Chevrons */}
                {previewSlides.length > 1 && (
                  <>
                    {previewSlideIdx > 0 && (
                      <button
                        type="button"
                        onClick={handlePrevSlide}
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    )}
                    {previewSlideIdx < previewSlides.length - 1 && (
                      <button
                        type="button"
                        onClick={handleNextSlide}
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </>
                )}

                {/* Bottom Content */}
                <div className="relative z-30 space-y-3 text-center pointer-events-auto">
                  {previewStory.badge && (
                    <span
                      className="inline-block text-white font-bold text-[10px] px-3 py-1 rounded-full shadow-md"
                      style={{ backgroundColor: previewStory.badge_color || '#4f533b' }}
                    >
                      ✨ {previewStory.badge}
                    </span>
                  )}

                  {activeSlide.title ? (
                    <h3 className="font-black text-lg">{activeSlide.title}</h3>
                  ) : (
                    <h3 className="font-black text-lg">{previewStory.title}</h3>
                  )}

                  {activeSlide.subtitle && (
                    <p className="text-xs text-white/80 -mt-1 font-medium">{activeSlide.subtitle}</p>
                  )}

                  <div className="w-full py-3 bg-white text-[#4f533b] font-black text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg">
                    <ShoppingBag className="w-4 h-4" />
                    <span>{activeSlide.button_text || 'Məhsula bax / Kampaniyaya keç'}</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
