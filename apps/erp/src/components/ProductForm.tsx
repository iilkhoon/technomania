'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Package,
  Plus,
  Trash2,
  Layers,
  Image as ImageIcon,
  Tag,
  AlertTriangle,
  Sliders,
  Check,
  UploadCloud,
  Link as LinkIcon,
  Sparkles,
  Info,
  Video,
  FileText,
  Search,
  Bookmark,
  RotateCcw,
  Clock,
  CheckCircle2,
  X,
  ShoppingCart,
  Heart,
  Scale,
  Zap,
  Eye,
  ShieldCheck,
  FolderOpen,
} from './HeroIconsHub';
import { Product, Category, ProductDraft, ProductStorageVariant, ProductVideoItem, CategorySpecFieldItem } from '../types';
import { getLocalCategories, saveLocalCategories, getLocalProducts, saveLocalProducts, saveProductToApi, saveMediaToApi, uploadImageToStorageApi, getLocalDrafts, saveLocalDraft, deleteLocalDraft } from '../lib/supabase';
import MediaGalleryModal from './MediaGalleryModal';

export const BRANDS_LIST = [
  'Apple', 'Samsung', 'Xiaomi', 'Huawei', 'HONOR', 'Poco', 'Infinix',
  'Tecno', 'Vivo', 'Nokia', 'ASUS', 'Lenovo', 'HP', 'Dell', 'LG',
  'Bosch', 'Haier', 'Beko', 'Dyson', 'Sony', 'Philips', 'Panasonic', 'Mitsubishi', 'Acer', 'MSI'
];

export const CAMPAIGNS_LIST = [
  'Kampaniya Yoxdur',
  '1 Həftə Pulsuz Çatdırılma',
  '0% İlkin Ödəniş 18 Ay',
  'Super Yay Keşbək',
  'Yalnız Onlayn Sifariş',
];

