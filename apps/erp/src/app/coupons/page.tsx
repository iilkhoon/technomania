'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useRef } from 'react';
import {
  Ticket,
  Plus,
  Edit2,
  Trash2,
  Check,
  Award,
  X,
  Search,
  Sparkles,
  Percent,
  Calendar,
  Tag,
  CheckCircle2,
  AlertCircle,
  Save,
  ShoppingBag,
  Sliders,
  Upload,
  Image as ImageIcon,
  Filter,
  Package,
} from '../../components/HeroIconsHub';
import { useSearchParams } from 'next/navigation';
import { getLocalProducts, saveLocalProducts } from '../../lib/supabase';
import { Product } from '../../types';

export interface ProductDiscountItem {
  productId: string;
  productName: string;
  originalPrice: number;
  discountPercent: number;
  discountedPrice: number;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  badgeLabel: string;
  imageUrl: string;
  applyDiscount: boolean;
  globalDiscountPercent: number;
  items: ProductDiscountItem[];
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface CustomBadge {
  id: string;
  label: string;
  colorBg: string;
  colorText: string;
  productIds: string[];
}

const DEFAULT_BADGES: CustomBadge[] = [];

function CampaignsAndBadgesContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'campaigns' | 'badges'>(
    tabParam === 'badges' ? 'badges' : 'campaigns'
  );

  useEffect(() => {
    if (tabParam === 'badges') {
      setActiveTab('badges');
    } else if (tabParam === 'campaigns') {
      setActiveTab('campaigns');
    }
  }, [tabParam]);

