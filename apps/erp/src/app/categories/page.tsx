'use client';

import React, { useState, useEffect } from 'react';
import {
  FolderTree, Plus, Search, Edit2, Trash2, Check, X, Smartphone, Laptop, Tv,
  Home as HomeIcon, Coffee, Watch, Headphones, Gamepad2, ChevronRight, ChevronDown,
  Wind, Tag, Maximize2, Building2, FolderOpen, Bookmark, AlertTriangle, Tablet,
  Monitor, Cpu, HardDrive, Speaker, Camera, Radio, Printer, Joystick, Wifi,
  BatteryCharging, Plug, Fan, Thermometer, Droplets, Microwave, Flame, Utensils,
  Shirt, Sparkles, Lightbulb, Lock, Scissors, HeartPulse, Stethoscope, Smile,
  Glasses, Bike, Car, Compass, Dumbbell, Tent, Armchair, Bed, Box, Package,
  ShoppingBag, Grid, ShieldCheck, Zap, Sun, Award, Gift, Music, Truck, Phone,
  Wrench, Hammer, Shield, Battery, Scale, CircleDot,
} from '../../components/HeroIconsHub';
import { Category } from '../../types';
import { getLocalCategories, saveLocalCategories, fetchApiCategories, deleteApiCategory, supabase, isSupabaseConfigured } from '../../lib/supabase';