function toSlug(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

interface ProductFormProps {
  initialProduct?: Product;
  isEditMode?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
  isModal?: boolean;
}

// ── Shared style tokens ────────────────────────────────────────────────────
const inputCls =
  'w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 outline-none focus:border-[#4f533b] transition placeholder:text-slate-300';
const labelCls = 'block text-sm text-slate-600 mb-1';
const sectionCls = 'bg-white border border-slate-200 rounded-2xl p-5 space-y-4';
const sectionHeaderCls = 'flex items-center gap-2 border-b border-slate-100 pb-3';
const sectionTitleCls = 'text-sm text-slate-700';

export default function ProductForm({
  initialProduct,
  isEditMode = false,
  onSuccess,
  onCancel,
}: ProductFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);

  // ── Main fields ────────────────────────────────────────────────────────
  const [productId, setProductId] = useState(initialProduct?.id || '');
  const [name, setName] = useState(initialProduct?.name || initialProduct?.model_name || '');
  const [slug, setSlug] = useState(initialProduct?.slug || toSlug(initialProduct?.name || ''));
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  const [brand, setBrand] = useState(initialProduct?.brand || 'Apple');
  const [mainCategoryId, setMainCategoryId] = useState('');
  const [subCategoryId, setSubCategoryId] = useState('');
  const [thirdCategoryId, setThirdCategoryId] = useState('');

  const [costPrice, setCostPrice] = useState(initialProduct?.cost_price?.toString() || '');
  const [cashPrice, setCashPrice] = useState(initialProduct?.cash_price?.toString() || '');
  const [oldPrice, setOldPrice] = useState(initialProduct?.old_price?.toString() || '');
  const stockDisplay = initialProduct?.stock !== undefined ? initialProduct.stock.toString() : '0';

  const [campaign, setCampaign] = useState(initialProduct?.campaign || 'Kampaniya Yoxdur');
  const [isActive, setIsActive] = useState(initialProduct?.is_active ?? true);
  const [isNew, setIsNew] = useState(initialProduct?.is_new ?? false);

  // ── Description & Rich Text Editor ───────────────────────────────────────
  const [description, setDescription] = useState(initialProduct?.description || (initialProduct as any)?.desc || '');
  const [descriptionMode, setDescriptionMode] = useState<'edit' | 'preview'>('edit');
  const descriptionTextareaRef = React.useRef<HTMLTextAreaElement>(null);

  const insertFormatting = (prefix: string, suffix: string = '', defaultText: string = '') => {
    const textarea = descriptionTextareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = description.substring(start, end) || defaultText;
    const newText = description.substring(0, start) + prefix + selectedText + suffix + description.substring(end);
    setDescription(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 50);
  };

  const [videoUrl, setVideoUrl] = useState(initialProduct?.video_url || (initialProduct as any)?.videoUrl || '');
  const [youtubeVideoUrl, setYoutubeVideoUrl] = useState((initialProduct as any)?.youtube_video_url || (initialProduct as any)?.youtubeVideoUrl || '');
  const [youtubeButtonText, setYoutubeButtonText] = useState((initialProduct as any)?.youtube_button_text || (initialProduct as any)?.youtubeButtonText || 'Video İcmala Bax');

  // ── Bundled Products (Birgə Satılanlar) ──────────────────────────────────
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [bundledProductIds, setBundledProductIds] = useState<string[]>(
    initialProduct?.bundled_product_ids || []
  );
  const [bundleSearchQuery, setBundleSearchQuery] = useState('');

  // ── Color Variants (Rəng Seçimləri və Yönləndirmə) ──────────────────────────
  const [colorVariants, setColorVariants] = useState<Array<{ id: string; name: string; hex: string; slug?: string; productId?: string }>>(() => {
    if (initialProduct?.colors && Array.isArray(initialProduct.colors)) {
      return initialProduct.colors.map((c: any, idx: number) => ({
        id: c.id || `col-${Date.now()}-${idx}`,
        name: typeof c === 'string' ? c : c.name || 'Rəng',
        hex: typeof c === 'string' ? '#1e293b' : c.hex || '#1e293b',
        slug: typeof c === 'object' ? c.slug : '',
        productId: typeof c === 'object' ? c.productId : '',
      }));
    }
    return [];
  });

  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#1e293b');
  const [newColorProductId, setNewColorProductId] = useState('');

  // ── Alternative Products (Alternativ Seçimlər) ────────────────────────────
  const [alternativeProductIds, setAlternativeProductIds] = useState<string[]>(
    initialProduct?.alternative_product_ids || []
  );
  const [altSearchQuery, setAltSearchQuery] = useState('');

  // ── Assigned Services (Təyin Olunan Xidmətlər) ───────────────────────────
  const [serviceIds, setServiceIds] = useState<string[]>(() => {
    let raw = (initialProduct as any)?.service_ids;
    if (typeof raw === 'string') {
      try { raw = JSON.parse(raw); } catch (e) { raw = []; }
    }
    return Array.isArray(raw) ? raw : ['warranty_1y'];
  });
  const [availableServices, setAvailableServices] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/catalog/services')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setAvailableServices(data);
        } else {
          setAvailableServices([
            { id: 'warranty_1y', name: 'Zəmanət 1 il', price: 'Pulsuz', icon: '🛡️', description: 'Rəsmi istehsalçı zəmanəti' },
            { id: 'warranty_2y', name: 'Zəmanət 2 il', price: '59.99 ₼', icon: '🛡️🛡️', description: 'Uzadılmış servis zəmanəti' },
            { id: 'warranty_3y', name: 'Zəmanət 3 il', price: '99.99 ₼', icon: '🛡️🛡️🛡️', description: 'Premium uzadılmış zəmanət' },
          ]);
        }
      })
      .catch(() => {
        setAvailableServices([
          { id: 'warranty_1y', name: 'Zəmanət 1 il', price: 'Pulsuz', icon: '🛡️', description: 'Rəsmi istehsalçı zəmanəti' },
          { id: 'warranty_2y', name: 'Zəmanət 2 il', price: '59.99 ₼', icon: '🛡️🛡️', description: 'Uzadılmış servis zəmanəti' },
          { id: 'warranty_3y', name: 'Zəmanət 3 il', price: '99.99 ₼', icon: '🛡️🛡️🛡️', description: 'Premium uzadılmış zəmanət' },
        ]);
      });
  }, []);

  const [badgeDurationDays, setBadgeDurationDays] = useState<number>(() => {
    if (initialProduct?.new_badge_until) {
      const diff = new Date(initialProduct.new_badge_until).getTime() - Date.now();
      const days = Math.round(diff / (1000 * 60 * 60 * 24));
      return days > 0 ? days : 7;
    }
    return 7;
  });

  // ── Images & Video (Max 6 Images, Max 2 Videos) ──────────────────────────
  const DUMMY_IMAGE = '/images/dummy-product.png';
  const MAX_IMAGES = 6;
  const MAX_VIDEOS = 2;

  const [imageList, setImageList] = useState<string[]>(() => {
    let rawImgs = (initialProduct as any)?.images;
    if (typeof rawImgs === 'string') {
      try { rawImgs = JSON.parse(rawImgs); } catch (e) { rawImgs = []; }
    }
    if (Array.isArray(rawImgs) && rawImgs.length > 0) {
      return rawImgs.filter(Boolean).slice(0, MAX_IMAGES);
    }
    if (initialProduct?.image) {
      return [initialProduct.image];
    }
    return [];
  });
  const [isMediaGalleryOpen, setIsMediaGalleryOpen] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isGeneratingAiContent, setIsGeneratingAiContent] = useState(false);

  // ── Multiple Videos (Max 2 Videos) ───────────────────────────────────────
  const [videos, setVideos] = useState<ProductVideoItem[]>(() => {
    let raw = (initialProduct as any)?.videos;
    if (typeof raw === 'string') {
      try { raw = JSON.parse(raw); } catch (e) { raw = []; }
    }
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.map(v => ({
        url: v.url || '',
        title: v.title || '',
        type: v.type || (v.url?.includes('youtube') || v.url?.includes('youtu.be') ? 'youtube' : 'upload'),
        button_text: v.button_text || 'Video İcmala Bax',
      })).filter(v => v.url).slice(0, MAX_VIDEOS);
    }
    const legacy: ProductVideoItem[] = [];
    if (initialProduct?.video_url) {
      legacy.push({ url: initialProduct.video_url, title: 'Video İcmal (Fayl)', type: 'upload' });
    }
    if ((initialProduct as any)?.youtube_video_url) {
      legacy.push({
        url: (initialProduct as any).youtube_video_url,
        title: 'YouTube İcmal',
        type: 'youtube',
        button_text: (initialProduct as any).youtube_button_text || 'Video İcmala Bax',
      });
    }
    return legacy.slice(0, MAX_VIDEOS);
  });

  // ── Dynamic Price Variants (Storage / Memory / Config) ─────────────────
  const [storageVariants, setStorageVariants] = useState<ProductStorageVariant[]>(() => {
    let raw = (initialProduct as any)?.storage_variants || (initialProduct as any)?.variants;
    if (typeof raw === 'string') {
      try { raw = JSON.parse(raw); } catch (e) { raw = []; }
    }
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.map(v => ({
        size: v.size || v.name || v.storage || '',
        price: Number(v.price) || 0,
        old_price: v.old_price ? Number(v.old_price) : undefined,
        cost_price: v.cost_price ? Number(v.cost_price) : undefined,
        stock: v.stock !== undefined ? Number(v.stock) : undefined,
      })).filter(v => v.size);
    }
    return [];
  });

  const prevInitProdIdRef = React.useRef<string | undefined>(initialProduct?.id);
  useEffect(() => {
    if (initialProduct && initialProduct.id !== prevInitProdIdRef.current) {
      prevInitProdIdRef.current = initialProduct.id;
      let rawImgs = (initialProduct as any)?.images;
      if (typeof rawImgs === 'string') {
        try { rawImgs = JSON.parse(rawImgs); } catch (e) { rawImgs = []; }
      }
      if (Array.isArray(rawImgs) && rawImgs.length > 0) {
        setImageList(rawImgs.filter(Boolean).slice(0, MAX_IMAGES));
      } else if (initialProduct.image) {
        setImageList([initialProduct.image]);
      }
    }
  }, [initialProduct?.id]);

  // ── Badge & Etiket ──────────────────────────────────────────────────────
  const [badge, setBadge] = useState((initialProduct as any)?.badge || '');
  const [badgeColor, setBadgeColor] = useState((initialProduct as any)?.badge_color || '#ef4444');
  const [availableBadges, setAvailableBadges] = useState<any[]>([]);
  const [isCreatingCustomBadge, setIsCreatingCustomBadge] = useState(false);

  useEffect(() => {
    const loadAllAvailableBadges = () => {
      const list: Array<{ id: string; name: string; color: string }> = [];
      const seenNames = new Set<string>();

      const OLD_DEFAULT_IDS = new Set([
        'b-hit', 'b-new', 'b-discount', 'b-super', 'b-rec', 'b-excl', 'b-free-shipping',
        'bdg-1', 'bdg-2', 'bdg-3', 'bdg-4', 'bdg-5'
      ]);

      const addBadge = (id: string, name: string, color: string) => {
        if (!name || seenNames.has(name.trim().toLowerCase())) return;
        if (id && OLD_DEFAULT_IDS.has(id)) return;
        seenNames.add(name.trim().toLowerCase());
        list.push({ id, name: name.trim(), color: color || '#4f533b' });
      };

      try {
        // From Product Badges (/badges page under Products)
        const productBadges = localStorage.getItem('technomania_product_badges');
        if (productBadges) {
          const parsed = JSON.parse(productBadges);
          if (Array.isArray(parsed)) {
            const cleaned = parsed.filter((b: any) => !b.id || !OLD_DEFAULT_IDS.has(b.id));
            if (cleaned.length !== parsed.length) {
              try { localStorage.setItem('technomania_product_badges', JSON.stringify(cleaned)); } catch (e) { }
            }
            cleaned.forEach((b: any) => {
              if (b.name) addBadge(b.id || b.name, b.name, b.color);
            });
          }
        }

        // From Marketing Badges (/coupons custom badges)
        const customBadges = localStorage.getItem('technomania_custom_badges');
        if (customBadges) {
          const parsedCustom = JSON.parse(customBadges);
          if (Array.isArray(parsedCustom)) {
            const cleanedCustom = parsedCustom.filter((b: any) => !b.id || !OLD_DEFAULT_IDS.has(b.id));
            if (cleanedCustom.length !== parsedCustom.length) {
              try { localStorage.setItem('technomania_custom_badges', JSON.stringify(cleanedCustom)); } catch (e) { }
            }
            cleanedCustom.forEach((b: any) => {
              if (b.label) addBadge(b.id || b.label, b.label, b.colorBg || b.color);
              else if (b.name) addBadge(b.id || b.name, b.name, b.color);
            });
          }
        }
      } catch (e) { }

      setAvailableBadges(list);
    };

    loadAllAvailableBadges();
    window.addEventListener('techno_campaigns_updated', loadAllAvailableBadges);
    window.addEventListener('techno_badges_updated', loadAllAvailableBadges);
    window.addEventListener('storage', loadAllAvailableBadges);

    return () => {
      window.removeEventListener('techno_campaigns_updated', loadAllAvailableBadges);
      window.removeEventListener('techno_badges_updated', loadAllAvailableBadges);
      window.removeEventListener('storage', loadAllAvailableBadges);
    };
  }, []);

  // ── Specs: driven by selected category's spec_fields ──────────────────
  // specValues: { 'RAM': '8 GB', 'Yaddaş': '256 GB', ... }
  const [specValues, setSpecValues] = useState<Record<string, string>>(
    initialProduct?.attributes || {}
  );
  // Extra custom rows not defined in category spec_fields
  const [extraSpecs, setExtraSpecs] = useState<{ key: string; value: string }[]>([]);

  // ── Error / Loading ────────────────────────────────────────────────────
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  // ── Draft State & Handlers ─────────────────────────────────────────────
  const [savedDrafts, setSavedDrafts] = useState<ProductDraft[]>([]);
  const [loadedDraftId, setLoadedDraftId] = useState<string | null>(null);
  const [draftToast, setDraftToast] = useState<string | null>(null);

  const showDraftToast = (msg: string) => {
    setDraftToast(msg);
    setTimeout(() => setDraftToast(null), 3500);
  };

  useEffect(() => {
    setSavedDrafts(getLocalDrafts());
    const handleDraftUpdate = () => setSavedDrafts(getLocalDrafts());
    window.addEventListener('techno_drafts_updated', handleDraftUpdate);
    return () => window.removeEventListener('techno_drafts_updated', handleDraftUpdate);
  }, []);

  const syncExtraSpecsToCategory = () => {
    const targetCatId = thirdCategoryId || subCategoryId || mainCategoryId;
    if (!targetCatId) return;

    const newKeys = extraSpecs
      .map(s => s.key.trim())
      .filter(k => k.length > 0);

    if (newKeys.length === 0) return;

    const allCats = getLocalCategories() || [];
    const catToUpdate = allCats.find(c => c.id === targetCatId);
    if (!catToUpdate) return;

    const currentFields: CategorySpecFieldItem[] = (catToUpdate.spec_fields || []).map(f => {
      if (typeof f === 'string') return { name: f, has_price: false };
      return f;
    });

    const existingNames = new Set(currentFields.map(f => f.name.toLowerCase()));
    let updated = false;

    newKeys.forEach(k => {
      if (!existingNames.has(k.toLowerCase())) {
        currentFields.push({ name: k, has_price: false });
        existingNames.add(k.toLowerCase());
        updated = true;
      }
    });

    if (updated) {
      const updatedCat: Category = {
        ...catToUpdate,
        spec_fields: currentFields,
      };
      const updatedCatList = allCats.map(c => c.id === targetCatId ? updatedCat : c);
      saveLocalCategories(updatedCatList);
      setCategories(updatedCatList);
    }
  };

  const handleSaveDraft = () => {
    syncExtraSpecsToCategory();
    const draftId = loadedDraftId || 'draft-' + Date.now();
    const draftTitle = name.trim() ? name.trim() : `${brand} Məhsulu (${new Date().toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })})`;

    const draftObj: ProductDraft = {
      id: draftId,
      title: draftTitle,
      saved_at: new Date().toISOString(),
      data: {
        name,
        slug,
        brand,
        mainCategoryId,
        subCategoryId,
        thirdCategoryId,
        costPrice,
        cashPrice,
        oldPrice,
        campaign,
        isActive,
        isNew,
        badgeDurationDays,
        description,
        videoUrl,
        imageList,
        specValues,
        extraSpecs,
        badge,
        badgeColor,
        bundledProductIds,
      },
    };

    saveLocalDraft(draftObj);
    setLoadedDraftId(draftId);
    setSavedDrafts(getLocalDrafts());
    showDraftToast('📄 Məhsul forması qaralama kimi saxlanıldı!');
  };

  const handleLoadDraft = (draft: ProductDraft) => {
    if (!draft || !draft.data) return;
    const d = draft.data;
    if (d.name !== undefined) { setName(d.name); if (!isSlugManuallyEdited && d.name) setSlug(toSlug(d.name)); }
    if (d.slug !== undefined) setSlug(d.slug);
    if (d.brand !== undefined) setBrand(d.brand);
    if (d.mainCategoryId !== undefined) setMainCategoryId(d.mainCategoryId);
    if (d.subCategoryId !== undefined) setSubCategoryId(d.subCategoryId);
    if (d.thirdCategoryId !== undefined) setThirdCategoryId(d.thirdCategoryId);
    if (d.costPrice !== undefined) setCostPrice(d.costPrice);
    if (d.cashPrice !== undefined) setCashPrice(d.cashPrice);
    if (d.oldPrice !== undefined) setOldPrice(d.oldPrice);
    if (d.campaign !== undefined) setCampaign(d.campaign);
    if (d.isActive !== undefined) setIsActive(d.isActive);
    if (d.isNew !== undefined) setIsNew(d.isNew);
    if (d.badgeDurationDays !== undefined) setBadgeDurationDays(d.badgeDurationDays);
    if (d.description !== undefined) setDescription(d.description);
    if (d.videoUrl !== undefined) setVideoUrl(d.videoUrl);
    if (d.imageList !== undefined) setImageList(d.imageList);
    if (d.specValues !== undefined) setSpecValues(d.specValues);
    if (d.extraSpecs !== undefined) setExtraSpecs(d.extraSpecs);
    if (d.badge !== undefined) setBadge(d.badge);
    if (d.badgeColor !== undefined) setBadgeColor(d.badgeColor);
    if (d.bundledProductIds !== undefined) setBundledProductIds(d.bundledProductIds);

    setLoadedDraftId(draft.id);
    showDraftToast('📂 Qaralama məlumatları formaya yükləndi!');
  };

  const handleDiscardDraft = (id: string) => {
    deleteLocalDraft(id);
    if (loadedDraftId === id) setLoadedDraftId(null);
    setSavedDrafts(getLocalDrafts());
    showDraftToast('Qaralama silindi.');
  };

  // ── Load categories & products ─────────────────────────────────────────
  useEffect(() => {
    const cats = getLocalCategories() || [];
    setCategories(cats);

    const prods = getLocalProducts() || [];
    setAllProducts(prods.filter(p => p.id !== initialProduct?.id));

    if (cats.length > 0) {
      if (initialProduct?.category_id) {
        const found = cats.find(c => c.id === initialProduct.category_id);
        if (found) {
          if (found.parent_id) {
            const parent = cats.find(c => c.id === found.parent_id);
            if (parent && parent.parent_id) {
              // Level 3 category
              setMainCategoryId(parent.parent_id);
              setSubCategoryId(parent.id);
              setThirdCategoryId(found.id);
            } else {
              // Level 2 category
              setMainCategoryId(found.parent_id);
              setSubCategoryId(found.id);
              setThirdCategoryId('');
            }
          } else {
            // Level 1 category
            setMainCategoryId(found.id);
            setSubCategoryId('');
            setThirdCategoryId('');
          }
        }
      } else {
        const mainCats = cats.filter(c => !c.parent_id || c.level === 1);
        if (mainCats.length > 0) setMainCategoryId(mainCats[0].id);
      }
    }
  }, []);

  const mainCategories = categories.filter(c => !c.parent_id || c.level === 1);
  const subCategories = categories.filter(c => c.parent_id === mainCategoryId);
  const thirdCategories = categories.filter(c => c.parent_id === subCategoryId);

  // ── Get spec_fields for the active category ────────────────────────────
  // Look up the selected 3rd-level, sub-category, or main category
  const activeCategoryId = thirdCategoryId || subCategoryId || mainCategoryId;
  const activeCat = categories.find(c => c.id === activeCategoryId);
  const parentCat = activeCat?.parent_id
    ? categories.find(c => c.id === activeCat.parent_id)
    : null;
  const grandParentCat = parentCat?.parent_id
    ? categories.find(c => c.id === parentCat.parent_id)
    : null;

  // Merge: own category spec_fields + parent's + grandparent's (deduplicated)
  const categorySpecFields: CategorySpecFieldItem[] = React.useMemo(() => {
    const rawList = [
      ...(activeCat?.spec_fields || []),
      ...(parentCat?.spec_fields || []),
      ...(grandParentCat?.spec_fields || []),
    ];
    const map = new Map<string, CategorySpecFieldItem>();
    rawList.forEach(item => {
      if (typeof item === 'string') {
        const trimmed = item.trim();
        const lower = trimmed.toLowerCase();
        if (trimmed && !map.has(lower)) {
          // Strictly check for memory / storage and NEVER match battery or capacity
          const isPriced = (lower === 'yaddaş' || lower === 'daxili yaddaş' || lower === 'storage' || lower === 'yaddaş həcmi') &&
                           !lower.includes('batareya') && !lower.includes('akkumulyator') && !lower.includes('tutumu') && !lower.includes('ram');
          map.set(lower, {
            name: trimmed,
            has_price: isPriced,
          });
        }
      } else if (item && item.name && item.name.trim()) {
        const trimmed = item.name.trim();
        const lower = trimmed.toLowerCase();
        if (!map.has(lower)) {
          map.set(lower, {
            name: trimmed,
            has_price: Boolean(item.has_price),
            unit: item.unit,
          });
        }
      }
    });
    return Array.from(map.values());
  }, [activeCat, parentCat, grandParentCat]);

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isSlugManuallyEdited) setSlug(toSlug(val));
  };

  // ── Handlers for Images & Video Uploads ──────────────────────────────
  const handleMultipleFileUploads = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const remainingQuota = MAX_IMAGES - imageList.length;
      if (remainingQuota <= 0) {
        alert(`1 məhsul üçün maksimum ${MAX_IMAGES} şəkil yükləmək mümkündür!`);
        e.target.value = '';
        return;
      }
      setIsUploadingImages(true);
      try {
        const fileArray = Array.from(files).slice(0, remainingQuota);
        const uploadPromises = fileArray.map(async file => {
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });

          // Upload to backend storage and convert to WebP
          const storageUrl = await uploadImageToStorageApi(base64, 'products');

          saveMediaToApi({
            name: file.name.replace(/\.[^/.]+$/, ''),
            url: storageUrl,
          }).catch(() => { });

          return storageUrl;
        });

        const uploadedUrls = await Promise.all(uploadPromises);
        setImageList(prev => [...prev, ...uploadedUrls].slice(0, MAX_IMAGES));
      } catch (err) {
        console.error('Failed to upload image to storage:', err);
      } finally {
        setIsUploadingImages(false);
      }
    }
    e.target.value = '';
  };

  const handleSetMainImage = (index: number) => {
    if (index === 0) return;
    setImageList(prev => {
      const copy = [...prev];
      const selected = copy.splice(index, 1)[0];
      return [selected, ...copy];
    });
  };

  const handleRemoveImage = (index: number) => {
    setImageList(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerateAiDescription = async () => {
    if (!name.trim()) {
      alert('Zəhmət olmasa əvvəlcə məhsulun model adını daxil edin!');
      return;
    }
    setIsGeneratingAiContent(true);
    try {
      const res = await fetch('/api/ai/generate-product-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: name,
          category: category,
          brand: brand,
          specs: specAttributes,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.description) {
          setDescription(data.description);
        }
      }
    } catch (e) {
      console.error('Failed to generate AI product description:', e);
    } finally {
      setIsGeneratingAiContent(false);
    }
  };

  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        alert('Video faylının həcmi 100MB-dan çox olmamalıdır!');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const videoDataUrl = reader.result as string;
        setVideoUrl(videoDataUrl);
        setVideos(prev => {
          const exists = prev.some(v => v.type === 'upload');
          if (exists) {
            return prev.map(v => v.type === 'upload' ? { ...v, url: videoDataUrl } : v);
          }
          return [...prev, { url: videoDataUrl, title: 'Məhsul Video Faylı', type: 'upload' as const }].slice(0, MAX_VIDEOS);
        });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const minVariantPrice = storageVariants.length > 0
    ? Math.min(...storageVariants.map(v => Number(v.price) || 0))
    : 0;

  const calculatedDiscount = (() => {
    const effectiveCash = storageVariants.length > 0 && minVariantPrice > 0 ? minVariantPrice : parseFloat(cashPrice);
    const old = parseFloat(oldPrice);
    if (!isNaN(effectiveCash) && !isNaN(old) && old > effectiveCash && old > 0) {
      return `-${Math.round(((old - effectiveCash) / old) * 100)}%`;
    }
    return '';
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!name.trim()) { setFormError('Zəhmət olmasa məhsulun adını daxil edin.'); return; }
    
    // If storage variants exist, validate them
    if (storageVariants.length > 0) {
      for (const v of storageVariants) {
        if (!v.size.trim()) {
          setFormError('Bütün variantların adını (məs: 128 GB) daxil edin.');
          return;
        }
        if (!v.price || isNaN(Number(v.price)) || Number(v.price) <= 0) {
          setFormError(`"${v.size}" variantı üçün düzgün satış qiyməti daxil edin.`);
          return;
        }
      }
    } else {
      if (!cashPrice || isNaN(parseFloat(cashPrice))) { setFormError('Zəhmət olmasa düzgün satış qiyməti daxil edin.'); return; }
    }

    setLoading(true);

    try {
      const targetCatId = thirdCategoryId || subCategoryId || mainCategoryId;
      const targetCatObj = categories.find(c => c.id === targetCatId);
      const parsedCashPrice = (storageVariants.length > 0 && minVariantPrice > 0)
        ? minVariantPrice
        : parseFloat(cashPrice);
      const parsedOldPrice = oldPrice ? parseFloat(oldPrice) : (storageVariants.find(v => v.old_price)?.old_price);
      const parsedCostPrice = costPrice ? parseFloat(costPrice) : (storageVariants.find(v => v.cost_price)?.cost_price);
      const newBadgeUntil = isNew
        ? new Date(Date.now() + (badgeDurationDays || 7) * 24 * 60 * 60 * 1000).toISOString()
        : undefined;

      // Auto-save any new extra spec names to the category's template spec_fields
      syncExtraSpecsToCategory();

      // Merge category-driven spec values + custom extra rows
      const attributes: Record<string, string> = { ...specValues };
      extraSpecs.forEach(s => { if (s.key.trim()) attributes[s.key.trim()] = s.value.trim(); });

      const mainImg = imageList.length > 0 ? imageList[0] : DUMMY_IMAGE;

      const productPayload: Product = {
        id: (productId.trim() || initialProduct?.id || ('prod-' + Date.now())),
        name: name.trim(),
        model_name: name.trim(),
        slug: slug.trim() || toSlug(name),
        brand: brand || 'Apple',
        category_id: targetCatId,
        category_name: targetCatObj?.name || 'Ümumi',
        cost_price: parsedCostPrice,
        cash_price: parsedCashPrice,
        old_price: parsedOldPrice,
        discount: calculatedDiscount || undefined,
        stock: initialProduct?.stock !== undefined ? initialProduct.stock : 0,
        campaign: campaign !== 'Kampaniya Yoxdur' ? campaign : undefined,
        image: mainImg,
        images: imageList.length > 0 ? imageList.slice(0, MAX_IMAGES) : [mainImg],
        videos: videos.slice(0, MAX_VIDEOS),
        storage_variants: storageVariants,
        description: description.trim() || undefined,
        youtube_button_text: youtubeButtonText.trim() || 'Video İcmala Bax',
        bundled_product_ids: bundledProductIds,
        alternative_product_ids: alternativeProductIds,
        service_ids: serviceIds,
        colors: colorVariants.map(c => {
          const linkedProd = c.productId ? allProducts.find(p => p.id === c.productId) : null;
          return {
            name: c.name.trim(),
            hex: c.hex,
            slug: c.slug || (linkedProd ? (linkedProd.slug || toSlug(linkedProd.name || linkedProd.model_name || '')) : undefined),
            productId: c.productId || undefined,
          };
        }),
        is_active: isActive,
        is_new: isNew,
        new_badge_until: newBadgeUntil,
        attributes,
        badge: badge.trim() || undefined,
        badge_color: badge.trim() ? badgeColor : undefined,
        updated_at: new Date().toISOString(),
      };

      const allLocalProds = getLocalProducts() || [];
      const updatedLocal: Product[] = isEditMode
        ? allLocalProds.map(p => p.id === productPayload.id ? productPayload : p)
        : [productPayload, ...allLocalProds];

      saveLocalProducts(updatedLocal);
      await saveProductToApi(productPayload);

      // Sync badge to Kampaniyalar Və Aksiyalar custom badges list
      if (badge.trim()) {
        try {
          const customBadgesStr = localStorage.getItem('technomania_custom_badges');
          const customBadgesList = customBadgesStr ? JSON.parse(customBadgesStr) : [];
          if (Array.isArray(customBadgesList)) {
            const exists = customBadgesList.some((b: any) => b.label?.toLowerCase() === badge.trim().toLowerCase());
            if (!exists) {
              customBadgesList.push({
                id: 'bdg-' + Date.now(),
                label: badge.trim(),
                colorBg: badgeColor || '#4f533b',
                colorText: '#ffffff',
                productIds: [productPayload.id]
              });
              localStorage.setItem('technomania_custom_badges', JSON.stringify(customBadgesList));
              window.dispatchEvent(new Event('techno_badges_updated'));
              window.dispatchEvent(new Event('storage'));
            }
          }
        } catch (e) { }
      }

      if (loadedDraftId) {
        deleteLocalDraft(loadedDraftId);
      }

      setLoading(false);
      if (onSuccess) onSuccess(); else router.push('/products');
    } catch (err) {
      console.error('Error saving product:', err);
      setFormError('Məhsul yadda saxlanılarkən xəta baş verdi.');
      setLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <form
      onSubmit={handleSubmit}
      className="text-slate-700 relative"
      style={{ fontFamily: 'var(--font-rethink-sans, inherit)' }}
    >
      {/* Draft Toast Notification */}
      {draftToast && (
        <div className="mb-4 p-3.5 rounded-xl bg-[#4f533b] text-white text-xs font-bold flex items-center justify-between shadow-md border border-white/20 animate-fadeIn">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-300 flex-shrink-0" />
            {draftToast}
          </span>
          <button type="button" onClick={() => setDraftToast(null)} className="text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Saved Drafts Banner */}
      {!isEditMode && savedDrafts.length > 0 && (
        <div className="mb-5 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-slate-800 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-200/60 border border-amber-300 text-amber-800 flex items-center justify-center font-bold">
                <Bookmark className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 tracking-wider">
                  Saxlanılmış Qaralamanız (Taslak) Var
                </h4>
                <p className="text-xs text-slate-600 font-medium">
                  Yarımçıq saxladığınız məhsul formasını yükləyərək doldurmağa davam edin.
                </p>
              </div>
            </div>
            <span className="text-xs font-extrabold text-amber-800 bg-amber-200/80 border border-amber-300 px-2.5 py-0.5 rounded-full">
              {savedDrafts.length} qaralama
            </span>
          </div>

          <div className="space-y-2 pt-1 border-t border-amber-200/80">
            {savedDrafts.slice(0, 3).map(draft => (
              <div key={draft.id} className="flex items-center justify-between bg-white border border-amber-200 p-2.5 rounded-xl text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                  <span className="font-extrabold text-slate-800 truncate" title={draft.title}>
                    {draft.title || 'Adsız Məhsul Qaralaması'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    ({new Date(draft.saved_at).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })})
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleLoadDraft(draft)}
                    className="bg-[#4f533b] hover:bg-[#3e4230] text-white px-3 py-1.5 rounded-lg text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Yüklə Və Davam Et
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDiscardDraft(draft.id)}
                    className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                    title="Qaralamanı Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Banner */}
      {formError && (
        <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* ── TWO-COLUMN LAYOUT ─────────────────────────────────────────────── */}
      <div className="flex gap-5 items-start">

        {/* ══ LEFT COLUMN — Main Form ═════════════════════════════════════ */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* SECTION 1: Main Info */}
          <div className={sectionCls}>
            <div className={sectionHeaderCls}>
              <Package className="w-4 h-4 text-[#4f533b]" />
              <span className={sectionTitleCls}>Əsas məhsul məlumatları</span>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-8">
                  <label className={labelCls}>Məhsulun adı <span className="text-rose-400">*</span></label>
                  <input
                    type="text" required
                    value={name}
                    onChange={e => handleNameChange(e.target.value)}
                    placeholder="Məs: iPhone 15 Pro Max 256GB Titanium Silver"
                    className={inputCls}
                  />
                </div>
                <div className="sm:col-span-4">
                  <div className="flex items-center justify-between mb-1">
                    <label className={labelCls + ' mb-0'}>Məhsul ID / Stok Kodu (SKU)</label>
                    <span className="text-[10px] text-slate-400">{isEditMode ? 'Unikal ID' : 'Boşdursa avto'}</span>
                  </div>
                  <input
                    type="text"
                    value={productId}
                    onChange={e => setProductId(e.target.value)}
                    placeholder="Məs: p-apple-15promax və ya TM-10023"
                    className={`${inputCls} font-mono text-xs`}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className={labelCls + ' mb-0'}>URL Slug</label>
                  <span className="text-xs text-slate-400">Avtomatik yaranır</span>
                </div>
                <div className="flex items-center">
                  <span className="bg-slate-50 border border-r-0 border-slate-200 px-3 py-2.5 text-slate-400 text-sm rounded-l-xl select-none">/product/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={e => { setSlug(e.target.value); setIsSlugManuallyEdited(true); }}
                    placeholder="iphone-15-pro-max-256gb"
                    className="flex-1 bg-white border border-slate-200 rounded-r-xl px-3.5 py-2.5 text-sm text-slate-700 font-mono outline-none focus:border-[#4f533b] transition"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Brand & Category */}
          <div className={sectionCls}>
            <div className={sectionHeaderCls}>
              <Layers className="w-4 h-4 text-[#4f533b]" />
              <span className={sectionTitleCls}>Brend Və Kateqoriya Təyinatı</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 items-end">
              <div className="flex flex-col justify-end h-full">
                <label className="block text-xs font-bold text-slate-700 mb-1 min-h-[22px] flex items-center">
                  Brend <span className="text-rose-400 ml-0.5">*</span>
                </label>
                <select value={brand} onChange={e => setBrand(e.target.value)} className={inputCls + ' h-[42px]'}>
                  {BRANDS_LIST.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="flex flex-col justify-end h-full">
                <label className="block text-xs font-bold text-slate-700 mb-1 min-h-[22px] flex items-center">
                  Əsas Kateqoriya (1-ci Səviyyə)
                </label>
                <select
                  value={mainCategoryId}
                  onChange={e => {
                    setMainCategoryId(e.target.value);
                    setSubCategoryId('');
                    setThirdCategoryId('');
                    setSpecValues({});
                  }}
                  className={inputCls + ' h-[42px]'}
                >
                  {mainCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col justify-end h-full">
                <label className="block text-xs font-bold text-slate-700 mb-1 min-h-[22px] flex items-center">
                  Alt Kateqoriya (2-ci Səviyyə)
                </label>
                <select
                  value={subCategoryId}
                  onChange={e => {
                    setSubCategoryId(e.target.value);
                    setThirdCategoryId('');
                    setSpecValues({});
                  }}
                  className={inputCls + ' h-[42px]'}
                >
                  <option value="">Alt kateqoriya seçilməyib</option>
                  {subCategories.map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col justify-end h-full">
                <label className="block text-xs font-bold text-slate-700 mb-1 min-h-[22px] flex items-center">
                  3-cü Səviyyəli Kateqoriya
                </label>
                <select
                  value={thirdCategoryId}
                  onChange={e => {
                    setThirdCategoryId(e.target.value);
                    setSpecValues({});
                  }}
                  className={inputCls + ' h-[42px]'}
                  disabled={!subCategoryId || thirdCategories.length === 0}
                >
                  <option value="">
                    {thirdCategories.length === 0 ? '3-cü səviyyə yoxdur' : '3-cü səviyyə seçilməyib'}
                  </option>
                  {thirdCategories.map(tc => <option key={tc.id} value={tc.id}>{tc.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 3: Pricing */}
          <div className={sectionCls}>
            <div className={sectionHeaderCls}>
              <Tag className="w-4 h-4 text-[#4f533b]" />
              <span className={sectionTitleCls}>Qiymətləndirmə və anbar</span>
              {calculatedDiscount && (
                <span className="ml-auto text-xs font-bold text-[#4f533b] bg-[#f4f5f0] border border-[#4f533b]/20 px-2.5 py-0.5 rounded-full">
                  Endirim: {calculatedDiscount}
                </span>
              )}
            </div>

            {/* If product has pricing variants */}
            {storageVariants.length > 0 && (
              <div className="mb-3.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 font-bold">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Məhsulun {storageVariants.length} qiymətli variantı aktivdir. Əsas satış qiyməti baza variantından ({minVariantPrice} ₼) avtomatik təyin olunur.
                  </span>
                </div>
                <span className="bg-amber-200/80 text-amber-900 px-2.5 py-1 rounded-lg text-[11px] font-extrabold shrink-0 border border-amber-300">
                  Baza Satış: {minVariantPrice} ₼
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-end">
              <div className="flex flex-col justify-end h-full">
                <label className="block text-xs font-bold text-slate-700 mb-1 min-h-[22px] flex items-center justify-between">
                  <span>Satış qiyməti (₼) <span className="text-rose-400 ml-0.5">*</span></span>
                  {storageVariants.length > 0 && (
                    <span className="text-[10px] text-amber-700 font-bold bg-amber-100 px-1.5 py-0.5 rounded">Variantlardan Bağlıdır</span>
                  )}
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  disabled={storageVariants.length > 0}
                  value={storageVariants.length > 0 ? (minVariantPrice || '') : cashPrice}
                  onChange={e => setCashPrice(e.target.value)}
                  placeholder="2499.99"
                  className={`${inputCls} h-[42px] ${storageVariants.length > 0 ? 'bg-slate-100/80 text-slate-600 font-black cursor-not-allowed border-amber-300' : ''}`}
                />
              </div>
              <div className="flex flex-col justify-end h-full">
                <label className="block text-xs font-bold text-slate-700 mb-1 min-h-[22px] flex items-center">
                  Köhnə qiymət (₼)
                </label>
                <input type="number" step="0.01" value={oldPrice} onChange={e => setOldPrice(e.target.value)} placeholder="2899.99" className={inputCls + ' h-[42px]'} />
              </div>
              <div className="flex flex-col justify-end h-full">
                <div className="flex items-center justify-between mb-1 min-h-[22px]">
                  <label className="block text-xs font-bold text-slate-700">Stok sayı</label>
                  <span className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-bold">
                    {isEditMode ? 'Mövcud stok' : 'Avtomatik 0'}
                  </span>
                </div>
                <input
                  type="text"
                  disabled
                  value={isEditMode ? `${stockDisplay} ədəd` : '0 ədəd (Anbar bölməsi)'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-600 font-semibold cursor-not-allowed h-[42px]"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4.5: Product Badge & Label */}
          <div className={sectionCls}>
            <div className={sectionHeaderCls}>
              <Tag className="w-4 h-4 text-[#4f533b]" />
              <span className={sectionTitleCls}>Məhsul etiketləri</span>
              {(isNew || badge) && (
                <div className="ml-auto flex items-center gap-1.5">
                  {isNew && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-extrabold text-white bg-[#4f533b]">
                      ⚡ YENİ ({badgeDurationDays > 0 ? `${badgeDurationDays} Gün` : 'Daimi'})
                    </span>
                  )}
                  {badge && (
                    <span
                      className="text-xs px-2.5 py-0.5 rounded-full font-extrabold text-white shadow-2xs"
                      style={{ backgroundColor: badgeColor }}
                    >
                      {badge}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* 1. "YENİ" Badge Control Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isNew ? 'bg-[#4f533b] text-white' : 'bg-slate-200 text-slate-500'}`}>
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-800 cursor-pointer block">
                      "YENİ" Məhsul Etiketini Aktiv Et / Bağla
                    </label>
                    <span className="text-[11px] text-slate-400 block">
                      Məhsul kartının üzərində parlaq "YENİ" rozetkası çıxarır
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsNew(!isNew)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isNew ? 'bg-[#4f533b]' : 'bg-slate-300'
                    }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${isNew ? 'translate-x-5' : 'translate-x-0'
                      }`}
                  />
                </button>
              </div>

              {isNew && (
                <div className="pt-2 border-t border-slate-200/60 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center text-xs">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">"YENİ" Etiketinin Qalma Müddəti:</label>
                    <select
                      value={badgeDurationDays}
                      onChange={e => setBadgeDurationDays(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-[#4f533b]"
                    >
                      <option value={7}>1 Həftə (7 Gün) — [Standart]</option>
                      <option value={14}>2 Həftə (14 Gün)</option>
                      <option value={30}>1 Ay (30 Gün)</option>
                      <option value={0}>Daimi (Söndürülənədək)</option>
                    </select>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
                    <Info className="w-4 h-4 text-[#4f533b] flex-shrink-0" />
                    <span>
                      {badgeDurationDays > 0
                        ? `Etiket ${badgeDurationDays} gündən sonra avtomatik olaraq məhsulun üstündən silinəcək.`
                        : 'Etiket siz formadan söndürənədək məhsulun üstündə daimi qalacaq.'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Custom Badge / Etiket Selector */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className={labelCls}>Əlavə etiket seçin</label>
                <select
                  value={badge}
                  onChange={e => {
                    const val = e.target.value;
                    if (val === '__custom__') {
                      setIsCreatingCustomBadge(true);
                      setBadge('');
                    } else {
                      setIsCreatingCustomBadge(false);
                      setBadge(val);
                      const matched = availableBadges.find((b: any) => b.name === val);
                      if (matched) setBadgeColor(matched.color);
                    }
                  }}
                  className={inputCls}
                >
                  <option value="">Badge Yoxdur (Boş)</option>
                  {availableBadges.map((b: any) => (
                    <option key={b.id || b.name} value={b.name}>
                      🏷️ {b.name}
                    </option>
                  ))}
                  <option value="__custom__">🎨 + Yeni Badge Yarat Və Kampaniyalara Əlavə Et...</option>
                </select>
              </div>

              {/* Custom Badge Creator Block */}
              {(isCreatingCustomBadge || (badge !== '' && !availableBadges.some((b: any) => b.name === badge))) && (
                <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <label className="block text-xs font-bold text-slate-700">Yeni Badge Adı və Rəngini Təyin Edin:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={badge}
                      onChange={e => setBadge(e.target.value)}
                      placeholder="Məsələn: Hit Satış, Eksklüziv"
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-[#4f533b]"
                    />
                    <input
                      type="color"
                      value={badgeColor}
                      onChange={e => setBadgeColor(e.target.value)}
                      className="w-9 h-9 rounded-xl border border-slate-200 cursor-pointer p-0.5 flex-shrink-0"
                      title="Badge Rəngi Seçin"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-slate-400 mr-1 font-medium">Rəng Secimi:</span>
                    {['#ef4444', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#4f533b', '#0f172a'].map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setBadgeColor(c)}
                        className="w-5 h-5 rounded-md border border-white shadow-2xs cursor-pointer transition hover:scale-110"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 5: Product Media (Image & Video Uploads) */}
          <div className={sectionCls}>
            <div className={sectionHeaderCls}>
              <ImageIcon className="w-4 h-4 text-[#4f533b]" />
              <span className={sectionTitleCls}>Məhsul Şəkilləri Və Video İcmalları</span>
              <span className="ml-auto text-xs font-bold text-[#4f533b] bg-[#f4f5f0] border border-[#4f533b]/20 px-2.5 py-0.5 rounded-full">
                Maks: 6 Şəkil | 2 Video
              </span>
            </div>

            {/* 1. Upload Controls: Image & Video Uploaders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Multiple Image Upload Box (Max 6) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    1. Məhsul şəkilləri (Maks 6 şəkil)
                  </label>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                    imageList.length >= MAX_IMAGES ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {imageList.length}/{MAX_IMAGES} yüklənib
                  </span>
                </div>

                <label className={`border-2 border-dashed rounded-xl p-4 text-center transition relative flex flex-col items-center justify-center min-h-[120px] ${
                  imageList.length >= MAX_IMAGES
                    ? 'bg-slate-100/60 border-slate-200 cursor-not-allowed opacity-60'
                    : 'bg-slate-50 border-slate-200 hover:border-[#4f533b] cursor-pointer'
                }`}>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={imageList.length >= MAX_IMAGES || isUploadingImages}
                    onChange={handleMultipleFileUploads}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10 disabled:cursor-not-allowed"
                  />
                  {isUploadingImages ? (
                    <div className="flex flex-col items-center">
                      <div className="w-7 h-7 border-2 border-[#4f533b] border-t-transparent rounded-full animate-spin mb-2" />
                      <span className="text-sm font-bold text-[#4f533b]">WebP formatına çevrilir və storage-ə yüklənir...</span>
                      <span className="text-xs text-slate-400 mt-0.5">Zəhmət olmasa gözləyin</span>
                    </div>
                  ) : (
                    <>
                      <UploadCloud className="w-7 h-7 text-[#4f533b] mb-1.5" />
                      <span className="text-sm font-bold text-slate-700">
                        {imageList.length >= MAX_IMAGES ? 'Maksimum 6 şəkil limiti dolub' : 'Kompüterdən Şəkil Yüklə'}
                      </span>
                      <span className="text-xs text-slate-400 mt-0.5">
                        {imageList.length >= MAX_IMAGES ? 'Yeni şəkil yükləmək üçün mövcud şəkillərdən silin' : 'Bir və ya bir neçə şəkil seçin (avtomatik WebP və storage.techno-mania.az)'}
                      </span>
                    </>
                  )}
                </label>

                {/* Select from Server Media Gallery Button */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsMediaGalleryOpen(true);
                    }}
                    className="w-full bg-[#f4f5f0] hover:bg-[#e4e7da] text-[#4f533b] border border-[#4f533b]/30 rounded-xl px-3.5 py-2.5 text-xs font-extrabold transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:scale-98"
                  >
                    <FolderOpen className="w-4 h-4 text-[#4f533b]" />
                    🖼️ Mediya Qalereyasından Seç ({imageList.length}/{MAX_IMAGES})
                  </button>
                </div>
              </div>

              {/* Multi-Video Manager (Max 2 Videos) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    2. Video icmalları və YouTube (Maks 2 video)
                  </label>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    {videos.length}/{MAX_VIDEOS} video
                  </span>
                </div>

                {/* Video 1 Card */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-rose-500" /> Video #1 (Əsas)
                    </span>
                    {videos[0] && (
                      <button
                        type="button"
                        onClick={() => {
                          setVideos(prev => prev.filter((_, idx) => idx !== 0));
                          setVideoUrl('');
                          setYoutubeVideoUrl('');
                        }}
                        className="text-[11px] text-rose-600 hover:underline font-bold"
                      >
                        Sil
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">YouTube Linki və ya Video URL</label>
                    <input
                      type="text"
                      value={videos[0]?.url || ''}
                      onChange={e => {
                        const val = e.target.value;
                        const isYt = val.includes('youtube') || val.includes('youtu.be');
                        setVideos(prev => {
                          const updated = [...prev];
                          if (updated[0]) {
                            updated[0] = { ...updated[0], url: val, type: isYt ? 'youtube' : 'upload' };
                          } else {
                            updated[0] = { url: val, title: 'Video 1', type: isYt ? 'youtube' : 'upload', button_text: 'Video İcmala Bax' };
                          }
                          return updated;
                        });
                        if (isYt) setYoutubeVideoUrl(val);
                        else setVideoUrl(val);
                      }}
                      placeholder="https://www.youtube.com/watch?v=... və ya mp4 link"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-[#4f533b]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Video Düymə Mətni (Vebdə düymə)</label>
                    <input
                      type="text"
                      value={videos[0]?.button_text || youtubeButtonText}
                      onChange={e => {
                        const val = e.target.value;
                        setYoutubeButtonText(val);
                        setVideos(prev => {
                          const updated = [...prev];
                          if (updated[0]) updated[0] = { ...updated[0], button_text: val };
                          return updated;
                        });
                      }}
                      placeholder="Məs: Video İcmala Bax"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-[#4f533b]"
                    />
                  </div>

                  {/* Direct File Upload for Video 1 */}
                  <label className="bg-white border border-dashed border-rose-200 hover:border-rose-400 rounded-lg p-2 text-center transition cursor-pointer flex items-center justify-center gap-2">
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/ogg,video/quicktime"
                      onChange={handleVideoFileUpload}
                      className="hidden"
                    />
                    <UploadCloud className="w-4 h-4 text-rose-500" />
                    <span className="text-xs font-bold text-slate-700">Kompüterdən Video Fayl Yüklə (.mp4, .webm)</span>
                  </label>
                </div>

                {/* Video 2 Card (If added or Add Button) */}
                {videos.length >= 2 ? (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5 text-rose-500" /> Video #2 (Əlavə İcmal)
                      </span>
                      <button
                        type="button"
                        onClick={() => setVideos(prev => prev.filter((_, idx) => idx !== 1))}
                        className="text-[11px] text-rose-600 hover:underline font-bold"
                      >
                        Sil
                      </button>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">YouTube Linki və ya Video URL</label>
                      <input
                        type="text"
                        value={videos[1]?.url || ''}
                        onChange={e => {
                          const val = e.target.value;
                          const isYt = val.includes('youtube') || val.includes('youtu.be');
                          setVideos(prev => {
                            const updated = [...prev];
                            if (updated[1]) {
                              updated[1] = { ...updated[1], url: val, type: isYt ? 'youtube' : 'upload' };
                            } else {
                              updated[1] = { url: val, title: 'Video 2', type: isYt ? 'youtube' : 'upload', button_text: '3D Baxış / İcmal' };
                            }
                            return updated;
                          });
                        }}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-[#4f533b]"
                      />
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setVideos(prev => [
                        ...prev,
                        { url: '', title: 'Video 2', type: 'youtube', button_text: '3D Baxış / İcmal' }
                      ].slice(0, MAX_VIDEOS));
                    }}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200"
                  >
                    <Plus className="w-3.5 h-3.5" /> + 2-ci Video Əlavə Et
                  </button>
                )}
              </div>
            </div>

            {/* 2. Uploaded Images Grid Gallery (Max 6) */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 block">
                  Məhsulun Şəkillər Qalereyası ({imageList.length}/{MAX_IMAGES} şəkil):
                </span>
                {imageList.length > 0 && (
                  <span className="text-[11px] text-slate-400">
                    💡 "★ Əsas et" düyməsi ilə əsas vitrin şəklini seçə bilərsiniz
                  </span>
                )}
              </div>

              {imageList.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-1">
                  {imageList.map((img, idx) => {
                    const isMain = idx === 0;
                    return (
                      <div
                        key={idx}
                        className={`relative group bg-white border-2 rounded-xl p-1.5 flex flex-col items-center justify-between transition ${isMain ? 'border-[#4f533b] shadow-xs ring-2 ring-[#4f533b]/10' : 'border-slate-200 hover:border-slate-300'
                          }`}
                      >
                        <img
                          src={img}
                          alt={`Məhsul şəkli ${idx + 1}`}
                          className="w-full h-20 object-contain rounded-lg bg-slate-50"
                        />

                        {/* Top Badge (Main Image / Number) */}
                        {isMain ? (
                          <span className="absolute top-1 left-1 bg-[#4f533b] text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
                            ★ Əsas
                          </span>
                        ) : (
                          <span className="absolute top-1 left-1 bg-slate-800/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                            #{idx + 1}
                          </span>
                        )}

                        {/* Actions overlay */}
                        <div className="flex items-center justify-center gap-1 mt-1.5 w-full border-t border-slate-100 pt-1">
                          {!isMain && (
                            <button
                              type="button"
                              onClick={() => handleSetMainImage(idx)}
                              className="text-[10px] bg-slate-100 hover:bg-[#f4f5f0] text-slate-700 hover:text-[#4f533b] px-1.5 py-0.5 rounded font-bold transition flex-1 text-center cursor-pointer"
                              title="Əsas Şəkil Et"
                            >
                              ★ Əsas et
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition cursor-pointer"
                            title="Şəkli Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                  Hələ şəkil əlavə edilməyib. Yuxarıdakı qutudan kompüterdən yükləyin və ya "Mediya Qalereyasından Seç" düyməsinə klikləyin.
                </div>
              )}
            </div>

            {/* 3. Video Preview Player (if video added) */}
            {videos.length > 0 && videos.some(v => v.url) && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-rose-500" /> Əlavə Edilmiş Video Önbaxışı ({videos.filter(v => v.url).length} video):
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {videos.filter(v => v.url).map((v, i) => (
                    <div key={i} className="rounded-xl overflow-hidden bg-slate-900 border border-slate-800 p-2.5 flex flex-col justify-between">
                      {v.url.startsWith('data:video/') || v.url.match(/\.(mp4|webm|ogg|mov)($|\?)/i) ? (
                        <video src={v.url} controls className="w-full max-h-48 rounded-lg object-contain" />
                      ) : (
                        <div className="flex items-center justify-between p-2 text-white text-xs bg-slate-800/80 rounded-lg">
                          <span className="font-mono text-slate-300 truncate max-w-[180px]">{v.url}</span>
                          <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-bold text-[10px]">YouTube Video</span>
                        </div>
                      )}
                      <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800 mt-2">
                        <span>Video #{i + 1}: <strong className="text-white">{v.button_text || 'Video İcmal'}</strong></span>
                        <button
                          type="button"
                          onClick={() => setVideos(prev => prev.filter((_, idx) => idx !== i))}
                          className="text-rose-400 hover:text-rose-300 cursor-pointer"
                        >
                          Sil
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 6: Product Description with Stripe AI Button & Rich Text Editor */}
          <div className={sectionCls}>
            <div className={sectionHeaderCls}>
              <FileText className="w-4 h-4 text-[#4f533b]" />
              <span className={sectionTitleCls}>Məhsul haqqında açıqlama (Description)</span>
              
              {/* Stripe-style Techno AI Button */}
              <button
                type="button"
                onClick={handleGenerateAiDescription}
                disabled={isGeneratingAiContent}
                className="ml-auto inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200/90 shadow-2xs hover:border-slate-300 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all duration-150 active:scale-95 cursor-pointer disabled:opacity-50"
                title="Məhsul adı və parametrləri əsasında avtomatik zəngin təsvir yaradın"
              >
                <Sparkles className={`w-3.5 h-3.5 text-[#4f533b] ${isGeneratingAiContent ? 'animate-spin' : ''}`} />
                <span>{isGeneratingAiContent ? 'Techno AI Yazır...' : '✨ Techno AI ilə Təsvir Yaz'}</span>
              </button>
            </div>

            <div className="space-y-2">
              {/* Rich Text Editor Toolbar & Mode Switcher */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex flex-wrap items-center gap-1">
                  <button
                    type="button"
                    onClick={() => insertFormatting('<b>', '</b>', 'Qalın mətn')}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 transition cursor-pointer shadow-2xs"
                    title="Qalın (Bold)"
                  >
                    B
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('<i>', '</i>', 'Kursiv mətn')}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-xs italic font-serif text-slate-800 transition cursor-pointer shadow-2xs"
                    title="Kursiv (Italic)"
                  >
                    I
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('<u>', '</u>', 'Altıxətli mətn')}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-xs underline text-slate-800 transition cursor-pointer shadow-2xs"
                    title="Altı xətli (Underline)"
                  >
                    U
                  </button>
                  <span className="w-px h-5 bg-slate-200 mx-1" />
                  <button
                    type="button"
                    onClick={() => insertFormatting('\n<h2>', '</h2>\n', 'Əsas Başlıq')}
                    className="px-2 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-xs font-extrabold text-slate-800 transition cursor-pointer shadow-2xs"
                    title="Böyük Başlıq (H2)"
                  >
                    H2
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('\n<h3>', '</h3>\n', 'Alt Başlıq')}
                    className="px-2 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 transition cursor-pointer shadow-2xs"
                    title="Alt Başlıq (H3)"
                  >
                    H3
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('\n<p>', '</p>\n', 'Mətn abzası')}
                    className="px-2 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-xs text-slate-700 transition cursor-pointer shadow-2xs"
                    title="Abzas (P)"
                  >
                    ¶
                  </button>
                  <span className="w-px h-5 bg-slate-200 mx-1" />
                  <button
                    type="button"
                    onClick={() => insertFormatting('\n<ul>\n  <li>', '</li>\n  <li>İkinci üstünlük</li>\n</ul>\n', 'Birinci üstünlük')}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 transition cursor-pointer shadow-2xs"
                    title="Maddəli Siyahı (Bullet List)"
                  >
                    • Siyahı
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('\n<ol>\n  <li>', '</li>\n  <li>İkinci addım</li>\n</ol>\n', 'Birinci addım')}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 transition cursor-pointer shadow-2xs"
                    title="Nömrəli Siyahı (Numbered List)"
                  >
                    1. Nömrəli
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('<mark class="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-bold">', '</mark>', 'Xüsusi qeyd')}
                    className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-xs font-semibold text-amber-900 transition cursor-pointer shadow-2xs"
                    title="Vurğulama (Highlight)"
                  >
                    🏷️ Vurğula
                  </button>
                </div>

                {/* Edit / Preview Mode Switcher */}
                <div className="flex items-center gap-1 bg-slate-200/80 p-0.5 rounded-lg text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setDescriptionMode('edit')}
                    className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                      descriptionMode === 'edit'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    ✏️ Redaktə
                  </button>
                  <button
                    type="button"
                    onClick={() => setDescriptionMode('preview')}
                    className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                      descriptionMode === 'preview'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    👁️ Canlı Baxış
                  </button>
                </div>
              </div>

              {/* Editor View vs Preview View */}
              {descriptionMode === 'edit' ? (
                <textarea
                  ref={descriptionTextareaRef}
                  rows={6}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Məhsulun dizaynı, üstünlükləri, texniki imkanları və ya istifadə qaydaları haqqında ətraflı məlumat yazın və ya 'Techno AI ilə Təsvir Yaz' düyməsinə klikləyin..."
                  className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-sm text-slate-700 font-sans outline-none focus:border-[#4f533b] transition leading-relaxed placeholder:text-slate-300"
                />
              ) : (
                <div className="p-4 rounded-xl border border-slate-200 bg-white min-h-[150px] text-sm text-slate-800 leading-relaxed overflow-auto prose prose-slate max-w-none">
                  {description.trim() ? (
                    <div dangerouslySetInnerHTML={{ __html: description }} />
                  ) : (
                    <span className="text-slate-400 italic text-xs">Məhsul təsviri hələ boşdur.</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* SECTION 7: Bundled Products (Birlikdə Satılanlar) */}
          <div className={sectionCls}>
            <div className={sectionHeaderCls}>
              <Layers className="w-4 h-4 text-[#4f533b]" />
              <span className={sectionTitleCls}>Birlikdə Satılan Məhsullar (Birgə Satılanlar)</span>
              <span className="ml-auto text-xs text-slate-400">
                Seçilmiş: <strong className="text-[#4f533b]">{bundledProductIds.length} məhsul</strong>
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Bu məhsulla birlikdə tövsiyə olunan aksessuarları və ya tamamlayıcı məhsulları aşağıdakı siyahıdan seçin:
            </p>

            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={bundleSearchQuery}
                onChange={e => setBundleSearchQuery(e.target.value)}
                placeholder="Məhsul adı və ya brend ilə axtar..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-700 outline-none focus:border-[#4f533b] transition"
              />
            </div>

            {/* Checkbox Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
              {allProducts
                .filter(p => p.id !== initialProduct?.id)
                .filter(p =>
                  (p.name || p.model_name || '').toLowerCase().includes(bundleSearchQuery.toLowerCase()) ||
                  (p.brand || '').toLowerCase().includes(bundleSearchQuery.toLowerCase())
                )
                .map(p => {
                  const isChecked = bundledProductIds.includes(p.id);
                  const priceStr = typeof p.cash_price === 'number' ? `${p.cash_price.toFixed(2)} ₼` : p.cash_price;

                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        setBundledProductIds(prev =>
                          prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id]
                        );
                      }}
                      className={`p-2.5 rounded-xl border transition flex items-center gap-2.5 cursor-pointer select-none ${isChecked
                        ? 'bg-[#f4f5f0] border-[#4f533b]'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => { }}
                        className="w-4 h-4 text-[#4f533b] rounded border-slate-300 cursor-pointer flex-shrink-0"
                      />
                      <img
                        src={p.image || DUMMY_IMAGE}
                        alt={p.name || p.model_name}
                        className="w-8 h-8 object-contain rounded bg-white p-0.5 border border-slate-100 flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-[11px] font-bold text-slate-800 block truncate">{p.name || p.model_name}</span>
                        <span className="text-[10px] font-black text-[#4f533b] block">{priceStr}</span>
                      </div>
                    </div>
                  );
                })}

              {allProducts.length === 0 && (
                <div className="col-span-full py-4 text-center text-xs text-slate-400">
                  Bazada digər məhsul tapılmadı
                </div>
              )}
            </div>
          </div>

          {/* SECTION 8: Product Colors & Variant Redirection */}
          <div className={sectionCls}>
            <div className={sectionHeaderCls}>
              <Sliders className="w-4 h-4 text-[#4f533b]" />
              <span className={sectionTitleCls}>Məhsul Rəngləri və Variant Yönləndirməsi</span>
              <span className="ml-auto text-xs text-slate-400">
                {colorVariants.length} rəng variantı
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Bu məhsul üçün mövcud rəngləri əlavə edin. Hər bir rəng seçimi üçün mağazada açılacaq müvafiq variant məhsulunu təyin edə bilərsiniz:
            </p>

            {/* Add New Color Row */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Rəng Adı</label>
                  <input
                    type="text"
                    value={newColorName}
                    onChange={e => setNewColorName(e.target.value)}
                    placeholder="Məs: Təbii Titan, Qara, Göy"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-[#4f533b]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Rəng Kodu</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={newColorHex}
                      onChange={e => setNewColorHex(e.target.value)}
                      className="w-9 h-8 rounded-lg border border-slate-200 cursor-pointer p-0.5 bg-white"
                      title="Rəng seçicisi"
                    />
                    <input
                      type="text"
                      value={newColorHex}
                      onChange={e => setNewColorHex(e.target.value)}
                      className="w-16 bg-white border border-slate-200 rounded-lg px-1.5 py-1.5 text-[11px] font-mono text-slate-700 outline-none focus:border-[#4f533b]"
                    />
                  </div>
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Yönləndiriləcək Məhsul (Variant)</label>
                  <select
                    value={newColorProductId}
                    onChange={e => setNewColorProductId(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-700 outline-none focus:border-[#4f533b]"
                  >
                    <option value="">Bu məhsulda qal (Eyni səhifə)</option>
                    {allProducts
                      .filter(p => p.id !== initialProduct?.id)
                      .map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name || p.model_name} ({p.brand})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!newColorName.trim()) return;
                      const linkedProd = allProducts.find(p => p.id === newColorProductId);
                      const newColor = {
                        id: `col-${Date.now()}`,
                        name: newColorName.trim(),
                        hex: newColorHex || '#1e293b',
                        productId: newColorProductId || undefined,
                        slug: linkedProd ? (linkedProd.slug || toSlug(linkedProd.name || linkedProd.model_name || '')) : undefined,
                      };
                      setColorVariants(prev => [...prev, newColor]);
                      setNewColorName('');
                      setNewColorHex('#1e293b');
                      setNewColorProductId('');
                    }}
                    disabled={!newColorName.trim()}
                    className="w-full py-2 bg-[#4f533b] hover:bg-[#3e4230] disabled:opacity-40 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Əlavə et
                  </button>
                </div>
              </div>

              {/* Quick Color Presets */}
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400 font-medium">Sürətli Palitra:</span>
                {[
                  { name: 'Qara', hex: '#0f172a' },
                  { name: 'Ağ', hex: '#ffffff' },
                  { name: 'Boz', hex: '#94a3b8' },
                  { name: 'Təbii Titan', hex: '#b3a89b' },
                  { name: 'Qızılı', hex: '#d97706' },
                  { name: 'Göy', hex: '#2563eb' },
                  { name: 'Yaşıl', hex: '#16a34a' },
                  { name: 'Qırmızı', hex: '#dc2626' },
                  { name: 'Bənövşəyi', hex: '#7c3aed' },
                  { name: 'Zeytun', hex: '#4f533b' },
                ].map(cp => (
                  <button
                    key={cp.name}
                    type="button"
                    onClick={() => {
                      setNewColorName(cp.name);
                      setNewColorHex(cp.hex);
                    }}
                    title={`${cp.name} (${cp.hex})`}
                    className="w-5 h-5 rounded-full border border-slate-300 shadow-2xs hover:scale-110 transition cursor-pointer"
                    style={{ backgroundColor: cp.hex }}
                  />
                ))}
              </div>
            </div>

            {/* Added Colors List */}
            {colorVariants.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                {colorVariants.map((c, idx) => {
                  const linkedProduct = allProducts.find(p => p.id === c.productId);
                  return (
                    <div
                      key={c.id || idx}
                      className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-2 shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="w-6 h-6 rounded-full border border-black/15 shadow-2xs shrink-0"
                          style={{ backgroundColor: c.hex }}
                        />
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-800 block truncate">{c.name}</span>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {linkedProduct ? `🔗 ${linkedProduct.name || linkedProduct.model_name}` : 'Bu səhifə'}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setColorVariants(prev => prev.filter((_, i) => i !== idx))}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-3 text-center rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-400">
                Hələ ki rəng variantı əlavə edilməyib.
              </div>
            )}
          </div>

          {/* SECTION 9: Alternative / Similar Products */}
          <div className={sectionCls}>
            <div className={sectionHeaderCls}>
              <Layers className="w-4 h-4 text-[#4f533b]" />
              <span className={sectionTitleCls}>Alternativ Seçimdə Görünəcək Məhsullar</span>
              <span className="ml-auto text-xs text-slate-400">
                Seçilmiş: <strong className="text-[#4f533b]">{alternativeProductIds.length} məhsul</strong>
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Məhsula baxış səhifəsində "Alternativ seçim" bölməsində müştəriyə təklif olunacaq əvəzedici və ya rəqib məhsulları seçin:
            </p>

            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={altSearchQuery}
                onChange={e => setAltSearchQuery(e.target.value)}
                placeholder="Alternativ məhsul adı və ya brend ilə axtar..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-700 outline-none focus:border-[#4f533b] transition"
              />
            </div>

            {/* Checkbox Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
              {allProducts
                .filter(p => p.id !== initialProduct?.id)
                .filter(p =>
                  (p.name || p.model_name || '').toLowerCase().includes(altSearchQuery.toLowerCase()) ||
                  (p.brand || '').toLowerCase().includes(altSearchQuery.toLowerCase())
                )
                .map(p => {
                  const isChecked = alternativeProductIds.includes(p.id);
                  const priceStr = typeof p.cash_price === 'number' ? `${p.cash_price.toFixed(2)} ₼` : p.cash_price;

                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        setAlternativeProductIds(prev =>
                          prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id]
                        );
                      }}
                      className={`p-2.5 rounded-xl border transition flex items-center gap-2.5 cursor-pointer select-none ${isChecked
                        ? 'bg-[#f4f5f0] border-[#4f533b]'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => { }}
                        className="w-4 h-4 text-[#4f533b] rounded border-slate-300 cursor-pointer flex-shrink-0"
                      />
                      <img
                        src={p.image || DUMMY_IMAGE}
                        alt={p.name || p.model_name}
                        className="w-8 h-8 object-contain rounded bg-white p-0.5 border border-slate-100 flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-[11px] font-bold text-slate-800 block truncate">{p.name || p.model_name}</span>
                        <span className="text-[10px] font-black text-[#4f533b] block">{priceStr}</span>
                      </div>
                    </div>
                  );
                })}

              {allProducts.length === 0 && (
                <div className="col-span-full py-4 text-center text-xs text-slate-400">
                  Bazada digər məhsul tapılmadı
                </div>
              )}
            </div>
          </div>

          {/* SECTION 10: Assigned Services */}
          <div className={sectionCls}>
            <div className={sectionHeaderCls}>
              <ShieldCheck className="w-4 h-4 text-[#4f533b]" />
              <span className={sectionTitleCls}>Məhsula təyin olunan xidmətlər</span>
              <span className="ml-auto text-xs text-slate-400">
                Seçilmiş: <strong className="text-[#4f533b]">{serviceIds.length} xidmət</strong>
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Bu məhsul üçün keçərli olan zəmanət və əlavə servis xidmətlərini seçin (Storefront-da məhsul səhifəsində "Xidmət seçin" bölməsində nümayiş olunacaq):
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {availableServices.map((svc: any) => {
                const isSelected = serviceIds.includes(svc.id);
                return (
                  <div
                    key={svc.id}
                    onClick={() => {
                      setServiceIds(prev =>
                        prev.includes(svc.id) ? prev.filter(id => id !== svc.id) : [...prev, svc.id]
                      );
                    }}
                    className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 cursor-pointer select-none ${
                      isSelected
                        ? 'bg-[#f4f5f0] border-[#4f533b] shadow-2xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-4 h-4 text-[#4f533b] rounded border-slate-300 cursor-pointer flex-shrink-0"
                      />
                      <span className="text-lg flex-shrink-0">{svc.icon || '🛡️'}</span>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-800 block truncate">{svc.name}</span>
                        {svc.description && (
                          <span className="text-[10px] text-slate-400 block truncate">{svc.description}</span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-black text-[#4f533b] flex-shrink-0">{svc.price}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 6: Specifications & Multi-Variant Builder (FULL WIDTH) */}
          <div className={sectionCls}>
            <div className={sectionHeaderCls}>
              <Sliders className="w-4 h-4 text-[#4f533b]" />
              <span className={sectionTitleCls}>Məhsul spesifikasiyaları və variantlar</span>
            </div>

            {/* Dynamic Price Variants Builder (For category specs with has_price: true, e.g. Yaddaş) */}
            {categorySpecFields.filter(f => f.has_price).map(field => (
              <div key={field.name} className="mb-5 bg-white border-2 border-[#4f533b]/20 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                        💰 {field.name} Variantları və Qiymətləri
                      </span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-extrabold">
                        {storageVariants.length} Variant
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Hər variant üçün fərdi satış qiymətini yazın (saytda seçildikdə qiymət avtomatik dəyişəcək)
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setStorageVariants(prev => [
                        ...prev,
                        {
                          size: '',
                          price: Number(cashPrice) || 0,
                          old_price: oldPrice ? Number(oldPrice) : undefined,
                          cost_price: costPrice ? Number(costPrice) : undefined
                        }
                      ]);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#4f533b] hover:bg-[#3e4230] text-white text-xs font-extrabold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95 whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Variant Əlavə Et</span>
                  </button>
                </div>

                {/* Quick Presets for Memory/Storage */}
                {(field.name.toLowerCase().includes('yaddaş') || field.name.toLowerCase().includes('storage')) && (
                  <div className="flex items-center gap-2 flex-wrap text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                    <span className="text-[11px] font-bold text-slate-500">Sürətli əlavə et:</span>
                    {['128 GB', '256 GB', '512 GB', '1 TB'].map((preset) => {
                      const alreadyAdded = storageVariants.some(v => v.size.toLowerCase() === preset.toLowerCase());
                      return (
                        <button
                          key={preset}
                          type="button"
                          disabled={alreadyAdded}
                          onClick={() => {
                            setStorageVariants(prev => [
                              ...prev,
                              {
                                size: preset,
                                price: Number(cashPrice) || 0,
                                old_price: oldPrice ? Number(oldPrice) : undefined,
                                cost_price: costPrice ? Number(costPrice) : undefined
                              }
                            ]);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                            alreadyAdded
                              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                              : 'bg-white hover:bg-[#4f533b] text-slate-700 hover:text-white border border-slate-300 shadow-2xs'
                          }`}
                        >
                          <span>+ {preset}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Variant List Cards */}
                {storageVariants.length > 0 ? (
                  <div className="space-y-3">
                    {storageVariants.map((variant, vIdx) => (
                      <div
                        key={vIdx}
                        className="p-3.5 bg-slate-50/80 hover:bg-slate-50 border border-slate-200 rounded-xl transition space-y-2.5 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-md bg-[#4f533b] text-white text-[10px] flex items-center justify-center font-black">
                              #{vIdx + 1}
                            </span>
                            <span>Variant: {variant.size || '(Ad daxil edin)'}</span>
                          </span>

                          <button
                            type="button"
                            onClick={() => setStorageVariants(prev => prev.filter((_, idx) => idx !== vIdx))}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Bu variantı sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Variant Adı *
                            </label>
                            <input
                              type="text"
                              required
                              value={variant.size}
                              onChange={e => {
                                const val = e.target.value;
                                setStorageVariants(prev => prev.map((item, idx) => idx === vIdx ? { ...item, size: val } : item));
                              }}
                              placeholder="Məs: 128 GB"
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-extrabold text-slate-900 outline-none focus:border-[#4f533b] shadow-2xs"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-[#4f533b] mb-1">
                              Satış Qiyməti (₼) *
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              required
                              value={variant.price || ''}
                              onChange={e => {
                                const val = parseFloat(e.target.value) || 0;
                                setStorageVariants(prev => prev.map((item, idx) => idx === vIdx ? { ...item, price: val } : item));
                              }}
                              placeholder="1800.00"
                              className="w-full bg-white border-2 border-[#4f533b]/40 rounded-xl px-3 py-2 text-xs font-black text-[#4f533b] outline-none focus:border-[#4f533b] shadow-2xs"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                              Köhnə Qiymət (₼)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={variant.old_price || ''}
                              onChange={e => {
                                const val = e.target.value ? parseFloat(e.target.value) : undefined;
                                setStorageVariants(prev => prev.map((item, idx) => idx === vIdx ? { ...item, old_price: val } : item));
                              }}
                              placeholder="2050.00"
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-600 outline-none focus:border-[#4f533b] shadow-2xs"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                              Maya Qiyməti (₼)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={variant.cost_price || ''}
                              onChange={e => {
                                const val = e.target.value ? parseFloat(e.target.value) : undefined;
                                setStorageVariants(prev => prev.map((item, idx) => idx === vIdx ? { ...item, cost_price: val } : item));
                              }}
                              placeholder="1500.00"
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-600 outline-none focus:border-[#4f533b] shadow-2xs"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Summary box */}
                    {minVariantPrice > 0 && (
                      <div className="p-3 rounded-xl bg-[#f4f5f0] border border-[#4f533b]/20 text-[#4f533b] text-xs font-bold flex items-center justify-between">
                        <span>🏷️ Əsas Vitrin Satış Qiyməti:</span>
                        <span className="font-black text-sm">{minVariantPrice.toLocaleString()} ₼ -dən başlayaraq</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-2">
                    <p className="text-xs font-bold text-slate-600">Hələ heç bir variant əlavə edilməyib</p>
                    <p className="text-[11px] text-slate-400">
                      Yuxarıdakı <strong>"+ Variant Əlavə Et"</strong> düyməsinə və ya sürətli düymələrə klikləyərək variantları daxil edin.
                    </p>
                  </div>
                )}
              </div>
            ))}

            {/* Standard Spec Fields (where has_price is false) */}
            {categorySpecFields.filter(f => !f.has_price).length > 0 && (
              <div className="space-y-4 pt-1">
                <p className="text-xs text-slate-500 font-bold">
                  {activeCat?.name || 'Seçilmiş kateqoriya'} üçün standart xüsusiyyətlər:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {categorySpecFields.filter(f => !f.has_price).map(field => (
                    <div key={field.name} className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">{field.name}</label>
                      <input
                        type="text"
                        value={specValues[field.name] || ''}
                        onChange={e => setSpecValues(prev => ({ ...prev, [field.name]: e.target.value }))}
                        placeholder={`${field.name} daxil edin...`}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-[#4f533b] transition shadow-2xs"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* If no spec_fields defined for the category at all */}
            {categorySpecFields.length === 0 && (
              <div className="text-center py-6 space-y-2 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div className="w-10 h-10 rounded-xl bg-slate-200/60 flex items-center justify-center mx-auto text-slate-500">
                  <Info className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-600">Bu kateqoriya üçün spesifikasiya şablonu yoxdur</p>
                <p className="text-[11px] text-slate-400">
                  Aşağıdakı "Əlavə Xüsusiyyətlər" bölməsindən fərdi parametrlər yaza bilərsiniz.
                </p>
              </div>
            )}

            {/* Extra Custom Specs */}
            <div className="border-t border-slate-100 pt-4 mt-2 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-slate-800 block">Əlavə Xüsusiyyətlər</span>
                  <span className="text-[11px] text-slate-400">Kateqoriya şablonunda olmayan əlavə parametrlər</span>
                </div>
                <button
                  type="button"
                  onClick={() => setExtraSpecs(prev => [...prev, { key: '', value: '' }])}
                  className="flex items-center gap-1.5 text-xs text-[#4f533b] bg-[#f4f5f0] hover:bg-[#e8ead5] border border-[#4f533b]/20 px-3 py-1.5 rounded-xl transition font-bold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Əlavə et
                </button>
              </div>

              {extraSpecs.length > 0 && (
                <div className="space-y-2.5">
                  {extraSpecs.map((spec, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <input
                        type="text"
                        value={spec.key}
                        onChange={e => setExtraSpecs(prev => prev.map((s, idx) => idx === i ? { ...s, key: e.target.value } : s))}
                        placeholder="Parametr adı (məs: Çəki)"
                        className="w-1/3 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 outline-none focus:border-[#4f533b] transition shadow-2xs"
                      />
                      <input
                        type="text"
                        value={spec.value}
                        onChange={e => setExtraSpecs(prev => prev.map((s, idx) => idx === i ? { ...s, value: e.target.value } : s))}
                        placeholder="Dəyəri (məs: 180 qram)"
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-[#4f533b] transition shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={() => setExtraSpecs(prev => prev.filter((_, idx) => idx !== i))}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>{/* end LEFT COLUMN */}

        {/* ══ RIGHT COLUMN — Live Preview & Actions ═══════════════════════════════ */}
        <div className="w-80 lg:w-84 flex-shrink-0 space-y-4 sticky top-4">

          {/* ══ LIVE HOMEPAGE PRODUCT CARD PREVIEW ══ */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">Məhsul kartı</span>
              </div>
              <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Canlı baxış</span>
            </div>

            {/* Simulated Homepage Product Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm relative overflow-hidden group">
              {/* Badges Bar */}
              <div className="flex items-center justify-between gap-1 mb-2">
                <div className="flex items-center gap-1 flex-wrap">
                  {campaign && campaign !== 'Kampaniya Yoxdur' && (
                    <span className="bg-[#4f533b] text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-2xs tracking-wide flex items-center gap-0.5">
                      <Sparkles className="w-2.5 h-2.5 text-amber-300" /> {campaign}
                    </span>
                  )}
                  {parseFloat(oldPrice) > parseFloat(cashPrice) && parseFloat(cashPrice) > 0 && (
                    <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-2xs">
                      -{Math.round(((parseFloat(oldPrice) - parseFloat(cashPrice)) / parseFloat(oldPrice)) * 100)}%
                    </span>
                  )}
                  {isNew && (
                    <span className="bg-[#4f533b] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md tracking-wide flex items-center gap-0.5 shadow-2xs">
                      <Zap className="w-2.5 h-2.5 text-amber-300" /> Yeni
                    </span>
                  )}
                </div>

                {/* Heart / Compare icons preview */}
                <div className="flex items-center gap-1">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <Heart className="w-3 h-3" />
                  </div>
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <Scale className="w-3 h-3" />
                  </div>
                </div>
              </div>

              {/* Product Image Preview */}
              <div className="relative aspect-4/3 w-full bg-slate-50 rounded-xl overflow-hidden mb-2.5 flex items-center justify-center border border-slate-100 p-2">
                {imageList.length > 0 && imageList[0] ? (
                  <img
                    src={imageList[0]}
                    alt={name || 'Məhsul'}
                    className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="text-center p-3">
                    <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-400 font-bold">Şəkil Əlavə Edilməyib</span>
                  </div>
                )}

                {/* Stock badge overlay */}
                <div className="absolute bottom-1.5 left-1.5">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${parseInt(stockDisplay || '0', 10) > 0
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                    {parseInt(stockDisplay || '0', 10) > 0 ? `Stokda (${stockDisplay} ədəd)` : 'Stokda Yoxdur'}
                  </span>
                </div>
              </div>

              {/* Brand & Model Name */}
              <div className="space-y-1 mb-2">
                <span className="text-[10px] font-extrabold tracking-wider text-[#4f533b] bg-[#f4f5f0] px-1.5 py-0.5 rounded inline-block">
                  {brand || 'Apple'}
                </span>
                <h4 className="font-bold text-xs text-slate-900 line-clamp-2 leading-snug">
                  {name || 'Məhsulun Tam Adı'}
                </h4>
              </div>

              {/* Specs Pills Preview */}
              {Object.keys(specValues).filter(k => specValues[k]).length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2.5">
                  {Object.keys(specValues)
                    .filter(k => specValues[k])
                    .slice(0, 3)
                    .map(k => (
                      <span key={k} className="text-[9px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md border border-slate-200 truncate max-w-[120px]">
                        {k}: {specValues[k]}
                      </span>
                    ))}
                </div>
              )}

              {/* Monthly Installment Pill Preview */}
              {cashPrice && parseFloat(cashPrice) > 0 && (
                <div className="bg-[#f4f5f0] border border-[#4f533b]/20 p-1.5 rounded-xl mb-2 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-600">12 ay hissə-hissə:</span>
                  <span className="text-xs font-black text-[#4f533b]">
                    {Math.round(parseFloat(cashPrice) / 12)} ₼ / ay
                  </span>
                </div>
              )}

              {/* Price & Add to Cart Button */}
              <div className="flex items-end justify-between gap-2 pt-1 border-t border-slate-100">
                <div>
                  {oldPrice && parseFloat(oldPrice) > parseFloat(cashPrice) && (
                    <span className="text-[10px] text-slate-400 line-through font-bold block leading-none mb-0.5">
                      {parseFloat(oldPrice).toLocaleString()} ₼
                    </span>
                  )}
                  <span className="text-sm font-black text-slate-900 leading-none">
                    {cashPrice ? `${parseFloat(cashPrice).toLocaleString()} ₼` : '0 ₼'}
                  </span>
                </div>

                <div className="bg-[#4f533b] text-white p-2 rounded-xl flex items-center justify-center font-bold text-xs shadow-xs">
                  <ShoppingCart className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Submit Card in Sidebar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2.5 shadow-xs">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#4f533b] hover:bg-[#3e4230] text-white text-sm font-black transition cursor-pointer active:scale-95 flex items-center justify-center gap-2 shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>{loading ? 'Saxlanılır...' : (isEditMode ? 'Dəyişiklikləri Yadda Saxla' : 'Məhsulu Əlavə Et')}</span>
            </button>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition cursor-pointer border border-slate-200"
              >
                Ləğv Et
              </button>
            )}
          </div>

        </div>{/* end RIGHT COLUMN */}

      </div>{/* end TWO-COLUMN */}

      {/* ── Bottom Form Actions Bar ───────────────────────────────────────── */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-6 mt-4 border-t border-slate-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-semibold transition cursor-pointer border border-slate-200"
          >
            Ləğv Et
          </button>
        )}

        {!isEditMode && (
          <button
            type="button"
            onClick={handleSaveDraft}
            className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-sm font-bold transition cursor-pointer border border-amber-300/70 flex items-center gap-2 active:scale-95 shadow-2xs"
            title="Daxil etdiyiniz verilənləri qaralama kimi saxlayın və sonradan davam edin"
          >
            <Bookmark className="w-4 h-4 text-amber-600" />
            <span>Qaralama (Taslak) Kimi Saxla</span>
          </button>
        )}

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-xl bg-[#4f533b] hover:bg-[#3e4230] text-white text-sm font-bold transition cursor-pointer active:scale-95 flex items-center gap-2 shadow-xs"
        >
          <Check className="w-4 h-4" />
          <span>{loading ? 'Saxlanılır...' : (isEditMode ? 'Dəyişiklikləri Yadda Saxla' : 'Məhsulu Əlavə Et')}</span>
        </button>
      </div>

      {/* Media Gallery Modal */}
      <MediaGalleryModal
        isOpen={isMediaGalleryOpen}
        onClose={() => setIsMediaGalleryOpen(false)}
        onSelectImages={(urls) => {
          setImageList(prev => Array.from(new Set([...prev, ...urls])).slice(0, MAX_IMAGES));
        }}
        multiple={true}
      />
    </form>
  );
}