  // Products & Campaigns List
  const [products, setProducts] = useState<Product[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [badges, setBadges] = useState<CustomBadge[]>(DEFAULT_BADGES);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState('all');

  // Modal State
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  // Campaign Form State
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formEnableBadge, setFormEnableBadge] = useState<boolean>(true);
  const [formBadgeLabel, setFormBadgeLabel] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formApplyDiscount, setFormApplyDiscount] = useState<boolean>(true);
  const [formGlobalDiscount, setFormGlobalDiscount] = useState<number>(20);
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [formEndDate, setFormEndDate] = useState(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');

  // Selected Products with individual discount overrides
  const [formItemsMap, setFormItemsMap] = useState<Record<string, ProductDiscountItem>>({});

  // Badge Modal State
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [newBadgeLabel, setNewBadgeLabel] = useState('');
  const [newBadgeColorBg, setNewBadgeColorBg] = useState('#4f533b');

  // File Upload Ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const prods = getLocalProducts() || [];
    setProducts(prods);

    try {
      const savedCmp = localStorage.getItem('technomania_active_campaigns');
      if (savedCmp) {
        const parsed = JSON.parse(savedCmp);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCampaigns(parsed);
        }
      } else {
        const initialCmp: Campaign = {
          id: 'cmp-1',
          name: 'Möhtəşəm Yay Endirimləri 2026',
          description: 'Seçilmiş smartfon və noutbuklarda 20%-dək endirim və faizsiz taksit fürsəti!',
          badgeLabel: 'YAY FIRSATI -20%',
          imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=600&q=80',
          applyDiscount: true,
          globalDiscountPercent: 20,
          items: prods.slice(0, 3).map(p => {
            const price = (p as any).rawPrice || parseFloat(String(p.cash_price || 0).replace(/[^\d.]/g, '')) || 1000;
            return {
              productId: p.id,
              productName: p.model_name || 'Məhsul',
              originalPrice: price,
              discountPercent: 20,
              discountedPrice: parseFloat((price * 0.8).toFixed(2)),
            };
          }),
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          status: 'active',
          createdAt: new Date().toISOString(),
        };
        setCampaigns([initialCmp]);
        localStorage.setItem('technomania_active_campaigns', JSON.stringify([initialCmp]));
      }

      const savedBadges = localStorage.getItem('technomania_custom_badges');
      if (savedBadges) {
        const parsed = JSON.parse(savedBadges);
        if (Array.isArray(parsed)) {
          const OLD_DEFAULT_IDS = new Set([
            'b-hit', 'b-new', 'b-discount', 'b-super', 'b-rec', 'b-excl', 'b-free-shipping',
            'bdg-1', 'bdg-2', 'bdg-3', 'bdg-4', 'bdg-5'
          ]);
          const cleaned = parsed.filter((b: any) => !b.id || !OLD_DEFAULT_IDS.has(b.id));
          setBadges(cleaned);
        }
      }
    } catch (e) {}
  }, []);

  const saveCampaigns = (updated: Campaign[]) => {
    setCampaigns(updated);
    try {
      localStorage.setItem('technomania_active_campaigns', JSON.stringify(updated));
      window.dispatchEvent(new Event('techno_campaigns_updated'));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {}
  };

  const saveBadges = (updated: CustomBadge[]) => {
    setBadges(updated);
    try {
      localStorage.setItem('technomania_custom_badges', JSON.stringify(updated));
      window.dispatchEvent(new Event('techno_badges_updated'));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {}
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingCampaign(null);
    setFormName('');
    setFormDesc('');
    setFormEnableBadge(true);
    setFormBadgeLabel('KAMPANİYA');
    setFormImageUrl('https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=600&q=80');
    setFormApplyDiscount(true);
    setFormGlobalDiscount(20);
    setFormStartDate(new Date().toISOString().split('T')[0]);
    setFormEndDate(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
    setFormStatus('active');
    setFormItemsMap({});
    setSelectedCategoryFilter('all');
    setSelectedBrandFilter('all');
    setProductSearch('');
    setIsCampaignModalOpen(true);
  };

  // Open Edit Modal with existing campaign data
  const handleOpenEditModal = (cmp: Campaign) => {
    setEditingCampaign(cmp);
    setFormName(cmp.name);
    setFormDesc(cmp.description || '');
    setFormEnableBadge(!!cmp.badgeLabel);
    setFormBadgeLabel(cmp.badgeLabel || '');
    setFormImageUrl(cmp.imageUrl || '');
    setFormApplyDiscount(cmp.applyDiscount !== false);
    setFormGlobalDiscount(cmp.globalDiscountPercent || 20);
    setFormStartDate(cmp.startDate || new Date().toISOString().split('T')[0]);
    setFormEndDate(cmp.endDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
    setFormStatus(cmp.status);
    setSelectedCategoryFilter('all');
    setSelectedBrandFilter('all');
    setProductSearch('');

    const map: Record<string, ProductDiscountItem> = {};
    if (cmp.items && Array.isArray(cmp.items)) {
      cmp.items.forEach(item => {
        map[item.productId] = { ...item };
      });
    }
    setFormItemsMap(map);
    setIsCampaignModalOpen(true);
  };

  // Handle Image Upload File Selection
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setFormImageUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // When global discount % changes, apply to all selected products
  const handleGlobalDiscountChange = (newDiscount: number) => {
    setFormGlobalDiscount(newDiscount);
    setFormItemsMap(prev => {
      const nextMap = { ...prev };
      Object.keys(nextMap).forEach(pId => {
        const item = nextMap[pId];
        const discounted = parseFloat((item.originalPrice * (1 - newDiscount / 100)).toFixed(2));
        nextMap[pId] = {
          ...item,
          discountPercent: newDiscount,
          discountedPrice: Math.max(0, discounted),
        };
      });
      return nextMap;
    });
  };

  // Build BADGE CONFLICT MAP for Rule 3
  // Maps productId -> badgeLabel of ANOTHER active campaign that has a badge
  const badgeConflictMap: Record<string, string> = {};
  campaigns.forEach(c => {
    if (
      c.status === 'active' &&
      c.id !== editingCampaign?.id &&
      c.badgeLabel &&
      c.badgeLabel.trim() !== ''
    ) {
      if (c.items && Array.isArray(c.items)) {
        c.items.forEach(item => {
          badgeConflictMap[item.productId] = c.badgeLabel;
        });
      }
    }
  });

  // Extract Categories and Brands for Filtering
  const categoriesList = Array.from(new Set(products.map(p => (p as any).category || p.category_name || '').filter(Boolean)));
  const brandsList = Array.from(new Set(products.map(p => p.brand).filter(Boolean)));

  // Filtered Products for Modal Selection
  const wizardFilteredProducts = products.filter(prod => {
    const pCat = (prod as any).category || prod.category_name || '';
    const matchesCategory = selectedCategoryFilter === 'all' || pCat === selectedCategoryFilter;
    const matchesBrand = selectedBrandFilter === 'all' || prod.brand === selectedBrandFilter;

    const q = productSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (prod.model_name || '').toLowerCase().includes(q) ||
      (prod.brand || '').toLowerCase().includes(q) ||
      pCat.toLowerCase().includes(q);

    return matchesCategory && matchesBrand && matchesSearch;
  });

  // Toggle Select All / Unselect All Filtered Products in Campaign Wizard
  const handleSelectAllFilteredProducts = (selectAll: boolean) => {
    if (!selectAll) {
      // Unselect only filtered products
      setFormItemsMap(prev => {
        const nextMap = { ...prev };
        wizardFilteredProducts.forEach(prod => {
          delete nextMap[prod.id];
        });
        return nextMap;
      });
      return;
    }

    const discPercent = formGlobalDiscount || 20;
    setFormItemsMap(prev => {
      const nextMap = { ...prev };

      wizardFilteredProducts.forEach(prod => {
        // If this campaign HAS a badge AND this product conflicts with another campaign badge, SKIP!
        const isConflict = (formEnableBadge && formBadgeLabel.trim() !== '') ? badgeConflictMap[prod.id] : null;
        if (isConflict) return;

        const origPrice = (prod as any).rawPrice || parseFloat(String(prod.cash_price || 0).replace(/[^\d.]/g, '')) || 100;
        const discounted = parseFloat((origPrice * (1 - discPercent / 100)).toFixed(2));

        nextMap[prod.id] = {
          productId: prod.id,
          productName: prod.model_name || 'Məhsul',
          originalPrice: origPrice,
          discountPercent: discPercent,
          discountedPrice: Math.max(0, discounted),
        };
      });

      return nextMap;
    });
  };

  // Toggle Single Product Selection in Campaign Wizard
  const handleToggleProductInCampaign = (prod: Product) => {
    // If this campaign HAS a badge AND this product conflicts with another campaign badge, ignore!
    const isConflict = (formEnableBadge && formBadgeLabel.trim() !== '') ? badgeConflictMap[prod.id] : null;
    if (isConflict) return;

    const origPrice = (prod as any).rawPrice || parseFloat(String(prod.cash_price || 0).replace(/[^\d.]/g, '')) || 100;

    setFormItemsMap(prev => {
      const nextMap = { ...prev };
      if (nextMap[prod.id]) {
        delete nextMap[prod.id];
      } else {
        const discPercent = formGlobalDiscount || 20;
        const discounted = parseFloat((origPrice * (1 - discPercent / 100)).toFixed(2));
        nextMap[prod.id] = {
          productId: prod.id,
          productName: prod.model_name || 'Məhsul',
          originalPrice: origPrice,
          discountPercent: discPercent,
          discountedPrice: Math.max(0, discounted),
        };
      }
      return nextMap;
    });
  };

  // Change individual discount % for a specific product
  const handleIndividualDiscountChange = (pId: string, customPercent: number) => {
    setFormItemsMap(prev => {
      const item = prev[pId];
      if (!item) return prev;

      const discounted = parseFloat((item.originalPrice * (1 - customPercent / 100)).toFixed(2));
      return {
        ...prev,
        [pId]: {
          ...item,
          discountPercent: customPercent,
          discountedPrice: Math.max(0, discounted),
        },
      };
    });
  };

  // Save Campaign
  const handleSaveCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const itemsList = Object.values(formItemsMap);
    const finalBadgeLabel = formEnableBadge ? formBadgeLabel.trim() : '';

    let updated: Campaign[];
    if (editingCampaign) {
      updated = campaigns.map(c => c.id === editingCampaign.id ? {
        ...c,
        name: formName.trim(),
        description: formDesc.trim(),
        badgeLabel: finalBadgeLabel,
        imageUrl: formImageUrl.trim(),
        applyDiscount: formApplyDiscount,
        globalDiscountPercent: formGlobalDiscount,
        items: itemsList,
        startDate: formStartDate,
        endDate: formEndDate,
        status: formStatus,
      } : c);
    } else {
      const newCmp: Campaign = {
        id: `cmp-${Date.now()}`,
        name: formName.trim(),
        description: formDesc.trim(),
        badgeLabel: finalBadgeLabel,
        imageUrl: formImageUrl.trim(),
        applyDiscount: formApplyDiscount,
        globalDiscountPercent: formGlobalDiscount,
        items: itemsList,
        startDate: formStartDate,
        endDate: formEndDate,
        status: formStatus,
        createdAt: new Date().toISOString(),
      };
      updated = [newCmp, ...campaigns];
    }

    saveCampaigns(updated);
    setIsCampaignModalOpen(false);
  };

  // Delete Campaign
  const handleDeleteCampaign = (id: string) => {
    if (confirm('Bu kampaniyanı silmək istədiyinizdən əminsiniz?')) {
      const updated = campaigns.filter(c => c.id !== id);
      saveCampaigns(updated);
    }
  };

  // Toggle Campaign Active Status
  const handleToggleCampaignStatus = (id: string) => {
    const updated = campaigns.map(c => c.id === id ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' } as Campaign : c);
    saveCampaigns(updated);
  };

  // Badge Management Toggle Product
  const handleToggleBadgeProduct = (badgeId: string, productId: string) => {
    const updated = badges.map(b => {
      if (b.id === badgeId) {
        const exists = b.productIds.includes(productId);
        const nextIds = exists ? b.productIds.filter(id => id !== productId) : [...b.productIds, productId];
        return { ...b, productIds: nextIds };
      }
      return b;
    });
    saveBadges(updated);
  };

  // Create Custom Badge
  const handleCreateBadge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBadgeLabel.trim()) return;

    const newBadge: CustomBadge = {
      id: `bdg-${Date.now()}`,
      label: newBadgeLabel.trim(),
      colorBg: newBadgeColorBg,
      colorText: '#ffffff',
      productIds: [],
    };
    saveBadges([...badges, newBadge]);
    setNewBadgeLabel('');
    setIsBadgeModalOpen(false);
  };

  const filteredProducts = products.filter(p =>
    (p.model_name || '').toLowerCase().includes(productSearch.toLowerCase()) ||
    (p.brand || '').toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl text-slate-700">
      {/* Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl text-slate-900 font-bold flex items-center gap-2">
              <Ticket className="w-5 h-5 text-[#4f533b]" /> Kampaniyalar və aksiyalar
            </h1>
            <span className="text-xs bg-[#f4f5f0] text-[#4f533b] border border-[#4f533b]/20 px-2.5 py-0.5 rounded-md font-medium">
              Marketinq və aksiyalar
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Endirim kampaniyalarını yaradın, şəkillər yükləyin, kateqoriyalara görə məhsul seçin və badge qaydalarını tənzimləyin.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="bg-[#4f533b] hover:bg-[#3e4230] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer active:scale-95 flex-shrink-0"
        >
          <Plus className="w-4 h-4" /> Yeni kampaniya yarat
        </button>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'campaigns'
              ? 'bg-[#4f533b] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <Ticket className="w-4 h-4" /> Bütün kampaniyalar ({campaigns.length})
        </button>

        <button
          onClick={() => setActiveTab('badges')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'badges'
              ? 'bg-[#4f533b] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" /> Xüsusi etiketlər ({badges.length})
        </button>
      </div>

      {/* ── TAB 1: BÜTÜN KAMPANİYALAR ── */}
      {activeTab === 'campaigns' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {campaigns.map(cmp => (
              <div
                key={cmp.id}
                className={`bg-white border rounded-2xl p-5 space-y-4 shadow-xs transition relative flex flex-col justify-between ${
                  cmp.status === 'active' ? 'border-slate-200 hover:border-[#4f533b]' : 'border-slate-200 bg-slate-50/70 opacity-75'
                }`}
              >
                <div className="space-y-3">
                  {/* Campaign Image Banner Preview */}
                  {cmp.imageUrl && (
                    <div className="w-full h-32 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative group">
                      <img src={cmp.imageUrl} alt={cmp.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-md font-mono">
                        Şəkil var
                      </div>
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <div>
                      {cmp.badgeLabel ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-[#4f533b] text-white tracking-wider mb-1 shadow-2xs">
                          <Sparkles className="w-3 h-3 text-amber-300" /> {cmp.badgeLabel}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200 mb-1">
                          Badgesiz Kampaniya
                        </span>
                      )}
                      <h3 className="text-base font-extrabold text-slate-900 leading-snug">{cmp.name}</h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleCampaignStatus(cmp.id)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition cursor-pointer flex-shrink-0 ${
                        cmp.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : 'bg-slate-100 text-slate-500 border-slate-300'
                      }`}
                    >
                      {cmp.status === 'active' ? '✓ Aktiv' : '✕ Deaktiv'}
                    </button>
                  </div>

                  {cmp.description && (
                    <p className="text-xs text-slate-500 line-clamp-2">{cmp.description}</p>
                  )}

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Sabit Qlobal Endirim:</span>
                      <span className="font-bold text-[#4f533b]">{cmp.globalDiscountPercent}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Seçilmiş Məhsul Sayı:</span>
                      <span className="font-bold text-slate-800">{cmp.items ? cmp.items.length : 0} Məhsul</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                      <span>Tarix Aralığı:</span>
                      <span>{cmp.startDate} — {cmp.endDate}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(cmp)}
                    className="text-xs text-[#4f533b] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Kampaniyanı Düzəliş Et
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteCampaign(cmp.id)}
                    className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                    title="Kampaniyanı Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 2: MƏHSUL BADGE-LƏRİ ── */}
      {activeTab === 'badges' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map(badge => (
              <div key={badge.id} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span
                    className="px-3 py-1 rounded-lg text-xs font-bold text-white shadow-xs"
                    style={{ backgroundColor: badge.colorBg }}
                  >
                    {badge.label}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {badge.productIds.length} Məhsulda Var
                  </span>
                </div>

                <div className="text-xs text-slate-500 pt-1">
                  Məhsulların kartında və şəkillərin üzərində bu fərqləndirici nişan görünəcək.
                </div>
              </div>
            ))}
          </div>

          {/* Product Badge Assignment Section */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShoppingBag className="w-4 h-4 text-[#4f533b]" /> Məhsullara Badge Təyin Et
            </h3>

            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Məhsul adı üzrə axtar..."
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-700 outline-none focus:border-[#4f533b]"
              />
            </div>

            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto pr-2">
              {filteredProducts.slice(0, 15).map(prod => (
                <div key={prod.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <img src={prod.image} alt={prod.model_name} className="w-9 h-9 object-contain mix-blend-multiply flex-shrink-0" />
                    <div>
                      <span className="font-bold text-slate-800 block line-clamp-1">{prod.model_name}</span>
                      <span className="text-slate-400">{prod.brand} — {prod.cash_price}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {badges.map(b => {
                      const hasBadge = b.productIds.includes(prod.id);
                      return (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => handleToggleBadgeProduct(b.id, prod.id)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                            hasBadge
                              ? 'bg-[#4f533b] text-white border-[#4f533b]'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {hasBadge ? '✓ ' : '+ '}{b.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── CAMPAIGN CREATION & EDIT MODAL / WIZARD ── */}
      {isCampaignModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-3xl w-full p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-[#4f533b]" />
                {editingCampaign ? 'Kampaniyanı Düzəliş Et' : 'Yeni Endirim Kampaniyası Yarat'}
              </h2>
              <button
                type="button"
                onClick={() => setIsCampaignModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCampaign} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-600 mb-1 block">Kampaniya Adı *</label>
                  <input
                    type="text"
                    required
                    placeholder="Məs: Möhtəşəm Yay Endirimləri"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 outline-none focus:border-[#4f533b]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-slate-600">Kampaniya Badge Etiketi</label>
                    <button
                      type="button"
                      onClick={() => setFormEnableBadge(!formEnableBadge)}
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md border transition cursor-pointer ${
                        formEnableBadge
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                    >
                      {formEnableBadge ? '✓ Badge Aktivdir' : '✕ Badge Olmasın'}
                    </button>
                  </div>
                  {formEnableBadge ? (
                    <input
                      type="text"
                      placeholder="Məs: YAY FIRSATI"
                      value={formBadgeLabel}
                      onChange={e => setFormBadgeLabel(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 outline-none focus:border-[#4f533b]"
                    />
                  ) : (
                    <div className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-400 italic">
                      Bu kampaniya üçün məhsullara badge etiketi yapışdırılmayacaq.
                    </div>
                  )}
                </div>
              </div>

              {/* ── CAMPAIGN IMAGE UPLOAD & PREVIEW (REQUIREMENT 1) ── */}
              <div>
                <label className="text-xs text-slate-600 mb-1 block font-bold">Kampaniyanın Şəkli (Banner)</label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="https://... Və ya sağdakı düymə ilə şəkil yükləyin"
                      value={formImageUrl}
                      onChange={e => setFormImageUrl(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-20 py-2 text-xs text-slate-800 outline-none focus:border-[#4f533b]"
                    />
                    {formImageUrl && (
                      <button
                        type="button"
                        onClick={() => setFormImageUrl('')}
                        className="absolute right-2 top-2 text-[10px] font-bold text-rose-500 hover:underline"
                      >
                        Sil ✕
                      </button>
                    )}
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageFileUpload}
                    accept="image/*"
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-[#4f533b] hover:bg-[#3e4230] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer flex-shrink-0 shadow-xs active:scale-95"
                  >
                    <Upload className="w-3.5 h-3.5" /> Şəkil Yüklə
                  </button>
                </div>

                {/* Live Banner Preview */}
                {formImageUrl && (
                  <div className="mt-2 w-full h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative">
                    <img src={formImageUrl} alt="Preview" className="w-full h-full object-cover" />
                    <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-md font-bold">
                      Canlı Banner Nümunəsi
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs text-slate-600 mb-1 block">Kampaniya Təsviri</label>
                <textarea
                  rows={2}
                  placeholder="Kampaniyanın əsas şərtləri və detalları..."
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 outline-none focus:border-[#4f533b]"
                />
              </div>

              {/* DISCOUNT TOGGLE: YES (APPLY DISCOUNT) VS NO (ONLY SHOW BADGE) */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <label className="text-xs font-bold text-slate-800 block">Kampaniyanın Növü Və Təsiri:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setFormApplyDiscount(true)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-2 ${
                      formApplyDiscount
                        ? 'bg-[#4f533b] text-white border-[#4f533b] shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Percent className="w-4 h-4 text-emerald-400" /> Endirim Tətbiq Olunsun (% Qiymət Düşsün)
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormApplyDiscount(false)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-2 ${
                      !formApplyDiscount
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Tag className="w-4 h-4 text-amber-200" /> Endirimsiz (Yalnız Badge Görünsün)
                  </button>
                </div>
              </div>

              {/* GLOBAL DISCOUNT % INPUT */}
              {formApplyDiscount && (
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Percent className="w-4 h-4 text-[#4f533b]" /> Sabit Qlobal Endirim Faizi (%):
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={90}
                        value={formGlobalDiscount}
                        onChange={e => handleGlobalDiscountChange(Number(e.target.value))}
                        className="w-24 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-sm font-bold text-slate-900 outline-none focus:border-[#4f533b] text-center"
                      />
                      <span className="text-xs font-bold text-[#4f533b]">%</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Daxil edilən sabit faiz seçilən bütün məhsullara avtomatik tətbiq olunur.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 mb-1 block">Başlama Tarixi</label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={e => setFormStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-600 mb-1 block">Bitmə Tarixi</label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={e => setFormEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none"
                  />
                </div>
              </div>

              {/* ── PRODUCT SELECTION WIZARD WITH CATEGORY FILTER & BADGE CONFLICT RULE (REQUIREMENTS 2 & 3) ── */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-[#4f533b]" /> Məhsul Seçimi Və Fərdi Endirim Tənzimlənməsi
                  </h4>
                  {formEnableBadge && formBadgeLabel.trim() !== '' && (
                    <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md font-bold">
                      🛡️ Məhsul Badge Qaydası Aktivdir
                    </span>
                  )}
                </div>

                {/* FILTER & SEARCH BAR */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {/* Category Select Filter */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 mb-0.5 block">📁 Kateqoriya Filtri</label>
                    <select
                      value={selectedCategoryFilter}
                      onChange={e => setSelectedCategoryFilter(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 outline-none focus:border-[#4f533b]"
                    >
                      <option value="all">Bütün Kateqoriyalar ({products.length})</option>
                      {categoriesList.map(cat => (
                        <option key={cat} value={cat}>
                          {cat} ({products.filter(p => ((p as any).category || p.category_name || '') === cat).length})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Brand Select Filter */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 mb-0.5 block">🏷️ Brend Filtri</label>
                    <select
                      value={selectedBrandFilter}
                      onChange={e => setSelectedBrandFilter(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 outline-none focus:border-[#4f533b]"
                    >
                      <option value="all">Bütün Brendlər</option>
                      {brandsList.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  {/* Live Search Input */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 mb-0.5 block">🔍 Məhsul Axtarışı</label>
                    <input
                      type="text"
                      placeholder="Model adı ilə axtar..."
                      value={productSearch}
                      onChange={e => setProductSearch(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 outline-none focus:border-[#4f533b]"
                    />
                  </div>
                </div>

                {/* SELECT ALL FILTERED PRODUCTS BAR */}
                <div className="flex items-center justify-between gap-2 px-1 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-[#4f533b]">
                    <input
                      type="checkbox"
                      checked={wizardFilteredProducts.length > 0 && wizardFilteredProducts.every(p => !!formItemsMap[p.id])}
                      onChange={e => handleSelectAllFilteredProducts(e.target.checked)}
                      className="rounded text-[#4f533b] focus:ring-[#4f533b] w-4 h-4 cursor-pointer"
                    />
                    Filterlənən Bütün Məhsulları Seç ({wizardFilteredProducts.length} Məhsul)
                  </label>

                  {Object.keys(formItemsMap).length > 0 && (
                    <button
                      type="button"
                      onClick={() => setFormItemsMap({})}
                      className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                    >
                      Bütün Seçimləri Sil ({Object.keys(formItemsMap).length})
                    </button>
                  )}
                </div>

                {/* PRODUCTS LIST */}
                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-64 overflow-y-auto p-1 bg-white">
                  {wizardFilteredProducts.map(prod => {
                    const isSelected = !!formItemsMap[prod.id];
                    const selectedItem = formItemsMap[prod.id];
                    const origPrice = (prod as any).rawPrice || parseFloat(String(prod.cash_price || 0).replace(/[^\d.]/g, '')) || 100;

                    // REQUIREMENT 3: Badge Conflict Check
                    // If current campaign HAS a badge AND this product already has a badge in another active campaign
                    const conflictingBadgeLabel = (formEnableBadge && formBadgeLabel.trim() !== '') ? badgeConflictMap[prod.id] : null;

                    return (
                      <div
                        key={prod.id}
                        className={`p-2.5 flex items-center justify-between gap-3 transition rounded-lg ${
                          conflictingBadgeLabel
                            ? 'bg-amber-50/50 opacity-80 cursor-not-allowed'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <label className={`flex items-center gap-2.5 flex-1 min-w-0 ${conflictingBadgeLabel ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                          <input
                            type="checkbox"
                            disabled={!!conflictingBadgeLabel}
                            checked={isSelected}
                            onChange={() => handleToggleProductInCampaign(prod)}
                            className="rounded text-[#4f533b] focus:ring-[#4f533b] w-4 h-4 cursor-pointer disabled:opacity-50"
                          />
                          <img src={prod.image} alt={prod.model_name} className="w-8 h-8 object-contain flex-shrink-0" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-800 text-xs truncate">{prod.model_name}</span>
                              {conflictingBadgeLabel && (
                                <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[9px] font-bold px-1.5 py-0.2 rounded-md flex-shrink-0">
                                  ⚠️ "{conflictingBadgeLabel}" kampaniyasında badge var (seçilə bilməz)
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {prod.brand} • {(prod as any).category || prod.category_name || 'Ümumi'} • {origPrice} ₼
                            </span>
                          </div>
                        </label>

                        {isSelected && selectedItem && !conflictingBadgeLabel && (
                          <div className="flex items-center gap-3 flex-shrink-0 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-slate-500 font-bold">Faiz:</span>
                              <input
                                type="number"
                                min={1}
                                max={95}
                                value={selectedItem.discountPercent}
                                onChange={e => handleIndividualDiscountChange(prod.id, Number(e.target.value))}
                                className="w-16 bg-white border border-slate-300 rounded-lg px-2 py-0.5 text-xs font-bold text-center text-[#4f533b]"
                              />
                              <span className="text-[11px] font-bold text-[#4f533b]">%</span>
                            </div>

                            <div className="text-right pl-2 border-l border-slate-200">
                              <span className="text-[9px] text-slate-400 block line-through">{origPrice} ₼</span>
                              <span className="text-xs font-black text-emerald-600">{selectedItem.discountedPrice} ₼</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {wizardFilteredProducts.length === 0 && (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      Seçilmiş kateqoriya və ya axtarışa uyğun məhsul tapılmadı.
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCampaignModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                >
                  Ləğv Et
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#4f533b] hover:bg-[#3e4230] shadow-xs cursor-pointer active:scale-95"
                >
                  <Save className="w-4 h-4 inline-block mr-1" /> Kampaniyanı Yadda Saxla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CREATE BADGE MODAL ── */}
      {isBadgeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-[#4f533b]" /> Yeni Məhsul Badge-i Yarat
              </h2>
              <button
                type="button"
                onClick={() => setIsBadgeModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBadge} className="space-y-4 text-xs">
              <div>
                <label className="text-xs text-slate-600 mb-1 block">Badge Etiketi (Mətni) *</label>
                <input
                  type="text"
                  required
                  placeholder="Məs: Super Qiymət"
                  value={newBadgeLabel}
                  onChange={e => setNewBadgeLabel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 outline-none focus:border-[#4f533b]"
                />
              </div>

              <div>
                <label className="text-xs text-slate-600 mb-1 block">Badge Fon Rəngi</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newBadgeColorBg}
                    onChange={e => setNewBadgeColorBg(e.target.value)}
                    className="w-9 h-9 rounded-lg border border-slate-200 p-0.5 cursor-pointer bg-white"
                  />
                  <input
                    type="text"
                    value={newBadgeColorBg}
                    onChange={e => setNewBadgeColorBg(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBadgeModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                >
                  Ləğv Et
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#4f533b] hover:bg-[#3e4230] shadow-xs cursor-pointer"
                >
                  Yadda Saxla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CampaignsAndBadgesPage() {
  return (
    <React.Suspense fallback={<div className="p-10 text-center font-bold text-slate-500">Yüklənir...</div>}>
      <CampaignsAndBadgesContent />
    </React.Suspense>
  );
}