export const AVAILABLE_ICONS = [
  // 📱 Smartfon & Kompyuter
  { name: 'Smartphone', icon: Smartphone, label: 'Smartfon', category: 'Elektronika' },
  { name: 'Tablet', icon: Tablet, label: 'Planşet', category: 'Elektronika' },
  { name: 'Laptop', icon: Laptop, label: 'Noutbuk', category: 'Elektronika' },
  { name: 'Monitor', icon: Monitor, label: 'Monitor / PC', category: 'Elektronika' },
  { name: 'Cpu', icon: Cpu, label: 'Prosessor / Sistem', category: 'Elektronika' },
  { name: 'HardDrive', icon: HardDrive, label: 'SSD / Yaddaş', category: 'Elektronika' },
  { name: 'Printer', icon: Printer, label: 'Printer / Skaner', category: 'Elektronika' },
  { name: 'Phone', icon: Phone, label: 'Telefon / Zəng', category: 'Elektronika' },

  // 📺 TV & Audio & Gaming
  { name: 'Tv', icon: Tv, label: 'Televizor', category: 'TV & Audio' },
  { name: 'Headphones', icon: Headphones, label: 'Qulaqlıq', category: 'TV & Audio' },
  { name: 'Speaker', icon: Speaker, label: 'Dinamik / Soundbar', category: 'TV & Audio' },
  { name: 'Camera', icon: Camera, label: 'Kamera / Foto', category: 'TV & Audio' },
  { name: 'Radio', icon: Radio, label: 'Radio / Musiqi', category: 'TV & Audio' },
  { name: 'Music', icon: Music, label: 'Audio Sistem', category: 'TV & Audio' },
  { name: 'Gamepad2', icon: Gamepad2, label: 'Gamer / Konsol', category: 'Gaming' },
  { name: 'Joystick', icon: Joystick, label: 'Coystik / Oyun', category: 'Gaming' },

  // ❄️ İqlim & Sərinlik
  { name: 'Wind', icon: Wind, label: 'Kondisioner / Sərinlik', category: 'İqlim' },
  { name: 'Fan', icon: Fan, label: 'Ventilyator', category: 'İqlim' },
  { name: 'Thermometer', icon: Thermometer, label: 'Qızdırıcı / Termostat', category: 'İqlim' },
  { name: 'Droplets', icon: Droplets, label: 'Hava Nəmləndirici', category: 'İqlim' },
  { name: 'Sun', icon: Sun, label: 'Günəş / İsti', category: 'İqlim' },
  { name: 'Zap', icon: Zap, label: 'Güc / Elektrik', category: 'İqlim' },

  // 🏠 Ev & Məişət Texnikası
  { name: 'Home', icon: HomeIcon, label: 'Böyük Məişət', category: 'Məişət' },
  { name: 'Coffee', icon: Coffee, label: 'Qəhvə Maşını', category: 'Məişət' },
  { name: 'Microwave', icon: Microwave, label: 'Soba / Mikrodalğalı', category: 'Məişət' },
  { name: 'Flame', icon: Flame, label: 'Qaz Sobası / Qril', category: 'Məişət' },
  { name: 'Utensils', icon: Utensils, label: 'Mətbəx / Qab-qacaq', category: 'Məişət' },
  { name: 'Shirt', icon: Shirt, label: 'Paltaryuyan / Geyim', category: 'Məişət' },
  { name: 'Sparkles', icon: Sparkles, label: 'Tozsoran / Təmizlik', category: 'Məişət' },
  { name: 'Lightbulb', icon: Lightbulb, label: 'İşıqlandırma / Smart Ev', category: 'Məişət' },
  { name: 'Lock', icon: Lock, label: 'Təhlükəsizlik / Kamera', category: 'Məişət' },
  { name: 'Wrench', icon: Wrench, label: 'Usta Alətləri', category: 'Məişət' },
  { name: 'Hammer', icon: Hammer, label: 'Təmir Alətləri', category: 'Məişət' },

  // 💇‍♀️ Gözəllik & Şəxsi Baxım & Sağlamlıq
  { name: 'Scissors', icon: Scissors, label: 'Fen / Təraş / Baxım', category: 'Gözəllik' },
  { name: 'Watch', icon: Watch, label: 'Smart Saat / Aksessuar', category: 'Gözəllik' },
  { name: 'Glasses', icon: Glasses, label: 'Günəş Eynəyi', category: 'Gözəllik' },
  { name: 'Smile', icon: Smile, label: 'Şəxsi Gigiyena', category: 'Gözəllik' },
  { name: 'Stethoscope', icon: Stethoscope, label: 'Tibbi Cihazlar', category: 'Sağlamlıq' },
  { name: 'HeartPulse', icon: HeartPulse, label: 'Tonometr / Sağlamlıq', category: 'Sağlamlıq' },
  { name: 'Scale', icon: Scale, label: 'Tərəzi / Ölçmə', category: 'Sağlamlıq' },

  // 🚗 Nəqliyyat, İdman & Çöl
  { name: 'Bike', icon: Bike, label: 'Skuter / Velosiped', category: 'Nəqliyyat' },
  { name: 'Car', icon: Car, label: 'Avto & Moto', category: 'Nəqliyyat' },
  { name: 'Compass', icon: Compass, label: 'GPS / Naviqasiya', category: 'Nəqliyyat' },
  { name: 'Truck', icon: Truck, label: 'Çatdırılma / Avto', category: 'Nəqliyyat' },
  { name: 'Dumbbell', icon: Dumbbell, label: 'Fitnes / İdman', category: 'İdman' },
  { name: 'Tent', icon: Tent, label: 'Ev, Bağ & Kempinq', category: 'İdman' },

  // 🛋️ Mebel, Şəbəkə & Aksessuarlar
  { name: 'Armchair', icon: Armchair, label: 'Mebel / Kreslo', category: 'Mebel' },
  { name: 'Bed', icon: Bed, label: 'Yataq & Tekstil', category: 'Mebel' },
  { name: 'Wifi', icon: Wifi, label: 'Şəbəkə / Router', category: 'Aksessuar' },
  { name: 'BatteryCharging', icon: BatteryCharging, label: 'Powerbank / Batareya', category: 'Aksessuar' },
  { name: 'Plug', icon: Plug, label: 'Kabel & Adapter', category: 'Aksessuar' },
  { name: 'Battery', icon: Battery, label: 'Batareya', category: 'Aksessuar' },
  { name: 'Box', icon: Box, label: 'Qutu / Aksessuar', category: 'Diğər' },
  { name: 'Package', icon: Package, label: 'Paket / Hədiyyə', category: 'Diğər' },
  { name: 'Gift', icon: Gift, label: 'Hədiyyəlik', category: 'Diğər' },
  { name: 'ShoppingBag', icon: ShoppingBag, label: 'Alış-veriş Paketləri', category: 'Diğər' },
  { name: 'Tag', icon: Tag, label: 'Brend / Bədç', category: 'Diğər' },
  { name: 'Award', icon: Award, label: 'Premial / Xüsusi', category: 'Diğər' },
  { name: 'Maximize2', icon: Maximize2, label: 'Sahə m² / Ölçü', category: 'Diğər' },
  { name: 'FolderTree', icon: FolderTree, label: 'Ümumi Qovluq', category: 'Diğər' },
  { name: 'CircleDot', icon: CircleDot, label: 'Dairəvi İkon', category: 'Diğər' }
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  
  // Right Slide-Over Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form State
  const [targetLevel, setTargetLevel] = useState<1 | 2 | 3>(1);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [selectedParentId, setSelectedParentId] = useState<string>('');
  const [iconMode, setIconMode] = useState<'preset' | 'custom'>('preset');
  const [formIcon, setFormIcon] = useState('Folder');
  const [formIconUrl, setFormIconUrl] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formIsTop, setFormIsTop] = useState(true);
  const [formSortOrder, setFormSortOrder] = useState<number>(1);
  const [formError, setFormError] = useState('');
  const [formSpecFields, setFormSpecFields] = useState<CategorySpecFieldItem[]>([]);
  const [newSpecField, setNewSpecField] = useState('');
  const [newSpecHasPrice, setNewSpecHasPrice] = useState(false);
  const [iconSearchQuery, setIconSearchQuery] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const apiCats = await fetchApiCategories();
      const safeCats = Array.isArray(apiCats) ? apiCats.filter(Boolean) : [];
      setCategories(safeCats);
      
      // Expand Level 1 & 2 by default
      const exp: Record<string, boolean> = {};
      safeCats.forEach(c => { if (c?.id) exp[c.id] = true; });
      setExpandedNodes(exp);
    } catch (e) {
      console.error('Failed to load categories:', e);
      setCategories((getLocalCategories() || []).filter(Boolean));
    }
  };

  const toggleExpand = (id: string) => {
    if (!id) return;
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenDrawer = (level: 1 | 2 | 3, parentId?: string, catToEdit?: Category) => {
    setFormError('');
    setTargetLevel(level);

    if (catToEdit) {
      setEditingCategory(catToEdit);
      setFormName(catToEdit.name || '');
      setFormSlug(catToEdit.slug || '');
      setSelectedParentId(catToEdit.parent_id || '');
      setFormIcon(catToEdit.icon || 'Folder');
      setFormIconUrl(catToEdit.icon_url || '');
      setIconMode(catToEdit.icon_url ? 'custom' : 'preset');
      setFormDesc(catToEdit.description || '');
      setFormIsTop(catToEdit.is_top !== false);
      setFormSortOrder(catToEdit.sort_order || 1);
      
      const normalized: CategorySpecFieldItem[] = (catToEdit.spec_fields || []).map(f => {
        if (typeof f === 'string') {
          return { name: f, has_price: f.toLowerCase().includes('yaddaş') || f.toLowerCase().includes('storage') };
        }
        return { name: f.name || '', has_price: Boolean(f.has_price) };
      }).filter(f => f.name && f.name.trim() !== '');
      setFormSpecFields(normalized);
      setNewSpecField('');
      setNewSpecHasPrice(false);
    } else {
      setEditingCategory(null);
      setFormName('');
      setFormSlug('');
      setSelectedParentId(parentId || '');
      setFormIcon(level === 1 ? 'Wind' : level === 2 ? 'Smartphone' : 'Tag');
      setFormIconUrl('');
      setIconMode('preset');
      setFormDesc('');
      setFormIsTop(true);
      setFormSortOrder((categories?.length || 0) + 1);
      setFormSpecFields([]);
      setNewSpecField('');
      setNewSpecHasPrice(false);
    }
    setIsDrawerOpen(true);
  };

  const handleNameChange = (val: string) => {
    setFormName(val);
    if (!editingCategory) {
      const slugVal = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormSlug(slugVal);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Zəhmət olmasa kateqoriya adını daxil edin!');
      return;
    }

    if (targetLevel > 1 && !selectedParentId) {
      setFormError(targetLevel === 2 ? 'Zəhmət olmasa aid olduğu Ana Kateqoriyanı seçin!' : 'Zəhmət olmasa aid olduğu Alt-Qrupu seçin!');
      return;
    }

    const payload: Partial<Category> = {
      name: formName.trim(),
      slug: formSlug.trim() || formName.toLowerCase().replace(/\s+/g, '-'),
      parent_id: targetLevel === 1 ? null : selectedParentId,
      level: targetLevel,
      icon: formIcon,
      icon_url: iconMode === 'custom' ? formIconUrl.trim() : undefined,
      description: formDesc.trim(),
      is_top: formIsTop,
      sort_order: Number(formSortOrder) || 1,
      spec_fields: formSpecFields.filter(f => f && f.name && f.name.trim() !== ''),
    };

    let updatedList: Category[] = [];

    if (editingCategory?.id) {
      updatedList = categories.map(c => c?.id === editingCategory.id ? { ...c, ...payload } as Category : c).filter(Boolean);
      if (isSupabaseConfigured()) {
        try {
          await supabase.from('categories').update(payload).eq('id', editingCategory.id);
        } catch (e) {}
      }
    } else {
      const newCat: Category = {
        id: 'c' + Date.now(),
        name: payload.name!,
        slug: payload.slug!,
        parent_id: payload.parent_id || null,
        level: payload.level || 1,
        icon: payload.icon || 'Folder',
        icon_url: payload.icon_url,
        description: payload.description,
        is_top: payload.is_top,
        sort_order: payload.sort_order,
        spec_fields: payload.spec_fields || [],
        product_count: 0,
        created_at: new Date().toISOString()
      };
      updatedList = [...categories, newCat].filter(Boolean);
      if (isSupabaseConfigured()) {
        try {
          await supabase.from('categories').insert([newCat]);
        } catch (e) {}
      }
    }

    setCategories(updatedList);
    saveLocalCategories(updatedList);
    setIsDrawerOpen(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!id) return;
    if (!confirm(`"${name || 'Kateqoriya'}" kateqoriyasını və bütün alt bəndlərini silmək istədiyinizdən əminsiniz?`)) return;

    const idsToDelete = [id];
    const findChildren = (parentId: string) => {
      categories.filter(c => c?.parent_id === parentId).forEach(child => {
        if (child?.id) {
          idsToDelete.push(child.id);
          findChildren(child.id);
        }
      });
    };
    findChildren(id);

    const updated = categories.filter(c => c && !idsToDelete.includes(c.id));
    setCategories(updated);
    saveLocalCategories(updated);
    idsToDelete.forEach(idToDelete => deleteApiCategory(idToDelete));

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('categories').delete().in('id', idsToDelete);
      } catch (e) {}
    }
  };

  const renderIcon = (cat?: Category | null) => {
    if (!cat) return <FolderTree className="w-4 h-4 text-slate-400" />;
    if (cat.icon_url) {
      return <img src={cat.icon_url} alt={cat.name || ''} className="w-4 h-4 object-contain" />;
    }
    const item = AVAILABLE_ICONS.find(i => i.name === cat.icon);
    const IconComp = item ? item.icon : FolderTree;
    return <IconComp className="w-4 h-4 text-slate-400 group-hover:text-white transition" />;
  };

  // Level 1 Categories
  const level1Categories = (categories || [])
    .filter(c => c && (!c.parent_id || c.level === 1))
    .sort((a, b) => (a?.sort_order || 99) - (b?.sort_order || 99));

  // Level 2 Categories
  const getLevel2ForParent = (level1Id: string) => {
    if (!level1Id) return [];
    return (categories || [])
      .filter(c => c && (c.parent_id === level1Id || (c.level === 2 && c.parent_id === level1Id)))
      .sort((a, b) => (a?.sort_order || 99) - (b?.sort_order || 99));
  };

  // Level 3 Categories
  const getLevel3ForParent = (level2Id: string) => {
    if (!level2Id) return [];
    return (categories || [])
      .filter(c => c && (c.parent_id === level2Id || (c.level === 3 && c.parent_id === level2Id)))
      .sort((a, b) => (a?.sort_order || 99) - (b?.sort_order || 99));
  };

  // Search Filter
  const filteredLevel1 = level1Categories.filter(l1 => {
    if (!l1) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const l1Name = (l1.name || '').toLowerCase();
    const l1Slug = (l1.slug || '').toLowerCase();
    const l1Match = l1Name.includes(q) || l1Slug.includes(q);
    const l2Match = getLevel2ForParent(l1.id).some(l2 => {
      const l2Name = (l2?.name || '').toLowerCase();
      const l2Slug = (l2?.slug || '').toLowerCase();
      return l2Name.includes(q) || l2Slug.includes(q) ||
        getLevel3ForParent(l2?.id || '').some(l3 => {
          const l3Name = (l3?.name || '').toLowerCase();
          const l3Slug = (l3?.slug || '').toLowerCase();
          return l3Name.includes(q) || l3Slug.includes(q);
        });
    });
    return l1Match || l2Match;
  });

  return (
    <div className="space-y-5 text-slate-700">

      {/* ═══ 1. HEADER ═══ */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl text-slate-900 flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-[#4f533b]" /> Kateqoriyalar
            </h1>
            <span className="text-xs bg-[#f4f5f0] text-[#4f533b] border border-[#4f533b]/20 px-2 py-0.5 rounded-md">
              {categories.length} bənd
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Sayt menyusu və məhsul iyerarxiyasının ağac nümayişi
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenDrawer(1)}
          className="bg-[#4f533b] hover:bg-[#3e4230] text-white text-sm px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer active:scale-95 flex-shrink-0"
        >
          <Plus className="w-4 h-4" /> Yeni Ana Kateqoriya
        </button>
      </div>

      {/* ═══ 2. SEARCH & FILTER BAR ═══ */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Kateqoriya axtar..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-700 outline-none focus:border-[#4f533b] transition placeholder:text-slate-400"
          />
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#4f533b]" /> Ana ({level1Categories.length})
          </span>
          <span className="text-slate-300">•</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Qrup ({categories.filter(c => c && (c.level === 2 || (c.parent_id && !categories.find(p => p?.id === c.parent_id)?.parent_id))).length})
          </span>
          <span className="text-slate-300">•</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400" /> Brend ({categories.filter(c => c?.level === 3).length})
          </span>
        </div>
      </div>

      {/* ═══ 3. CATEGORY TREE TABLE ═══ */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {/* TABLE COLUMN HEADERS */}
        <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-slate-50 border-b border-slate-200 text-xs text-slate-500 tracking-wider select-none">
          <div className="col-span-6 sm:col-span-5">Kateqoriya Adı & İyerarxiya</div>
          <div className="col-span-3">URL Slug</div>
          <div className="col-span-2">Səviyyə</div>
          <div className="col-span-1 sm:col-span-2 text-right">Əməliyyatlar</div>
        </div>

        {/* TREE ROWS */}
        <div className="divide-y divide-slate-100">
          {filteredLevel1.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-sm">
              Axtarışa uyğun kateqoriya tapılmadı
            </div>
          ) : (
            filteredLevel1.map(l1 => {
              if (!l1?.id) return null;
              const l2List = getLevel2ForParent(l1.id);
              const isL1Expanded = expandedNodes[l1.id] ?? true;

              return (
                <React.Fragment key={l1.id}>
                  
                  {/* LEVEL 1 ROW */}
                  <div className="grid grid-cols-12 gap-4 px-5 py-3.5 items-center hover:bg-slate-50 transition-colors group">
                    <div className="col-span-6 sm:col-span-5 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleExpand(l1.id)}
                        className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                      >
                        {isL1Expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                      </button>

                      <div className="w-7 h-7 rounded-lg bg-[#f4f5f0] text-[#4f533b] border border-[#4f533b]/20 flex items-center justify-center flex-shrink-0">
                        {renderIcon(l1)}
                      </div>

                      <span className="text-sm text-slate-900 group-hover:text-[#4f533b] transition">
                        {l1.name || 'İsimsiz Kateqoriya'}
                      </span>
                    </div>

                    <div className="col-span-3 sm:col-span-3">
                      <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                        /{l1.slug || ''}
                      </span>
                    </div>

                    <div className="col-span-3 sm:col-span-2">
                      <span className="text-xs bg-[#f4f5f0] text-[#4f533b] border border-[#4f533b]/20 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                        <Building2 className="w-3 h-3" /> Ana
                      </span>
                    </div>

                    {/* HOVER ACTIONS */}
                    <div className="col-span-1 sm:col-span-2 text-right">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenDrawer(2, l1.id)}
                          className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs hover:bg-emerald-100 transition flex items-center gap-1 cursor-pointer"
                          title="Alt-Qrup əlavə et"
                        >
                          <Plus className="w-3 h-3" /> Qrup
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDrawer(1, undefined, l1)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                          title="Redaktə et"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(l1.id, l1.name || '')}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                          title="Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* LEVEL 2 ROWS */}
                  {isL1Expanded && l2List.map(l2 => {
                    if (!l2?.id) return null;
                    const l3List = getLevel3ForParent(l2.id);
                    const isL2Expanded = expandedNodes[l2.id] ?? true;

                    return (
                      <React.Fragment key={l2.id}>
                        <div className="grid grid-cols-12 gap-4 px-5 py-3 items-center hover:bg-slate-50 transition-colors group border-l-2 border-[#4f533b]/20 pl-9">
                          <div className="col-span-6 sm:col-span-5 flex items-center gap-3">
                            <span className="text-slate-400 font-mono text-xs">└─</span>
                            {l3List.length > 0 ? (
                              <button type="button" onClick={() => toggleExpand(l2.id)} className="p-0.5 rounded hover:bg-slate-100 text-slate-400 transition cursor-pointer">
                                {isL2Expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                              </button>
                            ) : (<span className="w-3.5" />)}
                            <div className="w-6 h-6 rounded bg-slate-50 text-emerald-600 border border-slate-200 flex items-center justify-center flex-shrink-0">
                              {renderIcon(l2)}
                            </div>
                            <span className="text-sm text-slate-700 group-hover:text-emerald-600 transition">
                              {l2.name || 'İsimsiz Qrup'}
                            </span>
                          </div>
                          <div className="col-span-3 sm:col-span-3">
                            <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">/{l2.slug || ''}</span>
                          </div>
                          <div className="col-span-3 sm:col-span-2">
                            <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <FolderOpen className="w-3 h-3" /> Qrup
                            </span>
                          </div>
                          <div className="col-span-1 sm:col-span-2 text-right">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-end gap-1.5">
                              <button type="button" onClick={() => handleOpenDrawer(3, l2.id)} className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs hover:bg-blue-100 transition flex items-center gap-1 cursor-pointer" title="Brend əlavə et">
                                <Plus className="w-3 h-3" /> Brend
                              </button>
                              <button type="button" onClick={() => handleOpenDrawer(2, l1.id, l2)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer" title="Redaktə et">
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button type="button" onClick={() => handleDelete(l2.id, l2.name || '')} className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition cursor-pointer" title="Sil">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* LEVEL 3 ROWS */}
                        {isL2Expanded && l3List.map(l3 => {
                          if (!l3?.id) return null;
                          return (
                            <div key={l3.id} className="grid grid-cols-12 gap-4 px-5 py-2.5 items-center hover:bg-slate-50 transition-colors group border-l-2 border-blue-200/50 pl-16">
                              <div className="col-span-6 sm:col-span-5 flex items-center gap-3">
                                <span className="text-slate-300 font-mono text-xs">└─</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                                <span className="text-sm text-slate-600 group-hover:text-blue-600 transition">
                                  {l3.name || 'İsimsiz Brend'}
                                </span>
                              </div>
                              <div className="col-span-3 sm:col-span-3">
                                <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">/{l3.slug || ''}</span>
                              </div>
                              <div className="col-span-3 sm:col-span-2">
                                <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                  <Bookmark className="w-2.5 h-2.5" /> Brend
                                </span>
                              </div>
                              <div className="col-span-1 sm:col-span-2 text-right">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-end gap-1.5">
                                  <button type="button" onClick={() => handleOpenDrawer(3, l2.id, l3)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer" title="Redaktə et">
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button type="button" onClick={() => handleDelete(l3.id, l3.name || '')} className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition cursor-pointer" title="Sil">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </React.Fragment>
              );
            })
          )}
        </div>
      </div>

      {/* ═══ 4. SLIDE-OVER RIGHT DRAWER ═══ */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs" onClick={() => setIsDrawerOpen(false)}>
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div
              className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col justify-between"
              onClick={e => e.stopPropagation()}
            >
              {/* DRAWER HEADER */}
              <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-base text-slate-900">
                    {editingCategory ? 'Kateqoriyanı Redaktə Et' : `Yeni ${targetLevel === 1 ? 'Ana Kateqoriya' : targetLevel === 2 ? 'Alt-Qrup' : 'Brend'} Yarat`}
                  </h3>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {targetLevel === 1 ? '1-ci Səviyyə Menyu Başlığı' : targetLevel === 2 ? '2-ci Səviyyə Qrup' : '3-cü Səviyyə Spesifik Brend'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition border border-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* DRAWER FORM BODY */}
              <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto space-y-5">
                {formError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400" /> {formError}
                  </div>
                )}

                {/* LEVEL SELECTOR */}
                <div>
                  <label className="text-sm text-slate-600 block mb-2">
                    Səviyyə Tipi
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => { setTargetLevel(1); setSelectedParentId(''); }}
                      className={`p-2.5 rounded-xl border text-center transition cursor-pointer text-sm ${
                        targetLevel === 1 ? 'bg-[#f4f5f0] border-[#4f533b] text-[#4f533b]' : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}
                    >
                      1. Ana
                    </button>
                    <button
                      type="button"
                      onClick={() => setTargetLevel(2)}
                      className={`p-2.5 rounded-xl border text-center transition cursor-pointer text-sm ${
                        targetLevel === 2 ? 'bg-emerald-50 border-emerald-400 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}
                    >
                      2. Qrup
                    </button>
                    <button
                      type="button"
                      onClick={() => setTargetLevel(3)}
                      className={`p-2.5 rounded-xl border text-center transition cursor-pointer text-sm ${
                        targetLevel === 3 ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}
                    >
                      3. Brend
                    </button>
                  </div>
                </div>

                {/* PARENT SELECTION */}
                {targetLevel > 1 && (
                  <div>
                    <label className="text-sm text-slate-600 block mb-1.5">
                      {targetLevel === 2 ? 'Valideyn Ana Kateqoriya *' : 'Valideyn Alt-Qrup *'}
                    </label>
                    {targetLevel === 2 ? (
                      <select
                        value={selectedParentId}
                        onChange={e => setSelectedParentId(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 outline-none focus:border-[#4f533b] transition"
                      >
                        <option value="">-- Ana Kateqoriyanı Seçin --</option>
                        {level1Categories.map(l1 => (
                          <option key={l1?.id} value={l1?.id}>🏢 {l1?.name}</option>
                        ))}
                      </select>
                    ) : (
                      <select
                        value={selectedParentId}
                        onChange={e => setSelectedParentId(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 outline-none focus:border-[#4f533b] transition"
                      >
                        <option value="">-- Alt-Qrupu Seçin --</option>
                        {level1Categories.map(l1 => (
                          <optgroup key={l1?.id} label={`🏢 ${l1?.name}`}>
                            {getLevel2ForParent(l1?.id || '').map(l2 => (
                              <option key={l2?.id} value={l2?.id}>📁 {l2?.name}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    )}
                  </div>
                )}

                {/* NAME */}
                <div>
                  <label className="text-sm text-slate-600 block mb-1.5">Kateqoriya Adı *</label>
                  <input
                    type="text" required
                    placeholder="Məs: Smartfonlar"
                    value={formName}
                    onChange={e => handleNameChange(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 outline-none focus:border-[#4f533b] transition placeholder:text-slate-300"
                  />
                </div>

                {/* SLUG */}
                <div>
                  <label className="text-sm text-slate-600 block mb-1.5">URL Slug *</label>
                  <input
                    type="text" required
                    placeholder="smartfonlar"
                    value={formSlug}
                    onChange={e => setFormSlug(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-700 outline-none focus:border-[#4f533b] transition"
                  />
                </div>

                {/* ICON PICKER */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-slate-700 font-medium">İkon Kitabxanası ({AVAILABLE_ICONS.length} ikon)</label>
                    <span className="text-xs text-slate-400 font-mono">Lucide Icons</span>
                  </div>

                  {/* Icon Search Bar */}
                  <div className="relative mb-2.5">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="İkon axtar (məs: skuter, tv, fen, saat, kamera...)"
                      value={iconSearchQuery}
                      onChange={e => setIconSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-700 outline-none focus:border-[#4f533b] transition placeholder:text-slate-400"
                    />
                    {iconSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setIconSearchQuery('')}
                        className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Icon Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-52 overflow-y-auto p-1 bg-slate-50 border border-slate-200 rounded-xl">
                    {(() => {
                      const filtered = AVAILABLE_ICONS.filter(item => {
                        if (!iconSearchQuery.trim()) return true;
                        const q = iconSearchQuery.toLowerCase();
                        return (
                          item.name.toLowerCase().includes(q) ||
                          item.label.toLowerCase().includes(q) ||
                          (item.category && item.category.toLowerCase().includes(q))
                        );
                      });

                      if (filtered.length === 0) {
                        return (
                          <div className="col-span-full py-6 text-center text-xs text-slate-400">
                            Axtarışa uyğun ikon tapılmadı
                          </div>
                        );
                      }

                      return filtered.map(item => {
                        const IconComp = item.icon;
                        const isSelected = formIcon === item.name && !formIconUrl;
                        return (
                          <button
                            key={item.name}
                            type="button"
                            onClick={() => { setFormIcon(item.name); setFormIconUrl(''); }}
                            className={`p-2 rounded-lg border text-xs transition flex items-center gap-2 cursor-pointer text-left ${
                              isSelected
                                ? 'bg-[#f4f5f0] border-[#4f533b] text-[#4f533b] font-bold shadow-xs'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100/60'
                            }`}
                          >
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${
                              isSelected ? 'bg-[#4f533b] text-white' : 'bg-slate-100 text-slate-500'
                            }`}>
                              <IconComp className="w-3.5 h-3.5" />
                            </div>
                            <span className="truncate text-xs leading-tight">{item.label}</span>
                          </button>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* SPEC FIELDS MANAGER — only for level 1 & 2 */}
                {targetLevel <= 2 && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm font-bold text-slate-700 tracking-wide">Spesifikasiya Şablonları</label>
                      <span className="text-[11px] text-[#4f533b] font-mono font-bold bg-[#4f533b]/10 px-2 py-0.5 rounded-md">
                        {formSpecFields.length} parametr
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-3">Bu kateqoriyaya aid məhsullarda görünəcək parametrlər və qiymətli variantlar</p>

                    {/* Existing spec fields */}
                    <div className="space-y-2 mb-3">
                      {formSpecFields.map((field, i) => (
                        <div key={i} className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-xl p-2.5 shadow-2xs hover:border-slate-300 transition">
                          <span className="flex-1 text-sm font-bold text-slate-800">{field.name}</span>
                          
                          {/* Checkbox: Xüsusi Qiymət (Qiymətli Variant) */}
                          <label className="flex items-center gap-1.5 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold select-none hover:bg-slate-50 transition">
                            <input
                              type="checkbox"
                              checked={Boolean(field.has_price)}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setFormSpecFields(prev => prev.map((item, idx) => idx === i ? { ...item, has_price: checked } : item));
                              }}
                              className="rounded text-[#4f533b] focus:ring-[#4f533b] w-3.5 h-3.5 cursor-pointer accent-[#4f533b]"
                            />
                            <span className={field.has_price ? 'text-[#4f533b] font-black' : 'text-slate-500'}>
                              {field.has_price ? '💰 Xüsusi Qiymət (Variant)' : 'Xüsusi Qiymət'}
                            </span>
                          </label>

                          <button
                            type="button"
                            onClick={() => setFormSpecFields(prev => prev.filter((_, idx) => idx !== i))}
                            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                            title="Xüsusiyyəti Sil"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      {formSpecFields.length === 0 && (
                        <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                          Hələ xüsusiyyət əlavə edilməyib. Aşağıdan xüsusiyyət adı yazıb əlavə edin.
                        </div>
                      )}
                    </div>

                    {/* Add new spec field */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newSpecField}
                          onChange={e => setNewSpecField(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const val = newSpecField.trim();
                              if (val && !formSpecFields.some(f => f.name.toLowerCase() === val.toLowerCase())) {
                                setFormSpecFields(prev => [...prev, { name: val, has_price: newSpecHasPrice }]);
                                setNewSpecField('');
                                setNewSpecHasPrice(false);
                              }
                            }
                          }}
                          placeholder="Məs: RAM, Yaddaş, Ekran ölçüsü, Rəng..."
                          className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-700 outline-none focus:border-[#4f533b] transition placeholder:text-slate-400"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const val = newSpecField.trim();
                            if (val && !formSpecFields.some(f => f.name.toLowerCase() === val.toLowerCase())) {
                              setFormSpecFields(prev => [...prev, { name: val, has_price: newSpecHasPrice }]);
                              setNewSpecField('');
                              setNewSpecHasPrice(false);
                            }
                          }}
                          className="px-3.5 py-2 rounded-xl bg-[#4f533b] hover:bg-[#3e4230] text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Əlavə Et</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2 pt-0.5">
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 font-medium select-none">
                          <input
                            type="checkbox"
                            checked={newSpecHasPrice}
                            onChange={e => setNewSpecHasPrice(e.target.checked)}
                            className="rounded text-[#4f533b] focus:ring-[#4f533b] w-4 h-4 cursor-pointer accent-[#4f533b]"
                          />
                          <span>Bu xüsusiyyət üçün <strong>xüsusi qiymət (variantlar)</strong> təyin edilsin (məs: Yaddaş)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* DRAWER FOOTER */}
                <div className="pt-5 flex items-center justify-end gap-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm transition border border-slate-200 cursor-pointer"
                  >
                    Ləğv et
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#4f533b] hover:bg-[#3e4230] text-white text-sm transition active:scale-95 cursor-pointer"
                  >
                    Yadda Saxla
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
